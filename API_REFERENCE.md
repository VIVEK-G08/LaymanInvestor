# LaymanInvestor API Reference

## 📡 Backend API Endpoints

### Base URL
```
Production: https://LaymanInvestor.onrender.com/api
Development: http://localhost:5000/api
```

---

## 🗨️ Chat Endpoints

### Send Message
```http
POST /chat/message
Content-Type: application/json

{
  "message": "What is a stock?",
  "userId": "user-uuid",
  "conversationHistory": [
    { "role": "user", "content": "Previous message" },
    { "role": "assistant", "content": "Previous response" }
  ]
}
```

**Response:**
```json
{
  "response": "AI response text...",
  "emotion": "curious",
  "timestamp": "2025-10-27T15:30:00.000Z"
}
```

### Get Chat History
```http
GET /chat/history/:userId
```

**Response:**
```json
{
  "history": [
    {
      "role": "user",
      "content": "Message text",
      "emotion": "curious",
      "created_at": "2025-10-27T15:30:00.000Z"
    }
  ]
}
```

### Clear Chat History
```http
DELETE /chat/history/:userId
```

---

## 📊 Stock Endpoints

### Get Stock Quote
```http
GET /stocks/quote/:symbol
```

**Example:** `/stocks/quote/AAPL` or `/stocks/quote/RELIANCE.NS`

**Response:**
```json
{
  "symbol": "AAPL",
  "quote": {
    "c": 178.50,
    "d": 2.30,
    "dp": 1.31,
    "h": 179.20,
    "l": 176.80,
    "o": 177.00,
    "pc": 176.20,
    "isIndian": false
  },
  "profile": {
    "name": "Apple Inc.",
    "finnhubIndustry": "Technology",
    "marketCapitalization": 2800000000000
  }
}
```

### Search Stocks
```http
GET /stocks/search?q=apple
```

**Response:**
```json
{
  "results": [
    {
      "symbol": "AAPL",
      "description": "Apple Inc.",
      "sector": "Technology"
    }
  ]
}
```

### Get Stock News
```http
GET /stocks/news/:symbol
```

**Response:**
```json
{
  "news": [
    {
      "headline": "Apple announces new product",
      "datetime": 1698412800,
      "source": "Reuters",
      "url": "https://..."
    }
  ]
}
```

---

## 📅 IPO Endpoints (NEW)

### Get All IPOs
```http
GET /stocks/ipos
```

**Response:**
```json
{
  "upcoming": [...],
  "recent": [...],
  "indian": [...],
  "all": [...]
}
```

### Get Upcoming IPOs
```http
GET /stocks/ipos/upcoming
```

**Response:**
```json
{
  "ipos": [
    {
      "symbol": "NEWCO",
      "company": "New Company Inc.",
      "exchange": "NASDAQ",
      "date": "2025-11-15",
      "priceRange": "$15-18",
      "shares": "10M",
      "status": "Upcoming",
      "totalValue": "$170M"
    }
  ]
}
```

### Get Recent IPOs
```http
GET /stocks/ipos/recent
```

### Get Indian IPOs
```http
GET /stocks/ipos/indian
```

**Response:**
```json
{
  "ipos": [
    {
      "company": "Tata Technologies",
      "symbol": "TATATECH.NS",
      "exchange": "NSE",
      "date": "2023-11-30",
      "priceRange": "₹475-500",
      "status": "Listed",
      "listingGain": "+140%",
      "sector": "IT Services"
    }
  ]
}
```

---

## 📈 Market Data Endpoints (NEW)

### Get Top Movers
```http
GET /market/top-movers?limit=5
```

**Response:**
```json
{
  "gainers": [
    {
      "symbol": "RELIANCE.NS",
      "name": "Reliance Industries",
      "price": "₹2,456.00",
      "change": "+2.80%",
      "changeValue": "+₹67.00",
      "isGainer": true,
      "changePercent": 2.80
    }
  ],
  "losers": [
    {
      "symbol": "TATAMOTORS.NS",
      "name": "Tata Motors",
      "price": "₹745.00",
      "change": "-1.80%",
      "changeValue": "-₹13.50",
      "isGainer": false,
      "changePercent": -1.80
    }
  ],
  "timestamp": "2025-10-27T15:30:00.000Z"
}
```

### Get Trending Stocks
```http
GET /market/trending?limit=5
```

**Response:**
```json
{
  "trending": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "price": "$178.50",
      "change": "+3.20%",
      "volume": "High",
      "changePercent": 3.20
    }
  ]
}
```

### Get Market Overview
```http
GET /market/overview
```

**Response:**
```json
{
  "indices": [
    {
      "name": "Nifty 50",
      "value": "19850.25",
      "change": "125.30",
      "changePercent": "0.63",
      "isPositive": true
    },
    {
      "name": "Sensex",
      "value": "66500.50",
      "change": "-85.20",
      "changePercent": "-0.13",
      "isPositive": false
    }
  ],
  "timestamp": "2025-10-27T15:30:00.000Z"
}
```

