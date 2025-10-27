import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Globe, MapPin, DollarSign, Users, Clock, Sparkles, RefreshCw, ChevronRight, Building2, Award } from 'lucide-react';

const IPOTab = ({ onStockClick }) => {
  const [ipoData, setIpoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeRegion, setActiveRegion] = useState('all'); // 'all', 'indian', 'foreign'
  const [activeCategory, setActiveCategory] = useState('upcoming'); // 'upcoming', 'recent'

  const API_URL = process.env.REACT_APP_API_URL || 'https://LaymanInvestor.onrender.com/api';

  useEffect(() => {
    fetchIPOData();
  }, []);

  const fetchIPOData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/stocks/ipos`);
      const data = await response.json();
      setIpoData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching IPO data:', err);
      setError('Failed to load IPO data');
    } finally {
      setLoading(false);
    }
  };

  const getDisplayedIPOs = () => {
    if (!ipoData) return [];
    
    const category = ipoData[activeCategory];
    if (!category) return [];

    if (activeRegion === 'all') {
      return category.all || [];
    } else if (activeRegion === 'indian') {
      return category.indian || [];
    } else if (activeRegion === 'foreign') {
      return category.foreign || [];
    }
    
    return [];
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'today':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'listed':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getExchangeBadge = (exchange) => {
    const isIndian = ['NSE', 'BSE', 'NSE/BSE'].includes(exchange);
    return isIndian 
      ? 'bg-orange-100 text-orange-700 border-orange-200'
      : 'bg-indigo-100 text-indigo-700 border-indigo-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
            <Sparkles className="w-6 h-6 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading IPO Calendar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-bold text-red-900 mb-2">Unable to Load IPO Data</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={fetchIPOData}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  const displayedIPOs = getDisplayedIPOs();

  return (
    <div className="space-y-6">
      {/* Header Section - Modern & Eye-catching */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <Calendar className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">IPO Calendar</h1>
                <p className="text-indigo-100">Discover upcoming public offerings</p>
              </div>
            </div>
          </div>
          <button
            onClick={fetchIPOData}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 p-3 rounded-xl transition-all"
            title="Refresh data"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm opacity-90">Upcoming</span>
            </div>
            <p className="text-2xl font-bold">{ipoData?.upcoming?.all?.length || 0}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm opacity-90">Recent</span>
            </div>
            <p className="text-2xl font-bold">{ipoData?.recent?.all?.length || 0}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4" />
              <span className="text-sm opacity-90">Indian</span>
            </div>
            <p className="text-2xl font-bold">{ipoData?.indian?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs - Modern Design */}
      <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-200">
        <div className="flex gap-2">
          {/* Category Tabs */}
          <div className="flex gap-2 flex-1">
            <button
              onClick={() => setActiveCategory('upcoming')}
              className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                activeCategory === 'upcoming'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Clock className="w-4 h-4" />
              Upcoming
            </button>
            <button
              onClick={() => setActiveCategory('recent')}
              className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                activeCategory === 'recent'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Recent
            </button>
          </div>

          {/* Region Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveRegion('all')}
              className={`px-4 py-3 rounded-xl font-medium transition-all ${
                activeRegion === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveRegion('indian')}
              className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                activeRegion === 'indian'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <MapPin className="w-4 h-4" />
              Indian
            </button>
            <button
              onClick={() => setActiveRegion('foreign')}
              className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                activeRegion === 'foreign'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Globe className="w-4 h-4" />
              Foreign
            </button>
          </div>
        </div>
      </div>

      {/* IPO Cards - Groww/Zerodha Inspired Design */}
      {displayedIPOs.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 text-center border-2 border-dashed border-gray-300">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No IPOs Found</h3>
          <p className="text-gray-600">
            {activeRegion === 'indian' ? 'No Indian IPOs' : activeRegion === 'foreign' ? 'No Foreign IPOs' : 'No IPOs'} in the {activeCategory} category
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedIPOs.map((ipo, index) => {
            const isIndian = ['NSE', 'BSE', 'NSE/BSE'].includes(ipo.exchange) || ipo.symbol?.includes('.NS') || ipo.symbol?.includes('.BO');
            
            return (
              <div
                key={index}
                className="group bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => ipo.symbol && onStockClick && onStockClick(ipo.symbol)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-2 rounded-lg ${isIndian ? 'bg-orange-100' : 'bg-indigo-100'}`}>
                        <Building2 className={`w-5 h-5 ${isIndian ? 'text-orange-600' : 'text-indigo-600'}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors">
                          {ipo.company}
                        </h3>
                        {ipo.symbol && (
                          <p className="text-sm text-gray-500 font-mono">{ipo.symbol}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-xs text-gray-600 font-medium">Date</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      {new Date(ipo.date).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="text-xs text-gray-600 font-medium">Price Range</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">{ipo.priceRange || 'TBA'}</p>
                  </div>

                  {ipo.shares && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-xs text-gray-600 font-medium">Shares</span>
                      </div>
                      <p className="text-sm font-bold text-gray-900">{ipo.shares}</p>
                    </div>
                  )}

                  {ipo.sector && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Award className="w-4 h-4 text-gray-500" />
                        <span className="text-xs text-gray-600 font-medium">Sector</span>
                      </div>
                      <p className="text-sm font-bold text-gray-900">{ipo.sector}</p>
                    </div>
                  )}
                </div>

                {/* Footer Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(ipo.status)}`}>
                    {ipo.status || 'Upcoming'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getExchangeBadge(ipo.exchange)}`}>
                    {ipo.exchange}
                  </span>
                  {ipo.listingGain && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                      {ipo.listingGain}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Footer */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-indigo-100">
        <div className="flex items-start gap-4">
          <div className="bg-indigo-100 p-3 rounded-xl">
            <Sparkles className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-1">What is an IPO?</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              An Initial Public Offering (IPO) is when a private company offers its shares to the public for the first time. 
              It's like a company opening its doors to let everyday investors become part-owners! 🚀
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IPOTab;
