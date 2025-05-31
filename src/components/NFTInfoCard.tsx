import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ExternalLink, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface NFTInfoCardProps {
  policyId: string;
  apiEndpoint?: string;
  className?: string;
}

const NFTInfoCard: React.FC<NFTInfoCardProps> = ({ 
  policyId, 
  apiEndpoint,
  className = '' 
}) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('コピーしました！');
    }).catch(() => {
      toast.error('コピーに失敗しました');
    });
  };

  const openInCardanoScan = () => {
    const url = `https://cardanoscan.io/tokenPolicy/${policyId}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4 ${className}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-purple-900">対象NFT情報</h3>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Policy ID
          </label>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs text-gray-600 bg-white px-3 py-2 rounded border break-all">
              {policyId}
            </code>
            <button
              onClick={() => copyToClipboard(policyId)}
              className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-100 rounded transition-colors"
              title="コピー"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {apiEndpoint && (
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              検証API
            </label>
            <div className="text-xs text-gray-600 bg-white px-3 py-2 rounded border">
              {apiEndpoint}
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <button
            onClick={openInCardanoScan}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            CardanoScanで確認
          </button>
        </div>
        
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <strong>注意:</strong> 投票には上記Policy IDのNFTを保有している必要があります。
          NFT保有確認はBlockfrost API、Koios API、またはNMKR購入履歴を通じて行われます。
        </div>
      </div>
    </motion.div>
  );
};

export default NFTInfoCard;