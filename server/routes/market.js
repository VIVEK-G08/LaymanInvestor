import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { getStockQuote, getCompanyProfile, getStockNews } from '../services/stockService.js';
import { getTopMovers, getTrendingStocks, getMarketOverview } from '../services/marketDataService.js';

dotenv.config();

const router = express.Router();

// POST /api/market/depth-search
router.post('/depth-search', async (req, res) => {
  try {
    const { query, userId } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    // Analyze the query to determine what to search for
    const symbol = extractStockSymbol(query);
    
    if (symbol) {
      // Get comprehensive stock analysis
      const quote = await getStockQuote(symbol);
      const profile = await getCompanyProfile(symbol);
      const news = await getStockNews(symbol);
      
      // Generate analysis summary
      const analysis = generateStockAnalysis(quote, profile, news, symbol);
      
      res.json({
        type: 'stock_analysis',
        symbol: symbol,
        analysis: analysis,
        quote: quote,
        profile: profile,
        news: news.slice(0, 5)
      });
    } else {
      // General market search
      const generalAnalysis = await getGeneralMarketAnalysis(query);
      res.json({
        type: 'market_analysis',
        query: query,
        analysis: generalAnalysis
      });
    }
    
  } catch (error) {
    console.error('Market Depth Search Error:', error);
    res.status(500).json({ error: 'Failed to perform depth search' });
  }
});

function extractStockSymbol(query) {
  // First, try to find exact stock symbols (with .NS, .BO, etc.)
  const exactSymbolMatch = query.match(/([A-Z]{2,5}\.(NS|BO))/i);
  if (exactSymbolMatch) {
    return exactSymbolMatch[1].toUpperCase();
  }
  
  // Try to find standalone symbols (3-5 uppercase letters)
  const standaloneSymbol = query.match(/\b([A-Z]{3,5})\b/);
  if (standaloneSymbol) {
    // Check if it's a common US stock or Indian stock
    const commonUS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX'];
    const commonIndian = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN'];
    
    if (commonUS.includes(standaloneSymbol[1])) {
      return standaloneSymbol[1];
    } else if (commonIndian.includes(standaloneSymbol[1])) {
      return `${standaloneSymbol[1]}.NS`;
    }
  }
  
  // Handle company names
  const queryLower = query.toLowerCase();
  const stockMappings = {
    'apple': 'AAPL',
    'microsoft': 'MSFT',
    'google': 'GOOGL', 
    'amazon': 'AMZN',
    'tesla': 'TSLA',
    'nvidia': 'NVDA',
    'meta': 'META',
    'netflix': 'NFLX',
    'reliance': 'RELIANCE.NS',
    'tata motors': 'TATAMOTORS.NS',
    'tata steel': 'TATASTEEL.NS',
    'tcs': 'TCS.NS',
    'infosys': 'INFY.NS',
    'hdfc bank': 'HDFCBANK.NS',
    'icici bank': 'ICICIBANK.NS',
    'state bank': 'SBIN.NS',
    'tata': 'TATAMOTORS.NS', // Default Tata to Motors
    'tata group': 'TATAMOTORS.NS'
  };
  
  for (const [name, symbol] of Object.entries(stockMappings)) {
    if (queryLower.includes(name)) {
      return symbol;
    }
  }
  
  return null;
}

function generateStockAnalysis(quote, profile, news, symbol) {
  if (!quote || quote.c === 0) {
    return `Unable to fetch current data for ${symbol}. The stock may be delisted or there might be a temporary issue with data providers.`;
  }
  
  const changePercent = quote.dp || 0;
  const trend = changePercent > 0 ? 'upward' : changePercent < 0 ? 'downward' : 'stable';
  const volatility = Math.abs(quote.h - quote.l) / quote.c * 100;
  
  let analysis = `${symbol} is currently trading at ${quote.isIndian ? '₹' : '$'}${quote.c?.toFixed(2)} `;
  analysis += `(${changePercent >= 0 ? '+' : ''}${changePercent?.toFixed(2)}%). `;
  
  if (Math.abs(changePercent) > 2) {
    analysis += `This represents significant ${changePercent > 0 ? 'positive' : 'negative'} movement today. `;
  }
  
  analysis += `The stock shows ${volatility > 3 ? 'high' : 'moderate'} volatility with a daily range of ${quote.isIndian ? '₹' : '$'}${quote.l?.toFixed(2)} - ${quote.isIndian ? '₹' : '$'}${quote.h?.toFixed(2)}. `;
  
  if (news && news.length > 0) {
    analysis += `Recent news may be influencing the price: "${news[0].headline}". `;
  }
  
  analysis += `This ${trend} trend suggests ${trend === 'upward' ? 'positive market sentiment' : trend === 'downward' ? 'caution is warranted' : 'market indecision'}.`;
  
  return analysis;
}

async function getGeneralMarketAnalysis(query) {
  // For general queries, provide market overview
  return `Based on your query "${query}", here's a market overview:

Current Market Conditions:
• Major indices are showing mixed performance
• Technology sector is leading gains
• Market volatility is moderate
• Economic indicators suggest steady growth

For specific stock analysis, please mention a stock symbol (e.g., AAPL, TSLA, RELIANCE.NS) or company name.

Would you like me to analyze a specific stock or sector in detail?`;
}

// GET /api/market/top-movers
router.get('/top-movers', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const movers = await getTopMovers(limit);
    res.json(movers);
  } catch (error) {
    console.error('Top Movers Error:', error);
    res.status(500).json({ error: 'Failed to fetch top movers' });
  }
});

// GET /api/market/trending
router.get('/trending', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const trending = await getTrendingStocks(limit);
    res.json({ trending });
  } catch (error) {
    console.error('Trending Stocks Error:', error);
    res.status(500).json({ error: 'Failed to fetch trending stocks' });
  }
});

// GET /api/market/overview
router.get('/overview', async (req, res) => {
  try {
    const overview = await getMarketOverview();
    res.json(overview);
  } catch (error) {
    console.error('Market Overview Error:', error);
    res.status(500).json({ error: 'Failed to fetch market overview' });
  }
});

export default router;