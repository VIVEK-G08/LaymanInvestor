import axios from 'axios';

class BSEService {
  constructor() {
    this.baseURL = 'https://api.bseindia.com/BseIndiaAPI/api';
    this.session = axios.create({
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.bseindia.com/'
      }
    });
  }

  async searchStocks(query) {
    try {
      // BSE search API - using their public search endpoint
      const response = await this.session.get(`${this.baseURL}/search/w`, {
        params: {
          srch: query,
          srchtype: 'S',
          grp: 'EQ'
        }
      });
      
      const data = response.data;
      if (data && data.Data) {
        return data.Data.map(stock => ({
          symbol: stock.Scrip_Code,
          name: stock.Company_Name,
          description: stock.Company_Name,
          exchange: 'BSE',
          sector: stock.Industry || 'N/A'
        }));
      }
      return [];
    } catch (error) {
      console.error('BSE search error:', error.message);
      // Return empty array on error to avoid breaking the app
      return [];
    }
  }

  async getStockQuote(scripCode) {
    try {
      const response = await this.session.get(`${this.baseURL}/Quote/w`, {
        params: {
          code: scripCode
        }
      });
      
      const data = response.data;
      if (data && data.Data) {
        const quote = data.Data;
        return {
          c: parseFloat(quote.LTP) || 0,
          d: parseFloat(quote.Chnage) || 0,
          dp: parseFloat(quote.ChngPrc) || 0,
          h: parseFloat(quote.High) || 0,
          l: parseFloat(quote.Low) || 0,
          v: parseInt(quote.Volume) || 0,
          isIndian: true,
          currency: '₹'
        };
      }
      throw new Error('Stock not found');
    } catch (error) {
      console.error('BSE quote error:', error.message);
      throw new Error('Failed to fetch BSE stock quote');
    }
  }

  async getStockDetails(scripCode) {
    try {
      const response = await this.session.get(`${this.baseURL}/Quote/w`, {
        params: {
          code: scripCode
        }
      });
      
      const data = response.data;
      if (data && data.Data) {
        return {
          symbol: scripCode,
          name: data.Data.Company_Name,
          priceInfo: data.Data,
          exchange: 'BSE'
        };
      }
      throw new Error('Stock not found');
    } catch (error) {
      console.error('BSE details error:', error.message);
      throw new Error('Failed to fetch BSE stock details');
    }
  }

  async getIPOData() {
    try {
      // BSE IPO API endpoint
      const response = await this.session.get(`${this.baseURL}/IPO/w`);
      return response.data;
    } catch (error) {
      console.error('BSE IPO error:', error.message);
      throw new Error('Failed to fetch BSE IPO data');
    }
  }

  async getUpcomingIPOs() {
    try {
      const ipoData = await this.getIPOData();
      const today = new Date();
      
      if (ipoData && ipoData.Data) {
        const upcomingIPOs = ipoData.Data.filter(ipo => {
          const closeDate = new Date(ipo.Closing_Date);
          return closeDate >= today;
        });
        
        return upcomingIPOs.map(ipo => {
          const openDate = new Date(ipo.Opening_Date);
          const closeDate = new Date(ipo.Closing_Date);
          
          let status = 'Upcoming';
          if (openDate <= today && closeDate >= today) {
            status = 'Open Now';
          } else if (closeDate < today) {
            status = 'Closed';
          }
          
          return {
            companyName: ipo.Company_Name,
            symbol: ipo.Scrip_Code,
            openDate: ipo.Opening_Date,
            closeDate: ipo.Closing_Date,
            issuePrice: ipo.Price_Band,
            issueSize: ipo.Issue_Size,
            listingDate: ipo.Listing_Date,
            status: status,
            exchange: 'BSE'
          };
        }).sort((a, b) => new Date(a.openDate) - new Date(b.openDate));
      }
      return [];
    } catch (error) {
      console.error('BSE upcoming IPOs error:', error.message);
      throw new Error('Failed to fetch upcoming BSE IPOs');
    }
  }
}

export default new BSEService();
