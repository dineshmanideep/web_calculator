/*
 * Signup
 *
 * Purpose:
 * Manages the multi-step user signup process — sending OTP, verifying email, and completing profile.
 * Handles user input validation and communicates with backend for each step.
 *
 * Parameters:
 * None (uses internal state and navigation hooks).
 *
 * Return value:
 * Renders a three-step signup flow including email verification, OTP input, and profile completion
 * with toast-based feedback and navigation to the login page on success.
 */

import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Calculator, ArrowLeft, Mail, Lock, User, CheckCircle, Sparkles,
} from 'lucide-react';

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

  // Step 1: send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Enter email');
    try {
      setSendingOtp(true);
      await axios.post(`${API}/auth/signup-send-otp`, { email });
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
      await axios.post(`${API}/auth/signup-verify-otp`, { email, otp });
      toast.success('Email verified. Please complete your profile.');
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP verification failed');
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
      });
      toast.success('Signup successful. Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setCompletingSignup(false);
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

      {/* Progress Steps */}
      <div className="relative z-10 flex items-center gap-3 mb-10">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className="flex items-center gap-2">
              <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all duration-300 ${
                step >= s 
                  ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/50' 
                  : 'bg-slate-800/50 text-slate-500 border border-white/10 backdrop-blur-xl'
              }`}>
                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                {step >= s && <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl blur opacity-50"></div>}
              </div>
              <span className={`text-sm font-medium transition-colors ${step >= s ? 'text-violet-400' : 'text-slate-500'}`}>
                {s === 1 ? 'Email' : s === 2 ? 'Verify' : 'Complete'}
              </span>
            </div>
            {s < 3 && (
              <div className={`w-16 h-0.5 mx-2 transition-all duration-300 ${
                step > s 
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/50' 
                  : 'bg-slate-800/50'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Forms Container */}
      <div className="relative z-10 w-full max-w-md">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-cyan-600/20 rounded-3xl blur-xl"></div>
        
        {/* Step 1: Email */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="relative bg-gradient-to-br from-slate-900/90 to-indigo-900/90 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl border border-white/10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent mb-2">
                Create Account
              </h2>
              <p className="text-slate-400">Enter your email to get started</p>
            </div>
            
            <div className="mb-6">
              <label htmlFor="signup-email" className="block text-slate-300 text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl blur opacity-0 group-focus-within:opacity-20 transition-opacity"></div>
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 w-5 h-5 text-slate-400 group-focus-within:text-violet-400 transition-colors pointer-events-none" />
                  <input
                    type="email"
                    id="signup-email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800/50 backdrop-blur-xl text-white placeholder:text-slate-500 border border-white/10 focus:border-violet-500/50 focus:outline-none transition-all shadow-inner"
                    required
                    disabled={sendingOtp}
                  />
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={sendingOtp}
              className="group relative w-full py-3.5 rounded-xl font-semibold text-lg overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-violet-500/50 transition-shadow"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 transition-transform group-hover:scale-105 group-disabled:scale-100"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <span className="relative text-white flex items-center justify-center gap-2">
                {sendingOtp ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Continue
                  </>
                )}
              </span>
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="relative bg-gradient-to-br from-slate-900/90 to-indigo-900/90 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl border border-white/10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent mb-2">
                Verify Email
              </h2>
              <p className="text-slate-400">Enter the 6-digit code sent to</p>
              <p className="text-violet-400 font-medium mt-1">{email}</p>
            </div>
            
            <div className="mb-6">
              <label htmlFor="signup-otp" className="block text-slate-300 text-sm font-medium mb-2">
                Verification Code
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl blur opacity-0 group-focus-within:opacity-20 transition-opacity"></div>
                <input
                  type="text"
                  id="signup-otp"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="relative w-full p-3 rounded-xl bg-slate-800/50 backdrop-blur-xl text-white placeholder:text-slate-500 text-center text-2xl tracking-widest border border-white/10 focus:border-violet-500/50 focus:outline-none transition-all shadow-inner"
                  maxLength={6}
                  required
                  disabled={verifyingOtp}
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl bg-slate-800/50 backdrop-blur-xl border border-white/10 hover:bg-slate-800 hover:border-violet-500/30 text-white font-semibold transition-all shadow-lg"
                disabled={verifyingOtp}
              >
                Back
              </button>
              <button 
                type="submit" 
                disabled={verifyingOtp}
                className="group relative flex-1 py-3 rounded-xl font-semibold overflow-hidden disabled:opacity-50 shadow-lg hover:shadow-violet-500/50 transition-shadow"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 transition-transform group-hover:scale-105 group-disabled:scale-100"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <span className="relative text-white flex items-center justify-center gap-2">
                  {verifyingOtp ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Verifying...
                    </>
                  ) : (
                    'Verify'
                  )}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Complete Profile */}
        {step === 3 && (
          <form onSubmit={handleCompleteSignup} className="relative bg-gradient-to-br from-slate-900/90 to-indigo-900/90 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl border border-white/10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent mb-2">
                Complete Profile
              </h2>
              <p className="text-slate-400">Fill in your details to finish signup</p>
            </div>
            
            <div className="space-y-4 mb-6">
              {/* Full Name */}
              <div>
                <label htmlFor="signup-fullname" className="block text-slate-300 text-sm font-medium mb-2">
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl blur opacity-0 group-focus-within:opacity-20 transition-opacity"></div>
                  <div className="relative flex items-center">
                    <User className="absolute left-4 w-5 h-5 text-slate-400 group-focus-within:text-violet-400 transition-colors pointer-events-none" />
                    <input
                      type="text"
                      id="signup-fullname"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800/50 backdrop-blur-xl text-white placeholder:text-slate-500 border border-white/10 focus:border-violet-500/50 focus:outline-none transition-all shadow-inner"
                      required
                      disabled={completingSignup}
                    />
                  </div>
                </div>
              </div>

              {/* Username */}
              <div>
                <label htmlFor="signup-username" className="block text-slate-300 text-sm font-medium mb-2">
                  Username
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl blur opacity-0 group-focus-within:opacity-20 transition-opacity"></div>
                  <div className="relative flex items-center">
                    <User className="absolute left-4 w-5 h-5 text-slate-400 group-focus-within:text-violet-400 transition-colors pointer-events-none" />
                    <input
                      type="text"
                      id="signup-username"
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800/50 backdrop-blur-xl text-white placeholder:text-slate-500 border border-white/10 focus:border-violet-500/50 focus:outline-none transition-all shadow-inner"
                      required
                      disabled={completingSignup}
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="signup-password" className="block text-slate-300 text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl blur opacity-0 group-focus-within:opacity-20 transition-opacity"></div>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-4 w-5 h-5 text-slate-400 group-focus-within:text-violet-400 transition-colors pointer-events-none" />
                    <input
                      type="password"
                      id="signup-password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800/50 backdrop-blur-xl text-white placeholder:text-slate-500 border border-white/10 focus:border-violet-500/50 focus:outline-none transition-all shadow-inner"
                      required
                      disabled={completingSignup}
                    />
                  </div>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="signup-confirm-password" className="block text-slate-300 text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl blur opacity-0 group-focus-within:opacity-20 transition-opacity"></div>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-4 w-5 h-5 text-slate-400 group-focus-within:text-violet-400 transition-colors pointer-events-none" />
                    <input
                      type="password"
                      id="signup-confirm-password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800/50 backdrop-blur-xl text-white placeholder:text-slate-500 border border-white/10 focus:border-violet-500/50 focus:outline-none transition-all shadow-inner"
                      required
                      disabled={completingSignup}
                    />
                  </div>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-4 mt-4">
                <p className="font-semibold mb-2 text-violet-400 text-sm">Password must contain:</p>
                <ul className="text-slate-300 text-xs space-y-1">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400"></div>
                    At least 8 characters
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400"></div>
                    One lowercase & uppercase letter
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400"></div>
                    One number & special character
                  </li>
                </ul>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={completingSignup}
              className="group relative w-full py-3.5 rounded-xl font-semibold text-lg overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-violet-500/50 transition-shadow"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 transition-transform group-hover:scale-105 group-disabled:scale-100"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <span className="relative text-white flex items-center justify-center gap-2">
                {completingSignup ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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

      {/* Login Link */}
      <p className="relative z-10 text-slate-400 mt-6 text-center">
        Already have an account?{" "}
        <Link to="/login" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}