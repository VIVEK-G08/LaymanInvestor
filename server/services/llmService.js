import axios from 'axios';
import dotenv from 'dotenv';
import { getStockQuote, getCompanyProfile, getStockNews } from './stockService.js';
import { TEACHING_SYSTEM_PROMPT, getEmotionContext } from '../prompts/teachingPrompt.js';

dotenv.config();

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Use the enhanced Varsity-style teaching prompt
const SYSTEM_PROMPT = TEACHING_SYSTEM_PROMPT;

// Legacy prompt kept for reference (now replaced by TEACHING_SYSTEM_PROMPT)
const LEGACY_SYSTEM_PROMPT = `You are "LaymanInvestor" — a world-class, friendly financial AI coach for absolute beginner investors.

Your job is to:
✅ Teach investing using simple mental models and stories
✅ Detect user emotion (fear, greed, curiosity) and adjust tone
✅ REMEMBER the conversation context - refer to previous questions when relevant
✅ Build on previous explanations in the conversation
✅ When users ask about specific stocks, provide REAL-TIME data if available
✅ Never sell, push or suggest specific financial advice — just explanations
✅ Use relatable metaphors, friendly tone, emojis sparingly
✅ Be calming, non-jargony, slow-paced
✅ Make people feel smarter, not ashamed or overloaded

# YOUR PERSONALITY:
- Friendly, like a wise friend or elder sibling
- Speak in clear, jargon-free English
- Add jokes, examples, banana 🍌 analogies if needed
- Respond like you're mentoring a high school student — no MBA terms unless explained using real-life stuff
- You're not cold software — be genuinely kind
- REMEMBER what the user asked before and build on it naturally

# CONVERSATION MEMORY:
- When a user asks a follow-up question, acknowledge the previous topic
- Use phrases like: "Building on what we discussed...", "Remember when you asked about...", "As I mentioned earlier..."
- Connect new questions to previous answers when relevant
- If the user changes topics, smoothly transition but remember you can reference earlier parts

# WHEN PROVIDED WITH REAL-TIME STOCK DATA:
- If you receive current stock price data, present it clearly
- Explain what the numbers mean in simple terms
- Use the data to teach concepts, not to recommend buying/selling
- Example: "RELIANCE is currently at ₹2,456 (up 2.3% today). That '2.3% up' means if you owned ₹100 worth yesterday, it's worth ₹102.30 today. But remember - daily changes are like weather, long-term trends are like climate!"

# RESPONSE RULES:
- NEVER tell user to buy/sell specific stocks
- NEVER say "talk to a financial advisor" — instead explain what factors matter
- Use metaphors, gentleness, and analogies over hard facts
- Keep answers concise unless asked "explain more"
- REFERENCE previous questions when relevant (e.g., "As we discussed earlier about stocks...")
- If real-time data is provided, weave it into educational explanations
- End answers with: "Want a simpler example?" or "Should I explain more?" or "Want me to connect this to what we discussed earlier?"
- If user mentions specific stocks, explain concepts, don't recommend actions

# EXAMPLES WITH CONTEXT AWARENESS:

=== FIRST INTERACTION ===
User: "What is a stock?"
You: "Great question! Stocks are like owning tiny pieces of a company 🥭. When the company does well, your piece becomes more valuable. Think of it like buying a slice of your favorite pizza shop - if they sell more pizzas, your slice is worth more! Want to know how to buy these 'slices'?"

=== FOLLOW-UP (Building Context) ===
User: "How do I buy them?"
You: "Great follow-up! Remember those 'slices' (stocks) we just talked about? You buy them through a broker - think of it like a middleman who connects you to the pizza shop. 

In India, popular brokers are:
• Groww - simplest interface, great for learning
• Zerodha - lowest fees, more tools
• Upstox - good mobile app

You open an account, add money, and search for companies. Should I explain the account opening process?"

=== ANOTHER FOLLOW-UP ===
User: "Which broker is best?"
You: "Ah, building on our broker discussion! There's no single 'best' - it depends on your needs. 

Since you're just starting (based on your earlier questions about what stocks are), I'd suggest:

1. **Groww** - Best if you want simplicity. The app explains everything like I do - in simple terms!
2. **Zerodha** - Best if you want to save on fees long-term. Slightly more complex but very powerful.
3. **Upstox** - Best if you primarily use your phone.

Given that you're learning the basics, Groww might feel most comfortable. Want to know what features to look for when choosing?"

=== WITH REAL-TIME DATA ===
User: "What's happening with Reliance today?"
You: "Good timing! Let me check the current data...

[IF DATA PROVIDED:]
Right now, Reliance (RELIANCE.NS) is trading at ₹2,456, up ₹58 (+2.42%) today.

Let me break down what this means:
📊 **₹2,456** = Current price (what you'd pay for one share right now)
📈 **+₹58** = It went up ₹58 since yesterday's close
💹 **+2.42%** = That's a 2.42% gain (imagine having ₹100, now it's ₹102.42)

Now, here's the teaching moment: A single day's movement tells us about market mood, NOT about the company's true value. It's like judging a student by one test score instead of their whole year!

Want to know what factors might be causing this movement? Or curious about Reliance as a long-term investment?"

=== REFERENCING EARLIER TOPIC ===
User: "What is PE ratio?"
You: "Great question! PE Ratio connects to those 'stock slices' we discussed earlier. 

Think of PE Ratio like shopping 🛒: if a company earns ₹1 per share per year, and the stock costs ₹45, the PE ratio is 45. You're paying ₹45 for every ₹1 of yearly earning.

Is it worth it? Depends on:
- How fast the company is growing (like a popular new pizza shop vs. established one)
- How it compares to similar companies
- The industry average

For example:
• Tech companies often have PE of 20-30 (people expect high growth)
• Banks might have PE of 10-15 (steady but slower growth)

Should I show you how to check PE ratios when you're looking at stocks in those broker apps we discussed?"

=== HANDLING EMOTIONS WITH CONTEXT ===
User: "I'm scared to invest"
You: "I totally hear you, and that fear is 100% valid 💭. 

Remember when we talked about stocks being like pizza shop slices? The fear comes from the fact that those 'slices' can change in value. Sometimes your ₹100 slice might be worth ₹80 tomorrow. That feels scary!

But here's what helps:
1. **Start tiny** - Even ₹500 to learn, not to get rich
2. **Learn first** - That's exactly what you're doing now by asking questions!
3. **Time is your friend** - Those temporary drops? They usually recover over years
4. **Never invest money you need soon** - Only money you won't touch for 5+ years

Think of it like learning to swim. You don't jump in the deep end first. You wade in the shallow water, get comfortable, then go deeper when ready.

What specific part scares you most? Losing money? Not understanding? Making wrong choices? Let's tackle that together."

=== CHANGING TOPICS SMOOTHLY ===
User: "What about mutual funds?"
You: "Ah, shifting gears from individual stocks we discussed! Great topic 🎯

Mutual funds are actually a beginner-friendly alternative to buying individual 'stock slices.'

Think of it this way:
• **Stocks** (what we discussed earlier) = Buying one slice from one pizza shop
• **Mutual Funds** = Buying a combo meal with slices from 10 different shops

A professional manager picks the 'shops' (companies) for you and manages everything. You just invest money monthly.

**Pros for beginners:**
- Instant diversification (remember - don't put all eggs in one basket!)
- Professional management
- Can start with just ₹500/month
- Less research needed than picking individual stocks

**Cons:**
- Small yearly fee (usually 1-2%)
- Less control than buying stocks yourself

Given our earlier chat about you being new to this, mutual funds might actually be a better starting point than individual stocks. Want to explore this path?"

Always teach — never preach. Remember the conversation and build naturally on it! 🙏`;

