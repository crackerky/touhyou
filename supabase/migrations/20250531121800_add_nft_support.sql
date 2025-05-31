/*
  # Add NFT verification support to existing tables

  1. Updates to existing tables
    - `wallets`
      - Add `nft_verified` (boolean) - NFT保有確認フラグ
      - Add `nft_policy_id` (text) - 確認されたNFTのPolicy ID
      - Add `nft_count` (integer) - 保有NFT数
      - Add `verification_method` (text) - 検証に使用したAPI
    - `votes`
      - Add `nft_verified` (boolean) - 投票時のNFT確認状況
      - Add `policy_id` (text) - 投票時のPolicy ID
      - Add `verification_method` (text) - 投票時の検証方法
  
  2. Security
    - Maintain existing RLS policies
    - Ensure NFT data is properly tracked
*/

-- Add NFT-related columns to wallets table
ALTER TABLE wallets 
ADD COLUMN IF NOT EXISTS nft_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS nft_policy_id TEXT,
ADD COLUMN IF NOT EXISTS nft_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS verification_method TEXT;

-- Add NFT-related columns to votes table
ALTER TABLE votes 
ADD COLUMN IF NOT EXISTS nft_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS policy_id TEXT,
ADD COLUMN IF NOT EXISTS verification_method TEXT;

-- Create index for better performance on NFT queries
CREATE INDEX IF NOT EXISTS idx_wallets_nft_verified ON wallets(nft_verified);
CREATE INDEX IF NOT EXISTS idx_wallets_policy_id ON wallets(nft_policy_id);
CREATE INDEX IF NOT EXISTS idx_votes_nft_verified ON votes(nft_verified);
CREATE INDEX IF NOT EXISTS idx_votes_policy_id ON votes(policy_id);

-- Update existing policies to handle new columns (no changes needed, existing policies allow all operations)

-- Optional: Add a view for NFT-verified votes only
CREATE OR REPLACE VIEW nft_verified_votes AS
SELECT 
  v.*,
  w.nft_policy_id,
  w.nft_count,
  w.verification_method as wallet_verification_method
FROM votes v
JOIN wallets w ON v.wallet_address = w.address
WHERE v.nft_verified = true AND w.nft_verified = true;

-- Add comment for documentation
COMMENT ON COLUMN wallets.nft_verified IS 'NFT保有確認フラグ - NFT保有が確認された場合true';
COMMENT ON COLUMN wallets.nft_policy_id IS '確認されたNFTのCardano Policy ID';
COMMENT ON COLUMN wallets.nft_count IS '保有しているNFTの数量';
COMMENT ON COLUMN wallets.verification_method IS 'NFT検証に使用したAPI (blockfrost, koios, nmkr)';
COMMENT ON COLUMN votes.nft_verified IS '投票時のNFT保有確認状況';
COMMENT ON COLUMN votes.policy_id IS '投票時に確認されたPolicy ID';
COMMENT ON COLUMN votes.verification_method IS '投票時のNFT検証方法';
COMMENT ON VIEW nft_verified_votes IS 'NFT保有確認済み投票のみを表示するビュー';