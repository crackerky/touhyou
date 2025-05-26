import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WalletIcon, AlertCircle, Smartphone, Monitor, QrCode, CheckCircle, ExternalLink, Copy, ArrowLeft, Loader2 } from 'lucide-react';
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
    name: 'Nami',
    icon: '🦎',
    scheme: 'nami://connect',
    deepLink: 'nami://dapp-connector',
    downloadUrl: 'https://namiwallet.io/',
    storeLinks: {
      ios: 'https://apps.apple.com/app/nami-wallet/id1634415647',
      android: 'https://play.google.com/store/apps/details?id=io.namiwalletapp'
    }
  },
  {
    name: 'Yoroi',
    icon: '🌸',
    scheme: 'yoroi://connect',
    deepLink: 'yoroi://connect',
    downloadUrl: 'https://yoroi-wallet.com/',
    storeLinks: {
      ios: 'https://apps.apple.com/app/emurgo-yoroi-cardano-wallet/id1447326389',
      android: 'https://play.google.com/store/apps/details?id=com.emurgo'
    }
  },
  {
    name: 'Eternl',
    icon: '⚡',
    scheme: 'eternl://connect',
    deepLink: 'eternl://dapp',
    downloadUrl: 'https://eternl.io/',
    storeLinks: {
      ios: 'https://apps.apple.com/app/eternl/id1620075109',
      android: 'https://play.google.com/store/apps/details?id=io.eternl.wallet'
    }
  },
  {
    name: 'Tokeo',
    icon: '🚀',
    scheme: 'ccvault://connect',
    deepLink: 'ccvault://dapp-connector',
    downloadUrl: 'https://tokeo.io/',
    storeLinks: {
      ios: 'https://apps.apple.com/app/tokeo/id1549849943',
      android: 'https://play.google.com/store/apps/details?id=io.ccvault.app'
    }
  }
];

type ConnectionStep = 'auto' | 'manual' | 'qr' | 'mobile' | 'connecting' | 'success';

