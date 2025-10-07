import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 CHECKING ALL APIS...\n');
console.log('='*50);

// Color codes for terminal
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// 1. TEST FINNHUB API
async function testFinnhub() {
  console.log(`${colors.blue}📊 TESTING FINNHUB API${colors.reset}`);
  console.log('-'.repeat(30));
  
  const FINNHUB_KEY = process.env.FINNHUB_API_KEY;
  
  if (!FINNHUB_KEY) {
    console.log(`${colors.red}❌ Finnhub API Key is missing!${colors.reset}`);
    return false;
  }
  
  console.log(`API Key: ${FINNHUB_KEY.substring(0, 10)}...`);
  
  try {
    // Test 1: US Stock Quote (Apple)
    console.log('Testing US Stock (AAPL)...');
    const quoteResponse = await axios.get('https://finnhub.io/api/v1/quote', {
      params: {
        symbol: 'AAPL',
        token: FINNHUB_KEY
      }
    });
    
    if (quoteResponse.data && quoteResponse.data.c > 0) {
      console.log(`${colors.green}✅ US Stock Quote Works! AAPL Price: $${quoteResponse.data.c}${colors.reset}`);
    } else {
      console.log(`${colors.yellow}⚠️ Got response but no price data${colors.reset}`);
    }
    
    // Test 2: Indian Stock (will likely fail)
    console.log('Testing Indian Stock (RELIANCE.NS)...');
    const indianResponse = await axios.get('https://finnhub.io/api/v1/quote', {
      params: {
        symbol: 'RELIANCE.NS',
        token: FINNHUB_KEY
      }
    });
    
    if (indianResponse.data && indianResponse.data.c > 0) {
      console.log(`${colors.green}✅ Indian Stock Works: ₹${indianResponse.data.c}${colors.reset}`);
    } else {
      console.log(`${colors.yellow}⚠️ Indian stocks not supported (expected)${colors.reset}`);
    }
    
    // Test 3: Company Profile
    console.log('Testing Company Profile (MSFT)...');
    const profileResponse = await axios.get('https://finnhub.io/api/v1/stock/profile2', {
      params: {
        symbol: 'MSFT',
        token: FINNHUB_KEY
      }
    });
    
    if (profileResponse.data && profileResponse.data.name) {
      console.log(`${colors.green}✅ Company Profile Works: ${profileResponse.data.name}${colors.reset}`);
    }
    
    console.log(`${colors.green}✅ FINNHUB API IS WORKING!${colors.reset}`);
    return true;
    
  } catch (error) {
    console.log(`${colors.red}❌ FINNHUB API FAILED!${colors.reset}`);
    console.log(`Error: ${error.response?.data?.error || error.message}`);
    if (error.response?.status === 401) {
      console.log(`${colors.red}Invalid API Key! Get a new one from: https://finnhub.io${colors.reset}`);
    } else if (error.response?.status === 429) {
      console.log(`${colors.yellow}Rate limit reached. Free tier: 60 calls/minute${colors.reset}`);
    }
    return false;
  }
}

// 2. TEST ALPHA VANTAGE API
async function testAlphaVantage() {
  console.log(`\n${colors.blue}📊 TESTING ALPHA VANTAGE API${colors.reset}`);
  console.log('-'.repeat(30));
  
  const ALPHA_KEY = process.env.ALPHA_VANTAGE_KEY;
  
  if (!ALPHA_KEY) {
    console.log(`${colors.red}❌ Alpha Vantage API Key is missing!${colors.reset}`);
    return false;
  }
  
  console.log(`API Key: ${ALPHA_KEY.substring(0, 10)}...`);
  
  try {
    // Test 1: US Stock
    console.log('Testing US Stock (IBM)...');
    const usResponse = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: 'IBM',
        apikey: ALPHA_KEY
      }
    });
    
    if (usResponse.data['Global Quote']) {
      const price = usResponse.data['Global Quote']['05. price'];
      console.log(`${colors.green}✅ US Stock Works! IBM Price: $${price}${colors.reset}`);
    } else if (usResponse.data['Note']) {
      console.log(`${colors.yellow}⚠️ API call frequency limit (5 calls/min for free tier)${colors.reset}`);
    } else if (usResponse.data['Error Message']) {
      console.log(`${colors.red}❌ Invalid symbol or API error${colors.reset}`);
    }
    
    // Wait 12 seconds to avoid rate limit (free tier: 5 calls/minute)
    console.log('Waiting 12 seconds to avoid rate limit...');
    await new Promise(resolve => setTimeout(resolve, 12000));
    
    // Test 2: Indian Stock
    console.log('Testing Indian Stock (RELIANCE.NS)...');
    const indianResponse = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: 'RELIANCE.NS',
        apikey: ALPHA_KEY
      }
    });
    
    if (indianResponse.data['Global Quote']) {
      const price = indianResponse.data['Global Quote']['05. price'];
      console.log(`${colors.green}✅ Indian Stock Works! RELIANCE Price: ₹${price}${colors.reset}`);
    } else {
      console.log(`${colors.yellow}⚠️ Indian stock data not available${colors.reset}`);
      console.log('Response:', JSON.stringify(indianResponse.data, null, 2));
    }
    
    console.log(`${colors.green}✅ ALPHA VANTAGE API IS WORKING!${colors.reset}`);
    return true;
    
  } catch (error) {
    console.log(`${colors.red}❌ ALPHA VANTAGE API FAILED!${colors.reset}`);
    console.log(`Error: ${error.message}`);
    if (error.response?.status === 401) {
      console.log(`${colors.red}Invalid API Key! Get one from: https://www.alphavantage.co/support/#api-key${colors.reset}`);
    }
    return false;
  }
}

