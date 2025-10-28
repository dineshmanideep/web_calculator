/*
 * Login
 *
 * Purpose:
 * Handles user authentication by validating credentials and initiating a session.
 * Provides UI for login, navigation to password recovery and signup pages, and feedback via toast notifications.
 *
 * Parameters:
 * - setAuthenticated (func): updates authentication state after successful login.
 * - setUser (func): stores the authenticated user’s information.
 *
 * Return value:
 * Renders the login form and manages authentication flow with navigation and toast feedback.
 */

import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Calculator, ArrowLeft } from 'lucide-react';

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

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
        <h2 className="text-white text-2xl mb-6 text-center font-semibold">Sign In</h2>

        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-2">Email or Username</label>
          <input
            type="text"
            placeholder="Enter your email or username"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:outline-none transition-colors"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-400 text-sm mb-2">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:outline-none transition-colors"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 bg-purple-600 hover:bg-purple-500 rounded text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
          >
            Forgot Password?
          </button>
        </div>
      </form>

      {/* Signup Link */}
      <p className="text-gray-400 mt-6 text-center">
        Don't have an account?
        {' '}
        <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
