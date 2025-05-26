import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3Icon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { useVoteStore } from '../store/voteStore';

export default function VoteResults() {
  const { votes, getVoteCounts, isLoading } = useVoteStore();
  
  useEffect(() => {
    getVoteCounts();
  }, [getVoteCounts]);
  
  const totalVotes = Object.values(votes).reduce((acc, count) => acc + count, 0);
  
  // 果物オプションのマッピング
  const fruitOptions: Record<string, { name: string; emoji: string; color: string }> = {
    'banana': { name: 'バナナ', emoji: '🍌', color: 'bg-yellow-500' },
    'apple': { name: 'リンゴ', emoji: '🍎', color: 'bg-red-500' },
    'orange': { name: 'オレンジ', emoji: '🍊', color: 'bg-orange-500' },
    // 後方互換性のため古いキーも保持
    'option1': { name: 'バナナ', emoji: '🍌', color: 'bg-yellow-500' },
    'option2': { name: 'リンゴ', emoji: '🍎', color: 'bg-red-500' },
    'option3': { name: 'オレンジ', emoji: '🍊', color: 'bg-orange-500' }
  };

  // 果物の順序を指定
  const orderedFruits = ['banana', 'apple', 'orange'];
  
  // データを正規化（古いキーを新しいキーにマッピング）
  const normalizedVotes: Record<string, number> = {
    banana: (votes.banana || 0) + (votes.option1 || 0),
    apple: (votes.apple || 0) + (votes.option2 || 0),
    orange: (votes.orange || 0) + (votes.option3 || 0)
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full max-w-md"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center mb-2">
            <BarChart3Icon size={24} className="text-blue-600 mr-2" />
            <CardTitle>🍎 投票結果</CardTitle>
          </div>
          <CardDescription>
            みんなの好きな果物ランキング - リアルタイム結果
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-lg font-bold text-blue-600">
                  総投票数: {totalVotes} 票
                </p>
                {totalVotes === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    まだ投票がありません
                  </p>
                )}
              </div>
              
              {orderedFruits.map((fruitKey, index) => {
                const count = normalizedVotes[fruitKey] || 0;
                const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                const fruit = fruitOptions[fruitKey];
                
                // 順位を計算
                const sortedFruits = orderedFruits
                  .map(key => ({ key, count: normalizedVotes[key] || 0 }))
                  .sort((a, b) => b.count - a.count);
                const rank = sortedFruits.findIndex(item => item.key === fruitKey) + 1;
                
                return (
                  <motion.div 
                    key={fruitKey} 
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{fruit.emoji}</span>
                        <span className="font-medium">{fruit.name}</span>
                        {totalVotes > 0 && count > 0 && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                            #{rank}
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-gray-700">
                        {count} 票 ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <motion.div 
                        className={`${fruit.color} h-3 rounded-full relative`}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.1 }}
                      >
                        {percentage > 15 && (
                          <span className="absolute right-2 top-0 leading-3 text-white text-xs font-bold">
                            {percentage}%
                          </span>
                        )}
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}

              {totalVotes > 0 && (
                <motion.div 
                  className="mt-6 p-3 bg-blue-50 rounded-lg text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="text-2xl mb-2">
                    {normalizedVotes.banana > normalizedVotes.apple && normalizedVotes.banana > normalizedVotes.orange ? '🍌' :
                     normalizedVotes.apple > normalizedVotes.orange ? '🍎' : '🍊'}
                  </div>
                  <p className="text-sm font-medium text-blue-800">
                    現在の人気No.1果物
                  </p>
                </motion.div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}