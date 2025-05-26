import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { WalletIcon, AlertCircle, Smartphone, Edit3, QrCode, CheckCircle, ExternalLink, Copy, RefreshCw } from 'lucide-react';
import QRCode from 'react-qr-code';
import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/Card';
import { useVoteStore } from '../store/voteStore';
import { truncateAddress } from '../lib/utils';
import { useWalletList, useWallet } from '@meshsdk/react';

// Cardanoアドレスの基本的な検証
const validateCardanoAddress = (address: string): boolean => {
  if (!address || address.length < 50) return false;
  const bech32Pattern = /^addr1[a-z0-9]{50,}/;
  const legacyPattern = /^[A-Za-z0-9]{50,}/;
  return bech32Pattern.test(address) || legacyPattern.test(address);
};

// モバイル検出
const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// ウォレットアプリの情報
const walletApps = [
  {
    name: 'Yoroi',
    scheme: 'yoroi://',
    downloadUrl: 'https://yoroi-wallet.com/',
    storeLinks: {
      ios: 'https://apps.apple.com/app/emurgo-yoroi-cardano-wallet/id1447326389',
      android: 'https://play.google.com/store/apps/details?id=com.emurgo'
    }
  },
  {
    name: 'Nami',
    scheme: 'nami://',
    downloadUrl: 'https://namiwallet.io/',
    storeLinks: {
      ios: 'https://namiwallet.io/',
      android: 'https://namiwallet.io/'
    }
  },
  {
    name: 'Eternl',
    scheme: 'eternl://',
    downloadUrl: 'https://eternl.io/',
    storeLinks: {
      ios: 'https://apps.apple.com/app/eternl/id1620075109',
      android: 'https://play.google.com/store/apps/details?id=io.eternl.wallet'
    }
  },
  {
    name: 'Tokeo',
    scheme: 'tokeo://',
    downloadUrl: 'https://tokeo.io/',
    storeLinks: {
      ios: 'https://tokeo.io/',
      android: 'https://tokeo.io/'
    }
  }
];

