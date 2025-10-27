import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, TrendingUp, Search, Brain, Zap, BarChart3, Star, ChartLine, LogOut, Trash2, User, Calendar } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import TopStocks from './components/TopStocks';
import IPOTab from './components/IPOTab';

const LaymanInvestorApp = () => {
  const { user, signOut } = useAuth();
  const userId = user?.id;

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hey there! 👋 I'm LaymanInvestor, your intelligent investment advisor. I can provide real-time market data, comprehensive stock analysis, or explain any investing concepts. What would you like to explore today?",
      emotion: 'welcoming',
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [stockSearch, setStockSearch] = useState('');
  const [stockData, setStockData] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  
  // Search suggestions
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Market depth search
  const [depthSearchQuery, setDepthSearchQuery] = useState('');
  const [depthSearchResult, setDepthSearchResult] = useState(null);
  const [showDepthResult, setShowDepthResult] = useState(false);
  
  const messagesEndRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const API_URL = process.env.REACT_APP_API_URL || 'https://LaymanInvestor.onrender.com/api';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history and watchlist on mount
  useEffect(() => {
    if (userId) {
      loadChatHistory();
      loadWatchlist();
    }
  }, [userId]);

  const loadChatHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/chat/history/${userId}`);
      const data = await response.json();
      if (data.history && data.history.length > 0) {
        const formattedHistory = data.history.map(msg => ({
          role: msg.role,
          content: msg.content,
          emotion: msg.emotion,
          timestamp: msg.created_at
        }));
        setMessages(formattedHistory);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const loadWatchlist = async () => {
    try {
      const response = await fetch(`${API_URL}/stocks/watchlist/${userId}`);
      const data = await response.json();
      setWatchlist(data.watchlist || []);
    } catch (error) {
      console.error('Error loading watchlist:', error);
    }
  };

  const getEmotionBadge = (emotion) => {
    const badges = {
      fear: { icon: '😟', text: 'Feeling nervous', color: 'bg-orange-100 text-orange-700' },
      confused: { icon: '🤔', text: 'Curious to learn', color: 'bg-blue-100 text-blue-700' },
      excited: { icon: '🔥', text: 'Feeling excited', color: 'bg-red-100 text-red-700' },
      insecure: { icon: '💭', text: 'Feeling uncertain', color: 'bg-purple-100 text-purple-700' },
      curious: { icon: '🧠', text: 'Learning mode', color: 'bg-green-100 text-green-700' },
      urgent: { icon: '⚡', text: 'Wants quick answer', color: 'bg-yellow-100 text-yellow-700' },
      neutral: { icon: '💬', text: 'Just chatting', color: 'bg-gray-100 text-gray-700' }
    };
    return badges[emotion] || badges.neutral;
  };

  const getFallbackResponse = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes('stock')) {
      return "Stocks are like owning tiny pieces of a company! When the company does well, your piece becomes more valuable. It's like buying a slice of your favorite pizza shop - if they sell more pizzas, your slice is worth more! 🍕";
    }
    if (lower.includes('invest')) {
      return "Investing is putting your money to work for you! Instead of keeping cash under your mattress, you give it a job - growing over time. Start small, learn as you go, and remember: time in the market beats timing the market! ⏰";
    }
    return "Great question! While I'm having connection issues, the key to investing is education first, action second. Never invest in what you don't understand. Want to know more about any specific topic?";
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    try {
      const conversationHistory = messages.slice(-6).map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      console.log('Sending to AI with context:', conversationHistory);

      const response = await fetch(`${API_URL}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          userId: userId,
          conversationHistory: conversationHistory
        })
      });

      const data = await response.json();

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        emotion: data.emotion,
        timestamp: data.timestamp
      }]);

      setDetectedEmotion(data.emotion);
      setTimeout(() => setDetectedEmotion(null), 3000);

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Oops! I'm having trouble connecting right now. But here's what I can tell you: " + getFallbackResponse(currentInput),
        emotion: 'neutral',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleStockSearchInput = async (value) => {
    setStockSearch(value);
    
    if (value.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`${API_URL}/stocks/search?q=${encodeURIComponent(value)}`);
        const data = await response.json();
        setSearchResults(data.results || []);
        setShowSearchResults(true);
      } catch (error) {
        console.error('Error searching stocks:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const selectStockFromSearch = async (symbol) => {
    setStockSearch(symbol);
    setShowSearchResults(false);
    setSearchResults([]);
    
    try {
      const response = await fetch(`${API_URL}/stocks/quote/${symbol}`);
      const data = await response.json();
      setStockData(data);
    } catch (error) {
      console.error('Error fetching stock:', error);
      alert('Could not fetch stock data. Please try again.');
    }
  };

  const handleStockSearchEnter = async () => {
    if (!stockSearch.trim()) return;
    
    setShowSearchResults(false);
    try {
      const response = await fetch(`${API_URL}/stocks/quote/${stockSearch}`);
      const data = await response.json();
      setStockData(data);
    } catch (error) {
      console.error('Error fetching stock:', error);
      alert('Could not fetch stock data. Please check the symbol.');
    }
  };
  const handleTopStockClick = async (symbol) => {
    setStockSearch(symbol);
    setActiveTab('stocks');
    try {
      const response = await fetch(`${API_URL}/stocks/quote/${symbol}`);
      const data = await response.json();
      setStockData(data);
    } catch (error) {
      console.error('Error fetching stock:', error);
    }
  };

  const handleAddToWatchlist = async (symbol) => {
    try {
      await fetch(`${API_URL}/stocks/watchlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          symbol: symbol
        })
      });
      await loadWatchlist();
      alert(`${symbol} added to watchlist!`);
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      alert('Failed to add to watchlist.');
    }
  };

  const handleRemoveFromWatchlist = async (symbol) => {
    if (!window.confirm(`Remove ${symbol} from watchlist?`)) return;
    
    try {
      await fetch(`${API_URL}/stocks/watchlist/${userId}/${symbol}`, {
        method: 'DELETE'
      });
      await loadWatchlist();
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      alert('Failed to remove from watchlist.');
    }
  };

  const handleDepthSearch = async () => {
    if (!depthSearchQuery.trim()) return;

    setIsTyping(true);
    setShowDepthResult(false);
    
    try {
      const response = await fetch(`${API_URL}/market/depth-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: depthSearchQuery,
          userId: userId
        })
      });
      const result = await response.json();
      setDepthSearchResult(result);
      setShowDepthResult(true);
    } catch (error) {
      console.error('Depth search error:', error);
      alert('Could not perform depth search. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Clear all chat history? This cannot be undone.')) return;
    
    try {
      await fetch(`${API_URL}/chat/history/${userId}`, {
        method: 'DELETE'
      });
      setMessages([{
        role: 'assistant',
        content: "Chat history cleared! How can I help you today?",
        emotion: 'welcoming',
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Error clearing history:', error);
      alert('Failed to clear chat history.');
    }
  };

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to logout?')) return;
    await signOut();
  };

  const quickPrompts = [
    "Best performing stocks today?",
    "What is a stock?",
    "Should I invest now?",
    "Latest market news",
    "How to start with ₹500?",
    "Explain PE ratio"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  LaymanInvestor
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                </h1>
                <p className="text-sm text-gray-600">Your intelligent investment advisor 🤝</p>
              </div>
            </div>

            <div className="flex gap-2 items-center">
              {/* User Profile */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">{user?.email?.split('@')[0]}</span>
              </div>

              {/* Navigation Tabs */}
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  activeTab === 'chat'
                    ? 'bg-indigo-100 text-indigo-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Brain className="w-4 h-4" />
                Chat
              </button>
              <button
                onClick={() => setActiveTab('stocks')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  activeTab === 'stocks'
                    ? 'bg-indigo-100 text-indigo-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Stocks
              </button>
              <button
                onClick={() => setActiveTab('watchlist')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  activeTab === 'watchlist'
                    ? 'bg-indigo-100 text-indigo-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Star className="w-4 h-4" />
                Watchlist ({watchlist.length})
              </button>
              <button
                onClick={() => setActiveTab('ipos')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  activeTab === 'ipos'
                    ? 'bg-indigo-100 text-indigo-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Calendar className="w-4 h-4" />
                IPOs
              </button>

              {/* Clear History Button (only in chat tab) */}
              {activeTab === 'chat' && (
                <button
                  onClick={handleClearHistory}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                  title="Clear chat history"
                >
                  <Trash2 className="w-4 h-4 text-gray-600" />
                </button>
              )}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg flex items-center gap-2 text-gray-600 hover:bg-gray-100 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-2xl ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-800 border border-gray-200'} rounded-2xl px-5 py-3 shadow-sm`}>
                    {msg.role === 'assistant' && msg.emotion && idx > 0 && (
                      <div className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full mb-2 ${getEmotionBadge(msg.emotion).color}`}>
                        <span>{getEmotionBadge(msg.emotion).icon}</span>
                        <span className="font-medium">{getEmotionBadge(msg.emotion).text}</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl px-5 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">Analyzing market data...</span>
                    </div>
                  </div>
                </div>
              )}

              {detectedEmotion && (
                <div className="flex justify-center">
                  <div className={`inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full ${getEmotionBadge(detectedEmotion).color}`}>
                    <Brain className="w-4 h-4" />
                    <span>Detected: {getEmotionBadge(detectedEmotion).text}</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Stocks Tab */}
          {activeTab === 'stocks' && (
            <div className="space-y-6">
              {/* Market Depth Search */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ChartLine className="w-5 h-5" />
                  Market Depth Search
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Get comprehensive analysis with trends, news, and real-time data
                </p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={depthSearchQuery}
                    onChange={(e) => setDepthSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleDepthSearch()}
                    placeholder="e.g., 'NVIDIA analysis', 'tech sector today', 'RELIANCE.NS trends'"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleDepthSearch}
                    disabled={!depthSearchQuery.trim()}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <Search className="w-4 h-4" />
                    Analyze
                  </button>
                </div>
              </div>

              {/* Depth Search Results */}
              {showDepthResult && depthSearchResult && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <ChartLine className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-gray-900">Analysis Results</h3>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <p className="text-gray-800">{depthSearchResult.analysis}</p>
                  </div>
                  
                  {depthSearchResult.type === 'stock_analysis' && depthSearchResult.quote && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600">Current Price</p>
                        <p className="text-lg font-bold">
                          {depthSearchResult.quote.isIndian ? '₹' : '$'}
                          {depthSearchResult.quote.c?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600">Change</p>
                        <p className={`text-lg font-bold ${depthSearchResult.quote.d >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {depthSearchResult.quote.d >= 0 ? '+' : ''}
                          {depthSearchResult.quote.isIndian ? '₹' : '$'}
                          {Math.abs(depthSearchResult.quote.d || 0)?.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600">Change %</p>
                        <p className={`text-lg font-bold ${depthSearchResult.quote.dp >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {depthSearchResult.quote.dp >= 0 ? '+' : ''}
                          {depthSearchResult.quote.dp?.toFixed(2) || '0.00'}%
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600">High</p>
                        <p className="text-lg font-bold">
                          {depthSearchResult.quote.isIndian ? '₹' : '$'}
                          {depthSearchResult.quote.h?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {depthSearchResult.news && depthSearchResult.news.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Recent News</h4>
                      <div className="space-y-2">
                        {depthSearchResult.news.slice(0, 3).map((news, idx) => (
                          <div key={idx} className="text-sm border-l-2 border-indigo-500 pl-3">
                            <p className="font-medium text-gray-800">{news.headline}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(news.datetime * 1000).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Stock Search with Suggestions */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 relative">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Search Stocks
                </h2>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={stockSearch}
                      onChange={(e) => handleStockSearchInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleStockSearchEnter()}
                      placeholder="Search stocks (e.g., TATA, AAPL, RELIANCE)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    
                    {/* Search Results Dropdown */}
                    {showSearchResults && searchResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                        {searchResults.map((result, idx) => (
                          <div
                            key={idx}
                            onClick={() => selectStockFromSearch(result.symbol)}
                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-900">{result.symbol}</p>
                                <p className="text-sm text-gray-600">{result.description}</p>
                              </div>
                              {result.sector && (
                                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                                  {result.sector}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {isSearching && (
                      <div className="absolute right-3 top-3">
                        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleStockSearchEnter}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-all"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Stock Data Display */}
              {stockData && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{stockData.symbol}</h3>
                      {stockData.profile && (
                        <p className="text-gray-600">{stockData.profile.name}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddToWatchlist(stockData.symbol)}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-all"
                    >
                      <Star className="w-4 h-4" />
                      Add to Watchlist
                    </button>
                  </div>

                  {stockData.quote && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Current Price</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stockData.quote.isIndian ? '₹' : '$'}
                          {stockData.quote.c?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Change</p>
                        <p className={`text-2xl font-bold ${stockData.quote.d >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stockData.quote.d >= 0 ? '+' : ''}
                          {stockData.quote.isIndian ? '₹' : '$'}
                          {Math.abs(stockData.quote.d || 0)?.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Change %</p>
                        <p className={`text-2xl font-bold ${stockData.quote.dp >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stockData.quote.dp >= 0 ? '+' : ''}
                          {stockData.quote.dp?.toFixed(2) || '0.00'}%
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">High</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stockData.quote.isIndian ? '₹' : '$'}
                          {stockData.quote.h?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    </div>
                  )}

                  {stockData.profile && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        <strong>Industry:</strong> {stockData.profile.finnhubIndustry || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Market Cap:</strong> {stockData.profile.marketCapitalization > 0 
                          ? `${(stockData.profile.marketCapitalization / 10000000).toFixed(2)} Cr` 
                          : 'Not available'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Top Stocks Section */}
              <TopStocks onStockClick={handleTopStockClick} />
            </div>
          )}

          {/* Watchlist Tab */}
          {activeTab === 'watchlist' && (
            <div className="space-y-4">
              {watchlist.length === 0 ? (
                <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
                  <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Your watchlist is empty</h3>
                  <p className="text-gray-600">Search for stocks and add them to your watchlist to track them!</p>
                </div>
              ) : (
                watchlist.map((item, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{item.symbol}</h3>
                      <p className="text-sm text-gray-600">Added: {new Date(item.added_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          setStockSearch(item.symbol);
                          setActiveTab('stocks');
                          try {
                            const response = await fetch(`${API_URL}/stocks/quote/${item.symbol}`);
                            const data = await response.json();
                            setStockData(data);
                          } catch (error) {
                            console.error('Error:', error);
                          }
                        }}
                        className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-all"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleRemoveFromWatchlist(item.symbol)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* IPO Tab */}
          {activeTab === 'ipos' && (
            <IPOTab onStockClick={handleTopStockClick} />
          )}
        </div>
      </div>

      {/* Chat Input (only show on chat tab) */}
      {activeTab === 'chat' && (
        <>
          {messages.length <= 1 && (
            <div className="px-4 pb-4">
              <div className="max-w-6xl mx-auto">
                <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Try asking:
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(prompt)}
                      className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="bg-white border-t border-gray-200 px-4 py-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask for real-time data, analysis, or explanations..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium shadow-lg shadow-indigo-200"
                >
                  <Send className="w-5 h-5" />
                  Send
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                💡 I provide real market data for investors and simple explanations for learners
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LaymanInvestorApp;