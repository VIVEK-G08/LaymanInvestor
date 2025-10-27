import express from 'express';
import {
  createChatSession,
  getUserChatSessions,
  getChatSession,
  updateChatSessionName,
  deleteChatSession,
  getSessionMessages,
  saveMessageToSession
} from '../services/sessionService.js';

const router = express.Router();

/**
 * GET /api/chat-sessions/:userId
 * Get all chat sessions for a user
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const sessions = await getUserChatSessions(userId);
    res.json({ sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch chat sessions' });
  }
});

/**
 * POST /api/chat-sessions
 * Create a new chat session
 */
router.post('/', async (req, res) => {
  try {
    const { userId, name, country } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const session = await createChatSession(userId, name, country);
    res.json({ session });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create chat session' });
  }
});

/**
 * GET /api/chat-sessions/session/:sessionId
 * Get a specific chat session
 */
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await getChatSession(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ session });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

/**
 * PUT /api/chat-sessions/:sessionId
 * Update chat session name
 */
router.put('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const session = await updateChatSessionName(sessionId, name);
    res.json({ session });
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({ error: 'Failed to update session' });
  }
});

/**
 * DELETE /api/chat-sessions/:sessionId
 * Delete a chat session
 */
router.delete('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    await deleteChatSession(sessionId);
    res.json({ success: true, message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

/**
 * GET /api/chat-sessions/:sessionId/messages
 * Get all messages for a session
 */
router.get('/:sessionId/messages', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const messages = await getSessionMessages(sessionId);
    res.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

/**
 * POST /api/chat-sessions/:sessionId/messages
 * Save a message to a session
 */
router.post('/:sessionId/messages', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { userId, role, content, emotion } = req.body;

    if (!userId || !role || !content) {
      return res.status(400).json({ error: 'userId, role, and content are required' });
    }

    const message = await saveMessageToSession(sessionId, userId, role, content, emotion);
    res.json({ message });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

export default router;
