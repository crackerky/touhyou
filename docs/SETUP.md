# 🚀 NFT投票アプリ セットアップガイド

## 📋 事前準備

### 1. 必要なアカウント

- **Supabase** (必須): https://supabase.com/
- **Blockfrost** (推奨): https://blockfrost.io/
- **NMKR** (オプション): https://www.nmkr.io/

### 2. NFT情報

投票対象とするNFTの**Policy ID**を確認してください。
- CardanoScanなどで確認可能
- 64文字の16進数文字列

## ⚡ クイックスタート（デモモード）

### 1. リポジトリのクローンと依存関係インストール

```bash
git clone https://github.com/crackerky/touhyou.git
cd touhyou
npm install
```

### 2. デモ用環境変数の設定

```bash
cp .env.demo .env
```

`.env`ファイルを編集：
```env
# 最低限の設定（デモモード）
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_TARGET_POLICY_ID=your_nft_policy_id
VITE_ENABLE_DEMO=true
```

### 3. Supabaseセットアップ

1. Supabaseで新プロジェクト作成
2. Settings → API から URL と anon key を取得
3. SQL Editor で以下のファイルを順番に実行：
   - `supabase/migrations/20250519090819_mellow_mud.sql`
   - `supabase/migrations/20250531121800_add_nft_support.sql`

### 4. 開発サーバー起動

```bash
npm run dev
```

### 5. デモモードでテスト

- ウォレットアドレス入力欄に `addr1demo` を入力
- NFT保有が確認され、投票が可能になります

## 🔧 本格運用セットアップ

### 1. Blockfrost API設定

1. https://blockfrost.io/ でアカウント作成
2. 「Create Project」→「Cardano Mainnet」選択
3. API keyをコピー
4. `.env`に設定：
   ```env
   VITE_BLOCKFROST_API_KEY=mainnetYourApiKeyHere
   ```

### 2. 本番モード設定

```env
# デモモードを無効化
VITE_ENABLE_DEMO=false

# 実際のNFT Policy IDを設定
VITE_TARGET_POLICY_ID=実際のPolicy ID

# Blockfrost API Key
VITE_BLOCKFROST_API_KEY=実際のAPIキー
```

### 3. NMKR API設定（オプション）

NFT購入履歴での検証も行う場合：

1. https://www.nmkr.io/ でアカウント作成
2. API設定でキーを取得
3. `.env`に追加：
   ```env
   VITE_NMKR_API_KEY=your_nmkr_api_key
   ```

## 🌐 デプロイ（Netlify）

### 1. Netlifyアカウント作成

### 2. GitHubリポジトリ接続

### 3. ビルド設定

- **Build command**: `npm run build`
- **Publish directory**: `dist`

### 4. 環境変数設定

Netlifyの「Site settings」→「Environment variables」で設定：

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_TARGET_POLICY_ID=your_nft_policy_id
VITE_BLOCKFROST_API_KEY=your_blockfrost_api_key
VITE_ENABLE_DEMO=false
VITE_APP_TITLE=あなたのアプリ名
VITE_APP_DESCRIPTION=アプリの説明
```

## 🧪 テスト方法

### デモモードでのテスト

1. `VITE_ENABLE_DEMO=true` に設定
2. 以下のアドレスでテスト：
   - `addr1demo`
   - `addr1test` 
   - `demo123` （"demo"を含む任意の文字列）

### 実際のNFTでのテスト

1. `VITE_ENABLE_DEMO=false` に設定
2. 対象NFTを保有するウォレットアドレスで接続
3. NFT検証が正常に動作することを確認

## 🔍 トラブルシューティング

### NFT検証が失敗する場合

1. **Policy IDの確認**
   - 64文字の16進数であることを確認
   - CardanoScanで実在することを確認

2. **API設定の確認**
   - Blockfrost API keyが正しいことを確認
   - Mainnet用のキーを使用していることを確認

3. **ネットワーク確認**
   - ブラウザの開発者ツールでAPIエラーを確認
   - CORS設定の確認

### データベース接続エラー

1. **Supabase設定の確認**
   - URLとanon keyが正しいことを確認
   - プロジェクトが有効であることを確認

2. **マイグレーションの確認**
   - 両方のSQLファイルが実行されていることを確認
   - テーブルが正しく作成されていることを確認

### アドレス認識エラー

1. **アドレス形式の確認**
   - Bech32形式（addr1...）を使用
   - 余計な空白や文字がないことを確認

2. **ウォレットの確認**
   - mainnetアドレスを使用
   - testnetアドレスでないことを確認

## 📞 サポート

- GitHub Issues: https://github.com/crackerky/touhyou/issues
- 設定例: `.env.demo`ファイルを参照
- API文書: 各サービスの公式ドキュメントを参照

## 🚀 運用開始

1. ✅ デモモードでの動作確認
2. ✅ 実際のNFTでの検証テスト
3. ✅ 本番環境でのデプロイ
4. ✅ ユーザーへの告知・説明

成功を祈ります！ 🎉