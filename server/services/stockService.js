import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

// All Tata Group stocks and popular Indian stocks
const POPULAR_STOCKS = [
  { symbol: 'TATAMOTORS.NS', name: 'Tata Motors', sector: 'Automotive' },
  { symbol: 'TATASTEEL.NS', name: 'Tata Steel', sector: 'Steel' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services', sector: 'IT Services' },
  { symbol: 'TATACONSUM.NS', name: 'Tata Consumer Products', sector: 'FMCG' },
  { symbol: 'TATAPOWER.NS', name: 'Tata Power', sector: 'Power' },
  { symbol: 'TITAN.NS', name: 'Titan Company', sector: 'Jewelry' },
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries', sector: 'Oil & Gas' },
  { symbol: 'INFY.NS', name: 'Infosys', sector: 'IT Services' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', sector: 'Banking' },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank', sector: 'Banking' },
  { symbol: 'SBIN.NS', name: 'State Bank of India', sector: 'Banking' }
];

// Get stock quote with fallback
export async function getStockQuote(symbol) {
  try {
    // Determine if it's an Indian stock
    const isIndianStock = symbol.includes('.NS') || symbol.includes('.BO');
    
    // For US stocks, try Finnhub first (more reliable for US markets)
    if (!isIndianStock) {
      const finnhubQuote = await getFinnhubQuote(symbol);
      if (finnhubQuote && finnhubQuote.c > 0) {
        return finnhubQuote;
      }
      
      // Fallback to Yahoo for US stocks
      const yahooQuote = await getYahooQuote(symbol);
      if (yahooQuote && yahooQuote.c > 0) {
        return yahooQuote;
      }
    } else {
      // For Indian stocks, use Yahoo Finance
      const yahooQuote = await getYahooQuote(symbol);
      if (yahooQuote && yahooQuote.c > 0) {
        return yahooQuote;
      }
    }
    
    // Return zero data if all fail
    console.log(`No data found for ${symbol}`);
    return { c: 0, d: 0, dp: 0, h: 0, l: 0, o: 0, pc: 0, isIndian: isIndianStock };
    
  } catch (error) {
    console.error('Stock Quote Error:', error.message);
    return { c: 0, d: 0, dp: 0, h: 0, l: 0, o: 0, pc: 0, error: error.message };
  }
}

// Yahoo Finance with better error handling
async function getYahooQuote(symbol) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      },
      timeout: 10000
    });
    
    const result = response.data?.chart?.result?.[0];
    if (!result || !result.meta) {
      throw new Error('Invalid Yahoo response');
    }
    
    const meta = result.meta;
    const current = meta.regularMarketPrice || meta.previousClose || 0;
    const prevClose = meta.previousClose || 0;
    const change = current - prevClose;
    const changePct = prevClose ? (change / prevClose) * 100 : 0;
    
    return {
      c: current,
      d: change,
      dp: changePct,
      h: meta.regularMarketDayHigh || 0,
      l: meta.regularMarketDayLow || 0,
      o: meta.regularMarketOpen || 0,
      pc: prevClose,
      isIndian: symbol.includes('.NS') || symbol.includes('.BO'),
      symbol: symbol,
      currency: meta.currency || 'INR'
    };
  } catch (error) {
    console.log(`Yahoo Finance error for ${symbol}:`, error.message);
    return null;
  }
}

