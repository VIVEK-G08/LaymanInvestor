# LAYMAN INVESTOR 🤝

A modern, intelligent investment advisor platform providing real-time Indian stock market data and comprehensive IPO analysis.

## 🚀 What We Built

### **Core Features**
- **Real-time Stock Search** - Search and get live data for NSE/BSE stocks
- **IPO Tracking** - Upcoming and current Indian IPOs with status tracking
- **AI Chat Assistant** - Investment guidance and market explanations
- **Watchlist Management** - Track your favorite stocks
- **Clean UI** - Simple, light-themed interface focused on usability

### **Technical Architecture**
- **Frontend**: React + Tailwind CSS
- **Backend**: Node.js + Express
- **Data Sources**: Direct NSE & BSE APIs (no API keys required!)
- **Deployment**: Vercel (Frontend) + Render/Heroku (Backend)

## 📋 Step-by-Step Build Process

### **Phase 1: Project Setup & Cleanup**
1. **Removed Dark Mode** - Eliminated all dark/light mode functionality
2. **Rebranded** - Changed from "LaymanInvestor" to "LAYMAN INVESTOR"
3. **Cleaned UI** - Removed complex theming, simplified to light theme only

### **Phase 2: API Integration Overhaul**
1. **Created NSE Service** (`server/services/nseService.js`)
   - Direct NSE API integration
   - Stock search, quotes, and IPO data
   - No authentication required

2. **Created BSE Service** (`server/services/bseService.js`)
   - Direct BSE API integration
   - Complementary data source
   - Fallback for NSE failures

3. **Updated Indian Stock Service** (`server/services/indianStockService.js`)
   - Unified interface for NSE/BSE
   - Smart fallback logic
   - Duplicate removal and data cleaning

### **Phase 3: Route Updates**
1. **Modified Stock Routes** (`server/routes/stocks.js`)
   - Updated to use direct APIs
   - Added exchange parameter support
   - Maintained backward compatibility

2. **IPO Endpoints**
   - Real-time IPO data from NSE
   - Status tracking (Upcoming/Open/Closed)
   - Date-based filtering

### **Phase 4: Frontend Updates**
1. **Removed Theme Components**
   - Deleted `ThemeToggle.jsx`
   - Cleaned `AppContext.jsx`
   - Removed all dark mode CSS classes

2. **Updated Branding**
   - Changed headers and titles
   - Updated meta information
   - Consistent "LAYMAN INVESTOR" naming

## 🛠️ Current API Endpoints

### **Stock Data**
```
GET /api/stocks/search?q={query}&exchange={nse|bse|both}
GET /api/stocks/quote/{symbol}?exchange={nse|bse}
```

### **IPO Data**
```
GET /api/stocks/ipos/upcoming?exchange={nse|bse|both}
GET /api/stocks/ipos/indian
```

### **Watchlist**
```
POST /api/stocks/watchlist
GET /api/stocks/watchlist/{userId}
DELETE /api/stocks/watchlist/{userId}/{symbol}
```

## 📊 Data Sources

### **NSE APIs** (Primary)
- **Search**: `https://www.nseindia.com/api/search/autocomplete`
- **Quotes**: `https://www.nseindia.com/api/quote-equity`
- **IPOs**: `https://www.nseindia.com/api/ipo-detail`

### **BSE APIs** (Fallback)
- **Search**: `https://api.bseindia.com/BseIndiaAPI/api/search/w`
- **Quotes**: `https://api.bseindia.com/BseIndiaAPI/api/Quote/w`
- **IPOs**: `https://api.bseindia.com/BseIndiaAPI/api/IPO/w`

## 🚀 Deployment

### **Frontend (Vercel)**
- Automatic deployment from GitHub
- Build command: `npm run build`
- Environment variables: `REACT_APP_API_URL`

### **Backend (Render/Heroku)**
- Node.js server
- Port: 5000
- CORS configured for Vercel domain

## 🎯 Key Features Explained

### **Smart Stock Search**
- Searches both NSE and BSE simultaneously
- Removes duplicates automatically
- Shows exchange information
- Limits to 15 results for performance

### **IPO Status Tracking**
- **Upcoming**: Open date > today
- **Open Now**: Open date ≤ today ≤ close date
- **Closed**: Close date < today (hidden)
- Auto-refreshes every 5 minutes

### **Error Handling**
- Graceful fallback between NSE/BSE
- User-friendly error messages
- Loading states and empty states
- Network error recovery

## 🔧 Development Setup

### **Prerequisites**
- Node.js 16+
- npm or yarn
- Git

### **Local Development**
```bash
# Clone repository
git clone https://github.com/VIVEK-G08/LaymanInvestor.git
cd LaymanInvestor

# Install dependencies
cd client && npm install
cd ../server && npm install

# Start development servers
npm run dev  # Frontend (port 3000)
npm start    # Backend (port 5000)
```

### **Environment Variables**
```bash
# Client (.env)
REACT_APP_API_URL=http://localhost:5000/api

# Server (.env)
NODE_ENV=development
PORT=5000
```

## 📈 Recent Updates (March 2025)

### **Major Changes**
- ✅ Removed dark mode functionality
- ✅ Rebranded to "LAYMAN INVESTOR"
- ✅ Integrated direct NSE/BSE APIs
- ✅ Eliminated third-party API dependencies
- ✅ Simplified UI to light theme only
- ✅ Improved Indian stock data accuracy

### **Technical Improvements**
- No API keys required
- Faster data retrieval
- Better error handling
- Cleaner codebase
- Reduced dependencies

## 🎨 UI/UX Philosophy

### **Design Principles**
- **Simplicity First** - Clean, uncluttered interface
- **Data Focused** - Emphasis on market information
- **Fast Loading** - Optimized for quick access
- **Mobile Responsive** - Works on all devices
- **Accessibility** - WCAG compliant colors and contrast

### **Color Scheme**
- Primary: Indigo (`#4F46E5`)
- Success: Green (`#059669`)
- Danger: Red (`#DC2626`)
- Background: White/Gray variants

## 🔮 Future Roadmap

### **Planned Features**
- [ ] Advanced charting integration
- [ ] Portfolio tracking
- [ ] Market news integration
- [ ] Price alerts
- [ ] Technical indicators
- [ ] Sector analysis

### **Technical Improvements**
- [ ] WebSocket for real-time updates
- [ ] Data caching layer
- [ ] API rate limiting
- [ ] Mobile app development
- [ ] Advanced analytics

## 📞 Support

### **Issues & Contributions**
- Report bugs via GitHub Issues
- Feature requests welcome
- Pull requests reviewed promptly

### **Contact**
- GitHub: @VIVEK-G08
- Email: vivek@example.com

---

**Last Updated**: March 17, 2025  
**Version**: 2.0.0  
**Status**: Production Ready ✅

---

> 💡 **Note**: This platform uses official NSE and BSE APIs directly, ensuring accurate and real-time market data without requiring API keys or subscriptions.
