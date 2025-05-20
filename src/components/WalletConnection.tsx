import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { WalletIcon } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/Card';
import { useVoteStore } from '../store/voteStore';
import { truncateAddress } from '../lib/utils';
import { useWalletList, useWallet } from '@meshsdk/react';

export default function WalletConnection() {
  const { verifyWallet, isLoading, error, wallet } = useVoteStore();
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // MeshSDK hooks
  const wallets = useWalletList();
  const { connect, connected, wallet: meshWallet, disconnect } = useWallet();

  // Silent reconnect - with error handling
  useEffect(() => {
    const tryConnect = async () => {
      try {
        const saved = localStorage.getItem('wallet');
        if (!connected && saved && window.cardano?.[saved]) {
          const api = await window.cardano[saved]
            .enable({ extensions:[{cip:95},{cip:104}] });
          await connect(saved, api);
        }
      } catch (err) {
        console.error('Auto-reconnect failed:', err);
        localStorage.removeItem('wallet');
        setConnectionError('ウォレット自動接続に失敗しました。手動で接続してください。');
      }
    };
    
    tryConnect();
  }, [connected, connect]);

  // When wallet address changes, verify it
  useEffect(() => {
    const verifyAddress = async () => {
      try {
        if (connected && meshWallet && meshWallet.address && !wallet) {
          await verifyWallet(meshWallet.address);
        }
      } catch (err) {
        console.error('Wallet verification error:', err);
        setConnectionError('ウォレット検証中にエラーが発生しました');
      }
    };
    
    verifyAddress();
  }, [connected, meshWallet, verifyWallet, wallet]);

  // Connect wallet
  const handleConnect = async () => {
    try {
      setConnectionError(null);
      if (wallets.length > 0) {
        const name = wallets[0].name; // auto-pick if only one
        await connect(name);
        localStorage.setItem('wallet', name);
      } else {
        setConnectionError('利用可能なウォレットが見つかりませんでした');
      }
    } catch (err) {
      console.error('Wallet connection error:', err);
      setConnectionError(err instanceof Error ? err.message : 'ウォレット接続中にエラーが発生しました');
    }
  };

  // Disconnect wallet
  const handleDisconnect = async () => {
    try {
      await disconnect();
      localStorage.removeItem('wallet');
    } catch (err) {
      console.error('Wallet disconnect error:', err);
      setConnectionError(err instanceof Error ? err.message : 'ウォレット切断中にエラーが発生しました');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center mb-2">
            <WalletIcon size={24} className="text-blue-600 mr-2" />
            <CardTitle>ウォレットを接続</CardTitle>
          </div>
          <CardDescription>
            Cardanoウォレットに接続して本人確認を行い、投票に参加しましょう。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {connectionError && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
              <p>{connectionError}</p>
            </div>
          )}

          {wallet ? (
            <div className="space-y-3">
              <div className="p-4 bg-green-50 rounded-md">
                <p className="text-sm text-green-700 flex justify-between items-center">
                  <span>
                    <span className="font-medium">接続済み: </span>
                    {truncateAddress(wallet)}
                  </span>
                </p>
              </div>
              
              <Button 
                onClick={handleDisconnect}
                variant="outline"
                size="sm"
                className="w-full text-slate-600"
              >
                ウォレットを切断
              </Button>
            </div>
          ) : (
            <Button 
              onClick={handleConnect} 
              className="w-full flex items-center justify-center" 
              isLoading={isLoading}
            >
              <WalletIcon size={18} className="mr-2" />
              ウォレットを接続
            </Button>
          )}
        </CardContent>
        <CardFooter className="text-xs text-slate-500 justify-center">
          お使いのCardanoウォレットがあなたの本人証明として使われます。
        </CardFooter>
      </Card>
    </motion.div>
  );
}