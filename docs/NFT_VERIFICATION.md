# 🔍 NFT検証システム詳細ガイド

## 概要

この投票アプリケーションは、指定されたCardano NFTを保有するユーザーのみが投票できるシステムです。複数のAPIを使用して確実にNFT保有を検証します。

## 🔧 検証方法

### 1. Blockfrost API（推奨）

**特徴:**
- Cardano公式パートナーの高精度API
- リアルタイムブロックチェーンデータ
- 有料だが高い信頼性

**API endpoint:**
```
https://cardano-mainnet.blockfrost.io/api/v0/addresses/{address}/utxos
```

**設定:**
```env
VITE_BLOCKFROST_API_KEY=mainnetYourApiKeyHere
```

### 2. Koios API（フォールバック）

**特徴:**
- コミュニティ運営の無料API
- Blockfrost APIが利用できない場合の代替
- APIキー不要

**API endpoint:**
```
https://api.koios.rest/api/v1/address_assets?_address={address}
```

### 3. NMKR API（オプション）

**特徴:**
- NFT購入履歴ベースの検証
- メールアドレスが必要
- NFTマーケットプレイス連携

**API endpoint:**
```
https://api.nmkr.io/v2/GetCustomerByEmail/{email}
```

**設定:**
```env
VITE_NMKR_API_KEY=your_nmkr_api_key
```

## 🔄 検証フロー

### 1. 自動フォールバック

```
1. Blockfrost API で検証
   ↓ 失敗時
2. Koios API で検証
   ↓ 失敗時（メールあり）
3. NMKR API で検証
   ↓ 全て失敗
4. NFT保有なしと判定
```

### 2. 検証データ

検証時に取得・記録されるデータ：

```typescript
interface NFTData {
  nftCount: number;           // 保有NFT数
  policyId: string;          // Policy ID
  assets?: NFTAsset[];       // NFT詳細情報
  verificationMethod: string; // 使用API
}
```

### 3. データベース記録

```sql
-- ウォレットテーブル
wallet {
  address: string,
  nft_verified: boolean,
  nft_policy_id: string,
  nft_count: integer,
  verification_method: string
}

-- 投票テーブル
votes {
  wallet_address: string,
  option: string,
  nft_verified: boolean,
  policy_id: string,
  verification_method: string
}
```

## 🎯 対象NFT設定

### Policy ID の設定

```env
VITE_TARGET_POLICY_ID=f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a
```

