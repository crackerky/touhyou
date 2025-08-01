/*
  # Add Google authentication and voting session management

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique) - Google account email
      - `google_id` (text, unique) - Google OAuth ID
      - `wallet_address` (text, unique) - Cardano wallet address
      - `display_name` (text) - User's display name
      - `avatar_url` (text) - User's avatar from Google
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `voting_sessions`
      - `id` (uuid, primary key)
      - `title` (text) - Vote title
      - `description` (text) - Vote description
      - `options` (jsonb) - Vote options array
      - `start_date` (timestamp)
      - `end_date` (timestamp)
      - `nft_policy_id` (text) - Required NFT policy ID
      - `is_active` (boolean)
      - `created_by` (uuid, foreign key to users.id)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `session_votes`
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `option` (text)
      - `nft_verified` (boolean)
      - `nft_count` (integer)
      - `created_at` (timestamp)
    
    - `nft_distributions`
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key)
      - `recipient_user_id` (uuid, foreign key)
      - `recipient_address` (text)
      - `nft_policy_id` (text)
      - `nft_asset_name` (text)
      - `quantity` (integer)
      - `transaction_hash` (text)
      - `status` (text) - pending, completed, failed
      - `created_at` (timestamp)
      - `distributed_at` (timestamp)

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  google_id TEXT UNIQUE NOT NULL,
  wallet_address TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create voting_sessions table
CREATE TABLE IF NOT EXISTS voting_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  nft_policy_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create session_votes table
CREATE TABLE IF NOT EXISTS session_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES voting_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  option TEXT NOT NULL,
  nft_verified BOOLEAN DEFAULT false,
  nft_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, user_id) -- Prevent duplicate votes
);

-- Create nft_distributions table
CREATE TABLE IF NOT EXISTS nft_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES voting_sessions(id) ON DELETE SET NULL,
  recipient_user_id UUID REFERENCES users(id),
  recipient_address TEXT NOT NULL,
  nft_policy_id TEXT NOT NULL,
  nft_asset_name TEXT,
  quantity INTEGER DEFAULT 1,
  transaction_hash TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  distributed_at TIMESTAMPTZ
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_voting_sessions_active ON voting_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_voting_sessions_dates ON voting_sessions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_session_votes_session ON session_votes(session_id);
CREATE INDEX IF NOT EXISTS idx_session_votes_user ON session_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_nft_distributions_status ON nft_distributions(status);
CREATE INDEX IF NOT EXISTS idx_nft_distributions_recipient ON nft_distributions(recipient_user_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE voting_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE nft_distributions ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users can view all profiles"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid()::text = google_id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = google_id)
  WITH CHECK (auth.uid()::text = google_id);

-- Policies for voting_sessions table
CREATE POLICY "Anyone can view active voting sessions"
  ON voting_sessions FOR SELECT
  USING (is_active = true OR created_by::text = auth.uid()::text);

CREATE POLICY "Authenticated users can create voting sessions"
  ON voting_sessions FOR INSERT
  TO authenticated
  WITH CHECK (created_by::text = auth.uid()::text);

CREATE POLICY "Users can update their own voting sessions"
  ON voting_sessions FOR UPDATE
  USING (created_by::text = auth.uid()::text)
  WITH CHECK (created_by::text = auth.uid()::text);

-- Policies for session_votes table
CREATE POLICY "Anyone can view vote results"
  ON session_votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can vote"
  ON session_votes FOR INSERT
  TO authenticated
  WITH CHECK (user_id::text = auth.uid()::text);

-- Policies for nft_distributions table
CREATE POLICY "Users can view their own distributions"
  ON nft_distributions FOR SELECT
  USING (recipient_user_id::text = auth.uid()::text OR 
         EXISTS (SELECT 1 FROM voting_sessions WHERE id = session_id AND created_by::text = auth.uid()::text));

CREATE POLICY "Session creators can create distributions"
  ON nft_distributions FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM voting_sessions WHERE id = session_id AND created_by::text = auth.uid()::text));

CREATE POLICY "Session creators can update distributions"
  ON nft_distributions FOR UPDATE
  USING (EXISTS (SELECT 1 FROM voting_sessions WHERE id = session_id AND created_by::text = auth.uid()::text))
  WITH CHECK (EXISTS (SELECT 1 FROM voting_sessions WHERE id = session_id AND created_by::text = auth.uid()::text));

-- Create functions for better data management
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voting_sessions_updated_at BEFORE UPDATE ON voting_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for vote statistics
CREATE OR REPLACE VIEW vote_statistics AS
SELECT 
  vs.id as session_id,
  vs.title,
  vs.is_active,
  COUNT(DISTINCT sv.user_id) as total_voters,
  COUNT(CASE WHEN sv.nft_verified THEN 1 END) as verified_voters,
  json_agg(
    json_build_object(
      'option', sv.option,
      'count', COUNT(sv.id),
      'verified_count', COUNT(CASE WHEN sv.nft_verified THEN 1 END)
    )
  ) as results
FROM voting_sessions vs
LEFT JOIN session_votes sv ON vs.id = sv.session_id
GROUP BY vs.id, vs.title, vs.is_active;

-- Create function to get user's voting history
CREATE OR REPLACE FUNCTION get_user_voting_history(user_uuid UUID)
RETURNS TABLE (
  session_id UUID,
  session_title TEXT,
  voted_option TEXT,
  voted_at TIMESTAMPTZ,
  nft_verified BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sv.session_id,
    vs.title,
    sv.option,
    sv.created_at,
    sv.nft_verified
  FROM session_votes sv
  JOIN voting_sessions vs ON sv.session_id = vs.id
  WHERE sv.user_id = user_uuid
  ORDER BY sv.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE users IS 'ユーザー管理テーブル - Google認証とウォレットアドレスを紐付け';
COMMENT ON TABLE voting_sessions IS '投票セッション管理テーブル - 複数の投票を作成・管理';
COMMENT ON TABLE session_votes IS '投票記録テーブル - 各セッションでの投票を記録';
COMMENT ON TABLE nft_distributions IS 'NFT配布管理テーブル - NFT配布の記録と追跡';
COMMENT ON VIEW vote_statistics IS '投票統計ビュー - 各セッションの投票結果を集計';