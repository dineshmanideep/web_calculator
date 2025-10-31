/*
 * Login
 *
 * Purpose:
 * Handles user authentication by validating credentials and initiating a session.
 * Provides UI for login, navigation to password recovery and signup pages, and feedback via toast notifications.
 * Now with full dark/light mode support.
 *
 * Parameters:
 * - setAuthenticated (func): updates authentication state after successful login.
 * - setUser (func): stores the authenticated user's information.
 *
 * Author: Scientific Calculator Team
 * Date: October 31, 2025
 */

import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Calculator, ArrowLeft, Mail, Lock, Sparkles } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function Login({ setAuthenticated, setUser }) {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;
  const { isDark } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/login`, { emailOrUsername, password }, { withCredentials: true });
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      setUser(res.data.user);
      setAuthenticated(true);
      toast.success('Login successful!');

      // Store login info in sessionStorage for display on Calculator page
      if (res.data.loginInfo) {
        sessionStorage.setItem('loginInfo', JSON.stringify(res.data.loginInfo));
      }

      navigate('/calculator');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950' : 'bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100'} flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden transition-colors duration-300`}>
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-1/2 -left-1/4 w-[800px] h-[800px] ${isDark ? 'bg-gradient-to-br from-violet-600/20 via-fuchsia-500/20' : 'bg-gradient-to-br from-violet-300/30 via-fuchsia-300/30'} to-transparent rounded-full blur-3xl animate-pulse`}></div>
        <div className={`absolute -bottom-1/2 -right-1/4 w-[800px] h-[800px] ${isDark ? 'bg-gradient-to-tl from-cyan-500/20 via-blue-600/20' : 'bg-gradient-to-tl from-cyan-300/30 via-blue-300/30'} to-transparent rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '2s' }}></div>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] ${isDark ? 'bg-gradient-to-r from-purple-500/10 via-pink-500/10' : 'bg-gradient-to-r from-purple-300/20 via-pink-300/20'} to-transparent rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Back to Home */}
      <Link 
        to="/" 
        className={`absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-xl ${isDark ? 'bg-slate-800/50 border-white/10 hover:border-violet-500/50 text-slate-300' : 'bg-white/80 border-slate-300 hover:border-violet-500/50 text-slate-700'} backdrop-blur-xl border hover:text-white transition-all duration-300 shadow-lg hover:shadow-violet-500/25`}
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-medium">Back to Home</span>
      </Link>

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-3 mb-8">
        <div className="relative">
          <div className={`absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-2xl blur ${isDark ? 'opacity-75' : 'opacity-60'}`}></div>
          <div className="relative bg-gradient-to-br from-violet-600 to-fuchsia-600 p-3 rounded-2xl shadow-xl">
            <Calculator className="w-10 h-10 text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
            Scientific Calculator
          </h1>
        </div>
      </div>

      {/* Login Form */}
      <div className="relative z-10 w-full max-w-md">
        <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-cyan-600/20' : 'bg-gradient-to-r from-violet-400/30 via-fuchsia-400/30 to-cyan-400/30'} rounded-3xl blur-xl`}></div>
        
        <form onSubmit={handleSubmit} className={`relative ${isDark ? 'bg-gradient-to-br from-slate-900/90 to-indigo-900/90' : 'bg-gradient-to-br from-white/95 to-indigo-50/95'} backdrop-blur-2xl p-8 rounded-3xl shadow-2xl border ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h2>
            <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Sign in to continue your calculations</p>
          </div>

          <div className="space-y-5 mb-6">
            <div>
              <label htmlFor="login-identity" className={`block ${isDark ? 'text-slate-300' : 'text-slate-700'} text-sm font-medium mb-2`}>
                Email or Username
              </label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  id="login-identity"
                  type="text"
                  placeholder="Enter your email or username"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  required
                  className={`w-full pl-11 pr-4 py-3 ${isDark ? 'bg-slate-800/50 border-white/10 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-300`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className={`block ${isDark ? 'text-slate-300' : 'text-slate-700'} text-sm font-medium mb-2`}>
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`w-full pl-11 pr-4 py-3 ${isDark ? 'bg-slate-800/50 border-white/10 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-300`}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end mb-6">
            <Link 
              to="/forgot-password" 
              className="text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full py-3.5 rounded-xl font-semibold overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 transition-transform group-hover:scale-105 group-disabled:scale-100"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 blur opacity-50 group-hover:opacity-75 transition-opacity group-disabled:opacity-50"></div>
            <span className="relative text-white flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Sign In
                </>
              )}
            </span>
          </button>

          <div className={`mt-6 text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            <p>
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}