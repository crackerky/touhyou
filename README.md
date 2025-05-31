# touhyou

**NFT保有者限定投票システム** - Cardanoブロックチェーンを使った分散型投票アプリケーション

## 🚀 主な機能

- 🔐 **シンプルなウォレット認証システム**
  - 手動アドレス入力（推奨）
  - ブラウザ拡張機能による自動接続（PC）
  - ワンクリック接続（拡張機能検出時）
- 🎯 **NFT保有者限定投票**
  - 対象NFT保有確認
  - 複数API対応（Blockfrost, Koios, NMKR）
  - リアルタイムNFT検証
- 📊 リアルタイム投票・結果表示
- 🎨 モダンUI（React + TypeScript + TailwindCSS）
- 🔄 重複投票防止システム
- 📱 **レスポンシブデザイン**

## 🛠️ 技術スタック

- **フロントエンド**: React 18, TypeScript, Vite
- **ウォレット連携**: MeshSDK (Cardano)
- **NFT検証**: Blockfrost API, Koios API, NMKR API
- **データベース**: Supabase
- **スタイリング**: TailwindCSS, Framer Motion
- **状態管理**: Zustand

## 🎯 NFT保有者限定投票システム

### 🔍 NFT検証機能

このアプリケーションは指定されたPolicy IDのNFTを保有するユーザーのみが投票できるシステムです。

**対応検証方法:**
1. **Blockfrost API** - Cardanoメインネットの公式API
2. **Koios API** - 無料のコミュニティAPI
3. **NMKR API** - NFT購入履歴ベースの検証

**検証フロー:**
1. ウォレットアドレス入力/接続
2. 複数APIを使用してNFT保有確認
3. 対象Policy IDのNFT検出
4. 投票権限の付与

### 🏷️ 対象NFT設定

環境変数でPolicy IDを設定：
```
VITE_TARGET_POLICY_ID=your_nft_policy_id_here
```

### 🧪 デモモード

開発・テスト用にデモモードを搭載：
```
VITE_ENABLE_DEMO=true
```

デモモード時の動作：
- アドレスに "demo" または "test" を含む場合、NFT保有とみなす
- 実際のAPI呼び出しなしでNFT検証をシミュレート
- 開発環境での動作確認が可能

## 💼 ウォレット接続方法

### ✍️ **手動アドレス入力（推奨・確実）**

最も確実で簡単な接続方法：

1. ウォレットアプリまたは拡張機能を開く
2. 受信アドレス（Receiving Address）をコピー
3. 投票アプリの「手動入力」タブに貼り付け
4. 「アドレスで接続」をクリック
5. **NFT保有確認が自動実行されます**

**対応アドレス形式:**
- Bech32形式: `addr1...` で始まるアドレス（推奨）
- Hex形式: 16進数のアドレス

### 🖥️ **PCでの利用（ブラウザ拡張機能）**

以下のブラウザ拡張機能がインストールされている場合、自動検出・接続が可能：

