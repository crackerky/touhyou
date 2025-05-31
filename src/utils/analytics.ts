// NFT投票システムの分析ユーティリティ

interface AnalyticsEvent {
  event: string;
  timestamp: string;
  data: Record<string, any>;
}

class VotingAnalytics {
  private events: AnalyticsEvent[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.loadStoredEvents();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadStoredEvents(): void {
    try {
      const stored = localStorage.getItem('voting_analytics');
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load analytics events:', error);
    }
  }

  private saveEvents(): void {
    try {
      // 最新100イベントのみ保持
      const recentEvents = this.events.slice(-100);
      localStorage.setItem('voting_analytics', JSON.stringify(recentEvents));
    } catch (error) {
      console.warn('Failed to save analytics events:', error);
    }
  }

  // NFT検証開始
  trackNFTVerificationStart(data: {
    walletAddress: string;
    method: string;
  }): void {
    this.track('nft_verification_start', {
      ...data,
      sessionId: this.sessionId
    });
  }

  // NFT検証完了
  trackNFTVerificationComplete(data: {
    walletAddress: string;
    success: boolean;
    nftCount?: number;
    verificationMethod?: string;
    duration: number;
  }): void {
    this.track('nft_verification_complete', {
      ...data,
      sessionId: this.sessionId
    });
  }

  // NFT検証エラー
  trackNFTVerificationError(data: {
    walletAddress: string;
    error: string;
    method: string;
    duration: number;
  }): void {
    this.track('nft_verification_error', {
      ...data,
      sessionId: this.sessionId
    });
  }

  // 投票開始
  trackVoteStart(data: {
    walletAddress: string;
    hasNFT: boolean;
  }): void {
    this.track('vote_start', {
      ...data,
      sessionId: this.sessionId
    });
  }

  // 投票完了
  trackVoteComplete(data: {
    walletAddress: string;
    option: string;
    nftVerified: boolean;
  }): void {
    this.track('vote_complete', {
      ...data,
      sessionId: this.sessionId
    });
  }

  // 投票エラー
  trackVoteError(data: {
    walletAddress: string;
    error: string;
    option?: string;
  }): void {
    this.track('vote_error', {
      ...data,
      sessionId: this.sessionId
    });
  }

  // ウォレット接続
  trackWalletConnection(data: {
    method: 'manual' | 'extension';
    walletType?: string;
    success: boolean;
  }): void {
    this.track('wallet_connection', {
      ...data,
      sessionId: this.sessionId
    });
  }

  // API使用状況
  trackAPIUsage(data: {
    api: 'blockfrost' | 'koios' | 'nmkr';
    endpoint: string;
    success: boolean;
    responseTime: number;
    statusCode?: number;
  }): void {
    this.track('api_usage', {
      ...data,
      sessionId: this.sessionId
    });
  }

  // 汎用トラッキング
  private track(event: string, data: Record<string, any>): void {
    const analyticsEvent: AnalyticsEvent = {
      event,
      timestamp: new Date().toISOString(),
      data: {
        ...data,
        userAgent: navigator.userAgent,
        url: window.location.href,
        referrer: document.referrer
      }
    };

    this.events.push(analyticsEvent);
    this.saveEvents();

    // 開発環境ではコンソールに出力
    if (import.meta.env.DEV) {
      console.log('📊 Analytics:', analyticsEvent);
    }
  }

  // 統計取得
  getStats(): {
    totalEvents: number;
    nftVerifications: number;
    successfulVotes: number;
    errorRate: number;
    apiUsage: Record<string, number>;
  } {
    const total = this.events.length;
    const nftVerifications = this.events.filter(e => e.event === 'nft_verification_start').length;
    const successfulVotes = this.events.filter(e => e.event === 'vote_complete').length;
    const errors = this.events.filter(e => e.event.includes('error')).length;
    const errorRate = total > 0 ? (errors / total) * 100 : 0;

    // API使用統計
    const apiUsage: Record<string, number> = {};
    this.events
      .filter(e => e.event === 'api_usage')
      .forEach(e => {
        const api = e.data.api;
        apiUsage[api] = (apiUsage[api] || 0) + 1;
      });

    return {
      totalEvents: total,
      nftVerifications,
      successfulVotes,
      errorRate: Math.round(errorRate * 100) / 100,
      apiUsage
    };
  }

  // イベントエクスポート
  exportEvents(): string {
    return JSON.stringify(this.events, null, 2);
  }

  // イベントクリア
  clearEvents(): void {
    this.events = [];
    localStorage.removeItem('voting_analytics');
  }
}

// シングルトンインスタンス
export const analytics = new VotingAnalytics();

// フック形式でも使用可能
export const useAnalytics = () => {
  return analytics;
};