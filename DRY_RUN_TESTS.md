# 🧪 Dry Run Testing Guide

## ✅ Files Created/Modified Summary

### New Backend Files (4)
- ✅ `server/services/ipoService.js` (179 lines)
- ✅ `server/utils/cache.js` (95 lines)
- ✅ `server/services/marketDataService.js` (240 lines)

### New Frontend Files (2)
- ✅ `client/src/hooks/useStockData.js` (250 lines)
- ✅ `client/src/components/IPOTab.jsx` (210 lines)

### Modified Backend Files (3)
- ✅ `server/routes/stocks.js` - Added IPO endpoints + watchlist delete
- ✅ `server/routes/market.js` - Added top movers, trending, overview
- ✅ `server/services/stockService.js` - Removed redundant IPO function

### Modified Frontend Files (1)
- ✅ `client/src/components/TopStocks.jsx` - Real-time data integration

### Documentation Files (3)
- ✅ `OPTIMIZATION_SUMMARY.md`
- ✅ `API_REFERENCE.md`
- ✅ `IMPLEMENTATION_CHECKLIST.md`

---

## 🔍 Manual Testing Steps

### Test 1: Backend Server Starts
```bash
cd server
npm install
npm start
```

**Expected Output:**
```
🚀 Server running on http://localhost:5000
Cache cleanup: 0 items remaining
```

**Status:** [ ] Pass [ ] Fail

---

### Test 2: Health Check
```bash
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "LaymanInvestor API is running!"
}
```

**Status:** [ ] Pass [ ] Fail

---

### Test 3: IPO Endpoints

#### 3a. Get All IPOs
```bash
curl http://localhost:5000/api/stocks/ipos
```

**Expected:** JSON with `upcoming`, `recent`, `indian`, `all` arrays

**Status:** [ ] Pass [ ] Fail

#### 3b. Get Upcoming IPOs
```bash
curl http://localhost:5000/api/stocks/ipos/upcoming
```

**Expected:** JSON with `ipos` array

**Status:** [ ] Pass [ ] Fail

#### 3c. Get Indian IPOs
```bash
curl http://localhost:5000/api/stocks/ipos/indian
```

**Expected:** JSON with Tata Technologies, Ideaforge, Yatharth Hospital

**Status:** [ ] Pass [ ] Fail

---

### Test 4: Market Data Endpoints

#### 4a. Top Movers
```bash
curl http://localhost:5000/api/market/top-movers?limit=5
```

**Expected:** JSON with `gainers`, `losers`, `timestamp`

**Status:** [ ] Pass [ ] Fail

**Note:** First call may take 10-20 seconds (fetching 20+ stocks)

#### 4b. Trending Stocks
```bash
curl http://localhost:5000/api/market/trending?limit=5
```

**Expected:** JSON with `trending` array

**Status:** [ ] Pass [ ] Fail

#### 4c. Market Overview
```bash
curl http://localhost:5000/api/market/overview
```

**Expected:** JSON with `indices` array (Nifty, Sensex, S&P 500, Dow)

**Status:** [ ] Pass [ ] Fail

---

### Test 5: Cache Functionality

#### 5a. First Call (No Cache)
```bash
# Measure time
curl -w "\nTime: %{time_total}s\n" http://localhost:5000/api/market/top-movers?limit=5
```

**Expected Time:** 5-15 seconds (fetching fresh data)

**Status:** [ ] Pass [ ] Fail

#### 5b. Second Call (Cached)
```bash
# Immediately call again
curl -w "\nTime: %{time_total}s\n" http://localhost:5000/api/market/top-movers?limit=5
```

**Expected Time:** <0.1 seconds (from cache)

**Status:** [ ] Pass [ ] Fail

**Check Server Logs:** Should see "Returning cached top movers"

---

### Test 6: Frontend Build

```bash
cd client
npm install
npm run build
```

**Expected:** Build completes without errors

**Status:** [ ] Pass [ ] Fail

---

### Test 7: Frontend Dev Server

```bash
cd client
npm start
```

**Expected:** Opens browser at http://localhost:3000

**Status:** [ ] Pass [ ] Fail

---

### Test 8: Component Integration Tests

#### 8a. TopStocks Component
1. Navigate to Stocks tab
2. Check if "Last updated" timestamp appears
3. Click "Refresh" button
4. Verify loading spinner appears
5. Verify gainers/losers display

