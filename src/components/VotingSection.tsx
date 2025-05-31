import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Vote, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useVoteStore } from '../store/voteStore';
import NFTVerificationStatus from './NFTVerificationStatus';

const VotingSection: React.FC = () => {
  const { 
    hasVoted, 
    isLoading, 
    error, 
    castVote,
    isNFTHolder,
    nftVerificationStatus 
  } = useVoteStore();
  const [selectedOption, setSelectedOption] = useState<string>('');

  // 投票オプション
  const votingOptions = [
    { id: 'apple', label: '🍎 りんご', description: '甘くてシャキシャキ！' },
    { id: 'banana', label: '🍌 バナナ', description: '栄養満点で手軽！' },
    { id: 'orange', label: '🍊 オレンジ', description: 'ビタミンCたっぷり！' }
  ];

  const handleVote = async () => {
    if (!selectedOption) {
      toast.error('投票する果物を選択してください');
      return;
    }

    if (!isNFTHolder) {
      toast.error('NFT保有者のみ投票できます');
      return;
    }

    try {
      const success = await castVote(selectedOption);
      if (success) {
        toast.success('投票が完了しました！');
        setSelectedOption('');
      }
    } catch (err) {
      console.error('Vote error:', err);
      toast.error('投票に失敗しました');
    }
  };

  // NFT検証が完了していない場合はステータス表示
  if (nftVerificationStatus !== 'verified') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-md mx-auto"
      >
        <NFTVerificationStatus />
      </motion.div>
    );
  }

  // 既に投票済みの場合
  if (hasVoted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-md mx-auto"
      >
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          </motion.div>
          
          <h3 className="text-xl font-bold text-green-900 mb-2">
            投票完了！
          </h3>
          <p className="text-green-700 mb-4">
            ご参加ありがとうございました
          </p>
          
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <p className="text-sm text-gray-600">
              🎉 NFT保有者として投票に参加していただき、ありがとうございます！
              <br />結果は右側のグラフでご確認いただけます。
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // NFT保有者のみ投票可能
  if (!isNFTHolder) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-md mx-auto"
      >
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-8 text-center">
          <AlertCircle className="h-16 w-16 text-orange-600 mx-auto mb-4" />
          
          <h3 className="text-xl font-bold text-orange-900 mb-2">
            投票権限なし
          </h3>
          <p className="text-orange-700 mb-4">
            この投票はNFT保有者限定です
          </p>
          
          <div className="bg-white rounded-lg p-4 border border-orange-200">
            <p className="text-sm text-gray-600">
              投票に参加するには対象NFTを保有している必要があります。
              <br />NFT保有状況は自動的に確認されます。
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // 投票フォーム
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
        <div className="text-center mb-6">
          <Vote className="h-12 w-12 text-blue-600 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            投票してください
          </h2>
          <p className="text-slate-600">
            🎉 NFT保有者として投票権限が確認されました！
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-red-700 text-sm">{error}</p>
          </motion.div>
        )}

        <div className="space-y-3 mb-6">
          {votingOptions.map((option) => (
            <motion.label
              key={option.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`block p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                selectedOption === option.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="fruit"
                value={option.id}
                checked={selectedOption === option.id}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="sr-only"
              />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-medium text-slate-900">
                    {option.label}
                  </div>
                  <div className="text-sm text-slate-600">
                    {option.description}
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 ${
                  selectedOption === option.id
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`} />
              </div>
            </motion.label>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleVote}
          disabled={!selectedOption || isLoading}
          className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
            selectedOption && !isLoading
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-2"
              >
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                投票中...
              </motion.div>
            ) : (
              <motion.span
                key="vote"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                投票する
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
        
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs text-green-700 text-center">
            ✅ NFT保有確認済み - 投票権限あり
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default VotingSection;