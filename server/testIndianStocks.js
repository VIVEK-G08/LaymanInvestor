import { getIndianStockFromYahoo } from './services/indianStockService.js';

async function testIndianStocks() {
  const stocks = ['RELIANCE.NS', 'TCS.NS', 'INFY.NS'];
  
  console.log('Testing Indian Stocks via Yahoo Finance:\n');
  
  for (const symbol of stocks) {
    try {
      const data = await getIndianStockFromYahoo(symbol);
      console.log(`✅ ${symbol}:`);
      console.log(`   Price: ₹${data.c.toFixed(2)}`);
      console.log(`   Change: ${data.d >= 0 ? '+' : ''}₹${data.d.toFixed(2)} (${data.dp.toFixed(2)}%)`);
      console.log(`   High/Low: ₹${data.h.toFixed(2)} / ₹${data.l.toFixed(2)}\n`);
    } catch (error) {
      console.log(`❌ ${symbol}: ${error.message}\n`);
    }
  }
}

testIndianStocks();