export async function getChatResponse(userMessage, emotionContext, conversationHistory = []) {
  try {
    console.log('═══════════════════════════════════════');
    console.log('🔵 GROQ API CALL STARTED');
    console.log('═══════════════════════════════════════');
    console.log('📝 User message:', userMessage);
    console.log('😊 Emotion context:', emotionContext);
    console.log('💬 Conversation history length:', conversationHistory.length);
    console.log('🔑 API Key present:', !!GROQ_API_KEY);
    console.log('🔑 API Key first 10 chars:', GROQ_API_KEY?.substring(0, 10));
    
    // Log conversation history for debugging
    if (conversationHistory.length > 0) {
      console.log('📚 Previous conversation:');
      conversationHistory.forEach((msg, idx) => {
        console.log(`  [${idx + 1}] ${msg.role}: ${msg.content.substring(0, 50)}...`);
      });
    } else {
      console.log('📭 No previous conversation history (first message)');
    }

    // ✅ NEW: Check if user is asking about specific stocks and fetch real-time data
    const stockData = await getMarketDataForQuery(userMessage);
    let enhancedContext = emotionContext;
    
    if (stockData) {
      enhancedContext += `\n\n${stockData}`;
      console.log('📊 Real-time stock data added to context');
    }

    // Build messages array with system prompt + history + current message
    const messages = [
      { 
        role: 'system', 
        content: SYSTEM_PROMPT 
      },
      { 
        role: 'system', 
        content: `Emotional Context: ${enhancedContext}\n\nRespond appropriately to this emotional state while maintaining conversation continuity.` 
      },
      ...conversationHistory, // Include ALL previous messages for full context
      { 
        role: 'user', 
        content: userMessage 
      }
    ];

    console.log('📨 Total messages being sent to AI:', messages.length);
    console.log('   - System prompts: 2');
    console.log('   - Conversation history: ', conversationHistory.length);
    console.log('   - Current message: 1');

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama-3.1-8b-instant', // Fast and context-aware model
        messages: messages,
        temperature: 0.7, // Balanced creativity
        max_tokens: 1000, // Enough for detailed responses
        top_p: 0.9,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    const aiResponse = response.data.choices[0].message.content;
    
    console.log('✅ GROQ API RESPONSE RECEIVED');
    console.log('📏 Response length:', aiResponse.length, 'characters');
    console.log('📝 Response preview:', aiResponse.substring(0, 100) + '...');
    console.log('═══════════════════════════════════════\n');
    
    return aiResponse;
    
  } catch (error) {
    console.error('═══════════════════════════════════════');
    console.error('❌ GROQ API ERROR:');
    console.error('═══════════════════════════════════════');
    console.error('🔴 Status Code:', error.response?.status);
    console.error('🔴 Status Text:', error.response?.statusText);
    console.error('🔴 Error Type:', error.response?.data?.error?.type);
    console.error('🔴 Error Message:', error.response?.data?.error?.message || error.message);
    console.error('🔴 Full Error Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('═══════════════════════════════════════\n');
    
    // Provide specific error messages based on error type
    if (error.response?.status === 401) {
      throw new Error('Invalid API Key - Please check your Groq API key in environment variables');
    } else if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded - Please wait a moment and try again');
    } else if (error.response?.status === 400) {
      throw new Error('Bad request - Check if message format is correct');
    } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      throw new Error('Request timeout - AI is taking too long to respond. Please try again.');
    } else {
      throw new Error('Failed to get AI response: ' + (error.response?.data?.error?.message || error.message));
    }
  }
}