**Status:** [ ] Pass [ ] Fail

#### 8b. IPO Tab (After Integration)
1. Add IPO tab to main app (see IMPLEMENTATION_CHECKLIST.md)
2. Click IPO tab
3. Verify IPO data loads
4. Check categorization (Upcoming, Indian, Recent)

**Status:** [ ] Pass [ ] Fail

---

## 🔬 Code Quality Checks

### Check 1: No Syntax Errors
```bash
# Backend
cd server
node -c services/ipoService.js
node -c utils/cache.js
node -c services/marketDataService.js
```

**Expected:** No output (means no errors)

**Status:** [ ] Pass [ ] Fail

### Check 2: ESLint (if configured)
```bash
cd client
npm run lint
```

**Status:** [ ] Pass [ ] Fail

### Check 3: TypeScript Check (if using TS)
```bash
cd client
npm run type-check
```

**Status:** [ ] Pass [ ] Fail

---

## 🎯 Functional Testing

### Scenario 1: User Searches for Stock
1. Go to Stocks tab
2. Type "AAPL" in search
3. Verify suggestions appear
4. Click on suggestion
5. Verify stock data loads

**Status:** [ ] Pass [ ] Fail

### Scenario 2: User Adds to Watchlist
1. Search for a stock
2. Click "Add to Watchlist"
3. Go to Watchlist tab
4. Verify stock appears
5. Click "Remove"
6. Verify stock is removed

**Status:** [ ] Pass [ ] Fail

### Scenario 3: User Views Market Data
1. Go to Stocks tab
2. Scroll to see TopStocks component
3. Verify gainers show positive changes (green)
4. Verify losers show negative changes (red)
5. Click on a stock
6. Verify it loads in main view

**Status:** [ ] Pass [ ] Fail

### Scenario 4: Chat with AI
1. Go to Chat tab
2. Type "What is a stock?"
3. Verify AI responds
4. Type "Tell me about RELIANCE"
5. Verify AI includes real-time data

**Status:** [ ] Pass [ ] Fail

---

## 🚨 Error Handling Tests

### Test 1: Invalid Stock Symbol
```bash
curl http://localhost:5000/api/stocks/quote/INVALID123
```

**Expected:** Returns data with c: 0 or error message

**Status:** [ ] Pass [ ] Fail

### Test 2: Missing Parameters
```bash
curl http://localhost:5000/api/stocks/search
```

**Expected:** 400 error "Query parameter required"

**Status:** [ ] Pass [ ] Fail

### Test 3: API Timeout
Temporarily set FINNHUB_API_KEY to invalid value

**Expected:** Falls back to mock/cached data

**Status:** [ ] Pass [ ] Fail

---

## 📊 Performance Tests

### Test 1: Concurrent Requests
```bash
# Run 10 concurrent requests
for i in {1..10}; do
  curl http://localhost:5000/api/market/top-movers?limit=5 &
done
wait
```

**Expected:** All complete successfully, most from cache

**Status:** [ ] Pass [ ] Fail

### Test 2: Memory Usage
Check server memory before and after cache builds up

```bash
# Windows Task Manager or:
node --expose-gc server/index.js
```

**Expected:** Memory stable, no leaks

**Status:** [ ] Pass [ ] Fail

### Test 3: Response Times
```bash
# Test various endpoints
curl -w "Time: %{time_total}s\n" http://localhost:5000/api/stocks/quote/AAPL
curl -w "Time: %{time_total}s\n" http://localhost:5000/api/market/top-movers
curl -w "Time: %{time_total}s\n" http://localhost:5000/api/stocks/ipos
```

**Expected:** 
- Cached: <0.1s
- Fresh: <5s

**Status:** [ ] Pass [ ] Fail

---

## 🔐 Security Checks

### Check 1: Environment Variables
```bash
# Verify .env file exists and has required keys
cat server/.env
```

**Required:**
- GROQ_API_KEY
- FINNHUB_API_KEY
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY

**Status:** [ ] Pass [ ] Fail

### Check 2: CORS Configuration
```bash
# Try from different origin
curl -H "Origin: http://malicious-site.com" http://localhost:5000/api/stocks/quote/AAPL
```

**Expected:** CORS error or blocked

**Status:** [ ] Pass [ ] Fail

