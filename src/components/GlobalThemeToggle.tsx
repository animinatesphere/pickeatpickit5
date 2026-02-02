import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const GlobalThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-8 right-8 z-[9999] p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 group flex items-center justify-center"
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <div className="relative">
        {theme === 'dark' ? (
          <Sun className="w-6 h-6 text-amber-400 group-hover:rotate-45 transition-transform" />
        ) : (
          <Moon className="w-6 h-6 text-indigo-600 group-hover:-rotate-12 transition-transform" />
        )}
      </div>
    </button>
  );
};

export default GlobalThemeToggle;
