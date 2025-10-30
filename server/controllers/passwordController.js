/**
 * Author: Dinesh Manideep
 * Password Reset Controller
 *
 * Handles password reset operations:
 * - Request password reset OTP
 * - Verify reset OTP
 * - Reset password with OTP
 */

import bcrypt from "bcrypt";
import User from "../models/User.js";
import { sendMail } from "../utils/mailer.js";
import { logAction } from "../middleware/auditLogger.js";

const SALT_ROUNDS = 10;
const OTP_EXPIRES_MIN = 10;

//Generate 6-digit OTP
const generateOtp = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

/**
 * Get OTP expiry date
 * @returns {Date} Expiry date
 * @private
 */
const getOtpExpiryDate = () => {
  return new Date(Date.now() + OTP_EXPIRES_MIN * 60 * 1000);
};

//Send password reset OTP to user email
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    await logAction("PASSWORD_RESET_REQUEST", req, {
      email,
      username: "Anonymous",
      details: "Email not provided",
      input: email || "Not provided",
      result: "Failed: Email required",
      status: "FAILED",
      errorMessage: "email required",
    });
    return res.status(400).json({ message: "email required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      await logAction("PASSWORD_RESET_REQUEST", req, {
        email,
        username: "Anonymous",
        details: "User not found for password reset",
        input: email,
        result: "Failed: User not found",
        status: "FAILED",
        errorMessage: "User not found",
      });
      return res.status(404).json({ message: "User not found" });
    }

    const otp = generateOtp();
    user.resetOtp = { code: otp, expiresAt: getOtpExpiryDate() };
    await user.save();

    await sendMail({
      to: email,
      subject: "Password reset OTP",
      text: `Your password reset code is ${otp}. It expires in ${OTP_EXPIRES_MIN} minutes.`,
    });

    await logAction("PASSWORD_RESET_REQUEST", req, {
      userId: user._id,
      email: user.email,
      username: user.username,
      details: "Password reset OTP sent successfully",
      input: email,
      result: "OTP sent to email",
      status: "SUCCESS",
    });

    return res.json({ message: "OTP sent to email", userId: user._id });
  } catch (error) {
    await logAction("PASSWORD_RESET_REQUEST", req, {
      email,
      username: "Anonymous",
      details: "Failed to send reset OTP email",
      input: email,
      result: "Failed: Email delivery error",
      status: "ERROR",
      errorMessage: error.message,
    });
    return res.status(500).json({ message: "Failed to send email" });
  }
};

//Reset password with OTP
export const resetPassword = async (req, res) => {
  const { userId, otp, newPassword } = req.body;

  if (!userId || !otp || !newPassword) {
    await logAction("PASSWORD_RESET", req, {
      email: "Unknown",
      username: "Anonymous",
      details: "Missing required fields",
      input: "Incomplete data",
      result: "Failed: Missing fields",
      status: "FAILED",
      errorMessage: "Missing fields",
    });
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const user = await User.findById(userId);

    if (!user || !user.resetOtp) {
      await logAction("PASSWORD_RESET", req, {
        email: user?.email || "Unknown",
        username: user?.username || "Anonymous",
        details: "Invalid reset request",
        input: user?.email || userId,
        result: "Failed: Invalid request",
        status: "FAILED",
        errorMessage: "Invalid request",
      });
      return res.status(400).json({ message: "Invalid request" });
    }

    if (user.resetOtp.expiresAt < new Date()) {
      await logAction("PASSWORD_RESET", req, {
        userId: user._id,
        email: user.email,
        username: user.username,
        details: "OTP expired",
        input: user.email,
        result: "Failed: OTP expired",
        status: "FAILED",
        errorMessage: "OTP expired",
      });
      return res.status(400).json({ message: "OTP expired" });
    }

    if (user.resetOtp.code !== otp) {
      await logAction("PASSWORD_RESET", req, {
        userId: user._id,
        email: user.email,
        username: user.username,
        details: "Invalid OTP provided",
        input: user.email,
        result: "Failed: Invalid OTP",
        status: "FAILED",
        errorMessage: "Invalid OTP",
      });
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.resetOtp = undefined;
    await user.save();

    await logAction("PASSWORD_RESET", req, {
      userId: user._id,
      email: user.email,
      username: user.username,
      details: "Password reset completed successfully",
      input: user.email,
      result: "Password reset successful",
      status: "SUCCESS",
    });

    return res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
