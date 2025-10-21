import { useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function OtpVerification() {
  const [otp, setOtp] = useState("");
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId");
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/verify-signup`, { userId, otp });
      alert("Account verified. Please login now.");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "OTP verification failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
      <form onSubmit={handleVerify} className="bg-gray-800 p-8 rounded-lg shadow-md w-80 flex flex-col gap-4">
        <h1 className="text-white text-xl text-center">Verify OTP</h1>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white text-center"
          required
        />
        <button type="submit" className="p-2 bg-green-500 rounded text-white">
          Verify
        </button>
      </form>
    </div>
  );
}