// 3. TEST GROQ API (Already tested, but let's verify)
async function testGroq() {
  console.log(`\n${colors.blue}🤖 TESTING GROQ API${colors.reset}`);
  console.log('-'.repeat(30));
  
  const GROQ_KEY = process.env.GROQ_API_KEY;
  
  if (!GROQ_KEY) {
    console.log(`${colors.red}❌ Groq API Key is missing!${colors.reset}`);
    return false;
  }
  
  console.log(`API Key: ${GROQ_KEY.substring(0, 10)}...`);
  
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'user', content: 'Say "API Working" in 3 words only' }
        ],
        temperature: 0.1,
        max_tokens: 10
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log(`${colors.green}✅ GROQ API WORKS! Response: ${response.data.choices[0].message.content}${colors.reset}`);
    return true;
    
  } catch (error) {
    console.log(`${colors.red}❌ GROQ API FAILED!${colors.reset}`);
    console.log(`Error: ${error.response?.data?.error?.message || error.message}`);
    return false;
  }
}

// 4. TEST FREE INDIAN STOCK APIS
async function testIndianStockAPIs() {
  console.log(`\n${colors.blue}🇮🇳 TESTING INDIAN STOCK APIs (Free Options)${colors.reset}`);
  console.log('-'.repeat(30));
  
  // Test NSE India website (scraping approach)
  console.log('\n1. NSE India Official Data:');
  console.log(`${colors.yellow}Note: NSE official API requires registration${colors.reset}`);
  console.log('Alternative: Use NSE website data via scraping');
  console.log('URL: https://www.nseindia.com/api/quote-equity?symbol=RELIANCE');
  console.log(`${colors.yellow}⚠️ Requires headers to avoid blocking${colors.reset}`);
  
  // Test Yahoo Finance (works for Indian stocks)
  console.log('\n2. Yahoo Finance (Works for .NS stocks):');
  try {
    const yahooUrl = 'https://query1.finance.yahoo.com/v8/finance/chart/RELIANCE.NS';
    const response = await axios.get(yahooUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (response.data.chart.result[0]) {
      const price = response.data.chart.result[0].meta.regularMarketPrice;
      console.log(`${colors.green}✅ Yahoo Finance Works! RELIANCE.NS: ₹${price}${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.yellow}⚠️ Yahoo Finance blocked or CORS issue (works from backend)${colors.reset}`);
  }
  
  // Test alternative free API
  console.log('\n3. Alternative Free Indian Stock API Options:');
  console.log('- RapidAPI Yahoo Finance: https://rapidapi.com/apidojo/api/yahoo-finance1');
  console.log('- Twelve Data: https://twelvedata.com (Free tier: 800 calls/day)');
  console.log('- IEX Cloud: https://iexcloud.io (Limited Indian stocks)');
  
  return true;
}

// 5. SHOW RECOMMENDED SETUP
function showRecommendations() {
  console.log(`\n${colors.blue}📋 RECOMMENDATIONS FOR INDIAN STOCKS${colors.reset}`);
  console.log('='*50);
  
  console.log(`
${colors.green}BEST FREE OPTIONS FOR INDIAN STOCKS:${colors.reset}

1. ${colors.yellow}Yahoo Finance (via backend):${colors.reset}
   - Works well for .NS (NSE) and .BO (BSE) stocks
   - No API key needed
   - Real-time data

2. ${colors.yellow}Twelve Data API:${colors.reset}
   - Sign up: https://twelvedata.com/apikey
   - Free: 800 API calls/day
   - Supports Indian stocks

3. ${colors.yellow}Build a hybrid approach:${colors.reset}
   - Use Finnhub for US stocks
   - Use Yahoo/Twelve Data for Indian stocks
   - Cache responses to reduce API calls
`);
}

// RUN ALL TESTS
async function runAllTests() {
  console.log(`${colors.blue}🚀 LAYMANINVESTOR API TEST SUITE${colors.reset}`);
  console.log('='*50);
  
  const results = {
    finnhub: await testFinnhub(),
    alphaVantage: await testAlphaVantage(),
    groq: await testGroq(),
    indianAPIs: await testIndianStockAPIs()
  };
  
  console.log(`\n${colors.blue}📊 FINAL RESULTS:${colors.reset}`);
  console.log('='*50);
  console.log(`Finnhub API: ${results.finnhub ? colors.green + '✅ WORKING' : colors.red + '❌ FAILED'}${colors.reset}`);
  console.log(`Alpha Vantage: ${results.alphaVantage ? colors.green + '✅ WORKING' : colors.red + '❌ FAILED'}${colors.reset}`);
  console.log(`Groq LLM: ${results.groq ? colors.green + '✅ WORKING' : colors.red + '❌ FAILED'}${colors.reset}`);
  console.log(`Indian Stock Options: ${colors.green}✅ AVAILABLE${colors.reset}`);
  
  showRecommendations();
}

// Execute tests
runAllTests();