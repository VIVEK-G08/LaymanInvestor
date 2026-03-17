import { getStockQuote } from './stockService.js';
import cache from '../utils/cache.js';

// Popular stocks to track for gainers/losers (Indian + US)
const TRACKED_STOCKS = [
  'RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'HDFCBANK.NS', 'ICICIBANK.NS',
  'SBIN.NS', 'TATAMOTORS.NS', 'TATASTEEL.NS', 'WIPRO.NS', 'LT.NS',
  'BAJFINANCE.NS', 'MARUTI.NS', 'TITAN.NS', 'SUNPHARMA.NS', 'ONGC.NS',
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX'
];

/**
 * Get top gainers and losers from tracked Indian stocks using NSE-BSE API
 * @param {number} limit - Number of stocks to return
 * @returns {Promise<Object>} Object with gainers and losers arrays
 */
export async function getTopMovers(limit = 5) {
  const cacheKey = `top_movers_${limit}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    console.log('Returning cached top movers');
    return cached;
  }

  try {
    console.log('Fetching fresh top movers data from NSE-BSE...');
    
    // Fetch quotes for all tracked Indian stocks in parallel
    const quotes = await Promise.all(
      TRACKED_STOCKS.map(async (symbol) => {
        try {
          const quote = await getStockQuote(symbol);
          if (quote && quote.c > 0) {
            return {
              symbol: quote.symbol,
              name: quote.name || getStockName(symbol),
              price: quote.c,
              change: quote.d,
              changePercent: quote.dp,
              isIndian: true,
              exchange: quote.exchange
            };
          }
          return null;
        } catch (error) {
          console.error(`Error fetching ${symbol}:`, error.message);
          return null;
        }
      })
    );

    // Filter out null results
    const validQuotes = quotes.filter(quote => quote !== null);
    
    // Sort by change percentage
    const sortedByChange = validQuotes.sort((a, b) => b.changePercent - a.changePercent);
    
    // Get top gainers and losers
    const gainers = sortedByChange
      .filter(quote => quote.changePercent > 0)
      .slice(0, limit)
      .map(quote => ({
        ...quote,
        price: `₹${quote.price.toFixed(2)}`,
        change: `+${quote.changePercent.toFixed(2)}%`,
        isGainer: true
      }));

    const losers = sortedByChange
      .filter(quote => quote.changePercent < 0)
      .reverse()
      .slice(0, limit)
      .map(quote => ({
        ...quote,
        price: `₹${quote.price.toFixed(2)}`,
        change: `${quote.changePercent.toFixed(2)}%`,
        isGainer: false
      }));

    const result = { gainers, losers };
    
    // Cache for 5 minutes
    cache.set(cacheKey, result, 300);
    
    console.log(`Found ${gainers.length} gainers and ${losers.length} losers`);
    return result;
  } catch (error) {
    console.error('Top Movers Error:', error);
    return getFallbackMovers(limit);
  }
}

/**
 * Get trending stocks (highest volume/movers)
 * @param {number} limit - Number of stocks to return
 * @returns {Promise<Object>} Object with trending array
 */
export async function getTrendingStocks(limit = 5) {
  const cacheKey = `trending_${limit}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    console.log('Returning cached trending stocks');
    return { trending: cached };
  }

  try {
    console.log('Fetching trending stocks from top movers...');
    
    // Use top gainers as trending stocks
    const movers = await getTopMovers(limit * 2);
    const trendingStocks = [...movers.gainers, ...movers.losers].slice(0, limit);
    
    // Cache for 10 minutes
    cache.set(cacheKey, trendingStocks, 600);
    
    console.log(`Found ${trendingStocks.length} trending stocks`);
    return { trending: trendingStocks };
  } catch (error) {
    console.error('Trending Stocks Error:', error);
    return { trending: getFallbackTrending(limit) };
  }
}

/**
 * Get market overview using Yahoo/Finnhub data
 * @returns {Promise<Object>} Market overview data
 */
