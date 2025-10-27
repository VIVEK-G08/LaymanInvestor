import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

/**
 * Get IPO calendar data from Finnhub
 * @param {string} from - Start date (YYYY-MM-DD)
 * @param {string} to - End date (YYYY-MM-DD)
 * @returns {Promise<Array>} IPO listings
 */
export async function getIPOCalendar(from, to) {
  try {
    if (!FINNHUB_API_KEY) {
      console.warn('Finnhub API key not configured, returning mock data');
      return getMockIPOData();
    }

    const response = await axios.get('https://finnhub.io/api/v1/calendar/ipo', {
      params: {
        from,
        to,
        token: FINNHUB_API_KEY
      },
      timeout: 10000
    });

    const ipoData = response.data?.ipoCalendar || [];
    
    // Transform and enrich the data
    return ipoData.map(ipo => ({
      symbol: ipo.symbol,
      company: ipo.name,
      exchange: ipo.exchange,
      date: ipo.date,
      priceRange: ipo.priceRange || 'TBA',
      shares: ipo.numberOfShares || 'TBA',
      status: getIPOStatus(ipo.date),
      totalValue: ipo.totalSharesValue || 'TBA'
    }));

  } catch (error) {
    console.error('IPO Calendar Error:', error.message);
    return getMockIPOData();
  }
}

/**
 * Get upcoming IPOs (next 30 days)
 */
export async function getUpcomingIPOs() {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + 30);

  const from = today.toISOString().split('T')[0];
  const to = futureDate.toISOString().split('T')[0];

  return await getIPOCalendar(from, to);
}

/**
 * Get recent IPOs (last 30 days)
 */
export async function getRecentIPOs() {
  const today = new Date();
  const pastDate = new Date();
  pastDate.setDate(today.getDate() - 30);

  const from = pastDate.toISOString().split('T')[0];
  const to = today.toISOString().split('T')[0];

  return await getIPOCalendar(from, to);
}

/**
 * Get Indian IPO data from NSE/BSE (mock for now, can integrate with real API)
 */
export async function getIndianIPOs() {
  // This would integrate with NSE/BSE APIs or scraping services
  // For now, returning curated Indian IPO data
  return [
    {
      company: 'Tata Technologies',
      symbol: 'TATATECH.NS',
      exchange: 'NSE',
      date: '2023-11-30',
      priceRange: '₹475-500',
      status: 'Listed',
      listingGain: '+140%',
      sector: 'IT Services'
    },
    {
      company: 'Ideaforge Technology',
      symbol: 'IDEAFORGE.NS',
      exchange: 'NSE',
      date: '2023-07-07',
      priceRange: '₹638-672',
      status: 'Listed',
      listingGain: '+20%',
      sector: 'Drones & Defense'
    },
    {
      company: 'Yatharth Hospital',
      symbol: 'YATHARTH.NS',
      exchange: 'NSE',
      date: '2023-08-04',
      priceRange: '₹280-300',
      status: 'Listed',
      listingGain: '+8%',
      sector: 'Healthcare'
    }
  ];
}

/**
 * Determine IPO status based on date
 */
function getIPOStatus(ipoDate) {
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
 * Mock IPO data for fallback
 */
function getMockIPOData() {
  return [
    {
      symbol: 'EXAMPLE',
      company: 'Example Corp',
      exchange: 'NASDAQ',
      date: new Date().toISOString().split('T')[0],
      priceRange: '$15-18',
      shares: '10M',
      status: 'Upcoming',
      totalValue: '$170M'
    }
  ];
}

/**
 * Get comprehensive IPO data (US + Indian)
 */
export async function getAllIPOs() {
  try {
    const [upcoming, recent, indian] = await Promise.all([
      getUpcomingIPOs(),
      getRecentIPOs(),
      getIndianIPOs()
    ]);

    return {
      upcoming: upcoming.filter(ipo => ipo.status === 'Upcoming'),
      recent: recent.filter(ipo => ipo.status === 'Listed'),
      indian: indian,
      all: [...upcoming, ...recent, ...indian]
    };
  } catch (error) {
    console.error('Get All IPOs Error:', error.message);
    return {
      upcoming: [],
      recent: [],
      indian: await getIndianIPOs(),
      all: []
    };
  }
}
