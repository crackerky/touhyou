-- Create auth_sessions table for login tracking
CREATE TABLE IF NOT EXISTS auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  login_method TEXT NOT NULL DEFAULT 'email', -- email, google, etc.
  ip_address TEXT,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create auth_attempts table for security tracking
CREATE TABLE IF NOT EXISTS auth_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  attempt_type TEXT NOT NULL, -- login, signup, password_reset
  success BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  ip_address TEXT,
  user_agent TEXT,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_token ON auth_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_active ON auth_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires ON auth_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_email ON auth_attempts(email);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_attempted_at ON auth_attempts(attempted_at);

-- Add updated_at trigger for auth_sessions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_auth_sessions_updated_at 
  BEFORE UPDATE ON auth_sessions 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own sessions
CREATE POLICY "Users can view their own sessions" ON auth_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own sessions (for logout, etc.)
CREATE POLICY "Users can update their own sessions" ON auth_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Only authenticated users can insert sessions (handled by auth functions)
CREATE POLICY "Authenticated users can insert sessions" ON auth_sessions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can view their own auth attempts
CREATE POLICY "Users can view their own attempts" ON auth_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.email = auth_attempts.email 
      AND users.id = auth.uid()
    )
  );

-- Anyone can insert auth attempts (for security logging)
CREATE POLICY "Anyone can insert auth attempts" ON auth_attempts
  FOR INSERT WITH CHECK (true);

-- Functions for session management
CREATE OR REPLACE FUNCTION create_auth_session(
  p_user_id UUID,
  p_email TEXT,
  p_session_token TEXT,
  p_login_method TEXT DEFAULT 'email',
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_expires_hours INTEGER DEFAULT 24
)
RETURNS UUID AS $$
DECLARE
  session_id UUID;
BEGIN
  -- Deactivate old sessions for this user
  UPDATE auth_sessions 
  SET is_active = false 
  WHERE user_id = p_user_id AND is_active = true;
  
  -- Create new session
  INSERT INTO auth_sessions (
    user_id, 
    email, 
    session_token, 
    login_method, 
    ip_address, 
    user_agent, 
    expires_at
  ) VALUES (
    p_user_id,
    p_email,
    p_session_token,
    p_login_method,
    p_ip_address,
    p_user_agent,
    NOW() + (p_expires_hours || ' hours')::INTERVAL
  ) RETURNING id INTO session_id;
  
  RETURN session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION log_auth_attempt(
  p_email TEXT,
  p_attempt_type TEXT,
  p_success BOOLEAN,
  p_error_message TEXT DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  attempt_id UUID;
BEGIN
  INSERT INTO auth_attempts (
    email,
    attempt_type,
    success,
    error_message,
    ip_address,
    user_agent
  ) VALUES (
    p_email,
    p_attempt_type,
    p_success,
    p_error_message,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO attempt_id;
  
  RETURN attempt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  UPDATE auth_sessions 
  SET is_active = false 
  WHERE expires_at < NOW() AND is_active = true;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to cleanup expired sessions (if pg_cron is available)
-- This would need to be run manually if pg_cron is not available
-- SELECT cron.schedule('cleanup-expired-sessions', '0 */6 * * *', 'SELECT cleanup_expired_sessions();');

COMMENT ON TABLE auth_sessions IS 'Stores active authentication sessions for users';
COMMENT ON TABLE auth_attempts IS 'Logs all authentication attempts for security monitoring';
COMMENT ON FUNCTION create_auth_session IS 'Creates a new authentication session and deactivates old ones';
COMMENT ON FUNCTION log_auth_attempt IS 'Logs an authentication attempt for security tracking';
COMMENT ON FUNCTION cleanup_expired_sessions IS 'Deactivates expired authentication sessions';