import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Calculator, ArrowLeft, Mail, Lock, User, CheckCircle } from "lucide-react";

export default function Signup() {
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: details
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [completingSignup, setCompletingSignup] = useState(false);
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  // Step 1: send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Enter email");
    try {
      setSendingOtp(true);
      await axios.post(`${API}/auth/signup-send-otp`, { email });
      toast.success("OTP sent to your email");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  // Step 2: verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return toast.error("Enter OTP");
    try {
      setVerifyingOtp(true);
      await axios.post(`${API}/auth/signup-verify-otp`, { email, otp });
      toast.success("Email verified. Please complete your profile.");
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP verification failed");
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Step 3: complete signup
  const handleCompleteSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return toast.error("Passwords do not match");
    try {
      setCompletingSignup(true);
      await axios.post(`${API}/auth/signup-complete`, {
        email,
        username,
        fullName,
        password,
      });
      toast.success("Signup successful. Please login.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      setCompletingSignup(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4">
      {/* Back to Home */}
      <Link 
        to="/" 
        className="absolute top-4 left-4 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Home
      </Link>

      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <Calculator className="w-10 h-10 text-purple-500" />
        <h1 className="text-3xl font-bold text-white">Web Calculator</h1>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4 mb-8">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-purple-400' : 'text-gray-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-purple-600' : 'bg-gray-700'}`}>
            {step > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
          </div>
          <span className="text-sm font-medium">Email</span>
        </div>
        <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-purple-600' : 'bg-gray-700'}`} />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-purple-400' : 'text-gray-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-purple-600' : 'bg-gray-700'}`}>
            {step > 2 ? <CheckCircle className="w-5 h-5" /> : '2'}
          </div>
          <span className="text-sm font-medium">Verify</span>
        </div>
        <div className={`w-12 h-0.5 ${step >= 3 ? 'bg-purple-600' : 'bg-gray-700'}`} />
        <div className={`flex items-center gap-2 ${step >= 3 ? 'text-purple-400' : 'text-gray-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-purple-600' : 'bg-gray-700'}`}>
            3
          </div>
          <span className="text-sm font-medium">Complete</span>
        </div>
      </div>

      {/* Step 1: Email */}
      {step === 1 && (
        <form onSubmit={handleSendOtp} className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
          <h2 className="text-white text-2xl mb-2 text-center font-semibold">Create Account</h2>
          <p className="text-gray-400 text-sm text-center mb-6">Enter your email to get started</p>
          
          <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:outline-none transition-colors"
                required
                disabled={sendingOtp}
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full p-3 bg-purple-600 hover:bg-purple-500 rounded text-white font-semibold transition-colors disabled:opacity-50"
            disabled={sendingOtp}
          >
            {sendingOtp ? "Sending OTP..." : "Continue"}
          </button>
        </form>
      )}

      {/* Step 2: OTP Verification */}
      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
          <h2 className="text-white text-2xl mb-2 text-center font-semibold">Verify Email</h2>
          <p className="text-gray-400 text-sm text-center mb-6">Enter the 6-digit code sent to {email}</p>
          
          <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-2">Verification Code</label>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-3 rounded bg-gray-700 text-white text-center text-2xl tracking-widest border border-gray-600 focus:border-purple-500 focus:outline-none transition-colors"
              maxLength={6}
              required
              disabled={verifyingOtp}
            />
          </div>
          
          <div className="flex gap-3">
            <button 
              type="button" 
              onClick={() => setStep(1)}
              className="flex-1 p-3 bg-gray-700 hover:bg-gray-600 rounded text-white font-semibold transition-colors"
              disabled={verifyingOtp}
            >
              Back
            </button>
            <button 
              type="submit" 
              className="flex-1 p-3 bg-purple-600 hover:bg-purple-500 rounded text-white font-semibold transition-colors disabled:opacity-50"
              disabled={verifyingOtp}
            >
              {verifyingOtp ? "Verifying..." : "Verify"}
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Complete Profile */}
      {step === 3 && (
        <form onSubmit={handleCompleteSignup} className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
          <h2 className="text-white text-2xl mb-2 text-center font-semibold">Complete Profile</h2>
          <p className="text-gray-400 text-sm text-center mb-6">Fill in your details to finish signup</p>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:outline-none transition-colors"
                  required
                  disabled={completingSignup}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:outline-none transition-colors"
                  required
                  disabled={completingSignup}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:outline-none transition-colors"
                  required
                  disabled={completingSignup}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:outline-none transition-colors"
                  required
                  disabled={completingSignup}
                />
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full p-3 bg-purple-600 hover:bg-purple-500 rounded text-white font-semibold transition-colors disabled:opacity-50"
            disabled={completingSignup}
          >
            {completingSignup ? "Creating Account..." : "Create Account"}
          </button>
        </form>
      )}

      {/* Login Link */}
      <p className="text-gray-400 mt-6 text-center">
        Already have an account?{" "}
        <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
          Sign In
        </Link>
      </p>
    </div>
  );
}