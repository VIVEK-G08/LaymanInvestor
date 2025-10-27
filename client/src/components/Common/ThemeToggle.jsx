import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

const ThemeToggle = () => {
  const { theme, toggleTheme, isDark } = useApp();

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-600 transition-all shadow-sm hover:shadow-md group"
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Sun Icon (Light Mode) */}
      <div className={`transition-all duration-300 ${isDark ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}>
        <Sun className="w-5 h-5 text-amber-500" />
      </div>

      {/* Moon Icon (Dark Mode) */}
      <div className={`absolute left-4 transition-all duration-300 ${isDark ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}>
        <Moon className="w-5 h-5 text-indigo-400" />
      </div>

      {/* Label */}
      <span className="ml-6 font-medium text-gray-700 dark:text-gray-300">
        {isDark ? 'Dark' : 'Light'}
      </span>

      {/* Animated Background */}
      <div className={`absolute inset-0 rounded-xl transition-all duration-300 -z-10 ${
        isDark 
          ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10' 
          : 'bg-gradient-to-r from-amber-500/10 to-orange-500/10'
      }`} />
    </button>
  );
};

export default ThemeToggle;
