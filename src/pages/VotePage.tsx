import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useVotingSessionStore } from '../store/votingSessionStore';
import { useNFTVerification } from '../hooks/useNFTVerification';
import { EmailAuth } from '../components/EmailAuth';
import { WalletRegistration } from '../components/WalletRegistration';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { toast } from 'react-hot-toast';

export function VotePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    currentSession, 
    fetchSessionById, 
    voteInSession, 
    sessionVotes,
    fetchSessionVotes,
    isLoading 
  } = useVotingSessionStore();
  
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  
  const { verifyNFT, isVerifying, nftData } = useNFTVerification();

  useEffect(() => {
    if (sessionId) {
      fetchSessionById(sessionId);
      fetchSessionVotes(sessionId);
    }
  }, [sessionId]);

  useEffect(() => {
    // Check if user has already voted
    if (user && sessionVotes[sessionId!]) {
      const userVote = sessionVotes[sessionId!].find(v => v.user_id === user.id);
      if (userVote) {
        setHasVoted(true);
        setSelectedOption(userVote.option);
      }
    }
  }, [user, sessionVotes, sessionId]);

  useEffect(() => {
    // Verify NFT if user has wallet and session requires NFT
    if (user?.wallet_address && currentSession?.nft_policy_id) {
      verifyNFT(user.wallet_address, currentSession.nft_policy_id);
    }
  }, [user, currentSession]);

  const handleVote = async () => {
    if (!user) {
      toast.error('ログインが必要です');
      return;
    }

    if (!user.wallet_address) {
      toast.error('ウォレットアドレスの登録が必要です');
      return;
    }

    if (!selectedOption) {
      toast.error('選択肢を選んでください');
      return;
    }

    if (currentSession?.nft_policy_id && !nftData?.verified) {
      toast.error('NFT保有確認が必要です');
      return;
    }

    setIsVoting(true);
    try {
      await voteInSession(
        sessionId!,
        user.id,
        selectedOption,
        nftData?.verified || false,
        nftData?.nftCount || 0
      );
      
      setHasVoted(true);
      toast.success('投票が完了しました');
      
      // Refresh votes
      fetchSessionVotes(sessionId!);
    } catch (error) {
      console.error('Vote error:', error);
    } finally {
      setIsVoting(false);
    }
  };

  if (isLoading || !currentSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Calculate vote results
  const voteResults = currentSession.options.map((option: any) => {
    const votes = sessionVotes[sessionId!]?.filter(v => v.option === option.label) || [];
    return {
      ...option,
      count: votes.length,
      percentage: sessionVotes[sessionId!]?.length 
        ? (votes.length / sessionVotes[sessionId!].length) * 100 
        : 0
    };
  });

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          ホームに戻る
        </Button>

        {/* Session Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-8 mb-6">
            <h1 className="text-3xl font-bold mb-4">{currentSession.title}</h1>
            {currentSession.description && (
              <p className="text-gray-600 mb-6">{currentSession.description}</p>
            )}

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              {currentSession.is_active ? (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  開催中
                </span>
              ) : (
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                  終了
                </span>
              )}
              
              {currentSession.nft_policy_id && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  NFT保有者限定
                </span>
              )}
              
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                総投票数: {sessionVotes[sessionId!]?.length || 0}
              </span>
            </div>

            {/* NFT Verification Status */}
            {currentSession.nft_policy_id && user?.wallet_address && (
              <div className="mb-6">
                {isVerifying ? (
                  <div className="flex items-center gap-2 text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    NFT保有を確認中...
                  </div>
                ) : nftData?.verified ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <Shield className="h-4 w-4" />
                    NFT保有確認済み ({nftData.nftCount}個)
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    NFT保有が確認できません
                  </div>
                )}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Login/Registration Required */}
        {!user ? (
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">ログインが必要です</h2>
            <p className="text-gray-600 mb-6">
              投票に参加するには、メールアドレスでログインしてください
            </p>
            <div className="flex justify-center">
              <EmailAuth />
            </div>
          </Card>
        ) : !user.wallet_address ? (
          <WalletRegistration />
        ) : (
          <>
            {/* Voting Options */}
            {!hasVoted && currentSession.is_active ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="p-8 mb-6">
                  <h2 className="text-xl font-semibold mb-6">投票する</h2>
                  <div className="space-y-3 mb-6">
                    {currentSession.options.map((option: any) => (
                      <label
                        key={option.id}
                        className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          selectedOption === option.label
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="vote"
                          value={option.label}
                          checked={selectedOption === option.label}
                          onChange={(e) => setSelectedOption(e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{option.label}</span>
                          {option.description && (
                            <span className="text-sm text-gray-500">{option.description}</span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                  
                  <Button
                    onClick={handleVote}
                    disabled={!selectedOption || isVoting || (currentSession.nft_policy_id && !nftData?.verified)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isVoting ? '投票中...' : '投票する'}
                  </Button>
                </Card>
              </motion.div>
            ) : null}

            {/* Results */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-8">
                <h2 className="text-xl font-semibold mb-6">
                  {hasVoted ? '投票結果' : '現在の投票状況'}
                </h2>
                
                {hasVoted && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800">
                      あなたは「{selectedOption}」に投票しました
                    </p>
                  </div>
                )}
                
                <div className="space-y-4">
                  {voteResults.map((result: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{result.label}</span>
                        <span className="text-sm text-gray-600">
                          {result.count} 票 ({result.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${result.percentage}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="absolute inset-y-0 left-0 bg-blue-600 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}