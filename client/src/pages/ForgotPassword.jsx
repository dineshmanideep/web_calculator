/*
 * ForgotPassword
 *
 * Purpose:
 * Handles the user flow for initiating a password reset by sending an OTP to the user's email.
 * Uses backend API integration and provides feedback through toast notifications.
 *
 * Parameters:
 * None (uses internal state and navigation hooks).
 *
 * Return value:
 * Renders a form that accepts the user's email, sends an OTP via API call, and
 * navigates to the reset password page upon success.
 */

import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // ADDED

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSendingOtp(true);
      const res = await axios.post(`${API}/auth/forgot-password`, { email });
      toast.success('OTP sent to your email'); // REPLACED alert
      navigate(`/reset-password?userId=${res.data.userId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP'); // REPLACED alert
    } finally {
      setSendingOtp(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-md w-80 flex flex-col gap-4">
        <h1 className="text-white text-xl text-center">Forgot Password</h1>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white"
          required
          disabled={sendingOtp}
        />
        <button
          type="submit"
          className="p-2 bg-green-500 rounded text-white disabled:opacity-50"
          disabled={sendingOtp}
        >
          {sendingOtp ? 'Sending...' : 'Send OTP'}
        </button>
      </form>
    </div>
  );
}
