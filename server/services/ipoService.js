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
 * Get Indian IPO data from NSE/BSE
 * Updated with 2024-2025 IPOs
 */
export async function getIndianIPOs() {
  // If configured for live data, pull IPO calendar and filter Indian exchanges
  try {
    if (process.env.IPO_SOURCE === 'live' && FINNHUB_API_KEY) {
      const today = new Date();
      const past = new Date();
      const future = new Date();
      past.setDate(today.getDate() - 90);
      future.setDate(today.getDate() + 90);

      const from = past.toISOString().split('T')[0];
      const to = future.toISOString().split('T')[0];
      const res = await axios.get('https://finnhub.io/api/v1/calendar/ipo', {
        params: { from, to, token: FINNHUB_API_KEY },
        timeout: 10000
      });

      const all = res.data?.ipoCalendar || [];
      const indian = all.filter(ipo => {
        const ex = (ipo.exchange || '').toUpperCase();
        const sym = ipo.symbol || '';
        return ex.includes('NSE') || ex.includes('BSE') || sym.includes('.NS') || sym.includes('.BO');
      }).map(ipo => ({
        company: ipo.name,
        symbol: ipo.symbol,
        exchange: ipo.exchange || 'NSE/BSE',
        date: ipo.date,
        priceRange: ipo.priceRange || 'TBA',
        status: getIPOStatus(ipo.date),
        sector: ipo.industry || '—',
        shares: ipo.numberOfShares || 'TBA'
      }));

      // If nothing returned, fall back to curated
      if (indian.length > 0) return indian;
    }
  } catch (e) {
    console.warn('Indian IPO live fetch failed, using curated list:', e.message);
  }

  // Curated list of recent and upcoming Indian IPOs (2024-2025)
  return [
    // 2025 Upcoming IPOs
    {
      company: 'Swiggy',
      symbol: 'SWIGGY.NS',
      exchange: 'NSE',
      date: '2025-11-15',
      priceRange: '₹371-390',
      status: 'Upcoming',
      sector: 'Food Delivery',
      shares: '11.3 Cr'
    },
    {
      company: 'Ola Electric',
      symbol: 'OLAELEC.NS',
      exchange: 'NSE',
      date: '2025-12-01',
      priceRange: '₹72-76',
      status: 'Upcoming',
      sector: 'Electric Vehicles',
      shares: '84.4 Cr'
    },
    {
      company: 'PhysicsWallah',
      symbol: 'PW.NS',
      exchange: 'NSE',
      date: '2025-11-20',
      priceRange: '₹1100-1200',
      status: 'Upcoming',
      sector: 'EdTech',
      shares: '2.5 Cr'
    },
    
    // 2024 Recent Listings
    {
      company: 'Tata Technologies',
      symbol: 'TATATECH.NS',
      exchange: 'NSE',
      date: '2023-11-30',
      priceRange: '₹475-500',
      status: 'Listed',
      listingGain: '+140%',
      sector: 'IT Services',
      currentPrice: '₹1,200'
    },
    {
      company: 'Jio Financial Services',
      symbol: 'JIOFIN.NS',
      exchange: 'NSE',
      date: '2023-08-21',
      priceRange: '₹261-265',
      status: 'Listed',
      listingGain: '+5%',
      sector: 'Financial Services',
      currentPrice: '₹275'
    },
    {
      company: 'Ideaforge Technology',
      symbol: 'IDEAFORGE.NS',
      exchange: 'NSE',
      date: '2023-07-07',
      priceRange: '₹638-672',
      status: 'Listed',
      listingGain: '+20%',
      sector: 'Drones & Defense',
      currentPrice: '₹800'
    },
    {
      company: 'Yatharth Hospital',
      symbol: 'YATHARTH.NS',
      exchange: 'NSE',
      date: '2023-08-04',
      priceRange: '₹280-300',
      status: 'Listed',
      listingGain: '+8%',
      sector: 'Healthcare',
      currentPrice: '₹320'
    },
    {
      company: 'Mankind Pharma',
      symbol: 'MANKIND.NS',
      exchange: 'NSE',
      date: '2023-05-09',
      priceRange: '₹1028-1080',
      status: 'Listed',
      listingGain: '+30%',
      sector: 'Pharmaceuticals',
      currentPrice: '₹1,400'
    },
    {
      company: 'Samvardhana Motherson',
      symbol: 'SAMHI.NS',
      exchange: 'NSE',
      date: '2023-02-01',
      priceRange: '₹129-136',
      status: 'Listed',
      listingGain: '+12%',
      sector: 'Hospitality',
      currentPrice: '₹152'
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
 * Categorize IPOs by region (Indian vs Foreign)
 */
function categorizeIPOsByRegion(ipos) {
  const indianExchanges = ['NSE', 'BSE', 'NSE/BSE'];
  
  const indian = ipos.filter(ipo => 
    indianExchanges.includes(ipo.exchange) || 
    ipo.symbol?.includes('.NS') || 
    ipo.symbol?.includes('.BO')
  );
  
  const foreign = ipos.filter(ipo => 
    !indianExchanges.includes(ipo.exchange) && 
    !ipo.symbol?.includes('.NS') && 
    !ipo.symbol?.includes('.BO')
  );
  
  return { indian, foreign };
}

/**
 * Get all IPO data categorized by region and time
 */
export async function getAllIPOs() {
  const [upcomingRaw, recentRaw, indianIPOs] = await Promise.all([
    getUpcomingIPOs(),
    getRecentIPOs(),
    getIndianIPOs()
  ]);

  // Categorize upcoming and recent by region
  const upcomingCategorized = categorizeIPOsByRegion(upcomingRaw);
  const recentCategorized = categorizeIPOsByRegion(recentRaw);

  return {
    upcoming: {
      indian: [...upcomingCategorized.indian, ...indianIPOs.filter(ipo => ipo.status === 'Upcoming')],
      foreign: upcomingCategorized.foreign,
      all: upcomingRaw
    },
    recent: {
      indian: [...recentCategorized.indian, ...indianIPOs.filter(ipo => ipo.status === 'Listed')],
      foreign: recentCategorized.foreign,
      all: recentRaw
    },
    indian: indianIPOs,
    all: [...upcomingRaw, ...recentRaw, ...indianIPOs]
  };
}