### Check 3: No Exposed Secrets
```bash
# Search for hardcoded keys
grep -r "sk-" server/
grep -r "Bearer" server/
```

**Expected:** No matches (all in .env)

**Status:** [ ] Pass [ ] Fail

---

## 📱 Browser Testing

### Desktop Browsers
- [ ] Chrome - All features work
- [ ] Firefox - All features work
- [ ] Edge - All features work
- [ ] Safari - All features work

### Mobile Browsers (Responsive)
- [ ] Chrome Mobile - UI responsive
- [ ] Safari iOS - UI responsive

### Features to Test
- [ ] Chat input and send
- [ ] Stock search autocomplete
- [ ] Tab navigation
- [ ] Watchlist CRUD
- [ ] Refresh buttons
- [ ] Loading states
- [ ] Error messages

---

## 🐛 Known Issues to Watch For

### Issue 1: Cache Growing Large
**Check:** Monitor cache size in logs
**Fix:** Already implemented auto-cleanup

### Issue 2: API Rate Limits
**Check:** Watch for 429 errors in logs
**Fix:** Caching should prevent this

### Issue 3: Slow Initial Load
**Check:** Time to first meaningful paint
**Fix:** Code splitting (future work)

### Issue 4: Memory Leaks
**Check:** Server memory over time
**Fix:** Cache cleanup every 5 min

---

## 📋 Git Commit Checklist

Before committing, verify:

- [ ] All tests above pass
- [ ] No console.errors in browser
- [ ] No server errors in terminal
- [ ] .env file NOT committed
- [ ] node_modules NOT committed
- [ ] Build files NOT committed
- [ ] Documentation is accurate
- [ ] Code is formatted consistently

---

## 🚀 Deployment Readiness

### Backend (Render/Heroku)
- [ ] Environment variables configured
- [ ] Health endpoint responds
- [ ] CORS allows frontend URL
- [ ] All endpoints tested

### Frontend (Vercel/Netlify)
- [ ] Build succeeds
- [ ] Environment variables set
- [ ] API_URL points to production
- [ ] No console errors

---

## 📝 Test Results Summary

**Date:** _______________
**Tester:** _______________

### Backend Tests
- Health Check: [ ] Pass [ ] Fail
- IPO Endpoints: [ ] Pass [ ] Fail
- Market Data: [ ] Pass [ ] Fail
- Cache: [ ] Pass [ ] Fail

### Frontend Tests
- Build: [ ] Pass [ ] Fail
- Components: [ ] Pass [ ] Fail
- Integration: [ ] Pass [ ] Fail

### Performance
- Response Times: [ ] Pass [ ] Fail
- Memory Usage: [ ] Pass [ ] Fail
- Concurrent Requests: [ ] Pass [ ] Fail

### Overall Status
- [ ] ✅ Ready for Git commit
- [ ] ✅ Ready for deployment
- [ ] ⚠️ Needs fixes (list below)

**Issues Found:**
1. _______________
2. _______________
3. _______________

---

## 🎯 Quick Start Testing (5 Minutes)

If you're short on time, run these essential tests:

```bash
# 1. Start backend
cd server && npm start

# 2. Test health (new terminal)
curl http://localhost:5000/health

# 3. Test IPO endpoint
curl http://localhost:5000/api/stocks/ipos/indian

# 4. Test market data
curl http://localhost:5000/api/market/top-movers?limit=3

# 5. Test cache (run twice, second should be instant)
curl -w "\nTime: %{time_total}s\n" http://localhost:5000/api/market/top-movers

# 6. Start frontend (new terminal)
cd client && npm start

# 7. Open browser and verify:
# - Chat works
# - Stock search works
# - TopStocks shows data
```

**All working?** ✅ Ready to commit!

---

## 📞 Support

If any test fails:
1. Check server logs for errors
2. Verify environment variables
3. Check API keys are valid
4. Review OPTIMIZATION_SUMMARY.md
5. Check inline code comments

**Common Issues:**
- **"Cannot find module"** → Run `npm install`
- **"API key invalid"** → Check .env file
- **"CORS error"** → Update allowedOrigins in server/index.js
- **"Cache not working"** → Check server logs for cache messages

---

**Last Updated:** October 27, 2025
**Version:** 2.0.0
**Status:** Ready for Testing
