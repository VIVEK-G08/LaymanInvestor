import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Chat APIs
export const sendMessage = async (message, userId = 'anonymous', conversationHistory = []) => {
  const response = await api.post('/chat/message', {
    message,
    userId,
    conversationHistory
  });
  return response.data;
};

export const getChatHistory = async (userId) => {
  const response = await api.get(`/chat/history/${userId}`);
  return response.data.history;
};

// Stock APIs
export const getStockQuote = async (symbol) => {
  const response = await api.get(`/stocks/quote/${symbol}`);
  return response.data;
};

export const searchStocks = async (query) => {
  const response = await api.get(`/stocks/search?q=${query}`);
  return response.data.results;
};

export const getIPOListings = async () => {
  const response = await api.get('/stocks/ipos');
  return response.data.ipos;
};

export const getStockNews = async (symbol) => {
  const response = await api.get(`/stocks/news/${symbol}`);
  return response.data.news;
};

export const addToWatchlist = async (userId, symbol) => {
  const response = await api.post('/stocks/watchlist', { userId, symbol });
  return response.data;
};

export const marketDepthSearch = async (query, userId = 'anonymous') => {
  const response = await api.post('/market/depth-search', {
    query,
    userId
  });
  return response.data;
};

export const getWatchlist = async (userId) => {
  const response = await api.get(`/stocks/watchlist/${userId}`);
  return response.data.watchlist;
};

export default api;
