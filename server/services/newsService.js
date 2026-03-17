import axios from 'axios';
import dotenv from 'dotenv';
import { getCache, setCache } from '../utils/cache.js';

dotenv.config();

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const NEWS_API_KEY = process.env.NEWS_API_KEY; // NewsAPI.org key (optional)
const NEWS_PROVIDER = (process.env.NEWS_PROVIDER || 'finnhub').toLowerCase();

// Allowlist of professional news domains only
const ALLOWED_DOMAINS = new Set([
  'bloomberg.com',
  'reuters.com',
  'ft.com',
  'wsj.com',
  'economictimes.indiatimes.com',
  'moneycontrol.com',
  'business-standard.com',
  'livemint.com',
  'cnbc.com',
  'cnbctv18.com',
  'thehindu.com',
  'toi.in',
  'hindustantimes.com',
  'ndtv.com',
]);

function isAllowedUrl(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    // Match base domain in allowlist
    return Array.from(ALLOWED_DOMAINS).some((d) => host.endsWith(d));
  } catch (e) {
    return false;
  }
}

function filterAllowed(articles) {
  return (articles || []).filter((a) => a.url && isAllowedUrl(a.url));
}

async function fetchNewsFromNewsAPI(params = {}) {
  if (!NEWS_API_KEY) return [];
  
  // Map categories to NewsAPI categories
  const categoryMap = {
    'general': 'general',
    'forex': 'business',
    'crypto': 'technology',
    'merger': 'business',
    'business': 'business',
    'technology': 'technology',
    'finance': 'business'
  };
  
  const newsCategory = categoryMap[params.category] || 'business';
  
  const url = 'https://newsapi.org/v2/top-headlines';
  const response = await axios.get(url, {
    params: { 
      ...params, 
      category: newsCategory,
      apiKey: NEWS_API_KEY, 
      pageSize: params.pageSize || 20 
    },
    timeout: 10000,
  });
  const items = (response.data?.articles || []).map((a, idx) => ({
    id: a.url || idx,
    headline: a.title,
    summary: a.description,
    source: a.source?.name,
    url: a.url,
    image: a.urlToImage,
    datetime: a.publishedAt ? Math.floor(new Date(a.publishedAt).getTime() / 1000) : Math.floor(Date.now() / 1000),
    category: params.category || 'general',
    related: [],
  }));
  return filterAllowed(items);
}

/**
 * Get market news from Finnhub
 * @param {string} category - news category (general, forex, crypto, merger)
 * @param {number} limit - number of articles to return
 */
export async function getMarketNews(category = 'general', limit = 20) {
  const cacheKey = `market_news_${category}_${limit}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  console.log(`Fetching market news. Provider: ${NEWS_PROVIDER}, Category: ${category}`);
  
  try {
    let news = [];
    
    // Get news from primary provider (Finnhub or NewsAPI)
    if (NEWS_PROVIDER === 'newsapi' && NEWS_API_KEY) {
      console.log('Using NewsAPI.org provider');
      news = await fetchNewsFromNewsAPI({ category, country: 'us', pageSize: limit });
      console.log(`NewsAPI returned ${news.length} articles`);
    } else if (FINNHUB_API_KEY) {
      console.log('Using Finnhub provider');
      const response = await axios.get('https://finnhub.io/api/v1/news', {
        params: { category, token: FINNHUB_API_KEY },
        timeout: 10000,
      });
      const mapped = response.data.slice(0, limit).map((article) => ({
        id: article.id,
        headline: article.headline,
        summary: article.summary,
        source: article.source,
        url: article.url,
        image: article.image,
        datetime: article.datetime,
        category: article.category || category,
        related: article.related || [],
      }));
      news = filterAllowed(mapped);
      console.log(`Finnhub returned ${news.length} articles after filtering`);
    } else {
      console.log('No API keys available, using mock data');
      news = getMockNews(category, limit);
    }

    // Cache and return news (Finnhub or NewsAPI only)
    setCache(cacheKey, news, 300);
    return news;
  } catch (error) {
    console.error('Error fetching market news:', error.message);
    console.log('Falling back to mock data');
    return getMockNews(category, limit);
  }
}

/**
 * Get company-specific news from Finnhub
 * @param {string} symbol - stock symbol
 * @param {string} from - start date (YYYY-MM-DD)
 * @param {string} to - end date (YYYY-MM-DD)
 */
export async function getCompanyNews(symbol, from, to) {
  const cacheKey = `company_news_${symbol}_${from}_${to}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    if (!FINNHUB_API_KEY) {
      return getMockCompanyNews(symbol);
    }

    const response = await axios.get('https://finnhub.io/api/v1/company-news', {
      params: {
        symbol: symbol.toUpperCase(),
        from: from,
        to: to,
        token: FINNHUB_API_KEY
      },
      timeout: 10000
    });

    const news = response.data.map(article => ({
      id: article.id,
      headline: article.headline,
      summary: article.summary,
      source: article.source,
      url: article.url,
      image: article.image,
      datetime: article.datetime,
      category: 'company',
      related: [symbol]
    }));

    setCache(cacheKey, news, 300); // Cache for 5 minutes
    return news;
  } catch (error) {
    console.error(`Error fetching news for ${symbol}:`, error.message);
    return getMockCompanyNews(symbol);
  }
}

