/*
  App

  Purpose:
  Define application routes and wire public, protected, and guest routes.
  Manages global authentication state and session management.

  Routes:
  - Public: /, /login, /signup, /verify-otp, /forgot-password, /reset-password
  - Protected: /calculator (requires auth), /admin (requires auth + admin role)
  - Auto-redirects authenticated users away from login/signup pages

  Parameters/Return:
  Returns the top-level React Router <Routes> element for the app.
*/

import { useState, useEffect } from 'react';
import {
  BrowserRouter, Routes, Route, Navigate,
} from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Calculator from './pages/Calculator';
import Admin from './pages/Admin';
import OtpVerification from './pages/OtpVerification';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const API_URL = import.meta.env.VITE_API_URL;

// Configure axios defaults for credentials
axios.defaults.withCredentials = true;

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleSignOut = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`);
      setAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Sign out failed:', error);
      setAuthenticated(false);
      setUser(null);
    }
  };

  // Setup axios interceptor for handling session expiry
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response, // Pass through successful responses
      async (error) => {
        // Check if error is 401 (Unauthorized - session expired)
        if (error.response?.status === 401) {
          const currentPath = window.location.pathname;
          // Only handle session expiry if user was authenticated
          // Avoid handling 401s from login page itself
          if (authenticated && currentPath !== '/login') {
            console.log('Session expired - asking user to continue');
            // Show a warning toast with action button
            toast.warning(
              <div>
                <p className="font-semibold">Your session has expired</p>
                <p className="text-sm mt-1">Would you like to continue? You&apos;ll need to login again.</p>
              </div>,
              {
                autoClose: false, // Don&apos;t auto-dismiss
                closeButton: true,
                onClose: () => {
                  // User dismissed the toast - redirect to login
                  setAuthenticated(false);
                  setUser(null);
                },
              },
            );
            // Don't logout immediately - let user dismiss the toast
            // The API call will fail but user can see what happened
          }
        }
        return Promise.reject(error);
      },
    );

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [authenticated]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/auth/check-session`);
        if (data.authenticated) {
          setAuthenticated(true);
          setUser(data.user);
        }
      } catch (error) {
        console.error('Session check failed:', error);
        setAuthenticated(false);
        setUser(null);
        handleSignOut();
      } finally {
        setLoading(false);
      }
    };
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <BrowserRouter>
        <Routes>
          {/* Landing Page */}
          <Route
            path="/"
            element={authenticated ? <Navigate to="/calculator" /> : <Landing />}
          />

          {/* Auth Routes */}
          <Route
            path="/login"
            element={authenticated ? <Navigate to="/calculator" /> : <Login setAuthenticated={setAuthenticated} setUser={setUser} />}
          />
          <Route
            path="/signup"
            element={authenticated ? <Navigate to="/calculator" /> : <Signup />}
          />
          <Route path="/verify-otp" element={<OtpVerification />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route
            path="/calculator"
            element={
              authenticated ? <Calculator user={user} onSignOut={handleSignOut} /> : <Navigate to="/login" />
            }
          />

          {/* Admin Route */}
          <Route
            path="/admin"
            element={
              authenticated && user?.isAdmin ? (
                <Admin user={user} onSignOut={handleSignOut} />
              ) : authenticated ? (
                <Navigate to="/calculator" />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
