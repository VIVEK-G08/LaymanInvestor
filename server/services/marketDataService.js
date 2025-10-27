import { getStockQuote } from './stockService.js';
import cache from '../utils/cache.js';

// Popular stocks to track for gainers/losers
const TRACKED_STOCKS = [
  'RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'HDFCBANK.NS', 'ICICIBANK.NS',
  'SBIN.NS', 'TATAMOTORS.NS', 'TATASTEEL.NS', 'WIPRO.NS', 'LT.NS',
  'BAJFINANCE.NS', 'MARUTI.NS', 'TITAN.NS', 'SUNPHARMA.NS', 'ONGC.NS',
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX'
];

/**
 * Get top gainers and losers from tracked stocks
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
    console.log('Fetching fresh top movers data...');
    
    // Fetch quotes for all tracked stocks in parallel
    const quotes = await Promise.all(
      TRACKED_STOCKS.map(async (symbol) => {
        try {
          const quote = await getStockQuote(symbol);
          if (quote && quote.c > 0) {
            return {
              symbol,
              name: getStockName(symbol),
              price: quote.c,
              change: quote.d,
              changePercent: quote.dp,
              isIndian: quote.isIndian || symbol.includes('.NS') || symbol.includes('.BO')
            };
          }
          return null;
        } catch (error) {
          console.error(`Error fetching ${symbol}:`, error.message);
          return null;
        }
      })
    );

    // Filter out null values
    const validQuotes = quotes.filter(q => q !== null);

    // Sort by change percentage
    const sorted = validQuotes.sort((a, b) => b.changePercent - a.changePercent);

    // Get top gainers and losers
    const gainers = sorted.filter(q => q.changePercent > 0).slice(0, limit);
    const losers = sorted.filter(q => q.changePercent < 0).reverse().slice(0, limit);

    const result = {
      gainers: gainers.map(formatStockData),
      losers: losers.map(formatStockData),
      timestamp: new Date().toISOString()
    };

    // Cache for 5 minutes (market data changes frequently)
    cache.set(cacheKey, result, 5 * 60 * 1000);

    return result;

  } catch (error) {
    console.error('Top Movers Error:', error.message);
    return {
      gainers: [],
      losers: [],
      error: error.message
    };
  }
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
