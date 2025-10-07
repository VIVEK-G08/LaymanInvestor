import express from 'express';
import { getChatResponse } from '../services/llmService.js';
import { saveChatMessage, getChatHistory, clearChatHistory } from '../services/supabaseService.js';
import { detectEmotion, getEmotionContext } from '../utils/emotionDetector.js';

const router = express.Router();

// POST /api/chat/message
router.post('/message', async (req, res) => {
  try {
    const { message, userId, conversationHistory = [] } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Detect emotion
    const emotion = detectEmotion(message);
    const emotionContext = getEmotionContext(emotion);

    // Get AI response
    const aiResponse = await getChatResponse(message, emotionContext, conversationHistory);

    // Save to database
    await saveChatMessage(userId, 'user', message, emotion);
    await saveChatMessage(userId, 'assistant', aiResponse, emotion);

    res.json({
      response: aiResponse,
      emotion: emotion,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      message: error.message 
    });
  }
});

// GET /api/chat/history/:userId
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await getChatHistory(userId);
    res.json({ history });
  } catch (error) {
    console.error('History Error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// DELETE /api/chat/history/:userId
router.delete('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    await clearChatHistory(userId);
    res.json({ success: true, message: 'Chat history cleared' });
  } catch (error) {
    console.error('Clear History Error:', error);
    res.status(500).json({ error: 'Failed to clear history' });
  }
});

export default router;