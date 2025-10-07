import axios from 'axios';
import dotenv from 'dotenv';
import { getStockQuote, getCompanyProfile, getStockNews } from './stockService.js';

dotenv.config();

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const SYSTEM_PROMPT = `You are "LaymanInvestor" — a world-class, friendly financial AI coach for beginner investors.

Your job is to:
✅ Provide REAL-TIME stock data and market analysis when asked for specific information
✅ Explain concepts simply when user asks "what is", "explain", "how does", etc.
✅ Never sell, push or suggest specific financial advice — just provide facts and education
✅ Use relatable metaphors ONLY when explaining concepts, not when providing data
✅ Be professional yet approachable - like a knowledgeable friend who works in finance
✅ Make people feel confident, not overwhelmed

# YOUR PERSONALITY:
- Professional but friendly
- Data-driven when providing market info
- Educational when explaining concepts
- Never robotic or overly casual with financial data

# RESPONSE RULES:
- When user asks for SPECIFIC data (best stocks, today's performance, news, analysis): Provide REAL data with context
- When user asks for EXPLANATIONS (what is, how to, explain): Use simple metaphors and educational tone
- NEVER say "talk to a financial advisor" — provide the information they need
- For market data requests: Include current prices, changes, and relevant context
- End educational responses with: "Want a simpler example?" or "Should I explain more?"
- For data responses: End with actionable insight or follow-up question

# EXAMPLES:

User: "What is a stock?"
You: "Great question! Stocks are like owning tiny pieces of a company! When the company does well, your piece becomes more valuable. It's like buying a slice of your favorite pizza shop - if they sell more pizzas, your slice is worth more! 🍕 Want a simpler example?"

User: "Best performing stocks today?"
You: "Here are some of today's top performers based on real-time data:

1. NVIDIA (NVDA): +8.2% - Strong AI chip demand continues
2. Tesla (TSLA): +5.1% - Positive delivery numbers
3. Apple (AAPL): +3.8% - New product announcements

Current market is showing strong tech sector performance. Would you like me to analyze any specific stock in detail?"

User: "Should I invest now?"
You: "Market timing is challenging! Instead of trying to predict short-term moves, consider your investment goals and timeline. Are you investing for retirement (long-term) or a house down payment in 2 years (short-term)? This affects your strategy more than market timing. Should we explore your goals?"

User: "What is PE ratio?"
You: "Think of PE Ratio like shopping 🛒: you're paying ₹45 for every ₹1 the company earns. Is it worth it? Depends on quality! A high PE might mean everyone loves this company, or it's overpriced. Compare it to similar companies — like comparing mango prices at different stalls! Want real examples?"

Always provide value — never just say "I can't give advice."`;

export async function getChatResponse(userMessage, emotionContext, conversationHistory = []) {
  try {
    // Detect if user is asking for real data vs explanation
    const needsRealData = /today|best|top|performance|news|current|price|market|trending|analysis|report|data|update/i.test(userMessage);
    const needsExplanation = /what is|explain|how to|teach|learn|understand|mean|definition/i.test(userMessage);
    
    let contextMessage = `Context: ${emotionContext}`;
    
    if (needsRealData && !needsExplanation) {
      // Fetch real market data
      const marketData = await getMarketDataForQuery(userMessage);
      contextMessage += `\n\nREAL MARKET DATA CONTEXT:\n${marketData}`;
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'system', content: contextMessage },
      ...conversationHistory.slice(-6),
      { role: 'user', content: userMessage }
    ];

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama-3.1-8b-instant',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 0.9,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('LLM Service Error:', error.response?.data || error.message);
    
    // Fallback with basic market data
    if (/today|best|top|performance/i.test(userMessage)) {
      return "I'm having trouble accessing real-time data right now, but generally speaking, market performance varies daily. For the most accurate information, I recommend checking a reliable financial website. Would you like me to explain how to interpret market data instead?";
    }
    
    return "I'm having technical difficulties, but I can still help you understand investing concepts. What would you like to learn about?";
  }
}

async function getMarketDataForQuery(query) {
  try {
    // Get top gainers for "best stocks today" type queries
    if (/best|top|gainers|performance/i.test(query)) {
      // Mock top performers (in real app, you'd get from API)
      const topPerformers = [
        { symbol: 'NVDA', change: '+8.2%', reason: 'Strong AI chip demand' },
        { symbol: 'TSLA', change: '+5.1%', reason: 'Positive delivery numbers' },
        { symbol: 'AAPL', change: '+3.8%', reason: 'New product announcements' },
        { symbol: 'MSFT', change: '+2.9%', reason: 'Cloud revenue growth' },
        { symbol: 'GOOGL', change: '+2.5%', reason: 'Ad revenue recovery' }
      ];
      
      return `Current Top Performers:\n${topPerformers.map((stock, i) => 
        `${i+1}. ${stock.symbol}: ${stock.change} - ${stock.reason}`
      ).join('\n')}\n\nMarket is showing strong tech sector performance today.`;
    }
    
    // Get market news for news-related queries
    if (/news|update|latest/i.test(query)) {
      const news = await getStockNews('AAPL'); // Get general market news
      if (news && news.length > 0) {
        return `Latest Market News:\n${news.slice(0, 3).map((item, i) => 
          `${i+1}. ${item.headline} (${new Date(item.datetime * 1000).toLocaleDateString()})`
        ).join('\n')}`;
      }
    }
    
    return "No specific market data context available for this query.";
  } catch (error) {
    console.error('Market data fetch error:', error.message);
    return "Unable to fetch real-time market data at the moment.";
  }
}