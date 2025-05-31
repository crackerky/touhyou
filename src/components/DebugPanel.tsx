import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, Download, Trash2, BarChart3, X } from 'lucide-react';
import { analytics } from '../utils/analytics';
import { useVoteStore } from '../store/voteStore';

const DebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'state' | 'analytics' | 'env'>('state');
  const voteStore = useVoteStore();

  // 開発環境でのみ表示
  if (!import.meta.env.DEV) {
    return null;
  }

  const stats = analytics.getStats();

  const handleExportAnalytics = () => {
    const data = analytics.exportEvents();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voting-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearAnalytics = () => {
    if (confirm('分析データを削除しますか？')) {
      analytics.clearEvents();
    }
  };

  const renderStateTab = () => (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold text-gray-700 mb-2">投票ストア状態</h4>
        <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
          {JSON.stringify({
            wallet: voteStore.wallet,
            isVerified: voteStore.isVerified,
            hasVoted: voteStore.hasVoted,
            isLoading: voteStore.isLoading,
            nftVerificationStatus: voteStore.nftVerificationStatus,
            isNFTHolder: voteStore.isNFTHolder,
            nftData: voteStore.nftData
          }, null, 2)}
        </pre>
      </div>
      
      <div>
        <h4 className="font-semibold text-gray-700 mb-2">投票結果</h4>
        <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-32">
          {JSON.stringify(voteStore.votes, null, 2)}
        </pre>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-3 rounded">
          <div className="text-sm text-blue-600">総イベント数</div>
          <div className="text-lg font-bold text-blue-900">{stats.totalEvents}</div>
        </div>
        <div className="bg-green-50 p-3 rounded">
          <div className="text-sm text-green-600">NFT検証回数</div>
          <div className="text-lg font-bold text-green-900">{stats.nftVerifications}</div>
        </div>
        <div className="bg-purple-50 p-3 rounded">
          <div className="text-sm text-purple-600">成功投票数</div>
          <div className="text-lg font-bold text-purple-900">{stats.successfulVotes}</div>
        </div>
        <div className="bg-red-50 p-3 rounded">
          <div className="text-sm text-red-600">エラー率</div>
          <div className="text-lg font-bold text-red-900">{stats.errorRate}%</div>
        </div>
      </div>
      
      <div>
        <h4 className="font-semibold text-gray-700 mb-2">API使用状況</h4>
        <div className="space-y-2">
          {Object.entries(stats.apiUsage).map(([api, count]) => (
            <div key={api} className="flex justify-between bg-gray-100 p-2 rounded">
              <span className="capitalize">{api}</span>
              <span className="font-bold">{count}回</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={handleExportAnalytics}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          <Download className="h-4 w-4" />
          エクスポート
        </button>
        <button
          onClick={handleClearAnalytics}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
        >
          <Trash2 className="h-4 w-4" />
          クリア
        </button>
      </div>
    </div>
  );

  const renderEnvTab = () => (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold text-gray-700 mb-2">環境変数</h4>
        <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
          {JSON.stringify({
            NODE_ENV: import.meta.env.MODE,
            DEV: import.meta.env.DEV,
            VITE_TARGET_POLICY_ID: import.meta.env.VITE_TARGET_POLICY_ID || '未設定',
            VITE_ENABLE_DEMO: import.meta.env.VITE_ENABLE_DEMO || '未設定',
            VITE_APP_TITLE: import.meta.env.VITE_APP_TITLE || '未設定',
            BLOCKFROST_API_KEY: import.meta.env.VITE_BLOCKFROST_API_KEY ? '設定済み' : '未設定',
            NMKR_API_KEY: import.meta.env.VITE_NMKR_API_KEY ? '設定済み' : '未設定',
            SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? '設定済み' : '未設定',
            SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? '設定済み' : '未設定'
          }, null, 2)}
        </pre>
      </div>
    </div>
  );

  return (
    <>
      {/* Debug Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 z-50"
        title="デバッグパネル"
      >
        <Bug className="h-5 w-5" />
      </motion.button>

      {/* Debug Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Bug className="h-5 w-5" />
                  デバッグパネル
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex border-b">
                {[
                  { id: 'state', label: 'ストア状態', icon: BarChart3 },
                  { id: 'analytics', label: '分析', icon: BarChart3 },
                  { id: 'env', label: '環境', icon: Bug }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium ${
                      activeTab === tab.id
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
              
              <div className="p-4 overflow-auto max-h-96">
                {activeTab === 'state' && renderStateTab()}
                {activeTab === 'analytics' && renderAnalyticsTab()}
                {activeTab === 'env' && renderEnvTab()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DebugPanel;