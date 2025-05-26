import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { VoteIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/Card';
import { Button } from './ui/Button';
import { useVoteStore } from '../store/voteStore';
import { truncateAddress } from '../lib/utils';

export default function VotingSection() {
  const { wallet, hasVoted, isLoading, castVote, error } = useVoteStore();

  // Add debug logging
  useEffect(() => {
    console.log('VotingSection rendered', {
      wallet,
      hasVoted,
      isLoading,
      error
    });
  }, [wallet, hasVoted, isLoading, error]);

  const options = [
    { 
      id: 'banana', 
      name: '🍌 バナナ', 
      description: '甘くて栄養満点の黄色い果物',
      emoji: '🍌'
    },
    { 
      id: 'apple', 
      name: '🍎 リンゴ', 
      description: '赤くて美味しい定番の果物',
      emoji: '🍎'
    },
    { 
      id: 'orange', 
      name: '🍊 オレンジ', 
      description: 'ビタミンCが豊富な柑橘類',
      emoji: '🍊'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Check for wallet before rendering voting UI
  if (!wallet) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-center">
              <AlertCircle className="h-12 w-12 text-amber-500 mb-2" />
            </div>
            <CardTitle className="text-center">ウォレット未接続</CardTitle>
            <CardDescription className="text-center">
              投票するにはウォレットを接続してください。
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.div>
    );
  }

  if (hasVoted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
            </div>
            <CardTitle className="text-center">🎉 投票ありがとうございます！</CardTitle>
            <CardDescription className="text-center">
              あなたの好きな果物への投票が正常に記録されました。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="font-medium">
                ウォレット: <span className="font-normal">{truncateAddress(wallet || '')}</span>
              </p>
              <div className="mt-4 text-4xl">🍓</div>
              <p className="text-sm text-gray-600 mt-2">
                NFTは後日配布予定です
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const handleVote = async (optionId: string) => {
    console.log('Casting vote for option:', optionId);
    try {
      const success = await castVote(optionId);
      console.log('Vote result:', success);
    } catch (err) {
      console.error('Vote casting error:', err);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full max-w-md"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center mb-2">
            <VoteIcon size={24} className="text-blue-600 mr-2" />
            <CardTitle>🍎 好きな果物を投票</CardTitle>
          </div>
          <CardDescription>
            以下の果物から一番好きなものを選んで投票してください。この操作は取り消せません。
          </CardDescription>
          {wallet && (
            <p className="text-sm mt-2">
              ウォレット: {truncateAddress(wallet)}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-500 p-2 rounded text-sm">
              <p className="font-medium">エラー:</p>
              <p>{error}</p>
            </div>
          )}
          
          {options.map((option) => (
            <motion.div key={option.id} variants={itemVariants}>
              <Button
                variant="outline"
                size="lg"
                className="w-full justify-start h-auto py-4 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                onClick={() => handleVote(option.id)}
                disabled={isLoading}
              >
                <div className="flex items-center w-full text-left">
                  <div className="text-3xl mr-4 group-hover:scale-110 transition-transform">
                    {option.emoji}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-lg">{option.name}</p>
                    <p className="text-sm text-slate-500">{option.description}</p>
                  </div>
                </div>
              </Button>
            </motion.div>
          ))}
        </CardContent>
        <CardFooter className="text-xs text-slate-500 justify-center">
          🎯 投票参加者にはNFTを配布予定です
        </CardFooter>
      </Card>
    </motion.div>
  );
}