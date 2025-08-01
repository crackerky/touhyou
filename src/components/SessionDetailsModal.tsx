import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Users, CheckCircle, XCircle, Download, Send, Gift, BarChart3, Info } from 'lucide-react';
import { useVotingSessionStore } from '../store/votingSessionStore';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { NFTDistribution } from './NFTDistribution';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface SessionDetailsModalProps {
  sessionId: string;
  onClose: () => void;
}

interface VoteStatistics {
  option: string;
  count: number;
  verified_count: number;
  percentage: number;
}

export function SessionDetailsModal({ sessionId, onClose }: SessionDetailsModalProps) {
  const { fetchSessionById, currentSession, isLoading } = useVotingSessionStore();
  const { user } = useAuthStore();
  const [statistics, setStatistics] = useState<VoteStatistics[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'results' | 'distribution'>('info');

  useEffect(() => {
    fetchSessionById(sessionId);
    fetchStatistics();
  }, [sessionId]);

  const fetchStatistics = async () => {
    try {
      const { data, error } = await supabase
        .from('vote_statistics')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (error) throw error;

      if (data?.results) {
        const totalVotes = data.total_voters || 0;
        const stats = data.results.map((result: any) => ({
          ...result,
          percentage: totalVotes > 0 ? (result.count / totalVotes) * 100 : 0
        }));
        setStatistics(stats);
      }
    } catch (error) {
      console.error('Fetch statistics error:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const exportResults = () => {
    if (!currentSession || statistics.length === 0) return;

    const csv = [
      ['投票セッション', currentSession.title],
      ['作成日', format(new Date(currentSession.created_at), 'yyyy年MM月dd日', { locale: ja })],
      [''],
      ['選択肢', '投票数', 'NFT確認済み', '割合(%)'],
      ...statistics.map(stat => [
        stat.option,
        stat.count,
        stat.verified_count,
        stat.percentage.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `voting_results_${sessionId}.csv`;
    link.click();
  };

  if (isLoading || loadingStats) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!currentSession) return null;

  const totalVotes = statistics.reduce((sum, stat) => sum + stat.count, 0);
  const verifiedVotes = statistics.reduce((sum, stat) => sum + stat.verified_count, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{currentSession.title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b px-6">
          <nav className="flex gap-6">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'info'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Info className="h-4 w-4 inline mr-2" />
              基本情報
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'results'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="h-4 w-4 inline mr-2" />
              投票結果
            </button>
            {currentSession.created_by === user?.id && (
              <button
                onClick={() => setActiveTab('distribution')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'distribution'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Gift className="h-4 w-4 inline mr-2" />
                NFT配布
              </button>
            )}
          </nav>
        </div>

        <div className="p-6 space-y-6">
          {activeTab === 'info' && (
            <>
              {/* Session Info */}
              <div>
                <h3 className="text-lg font-medium mb-3">投票情報</h3>
                <Card className="p-4 space-y-2">
                  {currentSession.description && (
                    <p className="text-gray-700">{currentSession.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>
                      作成日: {format(new Date(currentSession.created_at), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                    </span>
                    {currentSession.end_date && (
                      <span>
                        終了日: {format(new Date(currentSession.end_date), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                      </span>
                    )}
                  </div>
                  {currentSession.nft_policy_id && (
                    <div className="text-sm text-gray-600">
                      NFT Policy ID: {currentSession.nft_policy_id}
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-2">
                    {currentSession.is_active ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        アクティブ
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-500">
                        <XCircle className="h-4 w-4" />
                        終了
                      </span>
                    )}
                  </div>
                </Card>
              </div>

              {/* Share Link */}
              <div>
                <h3 className="text-lg font-medium mb-3">投票リンク</h3>
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={`${window.location.origin}/vote/${sessionId}`}
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/vote/${sessionId}`);
                      }}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      コピー
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    このリンクを共有して投票に参加してもらいましょう
                  </p>
                </Card>
              </div>
            </>
          )}

          {activeTab === 'results' && (
            <>
              {/* Vote Statistics */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium">投票結果</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportResults}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    CSVエクスポート
                  </Button>
                </div>

                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-sm text-gray-600">総投票数</p>
                        <p className="text-2xl font-bold text-gray-900">{totalVotes}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">NFT確認済み</p>
                        <p className="text-2xl font-bold text-green-600">{verifiedVotes}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {statistics.map((stat, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{stat.option}</span>
                          <span className="text-sm text-gray-600">
                            {stat.count} 票 ({stat.percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stat.percentage}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="absolute inset-y-0 left-0 bg-blue-600 rounded-full"
                          />
                          {stat.verified_count > 0 && (
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(stat.verified_count / totalVotes) * 100}%` }}
                              transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                              className="absolute inset-y-0 left-0 bg-green-600 rounded-full"
                            />
                          )}
                        </div>
                        {stat.verified_count > 0 && (
                          <p className="text-xs text-gray-500">
                            うちNFT確認済み: {stat.verified_count} 票
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </>
          )}

          {activeTab === 'distribution' && currentSession.created_by === user?.id && (
            <NFTDistribution 
              sessionId={sessionId} 
              sessionTitle={currentSession.title}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}