export async function getMarketOverview() {
  const cacheKey = 'market_overview';
  const cached = cache.get(cacheKey);
  
  if (cached) {
    console.log('Returning cached market overview');
    return cached;
  }

  try {
    console.log('Fetching market overview from Yahoo/Finnhub...');
    
    // Get quotes for major Indian indices and stocks (use .NS extension)
    const indexSymbols = ['^NSEI', '^BSESN'];
    const majorStocks = ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS'];
    
    const [indexQuotes, stockQuotes] = await Promise.all([
      Promise.all(indexSymbols.map(symbol => getStockQuote(symbol).catch(() => null))),
      Promise.all(majorStocks.map(symbol => getStockQuote(symbol).catch(() => null)))
    ]);

    const validIndices = indexQuotes.filter(q => q !== null);
    const validStocks = stockQuotes.filter(q => q !== null);

    // Calculate market sentiment
    const allChanges = [...validIndices, ...validStocks].map(q => q.dp);
    const avgChange = allChanges.reduce((sum, change) => sum + change, 0) / allChanges.length;
    
    const sentiment = avgChange > 1 ? 'Bullish' : avgChange < -1 ? 'Bearish' : 'Neutral';
    
    const overview = {
      indices: validIndices.map(quote => ({
        symbol: quote.symbol,
        name: getStockName(quote.symbol),
        value: `₹${quote.c.toFixed(2)}`,
        change: `${quote.dp >= 0 ? '+' : ''}${quote.dp.toFixed(2)}%`,
        isPositive: quote.dp > 0
      })),
      topStocks: validStocks.slice(0, 5).map(quote => ({
        symbol: quote.symbol,
        name: quote.name,
        price: `₹${quote.c.toFixed(2)}`,
        change: `${quote.dp >= 0 ? '+' : ''}${quote.dp.toFixed(2)}%`,
        isPositive: quote.dp > 0
      })),
      sentiment,
      lastUpdated: new Date().toISOString(),
      marketStatus: 'Open' // Could be enhanced with actual market hours
    };

    // Cache for 2 minutes
    cache.set(cacheKey, overview, 120);
    
    return overview;
  } catch (error) {
    console.error('Market Overview Error:', error);
    return getFallbackOverview();
  }
}

// Helper function to get stock name
function getStockName(symbol) {
  const cleanSymbol = symbol.replace('.NS', '').replace('.BO', '');
  const stockNames = {
    'RELIANCE': 'Reliance Industries',
    'TCS': 'Tata Consultancy Services',
    'INFY': 'Infosys',
    'HDFCBANK': 'HDFC Bank',
    'ICICIBANK': 'ICICI Bank',
    'SBIN': 'State Bank of India',
    'TATAMOTORS': 'Tata Motors',
    'TATASTEEL': 'Tata Steel',
    'WIPRO': 'Wipro',
    'LT': 'Larsen & Toubro',
    'BAJFINANCE': 'Bajaj Finance',
    'MARUTI': 'Maruti Suzuki',
    'TITAN': 'Titan Company',
    'SUNPHARMA': 'Sun Pharma',
    'ONGC': 'Oil & Natural Gas Corp',
    'HINDUNILVR': 'Hindustan Unilever',
    'ASIANPAINT': 'Asian Paints',
    'NESTLEIND': 'Nestle India',
    'ULTRACEMCO': 'UltraTech Cement',
    'JSWSTEEL': 'JSW Steel',
    'NIFTY': 'Nifty 50',
    'SENSEX': 'BSE Sensex',
    'BANKNIFTY': 'Nifty Bank',
    '^NSEI': 'Nifty 50',
    '^BSESN': 'BSE Sensex'
  };
  
  return stockNames[cleanSymbol] || stockNames[symbol] || cleanSymbol;
}

// Fallback data for top movers
function getFallbackMovers(limit = 5) {
  return {
    gainers: [
      { symbol: 'TCS', name: 'Tata Consultancy Services', price: '₹3,245.00', change: '+2.8%', isGainer: true },
      { symbol: 'RELIANCE', name: 'Reliance Industries', price: '₹2,456.00', change: '+1.9%', isGainer: true },
      { symbol: 'HDFCBANK', name: 'HDFC Bank', price: '₹1,678.00', change: '+1.5%', isGainer: true },
    ].slice(0, limit),
    losers: [
      { symbol: 'TATAMOTORS', name: 'Tata Motors', price: '₹745.00', change: '-1.8%', isGainer: false },
      { symbol: 'YESBANK', name: 'Yes Bank', price: '₹18.50', change: '-2.1%', isGainer: false },
    ].slice(0, limit)
  };
}

// Fallback data for trending stocks
function getFallbackTrending(limit = 5) {
  return [
    { symbol: 'RELIANCE', name: 'Reliance Industries', price: '₹2,456.00', change: '+1.9%', reason: 'Q2 Results Beat Expectations', isGainer: true },
    { symbol: 'TCS', name: 'Tata Consultancy Services', price: '₹3,245.00', change: '+2.8%', reason: 'New Deal Worth $500M', isGainer: true },
    { symbol: 'INFY', name: 'Infosys', price: '₹1,432.00', change: '-0.5%', reason: 'Management Change Announced', isGainer: false },
  ].slice(0, limit);
}

