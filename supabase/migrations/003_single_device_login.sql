-- Single Device Login: Session Management Table
-- This table tracks active sessions for each user to enforce single-device login

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  device_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Create index for faster lookups by email
CREATE INDEX IF NOT EXISTS idx_user_sessions_email ON user_sessions(user_email);

-- Create index for faster lookups by session token
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);

-- Enable RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to manage their own sessions
DROP POLICY IF EXISTS "Users can manage own sessions" ON user_sessions;
CREATE POLICY "Users can manage own sessions" ON user_sessions
  FOR ALL
  USING (
    user_email = COALESCE(
      (auth.jwt()->>'email'),
      (auth.uid()::text)
    )
  )
  WITH CHECK (
    user_email = COALESCE(
      (auth.jwt()->>'email'),
      (auth.uid()::text)
    )
  );

-- Allow read access for session validation (needed for client-side validation)
DROP POLICY IF EXISTS "Allow read for validation" ON user_sessions;
CREATE POLICY "Allow read for validation" ON user_sessions
  FOR SELECT
  USING (true);

-- Allow insert for creating new sessions
DROP POLICY IF EXISTS "Allow insert for login" ON user_sessions;
CREATE POLICY "Allow insert for login" ON user_sessions
  FOR INSERT
  WITH CHECK (true);

-- Allow update for deactivating sessions
DROP POLICY IF EXISTS "Allow update for logout" ON user_sessions;
CREATE POLICY "Allow update for logout" ON user_sessions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Function to deactivate old sessions when user logs in from new device
CREATE OR REPLACE FUNCTION deactivate_old_sessions(p_email TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE user_sessions
  SET is_active = FALSE
  WHERE user_email = p_email AND is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create new session
CREATE OR REPLACE FUNCTION create_user_session(
  p_email TEXT,
  p_token TEXT,
  p_device_info TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_session_id UUID;
BEGIN
  -- First deactivate all old sessions for this user
  PERFORM deactivate_old_sessions(p_email);
  
  -- Insert new session
  INSERT INTO user_sessions (user_email, session_token, device_info)
  VALUES (p_email, p_token, p_device_info)
  RETURNING id INTO v_session_id;
  
  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate session token
CREATE OR REPLACE FUNCTION validate_session(p_email TEXT, p_token TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_valid BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM user_sessions
    WHERE user_email = p_email 
      AND session_token = p_token 
      AND is_active = TRUE
  ) INTO v_valid;
  
  RETURN COALESCE(v_valid, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current active session
CREATE OR REPLACE FUNCTION get_active_session(p_email TEXT)
RETURNS TABLE(
  id UUID,
  session_token TEXT,
  device_info TEXT,
  created_at TIMESTAMPTZ,
  last_active TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, s.session_token, s.device_info, s.created_at, s.last_active
  FROM user_sessions s
  WHERE s.user_email = p_email AND s.is_active = TRUE
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to logout (deactivate current session)
CREATE OR REPLACE FUNCTION logout_session(p_email TEXT, p_token TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE user_sessions
  SET is_active = FALSE
  WHERE user_email = p_email AND session_token = p_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