/**
 * Get country-specific news
 * @param {string} country - country code (IN, US)
 * @param {string} category - news category
 */
export async function getCountryNews(country = 'IN', category = 'business') {
  const cacheKey = `country_news_${country}_${category}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    let result = [];
    
    if (country === 'IN') {
      // For India, use NewsAPI with India filter or Finnhub
      if (NEWS_PROVIDER === 'newsapi' && NEWS_API_KEY) {
        result = await fetchNewsFromNewsAPI({ country: 'in', category });
      } else {
        // fallback to general market news filtered by keywords
        const marketNews = await getMarketNews('general', 20);
        result = marketNews.filter((article) => {
          const text = article.headline?.toLowerCase() + ' ' + article.summary?.toLowerCase();
          return text.includes('india') ||
                 text.includes('nse') ||
                 text.includes('sensex') ||
                 text.includes('nifty') ||
                 text.includes('bse');
        });
      }
    } else if (country === 'US') {
      // For US, use existing providers
      if (NEWS_PROVIDER === 'newsapi' && NEWS_API_KEY) {
        result = await fetchNewsFromNewsAPI({ country: 'us', category });
      } else {
        // fallback to general market news filtered by keywords
        const marketNews = await getMarketNews('general', 20);
        result = marketNews.filter((article) => {
          const text = article.headline?.toLowerCase() + ' ' + article.summary?.toLowerCase();
          return text.includes('us') ||
                 text.includes('nasdaq') ||
                 text.includes('dow') ||
                 text.includes('s&p') ||
                 text.includes('nyse');
        });
      }
    }

    // If no results, fallback to general market news
    if (result.length === 0) {
      result = await getMarketNews('general', 20);
    }

    setCache(cacheKey, result, 300);
    return result;
  } catch (error) {
    console.error(`Error fetching ${country} news:`, error.message);
    return getMockNews('general', 20);
  }
}

/**
 * Get IPO-related news from Finnhub only
 */
export async function getIPONews() {
  const cacheKey = 'ipo_news';
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    // Get IPO-related news from Finnhub
    const marketNews = await getMarketNews('general', 50);
    const finnhubIPONews = marketNews.filter(article => {
      const text = (article.headline + ' ' + article.summary).toLowerCase();
      return text.includes('ipo') ||
             text.includes('initial public offering') ||
             text.includes('going public') ||
             text.includes('listing');
    });
    
    // Sort by datetime (most recent first) and limit to 20 articles
    finnhubIPONews.sort((a, b) => b.datetime - a.datetime);
    const finalNews = finnhubIPONews.slice(0, 20);

    setCache(cacheKey, finalNews, 600); // Cache for 10 minutes
    return finalNews;
  } catch (error) {
    console.error('Error fetching IPO news:', error.message);
    return getMockIPONews();
  }
}

/**
 * Mock news data for fallback - PROFESSIONAL SOURCES ONLY
 */
function getMockNews(category, limit) {
  const mockArticles = [
    {
      id: 1,
      headline: 'Stock Markets Rally on Positive Economic Data',
      summary: 'Major indices close higher as investors react to better-than-expected economic indicators from Federal Reserve reports.',
      source: 'Bloomberg',
      url: 'https://www.bloomberg.com',
      image: 'https://via.placeholder.com/400x200',
      datetime: Date.now() / 1000,
      category: category,
      related: []
    },
    {
      id: 2,
      headline: 'Tech Stocks Lead Market Gains',
      summary: 'Technology sector outperforms as major companies report strong earnings in quarterly results.',
      source: 'Reuters',
      url: 'https://www.reuters.com',
      image: 'https://via.placeholder.com/400x200',
      datetime: Date.now() / 1000 - 3600,
      category: category,
      related: []
    },
    {
      id: 3,
      headline: 'Federal Reserve Signals Steady Interest Rates',
      summary: 'Central bank maintains current policy stance amid stable inflation, according to FOMC minutes.',
      source: 'Financial Times',
      url: 'https://www.ft.com',
      image: 'https://via.placeholder.com/400x200',
      datetime: Date.now() / 1000 - 7200,
      category: category,
      related: []
    }
  ];

  return mockArticles.slice(0, limit);
}

function getMockCompanyNews(symbol) {
  return [
    {
      id: 1,
      headline: `${symbol} Reports Strong Quarterly Results`,
      summary: 'Company exceeds analyst expectations with robust revenue growth according to SEC filings.',
      source: 'Wall Street Journal',
      url: 'https://www.wsj.com',
      image: 'https://via.placeholder.com/400x200',
      datetime: Date.now() / 1000,
      category: 'company',
      related: [symbol]
    }
  ];
}

function getMockIPONews() {
  return [
    {
      id: 1,
      headline: 'Major Tech Company Files for IPO',
      summary: 'Leading technology firm announces plans to go public in upcoming quarter, according to SEC S-1 filing.',
      source: 'Bloomberg',
      url: 'https://www.bloomberg.com',
      image: 'https://via.placeholder.com/400x200',
      datetime: Date.now() / 1000,
      category: 'ipo',
      related: []
    }
  ];
}
