/**
 * author: Dinesh Manideep
 * Authentication Controller
 *
 * Handles user authentication operations:
 * - Login
 * - Logout
 * - Session validation
 */

import bcrypt from "bcrypt";
import User from "../models/User.js";
import { logAction } from "../middleware/auditLogger.js";

//Login user with email/username and password
export const login = async (req, res) => {
  const { emailOrUsername, password } = req.body;

  if (!emailOrUsername || !password) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user) {
      await logAction("LOGIN_FAILED", req, {
        email: emailOrUsername,
        username: emailOrUsername,
        details: "User not found",
        input: emailOrUsername,
        result: "Failed: User not found",
        status: "FAILED",
        errorMessage: "Invalid credentials",
      });
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash || "");
    if (!ok) {
      await logAction("LOGIN_FAILED", req, {
        email: user.email,
        username: user.username,
        details: "Incorrect password",
        input: emailOrUsername,
        result: "Failed: Incorrect password",
        status: "FAILED",
        errorMessage: "Invalid credentials",
      });
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Store previous login/logout info before updating
    const previousLogin = user.lastLogin;
    const previousLogout = user.lastLogout;
    const isFirstLogin = !previousLogin;

    // Update last login time
    user.lastLogin = new Date();
    await user.save();

    await logAction("LOGIN_SUCCESS", req, {
      email: user.email,
      username: user.username,
      details: "User logged in successfully",
      input: emailOrUsername,
      result: "Login successful",
      status: "SUCCESS",
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        isAdmin: user.isAdmin,
      },
      loginInfo: {
        isFirstLogin,
        lastLogin: previousLogin,
        lastLogout: previousLogout,
        currentLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error(error);
    await logAction("LOGIN_FAILED", req, {
      email: emailOrUsername,
      details: "Login error",
      input: emailOrUsername,
      result: `Error: ${error.message}`,
      status: "ERROR",
      errorMessage: error.message,
    });
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Logout user
export const logout = async (req, res) => {
  const userId = req.headers["x-user-id"] || req.body.userId;
  
  if (!userId) {
    return res.status(400).json({ message: "No user ID provided" });
  }

  try {
    const user = await User.findById(userId);
    
    if (user) {
      user.lastLogout = new Date();
      await user.save();

      await logAction("LOGOUT", req, {
        userId,
        email: user.email,
        username: user.username,
        details: "User logged out successfully",
        input: user.email,
        result: "Success",
        status: "SUCCESS",
      });
    }

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    await logAction("LOGOUT", req, {
      userId,
      details: "Logout failed",
      result: `Failed: ${error.message}`,
      status: "ERROR",
      errorMessage: error.message,
    });
    return res.status(500).json({ message: "Could not log out." });
  }
};

// Check if user is authenticated
export const checkSession = async (req, res) => {
  const userId = req.headers["x-user-id"];
  
  if (!userId) {
    return res.status(200).json({
      authenticated: false,
      user: null,
    });
  }

  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(200).json({
        authenticated: false,
        user: null,
      });
    }

    return res.status(200).json({
      authenticated: true,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Check session error:", error);
    return res.status(200).json({
      authenticated: false,
      user: null,
    });
  }
};
