import express from 'express';
import { 
  getStockQuote, 
  getCompanyProfile, 
  searchStocks, 
  getStockNews
} from '../services/stockService.js';
import { getAllIPOs, getUpcomingIPOs, getRecentIPOs, getIndianIPOs } from '../services/ipoService.js';
import { saveWatchedStock, getWatchlist, removeFromWatchlist } from '../services/supabaseService.js';

const router = express.Router();

// Existing routes...
router.get('/quote/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const quote = await getStockQuote(symbol);
    const profile = await getCompanyProfile(symbol);
    
    res.json({
      symbol: symbol.toUpperCase(),
      quote,
      profile
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Query parameter required' });
    }
    
    const results = await searchStocks(q);
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/news/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const news = await getStockNews(symbol);
    res.json({ news });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

// IPO Listings endpoints
router.get('/ipos', async (req, res) => {
  try {
    const ipos = await getAllIPOs();
    res.json(ipos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/ipos/upcoming', async (req, res) => {
  try {
    const ipos = await getUpcomingIPOs();
    res.json({ ipos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/ipos/recent', async (req, res) => {
  try {
    const ipos = await getRecentIPOs();
    res.json({ ipos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/ipos/indian', async (req, res) => {
  try {
    const ipos = await getIndianIPOs();
    res.json({ ipos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;