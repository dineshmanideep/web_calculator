import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; // ADDED

export default function Login({ setAuthenticated, setUser }) {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/login`, { emailOrUsername, password }, { withCredentials: true });
      // console.log(res.data.user);
      setUser(res.data.user);
      setAuthenticated(true);
      toast.success("Login successful!"); // ADDED
      navigate("/calculator");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed"); // REPLACED alert
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-md w-80">
        <h1 className="text-white text-xl mb-4 text-center">Login</h1>

        <input
          type="text"
          placeholder="Email or Username"
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
          required
        />

        <button type="submit" className="w-full p-2 bg-green-500 rounded text-white">
          Login
        </button>

        <p
          className="text-green-400 underline text-sm mt-3 cursor-pointer text-center"
          onClick={() => navigate("/forgot-password")}
        >
          Forgot Password?
        </p>
      </form>

      <p className="text-white mt-2 text-center">
        Don’t have an account?{" "}
        <Link to="/signup" className="text-green-400 underline">
          Signup
        </Link>
      </p>
    </div>
  );
}