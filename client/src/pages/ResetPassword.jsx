/*
 * ResetPassword
 *
 * Purpose:
 * Allows users to reset their password using an OTP sent to their email.
 * Validates OTP and ensures the new password is confirmed before submitting.
 *
 * Parameters:
 * None (uses internal state and query parameters for userId).
 *
 * Return value:
 * Renders a password reset form that accepts OTP, new password, and confirmation,
 * then updates the password through the backend API with toast feedback.
 */

import { useState } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // ADDED

export default function ResetPassword() {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const API = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return {
      minLength, hasLower, hasUpper, hasNumber, hasSpecial,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirm) return toast.error('Passwords do not match'); // REPLACED alert

    const checks = validatePassword(newPassword);
    if (!Object.values(checks).every(Boolean)) {
      toast.error('Password must meet all the required rules');
      return;
    }

    try {
      await axios.post(`${API}/auth/reset-password`, { userId, otp, newPassword });
      toast.success('Password reset successful. Please login.'); // REPLACED alert
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password'); // REPLACED alert
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-md w-80 flex flex-col gap-4">
        <h1 className="text-white text-xl text-center">Reset Password</h1>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white"
          required
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white"
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white"
          required
        />
        <button type="submit" className="p-2 bg-green-500 rounded text-white">
          Reset Password
        </button>
        <div className="bg-gray-700 text-gray-300 text-sm p-4 rounded-lg border border-gray-600 mt-4">
          <p className="font-semibold mb-1 text-purple-400">Password must contain:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>At least 8 characters</li>
            <li>At least one lowercase letter</li>
            <li>At least one uppercase letter</li>
            <li>At least one number</li>
            <li>At least one special character (!@#$%^&amp;*)</li>
          </ul>
        </div>
      </form>
    </div>
  );
}
