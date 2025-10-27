-- LaymanInvestor V3.0 Database Migration
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. Create chat_sessions table
-- ============================================
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  name TEXT DEFAULT 'New Chat',
  country TEXT DEFAULT 'IN',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  message_count INTEGER DEFAULT 0
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON chat_sessions(updated_at DESC);

-- ============================================
-- 2. Add session_id to chat_messages table
-- ============================================
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);

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
    SELECT DISTINCT user_id FROM chat_messages WHERE session_id IS NULL
  LOOP
    -- Create a default session for this user
    INSERT INTO chat_sessions (user_id, name, created_at, updated_at)
    VALUES (user_record.user_id, 'Previous Conversations', NOW(), NOW())
    RETURNING id INTO new_session_id;
    
    -- Link all existing messages to this session
    UPDATE chat_messages 
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
  FROM chat_messages cm 
  WHERE cm.session_id = cs.id
);

-- ============================================
-- 5. Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own sessions
CREATE POLICY "Users can view own sessions" ON chat_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy: Users can insert their own sessions
CREATE POLICY "Users can create own sessions" ON chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own sessions
CREATE POLICY "Users can update own sessions" ON chat_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy: Users can delete their own sessions
CREATE POLICY "Users can delete own sessions" ON chat_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 6. Update chat_messages RLS policies
-- ============================================
-- Add policy for session-based access
CREATE POLICY "Users can view messages in their sessions" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_sessions 
      WHERE chat_sessions.id = chat_messages.session_id 
      AND chat_sessions.user_id = auth.uid()
    )
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
  (SELECT content FROM chat_messages WHERE session_id = cs.id ORDER BY created_at DESC LIMIT 1) as last_message,
  (SELECT created_at FROM chat_messages WHERE session_id = cs.id ORDER BY created_at DESC LIMIT 1) as last_message_time
FROM chat_sessions cs
ORDER BY cs.updated_at DESC;

-- ============================================
-- 8. Verification queries
-- ============================================
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('chat_sessions', 'chat_messages');

-- Count sessions
SELECT COUNT(*) as total_sessions FROM chat_sessions;

-- Count messages with sessions
SELECT COUNT(*) as messages_with_sessions FROM chat_messages WHERE session_id IS NOT NULL;

-- Count messages without sessions (should be 0)
SELECT COUNT(*) as messages_without_sessions FROM chat_messages WHERE session_id IS NULL;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Next steps:
-- 1. Verify all queries above returned expected results
-- 2. Test creating a new session via API
-- 3. Test fetching sessions via API
-- 4. Deploy backend with new routes