- [Nami](https://namiwallet.io/)
- [Flint](https://flint-wallet.com/)
- [Eternl](https://eternl.io/)
- [Tokeo](https://tokeo.io/)

**注意**: 拡張機能が検出されない場合は手動入力をご利用ください。

### 📱 **モバイルでの利用**

**重要**: 現在のWeb技術の制約により、スマートフォンでのウォレットアプリとの直接連携は技術的に困難です。

**モバイル推奨手順:**
1. ウォレットアプリでアドレスをコピー
2. ブラウザで投票ページを開く
3. 「手動でアドレス入力」を選択
4. コピーしたアドレスを貼り付けて接続
5. NFT保有確認後、投票権限取得

## 🎯 プロジェクトの目的

このアプリケーションは以下の目的で開発されています：

- **NFT保有者限定の投票**: 特定NFTコミュニティ内での意思決定
- **ブロックチェーン認証**: 改ざん不可能な投票システム
- **アドレス収集**: 投票参加者のCardanoアドレスを収集
- **NFT配布**: 投票参加者にNFTを配布予定
- **ユーザー体験**: シンプルで確実な投票体験
- **アクセシビリティ**: 誰でも簡単にアクセス可能

## 📋 必要な環境

- Node.js 18+ 
- npm または yarn
- Supabaseアカウント
- Cardanoウォレット（アプリまたは拡張機能）
- Blockfrost APIキー（推奨）
- NMKR APIキー（オプション）

## ⚡ セットアップ手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/crackerky/touhyou.git
cd touhyou
```

### 2. 依存関係のインストール

```bash
npm install
# または
yarn install
```

### 3. 環境変数の設定

`.env.example`をコピーして`.env`ファイルを作成し、必要な値を設定してください：

```bash
cp .env.example .env
```

### 必要な環境変数

```env
# Supabase設定（必須）
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# NFT設定（必須）
VITE_TARGET_POLICY_ID=your_nft_policy_id_here

# Blockfrost API（推奨）
VITE_BLOCKFROST_API_KEY=your_blockfrost_api_key_here

# NMKR API（オプション）
VITE_NMKR_API_KEY=your_nmkr_api_key_here

# 開発設定
VITE_ENABLE_DEMO=true

# アプリ設定
VITE_APP_TITLE=NFT投票アプリ
VITE_APP_DESCRIPTION=NFT保有者限定の投票アプリケーション
```

### 4. データベース設定

Supabaseでデータベースを設定し、マイグレーションを実行：

```bash
# Supabase CLIをインストール（初回のみ）
npm install -g supabase

# プロジェクトの初期化
supabase init

# マイグレーションの実行
supabase db push
```

または、手動でSupabaseダッシュボードでSQLを実行：
1. `supabase/migrations/20250519090819_mellow_mud.sql`
2. `supabase/migrations/20250531121800_add_nft_support.sql`

### 5. 開発サーバーの起動

```bash
npm run dev
# または
yarn dev
```

## 🔧 API設定

### Blockfrost API

1. [Blockfrost](https://blockfrost.io/)でアカウント作成
2. Cardano Mainnetプロジェクト作成
3. API キーを取得
4. 環境変数に設定

### Koios API

- 無料で利用可能
- APIキー不要
- フォールバック用に自動利用

### NMKR API

1. [NMKR](https://www.nmkr.io/)でアカウント作成
2. API キーを取得
3. 環境変数に設定（オプション）

## 🌐 デプロイ

本プロジェクトはNetlifyでのデプロイに最適化されています。

1. GitHubリポジトリをNetlifyに接続
2. ビルドコマンド: `npm run build`
3. 公開ディレクトリ: `dist`
4. 環境変数を設定（本番用）

**本番環境では以下を設定:**
- `VITE_ENABLE_DEMO=false`
- 実際のBlockfrost APIキー
- 正しいPolicy ID

## 📝 使用方法

### 🖥️ **PCユーザー**
1. 対応ウォレット拡張機能があれば自動検出
2. 「ワンクリック接続」で簡単接続
3. NFT保有確認が自動実行
4. 拡張機能がない場合は手動入力

### 📱 **スマホユーザー**
1. ウォレットアプリでアドレスをコピー
2. ブラウザで投票ページにアクセス
3. 「手動でアドレス入力」を選択
4. アドレスを貼り付けて接続
5. NFT保有確認後、投票参加

### ⚠️ **技術的制約について**

現在のWeb技術とモバイルOS、アプリストアのポリシーにより、以下の制約があります：

- **モバイルでのディープリンク**: スマホブラウザからウォレットアプリへの自動起動は制限が多く、確実ではありません
- **QRコード連携**: ウォレットアプリでのQRコード読み取り後の自動データ転送は限定的です
- **自動接続**: モバイル環境でのウォレット自動検出はブラウザの制約により困難です

これらの理由から、**手動アドレス入力**を最も確実で推奨する方法としています。

## 🔧 技術的特徴

### NFT検証システム
- 複数API対応（Blockfrost, Koios, NMKR）
- フォールバック機能付き
- リアルタイム検証
- エラーハンドリング

### アドレス正規化
- Hex形式からBech32形式への自動変換
- 複数のアドレス形式に対応
- 基本的な形式検証

### レスポンシブデザイン
- デバイス自動検出
- モバイル・デスクトップ最適化
- アクセシブルなUI設計

### セキュリティ
- アドレス入力のみで投票可能（秘密鍵は不要）
- NFT保有による投票権限制御
- 基本的なCardanoアドレス形式の検証
- 重複投票防止システム

## 🎮 デモモード

開発・テスト用のデモモードを搭載：

```env
VITE_ENABLE_DEMO=true
```

**デモアドレス例:**
- `addr1demo...` 
- `addr1test...`
- アドレスに "demo" または "test" を含む任意のアドレス

デモモードでは実際のAPIを呼び出さずにNFT保有をシミュレートできます。

## 🔍 NFT検証詳細

### 検証順序
1. **Blockfrost API** - 最優先、高精度
2. **Koios API** - フォールバック、無料
3. **NMKR API** - 購入履歴ベース（メール必要）

### 検証内容
- 指定Policy IDのNFT保有数
- 保有確認日時
- 使用API記録
- NFTメタデータ（可能な場合）

### エラーハンドリング
- API障害時の自動フォールバック
- ネットワークエラー対応
- ユーザーフレンドリーなエラーメッセージ

## 🔒 セキュリティについて

- **NFT保有による権限制御**: 投票権限はNFT保有者のみ
- **アドレス入力のみ**: 秘密鍵は不要
- **ブロックチェーン検証**: 改ざん不可能な保有確認
- **重複投票防止**: ウォレットアドレス単位での制御
- **データベース暗号化**: Supabaseによるデータ保護

## 🤝 コントリビューション

プルリクエストやイシューの作成を歓迎します！

### 開発ガイドライン
- TypeScriptでの型安全な実装
- コンポーネント単位でのテスト
- アクセシビリティの考慮
- モバイルファーストなデザイン

## 📄 ライセンス

MIT License

## 📞 サポート

- [GitHub Issues](https://github.com/crackerky/touhyou/issues)
- Cardanoアドレス形式: `addr1...` で始まるBech32形式を推奨
- NFT検証: 複数APIで確実な検証

## 💡 使用のヒント

### アドレスの確認方法
- **Yoroi**: 「受信」タブのアドレスをコピー
- **Nami**: メインアドレスをコピー
- **Eternl**: 「Receive」のアドレスをコピー
- **Tokeo**: 受信アドレスをコピー

### NFT保有確認
- **対象Policy ID**: 環境変数で設定されたNFTのみ対象
- **検証時間**: 通常5-10秒程度
- **複数保有**: 保有数も表示・記録

### トラブルシューティング
- アドレスが認識されない → Bech32形式（addr1...）を使用
- NFT検証が失敗する → 別のAPIで再試行、またはサポートに連絡
- 接続できない → 手動入力を試行
- 拡張機能が検出されない → ブラウザの再起動またはリロード

### デバッグモード
開発環境では詳細なログが出力されます：
- NFT検証API呼び出しログ
- アドレス正規化ログ
- エラー詳細情報

シンプルで確実、そして安全なNFT保有者限定投票システムをお楽しみください！ 🗳️✨
