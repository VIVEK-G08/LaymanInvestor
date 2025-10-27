import React, { useState } from 'react';
import { Newspaper, TrendingUp, Globe, Calendar, RefreshCw, ExternalLink, Clock } from 'lucide-react';
import { useNews } from '../../hooks/useNews';
import { useApp } from '../../contexts/AppContext';

const NewsTab = () => {
  const { countryConfig } = useApp();
  const [activeCategory, setActiveCategory] = useState('market');
  const { news, loading, error, refetch } = useNews(activeCategory);

  const categories = [
    { id: 'market', label: 'Market News', icon: TrendingUp },
    { id: 'country', label: countryConfig.name, icon: Globe },
    { id: 'ipo', label: 'IPO News', icon: Calendar }
  ];

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Header Skeleton */}
        <div className="skeleton skeleton-card h-32"></div>
        
        {/* News Cards Skeleton */}
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton skeleton-card h-48"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
        <Newspaper className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-red-900 dark:text-red-100 mb-2">Unable to Load News</h3>
        <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
        <button
          onClick={refetch}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <Newspaper className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Market News</h1>
                <p className="text-blue-100">Stay updated with latest market trends</p>
              </div>
            </div>
          </div>
          <button
            onClick={refetch}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 p-3 rounded-xl transition-all"
            title="Refresh news"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mt-6">
          {categories.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  activeCategory === cat.id
                    ? 'bg-white text-indigo-600 shadow-lg'
                    : 'bg-white/10 backdrop-blur-sm hover:bg-white/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* News Grid */}
      {news.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-12 text-center border-2 border-dashed border-gray-300 dark:border-gray-700">
          <Newspaper className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No News Available</h3>
          <p className="text-gray-600 dark:text-gray-400">Check back later for updates</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {news.map((article, index) => (
            <div
              key={article.id || index}
              className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border-2 border-gray-100 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-xl transition-all duration-300 cursor-pointer animate-fade-in-up stagger-item"
              onClick={() => article.url && window.open(article.url, '_blank')}
            >
              <div className="flex gap-4">
                {/* Image */}
                {article.image && (
                  <div className="flex-shrink-0">
                    <img
                      src={article.image}
                      alt={article.headline}
                      className="w-32 h-32 object-cover rounded-xl"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {article.headline}
                    </h3>
                    <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex-shrink-0 ml-2 transition-colors" />
                  </div>

                  {/* Summary */}
                  {article.summary && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {article.summary}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                    <div className="flex items-center gap-1">
                      <Newspaper className="w-3 h-3" />
                      <span>{article.source}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(article.datetime)}</span>
                    </div>
                    {article.category && (
                      <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                        {article.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Footer */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800">
        <div className="flex items-start gap-4">
          <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-xl">
            <TrendingUp className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Stay Informed</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              News updates every 5 minutes. Click any article to read the full story on the source website.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsTab;
