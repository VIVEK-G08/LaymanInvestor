import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Flame } from 'lucide-react';

const TopStocks = ({ onStockClick }) => {
  const [topGainers, setTopGainers] = useState([
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries', change: '+2.8%', price: '₹2,456', isGainer: true },
    { symbol: 'TCS.NS', name: 'Tata Consultancy', change: '+1.9%', price: '₹3,245', isGainer: true },
    { symbol: 'INFY.NS', name: 'Infosys', change: '+1.5%', price: '₹1,478', isGainer: true },
  ]);

  const [topLosers, setTopLosers] = useState([
    { symbol: 'TATAMOTORS.NS', name: 'Tata Motors', change: '-1.8%', price: '₹745', isGainer: false },
    { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance', change: '-1.2%', price: '₹6,789', isGainer: false },
  ]);

  const [trending, setTrending] = useState([
    { symbol: 'AAPL', name: 'Apple Inc.', volume: 'High' },
    { symbol: 'TSLA', name: 'Tesla Inc.', volume: 'High' },
    { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', volume: 'Medium' },
  ]);

  return (
    <div className="space-y-6">
      {/* Top Gainers */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-bold text-gray-900">Top Gainers Today</h3>
        </div>
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