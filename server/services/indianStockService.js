import axios from 'axios';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export async function getIndianStockFromYahoo(symbol) {
  try {
    const formatted = symbol.includes('.') ? symbol : `${symbol}.NS`;
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${formatted}`;
    const res = await axios.get(url, { headers: { 'User-Agent': USER_AGENT } });

    const result = res?.data?.chart?.result?.[0];
    if (!result) throw new Error('Invalid Yahoo chart response');

    const meta = result.meta || {};
    const current = meta.regularMarketPrice ?? meta.previousClose ?? 0;
    const prevClose = meta.previousClose ?? 0;
    const change = current - prevClose;
    const changePct = prevClose ? (change / prevClose) * 100 : 0;

    return {
      c: current,
      d: change,
      dp: changePct,
      h: meta.regularMarketDayHigh || 0,
      l: meta.regularMarketDayLow || 0,
      o: meta.regularMarketOpen || 0,
      pc: prevClose,
      isIndian: true,
      symbol: formatted,
      currency: meta.currency || 'INR',
      exchange: meta.exchangeName || 'NSE'
    };
  } catch (e) {
    console.error('Yahoo Finance Error:', e.message);
    throw new Error(`Failed to fetch ${symbol}. Try with .NS/.BO suffix`);
  }
}

export async function getIndianCompanyProfileYahoo(symbol) {
  try {
    const formatted = symbol.includes('.') ? symbol : `${symbol}.NS`;
    const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${formatted}?modules=price,summaryProfile`;
    const res = await axios.get(url, { headers: { 'User-Agent': USER_AGENT } });

    const result = res?.data?.quoteSummary?.result?.[0];
    const price = result?.price || {};
    const profile = result?.summaryProfile || {};

    return {
      name: price.longName || price.shortName || formatted.replace('.NS', '').replace('.BO', ''),
      finnhubIndustry: profile.sector || 'Indian Company',
      marketCapitalization: price.marketCap?.raw || 0,
      exchange: price.exchangeName || 'NSE',
      currency: price.currency || 'INR'
    };
  } catch (e) {
    console.error('Yahoo Profile Error:', e.message);
    return {
      name: symbol,
      finnhubIndustry: 'Indian Company',
      marketCapitalization: 0
    };
  }
}

export async function searchIndianStocksYahoo(query) {
  try {
    const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}`;
    const res = await axios.get(url, { headers: { 'User-Agent': USER_AGENT } });
    const quotes = res?.data?.quotes || [];
    return quotes
      .filter(q => ['NSE', 'BSE'].includes(q.exchDisp))
      .map(q => ({
        symbol: q.symbol,
        description: q.shortname || q.longname || q.symbol,
        exchange: q.exchDisp
      }));
  } catch (e) {
    console.error('Yahoo Search Error:', e.message);
    return [];
  }
}