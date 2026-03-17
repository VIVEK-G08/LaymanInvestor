import axios from 'axios';
import { NSE, BSE } from 'nse-bse-api';
import nseService from './nseService.js';
import bseService from './bseService.js';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Initialize NSE-BSE clients
let nseClient = null;
let bseClient = null;

function initializeClients() {
  if (!nseClient) {
    nseClient = new NSE('./downloads', {
      server: false,
      timeout: 10000
    });
  }
  if (!bseClient) {
    bseClient = new BSE({
      downloadFolder: './downloads',
      timeout: 10000
    });
  }
  return { nseClient, bseClient };
}

class IndianStockService {
  async searchStocks(query, exchange = 'both') {
    try {
      let results = [];
      
      // Try NSE-BSE API first
      try {
        const { nseClient, bseClient } = initializeClients();
        
        if (exchange === 'nse' || exchange === 'both') {
          try {
            const nseResults = await nseClient.market.lookup(query);
            const transformedNSE = nseResults.map(result => ({
              symbol: result.symbol,
              name: result.name || result.description,
              description: result.description || result.name,
              exchange: 'NSE',
              sector: result.sector || '—'
            }));
            results = results.concat(transformedNSE);
          } catch (error) {
            console.error('NSE-BSE search failed:', error.message);
          }
        }
        
        if (exchange === 'bse' || exchange === 'both') {
          try {
            const bseResults = await bseClient.lookupSymbol(query);
            const transformedBSE = bseResults.map(result => ({
              symbol: result.symbol,
              name: result.name || result.description,
              description: result.description || result.name,
              exchange: 'BSE',
              sector: result.sector || '—'
            }));
            results = results.concat(transformedBSE);
          } catch (error) {
            console.error('BSE-BSE search failed:', error.message);
          }
        }
      } catch (error) {
        console.warn('NSE-BSE API failed, falling back to original services:', error.message);
        
        // Fallback to original services
        if (exchange === 'nse' || exchange === 'both') {
          try {
            const nseResults = await nseService.searchStocks(query);
            results = results.concat(nseResults);
          } catch (error) {
            console.error('NSE search failed:', error.message);
          }
        }
        
        if (exchange === 'bse' || exchange === 'both') {
          try {
            const bseResults = await bseService.searchStocks(query);
            results = results.concat(bseResults);
          } catch (error) {
            console.error('BSE search failed:', error.message);
          }
        }
      }
      
      // Remove duplicates based on symbol/name
      const uniqueResults = results.filter((item, index, self) =>
        index === self.findIndex((t) => t.symbol === item.symbol || t.name === item.name)
      );
      
      return uniqueResults.slice(0, 15); // Limit to 15 results
    } catch (error) {
      console.error('Indian stock search error:', error.message);
      throw new Error('Failed to search Indian stocks');
    }
  }

  async getStockQuote(symbol, exchange = 'nse') {
    try {
      // Try NSE-BSE API first
      try {
        const { nseClient, bseClient } = initializeClients();
        
        if (exchange === 'nse') {
          const nseQuote = await nseClient.equityQuote(symbol);
          return this.transformNSEQuote(nseQuote);
        } else if (exchange === 'bse') {
          const bseQuote = await bseClient.quote(symbol);
          return this.transformBSEQuote(bseQuote);
        } else {
          // Try NSE first, then BSE
          try {
            const nseQuote = await nseClient.equityQuote(symbol);
            return this.transformNSEQuote(nseQuote);
          } catch (nseError) {
            console.log('NSE-BSE quote failed, trying BSE:', nseError.message);
            const bseQuote = await bseClient.quote(symbol);
            return this.transformBSEQuote(bseQuote);
          }
        }
      } catch (error) {
        console.warn('NSE-BSE API failed, falling back to original services:', error.message);
        
        // Fallback to original services
        if (exchange === 'nse') {
          return await nseService.getStockQuote(symbol);
        } else if (exchange === 'bse') {
          return await bseService.getStockQuote(symbol);
        } else {
          // Try NSE first, then BSE
          try {
            return await nseService.getStockQuote(symbol);
          } catch (nseError) {
            console.log('NSE quote failed, trying BSE:', nseError.message);
            return await bseService.getStockQuote(symbol);
          }
        }
      }
    } catch (error) {
      console.error('Indian stock quote error:', error.message);
      throw new Error('Failed to fetch stock quote');
    }
  }

  // Helper to transform NSE quote format
  transformNSEQuote(quote) {
    return {
      c: quote.price || quote.lastPrice || 0,
      d: quote.change || 0,
      dp: quote.pChange || 0,
      h: quote.dayHigh || 0,
      l: quote.dayLow || 0,
      o: quote.openPrice || 0,
      pc: quote.previousClose || 0,
      isIndian: true,
      symbol: quote.symbol,
      currency: '₹',
      exchange: 'NSE',
      volume: quote.totalTradedVolume || 0,
      vwap: quote.vwap || 0
    };
  }

  // Helper to transform BSE quote format
  transformBSEQuote(quote) {
    return {
      c: quote.currentPrice || quote.ltp || 0,
      d: quote.change || 0,
      dp: quote.pChange || 0,
      h: quote.high || 0,
      l: quote.low || 0,
      o: quote.open || 0,
      pc: quote.previousClose || 0,
      isIndian: true,
      symbol: quote.symbol,
      currency: '₹',
      exchange: 'BSE',
      volume: quote.volume || 0,
      vwap: quote.vwap || 0
    };
  }

