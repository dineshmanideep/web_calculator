/*
  Landing

  Purpose:
  Minimal landing page that redirects authenticated users to their dashboard
  and presents login/signup links for unauthenticated visitors.
  Now with full dark/light mode support.

  Features:
  - Hero section with app introduction
  - Feature showcase (ML, Matrix, Calculus, etc.)
  - Call-to-action buttons for signup/login
  - Theme-aware styling

  Author: Scientific Calculator Team
  Date: October 31, 2025
*/

import { Link } from 'react-router-dom';
import {
  Calculator as CalcIcon, Shield, Zap, TrendingUp, Activity, Sparkles,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const USER_MANUAL_URL = import.meta.env.VITE_USER_MANUAL_URL;

function Landing() {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950' : 'bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100'} ${isDark ? 'text-white' : 'text-slate-900'} overflow-hidden transition-colors duration-300`}>
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-1/2 -left-1/4 w-[800px] h-[800px] ${isDark ? 'bg-gradient-to-br from-violet-600/20 via-fuchsia-500/20' : 'bg-gradient-to-br from-violet-300/30 via-fuchsia-300/30'} to-transparent rounded-full blur-3xl animate-pulse`}></div>
        <div className={`absolute -bottom-1/2 -right-1/4 w-[800px] h-[800px] ${isDark ? 'bg-gradient-to-tl from-cyan-500/20 via-blue-600/20' : 'bg-gradient-to-tl from-cyan-300/30 via-blue-300/30'} to-transparent rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navigation */}
      <nav className={`relative z-10 border-b ${isDark ? 'border-white/10 bg-gradient-to-r from-slate-900/80 via-indigo-900/80 to-slate-900/80' : 'border-slate-200 bg-gradient-to-r from-white/95 via-indigo-50/95 to-white/95'} backdrop-blur-xl`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl blur ${isDark ? 'opacity-75' : 'opacity-50'}`}></div>
                <div className="relative bg-gradient-to-br from-violet-600 to-fuchsia-600 p-2.5 rounded-xl">
                  <CalcIcon className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                  Scientific Calculator
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className={`px-6 py-2.5 rounded-xl ${isDark ? 'bg-slate-800/50 hover:bg-slate-800 border-white/10' : 'bg-white hover:bg-slate-50 border-slate-300'} border transition-all duration-300 font-medium`}
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="group relative px-6 py-2.5 rounded-xl font-medium overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 transition-transform group-hover:scale-105"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <span className="relative text-white">Sign Up</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className={`absolute inset-0 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 rounded-3xl blur-2xl ${isDark ? 'opacity-50' : 'opacity-30'} animate-pulse`}></div>
              <div className={`relative p-6 ${isDark ? 'bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20' : 'bg-gradient-to-br from-violet-200/50 to-fuchsia-200/50'} rounded-3xl backdrop-blur-xl border ${isDark ? 'border-white/10' : 'border-violet-300'}`}>
                <CalcIcon className={`w-24 h-24 ${isDark ? 'text-violet-400' : 'text-violet-600'}`} />
              </div>
            </div>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
            Scientific Calculator
          </h1>
          <p className={`text-xl md:text-2xl ${isDark ? 'text-slate-300' : 'text-slate-600'} mb-4 max-w-3xl mx-auto leading-relaxed`}>
            A powerful, feature-rich calculator supporting complex math, matrix operations,
            calculus and graph plotting.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="group relative px-8 py-4 text-lg rounded-2xl font-semibold overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 transition-transform group-hover:scale-105"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <span className="relative text-white flex items-center gap-2 justify-center">
                <Sparkles className="w-5 h-5" />
                Get Started Free
              </span>
            </Link>
            <a
              href={USER_MANUAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative px-8 py-4 text-lg rounded-2xl font-semibold overflow-hidden ${isDark ? 'bg-slate-800/50 hover:bg-slate-800 border-white/10' : 'bg-white hover:bg-slate-50 border-slate-300'} border transition-all duration-300 backdrop-blur-xl`}
            >
              <span className={`relative ${isDark ? 'text-white' : 'text-slate-900'} flex items-center gap-2 justify-center`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                User Manual
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Features
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="group relative">
              <div className={`absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl blur ${isDark ? 'opacity-0 group-hover:opacity-20' : 'opacity-0 group-hover:opacity-10'} transition-opacity duration-300`}></div>
              <div className={`relative ${isDark ? 'bg-gradient-to-br from-slate-900/90 to-indigo-900/90' : 'bg-gradient-to-br from-white/90 to-indigo-50/90'} backdrop-blur-xl p-6 rounded-2xl border ${isDark ? 'border-white/10 hover:border-white/20' : 'border-slate-200 hover:border-violet-300'} transition-all duration-300 h-full`}>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <CalcIcon className="w-7 h-7 text-white" />
                </div>
                <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Basic & Advanced Math</h3>
                <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
                  Perform basic arithmetic to advanced mathematical operations including
                  trigonometry, logarithms, and exponential functions.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative">
              <div className={`absolute inset-0 bg-gradient-to-br from-pink-600 to-rose-600 rounded-2xl blur ${isDark ? 'opacity-0 group-hover:opacity-20' : 'opacity-0 group-hover:opacity-10'} transition-opacity duration-300`}></div>
              <div className={`relative ${isDark ? 'bg-gradient-to-br from-slate-900/90 to-indigo-900/90' : 'bg-gradient-to-br from-white/90 to-indigo-50/90'} backdrop-blur-xl p-6 rounded-2xl border ${isDark ? 'border-white/10 hover:border-white/20' : 'border-slate-200 hover:border-violet-300'} transition-all duration-300 h-full`}>
                <div className="w-14 h-14 bg-gradient-to-br from-pink-600 to-rose-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Matrix Operations</h3>
                <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
                  Handle complex matrix calculations including multiplication, addition,
                  subtraction, determinants, and transposes (up to 10×10).
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative">
              <div className={`absolute inset-0 bg-gradient-to-br from-purple-600 to-violet-600 rounded-2xl blur ${isDark ? 'opacity-0 group-hover:opacity-20' : 'opacity-0 group-hover:opacity-10'} transition-opacity duration-300`}></div>
              <div className={`relative ${isDark ? 'bg-gradient-to-br from-slate-900/90 to-indigo-900/90' : 'bg-gradient-to-br from-white/90 to-indigo-50/90'} backdrop-blur-xl p-6 rounded-2xl border ${isDark ? 'border-white/10 hover:border-white/20' : 'border-slate-200 hover:border-violet-300'} transition-all duration-300 h-full`}>
                <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-violet-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Complex Numbers</h3>
                <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
                  Work seamlessly with complex numbers and visualize them on the complex plane
                  with interactive plotting.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group relative">
              <div className={`absolute inset-0 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl blur ${isDark ? 'opacity-0 group-hover:opacity-20' : 'opacity-0 group-hover:opacity-10'} transition-opacity duration-300`}></div>
              <div className={`relative ${isDark ? 'bg-gradient-to-br from-slate-900/90 to-indigo-900/90' : 'bg-gradient-to-br from-white/90 to-indigo-50/90'} backdrop-blur-xl p-6 rounded-2xl border ${isDark ? 'border-white/10 hover:border-white/20' : 'border-slate-200 hover:border-violet-300'} transition-all duration-300 h-full`}>
                <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Function Plotting</h3>
                <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
                  Visualize mathematical functions with our interactive plotting tool.
                  Supports domain restrictions for inverse functions.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="group relative">
              <div className={`absolute inset-0 bg-gradient-to-br from-orange-600 to-amber-600 rounded-2xl blur ${isDark ? 'opacity-0 group-hover:opacity-20' : 'opacity-0 group-hover:opacity-10'} transition-opacity duration-300`}></div>
              <div className={`relative ${isDark ? 'bg-gradient-to-br from-slate-900/90 to-indigo-900/90' : 'bg-gradient-to-br from-white/90 to-indigo-50/90'} backdrop-blur-xl p-6 rounded-2xl border ${isDark ? 'border-white/10 hover:border-white/20' : 'border-slate-200 hover:border-violet-300'} transition-all duration-300 h-full`}>
                <div className="w-14 h-14 bg-gradient-to-br from-orange-600 to-amber-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Activity className="w-7 h-7 text-white" />
                </div>
                <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>History Tracking</h3>
                <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
                  Keep track of all your calculations with persistent history.
                  Easily recall and reuse previous results.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="group relative">
              <div className={`absolute inset-0 bg-gradient-to-br from-red-600 to-pink-600 rounded-2xl blur ${isDark ? 'opacity-0 group-hover:opacity-20' : 'opacity-0 group-hover:opacity-10'} transition-opacity duration-300`}></div>
              <div className={`relative ${isDark ? 'bg-gradient-to-br from-slate-900/90 to-indigo-900/90' : 'bg-gradient-to-br from-white/90 to-indigo-50/90'} backdrop-blur-xl p-6 rounded-2xl border ${isDark ? 'border-white/10 hover:border-white/20' : 'border-slate-200 hover:border-violet-300'} transition-all duration-300 h-full`}>
                <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-pink-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Admin Dashboard</h3>
                <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
                  Comprehensive admin panel with user management, activity monitoring,
                  and detailed audit logs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`relative z-10 border-t ${isDark ? 'border-white/10 bg-slate-900/50' : 'border-slate-200 bg-white/50'} backdrop-blur-xl py-8`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            © 2025 Scientific Calculator. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;