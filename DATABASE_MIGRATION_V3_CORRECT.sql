-- LaymanInvestor V3.0 Database Migration
-- CORRECTED for your actual database structure
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. Create chat_sessions table
-- ============================================
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT DEFAULT 'New Chat',
  country TEXT DEFAULT 'IN',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  message_count INTEGER DEFAULT 0
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON chat_sessions(updated_at DESC);

-- ============================================
-- 2. Add session_id to chat_history table
-- ============================================
ALTER TABLE chat_history 
ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_history_session_id ON chat_history(session_id);

-- ============================================
-- 3. Create default session for existing messages
-- ============================================
-- This will create a default session for each user and link their existing messages to it
DO $$
DECLARE
  user_record RECORD;
  new_session_id UUID;
BEGIN
  FOR user_record IN 
    SELECT DISTINCT user_id FROM chat_history WHERE session_id IS NULL
  LOOP
    -- Create a default session for this user
    INSERT INTO chat_sessions (user_id, name, created_at, updated_at)
    VALUES (user_record.user_id, 'Previous Conversations', NOW(), NOW())
    RETURNING id INTO new_session_id;
    
    -- Link all existing messages to this session
    UPDATE chat_history 
    SET session_id = new_session_id 
    WHERE user_id = user_record.user_id AND session_id IS NULL;
  END LOOP;
END $$;

-- ============================================
-- 4. Update message counts for all sessions
-- ============================================
UPDATE chat_sessions cs
SET message_count = (
  SELECT COUNT(*) 
  FROM chat_history ch 
  WHERE ch.session_id = cs.id
);

-- ============================================
-- 5. Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can create own sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON chat_sessions;

-- Create policies: Users can only see their own sessions
CREATE POLICY "Users can view own sessions" ON chat_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions" ON chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON chat_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON chat_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 6. Update chat_history RLS policies
-- ============================================
-- Check if RLS is enabled on chat_history
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can view messages in their sessions" ON chat_history;

-- Add policy for session-based access
CREATE POLICY "Users can view messages in their sessions" ON chat_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_sessions 
      WHERE chat_sessions.id = chat_history.session_id 
      AND chat_sessions.user_id = auth.uid()
    )
    OR auth.uid() = user_id  -- Fallback for messages without session
  );

-- ============================================
-- 7. Create helpful views (optional)
-- ============================================
CREATE OR REPLACE VIEW user_session_summary AS
SELECT 
  cs.id,
  cs.user_id,
  cs.name,
  cs.country,
  cs.created_at,
  cs.updated_at,
  cs.message_count,
  (SELECT content FROM chat_history WHERE session_id = cs.id ORDER BY created_at DESC LIMIT 1) as last_message,
  (SELECT created_at FROM chat_history WHERE session_id = cs.id ORDER BY created_at DESC LIMIT 1) as last_message_time
FROM chat_sessions cs
ORDER BY cs.updated_at DESC;

-- ============================================
-- 8. Add country preference to user_preferences (optional)
-- ============================================
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS preferred_country TEXT DEFAULT 'IN';

-- ============================================
-- 9. Verification queries
-- ============================================
-- Check if chat_sessions table was created
SELECT COUNT(*) as chat_sessions_exists 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'chat_sessions';

-- Check if session_id column was added to chat_history
SELECT COUNT(*) as session_id_column_exists
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'chat_history' 
AND column_name = 'session_id';

-- Count total sessions created
SELECT COUNT(*) as total_sessions FROM chat_sessions;

-- Count messages with sessions
SELECT COUNT(*) as messages_with_sessions FROM chat_history WHERE session_id IS NOT NULL;

-- Count messages without sessions (should be 0)
SELECT COUNT(*) as messages_without_sessions FROM chat_history WHERE session_id IS NULL;

-- Show session summary
SELECT 
  cs.name,
  cs.country,
  cs.message_count,
  cs.created_at,
  p.email as user_email
FROM chat_sessions cs
JOIN profiles p ON cs.user_id = p.id
ORDER BY cs.updated_at DESC
LIMIT 10;

-- ============================================
-- MIGRATION COMPLETE ✅
-- ============================================
-- Expected results:
-- 1. chat_sessions table created
-- 2. session_id column added to chat_history
-- 3. All existing messages linked to default sessions
-- 4. RLS policies enabled
-- 5. No messages without session_id

-- Next steps:
-- 1. Verify all queries above returned expected results
-- 2. Backend will auto-deploy with new routes
-- 3. Ready to build frontend components
