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

    req.session.user = {
      id: user._id,
      email: user.email,
      name: user.fullName,
      username: user.username,
      isAdmin: user.isAdmin,
    };

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

//Logout user and destroy session
export const logout = async (req, res) => {
  const userId = req.session?.user?.id;
  const userEmail = req.session?.user?.email;
  const { username } = req.session?.user || {};

  // Update lastLogout time in database
  if (userId) {
    try {
      await User.findByIdAndUpdate(userId, {
        lastLogout: new Date(),
      });
    } catch (error) {
      console.error("Error updating logout time:", error);
    }
  }

  req.session.destroy(async (err) => {
    if (err) {
      await logAction("LOGOUT", req, {
        userId,
        email: userEmail,
        username,
        details: "Logout failed",
        input: userEmail,
        result: `Failed: ${err.message}`,
        status: "ERROR",
        errorMessage: err.message,
      });
      return res.status(500).json({ message: "Could not log out." });
    }

    await logAction("LOGOUT", req, {
      userId,
      email: userEmail,
      username,
      details: "User logged out successfully",
      input: userEmail,
      result: "Success",
      status: "SUCCESS",
    });

    res.clearCookie("connect.sid");
    return res.status(200).json({ message: "Logged out successfully" });
  });
};

//Check if session is valid
export const checkSession = (req, res) => {
  if (req.session.user) {
    res.status(200).json({
      authenticated: true,
      user: req.session.user,
    });
  } else {
    res.status(200).json({
      authenticated: false,
      user: null,
    });
  }
};
