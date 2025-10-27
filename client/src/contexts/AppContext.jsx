import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const COUNTRIES = {
  IN: {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    currency: '₹',
    exchanges: ['NSE', 'BSE'],
    indices: ['NIFTY 50', 'SENSEX', 'NIFTY BANK'],
    timezone: 'Asia/Kolkata',
    marketHours: '9:15 AM - 3:30 PM IST'
  },
  US: {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    currency: '$',
    exchanges: ['NASDAQ', 'NYSE', 'AMEX'],
    indices: ['S&P 500', 'DOW JONES', 'NASDAQ'],
    timezone: 'America/New_York',
    marketHours: '9:30 AM - 4:00 PM EST'
  }
};

export const AppProvider = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'light';
  });

  // Country state
  const [selectedCountry, setSelectedCountry] = useState(() => {
    const saved = localStorage.getItem('selectedCountry');
    return saved || 'IN';
  });

  // Chat sessions state
  const [chatSessions, setChatSessions] = useState([]);
  const [activeChatSession, setActiveChatSession] = useState(null);

  // User preferences
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('userPreferences');
    return saved ? JSON.parse(saved) : {
      animations: true,
      soundEffects: false,
      notifications: true,
      compactMode: false
    };
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Save country preference
  useEffect(() => {
    localStorage.setItem('selectedCountry', selectedCountry);
  }, [selectedCountry]);

  // Save user preferences
  useEffect(() => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
  }, [preferences]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const switchCountry = (countryCode) => {
    setSelectedCountry(countryCode);
  };

  const updatePreference = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const getCountryConfig = () => COUNTRIES[selectedCountry];

  const value = {
    // Theme
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
    
    // Country
    selectedCountry,
    switchCountry,
    countryConfig: getCountryConfig(),
    
    // Chat Sessions
    chatSessions,
    setChatSessions,
    activeChatSession,
    setActiveChatSession,
    
    // Preferences
    preferences,
    updatePreference
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export default AppContext;
