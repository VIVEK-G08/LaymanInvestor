import { NSE, BSE } from 'nse-bse-api';
import { getCache, setCache } from '../utils/cache.js';

// Initialize NSE and BSE clients
let nseClient = null;
let bseClient = null;

/**
 * Initialize NSE and BSE clients
 */
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

/**
 * Get IPO data from NSE
 */
export async function getNSEIPOData() {
  const cacheKey = 'nse_ipos';
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    const { nseClient } = initializeClients();
    const ipoData = await nseClient.ipo.listCurrentIPO();
    
    // Transform NSE IPO data to match our format
    const transformedIPOs = ipoData.map(ipo => ({
      company: ipo.companyName || ipo.name,
      symbol: ipo.symbol || `${ipo.code}.NS`,
      exchange: 'NSE',
      date: ipo.openingDate || ipo.date,
      priceRange: ipo.priceBand || `${ipo.priceMin}-${ipo.priceMax}`,
      status: getIPOStatus(ipo.openingDate || ipo.date),
      sector: ipo.industry || '—',
      shares: ipo.issueSize || formatShares(ipo.totalShares),
      lotSize: ipo.lotSize || '—',
      listingDate: ipo.listingDate || '—',
      gmp: ipo.gmp || '—' // Grey Market Premium
    }));

    setCache(cacheKey, transformedIPOs, 600); // Cache for 10 minutes
    return transformedIPOs;
  } catch (error) {
    console.error('Error fetching NSE IPO data:', error.message);
    return [];
  }
}

/**
 * Get IPO data from BSE
 */
export async function getBSEIPOData() {
  const cacheKey = 'bse_ipos';
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    const { bseClient } = initializeClients();
    const ipoData = await bseClient.getIPOData();
    
    // Transform BSE IPO data to match our format
    const transformedIPOs = ipoData.map(ipo => ({
      company: ipo.companyName || ipo.name,
      symbol: ipo.symbol || `${ipo.code}.BO`,
      exchange: 'BSE',
      date: ipo.openingDate || ipo.date,
      priceRange: ipo.priceBand || `${ipo.priceMin}-${ipo.priceMax}`,
      status: getIPOStatus(ipo.openingDate || ipo.date),
      sector: ipo.industry || '—',
      shares: ipo.issueSize || formatShares(ipo.totalShares),
      lotSize: ipo.lotSize || '—',
      listingDate: ipo.listingDate || '—'
    }));

    setCache(cacheKey, transformedIPOs, 600); // Cache for 10 minutes
    return transformedIPOs;
  } catch (error) {
    console.error('Error fetching BSE IPO data:', error.message);
    return [];
  }
}

/**
 * Get combined IPO data from both NSE and BSE
 */
export async function getAllNSEBSEIPOs() {
  const cacheKey = 'all_nse_bse_ipos';
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    const [nseIPOs, bseIPOs] = await Promise.all([
      getNSEIPOData(),
      getBSEIPOData()
    ]);

    const allIPOs = [...nseIPOs, ...bseIPOs];
    
    // Categorize IPOs
    const upcoming = allIPOs.filter(ipo => ipo.status === 'Upcoming');
    const recent = allIPOs.filter(ipo => ipo.status === 'Listed' || ipo.status === 'Today');
    
    const result = {
      upcoming: {
        indian: upcoming,
        foreign: [],
        all: upcoming
      },
      recent: {
        indian: recent,
        foreign: [],
        all: recent
      },
      indian: allIPOs,
      all: allIPOs
    };

    setCache(cacheKey, result, 600); // Cache for 10 minutes
    return result;
  } catch (error) {
    console.error('Error fetching combined IPO data:', error.message);
    return {
      upcoming: { indian: [], foreign: [], all: [] },
      recent: { indian: [], foreign: [], all: [] },
      indian: [],
      all: []
    };
  }
}

/**
 * Get corporate announcements from NSE
 */
