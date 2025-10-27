import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useApp, COUNTRIES } from '../../contexts/AppContext';

const CountrySelector = () => {
  const { selectedCountry, switchCountry, countryConfig } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCountryChange = (countryCode) => {
    switchCountry(countryCode);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-600 transition-all shadow-sm hover:shadow-md"
      >
        <Globe className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <span className="text-2xl">{countryConfig.flag}</span>
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {countryConfig.name}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-fade-in-down">
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Select Market
            </div>
            
            {Object.values(COUNTRIES).map((country) => {
              const isSelected = selectedCountry === country.code;
              
              return (
                <button
                  key={country.code}
                  onClick={() => handleCountryChange(country.code)}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all ${
                    isSelected
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{country.flag}</span>
                    <div className="text-left">
                      <div className="font-semibold">{country.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {country.exchanges.join(', ')}
                      </div>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Market Info */}
          <div className="border-t-2 border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900/50">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center justify-between mb-1">
                <span>Market Hours:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {countryConfig.marketHours}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Currency:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {countryConfig.currency}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountrySelector;
