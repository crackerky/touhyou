import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface WalletInfo {
  name: string;
  icon: string;
  apiVersion: string;
  enable: () => Promise<CardanoAPI>;
  isEnabled: () => Promise<boolean>;
}

interface CardanoAPI {
  getNetworkId: () => Promise<number>;
  getUtxos: () => Promise<string[]>;
  getBalance: () => Promise<string>;
  getUsedAddresses: () => Promise<string[]>;
  getUnusedAddresses: () => Promise<string[]>;
  getChangeAddress: () => Promise<string>;
  getRewardAddresses: () => Promise<string[]>;
  signTx: (tx: string, partialSign?: boolean) => Promise<string>;
  signData: (address: string, payload: string) => Promise<{ signature: string; key: string }>;
  submitTx: (tx: string) => Promise<string>;
}

interface NFTAsset {
  unit: string;
  quantity: string;
  policy_id: string;
  asset_name: string;
  fingerprint: string;
  metadata?: any;
}

interface WalletState {
  isConnected: boolean;
  walletName: string | null;
  walletApi: CardanoAPI | null;
  address: string | null;
  balance: string | null;
  assets: NFTAsset[];
  isLoading: boolean;
  error: string | null;
}

export function useCardanoWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    walletName: null,
    walletApi: null,
    address: null,
    balance: null,
    assets: [],
    isLoading: false,
    error: null
  });

  // 利用可能なウォレットを検出
  const getAvailableWallets = useCallback((): WalletInfo[] => {
    const wallets: WalletInfo[] = [];
    
    if (typeof window !== 'undefined' && window.cardano) {
      // Nami Wallet
      if (window.cardano.nami) {
        wallets.push({
          name: 'Nami',
          icon: '🦋',
          apiVersion: window.cardano.nami.apiVersion || '1.0.0',
          enable: () => window.cardano.nami.enable(),
          isEnabled: () => window.cardano.nami.isEnabled()
        });
      }

      // Eternl Wallet
      if (window.cardano.eternl) {
        wallets.push({
          name: 'Eternl',
          icon: '♾️',
          apiVersion: window.cardano.eternl.apiVersion || '1.0.0',
          enable: () => window.cardano.eternl.enable(),
          isEnabled: () => window.cardano.eternl.isEnabled()
        });
      }

      // Flint Wallet
      if (window.cardano.flint) {
        wallets.push({
          name: 'Flint',
          icon: '🔥',
          apiVersion: window.cardano.flint.apiVersion || '1.0.0',
          enable: () => window.cardano.flint.enable(),
          isEnabled: () => window.cardano.flint.isEnabled()
        });
      }

      // Typhon Wallet
      if (window.cardano.typhon) {
        wallets.push({
          name: 'Typhon',
          icon: '🌪️',
          apiVersion: window.cardano.typhon.apiVersion || '1.0.0',
          enable: () => window.cardano.typhon.enable(),
          isEnabled: () => window.cardano.typhon.isEnabled()
        });
      }

      // Gero Wallet
      if (window.cardano.gerowallet) {
        wallets.push({
          name: 'Gero',
          icon: '🦅',
          apiVersion: window.cardano.gerowallet.apiVersion || '1.0.0',
          enable: () => window.cardano.gerowallet.enable(),
          isEnabled: () => window.cardano.gerowallet.isEnabled()
        });
      }
    }

    return wallets;
  }, []);

  // ウォレットに接続
  const connectWallet = useCallback(async (walletName: string) => {
    setWalletState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log(`🔗 ${walletName}ウォレットに接続中...`);
      
      const availableWallets = getAvailableWallets();
      const wallet = availableWallets.find(w => w.name === walletName);
      
      if (!wallet) {
        throw new Error(`${walletName}ウォレットが見つかりません。ブラウザ拡張機能がインストールされているか確認してください。`);
      }

      // ウォレットを有効化
      const api = await wallet.enable();
      console.log(`✅ ${walletName}ウォレット接続成功`);

      // ネットワークIDを確認（1 = mainnet, 0 = testnet）
      const networkId = await api.getNetworkId();
      console.log(`🌐 ネットワークID: ${networkId} (${networkId === 1 ? 'Mainnet' : 'Testnet'})`);

      // アドレスを取得
      const usedAddresses = await api.getUsedAddresses();
      const address = usedAddresses[0];
      console.log(`📍 ウォレットアドレス: ${address}`);

      // 残高を取得
      const balance = await api.getBalance();
      console.log(`💰 残高: ${balance}`);

      setWalletState({
        isConnected: true,
        walletName,
        walletApi: api,
        address,
        balance,
        assets: [],
        isLoading: false,
        error: null
      });

      toast.success(`${walletName}ウォレットに接続しました！`);

      // アセット情報を取得
      await fetchWalletAssets(api, address);

    } catch (error) {
      console.error('ウォレット接続エラー:', error);
      const errorMessage = error instanceof Error ? error.message : 'ウォレット接続に失敗しました';
      
      setWalletState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));

      toast.error(errorMessage);
    }
  }, [getAvailableWallets]);

  // ウォレットのアセット（NFTを含む）を取得
  const fetchWalletAssets = useCallback(async (api: CardanoAPI, address: string) => {
    try {
      console.log('🎨 ウォレットアセットを取得中...');
      
      // Blockfrost APIを使用してアセット情報を取得
      // Note: 実際のプロダクションではBlockfrost APIキーが必要
      const response = await fetch(`https://cardano-mainnet.blockfrost.io/api/v0/addresses/${address}`, {
        headers: {
          'project_id': 'your_blockfrost_api_key' // 実際のAPIキーに置き換え
        }
      });

      if (!response.ok) {
        console.log('⚠️ Blockfrost APIが利用できません。モックデータを使用します。');
        // モックデータを使用
        const mockAssets: NFTAsset[] = [
          {
            unit: 'policy123asset456',
            quantity: '1',
            policy_id: 'policy123',
            asset_name: 'asset456',
            fingerprint: 'asset1abc123',
            metadata: {
              name: 'Cardano NFT #1',
              image: 'ipfs://Qm...',
              description: 'A beautiful Cardano NFT'
            }
          }
        ];

        setWalletState(prev => ({
          ...prev,
          assets: mockAssets
        }));

        console.log(`🎨 モックアセット: ${mockAssets.length}件`);
        return;
      }

      const addressData = await response.json();
      const assets: NFTAsset[] = addressData.amount
        .filter((asset: any) => asset.unit !== 'lovelace') // ADAを除外
        .map((asset: any) => ({
          unit: asset.unit,
          quantity: asset.quantity,
          policy_id: asset.unit.slice(0, 56),
          asset_name: asset.unit.slice(56),
          fingerprint: '', // 必要に応じて計算
          metadata: null
        }));

      setWalletState(prev => ({
        ...prev,
        assets
      }));

      console.log(`🎨 取得したアセット: ${assets.length}件`);

    } catch (error) {
      console.error('アセット取得エラー:', error);
      // エラーの場合はモックデータを使用
      const mockAssets: NFTAsset[] = [];
      setWalletState(prev => ({
        ...prev,
        assets: mockAssets
      }));
    }
  }, []);

  // 特定のポリシーIDのNFTを保有しているかチェック
  const checkNFTOwnership = useCallback((policyId: string): { hasNFT: boolean; count: number; assets: NFTAsset[] } => {
    if (!walletState.assets) {
      return { hasNFT: false, count: 0, assets: [] };
    }

    const nftAssets = walletState.assets.filter(asset => asset.policy_id === policyId);
    const count = nftAssets.reduce((sum, asset) => sum + parseInt(asset.quantity), 0);

    return {
      hasNFT: count > 0,
      count,
      assets: nftAssets
    };
  }, [walletState.assets]);

  // ウォレット切断
  const disconnectWallet = useCallback(() => {
    setWalletState({
      isConnected: false,
      walletName: null,
      walletApi: null,
      address: null,
      balance: null,
      assets: [],
      isLoading: false,
      error: null
    });

    toast.success('ウォレットを切断しました');
  }, []);

  // 自動再接続をチェック
  useEffect(() => {
    const checkAutoConnection = async () => {
      const availableWallets = getAvailableWallets();
      
      for (const wallet of availableWallets) {
        try {
          const isEnabled = await wallet.isEnabled();
          if (isEnabled) {
            console.log(`🔄 ${wallet.name}ウォレットの自動再接続を試行中...`);
            await connectWallet(wallet.name);
            break;
          }
        } catch (error) {
          console.log(`❌ ${wallet.name}ウォレットの自動再接続に失敗:`, error);
        }
      }
    };

    // ページ読み込み後に自動再接続をチェック
    const timer = setTimeout(checkAutoConnection, 1000);
    return () => clearTimeout(timer);
  }, [getAvailableWallets, connectWallet]);

  return {
    ...walletState,
    availableWallets: getAvailableWallets(),
    connectWallet,
    disconnectWallet,
    checkNFTOwnership,
    refreshAssets: () => walletState.walletApi && walletState.address && fetchWalletAssets(walletState.walletApi, walletState.address)
  };
}