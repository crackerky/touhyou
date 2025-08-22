import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Shield, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { useCardanoWallet } from '../hooks/useCardanoWallet';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';

interface WalletConnectorProps {
  requiredPolicyId?: string;
  onWalletConnected?: (address: string, hasRequiredNFT: boolean) => void;
}

export function WalletConnector({ requiredPolicyId, onWalletConnected }: WalletConnectorProps) {
  const { user, updateUser } = useAuthStore();
  const {
    isConnected,
    walletName,
    address,
    balance,
    assets,
    isLoading,
    error,
    availableWallets,
    connectWallet,
    disconnectWallet,
    checkNFTOwnership
  } = useCardanoWallet();

  const [showWalletModal, setShowWalletModal] = useState(false);

  // NFT保有状況をチェック
  const nftStatus = requiredPolicyId ? checkNFTOwnership(requiredPolicyId) : null;

  // ウォレット接続処理
  const handleWalletConnect = async (selectedWalletName: string) => {
    try {
      await connectWallet(selectedWalletName);
      setShowWalletModal(false);
    } catch (error) {
      console.error('ウォレット接続エラー:', error);
    }
  };

  // ウォレットアドレスをユーザープロファイルに保存
  const saveWalletAddress = async () => {
    if (!address || !user) return;

    try {
      await updateUser({ wallet_address: address });
      toast.success('ウォレットアドレスを保存しました！');
      
      if (onWalletConnected) {
        onWalletConnected(address, nftStatus?.hasNFT || false);
      }
    } catch (error) {
      console.error('ウォレットアドレス保存エラー:', error);
      toast.error('ウォレットアドレスの保存に失敗しました');
    }
  };

  // ADAの残高を読みやすい形式に変換
  const formatADABalance = (lovelace: string) => {
    const ada = parseInt(lovelace) / 1000000;
    return ada.toFixed(2);
  };

  if (isConnected && address) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200"
      >
        {/* 接続済みウォレット情報 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{walletName} 接続済み</h3>
              <p className="text-sm text-gray-600">ウォレットが正常に接続されています</p>
            </div>
          </div>
          <button
            onClick={disconnectWallet}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            切断
          </button>
        </div>

        {/* ウォレット詳細 */}
        <div className="space-y-4">
          {/* アドレス */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">アドレス</span>
              <button
                onClick={() => navigator.clipboard.writeText(address)}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                コピー
              </button>
            </div>
            <p className="text-sm text-gray-900 font-mono mt-1">
              {address.slice(0, 20)}...{address.slice(-10)}
            </p>
          </div>

          {/* 残高 */}
          {balance && (
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-sm font-medium text-gray-700">残高</span>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {formatADABalance(balance)} ADA
              </p>
            </div>
          )}

          {/* NFT保有状況 */}
          {requiredPolicyId && nftStatus && (
            <div className={`rounded-lg p-4 ${
              nftStatus.hasNFT 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {nftStatus.hasNFT ? (
                  <Shield className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <span className={`font-medium ${
                  nftStatus.hasNFT ? 'text-green-800' : 'text-red-800'
                }`}>
                  NFT保有状況
                </span>
              </div>
              <p className={`text-sm ${
                nftStatus.hasNFT ? 'text-green-700' : 'text-red-700'
              }`}>
                {nftStatus.hasNFT 
                  ? `必要なNFTを${nftStatus.count}個保有しています` 
                  : '必要なNFTを保有していません'
                }
              </p>
              {nftStatus.hasNFT && (
                <div className="mt-2">
                  <p className="text-xs text-green-600">
                    ポリシーID: {requiredPolicyId.slice(0, 20)}...
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 保存ボタン */}
          {user && (!user.wallet_address || user.wallet_address !== address) && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={saveWalletAddress}
              className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold"
            >
              ウォレットアドレスを保存
            </motion.button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
      {/* ウォレット接続促進 */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Cardanoウォレットを接続</h3>
        <p className="text-gray-600">
          投票に参加するには、Cardanoウォレットを接続してください
        </p>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800 font-medium">接続エラー</span>
          </div>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* 接続ボタン */}
      <button
        onClick={() => setShowWalletModal(true)}
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            接続中...
          </div>
        ) : (
          'ウォレットを接続'
        )}
      </button>

      {/* ウォレット選択モーダル */}
      <AnimatePresence>
        {showWalletModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowWalletModal(false)}></div>
            <div className="flex items-center justify-center min-h-screen p-4 relative z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4">ウォレットを選択</h3>
                
                {availableWallets.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      対応するウォレットが見つかりません
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      以下のウォレットをインストールしてください：
                    </p>
                    <div className="space-y-2 text-sm">
                      {['Nami', 'Eternl', 'Flint', 'Typhon', 'Gero'].map(wallet => (
                        <div key={wallet} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span>{wallet}</span>
                          <ExternalLink className="h-4 w-4 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availableWallets.map((wallet) => (
                      <button
                        key={wallet.name}
                        onClick={() => handleWalletConnect(wallet.name)}
                        className="w-full flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        <span className="text-2xl">{wallet.icon}</span>
                        <div className="text-left">
                          <div className="font-semibold text-gray-900">{wallet.name}</div>
                          <div className="text-sm text-gray-600">API v{wallet.apiVersion}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setShowWalletModal(false)}
                  className="w-full mt-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  キャンセル
                </button>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}