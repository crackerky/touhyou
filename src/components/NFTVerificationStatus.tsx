import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Shield, Coins, AlertTriangle } from 'lucide-react';
import { useVoteStore } from '../store/voteStore';

const NFTVerificationStatus: React.FC = () => {
  const { 
    nftVerificationStatus, 
    nftData, 
    isNFTHolder, 
    wallet,
    error 
  } = useVoteStore();

  // ウォレットが接続されていない場合は何も表示しない
  if (!wallet) {
    return null;
  }

  // NFT検証中の表示
  if (nftVerificationStatus === 'pending') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md mx-auto"
      >
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            <h3 className="text-lg font-semibold text-blue-900">NFT保有確認中</h3>
          </div>
          <div className="text-center">
            <p className="text-blue-700 mb-2">
              ブロックチェーンでNFT保有状況を確認しています...
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // NFT保有が確認された場合
  if (nftVerificationStatus === 'verified' && isNFTHolder && nftData) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md mx-auto"
      >
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-green-900">NFT保有確認済み</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-white rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">保有NFT数</span>
              </div>
              <span className="text-lg font-bold text-green-700">{nftData.nftCount}</span>
            </div>
            
            <div className="flex items-center justify-between bg-white rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">検証方法</span>
              </div>
              <span className="text-sm font-semibold text-green-700 capitalize">
                {nftData.verificationMethod === 'blockfrost' && 'Blockfrost API'}
                {nftData.verificationMethod === 'koios' && 'Koios API'}
                {nftData.verificationMethod === 'nmkr' && 'NMKR購入履歴'}
              </span>
            </div>
            
            {nftData.policyId && (
              <div className="bg-white rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">Policy ID</span>
                </div>
                <code className="text-xs text-gray-600 break-all bg-gray-100 px-2 py-1 rounded">
                  {nftData.policyId}
                </code>
              </div>
            )}
          </div>
          
          <div className="mt-4 p-3 bg-green-100 rounded-lg">
            <p className="text-sm text-green-800 text-center font-medium">
              🎉 投票に参加できます！
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // NFT保有が確認できなかった場合
  if (nftVerificationStatus === 'failed' || !isNFTHolder) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md mx-auto"
      >
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <XCircle className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900">NFT保有未確認</h3>
          </div>
          
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 p-3 bg-white rounded-lg">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-gray-700">
                対象NFTの保有が確認できませんでした
              </span>
            </div>
            
            {error && (
              <div className="p-3 bg-red-100 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>投票に参加するには：</strong></p>
              <ul className="space-y-1 text-left">
                <li>• 対象NFTを保有する必要があります</li>
                <li>• 正しいウォレットでログインしていることを確認してください</li>
                <li>• NFTがCardanoメインネットにあることを確認してください</li>
              </ul>
            </div>
            
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                <strong>💡 ヒント:</strong> 開発環境ではデモウォレットアドレスで動作確認ができます
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
};

export default NFTVerificationStatus;