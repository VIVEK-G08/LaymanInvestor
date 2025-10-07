import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for backend
);

// ========== CHAT HISTORY ==========

export async function saveChatMessage(userId, role, content, emotion) {
  try {
    const { data, error } = await supabase
      .from('chat_history')
      .insert([
        {
          user_id: userId,
          role: role,
          content: content,
          emotion: emotion
        }
      ])
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Supabase Save Chat Error:', error.message);
    throw error;
  }
}

export async function getChatHistory(userId, limit = 50) {
  try {
    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Supabase Fetch Chat Error:', error.message);
    return [];
  }
}

export async function clearChatHistory(userId) {
  try {
    const { error } = await supabase
      .from('chat_history')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Supabase Clear Chat Error:', error.message);
    throw error;
  }
}

// ========== WATCHLIST ==========

export async function saveWatchedStock(userId, symbol) {
  try {
    const { data, error } = await supabase
      .from('watchlist')
      .insert([
        {
          user_id: userId,
          symbol: symbol.toUpperCase()
        }
      ])
      .select();

    if (error) {
      // If duplicate, just return success
      if (error.code === '23505') {
        return { message: 'Stock already in watchlist' };
      }
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Supabase Save Watchlist Error:', error.message);
    throw error;
  }
}

export async function getWatchlist(userId) {
  try {
    const { data, error } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Supabase Fetch Watchlist Error:', error.message);
    return [];
  }
}

export async function removeFromWatchlist(userId, symbol) {
  try {
    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('user_id', userId)
      .eq('symbol', symbol.toUpperCase());

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Supabase Remove Watchlist Error:', error.message);
    throw error;
  }
}

// ========== USER PROFILE ==========

export async function getUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Supabase Get Profile Error:', error.message);
    return null;
  }
}

export async function updateUserProfile(userId, updates) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Supabase Update Profile Error:', error.message);
    throw error;
  }
}