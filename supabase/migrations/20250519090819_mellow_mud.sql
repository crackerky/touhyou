/*
  # Create wallet verification voting tables

  1. New Tables
    - `wallets`
      - `id` (int, primary key)
      - `address` (text, unique)
      - `has_voted` (boolean)
      - `created_at` (timestamp)
    - `votes`
      - `id` (int, primary key)
      - `wallet_address` (text, foreign key to wallets.address)
      - `option` (text)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated and anonymous users
*/

-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id SERIAL PRIMARY KEY,
  address TEXT UNIQUE NOT NULL,
  has_voted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id SERIAL PRIMARY KEY,
  wallet_address TEXT NOT NULL REFERENCES wallets(address),
  option TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Create policies for wallets table
CREATE POLICY "Allow anonymous read access to wallets"
  ON wallets
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert access to wallets"
  ON wallets
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update access to wallets"
  ON wallets
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create policies for votes table
CREATE POLICY "Allow anonymous read access to votes"
  ON votes
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert access to votes"
  ON votes
  FOR INSERT
  TO anon
  WITH CHECK (true);