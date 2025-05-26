# touhyou

ウォレット認証投票システム - Cardanoブロックチェーンを使った分散型投票アプリケーション

## 🚀 主な機能

- 🔐 **柔軟なウォレット認証システム**
  - ブラウザ拡張機能による自動接続
  - 手動でのアドレス入力
  - スマホアプリ対応
- 📊 リアルタイム投票・結果表示
- 🎨 モダンUI（React + TypeScript + TailwindCSS）
- 🔄 重複投票防止システム
- 📱 **モバイルフレンドリー設計**

## 🛠️ 技術スタック

- **フロントエンド**: React 18, TypeScript, Vite
- **ウォレット連携**: MeshSDK (Cardano)
- **データベース**: Supabase
- **スタイリング**: TailwindCSS, Framer Motion
- **状態管理**: Zustand

## 💼 ウォレット接続方法

### 🖥️ PCでの利用（ブラウザ拡張機能）

以下のブラウザ拡張機能をインストールして自動接続できます：

- [Nami](https://namiwallet.io/)
- [Flint](https://flint-wallet.com/)
- [Eternl](https://eternl.io/)
- [Tokeo](https://tokeo.io/)

### 📱 スマホでの利用（手動アドレス入力）

スマホアプリからウォレットアドレスをコピーして投票に参加できます：

- [Yoroi Wallet](https://yoroi-wallet.com/) - iOS/Android
- [Nami Mobile](https://namiwallet.io/) - モバイルブラウザ
- [Eternl Mobile](https://eternl.io/) - iOS/Android

### ✍️ 手動アドレス入力の手順

1. ウォレットアプリを開く
2. 受信アドレス（Receiving Address）をコピー
3. 投票アプリの「手動入力」タブに貼り付け
4. 「アドレスで接続」をクリック

## 🎯 プロジェクトの目的

このアプリケーションは以下の目的で開発されています：

- **アドレス収集**: 投票参加者のCardanoアドレスを収集
- **NFT配布**: 投票参加者にNFTを配布予定
- **ユーザー体験**: より多くの人にCardano投票システムを体験してもらう
- **アクセシビリティ**: 拡張機能なしでもスマホからアクセス可能

## 📋 必要な環境

- Node.js 18+ 
- npm または yarn
- Supabaseアカウント
- Cardanoウォレット（アプリまたは拡張機能）

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

必要な環境変数：
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 開発サーバーの起動

```bash
npm run dev
# または
yarn dev
```

## 🌐 デプロイ

本プロジェクトはNetlifyでのデプロイに最適化されています。

1. GitHubリポジトリをNetlifyに接続
2. ビルドコマンド: `npm run build`
3. 公開ディレクトリ: `dist`
4. 環境変数を設定

## 📝 使用方法

### PCユーザー
1. 対応ウォレット拡張機能をインストール
2. 「拡張機能」タブでウォレットを接続
3. 投票に参加

### スマホユーザー
1. Cardanoウォレットアプリをダウンロード
2. ウォレットを作成してアドレスを取得
3. 「手動入力」タブでアドレスを入力
4. 投票に参加

### 拡張機能なしのユーザー
1. 「手動入力」タブを選択
2. 既存のCardanoアドレスを入力
3. 投票に参加

## 🔒 セキュリティについて

- アドレス入力のみで投票可能（秘密鍵は不要）
- 基本的なCardanoアドレス形式の検証
- 重複投票防止システム
- ローカルストレージでの設定保存

## 🤝 コントリビューション

プルリクエストやイシューの作成を歓迎します！

## 📄 ライセンス

MIT License

## 📞 サポート

- [GitHub Issues](https://github.com/crackerky/touhyou/issues)
- Cardanoアドレス形式: `addr1...` で始まるBech32形式を推奨
