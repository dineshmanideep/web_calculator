/**
 * ThemeContext.jsx
 * 
 * Purpose:
 * Provides global theme state management for dark/light mode throughout the application.
 * Persists theme preference in localStorage and manages theme-related CSS classes.
 * 
 * Author: Scientific Calculator Team
 * Date: October 31, 2025
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true; // Default to dark
  });

  useEffect(() => {
    const theme = isDark ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    
    // Remove both classes first
    document.documentElement.classList.remove('dark', 'light');
    // Add the current theme class
    document.documentElement.classList.add(theme);
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  const value = {
    isDark,
    theme: isDark ? 'dark' : 'light',
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;