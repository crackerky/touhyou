import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { VoteIcon, Shield, Settings } from 'lucide-react';
import WalletConnection from './components/WalletConnection';
import VotingSection from './components/VotingSection';
import VoteResults from './components/VoteResults';
import NFTInfoCard from './components/NFTInfoCard';
import DebugPanel from './components/DebugPanel';
import { useVoteStore } from './store/voteStore';
import { analytics } from './utils/analytics';

function App() {
  const { isVerified, hasVoted, error, nftVerificationStatus, nftData } = useVoteStore();

  // 環境変数から設定を取得
  const targetPolicyId = import.meta.env.VITE_TARGET_POLICY_ID || 'demo_policy_id_12345';
  const appTitle = import.meta.env.VITE_APP_TITLE || 'NFT保有者限定投票';
  const appDescription = import.meta.env.VITE_APP_DESCRIPTION || 'Cardano NFTホルダー向け投票システム';

  // アナリティクス: ページロード
  useEffect(() => {
    analytics.track('page_load', {
      targetPolicyId,
      demoMode: import.meta.env.VITE_ENABLE_DEMO === 'true'
    });
  }, [targetPolicyId]);

  // エラーがあればトーストを表示
  useEffect(() => {
    if (error) {
      toast.error(error);
      analytics.track('error_displayed', { error });
    }
  }, [error]);

  // NFT検証状況の変化を追跡
  useEffect(() => {
    if (nftVerificationStatus === 'verified' && nftData) {
      analytics.trackNFTVerificationComplete({
        walletAddress: '', // プライバシー保護のため空文字
        success: true,
        nftCount: nftData.nftCount,
        verificationMethod: nftData.verificationMethod,
        duration: 0 // 実際の実装では開始時間からの差分を計算
      });
    } else if (nftVerificationStatus === 'failed') {
      analytics.trackNFTVerificationError({
        walletAddress: '',
        error: error || 'Unknown error',
        method: 'unknown',
        duration: 0
      });
    }
  }, [nftVerificationStatus, nftData, error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-yellow-50 to-red-50 flex flex-col">
      <Toaster position="top-center" />
      
      <header className="py-6 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center gap-3"
        >
          <div className="text-3xl">🎯</div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{appTitle}</h1>
            <p className="text-sm text-slate-600 mt-1 flex items-center justify-center gap-2">
              <Shield className="h-4 w-4" />
              {appDescription}
            </p>
            
            {/* NFT保有状況の簡易表示 */}
            {isVerified && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-2"
              >
                {nftVerificationStatus === 'verified' && nftData ? (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    NFT保有確認済み ({nftData.nftCount}個)
                  </div>
                ) : nftVerificationStatus === 'failed' ? (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    NFT保有未確認
                  </div>
                ) : nftVerificationStatus === 'pending' ? (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    NFT確認中...
                  </div>
                ) : null}
              </motion.div>
            )}
          </div>
          <div className="text-3xl">🍎</div>
        </motion.div>
      </header>
      
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 左側: 投票セクション */}
          <div className="lg:col-span-2">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex justify-center">
                <AnimatePresence mode="wait">
                  {!isVerified ? (
                    <WalletConnection key="connection" />
                  ) : (
                    <VotingSection key="voting" />
                  )}
                </AnimatePresence>
              </div>
              
              <div className="flex justify-center">
                <VoteResults />
              </div>
            </div>
          </div>
          
          {/* 右側: NFT情報とサイドバー */}
          <div className="lg:col-span-1 space-y-6">
            {/* NFT情報カード */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <NFTInfoCard 
                policyId={targetPolicyId}
                apiEndpoint={nftData?.verificationMethod || 'Blockfrost/Koios API'}
              />
            </motion.div>
            
            {/* 投票統計 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white border border-gray-200 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <VoteIcon className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">投票統計</h3>
              </div>
              
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>NFT検証方法:</span>
                  <span className="font-medium">
                    {nftData?.verificationMethod === 'blockfrost' && 'Blockfrost API'}
                    {nftData?.verificationMethod === 'koios' && 'Koios API'}
                    {nftData?.verificationMethod === 'nmkr' && 'NMKR API'}
                    {!nftData?.verificationMethod && '未確認'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>投票方式:</span>
                  <span className="font-medium">NFT保有者限定</span>
                </div>
                
                <div className="flex justify-between">
                  <span>重複投票:</span>
                  <span className="font-medium text-green-600">防止済み</span>
                </div>
                
                <div className="pt-2 border-t">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Settings className="h-3 w-3" />
                    <span>ブロックチェーン認証による安全な投票</span>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* デモ情報 (開発環境のみ) */}
            {(import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO === 'true') && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-yellow-50 border border-yellow-200 rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-yellow-600">⚠️</div>
                  <h3 className="text-sm font-semibold text-yellow-900">開発モード</h3>
                </div>
                
                <div className="text-xs text-yellow-700 space-y-1">
                  <p>• デモウォレットでNFT保有をシミュレート</p>
                  <p>• アドレスに "demo" または "test" が含まれる場合、NFT保有とみなされます</p>
                  <p>• 本番環境では実際のNFT保有確認が行われます</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
      
      <footer className="py-6 px-4 text-center text-slate-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span>🎯</span>
          <p>NFT保有者限定投票システム &copy; {new Date().getFullYear()}</p>
          <span>🛡️</span>
        </div>
        <div className="flex items-center justify-center gap-4 text-xs">
          <span>Powered by Cardano</span>
          <span>•</span>
          <span>Blockfrost API</span>
          <span>•</span>
          <span>NMKR対応</span>
        </div>
      </footer>
      
      {/* デバッグパネル (開発環境のみ) */}
      <DebugPanel />
    </div>
  );
}

export default App;
