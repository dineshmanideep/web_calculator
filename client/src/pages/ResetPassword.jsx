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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirm) return toast.error('Passwords do not match'); // REPLACED alert

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
      </form>
    </div>
  );
}