// Fallback data for market overview
function getFallbackOverview() {
  return {
    indices: [
      { symbol: 'NIFTY', name: 'Nifty 50', value: '19,845.30', change: '+0.8%', isPositive: true },
      { symbol: 'SENSEX', name: 'BSE Sensex', value: '66,234.50', change: '+0.6%', isPositive: true },
    ],
    topStocks: [
      { symbol: 'RELIANCE', name: 'Reliance Industries', price: '₹2,456.00', change: '+1.9%', isPositive: true },
      { symbol: 'TCS', name: 'Tata Consultancy Services', price: '₹3,245.00', change: '+2.8%', isPositive: true },
    ],
    sentiment: 'Bullish',
    lastUpdated: new Date().toISOString(),
    marketStatus: 'Open'
  };
}

/**
 * Get trending stocks (high volume or significant movement)
 * @param {number} limit - Number of stocks to return
 * @returns {Promise<Array>} Array of trending stocks
 */
export async function getTrendingStocks(limit = 5) {
  const cacheKey = `trending_stocks_${limit}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    // Get stocks with significant movement (>2% change)
    const movers = await getTopMovers(10);
    const allMovers = [...movers.gainers, ...movers.losers];
    
    const trending = allMovers
      .filter(stock => Math.abs(stock.changePercent) > 2)
      .slice(0, limit)
      .map(stock => ({
        ...stock,
        volume: Math.abs(stock.changePercent) > 5 ? 'High' : 'Medium'
      }));

    cache.set(cacheKey, trending, 5 * 60 * 1000);
    return trending;

  } catch (error) {
    console.error('Trending Stocks Error:', error.message);
    return [];
  }
}

/**
 * Get market overview (indices, sentiment, etc.)
 * @returns {Promise<Object>} Market overview data
 */
export async function getMarketOverview() {
  const cacheKey = 'market_overview';
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    // Fetch major indices
    const indices = await Promise.all([
      getStockQuote('^NSEI'),  // Nifty 50
      getStockQuote('^BSESN'), // Sensex
      getStockQuote('^GSPC'),  // S&P 500
      getStockQuote('^DJI'),   // Dow Jones
    ]);

    const overview = {
      indices: [
        { name: 'Nifty 50', ...formatIndexData(indices[0]) },
        { name: 'Sensex', ...formatIndexData(indices[1]) },
        { name: 'S&P 500', ...formatIndexData(indices[2]) },
        { name: 'Dow Jones', ...formatIndexData(indices[3]) }
      ],
      timestamp: new Date().toISOString()
    };

    cache.set(cacheKey, overview, 5 * 60 * 1000);
    return overview;

  } catch (error) {
    console.error('Market Overview Error:', error.message);
    return { indices: [], error: error.message };
  }
}

/**
 * Format stock data for display
 */
function formatStockData(stock) {
  const currency = stock.isIndian ? '₹' : '$';
  return {
    symbol: stock.symbol,
    name: stock.name,
    price: `${currency}${stock.price.toFixed(2)}`,
    change: `${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%`,
    changeValue: `${stock.changePercent >= 0 ? '+' : ''}${currency}${Math.abs(stock.change).toFixed(2)}`,
    isGainer: stock.changePercent > 0,
    changePercent: stock.changePercent
  };
}

/**
 * Format index data
 */
function formatIndexData(quote) {
  if (!quote || quote.c === 0) {
    return { value: 'N/A', change: 'N/A', changePercent: 0 };
  }
  
  return {
    value: quote.c.toFixed(2),
    change: quote.d.toFixed(2),
    changePercent: quote.dp.toFixed(2),
    isPositive: quote.dp >= 0
  };
}

/**
 * Get stock name from symbol
 */
function getStockName(symbol) {
  const names = {
    'RELIANCE.NS': 'Reliance Industries',
    'TCS.NS': 'Tata Consultancy',
    'INFY.NS': 'Infosys',
    'HDFCBANK.NS': 'HDFC Bank',
    'ICICIBANK.NS': 'ICICI Bank',
    'SBIN.NS': 'State Bank of India',
    'TATAMOTORS.NS': 'Tata Motors',
    'TATASTEEL.NS': 'Tata Steel',
    'WIPRO.NS': 'Wipro',
    'LT.NS': 'Larsen & Toubro',
    'BAJFINANCE.NS': 'Bajaj Finance',
    'MARUTI.NS': 'Maruti Suzuki',
    'TITAN.NS': 'Titan Company',
    'SUNPHARMA.NS': 'Sun Pharma',
    'ONGC.NS': 'ONGC',
    'AAPL': 'Apple Inc.',
    'MSFT': 'Microsoft',
    'GOOGL': 'Google',
    'AMZN': 'Amazon',
    'TSLA': 'Tesla',
    'NVDA': 'NVIDIA',
    'META': 'Meta',
    'NFLX': 'Netflix'
  };
  
  return names[symbol] || symbol.replace('.NS', '').replace('.BO', '');
}
