-- Row Level Security (RLS) ポリシーを一時的に無効化
-- または適切なポリシーを設定

-- 1. voting_sessions テーブルのRLSを無効化（開発用）
ALTER TABLE voting_sessions DISABLE ROW LEVEL SECURITY;

-- 2. users テーブルのRLSを無効化（開発用）
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 3. session_votes テーブルのRLSを無効化（開発用）
ALTER TABLE session_votes DISABLE ROW LEVEL SECURITY;

-- 4. wallets テーブルのRLSを無効化（開発用）
ALTER TABLE wallets DISABLE ROW LEVEL SECURITY;

-- または、適切な RLS ポリシーを設定する場合：

-- voting_sessions テーブルのポリシー（全員が読み取り可能）
-- CREATE POLICY "voting_sessions_select" ON voting_sessions FOR SELECT USING (true);
-- CREATE POLICY "voting_sessions_insert" ON voting_sessions FOR INSERT WITH CHECK (true);
-- CREATE POLICY "voting_sessions_update" ON voting_sessions FOR UPDATE USING (true);

-- users テーブルのポリシー（全員が読み取り可能）
-- CREATE POLICY "users_select" ON users FOR SELECT USING (true);
-- CREATE POLICY "users_insert" ON users FOR INSERT WITH CHECK (true);
-- CREATE POLICY "users_update" ON users FOR UPDATE USING (true);

-- session_votes テーブルのポリシー（全員が読み取り可能）
-- CREATE POLICY "session_votes_select" ON session_votes FOR SELECT USING (true);
-- CREATE POLICY "session_votes_insert" ON session_votes FOR INSERT WITH CHECK (true);

-- wallets テーブルのポリシー（全員が読み取り可能）
-- CREATE POLICY "wallets_select" ON wallets FOR SELECT USING (true);
-- CREATE POLICY "wallets_insert" ON wallets FOR INSERT WITH CHECK (true);
-- CREATE POLICY "wallets_update" ON wallets FOR UPDATE USING (true);