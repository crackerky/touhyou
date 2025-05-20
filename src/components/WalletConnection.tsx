import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { WalletIcon, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/Card';
import { useVoteStore } from '../store/voteStore';
import { truncateAddress } from '../lib/utils';
import { useWalletList, useWallet } from '@meshsdk/react';

export default function WalletConnection() {
  const { verifyWallet, isLoading, error, wallet } = useVoteStore();
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectInProgress, setConnectInProgress] = useState<boolean>(false);
  
  // MeshSDK hooks
  const wallets = useWalletList();
  const { connect, connected, wallet: meshWallet, disconnect } = useWallet();

  // Debug information
  useEffect(() => {
    console.log('WalletConnection component rendered');
    console.log('Available wallets:', wallets);
    console.log('Connected status:', connected);
    console.log('Wallet address:', meshWallet?.address);
    console.log('Window.cardano available:', typeof window.cardano !== 'undefined');
    if (window.cardano) {
      console.log('Detected wallet providers:', Object.keys(window.cardano));
    }
  }, [wallets, connected, meshWallet]);

  // Silent reconnect
  useEffect(() => {
    const tryConnect = async () => {
      try {
        const saved = localStorage.getItem('wallet');
        console.log('Attempting to reconnect wallet:', saved);
        
        if (!connected && saved) {
          if (!window.cardano) {
            console.error('window.cardano is not available');
            setConnectionError('Cardanoウォレット拡張機能が見つかりません。インストールしてリロードしてください。');
            return;
          }
          
          if (!window.cardano[saved]) {
            console.error(`Saved wallet ${saved} not found in window.cardano`);
            setConnectionError(`保存されたウォレット (${saved}) が見つかりません。リロードして再接続してください。`);
            localStorage.removeItem('wallet');
            return;
          }
          
          console.log('Calling enable on wallet');
          setConnectInProgress(true);
          
          try {
            const api = await window.cardano[saved].enable({ 
              extensions: [{cip: 95}, {cip: 104}] 
            });
            console.log('Wallet API enabled, connecting');
            await connect(saved, api);
            console.log('Wallet connected successfully');
          } catch (enableError) {
            console.error('Wallet enable error:', enableError);
            setConnectionError(`ウォレット接続エラー: ${enableError instanceof Error ? enableError.message : '不明なエラー'}`);
            localStorage.removeItem('wallet');
          } finally {
            setConnectInProgress(false);
          }
        }
      } catch (err) {
        console.error('Auto-reconnect failed:', err);
        localStorage.removeItem('wallet');
        setConnectionError('ウォレット自動接続に失敗しました。手動で接続してください。');
        setConnectInProgress(false);
      }
    };
    
    if (!connected && !connectInProgress) {
      tryConnect();
    }
  }, [connected, connect, connectInProgress]);

  // When wallet address changes, verify it
  useEffect(() => {
    const verifyAddress = async () => {
      try {
        if (connected && meshWallet && meshWallet.address && !wallet) {
          console.log('Verifying wallet address:', meshWallet.address);
          const success = await verifyWallet(meshWallet.address);
          console.log('Wallet verification result:', success);
          if (!success) {
            console.error('Wallet verification failed');
          }
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
      setConnectInProgress(true);
      
      console.log('Attempting to connect wallet, available wallets:', wallets);
      
      if (!window.cardano) {
        throw new Error('Cardanoウォレット拡張機能が見つかりません');
      }
      
      if (wallets.length > 0) {
        const name = wallets[0].name; // auto-pick if only one
        console.log('Connecting to wallet:', name);
        
        try {
          await connect(name);
          localStorage.setItem('wallet', name);
          console.log('Wallet connected successfully');
        } catch (connectError) {
          console.error('Connect error:', connectError);
          throw new Error(`接続エラー: ${connectError instanceof Error ? connectError.message : '不明なエラー'}`);
        }
      } else {
        console.error('No wallets available');
        throw new Error('利用可能なウォレットが見つかりませんでした');
      }
    } catch (err) {
      console.error('Wallet connection error:', err);
      setConnectionError(err instanceof Error ? err.message : 'ウォレット接続中にエラーが発生しました');
    } finally {
      setConnectInProgress(false);
    }
  };

  // Disconnect wallet
  const handleDisconnect = async () => {
    try {
      console.log('Disconnecting wallet');
      await disconnect();
      localStorage.removeItem('wallet');
      console.log('Wallet disconnected successfully');
    } catch (err) {
      console.error('Wallet disconnect error:', err);
      setConnectionError(err instanceof Error ? err.message : 'ウォレット切断中にエラーが発生しました');
    }
  };

  // If no Cardano API is available, show installation instructions
  if (typeof window.cardano === 'undefined') {
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
              <AlertCircle size={24} className="text-amber-500 mr-2" />
              <CardTitle>ウォレットが必要です</CardTitle>
            </div>
            <CardDescription>
              投票するにはCardanoウォレット拡張機能をインストールする必要があります。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-50 p-4 rounded-md text-sm">
              <p className="font-medium mb-2">次のいずれかのウォレットをインストールしてください:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><a href="https://namiwallet.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Nami</a></li>
                <li><a href="https://flint-wallet.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Flint</a></li>
                <li><a href="https://eternl.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Eternl</a></li>
              </ul>
            </div>
            <p className="text-sm text-slate-500">
              インストール後、このページを再読み込みしてください。
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="w-full"
            >
              ページを再読み込み
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

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
              <p className="font-medium">エラー:</p>
              <p>{error}</p>
            </div>
          )}

          {connectionError && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
              <p className="font-medium">接続エラー:</p>
              <p>{connectionError}</p>
            </div>
          )}

          {wallets.length === 0 && !wallet && !isLoading && (
            <div className="bg-amber-50 text-amber-700 p-3 rounded-md text-sm">
              <p>利用可能なウォレットが見つかりません。次のいずれかの操作を行ってください:</p>
              <ol className="list-decimal pl-5 mt-2 space-y-1">
                <li>ウォレット拡張機能がインストールされていることを確認</li>
                <li>ブラウザを再起動</li>
                <li>拡張機能が有効になっていることを確認</li>
              </ol>
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
                isLoading={isLoading || connectInProgress}
              >
                ウォレットを切断
              </Button>
            </div>
          ) : (
            <Button 
              onClick={handleConnect} 
              className="w-full flex items-center justify-center" 
              isLoading={isLoading || connectInProgress}
              disabled={wallets.length === 0}
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