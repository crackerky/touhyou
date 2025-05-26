import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { WalletIcon, AlertCircle, Smartphone, Edit3, QrCode, CheckCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/Card';
import { useVoteStore } from '../store/voteStore';
import { truncateAddress } from '../lib/utils';
import { useWalletList, useWallet } from '@meshsdk/react';

// Cardanoアドレスの基本的な検証
const validateCardanoAddress = (address: string): boolean => {
  // Cardanoアドレスの基本的な形式チェック
  if (!address || address.length < 50) return false;
  
  // Bech32形式（addr1で始まる）またはレガシー形式の簡単なチェック
  const bech32Pattern = /^addr1[a-z0-9]{50,}/;
  const legacyPattern = /^[A-Za-z0-9]{50,}/;
  
  return bech32Pattern.test(address) || legacyPattern.test(address);
};

export default function WalletConnection() {
  const { verifyWallet, isLoading, error, wallet } = useVoteStore();
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectInProgress, setConnectInProgress] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'extension' | 'manual' | 'mobile'>('manual');
  const [manualAddress, setManualAddress] = useState('');
  const [isValidAddress, setIsValidAddress] = useState(false);
  
  // MeshSDK hooks
  const wallets = useWalletList();
  const { connect, connected, wallet: meshWallet, disconnect } = useWallet();

  // アドレス検証
  useEffect(() => {
    setIsValidAddress(validateCardanoAddress(manualAddress));
  }, [manualAddress]);

  // Debug information
  useEffect(() => {
    console.log('WalletConnection component rendered');
    console.log('Available wallets:', wallets);
    console.log('Connected status:', connected);
    console.log('Wallet address:', meshWallet?.address);
  }, [wallets, connected, meshWallet]);

  // 拡張機能があれば自動接続を試行
  useEffect(() => {
    const tryConnect = async () => {
      try {
        const saved = localStorage.getItem('wallet');
        const savedAddress = localStorage.getItem('manualWalletAddress');
        
        // 手動アドレスが保存されている場合は復元
        if (savedAddress && !wallet) {
          console.log('Restoring manual wallet address:', savedAddress);
          await verifyWallet(savedAddress);
          return;
        }
        
        // 拡張機能での自動接続
        if (!connected && saved && window.cardano && window.cardano[saved]) {
          console.log('Attempting to reconnect wallet:', saved);
          setConnectInProgress(true);
          
          try {
            const api = await window.cardano[saved].enable({ 
              extensions: [{cip: 95}, {cip: 104}] 
            });
            await connect(saved, api);
            console.log('Wallet connected successfully');
          } catch (enableError) {
            console.error('Wallet enable error:', enableError);
            localStorage.removeItem('wallet');
          } finally {
            setConnectInProgress(false);
          }
        }
      } catch (err) {
        console.error('Auto-reconnect failed:', err);
        setConnectInProgress(false);
      }
    };
    
    if (!wallet) {
      tryConnect();
    }
  }, [connected, connect, verifyWallet, wallet]);

  // 拡張機能ウォレットアドレスが変わったら検証
  useEffect(() => {
    const verifyAddress = async () => {
      try {
        if (connected && meshWallet && meshWallet.address && !wallet) {
          console.log('Verifying wallet address:', meshWallet.address);
          const success = await verifyWallet(meshWallet.address);
          if (success) {
            localStorage.removeItem('manualWalletAddress'); // 手動アドレスをクリア
          }
        }
      } catch (err) {
        console.error('Wallet verification error:', err);
        setConnectionError('ウォレット検証中にエラーが発生しました');
      }
    };
    
    verifyAddress();
  }, [connected, meshWallet, verifyWallet, wallet]);

  // 拡張機能ウォレット接続
  const handleExtensionConnect = async () => {
    try {
      setConnectionError(null);
      setConnectInProgress(true);
      
      if (!window.cardano) {
        setConnectionError('拡張機能が見つかりません。手動入力をお試しください。');
        setActiveTab('manual');
        return;
      }
      
      if (wallets.length > 0) {
        const name = wallets[0].name;
        await connect(name);
        localStorage.setItem('wallet', name);
        localStorage.removeItem('manualWalletAddress'); // 手動アドレスをクリア
      } else {
        setConnectionError('利用可能なウォレットが見つかりません');
      }
    } catch (err) {
      console.error('Wallet connection error:', err);
      setConnectionError(err instanceof Error ? err.message : 'ウォレット接続中にエラーが発生しました');
    } finally {
      setConnectInProgress(false);
    }
  };

  // 手動アドレス入力で接続
  const handleManualConnect = async () => {
    if (!isValidAddress) {
      setConnectionError('有効なCardanoアドレスを入力してください');
      return;
    }

    try {
      setConnectionError(null);
      setConnectInProgress(true);
      
      console.log('Verifying manual wallet address:', manualAddress);
      const success = await verifyWallet(manualAddress);
      
      if (success) {
        localStorage.setItem('manualWalletAddress', manualAddress);
        localStorage.removeItem('wallet'); // 拡張機能の設定をクリア
        console.log('Manual wallet verified successfully');
      } else {
        setConnectionError('アドレスの検証に失敗しました');
      }
    } catch (err) {
      console.error('Manual wallet verification error:', err);
      setConnectionError('アドレス検証中にエラーが発生しました');
    } finally {
      setConnectInProgress(false);
    }
  };

  // ウォレット切断
  const handleDisconnect = async () => {
    try {
      if (connected) {
        await disconnect();
        localStorage.removeItem('wallet');
      }
      localStorage.removeItem('manualWalletAddress');
      setManualAddress('');
      console.log('Wallet disconnected successfully');
    } catch (err) {
      console.error('Wallet disconnect error:', err);
      setConnectionError('ウォレット切断中にエラーが発生しました');
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
            投票に参加するためにCardanoウォレットアドレスが必要です。
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

          {wallet ? (
            <div className="space-y-3">
              <div className="p-4 bg-green-50 rounded-md">
                <div className="flex items-center text-sm text-green-700">
                  <CheckCircle size={16} className="mr-2" />
                  <span>
                    <span className="font-medium">接続済み: </span>
                    {truncateAddress(wallet)}
                  </span>
                </div>
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
            <div className="space-y-4">
              {/* タブ選択 */}
              <div className="flex space-x-1 bg-slate-100 p-1 rounded-md">
                <button
                  onClick={() => setActiveTab('manual')}
                  className={`flex-1 flex items-center justify-center py-2 px-3 rounded text-sm font-medium transition-colors ${
                    activeTab === 'manual' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Edit3 size={16} className="mr-1" />
                  手動入力
                </button>
                <button
                  onClick={() => setActiveTab('extension')}
                  className={`flex-1 flex items-center justify-center py-2 px-3 rounded text-sm font-medium transition-colors ${
                    activeTab === 'extension' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <WalletIcon size={16} className="mr-1" />
                  拡張機能
                </button>
                <button
                  onClick={() => setActiveTab('mobile')}
                  className={`flex-1 flex items-center justify-center py-2 px-3 rounded text-sm font-medium transition-colors ${
                    activeTab === 'mobile' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone size={16} className="mr-1" />
                  スマホ
                </button>
              </div>

              {/* 手動入力タブ */}
              {activeTab === 'manual' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Cardanoウォレットアドレス
                    </label>
                    <input
                      type="text"
                      value={manualAddress}
                      onChange={(e) => setManualAddress(e.target.value)}
                      placeholder="addr1..."
                      className={`w-full px-3 py-2 border rounded-md text-sm ${
                        manualAddress && !isValidAddress 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-slate-300 focus:border-blue-500'
                      } focus:outline-none focus:ring-1`}
                    />
                    {manualAddress && !isValidAddress && (
                      <p className="text-red-500 text-xs mt-1">有効なCardanoアドレスを入力してください</p>
                    )}
                  </div>
                  <Button 
                    onClick={handleManualConnect}
                    className="w-full"
                    disabled={!isValidAddress}
                    isLoading={isLoading || connectInProgress}
                  >
                    アドレスで接続
                  </Button>
                  <p className="text-xs text-slate-500">
                    ウォレットアプリからアドレスをコピーして貼り付けてください
                  </p>
                </div>
              )}

              {/* 拡張機能タブ */}
              {activeTab === 'extension' && (
                <div className="space-y-3">
                  {typeof window !== 'undefined' && window.cardano && wallets.length > 0 ? (
                    <Button 
                      onClick={handleExtensionConnect}
                      className="w-full"
                      isLoading={isLoading || connectInProgress}
                    >
                      <WalletIcon size={18} className="mr-2" />
                      ウォレット拡張機能で接続
                    </Button>
                  ) : (
                    <div className="bg-amber-50 p-4 rounded-md text-sm">
                      <p className="font-medium mb-2">拡張機能ウォレット:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li><a href="https://namiwallet.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Nami</a></li>
                        <li><a href="https://flint-wallet.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Flint</a></li>
                        <li><a href="https://eternl.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Eternl</a></li>
                        <li><a href="https://tokeo.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Tokeo</a></li>
                      </ul>
                      <p className="mt-2 text-slate-600">
                        インストール後にページを再読み込みするか、手動入力をお試しください。
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* スマホアプリタブ */}
              {activeTab === 'mobile' && (
                <div className="space-y-3">
                  <div className="bg-blue-50 p-4 rounded-md text-sm">
                    <div className="flex items-center mb-2">
                      <Smartphone size={16} className="text-blue-600 mr-2" />
                      <p className="font-medium text-blue-800">スマホアプリ対応</p>
                    </div>
                    <p className="text-blue-700 mb-3">
                      以下のアプリをダウンロードして、ウォレットアドレスをコピーしてください:
                    </p>
                    <ul className="space-y-2">
                      <li>
                        <a href="https://yoroi-wallet.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                          📱 Yoroi Wallet
                        </a>
                      </li>
                      <li>
                        <a href="https://namiwallet.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                          📱 Nami Mobile
                        </a>
                      </li>
                      <li>
                        <a href="https://eternl.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                          📱 Eternl Mobile
                        </a>
                      </li>
                      <li>
                        <a href="https://tokeo.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                          📱 Tokeo Mobile
                        </a>
                      </li>
                    </ul>
                  </div>
                  <Button 
                    onClick={() => setActiveTab('manual')}
                    variant="outline"
                    className="w-full"
                  >
                    アドレス入力に移動
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="text-xs text-slate-500 justify-center">
          📝 アドレス収集目的：投票参加者にNFTを配布します
        </CardFooter>
      </Card>
    </motion.div>
  );
}