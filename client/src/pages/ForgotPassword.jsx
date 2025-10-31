/*
 * Author: Scientific Calculator Team
 * Purpose:
 * Allows users to request a password reset by providing their registered email.
 * Sends OTP to the user's email for verification before password reset.
 * Now with full dark/light mode support.
 */

import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Calculator, ArrowLeft, Mail, Send, Sparkles } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;
  const { isDark } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSendingOtp(true);
      const res = await axios.post(`${API}/password/forgot-password`, { email }, { withCredentials: true });
      toast.success('OTP sent to your email');
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
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

      {/* Back to Login */}
      <Link 
        to="/login" 
        className={`absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-xl ${isDark ? 'bg-slate-800/50 border-white/10 hover:border-violet-500/50 text-slate-300' : 'bg-white/80 border-slate-300 hover:border-violet-500/50 text-slate-700'} backdrop-blur-xl border hover:text-white transition-all duration-300 shadow-lg hover:shadow-violet-500/25`}
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-medium">Back to Login</span>
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

      {/* Forgot Password Form */}
      <div className="relative z-10 w-full max-w-md">
        <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-cyan-600/20' : 'bg-gradient-to-r from-violet-400/30 via-fuchsia-400/30 to-cyan-400/30'} rounded-3xl blur-xl`}></div>
        
        <form onSubmit={handleSubmit} className={`relative ${isDark ? 'bg-gradient-to-br from-slate-900/90 to-indigo-900/90' : 'bg-gradient-to-br from-white/95 to-indigo-50/95'} backdrop-blur-2xl p-8 rounded-3xl shadow-2xl border ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <div className="text-center mb-8">
            <div className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20' : 'bg-gradient-to-br from-violet-200 to-fuchsia-200'} rounded-2xl flex items-center justify-center`}>
              <Mail className={`w-8 h-8 ${isDark ? 'text-violet-400' : 'text-violet-600'}`} />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent mb-2">
              Forgot Password?
            </h2>
            <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Enter your email to receive a password reset OTP</p>
          </div>

          <div className="space-y-5 mb-6">
            <div>
              <label htmlFor="forgot-email" className={`block ${isDark ? 'text-slate-300' : 'text-slate-700'} text-sm font-medium mb-2`}>
                Email Address
              </label>
              <div className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl blur opacity-0 group-focus-within:opacity-20 transition-opacity`}></div>
                <div className="relative flex items-center">
                  <Mail className={`absolute left-4 w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'} group-focus-within:text-violet-400 transition-colors pointer-events-none`} />
                  <input
                    type="email"
                    id="forgot-email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl ${isDark ? 'bg-slate-800/50 text-white placeholder:text-slate-500 border-white/10' : 'bg-white text-slate-900 placeholder:text-slate-400 border-slate-300'} backdrop-blur-xl border focus:border-violet-500/50 focus:outline-none transition-all shadow-inner`}
                    required
                    disabled={sendingOtp}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={sendingOtp}
            className="group relative w-full py-3.5 rounded-xl font-semibold text-lg overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed mb-4 shadow-lg hover:shadow-violet-500/50 transition-shadow"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 transition-transform group-hover:scale-105 group-disabled:scale-100"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <span className="relative text-white flex items-center justify-center gap-2">
              {sendingOtp ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Sending OTP...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send OTP
                </>
              )}
            </span>
          </button>

          <div className="text-center">
            <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-sm`}>
              Remember your password?{" "}
              <Link to="/login" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>

      {/* Additional Info */}
      <div className="relative z-10 mt-6 text-center max-w-md">
        <div className={`${isDark ? 'bg-slate-900/50 border-white/10' : 'bg-white/50 border-slate-200'} backdrop-blur-xl border rounded-2xl p-4`}>
          <div className="flex items-start gap-3">
            <Sparkles className={`w-5 h-5 ${isDark ? 'text-violet-400' : 'text-violet-600'} flex-shrink-0 mt-0.5`} />
            <div className="text-left">
              <p className={`${isDark ? 'text-slate-300' : 'text-slate-700'} text-sm font-medium mb-1`}>Security Notice</p>
              <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-xs`}>
                A one-time password (OTP) will be sent to your email. Please check your inbox and spam folder.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}