import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, Flame, RefreshCw } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const TopStocks = ({ onStockClick }) => {
  const { selectedCountry } = useApp();
  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'https://LaymanInvestor.onrender.com/api';

  const fetchMarketData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [moversRes, trendingRes] = await Promise.all([
        fetch(`${API_URL}/market/top-movers?limit=5&country=${selectedCountry}`),
        fetch(`${API_URL}/market/trending?limit=5&country=${selectedCountry}`)
      ]);

      if (!moversRes.ok || !trendingRes.ok) {
        throw new Error('Failed to fetch market data');
      }

      const moversData = await moversRes.json();
      const trendingData = await trendingRes.json();

      setTopGainers(moversData.gainers || []);
      setTopLosers(moversData.losers || []);
      setTrending(trendingData.trending || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Market data fetch error:', err);
      setError(err.message);
      // Set fallback data based on selected country
      if (selectedCountry === 'IN') {
        setTopGainers([
          { symbol: 'RELIANCE.NS', name: 'Reliance Industries', change: '+2.8%', price: '₹2,456', isGainer: true },
          { symbol: 'TCS.NS', name: 'Tata Consultancy', change: '+1.9%', price: '₹3,245', isGainer: true },
          { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', change: '+1.5%', price: '₹1,678', isGainer: true },
        ]);
        setTopLosers([
          { symbol: 'TATAMOTORS.NS', name: 'Tata Motors', change: '-1.8%', price: '₹745', isGainer: false },
          { symbol: 'YESBANK.NS', name: 'Yes Bank', change: '-2.1%', price: '₹18.5', isGainer: false },
        ]);
        setTrending([
          { symbol: 'RELIANCE.NS', name: 'Reliance Industries', volume: 'High' },
          { symbol: 'TCS.NS', name: 'Tata Consultancy', volume: 'High' },
          { symbol: 'INFY.NS', name: 'Infosys', volume: 'High' },
        ]);
      } else {
        // US stocks fallback
        setTopGainers([
          { symbol: 'AAPL', name: 'Apple Inc.', change: '+2.3%', price: '$178.45', isGainer: true },
          { symbol: 'MSFT', name: 'Microsoft Corp.', change: '+1.8%', price: '$378.22', isGainer: true },
          { symbol: 'GOOGL', name: 'Alphabet Inc.', change: '+1.5%', price: '$142.65', isGainer: true },
        ]);
        setTopLosers([
          { symbol: 'TSLA', name: 'Tesla Inc.', change: '-3.2%', price: '$245.12', isGainer: false },
          { symbol: 'META', name: 'Meta Platforms', change: '-2.1%', price: '$312.45', isGainer: false },
        ]);
        setTrending([
          { symbol: 'AAPL', name: 'Apple Inc.', volume: 'High' },
          { symbol: 'TSLA', name: 'Tesla Inc.', volume: 'High' },
          { symbol: 'NVDA', name: 'NVIDIA Corp.', volume: 'High' },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }, [API_URL, selectedCountry]);

  useEffect(() => {
    fetchMarketData();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchMarketData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchMarketData]);

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-600">
          {lastUpdated && `Last updated: ${lastUpdated.toLocaleTimeString()}`}
        </div>
        <button
          onClick={fetchMarketData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
          ⚠️ Using cached data. {error}
        </div>
      )}

      {/* Top Gainers */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-bold text-gray-900">Top Gainers Today</h3>
        </div>
        {loading && topGainers.length === 0 ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : topGainers.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No gainers data available</p>
        ) : (
          <div className="space-y-3">
            {topGainers.map((stock, idx) => (
              <div
                key={idx}
                onClick={() => onStockClick(stock.symbol)}
                className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 cursor-pointer transition-colors"
              >
                <div>
                  <p className="font-semibold text-gray-900">{stock.symbol}</p>
                  <p className="text-sm text-gray-600">{stock.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{stock.price}</p>
                  <p className="text-sm text-green-600 font-medium">{stock.change}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Losers */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-bold text-gray-900">Top Losers Today</h3>
        </div>
        <div className="space-y-3">
          {topLosers.map((stock, idx) => (
            <div
              key={idx}
              onClick={() => onStockClick(stock.symbol)}
              className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 cursor-pointer transition-colors"
            >
              <div>
                <p className="font-semibold text-gray-900">{stock.symbol}</p>
                <p className="text-sm text-gray-600">{stock.name}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">{stock.price}</p>
                <p className="text-sm text-red-600 font-medium">{stock.change}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-bold text-gray-900">Trending Stocks</h3>
        </div>
        <div className="space-y-3">
          {trending.map((stock, idx) => (
            <div
              key={idx}
              onClick={() => onStockClick(stock.symbol)}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
            >
              <div>
                <p className="font-semibold text-gray-900">{stock.symbol}</p>
                <p className="text-sm text-gray-600">{stock.name}</p>
              </div>
              <div>
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                  {stock.volume} Volume
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopStocks;