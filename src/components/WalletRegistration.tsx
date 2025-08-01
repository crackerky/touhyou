import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { useWallet } from '@meshsdk/react';
import { toast } from 'react-hot-toast';

export function WalletRegistration() {
  const { user, updateUserWallet, isLoading } = useAuthStore();
  const { connected, wallet } = useWallet();
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const connectAndRegisterWallet = async () => {
    if (!connected || !wallet) {
      toast.error('ウォレットが接続されていません');
      return;
    }

    setIsConnecting(true);
    try {
      const addresses = await wallet.getUsedAddresses();
      if (addresses.length > 0) {
        const address = addresses[0];
        setWalletAddress(address);
        await updateUserWallet(address);
        toast.success('ウォレットアドレスが登録されました');
      } else {
        toast.error('ウォレットアドレスが見つかりません');
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      toast.error('ウォレット接続エラーが発生しました');
    } finally {
      setIsConnecting(false);
    }
  };

  const manualRegisterWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletAddress) {
      toast.error('ウォレットアドレスを入力してください');
      return;
    }

    // Basic Cardano address validation
    if (!walletAddress.startsWith('addr1') || walletAddress.length < 50) {
      toast.error('有効なCardanoウォレットアドレスを入力してください');
      return;
    }

    try {
      await updateUserWallet(walletAddress);
      toast.success('ウォレットアドレスが登録されました');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('登録エラーが発生しました');
    }
  };

  if (user?.wallet_address) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 text-green-600">
          <CheckCircle className="h-6 w-6" />
          <div>
            <h3 className="font-semibold">ウォレット登録済み</h3>
            <p className="text-sm text-gray-600 mt-1">
              アドレス: {user.wallet_address.slice(0, 12)}...{user.wallet_address.slice(-8)}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Wallet className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold">ウォレットアドレスの登録</h3>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">ウォレットアドレスの登録が必要です</p>
              <p>投票に参加するには、Cardanoウォレットアドレスを登録してください。</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* ウォレット接続オプション */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              オプション1: ウォレットを接続して自動登録
            </h4>
            <Button
              onClick={connectAndRegisterWallet}
              disabled={!connected || isConnecting || isLoading}
              className="w-full"
            >
              {isConnecting ? (
                <>処理中...</>
              ) : connected ? (
                <>ウォレットから自動登録</>
              ) : (
                <>先にウォレットを接続してください</>
              )}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">または</span>
            </div>
          </div>

          {/* 手動入力オプション */}
          <form onSubmit={manualRegisterWallet}>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              オプション2: アドレスを手動で入力
            </h4>
            <div className="space-y-3">
              <Input
                type="text"
                placeholder="addr1..."
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                disabled={isLoading}
                className="font-mono text-sm"
              />
              <Button
                type="submit"
                disabled={!walletAddress || isLoading}
                variant="outline"
                className="w-full"
              >
                手動で登録
              </Button>
            </div>
          </form>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <p>※ 登録されたアドレスはNFT保有確認に使用されます</p>
          <p>※ 一度登録すると変更できませんのでご注意ください</p>
        </div>
      </Card>
    </motion.div>
  );
}