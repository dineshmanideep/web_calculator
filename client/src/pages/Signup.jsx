/*
 * Signup
 *
 * Purpose:
 * Manages the multi-step user signup process — sending OTP, verifying email, and completing profile.
 * Handles user input validation and communicates with backend for each step.
 * Now with full dark/light mode support.
 *
 * Author: Scientific Calculator Team
 * Date: October 31, 2025
 */

import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Calculator, ArrowLeft, Mail, Lock, User, CheckCircle, Sparkles,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function Signup() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [completingSignup, setCompletingSignup] = useState(false);
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;
  const { isDark } = useTheme();

  // Step 1: send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Enter email');
    try {
      setSendingOtp(true);
      await axios.post(`${API}/auth/signup-send-otp`, { email }, { withCredentials: true });
      toast.success('OTP sent to your email');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  // Step 2: verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return toast.error('Enter OTP');
    try {
      setVerifyingOtp(true);
      await axios.post(`${API}/auth/signup-verify-otp`, { email, otp } , { withCredentials: true });
      toast.success('Email verified. Please complete your profile.');
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data||message || 'OTP verification failed');
    } finally {
      setVerifyingOtp(false);
    }
  };

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

  // Step 3: complete signup
  const handleCompleteSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const checks = validatePassword(password);
    if (!Object.values(checks).every(Boolean)) {
      toast.error('Password must meet all the required rules');
      return;
    }

    try {
      setCompletingSignup(true);
      await axios.post(`${API}/auth/signup-complete`, {
        email,
        username,
        fullName,
        password,
      } , { withCredentials: true });
      toast.success('Signup successful. Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setCompletingSignup(false);
    }
  };

  const checks = validatePassword(password);

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

      {/* Progress Steps */}
      <div className="relative z-10 flex items-center gap-3 mb-10">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                step >= s
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/50'
                  : isDark
                    ? 'bg-slate-800/50 text-slate-500 border border-white/10'
                    : 'bg-white text-slate-400 border border-slate-300'
              }`}>
                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              <span className={`text-sm font-medium ${step >= s ? 'text-violet-400' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {s === 1 ? 'Email' : s === 2 ? 'Verify' : 'Profile'}
              </span>
            </div>
            {s < 3 && (
              <div className={`w-16 h-0.5 mx-2 transition-all duration-300 ${
                step > s ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600' : isDark ? 'bg-slate-800' : 'bg-slate-300'
              }`}></div>
            )}
          </div>
        ))}
      </div>

      {/* Form Container */}
      <div className="relative z-10 w-full max-w-md">
        <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-cyan-600/20' : 'bg-gradient-to-r from-violet-400/30 via-fuchsia-400/30 to-cyan-400/30'} rounded-3xl blur-xl`}></div>

        <div className={`relative ${isDark ? 'bg-gradient-to-br from-slate-900/90 to-indigo-900/90' : 'bg-gradient-to-br from-white/95 to-indigo-50/95'} backdrop-blur-2xl p-8 rounded-3xl shadow-2xl border ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          
          {/* Step 1: Enter Email */}
          {step === 1 && (
            <form onSubmit={handleSendOtp}>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent mb-2">
                  Create Account
                </h2>
                <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Start your journey with us</p>
              </div>

              <div className="mb-6">
                <label htmlFor="signup-email" className={`block ${isDark ? 'text-slate-300' : 'text-slate-700'} text-sm font-medium mb-2`}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={`w-full pl-11 pr-4 py-3 ${isDark ? 'bg-slate-800/50 border-white/10 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-300`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={sendingOtp}
                className="group relative w-full py-3.5 rounded-xl font-semibold overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 transition-transform group-hover:scale-105 group-disabled:scale-100"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 blur opacity-50 group-hover:opacity-75 transition-opacity group-disabled:opacity-50"></div>
                <span className="relative text-white flex items-center justify-center gap-2">
                  {sendingOtp ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Send OTP
                    </>
                  )}
                </span>
              </button>

              <div className={`mt-6 text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <p>
                  Already have an account?{' '}
                  <Link to="/login" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          )}

          {/* Step 2: Verify OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp}>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent mb-2">
                  Verify Email
                </h2>
                <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Enter the OTP sent to {email}</p>
              </div>

              <div className="mb-6">
                <label htmlFor="otp-input" className={`block ${isDark ? 'text-slate-300' : 'text-slate-700'} text-sm font-medium mb-2`}>
                  Verification Code
                </label>
                <input
                  id="otp-input"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={6}
                  className={`w-full px-4 py-3 text-center text-2xl tracking-widest ${isDark ? 'bg-slate-800/50 border-white/10 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-300`}
                />
              </div>

              <button
                type="submit"
                disabled={verifyingOtp}
                className="group relative w-full py-3.5 rounded-xl font-semibold overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 transition-transform group-hover:scale-105 group-disabled:scale-100"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 blur opacity-50 group-hover:opacity-75 transition-opacity group-disabled:opacity-50"></div>
                <span className="relative text-white flex items-center justify-center gap-2">
                  {verifyingOtp ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Verify OTP
                    </>
                  )}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className={`w-full mt-3 py-2.5 rounded-xl font-medium ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'} transition-all duration-300`}
              >
                Change Email
              </button>
            </form>
          )}

          {/* Step 3: Complete Profile */}
          {step === 3 && (
            <form onSubmit={handleCompleteSignup}>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent mb-2">
                  Complete Profile
                </h2>
                <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Just a few more details</p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label htmlFor="fullname" className={`block ${isDark ? 'text-slate-300' : 'text-slate-700'} text-sm font-medium mb-2`}>
                    Full Name
                  </label>
                  <div className="relative">
                    <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    <input
                      id="fullname"
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className={`w-full pl-11 pr-4 py-3 ${isDark ? 'bg-slate-800/50 border-white/10 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-300`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="username" className={`block ${isDark ? 'text-slate-300' : 'text-slate-700'} text-sm font-medium mb-2`}>
                    Username
                  </label>
                  <div className="relative">
                    <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    <input
                      id="username"
                      type="text"
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className={`w-full pl-11 pr-4 py-3 ${isDark ? 'bg-slate-800/50 border-white/10 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-300`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className={`block ${isDark ? 'text-slate-300' : 'text-slate-700'} text-sm font-medium mb-2`}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    <input
                      id="password"
                      type="password"
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className={`w-full pl-11 pr-4 py-3 ${isDark ? 'bg-slate-800/50 border-white/10 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-300`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirm-password" className={`block ${isDark ? 'text-slate-300' : 'text-slate-700'} text-sm font-medium mb-2`}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    <input
                      id="confirm-password"
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
              {password && (
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
                disabled={completingSignup}
                className="group relative w-full py-3.5 rounded-xl font-semibold overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 transition-transform group-hover:scale-105 group-disabled:scale-100"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 blur opacity-50 group-hover:opacity-75 transition-opacity group-disabled:opacity-50"></div>
                <span className="relative text-white flex items-center justify-center gap-2">
                  {completingSignup ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Create Account
                    </>
                  )}
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}