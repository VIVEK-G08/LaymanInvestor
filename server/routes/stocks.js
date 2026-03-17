import express from 'express';
import indianStockService from '../services/indianStockService.js';
import { getAllIPOs } from '../services/ipoService.js';
import { saveWatchedStock, getWatchlist, removeFromWatchlist } from '../services/supabaseService.js';

const router = express.Router();

// Existing routes...
// Updated routes using NSE/BSE direct APIs
router.get('/quote/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { exchange = 'nse' } = req.query;
    
    const quote = await indianStockService.getStockQuote(symbol, exchange);
    const details = await indianStockService.getStockDetails(symbol, exchange);
    
    res.json({
      symbol: symbol.toUpperCase(),
      quote,
      profile: {
        name: details.name,
        finnhubIndustry: details.info?.industry || 'N/A',
        marketCapitalization: details.metadata?.marketCap || 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { q, exchange = 'both' } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Query parameter required' });
    }
    
    const results = await indianStockService.searchStocks(q, exchange);
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove news endpoint as it's not directly supported by NSE/BSE APIs
// router.get('/news/:symbol', async (req, res) => {
//   // News functionality can be added later with a separate service
// });

router.post('/watchlist', async (req, res) => {
  try {
    const { userId, symbol } = req.body;
    await saveWatchedStock(userId, symbol);
    res.json({ success: true, message: 'Added to watchlist' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/watchlist/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const watchlist = await getWatchlist(userId);
    res.json({ watchlist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE watchlist item
router.delete('/watchlist/:userId/:symbol', async (req, res) => {
  try {
    const { userId, symbol } = req.params;
    await removeFromWatchlist(userId, symbol);
    res.json({ success: true, message: 'Removed from watchlist' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// IPO Listings endpoints using NSE-BSE API - Returns structure expected by frontend
router.get('/ipos/upcoming', async (req, res) => {
  try {
    const { exchange = 'both' } = req.query;
    const allIPOs = await getAllIPOs();
    
    // Return data in the structure expected by IPOTab.jsx frontend
    // Frontend expects: { upcoming: { all: [], indian: [], foreign: [] } }
    const upcoming = {
      all: allIPOs.upcoming?.all || [],
      indian: allIPOs.upcoming?.indian || [],
      foreign: allIPOs.upcoming?.foreign || []
    };
    
    // Filter based on exchange parameter if specified
    if (exchange === 'nse') {
      upcoming.all = upcoming.indian.filter(ipo => ipo.exchange === 'NSE');
    } else if (exchange === 'bse') {
      upcoming.all = upcoming.indian.filter(ipo => ipo.exchange === 'BSE');
    } else if (exchange === 'indian') {
      upcoming.all = upcoming.indian;
    }
    
    res.json({ 
      upcoming,
      recent: { all: [], indian: [], foreign: [] } // Empty recent for upcoming endpoint
    });
  } catch (error) {
    console.error('IPO fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Main IPO endpoint - returns all IPO data
router.get('/ipos', async (req, res) => {
  try {
    const allIPOs = await getAllIPOs();
    // Return data in the structure expected by IPOTab.jsx frontend
    // Frontend expects: { upcoming: { all: [], indian: [], foreign: [] }, recent: { all: [], indian: [], foreign: [] } }
    const upcoming = {
      all: allIPOs.upcoming?.all || [],
      indian: allIPOs.upcoming?.indian || [],
      foreign: allIPOs.upcoming?.foreign || []
    };
    const recent = {
      all: allIPOs.recent?.all || [],
      indian: allIPOs.recent?.indian || [],
      foreign: allIPOs.recent?.foreign || []
    };
    res.json({ upcoming, recent });
  } catch (error) {
    console.error('IPO fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Indian IPOs endpoint
router.get('/ipos/indian', async (req, res) => {
  try {
    const allIPOs = await getAllIPOs();
    res.json({ ipos: allIPOs.indian });
  } catch (error) {
    console.error('Indian IPO fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Recent IPOs endpoint - Returns structure expected by frontend
router.get('/ipos/recent', async (req, res) => {
  try {
    const { exchange = 'both' } = req.query;
    const allIPOs = await getAllIPOs();
    
    // Return data in the structure expected by IPOTab.jsx frontend
    const recent = {
      all: allIPOs.recent?.all || [],
      indian: allIPOs.recent?.indian || [],
      foreign: allIPOs.recent?.foreign || []
    };
    
    // Filter based on exchange parameter if specified
    if (exchange === 'indian') {
      recent.all = recent.indian;
    }
    
    res.json({ 
      recent,
      upcoming: { all: [], indian: [], foreign: [] } // Empty upcoming for recent endpoint
    });
  } catch (error) {
    console.error('Recent IPO fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;