export async function getNSEAnnouncements() {
  const cacheKey = 'nse_announcements';
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    const { nseClient } = initializeClients();
    const announcements = await nseClient.corporate.getAnnouncements({
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      to: new Date()
    });
    
    // Transform announcements to news format
    const transformedNews = announcements.slice(0, 20).map(announcement => ({
      id: announcement.id || `nse_${Date.now()}_${Math.random()}`,
      headline: announcement.headline || announcement.title,
      summary: announcement.description || announcement.summary,
      source: 'NSE',
      url: announcement.attachments?.[0]?.url || 'https://www.nseindia.com',
      image: null,
      datetime: announcement.timestamp ? Math.floor(new Date(announcement.timestamp).getTime() / 1000) : Math.floor(Date.now() / 1000),
      category: 'corporate',
      related: announcement.symbols || [],
      exchange: 'NSE'
    }));

    setCache(cacheKey, transformedNews, 300); // Cache for 5 minutes
    return transformedNews;
  } catch (error) {
    console.error('Error fetching NSE announcements:', error.message);
    return [];
  }
}

/**
 * Get corporate announcements from BSE
 */
export async function getBSEAnnouncements() {
  const cacheKey = 'bse_announcements';
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    const { bseClient } = initializeClients();
    const announcements = await bseClient.announcements({
      fromDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      toDate: new Date()
    });
    
    // Transform announcements to news format
    const transformedNews = announcements.slice(0, 20).map(announcement => ({
      id: announcement.id || `bse_${Date.now()}_${Math.random()}`,
      headline: announcement.headline || announcement.title,
      summary: announcement.description || announcement.summary,
      source: 'BSE',
      url: announcement.pdfUrl || 'https://www.bseindia.com',
      image: null,
      datetime: announcement.newsDate ? Math.floor(new Date(announcement.newsDate).getTime() / 1000) : Math.floor(Date.now() / 1000),
      category: 'corporate',
      related: announcement.scripCode ? [announcement.scripCode.toString()] : [],
      exchange: 'BSE'
    }));

    setCache(cacheKey, transformedNews, 300); // Cache for 5 minutes
    return transformedNews;
  } catch (error) {
    console.error('Error fetching BSE announcements:', error.message);
    return [];
  }
}

/**
 * Get combined news from NSE and BSE announcements
 */
export async function getNSEBSENews(category = 'all') {
  const cacheKey = `nse_bse_news_${category}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    const [nseNews, bseNews] = await Promise.all([
      getNSEAnnouncements(),
      getBSEAnnouncements()
    ]);

    let allNews = [...nseNews, ...bseNews];
    
    // Sort by datetime (most recent first)
    allNews.sort((a, b) => b.datetime - a.datetime);
    
    // Filter by category if specified
    if (category !== 'all') {
      allNews = allNews.filter(news => news.category === category);
    }

    setCache(cacheKey, allNews, 300); // Cache for 5 minutes
    return allNews;
  } catch (error) {
    console.error('Error fetching NSE-BSE news:', error.message);
    return [];
  }
}

/**
 * Get market status from NSE
 */
export async function getNSEMarketStatus() {
  const cacheKey = 'nse_market_status';
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    const { nseClient } = initializeClients();
    const status = await nseClient.market.getStatus();
    
    setCache(cacheKey, status, 60); // Cache for 1 minute
    return status;
  } catch (error) {
    console.error('Error fetching NSE market status:', error.message);
    return null;
  }
}

/**
 * Clean up clients
 */
export async function cleanupClients() {
  try {
    if (nseClient) {
      await nseClient.exit();
      nseClient = null;
    }
    if (bseClient) {
      await bseClient.close();
      bseClient = null;
    }
  } catch (error) {
    console.error('Error cleaning up NSE-BSE clients:', error.message);
  }
}

/**
 * Helper function to determine IPO status
 */
function getIPOStatus(ipoDate) {
  if (!ipoDate) return 'Upcoming';
  
  const today = new Date();
  const ipo = new Date(ipoDate);
  
  if (ipo > today) {
    return 'Upcoming';
  } else if (ipo.toDateString() === today.toDateString()) {
    return 'Today';
  } else {
    return 'Listed';
  }
}

/**
 * Helper function to format shares
 */
function formatShares(shares) {
  if (!shares) return 'TBA';
  
  const num = parseFloat(shares);
  if (num >= 10000000) {
    return `${(num / 10000000).toFixed(1)} Cr`;
  } else if (num >= 100000) {
    return `${(num / 100000).toFixed(1)} L`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)} K`;
  }
  return shares.toString();
}