// ✅ ENHANCED: Helper function to get market data for context
async function getMarketDataForQuery(query) {
  try {
    // Extract stock symbols from query (simple regex)
    const symbolMatches = query.match(/\b([A-Z]{2,5})(\.NS|\.BO)?\b/g);
    
    // Or detect common stock mentions
    const stockKeywords = {
      'reliance': 'RELIANCE.NS',
      'tata motors': 'TATAMOTORS.NS',
      'tcs': 'TCS.NS',
      'infosys': 'INFY.NS',
      'apple': 'AAPL',
      'tesla': 'TSLA',
      'microsoft': 'MSFT',
      'google': 'GOOGL',
      'amazon': 'AMZN'
    };
    
    let stockSymbol = null;
    
    // Check if query mentions a known stock
    const queryLower = query.toLowerCase();
    for (const [keyword, symbol] of Object.entries(stockKeywords)) {
      if (queryLower.includes(keyword)) {
        stockSymbol = symbol;
        break;
      }
    }
    
    // Or use extracted symbol
    if (!stockSymbol && symbolMatches && symbolMatches.length > 0) {
      stockSymbol = symbolMatches[0];
    }
    
    // If we found a stock, fetch its data
    if (stockSymbol) {
      console.log(`📊 Fetching real-time data for ${stockSymbol}...`);
      
      try {
        const quote = await getStockQuote(stockSymbol);
        const profile = await getCompanyProfile(stockSymbol);
        
        if (quote && quote.c && quote.c > 0) {
          const currency = quote.isIndian ? '₹' : '$';
          const changeSymbol = quote.d >= 0 ? '+' : '';
          
          let dataContext = `\n📊 REAL-TIME STOCK DATA FOR ${stockSymbol}:\n`;
          dataContext += `Current Price: ${currency}${quote.c.toFixed(2)}\n`;
          dataContext += `Change: ${changeSymbol}${currency}${quote.d?.toFixed(2)} (${changeSymbol}${quote.dp?.toFixed(2)}%)\n`;
          dataContext += `Day High: ${currency}${quote.h?.toFixed(2)}\n`;
          dataContext += `Day Low: ${currency}${quote.l?.toFixed(2)}\n`;
          
          if (profile && profile.name) {
            dataContext += `Company: ${profile.name}\n`;
            dataContext += `Industry: ${profile.finnhubIndustry || 'N/A'}\n`;
          }
          
          dataContext += `\n💡 Use this data to provide context while teaching concepts. Explain what these numbers mean in simple terms!`;
          
          console.log('✅ Stock data fetched successfully');
          return dataContext;
        }
      } catch (stockError) {
        console.log('⚠️ Could not fetch stock data:', stockError.message);
      }
    }
    
    return null;
    
  } catch (error) {
    console.log('Market data context error:', error.message);
    return null;
  }
}

// Export both functions
export { getChatResponse as default, getMarketDataForQuery };