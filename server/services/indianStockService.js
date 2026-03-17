import axios from 'axios';
import nseService from './nseService.js';
import bseService from './bseService.js';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

class IndianStockService {
  async searchStocks(query, exchange = 'both') {
    try {
      let results = [];
      
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
    } catch (error) {
      console.error('Indian stock quote error:', error.message);
      throw new Error('Failed to fetch stock quote');
    }
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