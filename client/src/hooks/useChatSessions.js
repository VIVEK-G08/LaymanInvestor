import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'https://laymaninvestor-backend.onrender.com/api';

export const useChatSessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all sessions for the user
  const fetchSessions = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/chat-sessions/${user.id}`);
      const data = await response.json();
      
      if (data.sessions) {
        setSessions(data.sessions);
        
        // Set first session as active if none selected
        if (!activeSession && data.sessions.length > 0) {
          setActiveSession(data.sessions[0]);
        }
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('Failed to load chat sessions');
    } finally {
      setLoading(false);
    }
  }, [user?.id, activeSession]);

  // Create a new session
  const createSession = async (name = 'New Chat', country = 'IN') => {
    if (!user?.id) return null;

    try {
      const response = await fetch(`${API_URL}/chat-sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name,
          country
        })
      });

      const data = await response.json();
      
      if (data.session) {
        setSessions(prev => [data.session, ...prev]);
        setActiveSession(data.session);
        return data.session;
      }
    } catch (err) {
      console.error('Error creating session:', err);
      setError('Failed to create session');
      return null;
    }
  };

  // Update session name
  const updateSessionName = async (sessionId, newName) => {
    try {
      const response = await fetch(`${API_URL}/chat-sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      });

      const data = await response.json();
      
      if (data.session) {
        setSessions(prev => 
          prev.map(s => s.id === sessionId ? data.session : s)
        );
        
        if (activeSession?.id === sessionId) {
          setActiveSession(data.session);
        }
      }
    } catch (err) {
      console.error('Error updating session:', err);
      setError('Failed to update session');
    }
  };

  // Delete a session
  const deleteSession = async (sessionId) => {
    try {
      await fetch(`${API_URL}/chat-sessions/${sessionId}`, {
        method: 'DELETE'
      });

      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      if (activeSession?.id === sessionId) {
        const remaining = sessions.filter(s => s.id !== sessionId);
        setActiveSession(remaining[0] || null);
      }
    } catch (err) {
      console.error('Error deleting session:', err);
      setError('Failed to delete session');
    }
  };

  // Get messages for a session
  const getSessionMessages = async (sessionId) => {
    try {
      const response = await fetch(`${API_URL}/chat-sessions/${sessionId}/messages`);
      const data = await response.json();
      return data.messages || [];
    } catch (err) {
      console.error('Error fetching messages:', err);
      return [];
    }
  };

  // Save message to session
  const saveMessage = async (sessionId, role, content, emotion = null) => {
    if (!user?.id) return null;

    try {
      const response = await fetch(`${API_URL}/chat-sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          role,
          content,
          emotion
        })
      });

      const data = await response.json();
      return data.message;
    } catch (err) {
      console.error('Error saving message:', err);
      return null;
    }
  };

  // Load sessions on mount
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    activeSession,
    setActiveSession,
    loading,
    error,
    createSession,
    updateSessionName,
    deleteSession,
    getSessionMessages,
    saveMessage,
    refreshSessions: fetchSessions
  };
};
