
import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

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
    if (!email) return alert("Enter email");
    try {
      setSendingOtp(true);
      await axios.post(`${API}/signup-send-otp`, { email });
      alert("OTP sent to your email");
      setStep(2);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  // Step 2: verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return alert("Enter OTP");
    try {
      setVerifyingOtp(true);
      await axios.post(`${API}/signup-verify-otp`, { email, otp });
      alert("Email verified. Please complete your profile.");
      setStep(3);
    } catch (err) {
      alert(err.response?.data?.message || "OTP verification failed");
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Step 3: complete signup
  const handleCompleteSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return alert("Passwords do not match");
    try {
      setCompletingSignup(true);
      await axios.post(`${API}/signup-complete`, {
        email,
        username,
        fullName,
        password,
      });
      alert("Signup successful. Please login.");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    } finally {
      setCompletingSignup(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
      {step === 1 && (
        <form onSubmit={handleSendOtp} className="bg-gray-800 p-8 rounded-lg shadow-md w-80 flex flex-col gap-3">
          <h1 className="text-white text-xl text-center mb-2">Signup — Verify Email</h1>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 rounded bg-gray-700 text-white"
            required
            disabled={sendingOtp}
          />
          <button
            type="submit"
            className="p-2 bg-green-500 rounded text-white mt-2 disabled:opacity-50"
            disabled={sendingOtp}
          >
            {sendingOtp ? "Sending..." : "Send OTP"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="bg-gray-800 p-8 rounded-lg shadow-md w-80 flex flex-col gap-3">
          <h1 className="text-white text-xl text-center mb-2">Enter OTP</h1>
          <input
            type="text"
            placeholder="OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="p-2 rounded bg-gray-700 text-white text-center"
            required
            disabled={verifyingOtp}
          />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 p-2 bg-green-500 rounded text-white" disabled={verifyingOtp}>
              {verifyingOtp ? "Verifying..." : "Verify"}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 p-2 bg-gray-600 rounded text-white"
              disabled={verifyingOtp}
            >
              Back
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleCompleteSignup} className="bg-gray-800 p-8 rounded-lg shadow-md w-80 flex flex-col gap-3">
          <h1 className="text-white text-xl text-center mb-2">Complete Signup</h1>
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="p-2 rounded bg-gray-700 text-white"
            required
            disabled={completingSignup}
          />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="p-2 rounded bg-gray-700 text-white"
            required
            disabled={completingSignup}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 rounded bg-gray-700 text-white"
            required
            disabled={completingSignup}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="p-2 rounded bg-gray-700 text-white"
            required
            disabled={completingSignup}
          />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 p-2 bg-green-500 rounded text-white" disabled={completingSignup}>
              {completingSignup ? "Creating..." : "Complete Signup"}
            </button>
            <button type="button" onClick={() => setStep(1)} className="flex-1 p-2 bg-gray-600 rounded text-white" disabled={completingSignup}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <p className="text-white mt-4 text-center">
        Already have an account? <Link to="/" className="text-green-400 underline">Login</Link>
      </p>
    </div>
  );
}
