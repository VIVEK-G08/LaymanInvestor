import { NSE, BSE } from 'nse-bse-api';
import dotenv from 'dotenv';

dotenv.config();

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

// Get stock quote using ONLY NSE-BSE API
export async function getStockQuote(symbol) {
  try {
    const { nseClient, bseClient } = initializeClients();
    
    // Determine if it's an Indian stock
    const isIndianStock = symbol.includes('.NS') || symbol.includes('.BO') || /^[A-Z&]+$/.test(symbol);
    
    if (isIndianStock) {
      // Try NSE first for Indian stocks
      try {
        const cleanSymbol = symbol.replace('.NS', '').replace('.BO', '');
        const nseQuote = await nseClient.equityQuote(cleanSymbol);
        return transformNSEQuote(nseQuote, symbol);
      } catch (nseError) {
        console.log(`NSE quote failed for ${symbol}, trying BSE:`, nseError.message);
        
        // Try BSE as fallback
        try {
          const bseQuote = await bseClient.quote(cleanSymbol);
          return transformBSEQuote(bseQuote, symbol);
        } catch (bseError) {
          console.error(`Both NSE and BSE failed for ${symbol}:`, bseError.message);
          throw new Error(`Unable to fetch quote for ${symbol} from NSE-BSE API`);
        }
      }
    } else {
      // For non-Indian stocks, we don't have NSE-BSE coverage
      throw new Error(`NSE-BSE API only supports Indian stocks. Cannot fetch quote for ${symbol}`);
    }
  } catch (error) {
    console.error(`Stock quote error for ${symbol}:`, error.message);
    throw error;
  }
}

// Get company profile using ONLY NSE-BSE API
export async function getCompanyProfile(symbol) {
  try {
    const { nseClient, bseClient } = initializeClients();
    
    // Determine if it's an Indian stock
    const isIndianStock = symbol.includes('.NS') || symbol.includes('.BO') || /^[A-Z&]+$/.test(symbol);
    
    if (isIndianStock) {
      // Try to get symbol info from NSE lookup
      try {
        const cleanSymbol = symbol.replace('.NS', '').replace('.BO', '');
        const searchResults = await nseClient.market.lookup(cleanSymbol);
        
        if (searchResults && searchResults.length > 0) {
          const stock = searchResults[0];
          return {
            name: stock.name || cleanSymbol,
            finnhubIndustry: stock.sector || 'N/A',
            marketCapitalization: 0, // NSE-BSE doesn't provide market cap in lookup
            exchange: stock.exchange || 'NSE',
            country: 'India',
            currency: 'INR',
            symbol: symbol
          };
        }
      } catch (error) {
        console.warn(`NSE lookup failed for ${symbol}:`, error.message);
      }
      
      // Fallback basic profile
      return {
        name: symbol.replace('.NS', '').replace('.BO', ''),
        finnhubIndustry: 'Indian Company',
        marketCapitalization: 0,
        exchange: symbol.includes('.NS') ? 'NSE' : 'BSE',
        country: 'India',
        currency: 'INR',
        symbol: symbol
      };
    } else {
      // For non-Indian stocks, we don't have NSE-BSE coverage
      throw new Error(`NSE-BSE API only supports Indian stocks. Cannot fetch profile for ${symbol}`);
    }
  } catch (error) {
    console.error(`Company profile error for ${symbol}:`, error.message);
    throw error;
  }
}

// Get stock news using NSE-BSE corporate announcements
export async function getStockNews(symbol, from, to) {
  try {
    const isIndianStock = symbol.includes('.NS') || symbol.includes('.BO') || /^[A-Z&]+$/.test(symbol);
    
    if (isIndianStock) {
      // For Indian stocks, get corporate announcements
      const { getNSEBSENews } = await import('./nseBseService.js');
      const announcements = await getNSEBSENews('corporate');
      
      // Filter announcements related to the symbol
      const relatedNews = announcements.filter(news => {
        const cleanSymbol = symbol.replace('.NS', '').replace('.BO', '').toLowerCase();
        const headline = (news.headline || '').toLowerCase();
        const summary = (news.summary || '').toLowerCase();
        
        return headline.includes(cleanSymbol) || 
               summary.includes(cleanSymbol) ||
               (news.related && news.related.some(rel => rel.toLowerCase().includes(cleanSymbol)));
      });
      
      return relatedNews.slice(0, 10); // Return top 10 related news
    } else {
      // For non-Indian stocks, we don't have NSE-BSE coverage
      throw new Error(`NSE-BSE API only supports Indian stock news. Cannot fetch news for ${symbol}`);
    }
  } catch (error) {
    console.error(`Stock news error for ${symbol}:`, error.message);
    throw error;
  }
}

// Helper to transform NSE quote format
function transformNSEQuote(quote, originalSymbol) {
  return {
    c: quote.price || quote.lastPrice || 0,
    d: quote.change || 0,
    dp: quote.pChange || 0,
    h: quote.dayHigh || 0,
    l: quote.dayLow || 0,
    o: quote.openPrice || 0,
    pc: quote.previousClose || 0,
    isIndian: true,
    symbol: originalSymbol,
    currency: '₹',
    exchange: 'NSE',
    volume: quote.totalTradedVolume || 0,
    vwap: quote.vwap || 0,
    name: quote.companyName || quote.name || originalSymbol
  };
}

// Helper to transform BSE quote format
function transformBSEQuote(quote, originalSymbol) {
  return {
    c: quote.currentPrice || quote.ltp || 0,
    d: quote.change || 0,
    dp: quote.pChange || 0,
    h: quote.high || 0,
    l: quote.low || 0,
    o: quote.open || 0,
    pc: quote.previousClose || 0,
    isIndian: true,
    symbol: originalSymbol,
    currency: '₹',
    exchange: 'BSE',
    volume: quote.volume || 0,
    vwap: quote.vwap || 0,
    name: quote.companyName || quote.name || originalSymbol
  };
}