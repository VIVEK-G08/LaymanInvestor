import express from 'express';
import {
  getMarketNews,
  getCompanyNews,
  getCountryNews,
  getIPONews
} from '../services/newsService.js';

const router = express.Router();

/**
 * GET /api/news/market
 * Get general market news
 */
router.get('/market', async (req, res) => {
  try {
    const { category = 'general', limit = 20 } = req.query;
    const news = await getMarketNews(category, parseInt(limit));
    res.json({ news });
  } catch (error) {
    console.error('Error fetching market news:', error);
    res.status(500).json({ error: 'Failed to fetch market news' });
  }
});

/**
 * GET /api/news/company/:symbol
 * Get company-specific news
 */
router.get('/company/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    // Get news for last 7 days
    const to = new Date().toISOString().split('T')[0];
    const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const news = await getCompanyNews(symbol, from, to);
    res.json({ news });
  } catch (error) {
    console.error(`Error fetching news for ${req.params.symbol}:`, error);
    res.status(500).json({ error: 'Failed to fetch company news' });
  }
});

/**
 * GET /api/news/country/:countryCode
 * Get country-specific news
 */
router.get('/country/:countryCode', async (req, res) => {
  try {
    const { countryCode } = req.params;
    const { category = 'business' } = req.query;
    
    const news = await getCountryNews(countryCode.toUpperCase(), category);
    res.json({ news });
  } catch (error) {
    console.error(`Error fetching ${req.params.countryCode} news:`, error);
    res.status(500).json({ error: 'Failed to fetch country news' });
  }
});

/**
 * GET /api/news/ipo
 * Get IPO-related news
 */
router.get('/ipo', async (req, res) => {
  try {
    const news = await getIPONews();
    res.json({ news });
  } catch (error) {
    console.error('Error fetching IPO news:', error);
    res.status(500).json({ error: 'Failed to fetch IPO news' });
  }
});

export default router;
