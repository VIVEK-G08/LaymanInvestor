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

// IPO Listings endpoints using NSE-BSE API
router.get('/ipos/upcoming', async (req, res) => {
  try {
    const { exchange = 'both' } = req.query;
    const allIPOs = await getAllIPOs();
    
    // Filter based on exchange parameter
    let ipos = allIPOs.upcoming.all;
    if (exchange === 'nse') {
      ipos = allIPOs.upcoming.indian.filter(ipo => ipo.exchange === 'NSE');
    } else if (exchange === 'bse') {
      ipos = allIPOs.upcoming.indian.filter(ipo => ipo.exchange === 'BSE');
    } else if (exchange === 'indian') {
      ipos = allIPOs.upcoming.indian;
    }
    
    res.json({ ipos });
  } catch (error) {
    console.error('IPO fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Main IPO endpoint - returns all IPO data
router.get('/ipos', async (req, res) => {
  try {
    const allIPOs = await getAllIPOs();
    res.json(allIPOs);
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

// Recent IPOs endpoint
router.get('/ipos/recent', async (req, res) => {
  try {
    const { exchange = 'both' } = req.query;
    const allIPOs = await getAllIPOs();
    
    // Filter based on exchange parameter
    let ipos = allIPOs.recent.all;
    if (exchange === 'indian') {
      ipos = allIPOs.recent.indian;
    }
    
    res.json({ ipos });
  } catch (error) {
    console.error('Recent IPO fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;