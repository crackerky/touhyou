import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Users, Gift, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { toast } from 'react-hot-toast';
import type { SessionVote, User } from '../types/supabase';

interface NFTDistributionProps {
  sessionId: string;
  sessionTitle: string;
}

interface DistributionTarget {
  userId: string;
  userEmail: string;
  walletAddress: string;
  votedOption: string;
  selected: boolean;
}

export function NFTDistribution({ sessionId, sessionTitle }: NFTDistributionProps) {
  const { user } = useAuthStore();
  const [targets, setTargets] = useState<DistributionTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [distributing, setDistributing] = useState(false);
  const [nftPolicyId, setNftPolicyId] = useState('');
  const [nftAssetName, setNftAssetName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [filterOption, setFilterOption] = useState<string>('all');
  const [votingOptions, setVotingOptions] = useState<string[]>([]);

  useEffect(() => {
    fetchVotersData();
  }, [sessionId]);

  const fetchVotersData = async () => {
    try {
      // Fetch session votes with user data
      const { data: votes, error: votesError } = await supabase
        .from('session_votes')
        .select(`
          *,
          users!session_votes_user_id_fkey (
            id,
            email,
            wallet_address
          )
        `)
        .eq('session_id', sessionId);

      if (votesError) throw votesError;

      // Get unique voting options
      const options = [...new Set(votes?.map(v => v.option) || [])];
      setVotingOptions(options);

      // Transform data for distribution targets
      const distributionTargets = votes?.map(vote => ({
        userId: vote.user_id,
        userEmail: vote.users?.email || '',
        walletAddress: vote.users?.wallet_address || '',
        votedOption: vote.option,
        selected: false
      })) || [];

      setTargets(distributionTargets);
    } catch (error) {
      console.error('Fetch voters error:', error);
      toast.error('投票者データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const toggleTarget = (userId: string) => {
    setTargets(targets.map(t => 
      t.userId === userId ? { ...t, selected: !t.selected } : t
    ));
  };

  const selectAll = () => {
    const filtered = getFilteredTargets();
    const allSelected = filtered.every(t => t.selected);
    
    setTargets(targets.map(t => {
      const isInFiltered = filtered.some(f => f.userId === t.userId);
      return isInFiltered ? { ...t, selected: !allSelected } : t;
    }));
  };

  const getFilteredTargets = () => {
    if (filterOption === 'all') return targets;
    return targets.filter(t => t.votedOption === filterOption);
  };

  const handleDistribute = async () => {
    const selectedTargets = targets.filter(t => t.selected && t.walletAddress);
    
    if (selectedTargets.length === 0) {
      toast.error('配布対象を選択してください');
      return;
    }

    if (!nftPolicyId) {
      toast.error('NFT Policy IDを入力してください');
      return;
    }

    setDistributing(true);
    
    try {
      // Create distribution records
      const distributions = selectedTargets.map(target => ({
        session_id: sessionId,
        recipient_user_id: target.userId,
        recipient_address: target.walletAddress,
        nft_policy_id: nftPolicyId,
        nft_asset_name: nftAssetName || null,
        quantity: quantity,
        status: 'pending'
      }));

      const { error } = await supabase
        .from('nft_distributions')
        .insert(distributions);

      if (error) throw error;

      toast.success(`${selectedTargets.length}件のNFT配布を登録しました`);
      
      // Reset selection
      setTargets(targets.map(t => ({ ...t, selected: false })));
      
      // Note: Actual NFT distribution would require integration with Cardano blockchain
      // This is just recording the distribution intent in the database
      toast.info('実際のNFT配布にはCardanoブロックチェーンとの連携が必要です', {
        duration: 5000
      });
      
    } catch (error) {
      console.error('Distribution error:', error);
      toast.error('NFT配布の登録に失敗しました');
    } finally {
      setDistributing(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </Card>
    );
  }

  const filteredTargets = getFilteredTargets();
  const selectedCount = targets.filter(t => t.selected).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Gift className="h-6 w-6 text-purple-600" />
          <h3 className="text-xl font-semibold">NFT配布管理</h3>
        </div>

        {/* Distribution Settings */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              NFT Policy ID <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={nftPolicyId}
              onChange={(e) => setNftPolicyId(e.target.value)}
              placeholder="配布するNFTのPolicy ID"
              className="font-mono text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asset Name
              </label>
              <Input
                type="text"
                value={nftAssetName}
                onChange={(e) => setNftAssetName(e.target.value)}
                placeholder="NFTのアセット名（任意）"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                配布数量
              </label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                min="1"
              />
            </div>
          </div>
        </div>

        {/* Filter and Selection */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <select
              value={filterOption}
              onChange={(e) => setFilterOption(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">全ての投票者</option>
              {votingOptions.map(option => (
                <option key={option} value={option}>
                  「{option}」に投票
                </option>
              ))}
            </select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={selectAll}
            >
              全て選択/解除
            </Button>
          </div>
          
          <div className="text-sm text-gray-600">
            {selectedCount} / {filteredTargets.length} 選択中
          </div>
        </div>

        {/* Voters List */}
        <div className="border rounded-lg divide-y max-h-96 overflow-y-auto mb-6">
          {filteredTargets.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              対象者がいません
            </div>
          ) : (
            filteredTargets.map((target) => (
              <label
                key={target.userId}
                className="flex items-center p-4 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={target.selected}
                  onChange={() => toggleTarget(target.userId)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                <div className="ml-3 flex-1">
                  <div className="font-medium">{target.userEmail}</div>
                  <div className="text-sm text-gray-500">
                    {target.walletAddress ? (
                      <span className="font-mono">
                        {target.walletAddress.slice(0, 12)}...{target.walletAddress.slice(-8)}
                      </span>
                    ) : (
                      <span className="text-red-500">ウォレット未登録</span>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {target.votedOption}
                </div>
              </label>
            ))
          )}
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">注意事項</p>
              <ul className="list-disc list-inside space-y-1">
                <li>ウォレット未登録のユーザーには配布できません</li>
                <li>実際のNFT配布にはCardanoトランザクションの送信が必要です</li>
                <li>配布記録はデータベースに保存されます</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={handleDistribute}
          disabled={selectedCount === 0 || !nftPolicyId || distributing}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {distributing ? (
            <>処理中...</>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              {selectedCount}人にNFTを配布
            </>
          )}
        </Button>
      </Card>
    </motion.div>
  );
}