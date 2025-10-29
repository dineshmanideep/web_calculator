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
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  // Theme colors object for easy access
  const theme = {
    // Backgrounds
    bg: {
      primary: isDark ? 'from-slate-950 via-indigo-950 to-slate-950' : 'from-slate-50 via-indigo-50 to-slate-50',
      secondary: isDark ? 'from-slate-900/90 to-indigo-900/90' : 'from-white/90 to-indigo-100/90',
      card: isDark ? 'from-slate-900/80 to-indigo-900/80' : 'from-white/80 to-indigo-50/80',
      input: isDark ? 'bg-slate-800/50' : 'bg-white/50',
      hover: isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100',
    },
    // Text colors
    text: {
      primary: isDark ? 'text-white' : 'text-slate-900',
      secondary: isDark ? 'text-slate-300' : 'text-slate-700',
      muted: isDark ? 'text-slate-400' : 'text-slate-500',
      gradient: 'bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent',
    },
    // Borders
    border: {
      default: isDark ? 'border-white/10' : 'border-slate-200',
      hover: isDark ? 'hover:border-violet-500/50' : 'hover:border-violet-400/50',
      focus: isDark ? 'focus:border-violet-500/50' : 'focus:border-violet-400/50',
    },
    // Buttons
    button: {
      primary: 'bg-gradient-to-r from-violet-600 to-fuchsia-600',
      secondary: isDark ? 'bg-slate-800/50' : 'bg-white/50',
      hover: isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100',
    },
    // Effects
    glow: isDark ? 'from-violet-600/20 via-fuchsia-500/20' : 'from-violet-300/30 via-fuchsia-300/30',
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;