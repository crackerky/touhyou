# touhyou

## Setup

# touhyou

ウォレット認証投票システム - Cardanoブロックチェーンを使った分散型投票アプリケーション

## 🚀 主な機能

- 🔐 Cardanoウォレット認証による本人確認
- 📊 リアルタイム投票・結果表示
- 🎨 モダンUI（React + TypeScript + TailwindCSS）
- 🔄 重複投票防止システム

## 🛠️ 技術スタック

- **フロントエンド**: React 18, TypeScript, Vite
- **ウォレット連携**: MeshSDK (Cardano)
- **データベース**: Supabase
- **スタイリング**: TailwindCSS, Framer Motion
- **状態管理**: Zustand

## 💼 対応ウォレット

以下のCardanoウォレットに対応しています：

- [Nami](https://namiwallet.io/)
- [Flint](https://flint-wallet.com/)
- [Eternl](https://eternl.io/)
- [Tokeo](https://tokeo.io/)

## 📋 必要な環境

- Node.js 18+ 
- npm または yarn
- Supabaseアカウント
- 対応Cardanoウォレット（上記のいずれか）

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

1. 対応ウォレット（Nami、Flint、Eternl、Tokeo）をブラウザにインストール
2. アプリケーションにアクセス
3. ウォレットを接続して本人確認
4. 投票に参加

## 🤝 コントリビューション

プルリクエストやイシューの作成を歓迎します！

## 📄 ライセンス

MIT License
