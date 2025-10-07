import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

// All Tata Group stocks
const TATA_STOCKS = [
  { symbol: 'TATAMOTORS.NS', name: 'Tata Motors', sector: 'Automotive' },
  { symbol: 'TATASTEEL.NS', name: 'Tata Steel', sector: 'Steel' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services', sector: 'IT Services' },
  { symbol: 'TATACONSUM.NS', name: 'Tata Consumer Products', sector: 'FMCG' },
  { symbol: 'TATAPOWER.NS', name: 'Tata Power', sector: 'Power' },
  { symbol: 'TITAN.NS', name: 'Titan Company', sector: 'Jewelry & Watches' },
  { symbol: 'TRENT.NS', name: 'Trent Ltd', sector: 'Retail' },
  { symbol: 'TATAELXSI.NS', name: 'Tata Elxsi', sector: 'IT Services' },
  { symbol: 'TATACHEM.NS', name: 'Tata Chemicals', sector: 'Chemicals' },
  { symbol: 'TATACOFFEE.NS', name: 'Tata Coffee', sector: 'Agriculture' }
];

// Popular Indian IPOs (recent and upcoming)
const INDIAN_IPOS = [
  { 
    company: 'Tata Technologies', 
    symbol: 'TATATECH.NS', 
    issuePrice: '500-525', 
    listingDate: '2023-11-30', 
    status: 'Listed',
    description: 'Engineering and product development services'
  },
  { 
    company: 'Rail Vikas Nigam Ltd (RVNL)', 
    symbol: 'RVNL.NS', 
    issuePrice: '24-26', 
    listingDate: '2024-04-19', 
    status: 'Listed',
    description: 'Railway infrastructure development'
  },
  { 
    company: 'Go Airlines (India) Ltd', 
    symbol: 'GOAIR.NS', 
    issuePrice: 'TBD', 
    listingDate: 'Upcoming', 
    status: 'Upcoming',
    description: 'Low-cost airline services'
  },
  { 
    company: 'Bharat Renewable Energy Ltd', 
    symbol: 'BRE.NS', 
    issuePrice: 'TBD', 
    listingDate: 'Upcoming', 
    status: 'Upcoming',
    description: 'Renewable energy projects'
  },
  { 
    company: 'MobiKwik', 
    symbol: 'MOBIKWIK.NS', 
    issuePrice: 'TBD', 
    listingDate: 'Upcoming', 
    status: 'Upcoming',
    description: 'Digital payments and fintech'
  }
];

// Get stock quote
export async function getStockQuote(symbol) {
  try {
    const formattedSymbol = symbol.includes('.') ? symbol : `${symbol}.NS`;
    
    // Yahoo Finance for Indian stocks
    const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${formattedSymbol}`;
    
    const response = await axios.get(url, {
      headers: { 'User-Agent': USER_AGENT }
    });
    
    const result = response.data.chart.result[0];
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
      isIndian: true,
      symbol: formattedSymbol,
      currency: meta.currency || 'INR'
    };
  } catch (error) {
    console.error('Stock Quote Error:', error.message);
    return { c: 0, d: 0, dp: 0, h: 0, l: 0, o: 0, pc: 0, isIndian: true };
  }
}

// Get company profile
export async function getCompanyProfile(symbol) {
  try {
    const formattedSymbol = symbol.includes('.') ? symbol : `${symbol}.NS`;
    const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${formattedSymbol}?modules=price,summaryProfile`;
    
    const response = await axios.get(url, {
      headers: { 'User-Agent': USER_AGENT }
    });
    
    const result = response.data.quoteSummary.result[0];
    const price = result.price || {};
    const profile = result.summaryProfile || {};
    
    return {
      name: price.longName || price.shortName || formattedSymbol.replace('.NS', ''),
      finnhubIndustry: profile.sector || 'Indian Company',
      marketCapitalization: price.marketCap?.raw || 0,
      exchange: price.exchangeName || 'NSE'
    };
  } catch (error) {
    console.error('Profile Error:', error.message);
    // Find from our predefined list
    const stock = TATA_STOCKS.find(s => s.symbol === symbol || s.symbol === `${symbol}.NS`);
    return {
      name: stock?.name || symbol,
      finnhubIndustry: stock?.sector || 'Indian Company',
      marketCapitalization: 0
    };
  }
}

// Search stocks - SPECIAL HANDLING FOR "TATA"
export async function searchStocks(query) {
  const queryLower = query.toLowerCase();
  
  // Special case: "tata" returns all Tata stocks
  if (queryLower.includes('tata')) {
    return TATA_STOCKS.map(stock => ({
      symbol: stock.symbol,
      description: stock.name,
      sector: stock.sector
    }));
  }
  
  // For other queries, use Yahoo Finance search
  try {
    const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}`;
    
    const response = await axios.get(url, {
      headers: { 'User-Agent': USER_AGENT }
    });
    
    const quotes = response.data.quotes || [];
    return quotes
      .filter(q => ['NSE', 'BSE'].includes(q.exchDisp))
      .map(q => ({
        symbol: q.symbol,
        description: q.shortname || q.longname || q.symbol,
        exchange: q.exchDisp
      }))
      .slice(0, 10); // Limit to 10 results
      
  } catch (error) {
    console.error('Search Error:', error.message);
    return [];
  }
}

// Get IPO listings
export function getIPOListings() {
  return INDIAN_IPOS;
}

// Get stock news (keep existing implementation)
export async function getStockNews(symbol) {
  try {
    const clean = symbol.replace('.NS', '').replace('.BO', '').toUpperCase();
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const response = await axios.get(`https://finnhub.io/api/v1/company-news`, {
      params: {
        symbol: clean,
        from: weekAgo.toISOString().split('T')[0],
        to: today.toISOString().split('T')[0],
        token: FINNHUB_API_KEY
      }
    });
    return (response.data || []).slice(0, 5);
  } catch (error) {
    console.error('Stock News Error:', error.message);
    return [];
  }
}