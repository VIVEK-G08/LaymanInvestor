import React from 'react';
import { Calendar, TrendingUp, Building2, AlertCircle } from 'lucide-react';
import { useIPOData } from '../hooks/useStockData';

const IPOTab = ({ onStockClick }) => {
  const { ipos, loading, error, refetch } = useIPOData();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-red-900 mb-2">Failed to Load IPO Data</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upcoming IPOs */}
      {ipos.upcoming && ipos.upcoming.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Upcoming IPOs</h3>
          </div>
          <div className="space-y-3">
            {ipos.upcoming.map((ipo, idx) => (
              <div
                key={idx}
                className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-gray-900">{ipo.company}</h4>
                    <p className="text-sm text-gray-600">{ipo.symbol}</p>
                  </div>
                  <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                    {ipo.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Price Range:</span>
                    <p className="font-medium text-gray-900">{ipo.priceRange}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <p className="font-medium text-gray-900">
                      {new Date(ipo.date).toLocaleDateString()}
                    </p>
                  </div>
                  {ipo.exchange && (
                    <div>
                      <span className="text-gray-600">Exchange:</span>
                      <p className="font-medium text-gray-900">{ipo.exchange}</p>
                    </div>
                  )}
                  {ipo.shares && (
                    <div>
                      <span className="text-gray-600">Shares:</span>
                      <p className="font-medium text-gray-900">{ipo.shares}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Indian IPOs */}
      {ipos.indian && ipos.indian.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-bold text-gray-900">Indian IPOs</h3>
          </div>
          <div className="space-y-3">
            {ipos.indian.map((ipo, idx) => (
              <div
                key={idx}
                onClick={() => ipo.symbol && onStockClick(ipo.symbol)}
                className={`p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors ${
                  ipo.symbol ? 'cursor-pointer' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-gray-900">{ipo.company}</h4>
                    <p className="text-sm text-gray-600">{ipo.symbol}</p>
                    {ipo.sector && (
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded mt-1 inline-block">
                        {ipo.sector}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                      {ipo.status}
                    </span>
                    {ipo.listingGain && (
                      <p className="text-sm font-bold text-green-600 mt-1">
                        {ipo.listingGain}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Price Range:</span>
                    <p className="font-medium text-gray-900">{ipo.priceRange}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Listed:</span>
                    <p className="font-medium text-gray-900">
                      {new Date(ipo.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent IPOs */}
      {ipos.recent && ipos.recent.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-bold text-gray-900">Recently Listed</h3>
          </div>
          <div className="space-y-3">
            {ipos.recent.map((ipo, idx) => (
              <div
                key={idx}
                onClick={() => ipo.symbol && onStockClick(ipo.symbol)}
                className={`p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors ${
                  ipo.symbol ? 'cursor-pointer' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-gray-900">{ipo.company}</h4>
                    <p className="text-sm text-gray-600">{ipo.symbol}</p>
                  </div>
                  <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                    Listed
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Price Range:</span>
                    <p className="font-medium text-gray-900">{ipo.priceRange}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Listed:</span>
                    <p className="font-medium text-gray-900">
                      {new Date(ipo.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!ipos.upcoming || ipos.upcoming.length === 0) &&
       (!ipos.recent || ipos.recent.length === 0) &&
       (!ipos.indian || ipos.indian.length === 0) && (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No IPO Data Available</h3>
          <p className="text-gray-600 mb-4">
            Check back later for upcoming and recent IPO listings.
          </p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
};

export default IPOTab;
