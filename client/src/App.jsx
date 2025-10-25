import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Calculator from "./pages/Calculator";
import OtpVerification from "./pages/OtpVerification";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { ToastContainer } from "react-toastify"; // NEW

function App() {
  const [authenticated, setAuthenticated] = useState(true);
  const [user, setUser] = useState(null);

  const handleSignOut = () => {
    setAuthenticated(false);
    setUser(null);
  };

  return (
    <>
      <ToastContainer 
        position="top-center" 
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
          <Route
            path="/"
            element={
              authenticated ? <Navigate to="/calculator" /> : <Login setAuthenticated={setAuthenticated} setUser={setUser} />
            }
          />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-otp" element={<OtpVerification />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/calculator"
            element={
              authenticated ? <Calculator user={user} onSignOut={handleSignOut} /> : <Navigate to="/" />
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;