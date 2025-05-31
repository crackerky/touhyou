// NFT関連の型定義

export interface NFTAsset {
  unit: string;
  quantity: string;
  policyId: string;
  assetName?: string;
  metadata?: {
    name?: string;
    description?: string;
    image?: string;
    [key: string]: any;
  };
}

export interface NFTData {
  nftCount: number;
  policyId: string;
  assets?: NFTAsset[];
  verificationMethod?: 'blockfrost' | 'koios' | 'nmkr';
}

export interface NFTVerificationResult {
  hasNFT: boolean;
  nftData: NFTData | null;
  error?: string;
}

// NMKR API関連の型
export interface NMKRCustomer {
  email: string;
  walletAddress?: string;
  orders?: NMKROrder[];
}

export interface NMKROrder {
  id: string;
  nfts?: NMKRNFTItem[];
  status: string;
  createdAt: string;
}

export interface NMKRNFTItem {
  policyId: string;
  assetName: string;
  quantity: number;
  metadata?: any;
}

// Blockfrost API関連の型
export interface BlockfrostUTXO {
  tx_hash: string;
  output_index: number;
  amount: BlockfrostAmount[];
  block: string;
  data_hash?: string;
}

export interface BlockfrostAmount {
  unit: string;
  quantity: string;
}

// Koios API関連の型
export interface KoiosAsset {
  policy_id: string;
  asset_name?: string;
  quantity: string;
  fingerprint?: string;
}

// 設定関連の型
export interface NFTConfig {
  targetPolicyId: string;
  blockfrostApiKey?: string;
  nmkrApiKey?: string;
  enableDemo?: boolean;
}