  async getStockDetails(symbol, exchange = 'nse') {
    try {
      if (exchange === 'nse') {
        return await nseService.getStockDetails(symbol);
      } else if (exchange === 'bse') {
        return await bseService.getStockDetails(symbol);
      } else {
        // Try NSE first, then BSE
        try {
          return await nseService.getStockDetails(symbol);
        } catch (nseError) {
          console.log('NSE details failed, trying BSE:', nseError.message);
          return await bseService.getStockDetails(symbol);
        }
      }
    } catch (error) {
      console.error('Indian stock details error:', error.message);
      throw new Error('Failed to fetch stock details');
    }
  }

  async getUpcomingIPOs(exchange = 'both') {
    try {
      let ipos = [];
      
      if (exchange === 'nse' || exchange === 'both') {
        try {
          const nseIPOs = await nseService.getUpcomingIPOs();
          ipos = ipos.concat(nseIPOs);
        } catch (error) {
          console.error('NSE IPO fetch failed:', error.message);
        }
      }
      
      if (exchange === 'bse' || exchange === 'both') {
        try {
          const bseIPOs = await bseService.getUpcomingIPOs();
          ipos = ipos.concat(bseIPOs);
        } catch (error) {
          console.error('BSE IPO fetch failed:', error.message);
        }
      }
      
      // Remove duplicates based on company name
      const uniqueIPOs = ipos.filter((item, index, self) =>
        index === self.findIndex((t) => t.companyName === item.companyName)
      );
      
      // Sort by open date
      return uniqueIPOs.sort((a, b) => new Date(a.openDate) - new Date(b.openDate));
    } catch (error) {
      console.error('Indian IPOs error:', error.message);
      throw new Error('Failed to fetch upcoming IPOs');
    }
  }

  // Helper method to determine if a symbol is Indian
  isIndianSymbol(symbol) {
    // Indian symbols typically end with .NS (NSE) or .BO (BSE) or are pure Indian company names
    return symbol.endsWith('.NS') || symbol.endsWith('.BO') || 
           /^[A-Z&]+$/.test(symbol); // Pure uppercase letters (typical Indian naming)
  }

  // Helper method to extract exchange from symbol
  getExchangeFromSymbol(symbol) {
    if (symbol.endsWith('.NS')) return 'nse';
    if (symbol.endsWith('.BO')) return 'bse';
    return 'nse'; // Default to NSE for Indian symbols
  }

  // Helper method to clean symbol
  cleanSymbol(symbol) {
    return symbol.replace('.NS', '').replace('.BO', '');
  }

  async getIndianStockFromYahoo(symbol) {
    try {
      const formatted = symbol.includes('.') ? symbol : `${symbol}.NS`;
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${formatted}`;
      const res = await axios.get(url, { headers: { 'User-Agent': USER_AGENT } });

      const result = res?.data?.chart?.result?.[0];
      if (!result) throw new Error('Invalid Yahoo chart response');

      const meta = result.meta || {};
      const current = meta.regularMarketPrice ?? meta.previousClose ?? 0;
      const prevClose = meta.previousClose ?? 0;
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
        symbol: formatted,
        currency: meta.currency || 'INR',
        exchange: meta.exchangeName || 'NSE'
      };
    } catch (e) {
      console.error('Yahoo Finance Error:', e.message);
      throw new Error(`Failed to fetch ${symbol}. Try with .NS/.BO suffix`);
    }
  }

  async getIndianCompanyProfileYahoo(symbol) {
    try {
      const formatted = symbol.includes('.') ? symbol : `${symbol}.NS`;
      const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${formatted}?modules=price,summaryProfile`;
      const res = await axios.get(url, { headers: { 'User-Agent': USER_AGENT } });

      const result = res?.data?.quoteSummary?.result?.[0];
      const price = result?.price || {};
      const profile = result?.summaryProfile || {};

      return {
        name: price.longName || price.shortName || formatted.replace('.NS', '').replace('.BO', ''),
        finnhubIndustry: profile.sector || 'Indian Company',
        marketCapitalization: price.marketCap?.raw || 0,
        exchange: price.exchangeName || 'NSE',
        currency: price.currency || 'INR'
      };
    } catch (e) {
      console.error('Yahoo Profile Error:', e.message);
      return {
        name: symbol,
        finnhubIndustry: 'Indian Company',
        marketCapitalization: 0
      };
    }
  }

  async searchIndianStocksYahoo(query) {
    try {
      const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}`;
      const res = await axios.get(url, { headers: { 'User-Agent': USER_AGENT } });
      const quotes = res?.data?.quotes || [];
      return quotes
        .filter(q => ['NSE', 'BSE'].includes(q.exchDisp))
        .map(q => ({
          symbol: q.symbol,
          description: q.shortname || q.longname || q.symbol,
          exchange: q.exchDisp
        }));
    } catch (e) {
      console.error('Yahoo Search Error:', e.message);
      return [];
    }
  }
}

export default new IndianStockService();