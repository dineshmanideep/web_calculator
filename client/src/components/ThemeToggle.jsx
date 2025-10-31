/**
 * ThemeToggle.jsx
 * 
 * Purpose:
 * Floating theme toggle button component that switches between dark and light modes.
 * Displays sun icon for dark mode and moon icon for light mode.
 * 
 * Author: Scientific Calculator Team
 * Date: October 31, 2025
 */

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 z-50 p-3.5 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-2xl hover:shadow-violet-500/50 transition-all duration-300 hover:scale-110 active:scale-95 border border-white/20"
      aria-label="Toggle theme"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? (
        <Sun className="w-6 h-6 text-white animate-spin-slow" style={{ animation: 'spin 20s linear infinite' }} />
      ) : (
        <Moon className="w-6 h-6 text-white" />
      )}
    </button>
  );
}