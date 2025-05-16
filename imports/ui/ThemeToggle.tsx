import React from 'react';
import { useTheme } from './ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button 
      className="theme-toggle" 
      onClick={toggleDarkMode}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {darkMode ? '☀️' : '🌙'}
    </button>
  );
};