### Market Depth Search
```http
POST /market/depth-search
Content-Type: application/json

{
  "query": "RELIANCE analysis",
  "userId": "user-uuid"
}
```

**Response:**
```json
{
  "type": "stock_analysis",
  "symbol": "RELIANCE.NS",
  "analysis": "RELIANCE.NS is currently trading at ₹2,456.00 (+2.42%)...",
  "quote": { ... },
  "profile": { ... },
  "news": [ ... ]
}
```

---

## ⭐ Watchlist Endpoints

### Add to Watchlist
```http
POST /stocks/watchlist
Content-Type: application/json

{
  "userId": "user-uuid",
  "symbol": "AAPL"
}
```

### Get Watchlist
```http
GET /stocks/watchlist/:userId
```

**Response:**
```json
{
  "watchlist": [
    {
      "symbol": "AAPL",
      "added_at": "2025-10-27T15:30:00.000Z"
    }
  ]
}
```

### Remove from Watchlist (NEW)
```http
DELETE /stocks/watchlist/:userId/:symbol
```

---

## 🔧 Utility Endpoints

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "message": "LaymanInvestor API is running!"
}
```

---

## 🎣 Frontend Hooks

### useStockQuote
```javascript
import { useStockQuote } from './hooks/useStockData';

function MyComponent() {
  const { data, loading, error, refetch } = useStockQuote('AAPL');
  
  if (loading) return <Spinner />;
  if (error) return <Error message={error} />;
  
  return <div>{data.quote.c}</div>;
}
```

### useStockSearch
```javascript
import { useStockSearch } from './hooks/useStockData';

function SearchComponent() {
  const { results, loading, error, search } = useStockSearch();
  
  const handleSearch = (query) => {
    search(query);
  };
  
  return (
    <input onChange={(e) => handleSearch(e.target.value)} />
  );
}
```

### useWatchlist
```javascript
import { useWatchlist } from './hooks/useStockData';

function WatchlistComponent() {
  const { 
    watchlist, 
    loading, 
    error, 
    addToWatchlist, 
    removeFromWatchlist, 
    refetch 
  } = useWatchlist(userId);
  
  const handleAdd = async (symbol) => {
    const result = await addToWatchlist(symbol);
    if (result.success) {
      alert('Added to watchlist!');
    }
  };
  
  return <div>...</div>;
}
```

### useMarketData
```javascript
import { useMarketData } from './hooks/useStockData';

function MarketComponent() {
  // Auto-refresh every 5 minutes
  const { gainers, losers, trending, loading, error, refetch } = 
    useMarketData(5 * 60 * 1000);
  
  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      {gainers.map(stock => <div key={stock.symbol}>{stock.name}</div>)}
    </div>
  );
}
```

### useIPOData
```javascript
import { useIPOData } from './hooks/useStockData';

function IPOComponent() {
  const { ipos, loading, error, refetch } = useIPOData();
  
  return (
    <div>
      <h2>Upcoming IPOs: {ipos.upcoming.length}</h2>
      <h2>Indian IPOs: {ipos.indian.length}</h2>
    </div>
  );
}
```

---

## 🔐 Authentication

All endpoints that require user-specific data need a `userId` parameter. This is obtained from the Supabase authentication context:

```javascript
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user } = useAuth();
  const userId = user?.id;
  
  // Use userId in API calls
}
```

---

## ⚡ Caching

The backend implements automatic caching for:
- **Stock quotes:** 5 minutes
- **Market data:** 5 minutes
- **IPO data:** 1 hour
- **Search results:** 10 minutes

Cache is automatically cleared when stale. No manual intervention needed.

---

## 🚨 Error Handling

All endpoints return consistent error format:

```json
{
  "error": "Error message",
  "message": "Detailed error description (dev mode only)"
}
```

HTTP Status Codes:
- `200` - Success
- `400` - Bad Request (missing parameters)
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

---

## 📝 Rate Limits

- **Finnhub API:** 60 calls/minute (free tier)
- **Yahoo Finance:** No official limit, but use caching
- **Internal Cache:** Reduces external API calls by ~80%

---

## 🔄 Data Refresh Intervals

- **Top Movers:** 5 minutes
- **Trending Stocks:** 5 minutes
- **Market Overview:** 5 minutes
- **Stock Quotes:** On-demand (cached 5 min)
- **IPO Data:** On-demand (cached 1 hour)

---

## 🎯 Best Practices

1. **Use hooks** instead of direct API calls
2. **Handle loading states** for better UX
3. **Display error messages** to users
4. **Implement retry logic** for failed requests
5. **Cache aggressively** to reduce API costs
6. **Debounce search** to avoid excessive calls

---

## 📞 Support

For issues or questions:
- Check the `OPTIMIZATION_SUMMARY.md` for implementation details
- Review the code comments for inline documentation
- Test endpoints using the `/health` endpoint first

---

**Last Updated:** October 27, 2025
**API Version:** 2.0.0
