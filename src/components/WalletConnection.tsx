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
    scheme: 'nami://',
    downloadUrl: 'https://namiwallet.io/',
    storeLinks: {
      ios: 'https://apps.apple.com/app/nami-wallet/id1634415647',
      android: 'https://namiwallet.io/'
    }
  },
  {
    name: 'Yoroi',
    icon: '🌸',
    scheme: 'yoroi://',
    downloadUrl: 'https://yoroi-wallet.com/',
    storeLinks: {
      ios: 'https://apps.apple.com/app/emurgo-yoroi-cardano-wallet/id1447326389',
      android: 'https://play.google.com/store/apps/details?id=com.emurgo'
    }
  },
  {
    name: 'Eternl',
    icon: '⚡',
    scheme: 'eternl://',
    downloadUrl: 'https://eternl.io/',
    storeLinks: {
      ios: 'https://apps.apple.com/app/eternl/id1620075109',
      android: 'https://play.google.com/store/apps/details?id=io.eternl.wallet'
    }
  },
  {
    name: 'Tokeo',
    icon: '🚀',
    scheme: 'tokeo://',
    downloadUrl: 'https://tokeo.io/',
    storeLinks: {
      ios: 'https://tokeo.io/',
      android: 'https://tokeo.io/'
    }
  }
];

