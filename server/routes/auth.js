/**
 * Author:Dinesh Manideep
 * Authentication Routes
 *
 * Handles all authentication-related endpoints:
 * - User authentication (login, logout, session)
 * - Password reset flow
 * - User signup flow
 * - Calculation history management
 */

import express from "express";
import { isAuthenticated } from "../middleware/auth.js";

// Import controllers
import { login, logout, checkSession } from "../controllers/authController.js";
import {
  forgotPassword,
  resetPassword,
} from "../controllers/passwordController.js";
import {
  sendSignupOtp,
  verifySignupOtp,
  completeSignup,
} from "../controllers/signupController.js";
import {
  getHistory,
  addHistory,
  clearHistory,
} from "../controllers/historyController.js";

const router = express.Router();
router.post("/login", login);
router.post("/logout", isAuthenticated, logout);
router.get("/check-session", checkSession);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/signup-send-otp", sendSignupOtp);
router.post("/signup-verify-otp", verifySignupOtp);
router.post("/signup-complete", completeSignup);
router.get("/history", isAuthenticated, getHistory);
router.post("/history", isAuthenticated, addHistory);
router.delete("/history", isAuthenticated, clearHistory);

export default router;
