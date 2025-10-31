/*
 * ResetPassword
 *
 * Purpose:
 * Allows users to reset their password using OTP verification.
 * Validates password strength and confirms password match before submission.
 * Now with full dark/light mode support.
 *
 * Author: Scientific Calculator Team
 * Date: October 31, 2025
 */

import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Calculator, ArrowLeft, Lock, Sparkles } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ResetPassword() {
  const location = useLocation();
  const email = location.state?.email || '';
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;
  const { isDark } = useTheme();

  const validatePassword = (pwd) => {
    const minLength = pwd.length >= 8;
    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    return {
      minLength, hasLower, hasUpper, hasNumber, hasSpecial,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const checks = validatePassword(newPassword);
    if (!Object.values(checks).every(Boolean)) {
      toast.error('Password must meet all the required rules');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/password/reset-password`, {
        email,
        otp,
        newPassword,
      }, { withCredentials: true });
      toast.success('Password reset successful! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  const checks = validatePassword(newPassword);

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

      {/* Reset Password Form */}
      <div className="relative z-10 w-full max-w-md">
        <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-cyan-600/20' : 'bg-gradient-to-r from-violet-400/30 via-fuchsia-400/30 to-cyan-400/30'} rounded-3xl blur-xl`}></div>
        
        <form onSubmit={handleSubmit} className={`relative ${isDark ? 'bg-gradient-to-br from-slate-900/90 to-indigo-900/90' : 'bg-gradient-to-br from-white/95 to-indigo-50/95'} backdrop-blur-2xl p-8 rounded-3xl shadow-2xl border ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent mb-2">
              Reset Password
            </h2>
            <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Enter the OTP sent to {email}
            </p>
          </div>

          <div className="space-y-5 mb-6">
            <div>
              <label htmlFor="reset-otp" className={`block ${isDark ? 'text-slate-300' : 'text-slate-700'} text-sm font-medium mb-2`}>
                Verification Code
              </label>
              <input
                id="reset-otp"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
                className={`w-full px-4 py-3 text-center text-2xl tracking-widest ${isDark ? 'bg-slate-800/50 border-white/10 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-300`}
              />
            </div>

            <div>
              <label htmlFor="new-password" className={`block ${isDark ? 'text-slate-300' : 'text-slate-700'} text-sm font-medium mb-2`}>
                New Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  id="new-password"
                  type="password"
                  placeholder="Create a strong password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className={`w-full pl-11 pr-4 py-3 ${isDark ? 'bg-slate-800/50 border-white/10 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-300`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirm-new-password" className={`block ${isDark ? 'text-slate-300' : 'text-slate-700'} text-sm font-medium mb-2`}>
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  id="confirm-new-password"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`w-full pl-11 pr-4 py-3 ${isDark ? 'bg-slate-800/50 border-white/10 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-300`}
                />
              </div>
            </div>
          </div>

          {/* Password Requirements */}
          {newPassword && (
            <div className={`mb-6 p-4 ${isDark ? 'bg-slate-800/30' : 'bg-indigo-50'} rounded-xl border ${isDark ? 'border-white/10' : 'border-indigo-200'}`}>
              <p className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Password Requirements:</p>
              <ul className="space-y-1 text-sm">
                <li className={`flex items-center gap-2 ${checks.minLength ? 'text-green-400' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {checks.minLength ? '✓' : '○'} At least 8 characters
                </li>
                <li className={`flex items-center gap-2 ${checks.hasLower ? 'text-green-400' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {checks.hasLower ? '✓' : '○'} One lowercase letter
                </li>
                <li className={`flex items-center gap-2 ${checks.hasUpper ? 'text-green-400' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {checks.hasUpper ? '✓' : '○'} One uppercase letter
                </li>
                <li className={`flex items-center gap-2 ${checks.hasNumber ? 'text-green-400' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {checks.hasNumber ? '✓' : '○'} One number
                </li>
                <li className={`flex items-center gap-2 ${checks.hasSpecial ? 'text-green-400' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {checks.hasSpecial ? '✓' : '○'} One special character
                </li>
              </ul>
            </div>
          )}

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
                  Resetting Password...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Reset Password
                </>
              )}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}