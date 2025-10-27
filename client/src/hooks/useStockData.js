import { useState, useEffect, useCallback } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'https://LaymanInvestor.onrender.com/api';

/**
 * Custom hook for fetching stock quote data
 * @param {string} symbol - Stock symbol
 * @param {boolean} autoFetch - Whether to fetch automatically on mount
 * @returns {Object} { data, loading, error, refetch }
 */
export const useStockQuote = (symbol, autoFetch = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchQuote = useCallback(async () => {
    if (!symbol) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/stocks/quote/${symbol}`);
      if (!response.ok) throw new Error('Failed to fetch stock quote');
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
      console.error('Stock quote error:', err);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    if (autoFetch && symbol) {
      fetchQuote();
    }
  }, [symbol, autoFetch, fetchQuote]);

  return { data, loading, error, refetch: fetchQuote };
};

/**
 * Custom hook for searching stocks
 * @returns {Object} { results, loading, error, search }
 */
export const useStockSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/stocks/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      setError(err.message);
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, search };
};

/**
 * Custom hook for watchlist management
 * @param {string} userId - User ID
 * @returns {Object} { watchlist, loading, error, addToWatchlist, removeFromWatchlist, refetch }
 */
export const useWatchlist = (userId) => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWatchlist = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/stocks/watchlist/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch watchlist');
      
      const data = await response.json();
      setWatchlist(data.watchlist || []);
    } catch (err) {
      setError(err.message);
      console.error('Watchlist fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const addToWatchlist = useCallback(async (symbol) => {
    try {
      const response = await fetch(`${API_URL}/stocks/watchlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, symbol })
      });

      if (!response.ok) throw new Error('Failed to add to watchlist');
      
      await fetchWatchlist();
      return { success: true };
    } catch (err) {
      console.error('Add to watchlist error:', err);
      return { success: false, error: err.message };
    }
  }, [userId, fetchWatchlist]);

  const removeFromWatchlist = useCallback(async (symbol) => {
    try {
      const response = await fetch(`${API_URL}/stocks/watchlist/${userId}/${symbol}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to remove from watchlist');
      
      await fetchWatchlist();
      return { success: true };
    } catch (err) {
      console.error('Remove from watchlist error:', err);
      return { success: false, error: err.message };
    }
  }, [userId, fetchWatchlist]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  return { 
    watchlist, 
    loading, 
    error, 
    addToWatchlist, 
    removeFromWatchlist, 
    refetch: fetchWatchlist 
  };
};

/**
 * Custom hook for market data (top movers, trending)
 * @param {number} refreshInterval - Auto-refresh interval in milliseconds (0 to disable)
 * @returns {Object} { gainers, losers, trending, loading, error, refetch }
 */
export const useMarketData = (refreshInterval = 0) => {
  const [gainers, setGainers] = useState([]);
  const [losers, setLosers] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMarketData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [moversRes, trendingRes] = await Promise.all([
        fetch(`${API_URL}/market/top-movers?limit=5`),
        fetch(`${API_URL}/market/trending?limit=5`)
      ]);

      if (!moversRes.ok || !trendingRes.ok) {
        throw new Error('Failed to fetch market data');
      }

      const moversData = await moversRes.json();
      const trendingData = await trendingRes.json();

      setGainers(moversData.gainers || []);
      setLosers(moversData.losers || []);
      setTrending(trendingData.trending || []);
    } catch (err) {
      setError(err.message);
      console.error('Market data error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketData();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchMarketData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchMarketData, refreshInterval]);

  return { gainers, losers, trending, loading, error, refetch: fetchMarketData };
};

/**
 * Custom hook for IPO data
 * @returns {Object} { ipos, loading, error, refetch }
 */
export const useIPOData = () => {
  const [ipos, setIpos] = useState({ upcoming: [], recent: [], indian: [], all: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchIPOs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/stocks/ipos`);
      if (!response.ok) throw new Error('Failed to fetch IPO data');
      
      const data = await response.json();
      setIpos(data);
    } catch (err) {
      setError(err.message);
      console.error('IPO data error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIPOs();
  }, [fetchIPOs]);

  return { ipos, loading, error, refetch: fetchIPOs };
};