export default function WalletConnection() {
  const { verifyWallet, isLoading, error, wallet } = useVoteStore();
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectInProgress, setConnectInProgress] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'extension' | 'manual' | 'mobile' | 'qr'>('manual');
  const [manualAddress, setManualAddress] = useState('');
  const [isValidAddress, setIsValidAddress] = useState(false);
  const [connectionRequest, setConnectionRequest] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<typeof walletApps[0] | null>(null);
  
  // MeshSDK hooks
  const wallets = useWalletList();
  const { connect, connected, wallet: meshWallet, disconnect } = useWallet();

  // デフォルトタブをモバイルかどうかで決定
  useEffect(() => {
    if (isMobile()) {
      setActiveTab('mobile');
    }
  }, []);

  // アドレス検証
  useEffect(() => {
    setIsValidAddress(validateCardanoAddress(manualAddress));
  }, [manualAddress]);

  // 接続リクエストIDを生成
  const generateConnectionRequest = () => {
    const requestId = Math.random().toString(36).substring(7);
    const timestamp = Date.now();
    const requestData = {
      id: requestId,
      timestamp,
      origin: window.location.origin,
      type: 'cardano_address_request'
    };
    return JSON.stringify(requestData);
  };

  // ディープリンクでウォレットアプリを開く
  const openWalletApp = (walletApp: typeof walletApps[0]) => {
    const request = generateConnectionRequest();
    setConnectionRequest(request);
    setSelectedWallet(walletApp);
    
    // ディープリンクを構築
    const deepLink = `${walletApp.scheme}connect?request=${encodeURIComponent(request)}`;
    
    try {
      // アプリを開く試行
      window.location.href = deepLink;
      
      // 2秒後にストアにリダイレクト（アプリがない場合）
      setTimeout(() => {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const storeUrl = isIOS ? walletApp.storeLinks.ios : walletApp.storeLinks.android;
        // window.open(storeUrl, '_blank');
      }, 2000);
    } catch (err) {
      console.error('Failed to open wallet app:', err);
      setConnectionError('ウォレットアプリを開けませんでした。アプリがインストールされているか確認してください。');
    }
  };

  // QRコード表示切り替え
  const showQRCode = (walletApp: typeof walletApps[0]) => {
    const request = generateConnectionRequest();
    setConnectionRequest(request);
    setSelectedWallet(walletApp);
    setShowQR(true);
  };

  // URLからアドレスを受信（リダイレクト時）
  useEffect(() => {
    const handleURLParams = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const address = urlParams.get('address');
      const requestId = urlParams.get('request_id');
      
      if (address && requestId) {
        console.log('Received address from wallet app:', address);
        setManualAddress(address);
        if (validateCardanoAddress(address)) {
          handleManualConnect(address);
        }
        // URLをクリーン
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };
    
    handleURLParams();
  }, []);

  // 自動接続の試行
  useEffect(() => {
    const tryConnect = async () => {
      try {
        const saved = localStorage.getItem('wallet');
        const savedAddress = localStorage.getItem('manualWalletAddress');
        
        if (savedAddress && !wallet) {
          console.log('Restoring manual wallet address:', savedAddress);
          await verifyWallet(savedAddress);
          return;
        }
        
        if (!connected && saved && window.cardano && window.cardano[saved]) {
          console.log('Attempting to reconnect wallet:', saved);
          setConnectInProgress(true);
          
          try {
            const api = await window.cardano[saved].enable({ 
              extensions: [{cip: 95}, {cip: 104}] 
            });
            await connect(saved, api);
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

  // 拡張機能ウォレットアドレス検証
  useEffect(() => {
    const verifyAddress = async () => {
      try {
        if (connected && meshWallet && meshWallet.address && !wallet) {
          console.log('Verifying wallet address:', meshWallet.address);
          const success = await verifyWallet(meshWallet.address);
          if (success) {
            localStorage.removeItem('manualWalletAddress');
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
        localStorage.removeItem('manualWalletAddress');
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
  const handleManualConnect = async (address?: string) => {
    const addressToVerify = address || manualAddress;
    
    if (!validateCardanoAddress(addressToVerify)) {
      setConnectionError('有効なCardanoアドレスを入力してください');
      return;
    }

    try {
      setConnectionError(null);
      setConnectInProgress(true);
      
      console.log('Verifying manual wallet address:', addressToVerify);
      const success = await verifyWallet(addressToVerify);
      
      if (success) {
        localStorage.setItem('manualWalletAddress', addressToVerify);
        localStorage.removeItem('wallet');
        setShowQR(false);
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
      setShowQR(false);
      setConnectionRequest(null);
      console.log('Wallet disconnected successfully');
    } catch (err) {
      console.error('Wallet disconnect error:', err);
      setConnectionError('ウォレット切断中にエラーが発生しました');
    }
  };

  // QRコードダイアログ
  if (showQR && connectionRequest && selectedWallet) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <QrCode size={24} className="text-blue-600 mr-2" />
                <CardTitle>{selectedWallet.name}で接続</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQR(false)}
              >
                戻る
              </Button>
            </div>
            <CardDescription>
              QRコードをスキャンして接続してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center p-4 bg-white rounded-lg">
              <QRCode
                value={connectionRequest}
                size={200}
                level="M"
              />
            </div>
            
            <div className="text-center space-y-3">
              <p className="text-sm text-slate-600">
                {selectedWallet.name}アプリでQRコードをスキャンしてください
              </p>
              
              <div className="space-y-2">
                <Button
                  onClick={() => openWalletApp(selectedWallet)}
                  className="w-full"
                  size="sm"
                >
                  <ExternalLink size={16} className="mr-2" />
                  {selectedWallet.name}アプリを開く
                </Button>
                
                <Button
                  onClick={() => navigator.clipboard.writeText(connectionRequest)}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  <Copy size={16} className="mr-2" />
                  接続データをコピー
                </Button>
              </div>
            </div>
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
              <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-md">
                <button
                  onClick={() => setActiveTab('manual')}
                  className={`flex-1 flex items-center justify-center py-2 px-2 rounded text-xs font-medium transition-colors ${
                    activeTab === 'manual' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Edit3 size={14} className="mr-1" />
                  手動入力
                </button>
                <button
                  onClick={() => setActiveTab('mobile')}
                  className={`flex-1 flex items-center justify-center py-2 px-2 rounded text-xs font-medium transition-colors ${
                    activeTab === 'mobile' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone size={14} className="mr-1" />
                  アプリ連携
                </button>
                <button
                  onClick={() => setActiveTab('extension')}
                  className={`flex-1 flex items-center justify-center py-2 px-2 rounded text-xs font-medium transition-colors ${
                    activeTab === 'extension' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <WalletIcon size={14} className="mr-1" />
                  拡張機能
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
                    onClick={() => handleManualConnect()}
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

              {/* モバイルアプリ連携タブ */}
              {activeTab === 'mobile' && (
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded-md text-sm">
                    <div className="flex items-center mb-2">
                      <Smartphone size={16} className="text-blue-600 mr-2" />
                      <p className="font-medium text-blue-800">🚀 ワンタップ接続</p>
                    </div>
                    <p className="text-blue-700 mb-3">
                      ウォレットアプリに直接接続してコピペ不要で投票参加！
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {walletApps.map((walletApp) => (
                      <div key={walletApp.name} className="space-y-2">
                        <Button
                          onClick={() => openWalletApp(walletApp)}
                          variant="outline"
                          className="w-full text-xs"
                          size="sm"
                        >
                          <ExternalLink size={14} className="mr-1" />
                          {walletApp.name}
                        </Button>
                        <Button
                          onClick={() => showQRCode(walletApp)}
                          variant="outline"
                          className="w-full text-xs"
                          size="sm"
                        >
                          <QrCode size={14} className="mr-1" />
                          QR
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-xs text-slate-500 text-center">
                    アプリが開かない場合は手動入力をお試しください
                  </div>
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