type ConnectionStep = 'auto' | 'manual' | 'qr' | 'connecting' | 'success';

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

  // MeshSDK hooks
  const wallets = useWalletList();
  const { connect, connected, wallet: meshWallet, disconnect } = useWallet();

  useEffect(() => {
    setMobile(isMobile());
    
    // ウォレット検出
    const detected = [];
    if (typeof window !== 'undefined' && window.cardano) {
      if (window.cardano.nami) detected.push({ name: 'Nami', icon: '🦎', api: window.cardano.nami });
      if (window.cardano.yoroi) detected.push({ name: 'Yoroi', icon: '🌸', api: window.cardano.yoroi });
      if (window.cardano.eternl) detected.push({ name: 'Eternl', icon: '⚡', api: window.cardano.eternl });
      if (window.cardano.ccvault) detected.push({ name: 'Tokeo', icon: '🚀', api: window.cardano.ccvault });
    }
    setDetectedWallets(detected);
  }, []);

  // 自動復元の試行
  useEffect(() => {
    const tryAutoRestore = async () => {
      try {
        const savedAddress = localStorage.getItem('manualWalletAddress');
        const savedWallet = localStorage.getItem('wallet');
        
        if (savedAddress && !wallet) {
          console.log('Restoring manual wallet address:', savedAddress);
          await verifyWallet(savedAddress);
          setConnectionStep('success');
          return;
        }
        
        if (!connected && savedWallet && detectedWallets.some(w => w.name.toLowerCase() === savedWallet)) {
          console.log('Attempting to reconnect wallet:', savedWallet);
          setConnectionStep('connecting');
          try {
            await connect(savedWallet);
            setConnectionStep('success');
          } catch (enableError) {
            console.error('Auto reconnect failed:', enableError);
            localStorage.removeItem('wallet');
            setConnectionStep('auto');
          }
        }
      } catch (err) {
        console.error('Auto-restore failed:', err);
        setConnectionStep('auto');
      }
    };
    
    if (!wallet && detectedWallets.length > 0) {
      tryAutoRestore();
    }
  }, [detectedWallets, connected, connect, verifyWallet, wallet]);

  // MeshSDKウォレット接続時の検証
  useEffect(() => {
    const verifyMeshWallet = async () => {
      try {
        if (connected && meshWallet && meshWallet.address && !wallet) {
          console.log('Verifying mesh wallet address:', meshWallet.address);
          setConnectionStep('connecting');
          const success = await verifyWallet(meshWallet.address);
          if (success) {
            localStorage.removeItem('manualWalletAddress');
            setConnectionStep('success');
          } else {
            setConnectionError('ウォレット検証に失敗しました');
            setConnectionStep('auto');
          }
        }
      } catch (err) {
        console.error('Mesh wallet verification error:', err);
        setConnectionError('ウォレット検証中にエラーが発生しました');
        setConnectionStep('auto');
      }
    };
    
    verifyMeshWallet();
  }, [connected, meshWallet, verifyWallet, wallet]);

  // 自動接続の試行
  const handleAutoConnect = async () => {
    setConnectionError(null);
    setConnectionStep('connecting');
    
    try {
      if (detectedWallets.length === 1) {
        // 1つだけ検出された場合は自動接続
        const walletName = detectedWallets[0].name;
        await connect(walletName);
        localStorage.setItem('wallet', walletName);
        localStorage.removeItem('manualWalletAddress');
      } else if (detectedWallets.length > 1) {
        // 複数ある場合は最初のウォレットで試行
        const walletName = detectedWallets[0].name;
        await connect(walletName);
        localStorage.setItem('wallet', walletName);
        localStorage.removeItem('manualWalletAddress');
      } else {
        // 検出されない場合は手動選択へ
        setConnectionStep('manual');
        return;
      }
    } catch (err) {
      console.error('Auto connect failed:', err);
      setConnectionError('自動接続に失敗しました');
      setConnectionStep('manual');
    }
  };

  // 手動ウォレット接続
  const handleWalletConnect = async (walletName: string) => {
    setConnectionError(null);
    setConnectionStep('connecting');
    
    try {
      await connect(walletName);
      localStorage.setItem('wallet', walletName);
      localStorage.removeItem('manualWalletAddress');
    } catch (err) {
      console.error('Manual wallet connect failed:', err);
      setConnectionError(`${walletName}の接続に失敗しました`);
      setConnectionStep('manual');
    }
  };

  // 手動アドレス入力で接続
  const handleManualAddressConnect = async () => {
    if (!validateCardanoAddress(manualAddress)) {
      setConnectionError('有効なCardanoアドレスを入力してください');
      return;
    }

    setConnectionError(null);
    setConnectionStep('connecting');
    
    try {
      const success = await verifyWallet(manualAddress);
      if (success) {
        localStorage.setItem('manualWalletAddress', manualAddress);
        localStorage.removeItem('wallet');
        setConnectionStep('success');
      } else {
        setConnectionError('アドレスの検証に失敗しました');
        setConnectionStep('manual');
      }
    } catch (err) {
      console.error('Manual address verification error:', err);
      setConnectionError('アドレス検証中にエラーが発生しました');
      setConnectionStep('manual');
    }
  };

  // QRコード表示
  const showQRCode = (walletApp?: typeof walletApps[0]) => {
    const request = Math.random().toString(36).substring(7);
    setConnectionRequest(request);
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
        localStorage.removeItem('wallet');
      }
      localStorage.removeItem('manualWalletAddress');
      setManualAddress('');
      setConnectionStep('auto');
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
  if (connectionStep === 'connecting') {
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
                onClick={() => setConnectionStep('auto')}
                className="p-1"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
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

            {showQRInstructions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-blue-50 border border-blue-200 rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <h4 className="font-medium text-blue-900 mb-2">📱 スマホでの接続方法</h4>
                    <ol className="space-y-1 text-blue-800">
                      <li>1️⃣ ウォレットアプリを起動</li>
                      <li>2️⃣ 「スキャン」または「QRコード」を選択</li>
                      <li>3️⃣ 上のQRコードを読み取り</li>
                      <li>4️⃣ アプリの指示に従って接続</li>
                    </ol>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {walletApps.map((walletApp) => (
                <Button
                  key={walletApp.name}
                  onClick={() => setSelectedWallet(walletApp)}
                  variant="outline"
                  className="p-3 h-auto flex flex-col items-center gap-1"
                >
                  <span className="text-lg">{walletApp.icon}</span>
                  <span className="text-xs">{walletApp.name}</span>
                </Button>
              ))}
            </div>

            <div className="text-center">
              <Button
                onClick={() => setConnectionStep('manual')}
                variant="link"
                size="sm"
                className="text-gray-500"
              >
                手動入力に戻る
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // メイン接続画面
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
                  disabled={isLoading}
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
                        key={detectedWallet.name}
                        onClick={() => handleWalletConnect(detectedWallet.name)}
                        variant="outline"
                        className="w-full flex items-center justify-between p-4"
                        disabled={isLoading}
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
                    disabled={!validateCardanoAddress(manualAddress) || isLoading}
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