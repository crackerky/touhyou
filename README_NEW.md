# NFT投票システム - Google認証対応版

Cardano NFTとGoogle認証を組み合わせた、透明性と信頼性の高い投票プラットフォームです。

## 🚀 新機能

### Google認証システム
- Googleアカウントでの簡単ログイン
- ウォレットアドレスとユーザーアカウントの紐付け
- セキュアなユーザー管理

### 複数投票セッション管理
- 複数の投票を同時に作成・管理
- 投票期間の設定
- NFT保有者限定投票の設定

### NFT配布システム
- 投票参加者への自動NFT配布
- 配布対象の詳細フィルタリング
- 配布記録の管理

### ダッシュボード
- 投票結果のリアルタイム表示
- CSV形式での結果エクスポート
- 投票統計の可視化

## セットアップ

### 1. 環境変数の設定

`.env`ファイルを作成し、以下を設定：

```env
# Supabase設定
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google OAuth (Supabaseダッシュボードで設定)
# リダイレクトURL: https://your-domain.com/auth/callback
```

### 2. データベースマイグレーション

以下のファイルを順番に実行：
1. `supabase/migrations/20250519090819_mellow_mud.sql`
2. `supabase/migrations/20250531121800_add_nft_support.sql`
3. `supabase/migrations/20250601000000_add_google_auth_and_voting_sessions.sql`

### 3. 開発サーバー起動

```bash
npm install
npm run dev
```

## 使用方法

### 投票セッション作成
1. Googleでログイン
2. ダッシュボード → 「新規投票作成」
3. 投票情報入力（タイトル、選択肢、NFT Policy ID等）

### 投票参加
1. 投票リンクにアクセス
2. Googleログイン → ウォレットアドレス登録
3. NFT保有確認 → 投票

### NFT配布
1. 投票詳細 → 「NFT配布」タブ
2. 配布対象選択
3. NFT情報入力 → 配布実行

## パフォーマンス最適化

- データベースインデックス最適化
- 効率的な状態管理（Zustand）
- APIコールの最小化
- 遅延読み込み対応

## セキュリティ

- Row Level Security (RLS) 全テーブル適用
- プライバシー保護（アドレス部分表示）
- 認証済みユーザーのみアクセス許可

## Supabase MCP設定

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase@latest", "--read-only"],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "your-personal-access-token"
      }
    }
  }
}
```

## 技術スタック

- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS + Framer Motion
- **State**: Zustand
- **Auth**: Supabase + Google OAuth
- **Database**: PostgreSQL (Supabase)
- **Blockchain**: Cardano (MeshSDK)

## データベース構造

```
users: Google認証 + ウォレット紐付け
voting_sessions: 投票セッション管理
session_votes: 投票記録
nft_distributions: NFT配布管理
```

プロジェクトの構築が完了しました！🎉