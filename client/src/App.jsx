import { useState ,useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Calculator from "./pages/Calculator";
import Admin from "./pages/Admin";
import OtpVerification from "./pages/OtpVerification";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { ToastContainer } from "react-toastify"; // NEW

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // To handle initial session check

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/auth/check-session`,{ withCredentials: true });
        if (data.authenticated) {
          setAuthenticated(true);
          setUser(data.user);
        }
      } catch (error) {
        console.error("Session check failed:", error);
        setAuthenticated(false);
        setUser(null);
        handleSignOut();
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const handleSignOut = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`,{ withCredentials: true });
      setAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

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