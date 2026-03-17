import axios from 'axios';

class NSEService {
  constructor() {
    this.baseURL = 'https://www.nseindia.com/api';
    this.session = axios.create({
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Referer': 'https://www.nseindia.com/',
        'Origin': 'https://www.nseindia.com'
      }
    });
    
    this.initializeSession();
  }

  async initializeSession() {
    try {
      await this.session.get('https://www.nseindia.com');
      console.log('NSE session initialized successfully');
    } catch (error) {
      console.error('Failed to initialize NSE session:', error.message);
    }
  }

  async searchStocks(query) {
    try {
      const response = await this.session.get(`${this.baseURL}/search/autocomplete?q=${encodeURIComponent(query)}`);
      const data = response.data;
      
      if (data && data.symbols) {
        return data.symbols.map(symbol => ({
          symbol: symbol.symbol,
          name: symbol.symbolInfo?.companyName || symbol.symbol,
          description: symbol.symbolInfo?.companyName || symbol.symbol,
          exchange: 'NSE',
          sector: symbol.symbolInfo?.industry || 'N/A'
        }));
      }
      return [];
    } catch (error) {
      console.error('NSE search error:', error.message);
      throw new Error('Failed to search NSE stocks');
    }
  }

  async getStockQuote(symbol) {
    try {
      const response = await this.session.get(`${this.baseURL}/quote-equity?symbol=${encodeURIComponent(symbol)}`);
      const data = response.data;
      
      if (data && data.priceInfo) {
        const priceInfo = data.priceInfo;
        return {
          c: priceInfo.lastPrice,
          d: priceInfo.change,
          dp: priceInfo.pChange,
          h: priceInfo.intraDayHighLoad,
          l: priceInfo.intraDayLowLoad,
          v: priceInfo.totalTradedVolume,
          isIndian: true,
          currency: '₹'
        };
      }
      throw new Error('Stock not found');
    } catch (error) {
      console.error('NSE quote error:', error.message);
      throw new Error('Failed to fetch NSE stock quote');
    }
  }

  async getStockDetails(symbol) {
    try {
      const response = await this.session.get(`${this.baseURL}/quote-equity?symbol=${encodeURIComponent(symbol)}`);
      const data = response.data;
      
      if (data) {
        return {
          symbol: symbol,
          name: data.info?.companyName || symbol,
          priceInfo: data.priceInfo,
          info: data.info,
          metadata: data.metadata,
          exchange: 'NSE'
        };
      }
      throw new Error('Stock not found');
    } catch (error) {
      console.error('NSE details error:', error.message);
      throw new Error('Failed to fetch NSE stock details');
    }
  }

  async getIPOData() {
    try {
      const response = await this.session.get(`${this.baseURL}/ipo-detail`);
      return response.data;
    } catch (error) {
      console.error('NSE IPO error:', error.message);
      throw new Error('Failed to fetch NSE IPO data');
    }
  }

  async getUpcomingIPOs() {
    try {
      const ipoData = await this.getIPOData();
      const today = new Date();
      
      if (ipoData && ipoData.ipoDetails) {
        const upcomingIPOs = ipoData.ipoDetails.filter(ipo => {
          const closeDate = new Date(ipo.closeDate);
          return closeDate >= today;
        });
        
        return upcomingIPOs.map(ipo => {
          const openDate = new Date(ipo.openDate);
          const closeDate = new Date(ipo.closeDate);
          
          let status = 'Upcoming';
          if (openDate <= today && closeDate >= today) {
            status = 'Open Now';
          } else if (closeDate < today) {
            status = 'Closed';
          }
          
          return {
            companyName: ipo.companyName,
            symbol: ipo.symbol,
            openDate: ipo.openDate,
            closeDate: ipo.closeDate,
            issuePrice: ipo.issuePrice,
            issueSize: ipo.issueSize,
            listingDate: ipo.listingDate,
            status: status,
            exchange: 'NSE'
          };
        }).sort((a, b) => new Date(a.openDate) - new Date(b.openDate));
      }
      return [];
    } catch (error) {
      console.error('NSE upcoming IPOs error:', error.message);
      throw new Error('Failed to fetch upcoming NSE IPOs');
    }
  }
}

export default new NSEService();
