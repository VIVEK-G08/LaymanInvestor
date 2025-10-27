import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';

const API_URL = process.env.REACT_APP_API_URL || 'https://laymaninvestor-backend.onrender.com/api';

export const useNews = (category = 'market', symbol = null) => {
  const { selectedCountry } = useApp();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      let url;

      if (symbol) {
        // Company-specific news
        url = `${API_URL}/news/company/${symbol}`;
      } else if (category === 'country') {
        // Country-specific news
        url = `${API_URL}/news/country/${selectedCountry}`;
      } else if (category === 'ipo') {
        // IPO news
        url = `${API_URL}/news/ipo`;
      } else {
        // Market news
        url = `${API_URL}/news/market?category=${category}&limit=20`;
      }

      const response = await fetch(url);
      const data = await response.json();
      
      setNews(data.news || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Failed to load news');
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, [category, symbol, selectedCountry]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return {
    news,
    loading,
    error,
    refetch: fetchNews
  };
};

export const useMarketNews = () => useNews('market');
export const useIPONews = () => useNews('ipo');
export const useCountryNews = () => useNews('country');
export const useCompanyNews = (symbol) => useNews(null, symbol);
