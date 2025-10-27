import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Create a new chat session
 */
export async function createChatSession(userId, name = 'New Chat', country = 'IN') {
  try {
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert([
        {
          user_id: userId,
          name: name,
          country: country,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          message_count: 0
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating chat session:', error);
    throw error;
  }
}

/**
 * Get all chat sessions for a user
 */
export async function getUserChatSessions(userId) {
  try {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    return [];
  }
}

/**
 * Get a specific chat session
 */
export async function getChatSession(sessionId) {
  try {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching chat session:', error);
    return null;
  }
}

/**
 * Update chat session name
 */
export async function updateChatSessionName(sessionId, newName) {
  try {
    const { data, error } = await supabase
      .from('chat_sessions')
      .update({ 
        name: newName,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating chat session:', error);
    throw error;
  }
}

/**
 * Delete a chat session and its messages
 */
export async function deleteChatSession(sessionId) {
  try {
    // First delete all messages in the session
    await supabase
      .from('chat_messages')
      .delete()
      .eq('session_id', sessionId);

    // Then delete the session
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting chat session:', error);
    throw error;
  }
}

/**
 * Update session's updated_at timestamp and message count
 */
export async function updateSessionActivity(sessionId) {
  try {
    // Get current message count
    const { count } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId);

    // Update session
    const { data, error } = await supabase
      .from('chat_sessions')
      .update({ 
        updated_at: new Date().toISOString(),
        message_count: count || 0
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating session activity:', error);
    throw error;
  }
}

/**
 * Get messages for a specific session
 */
export async function getSessionMessages(sessionId) {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching session messages:', error);
    return [];
  }
}

/**
 * Save a message to a session
 */
export async function saveMessageToSession(sessionId, userId, role, content, emotion = null) {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([
        {
          session_id: sessionId,
          user_id: userId,
          role: role,
          content: content,
          emotion: emotion,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Update session activity
    await updateSessionActivity(sessionId);

    return data;
  } catch (error) {
    console.error('Error saving message to session:', error);
    throw error;
  }
}