export default function WalletConnection() {
  const { verifyWallet, isLoading, error, wallet } = useVoteStore();
  const [connectionStep, setConnectionStep] = useState<ConnectionStep>('auto');
  const [detectedWallets, setDetectedWallets] = useState<any[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [manualAddress, setManualAddress] = useState('');
  const [selectedWallet, setSelectedWallet] = useState<typeof walletApps[0] | null>(null);
  const [showQRInstructions, setShowQRInstructions] = useState(false);
  const [connectionRequest, setConnectionRequest] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // MeshSDK hooks
  const wallets = useWalletList();
  const { connect, connected, wallet: meshWallet, disconnect } = useWallet();

  // ウォレット検出（デスクトップ専用）
  useEffect(() => {
    const isMobileDevice = isMobile();
    setMobile(isMobileDevice);
    
    // モバイルの場合は自動的にモバイル専用フローに
    if (isMobileDevice) {
      setConnectionStep('mobile');
      return;
    }
    
    // デスクトップの場合のみウォレット検出
    const detectDesktopWallets = () => {
      const detected = [];
      
      if (typeof window !== 'undefined' && window.cardano) {
        const walletNames = ['nami', 'yoroi', 'eternl', 'ccvault', 'flint'];
        
        walletNames.forEach(name => {
          if (window.cardano[name]) {
            const displayName = name === 'ccvault' ? 'Tokeo' : name.charAt(0).toUpperCase() + name.slice(1);
            const icon = name === 'nami' ? '🦎' : 
                        name === 'yoroi' ? '🌸' : 
                        name === 'eternl' ? '⚡' : 
                        name === 'ccvault' ? '🚀' : '💳';
                        
            detected.push({
              id: name,
              name: displayName,
              icon: icon,
              api: window.cardano[name],
              isEnabled: window.cardano[name].isEnabled
            });
          }
        });
      }
      
      console.log('Detected desktop wallets:', detected);
      setDetectedWallets(detected);
    };
    
    detectDesktopWallets();
    
    // ページ読み込み後に再検出
    const timer = setTimeout(detectDesktopWallets, 1000);
    return () => clearTimeout(timer);
  }, []);

  // 自動復元の試行（デスクトップのみ）
  useEffect(() => {
    if (mobile || wallet) return; // モバイルまたは既に接続済み
    
    const tryAutoRestore = async () => {
      try {
        const savedAddress = localStorage.getItem('manualWalletAddress');
        const savedWallet = localStorage.getItem('wallet');
        
        if (savedAddress) {
          console.log('Restoring manual wallet address:', savedAddress);
          const success = await verifyWallet(savedAddress);
          if (success) {
            setConnectionStep('success');
          }
          return;
        }
        
        if (savedWallet && detectedWallets.length > 0) {
          const savedWalletData = detectedWallets.find(w => w.id === savedWallet.toLowerCase());
          if (savedWalletData) {
            console.log('Attempting to reconnect wallet:', savedWallet);
            await handleDirectWalletConnect(savedWalletData);
          }
        }
      } catch (err) {
        console.error('Auto-restore failed:', err);
        localStorage.removeItem('wallet');
        localStorage.removeItem('manualWalletAddress');
      }
    };
    
    if (detectedWallets.length > 0) {
      tryAutoRestore();
    }
  }, [detectedWallets, wallet, verifyWallet, mobile]);

  // 直接ウォレット接続（デスクトップ専用）
  const handleDirectWalletConnect = async (walletData: any) => {
    try {
      setConnecting(true);
      setConnectionError(null);
      
      console.log('Connecting to wallet:', walletData.name);
      
      const api = await walletData.api.enable({
        extensions: [{ cip: 95 }]
      });
      
      console.log('Wallet API enabled:', api);
      
      const addresses = await api.getUsedAddresses();
      if (!addresses || addresses.length === 0) {
        const unusedAddresses = await api.getUnusedAddresses();
        if (!unusedAddresses || unusedAddresses.length === 0) {
          throw new Error('ウォレットアドレスを取得できませんでした');
        }
        addresses.push(unusedAddresses[0]);
      }
      
      const addressHex = addresses[0];
      console.log('Got address hex:', addressHex);
      
      let addressBech32 = addressHex;
      if (addressHex.startsWith('01') || addressHex.startsWith('00')) {
        addressBech32 = addressHex;
      }
      
      console.log('Verifying address:', addressBech32);
      
      const success = await verifyWallet(addressBech32);
      
      if (success) {
        localStorage.setItem('wallet', walletData.id);
        localStorage.removeItem('manualWalletAddress');
        setConnectionStep('success');
        console.log('Wallet connected successfully');
      } else {
        throw new Error('ウォレットの検証に失敗しました');
      }
      
    } catch (err) {
      console.error('Direct wallet connection failed:', err);
      setConnectionError(err instanceof Error ? err.message : 'ウォレット接続に失敗しました');
      setConnectionStep('manual');
    } finally {
      setConnecting(false);
    }
  };

  // 自動接続の試行（デスクトップのみ）
  const handleAutoConnect = async () => {
    if (mobile) {
      setConnectionStep('mobile');
      return;
    }
    
    setConnectionError(null);
    setConnectionStep('connecting');
    
    try {
      if (detectedWallets.length === 0) {
        setConnectionError('ウォレットが検出されませんでした');
        setConnectionStep('manual');
        return;
      }
      
      const firstWallet = detectedWallets[0];
      console.log('Auto-connecting to:', firstWallet.name);
      
      await handleDirectWalletConnect(firstWallet);
      
    } catch (err) {
      console.error('Auto connect failed:', err);
      setConnectionError('自動接続に失敗しました');
      setConnectionStep('manual');
    }
  };

  // モバイル用ディープリンク
  const openWalletApp = (walletApp: typeof walletApps[0]) => {
    const deepLink = `${walletApp.deepLink}?origin=${encodeURIComponent(window.location.origin)}&return=${encodeURIComponent(window.location.href)}`;
    
    console.log('Opening wallet app with deep link:', deepLink);
    
    try {
      // アプリを開く試行
      window.location.href = deepLink;
      
      // 3秒後にストアにリダイレクト（アプリがない場合）
      setTimeout(() => {
        if (document.hidden) return; // アプリが開いた場合はスキップ
        
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const storeUrl = isIOS ? walletApp.storeLinks.ios : walletApp.storeLinks.android;
        
        const shouldRedirect = confirm(
          `${walletApp.name}アプリが見つかりませんでした。\nアプリストアでダウンロードしますか？`
        );
        
        if (shouldRedirect) {
          window.open(storeUrl, '_blank');
        }
      }, 3000);
    } catch (err) {
      console.error('Failed to open wallet app:', err);
      setConnectionError('ウォレットアプリを開けませんでした。手動入力をお試しください。');
    }
  };

  // 手動ウォレット接続
  const handleWalletConnect = async (walletData: any) => {
    await handleDirectWalletConnect(walletData);
  };

  // 手動アドレス入力で接続
  const handleManualAddressConnect = async () => {
    if (!validateCardanoAddress(manualAddress)) {
      setConnectionError('有効なCardanoアドレスを入力してください');
      return;
    }

    setConnectionError(null);
    setConnecting(true);
    
    try {
      const success = await verifyWallet(manualAddress);
      if (success) {
        localStorage.setItem('manualWalletAddress', manualAddress);
        localStorage.removeItem('wallet');
        setConnectionStep('success');
      } else {
        setConnectionError('アドレスの検証に失敗しました');
      }
    } catch (err) {
      console.error('Manual address verification error:', err);
      setConnectionError('アドレス検証中にエラーが発生しました');
    } finally {
      setConnecting(false);
    }
  };

  // QRコード表示
  const showQRCode = (walletApp?: typeof walletApps[0]) => {
    const connectUrl = `${window.location.href}?connect=qr&t=${Date.now()}`;
    setConnectionRequest(connectUrl);
    if (walletApp) {
      setSelectedWallet(walletApp);
    }
    setConnectionStep('qr');
    setShowQRInstructions(true);
  };

  // ウォレット切断
  const handleDisconnect = async () => {
    try {
      if (connected) {
        await disconnect();
      }
      localStorage.removeItem('wallet');
      localStorage.removeItem('manualWalletAddress');
      setManualAddress('');
      setConnectionStep(mobile ? 'mobile' : 'auto');
      console.log('Wallet disconnected successfully');
    } catch (err) {
      console.error('Wallet disconnect error:', err);
      setConnectionError('ウォレット切断中にエラーが発生しました');
    }
  };

  // 接続成功時
  if (wallet) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">接続完了！</h2>
              <p className="text-gray-600 mb-4">
                ウォレットアドレス: {truncateAddress(wallet)}
              </p>
              <Button
                onClick={handleDisconnect}
                variant="outline"
                size="sm"
                className="mb-4"
              >
                ウォレットを変更
              </Button>
            </div>
          </CardContent>
          <CardFooter className="text-xs text-slate-500 justify-center">
            🎯 アドレス収集目的：投票参加者にNFTを配布します
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  // 接続中
  if (connectionStep === 'connecting' || connecting) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">接続中...</h2>
              <p className="text-gray-600">ウォレットからの承認をお待ちください</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // QRコード表示
  if (connectionStep === 'qr') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConnectionStep(mobile ? 'mobile' : 'auto')}
                className="p-1"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                QRコード接続
              </CardTitle>
              <div className="w-8" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg border-2 border-gray-100 flex justify-center">
              <QRCode
                value={connectionRequest || window.location.href}
                size={200}
                level="M"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <QrCode className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <h4 className="font-medium text-blue-900 mb-2">📱 スマホでの接続方法</h4>
                  <ol className="space-y-1 text-blue-800">
                    <li>1️⃣ ウォレットアプリを起動</li>
                    <li>2️⃣ 「スキャン」または「WalletConnect」を選択</li>
                    <li>3️⃣ 上のQRコードを読み取り</li>
                    <li>4️⃣ アプリでアドレスを確認して接続</li>
                  </ol>
                </div>
              </div>
            </motion.div>

            <div className="text-center">
              <Button
                onClick={() => setConnectionStep(mobile ? 'mobile' : 'manual')}
                variant="link"
                size="sm"
                className="text-gray-500"
              >
                他の方法を試す
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // モバイル専用画面
  if (connectionStep === 'mobile') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <div className="text-center">
              <Smartphone className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <CardTitle>📱 スマホでウォレット接続</CardTitle>
              <CardDescription>
                インストール済みのウォレットアプリで投票に参加
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {(error || connectionError) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error || connectionError}</span>
                </div>
              </motion.div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">🚀 ワンタップ接続</h3>
              <p className="text-sm text-blue-800 mb-4">
                ウォレットアプリに直接接続してコピペ不要で投票参加！
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {walletApps.map((walletApp) => (
                <Button
                  key={walletApp.name}
                  onClick={() => openWalletApp(walletApp)}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center gap-2 p-4"
                >
                  <span className="text-2xl">{walletApp.icon}</span>
                  <div className="text-center">
                    <div className="font-medium">{walletApp.name}</div>
                    <div className="text-xs text-gray-500">アプリで開く</div>
                  </div>
                </Button>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <p className="text-sm text-gray-600 text-center mb-3">アプリが開かない場合</p>
              
              <Button
                onClick={() => showQRCode()}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                QRコードで接続
              </Button>

              <Button
                onClick={() => setConnectionStep('manual')}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                手動でアドレス入力
              </Button>
            </div>

            <div className="text-center text-xs text-gray-500">
              💡 Tokeoアプリがある場合は「Tokeo」ボタンをタップ
            </div>
          </CardContent>
          <CardFooter className="text-xs text-slate-500 justify-center">
            🎯 アドレス収集目的：投票参加者にNFTを配布します
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  // デスクトップ用メイン接続画面
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <Card>
        <CardHeader>
          <div className="text-center">
            <WalletIcon className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <CardTitle>ウォレットを接続</CardTitle>
            <CardDescription>
              投票に参加するためにCardanoウォレットアドレスが必要です
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {(error || connectionError) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error || connectionError}</span>
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {connectionStep === 'auto' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* ワンクリック接続（最優先） */}
                <Button
                  onClick={handleAutoConnect}
                  className="w-full py-4 text-lg font-medium"
                  size="lg"
                  disabled={isLoading || connecting}
                >
                  <WalletIcon className="w-5 h-5 mr-3" />
                  ワンクリック接続（推奨）
                </Button>

                {detectedWallets.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-center text-gray-600"
                  >
                    検出されたウォレット: {detectedWallets.map(w => `${w.icon} ${w.name}`).join(', ')}
                  </motion.div>
                )}

                {detectedWallets.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-center text-gray-500"
                  >
                    ウォレット拡張機能が検出されませんでした
                  </motion.div>
                )}

                {/* その他の方法 */}
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 text-center mb-3">うまくいかない場合</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => setConnectionStep('manual')}
                      variant="outline"
                      className="flex items-center justify-center gap-2 py-3"
                    >
                      <Monitor className="w-4 h-4" />
                      手動選択
                    </Button>
                    <Button
                      onClick={() => showQRCode()}
                      variant="outline"
                      className="flex items-center justify-center gap-2 py-3"
                    >
                      <Smartphone className="w-4 h-4" />
                      QRコード
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {connectionStep === 'manual' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConnectionStep('auto')}
                    className="p-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <h3 className="font-medium">手動接続</h3>
                </div>

                {/* 検出されたウォレット */}
                {detectedWallets.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">ブラウザ拡張機能</p>
                    {detectedWallets.map((detectedWallet) => (
                      <Button
                        key={detectedWallet.id}
                        onClick={() => handleWalletConnect(detectedWallet)}
                        variant="outline"
                        className="w-full flex items-center justify-between p-4"
                        disabled={isLoading || connecting}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{detectedWallet.icon}</span>
                          <span>{detectedWallet.name}</span>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </Button>
                    ))}
                  </div>
                )}

                {/* 手動アドレス入力 */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">アドレス直接入力</p>
                  <input
                    type="text"
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    placeholder="addr1..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <Button
                    onClick={handleManualAddressConnect}
                    className="w-full"
                    disabled={!validateCardanoAddress(manualAddress) || isLoading || connecting}
                  >
                    アドレスで接続
                  </Button>
                </div>

                {/* QRコードボタン */}
                <div className="text-center">
                  <Button
                    onClick={() => showQRCode()}
                    variant="link"
                    size="sm"
                    className="text-blue-600"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    QRコードを表示
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        <CardFooter className="text-xs text-slate-500 justify-center">
          🎯 アドレス収集目的：投票参加者にNFTを配布します
        </CardFooter>
      </Card>
    </motion.div>
  );
}