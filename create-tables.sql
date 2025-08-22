-- テーブルを作成するSQL

-- 1. users テーブル
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  google_id TEXT,
  wallet_address TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. voting_sessions テーブル
CREATE TABLE IF NOT EXISTS voting_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  options JSONB DEFAULT '[]'::jsonb,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  nft_policy_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. session_votes テーブル
CREATE TABLE IF NOT EXISTS session_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES voting_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  option TEXT NOT NULL,
  nft_verified BOOLEAN DEFAULT false,
  nft_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. wallets テーブル
CREATE TABLE IF NOT EXISTS wallets (
  id SERIAL PRIMARY KEY,
  address TEXT UNIQUE NOT NULL,
  has_voted BOOLEAN DEFAULT false,
  nft_verified BOOLEAN,
  nft_policy_id TEXT,
  nft_count INTEGER,
  verification_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. nft_distributions テーブル
CREATE TABLE IF NOT EXISTS nft_distributions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES voting_sessions(id),
  recipient_user_id UUID REFERENCES users(id),
  recipient_address TEXT NOT NULL,
  nft_policy_id TEXT NOT NULL,
  nft_asset_name TEXT,
  quantity INTEGER DEFAULT 1,
  transaction_hash TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  distributed_at TIMESTAMP WITH TIME ZONE
);

-- RLSを無効化（開発用）
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE voting_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE session_votes DISABLE ROW LEVEL SECURITY;
ALTER TABLE wallets DISABLE ROW LEVEL SECURITY;
ALTER TABLE nft_distributions DISABLE ROW LEVEL SECURITY;

-- テスト用の投票セッションを作成
INSERT INTO voting_sessions (id, title, description, options, is_active) 
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '果物投票',
  'お気に入りの果物を選んでください',
  '[
    {"id": "apple", "label": "りんご", "description": "甘くて美味しい"},
    {"id": "banana", "label": "バナナ", "description": "エネルギー満点"},
    {"id": "orange", "label": "オレンジ", "description": "ビタミンC豊富"}
  ]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- 別の投票セッションも追加
INSERT INTO voting_sessions (id, title, description, options, is_active) 
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '色投票',
  'お気に入りの色を選んでください',
  '[
    {"id": "red", "label": "赤", "description": "情熱的な色"},
    {"id": "blue", "label": "青", "description": "冷静な色"},
    {"id": "green", "label": "緑", "description": "自然な色"}
  ]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;