// Finnhub for US stocks
async function getFinnhubQuote(symbol) {
  try {
    if (!FINNHUB_API_KEY) {
      throw new Error('Finnhub API key not configured');
    }
    
    const response = await axios.get(`https://finnhub.io/api/v1/quote`, {
      params: {
        symbol: symbol.toUpperCase(),
        token: FINNHUB_API_KEY
      },
      timeout: 10000
    });
    
    if (response.data && response.data.c > 0) {
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.log(`Finnhub error for ${symbol}:`, error.message);
    return null;
  }
}

// Get company profile
export async function getCompanyProfile(symbol) {
  try {
    const formattedSymbol = symbol.includes('.') ? symbol : `${symbol}.NS`;
    
    // Check if it's in our popular stocks list
    const stockInfo = POPULAR_STOCKS.find(s => 
      s.symbol === formattedSymbol || 
      s.symbol === symbol ||
      s.symbol === `${symbol}.NS`
    );
    
    if (stockInfo) {
      return {
        name: stockInfo.name,
        finnhubIndustry: stockInfo.sector,
        marketCapitalization: 0,
        exchange: formattedSymbol.includes('.NS') ? 'NSE' : formattedSymbol.includes('.BO') ? 'BSE' : 'Unknown'
      };
    }
    
    // Try Yahoo Finance for profile
    const yahooProfile = await getYahooProfile(formattedSymbol);
    if (yahooProfile) {
      return yahooProfile;
    }
    
    // Try Finnhub for US stocks
    if (!symbol.includes('.NS') && !symbol.includes('.BO')) {
      return await getFinnhubProfile(symbol);
    }
    
    // Fallback
    return {
      name: symbol.replace('.NS', '').replace('.BO', ''),
      finnhubIndustry: 'Unknown',
      marketCapitalization: 0
    };
    
  } catch (error) {
    console.error('Profile Error:', error.message);
    return {
      name: symbol,
      finnhubIndustry: 'Unknown',
      marketCapitalization: 0
    };
  }
}

async function getYahooProfile(symbol) {
  try {
    const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=price,summaryProfile,assetProfile`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      },
      timeout: 10000
    });
    
    const result = response.data?.quoteSummary?.result?.[0];
    if (!result) return null;
    
    const price = result.price || {};
    const summaryProfile = result.summaryProfile || {};
    const assetProfile = result.assetProfile || {};
    
    // Get industry/sector from multiple sources
    const industry = assetProfile.industry || summaryProfile.industry || assetProfile.sector || summaryProfile.sector || 'Financial Services';
    const sector = assetProfile.sector || summaryProfile.sector || 'Financial';
    
    return {
      name: price.longName || price.shortName || assetProfile.longBusinessSummary?.split(' ').slice(0, 3).join(' ') || symbol,
      finnhubIndustry: industry,
      sector: sector,
      marketCapitalization: price.marketCap?.raw || 0,
      exchange: price.exchangeName || (symbol.includes('.NS') ? 'NSE' : symbol.includes('.BO') ? 'BSE' : 'NASDAQ'),
      country: assetProfile.country || (symbol.includes('.NS') || symbol.includes('.BO') ? 'India' : 'United States')
    };
  } catch (error) {
    console.log(`Yahoo profile error for ${symbol}:`, error.message);
    return null;
  }
}

async function getFinnhubProfile(symbol) {
  try {
    if (!FINNHUB_API_KEY) return null;
    
    const response = await axios.get(`https://finnhub.io/api/v1/stock/profile2`, {
      params: {
        symbol: symbol.toUpperCase(),
        token: FINNHUB_API_KEY
      },
      timeout: 10000
    });
    
    return response.data;
  } catch (error) {
    console.log(`Finnhub profile error for ${symbol}:`, error.message);
    return null;
  }
}

// Search stocks
export async function searchStocks(query) {
  try {
    const queryLower = query.toLowerCase();
    
    // Search in popular stocks first
    const popularMatches = POPULAR_STOCKS.filter(stock => 
      stock.symbol.toLowerCase().includes(queryLower) ||
      stock.name.toLowerCase().includes(queryLower) ||
      stock.sector.toLowerCase().includes(queryLower)
    );
    
    // If we found matches, return them
    if (popularMatches.length > 0) {
      return popularMatches.map(stock => ({
        symbol: stock.symbol,
        description: stock.name,
        sector: stock.sector
      }));
    }
    
    // Try Yahoo Finance search
    const yahooResults = await searchYahoo(query);
    if (yahooResults.length > 0) {
      return yahooResults;
    }
    
    // Fallback: return empty
    return [];
    
  } catch (error) {
    console.error('Search Error:', error.message);
    return [];
  }
}

async function searchYahoo(query) {
  try {
    const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });
    
    const quotes = response.data?.quotes || [];
    return quotes
      .filter(q => q.symbol && q.shortname)
      .slice(0, 10)
      .map(q => ({
        symbol: q.symbol,
        description: q.shortname || q.longname || q.symbol,
        exchange: q.exchDisp || q.exchange
      }));
  } catch (error) {
    console.log('Yahoo search error:', error.message);
    return [];
  }
}

// Get stock news
export async function getStockNews(symbol) {
  try {
    const clean = symbol.replace('.NS', '').replace('.BO', '').toUpperCase();
    
    if (!FINNHUB_API_KEY) {
      console.log('Finnhub API key not configured');
      return [];
    }
    
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const response = await axios.get(`https://finnhub.io/api/v1/company-news`, {
      params: {
        symbol: clean,
        from: weekAgo.toISOString().split('T')[0],
        to: today.toISOString().split('T')[0],
        token: FINNHUB_API_KEY
      },
      timeout: 10000
    });
    
    return (response.data || []).slice(0, 5);
  } catch (error) {
    console.error('Stock News Error:', error.message);
    return [];
  }
}

// Note: IPO listings moved to ipoService.js for better organization