**Policy ID の確認方法:**
1. [CardanoScan](https://cardanoscan.io/) でNFTを検索
2. NFT詳細ページで Policy ID を確認
3. 64文字の16進数文字列であることを確認

### 複数Policy ID対応

現在は単一Policy IDのみ対応。複数Policy IDに対応する場合は、カンマ区切りで設定可能に拡張できます：

```typescript
// 将来的な拡張例
const targetPolicyIds = import.meta.env.VITE_TARGET_POLICY_IDS?.split(',') || [];
```

## 🧪 デモモード

### 設定

```env
VITE_ENABLE_DEMO=true
```

### 動作

以下の条件でNFT保有をシミュレート：

```typescript
function checkDemoNFTOwnership(walletAddress: string): NFTData | null {
  const demoConditions = [
    walletAddress.includes('demo'),
    walletAddress.includes('test'),
    walletAddress === 'addr1demo',
    walletAddress === 'addr1test'
  ];
  
  if (demoConditions.some(condition => condition)) {
    return {
      nftCount: 1,
      policyId: 'demo_policy_id',
      verificationMethod: 'demo'
    };
  }
  
  return null;
}
```

### デモアドレス例

- `addr1demo`
- `addr1test` 
- `demo123`
- `test456`
- `addr1vau96ht6q9y4d2kqjxy2z3zjjt3el2zdlnt5dkudemocrat...` ("demo"を含む)

## 🚨 エラーハンドリング

### API エラー

```typescript
// Blockfrost API エラー例
if (!response.ok) {
  console.error('Blockfrost API error:', response.status);
  // Koios API にフォールバック
}

// ネットワークエラー
catch (error) {
  console.error('Network error:', error);
  // 次のAPIを試行
}
```

### ユーザー向けエラーメッセージ

```typescript
const errorMessages = {
  'network': 'ネットワークエラーが発生しました',
  'api_limit': 'API利用制限に達しました。しばらく待ってから再試行してください',
  'invalid_address': '無効なウォレットアドレスです',
  'no_nft': '対象NFTの保有が確認できませんでした',
  'verification_failed': 'NFT検証に失敗しました'
};
```

## 🔒 セキュリティ考慮事項

### 1. API キーの保護

- クライアントサイドでの使用（unavoidable）
- Netlify環境変数での管理
- 定期的なキーローテーション

### 2. Rate Limiting

```typescript
// 連続リクエスト制限
const lastRequest = localStorage.getItem('lastNFTCheck');
const now = Date.now();
if (lastRequest && now - parseInt(lastRequest) < 5000) {
  throw new Error('Too many requests. Please wait.');
}
localStorage.setItem('lastNFTCheck', now.toString());
```

### 3. データ検証

```typescript
// Policy ID の形式検証
function isValidPolicyId(policyId: string): boolean {
  return /^[a-f0-9]{56}$/.test(policyId);
}

// NFT数の妥当性検証
function isValidNFTCount(count: number): boolean {
  return Number.isInteger(count) && count >= 0 && count <= 10000;
}
```

## 📊 監視・分析

### ログ記録

```typescript
// 検証ログ
console.log('NFT verification started:', {
  address: walletAddress,
  timestamp: new Date().toISOString(),
  method: 'blockfrost'
});

// 結果ログ
console.log('NFT verification completed:', {
  address: walletAddress,
  hasNFT: result.hasNFT,
  nftCount: result.nftData?.nftCount,
  method: result.nftData?.verificationMethod,
  duration: Date.now() - startTime
});
```

### 分析クエリ

```sql
-- NFT保有者の投票状況
SELECT 
  verification_method,
  COUNT(*) as voter_count,
  AVG(nft_count) as avg_nft_count
FROM wallets 
WHERE nft_verified = true
GROUP BY verification_method;

-- API使用状況
SELECT 
  DATE(created_at) as date,
  verification_method,
  COUNT(*) as verification_count
FROM wallets
WHERE nft_verified = true
GROUP BY DATE(created_at), verification_method
ORDER BY date DESC;
```

## 🔧 カスタマイズ

### 検証条件の変更

```typescript
// 最小保有数の設定
const MIN_NFT_COUNT = 1;

// 複数Policy IDの対応
const ALLOWED_POLICY_IDS = [
  'policy1...',
  'policy2...',
  'policy3...'
];

// 検証方法の優先順位変更
const VERIFICATION_PRIORITY = [
  'koios',     // 無料APIを優先
  'blockfrost', // 有料APIは最後
  'nmkr'
];
```

### UIカスタマイズ

```typescript
// 検証中のメッセージ
const VERIFICATION_MESSAGES = {
  pending: 'NFT保有確認中...',
  verified: 'NFT保有確認済み',
  failed: 'NFT保有未確認'
};

// 検証方法の表示名
const VERIFICATION_METHOD_NAMES = {
  blockfrost: 'Blockfrost API',
  koios: 'Koios API', 
  nmkr: 'NMKR購入履歴'
};
```

## 📈 パフォーマンス最適化

### キャッシュ機能

```typescript
// メモリキャッシュ
const nftCache = new Map<string, NFTData>();

// キャッシュ有効期限（5分）
const CACHE_DURATION = 5 * 60 * 1000;

function getCachedNFTData(address: string): NFTData | null {
  const cached = nftCache.get(address);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached;
  }
  return null;
}
```

### 並列処理

```typescript
// 複数API並列実行（リソース節約のため無効化）
async function parallelNFTVerification(address: string): Promise<NFTData | null> {
  const results = await Promise.allSettled([
    checkNFTOwnershipBlockfrost(address),
    checkNFTOwnershipKoios(address)
  ]);
  
  // 最初に成功した結果を使用
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value) {
      return result.value;
    }
  }
  
  return null;
}
```

この検証システムにより、確実で公正なNFT保有者限定投票が実現されます。
