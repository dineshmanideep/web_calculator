/*
 * Login
 *
 * Purpose:
 * Handles user authentication by validating credentials and initiating a session.
 * Provides UI for login, navigation to password recovery and signup pages, and feedback via toast notifications.
 *
 * Parameters:
 * - setAuthenticated (func): updates authentication state after successful login.
 * - setUser (func): stores the authenticated user's information.
 *
 * Return value:
 * Renders the login form and manages authentication flow with navigation and toast feedback.
 */

import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Calculator, ArrowLeft, Mail, Lock, Sparkles } from 'lucide-react';

export default function Login({ setAuthenticated, setUser }) {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/login`, { emailOrUsername, password }, { withCredentials: true });
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-violet-600/20 via-fuchsia-500/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/4 w-[800px] h-[800px] bg-gradient-to-tl from-cyan-500/20 via-blue-600/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Back to Home */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 backdrop-blur-xl border border-white/10 hover:border-violet-500/50 text-slate-300 hover:text-white transition-all duration-300 shadow-lg hover:shadow-violet-500/25"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-medium">Back to Home</span>
      </Link>

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-3 mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-2xl blur opacity-75"></div>
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
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-cyan-600/20 rounded-3xl blur-xl"></div>
        
        <form onSubmit={handleSubmit} className="relative bg-gradient-to-br from-slate-900/90 to-indigo-900/90 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl border border-white/10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h2>
            <p className="text-slate-400">Sign in to continue your calculations</p>
          </div>

          <div className="space-y-5 mb-6">
            <div>
              <label htmlFor="login-identity" className="block text-slate-300 text-sm font-medium mb-2">
                Email or Username
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl blur opacity-0 group-focus-within:opacity-20 transition-opacity"></div>
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 w-5 h-5 text-slate-400 group-focus-within:text-violet-400 transition-colors pointer-events-none" />
                  <input
                    type="text"
                    id="login-identity"
                    placeholder="Enter your email or username"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800/50 backdrop-blur-xl text-white placeholder:text-slate-500 border border-white/10 focus:border-violet-500/50 focus:outline-none transition-all shadow-inner"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-slate-300 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl blur opacity-0 group-focus-within:opacity-20 transition-opacity"></div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 w-5 h-5 text-slate-400 group-focus-within:text-violet-400 transition-colors pointer-events-none" />
                  <input
                    type="password"
                    id="login-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800/50 backdrop-blur-xl text-white placeholder:text-slate-500 border border-white/10 focus:border-violet-500/50 focus:outline-none transition-all shadow-inner"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full py-3.5 rounded-xl font-semibold text-lg overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed mb-4 shadow-lg hover:shadow-violet-500/50 transition-shadow"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 transition-transform group-hover:scale-105 group-disabled:scale-100"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <span className="relative text-white flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors"
            >
              Forgot Password?
            </button>
          </div>
        </form>
      </div>

      {/* Signup Link */}
      <p className="relative z-10 text-slate-400 mt-6 text-center">
        Don't have an account?{" "}
        <Link to="/signup" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
}