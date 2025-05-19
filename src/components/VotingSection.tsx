import React from 'react';
import { motion } from 'framer-motion';
import { VoteIcon, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/Card';
import { Button } from './ui/Button';
import { useVoteStore } from '../store/voteStore';
import { truncateAddress } from '../lib/utils';

export default function VotingSection() {
  const { wallet, hasVoted, isLoading, castVote, error } = useVoteStore();

  const options = [
    { id: 'option1', name: '選択肢 1', description: '1つ目の投票選択肢' },
    { id: 'option2', name: '選択肢 2', description: '2つ目の投票選択肢' },
    { id: 'option3', name: '選択肢 3', description: '3つ目の投票選択肢' }
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
            <CardTitle className="text-center">投票ありがとうございます！</CardTitle>
            <CardDescription className="text-center">
              あなたの投票が正常に記録されました。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="font-medium">
                ウォレット: <span className="font-normal">{truncateAddress(wallet || '')}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

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
            <CardTitle>投票する</CardTitle>
          </div>
          <CardDescription>
            以下の選択肢から一つを選んで投票してください。この操作は取り消せません。
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
              {error}
            </div>
          )}
          
          {options.map((option) => (
            <motion.div key={option.id} variants={itemVariants}>
              <Button
                variant="outline"
                size="lg"
                className="w-full justify-start h-auto py-4 hover:border-blue-500 hover:bg-blue-50 transition-all"
                onClick={() => castVote(option.id)}
                disabled={isLoading}
              >
                <div className="text-left">
                  <p className="font-medium">{option.name}</p>
                  <p className="text-sm text-slate-500">{option.description}</p>
                </div>
              </Button>
            </motion.div>
          ))}
        </CardContent>
        <CardFooter className="text-xs text-slate-500 justify-center">
          あなたの投票はデータベースに安全に記録されます。
        </CardFooter>
      </Card>
    </motion.div>
  );
}