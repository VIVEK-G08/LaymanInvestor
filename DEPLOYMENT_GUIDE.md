# LaymanInvestor - Deployment Guide

## 🚨 IMPORTANT: Fix IPO Tab Not Showing

Your IPO tab code is correct but not visible because the **frontend needs to be rebuilt and redeployed**.

---

## Quick Fix (5 minutes)

### Option 1: Rebuild Locally
```bash
cd c:\Users\Vivek\LAYMAN_STOCK\LaymanInvestor\client
npm run build
```

Then deploy the `build` folder to your hosting service.

### Option 2: Trigger Auto-Deploy
If you have auto-deploy set up (Vercel/Netlify):
1. The latest commit (`b3f70c3`) should trigger auto-deploy
2. Wait 2-3 minutes for build to complete
3. Check your live site

### Option 3: Manual Vercel Deploy
```bash
cd c:\Users\Vivek\LAYMAN_STOCK\LaymanInvestor\client
npm install -g vercel
vercel --prod
```

---

## Complete Deployment Steps

### Backend (Render.com)

1. **Go to Render Dashboard**
   - https://dashboard.render.com

2. **Select Your Service**
   - Click on "laymaninvestor-backend"

3. **Trigger Manual Deploy**
   - Click "Manual Deploy" → "Deploy latest commit"
   - Wait for build to complete (~2-3 minutes)

4. **Verify Deployment**
   ```bash
   curl https://laymaninvestor-backend.onrender.com/health
   ```
   Should return: `{"status":"ok","message":"LaymanInvestor API is running!"}`

5. **Check Logs**
   - Click "Logs" tab
   - Look for: "Server running on http://localhost:10000"

### Frontend (Vercel)

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard

2. **Select Your Project**
   - Click on your LaymanInvestor project

3. **Check Latest Deployment**
   - Should show commit `b3f70c3` - "feat: Add IPO tab..."
   - Status should be "Ready"

4. **If Not Auto-Deployed:**
   - Click "Deployments" tab
   - Click "..." menu → "Redeploy"
   - Select "Use existing Build Cache" → "Redeploy"

5. **Verify Deployment**
   - Open your live URL
   - You should see 4 tabs: Chat, Stocks, **IPOs**, Watchlist

---

## Environment Variables Checklist

### Backend (.env on Render)
- [ ] `GROQ_API_KEY` - Set
- [ ] `FINNHUB_API_KEY` - Set
- [ ] `SUPABASE_URL` - Set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Set
- [ ] `CLIENT_URL` - Set to your Vercel URL
- [ ] `PORT` - Set to 10000 (or leave empty for Render default)

### Frontend (.env on Vercel)
- [ ] `REACT_APP_API_URL` - Set to `https://laymaninvestor-backend.onrender.com/api`
- [ ] `REACT_APP_SUPABASE_URL` - Set
- [ ] `REACT_APP_SUPABASE_ANON_KEY` - Set

---

## Troubleshooting

### IPO Tab Still Not Showing?

**Check 1: Clear Browser Cache**
```
Ctrl + Shift + Delete → Clear cache → Reload page
```

**Check 2: Verify Build**
```bash
cd client
npm run build
# Check build/static/js/main.*.js file size
# Should be > 500KB
```

**Check 3: Check Console**
- Open browser DevTools (F12)
- Go to Console tab
- Look for any errors

**Check 4: Verify Code**
```bash
cd client/src
grep -n "IPOs" LaymanInvestorApp.jsx
# Should show line with IPO tab button
```

### Common Errors

**Error:** "Module not found: Can't resolve './components/IPOTab'"
**Fix:** 
```bash
cd client/src/components
ls IPOTab.jsx
# If not found, the file is missing
```

**Error:** "Calendar is not defined"
**Fix:** Check line 2 of LaymanInvestorApp.jsx
```javascript
import { ..., Calendar } from 'lucide-react';
```

**Error:** "Failed to fetch"
**Fix:** Check API_URL in frontend .env
```env
REACT_APP_API_URL=https://laymaninvestor-backend.onrender.com/api
```

---

## Performance Optimization

### Enable Compression
Already implemented with `compression` middleware.

### Enable Caching
Already implemented with in-memory cache.

### Enable CDN (Vercel)
Automatic with Vercel deployment.

### Monitor Performance
- **Backend:** Render dashboard → Metrics
- **Frontend:** Vercel dashboard → Analytics
- **API Calls:** Check server logs for cache hit rate

---

## Post-Deployment Verification

### Backend Health Check
```bash
curl https://laymaninvestor-backend.onrender.com/health
curl https://laymaninvestor-backend.onrender.com/api/stocks/ipos/indian
curl https://laymaninvestor-backend.onrender.com/api/market/top-movers?limit=3
```

### Frontend Verification
1. Open your live URL
2. Check navigation bar has 4 tabs:
   - ✅ Chat
   - ✅ Stocks
   - ✅ **IPOs** ← Should be visible
   - ✅ Watchlist
3. Click IPO tab
4. Should see:
   - Upcoming IPOs section
   - Indian IPOs section
   - Recent IPOs section

### Feature Testing
- [ ] Chat sends messages
- [ ] Stock search works
- [ ] **IPO tab shows data**
- [ ] Top movers display
- [ ] Watchlist CRUD works
- [ ] Auto-refresh works (wait 5 min)

---

## Rollback Plan

If something breaks:

### Backend Rollback
1. Go to Render dashboard
2. Click "Deployments" tab
3. Find previous working deployment
4. Click "..." → "Redeploy"

### Frontend Rollback
1. Go to Vercel dashboard
2. Click "Deployments" tab
3. Find previous working deployment
4. Click "..." → "Promote to Production"

---

## Monitoring

### Set Up Alerts
- **Render:** Settings → Notifications
- **Vercel:** Settings → Notifications

### Check Logs Regularly
- **Backend:** Render → Logs tab
- **Frontend:** Vercel → Functions → Logs

### Monitor API Usage
- **Groq:** Check dashboard for usage
- **Finnhub:** Check dashboard (60 calls/min limit)

---

## Next Steps After Deployment

1. **Test all features** on live site
2. **Monitor logs** for first 24 hours
3. **Check error rates** in dashboards
4. **Gather user feedback**
5. **Plan next features**

---

## Support

If you encounter issues:
1. Check this guide
2. Check TECHNICAL_DOCUMENTATION.md
3. Check server logs
4. Check browser console
5. Review recent commits

---

**Last Updated:** October 27, 2025  
**Version:** 2.0.0  
**Status:** Production Ready
