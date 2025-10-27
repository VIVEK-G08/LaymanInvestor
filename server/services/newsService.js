import axios from 'axios';
import dotenv from 'dotenv';
import { getCache, setCache } from '../utils/cache.js';

dotenv.config();

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const NEWS_API_KEY = process.env.NEWS_API_KEY; // Optional: NewsAPI.org key

/**
 * Get market news from Finnhub
 * @param {string} category - news category (general, forex, crypto, merger)
 * @param {number} limit - number of articles to return
 */
export async function getMarketNews(category = 'general', limit = 20) {
  const cacheKey = `market_news_${category}_${limit}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    if (!FINNHUB_API_KEY) {
      return getMockNews(category, limit);
    }

    const response = await axios.get('https://finnhub.io/api/v1/news', {
      params: {
        category: category,
        token: FINNHUB_API_KEY
      },
      timeout: 10000
    });

    const news = response.data.slice(0, limit).map(article => ({
      id: article.id,
      headline: article.headline,
      summary: article.summary,
      source: article.source,
      url: article.url,
      image: article.image,
      datetime: article.datetime,
      category: article.category || category,
      related: article.related || []
    }));

    setCache(cacheKey, news, 300); // Cache for 5 minutes
    return news;
  } catch (error) {
    console.error('Error fetching market news:', error.message);
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
    // Use market news for now, can integrate NewsAPI.org later
    const marketNews = await getMarketNews('general', 20);
    
    // Filter by country if possible (basic implementation)
    const filteredNews = marketNews.filter(article => {
      if (country === 'IN') {
        return article.headline.toLowerCase().includes('india') ||
               article.headline.toLowerCase().includes('nse') ||
               article.headline.toLowerCase().includes('sensex') ||
               article.headline.toLowerCase().includes('nifty');
      } else if (country === 'US') {
        return article.headline.toLowerCase().includes('us') ||
               article.headline.toLowerCase().includes('nasdaq') ||
               article.headline.toLowerCase().includes('dow') ||
               article.headline.toLowerCase().includes('s&p');
      }
      return true;
    });

    const result = filteredNews.length > 0 ? filteredNews : marketNews;
    setCache(cacheKey, result, 300);
    return result;
  } catch (error) {
    console.error(`Error fetching ${country} news:`, error.message);
    return getMockNews('general', 20);
  }
}

/**
 * Get IPO-related news
 */
export async function getIPONews() {
  const cacheKey = 'ipo_news';
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    const marketNews = await getMarketNews('general', 50);
    
    // Filter for IPO-related news
    const ipoNews = marketNews.filter(article => {
      const text = (article.headline + ' ' + article.summary).toLowerCase();
      return text.includes('ipo') ||
             text.includes('initial public offering') ||
             text.includes('going public') ||
             text.includes('listing');
    });

    setCache(cacheKey, ipoNews, 600); // Cache for 10 minutes
    return ipoNews;
  } catch (error) {
    console.error('Error fetching IPO news:', error.message);
    return getMockIPONews();
  }
}

/**
 * Mock news data for fallback
 */
function getMockNews(category, limit) {
  const mockArticles = [
    {
      id: 1,
      headline: 'Stock Markets Rally on Positive Economic Data',
      summary: 'Major indices close higher as investors react to better-than-expected economic indicators.',
      source: 'Market Watch',
      url: '#',
      image: 'https://via.placeholder.com/400x200',
      datetime: Date.now() / 1000,
      category: category,
      related: []
    },
    {
      id: 2,
      headline: 'Tech Stocks Lead Market Gains',
      summary: 'Technology sector outperforms as major companies report strong earnings.',
      source: 'Financial Times',
      url: '#',
      image: 'https://via.placeholder.com/400x200',
      datetime: Date.now() / 1000 - 3600,
      category: category,
      related: []
    },
    {
      id: 3,
      headline: 'Federal Reserve Signals Steady Interest Rates',
      summary: 'Central bank maintains current policy stance amid stable inflation.',
      source: 'Reuters',
      url: '#',
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
      summary: 'Company exceeds analyst expectations with robust revenue growth.',
      source: 'Business News',
      url: '#',
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
      summary: 'Leading technology firm announces plans to go public in upcoming quarter.',
      source: 'IPO Watch',
      url: '#',
      image: 'https://via.placeholder.com/400x200',
      datetime: Date.now() / 1000,
      category: 'ipo',
      related: []
    }
  ];
}
