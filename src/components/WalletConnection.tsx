import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WalletIcon, AlertCircle, Smartphone, Monitor, QrCode, CheckCircle, ArrowLeft, Loader2, Copy, HelpCircle } from 'lucide-react';
import QRCode from 'react-qr-code';
import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/Card';
import { useVoteStore } from '../store/voteStore';
import { truncateAddress, normalizeCardanoAddress, isCardanoAddressFormatValid } from '../lib/utils';
import { useWalletList, useWallet } from '@meshsdk/react';

// Cardanoアドレスの基本的な検証（更新版）
const validateCardanoAddress = (address: string): boolean => {
  return isCardanoAddressFormatValid(address);
};

// モバイル検出
const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

type ConnectionStep = 'main' | 'manual' | 'qr' | 'connecting' | 'success';

export default function WalletConnection() {
  const { verifyWallet, isLoading, error, wallet } = useVoteStore();
  const [connectionStep, setConnectionStep] = useState<ConnectionStep>('main');
  const [detectedWallets, setDetectedWallets] = useState<any[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [manualAddress, setManualAddress] = useState('');
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
    
    // デスクトップの場合のみウォレット検出
    if (!isMobileDevice) {
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
    }
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
      
      // アドレスを取得
      const addresses = await api.getUsedAddresses();
      if (!addresses || addresses.length === 0) {
        const unusedAddresses = await api.getUnusedAddresses();
        if (!unusedAddresses || unusedAddresses.length === 0) {
          throw new Error('ウォレットアドレスを取得できませんでした');
        }
        addresses.push(unusedAddresses[0]);
      }
      
      const addressHex = addresses[0];
      console.log('Got raw address:', addressHex);
      
      // HexアドレスをBech32に正規化
      const normalizedAddress = await normalizeCardanoAddress(addressHex);
      console.log('Normalized address:', normalizedAddress);
      
      // アドレスの基本検証
      if (!validateCardanoAddress(normalizedAddress) && !validateCardanoAddress(addressHex)) {
        throw new Error('取得されたアドレスの形式が無効です');
      }
      
      console.log('Verifying address:', normalizedAddress);
      
      // 正規化されたアドレスで検証を試行、失敗したらHexアドレスで試行
      let success = await verifyWallet(normalizedAddress);
      if (!success && normalizedAddress !== addressHex) {
        console.log('Trying with hex address:', addressHex);
        success = await verifyWallet(addressHex);
      }
      
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
    } finally {
      setConnecting(false);
    }
  };

  // 自動接続の試行（デスクトップのみ）
  const handleAutoConnect = async () => {
    if (mobile) {
      setConnectionError('モバイルでは拡張機能による自動接続はできません。手動入力をご利用ください。');
      return;
    }
    
    setConnectionError(null);
    setConnectionStep('connecting');
    
    try {
      if (detectedWallets.length === 0) {
        setConnectionError('ウォレット拡張機能が検出されませんでした。手動入力をお試しください。');
        setConnectionStep('main');
        return;
      }
      
      const firstWallet = detectedWallets[0];
      console.log('Auto-connecting to:', firstWallet.name);
      
      await handleDirectWalletConnect(firstWallet);
      
    } catch (err) {
      console.error('Auto connect failed:', err);
      setConnectionError('自動接続に失敗しました。手動入力をお試しください。');
      setConnectionStep('main');
    }
  };

  // 手動ウォレット接続
  const handleWalletConnect = async (walletData: any) => {
    await handleDirectWalletConnect(walletData);
  };

  // 手動アドレス入力で接続
  const handleManualAddressConnect = async () => {
    if (!validateCardanoAddress(manualAddress)) {
      setConnectionError('有効なCardanoアドレスを入力してください（addr1...で始まるBech32形式推奨）');
      return;
    }

    setConnectionError(null);
    setConnecting(true);
    
    try {
      // アドレスを正規化
      const normalizedAddress = await normalizeCardanoAddress(manualAddress);
      
      // 正規化されたアドレスで検証を試行
      const success = await verifyWallet(normalizedAddress);
      if (success) {
        localStorage.setItem('manualWalletAddress', normalizedAddress);
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

  // QRコード表示（制約付き）
  const showQRCode = () => {
    const connectUrl = `${window.location.href}?connect=qr&t=${Date.now()}`;
    setConnectionRequest(connectUrl);
    setConnectionStep('qr');
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
      setConnectionStep('main');
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

  // QRコード表示（制約の説明付き）
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
                onClick={() => setConnectionStep('main')}
                className="p-1"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                QRコード表示
              </CardTitle>
              <div className="w-8" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <h4 className="font-medium text-yellow-900 mb-2">⚠️ 重要なお知らせ</h4>
                  <p className="text-yellow-800 mb-2">
                    現在のWeb技術の制約により、QRコード読み取り後の自動接続は限定的です。
                  </p>
                  <p className="text-yellow-800">
                    <strong>手動アドレス入力</strong>が最も確実な方法です。
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border-2 border-gray-100 flex justify-center">
              <QRCode
                value={connectionRequest || window.location.href}
                size={200}
                level="M"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <QrCode className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <h4 className="font-medium text-blue-900 mb-2">📱 QRコードの使用について</h4>
                  <p className="text-blue-800 mb-2">
                    一部のウォレットアプリでQRコードを読み取り可能ですが、自動接続は保証されません。
                  </p>
                  <p className="text-blue-800">
                    読み取り後、手動でアドレスをコピーして入力することをお勧めします。
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center space-y-2">
              <Button
                onClick={() => setConnectionStep('manual')}
                className="w-full"
              >
                手動アドレス入力に戻る
              </Button>
              <Button
                onClick={() => setConnectionStep('main')}
                variant="link"
                size="sm"
                className="text-gray-500"
              >
                メインに戻る
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

          {/* モバイルでの制約説明 */}
          {mobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <h4 className="font-medium text-blue-900 mb-2">📱 モバイルでのご利用について</h4>
                  <p className="text-blue-800 mb-2">
                    現在のWeb技術の制約により、スマートフォンでのウォレットアプリとの直接連携は困難です。
                  </p>
                  <p className="text-blue-800">
                    <strong>手動アドレス入力</strong>が最も確実で推奨される方法です。
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {connectionStep === 'main' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* 手動入力（最優先・推奨） */}
                <Button
                  onClick={() => setConnectionStep('manual')}
                  className="w-full py-4 text-lg font-medium"
                  size="lg"
                >
                  <Copy className="w-5 h-5 mr-3" />
                  手動でアドレス入力（推奨）
                </Button>

                <div className="text-center">
                  <p className="text-sm text-green-600 font-medium">✅ 最も確実で簡単な方法</p>
                </div>

                {/* PC専用: ワンクリック接続 */}
                {!mobile && detectedWallets.length > 0 && (
                  <>
                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-600 text-center mb-3">PC拡張機能が検出されました</p>
                      <Button
                        onClick={handleAutoConnect}
                        variant="outline"
                        className="w-full py-3"
                        disabled={isLoading || connecting}
                      >
                        <WalletIcon className="w-4 h-4 mr-2" />
                        ワンクリック接続
                      </Button>
                      <div className="text-center mt-2">
                        <p className="text-xs text-gray-500">
                          検出: {detectedWallets.map(w => `${w.icon} ${w.name}`).join(', ')}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* PC専用: 拡張機能未検出の場合 */}
                {!mobile && detectedWallets.length === 0 && (
                  <div className="border-t pt-4">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
                      <div className="flex items-start gap-2">
                        <Monitor className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-700 mb-1">PC拡張機能</p>
                          <p className="text-gray-600 text-xs">
                            ウォレット拡張機能が検出されませんでした。
                            Nami、Eternl、Tokeoなどの拡張機能をインストールしてページを再読み込みしてください。
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* その他のオプション */}
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 text-center mb-3">その他のオプション</p>
                  <Button
                    onClick={() => showQRCode()}
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 py-3"
                  >
                    <QrCode className="w-4 h-4" />
                    QRコード表示（制約あり）
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-1">
                    技術的制約により自動接続は限定的です
                  </p>
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
                    onClick={() => setConnectionStep('main')}
                    className="p-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <h3 className="font-medium">手動アドレス入力</h3>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <h4 className="font-medium text-green-900 mb-2">✅ 推奨方法</h4>
                      <ol className="space-y-1 text-green-800 text-sm">
                        <li>1️⃣ ウォレットアプリまたは拡張機能を開く</li>
                        <li>2️⃣ 受信アドレス（Receiving Address）をコピー</li>
                        <li>3️⃣ 下の入力欄に貼り付け</li>
                        <li>4️⃣ 「アドレスで接続」をクリック</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* 検出されたウォレット（PC専用） */}
                {!mobile && detectedWallets.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">または：ブラウザ拡張機能で接続</p>
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
                    <div className="border-t my-4"></div>
                  </div>
                )}

                {/* 手動アドレス入力 */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">Cardanoアドレス</label>
                  <input
                    type="text"
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    placeholder="addr1... または Hexアドレス"
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

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs">
                  <p className="text-gray-600">
                    <strong>対応形式:</strong> Bech32（addr1...）またはHex形式のアドレス
                  </p>
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