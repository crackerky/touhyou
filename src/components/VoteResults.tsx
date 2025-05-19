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
  
  // オプションIDから読みやすい名前へのマッピング
  const optionNames: Record<string, string> = {
    'option1': '選択肢 1',
    'option2': '選択肢 2',
    'option3': '選択肢 3'
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
            <CardTitle>現在の結果</CardTitle>
          </div>
          <CardDescription>
            全参加者からのリアルタイム投票結果
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm font-medium">
                総投票数: {totalVotes}
              </p>
              
              {Object.entries(votes).map(([option, count]) => {
                const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                
                return (
                  <div key={option} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{optionNames[option]}</span>
                      <span className="font-medium">{count} 票 ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <motion.div 
                        className="bg-blue-600 h-2.5 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}