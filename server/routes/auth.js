import express from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/User.js";
import { sendMail } from "../utils/mailer.js";
import { generateAccessToken, generateRefreshToken } from "../middleware/auth.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const SALT_ROUNDS = 10;
const OTP_LENGTH = 6;
const OTP_EXPIRES_MIN = 10;

function makeOtp() {
  return ("" + Math.floor(100000 + Math.random() * 900000)); // 6-digit
}

function otpExpiryDate() {
  return new Date(Date.now() + OTP_EXPIRES_MIN * 60 * 1000);
}

// SIGNUP: create user record + send signup OTP
router.post("/signup", async (req, res) => {
  const { email, username, fullName, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "email and password required" });

  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) return res.status(400).json({ message: "User with email/username already exists" });

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const otp = makeOtp();

  const user = new User({
    email,
    username: username || email,
    fullName,
    passwordHash,
    isVerified: false,
    signupOtp: { code: otp, expiresAt: otpExpiryDate() },
  });

  await user.save();

  // send OTP email
  await sendMail({
    to: email,
    subject: "Verify your account - OTP",
    text: `Your verification code is ${otp}. It expires in ${OTP_EXPIRES_MIN} minutes.`,
  });

  return res.status(201).json({ message: "Signup created. Check email for OTP", userId: user._id });
});

// VERIFY SIGNUP OTP
router.post("/verify-signup", async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) return res.status(400).json({ message: "userId and otp required" });

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (!user.signupOtp || user.signupOtp.expiresAt < new Date()) return res.status(400).json({ message: "OTP expired or not set" });
  if (user.signupOtp.code !== otp) return res.status(400).json({ message: "Invalid OTP" });

  user.isVerified = true;
  user.signupOtp = undefined;
  await user.save();
  return res.json({ message: "Account verified" });
});

// LOGIN: email + password -> issue access + refresh tokens
router.post("/login", async (req, res) => {
  const { emailOrUsername, password } = req.body;
  if (!emailOrUsername || !password) return res.status(400).json({ message: "Missing fields" });

  const user = await User.findOne({ $or: [{ email: emailOrUsername }, { username: emailOrUsername }] });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash || "");
  if (!ok) return res.status(400).json({ message: "Invalid credentials" });
  if (!user.isVerified) return res.status(403).json({ message: "Email not verified" });

  const payload = { id: user._id, email: user.email };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // store refreshToken in DB (optional: maintain allowlist)
  user.refreshToken = refreshToken;
  await user.save();

  // set httpOnly cookie for refresh token
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // match refresh expiry
  });

  return res.json({ accessToken, user: { id: user._id, email: user.email,username:user.username ,fullName: user.fullName } });
});

// REFRESH token endpoint: reads refresh cookie, issues new access
router.post("/refresh", async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ message: "No refresh token" });

  // verify
  try {
    const jwt = await import("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) return res.status(403).json({ message: "Invalid refresh token" });

    const payload = { id: user._id, email: user.email };
    const accessToken = generateAccessToken(payload);
    return res.json({ accessToken });
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired refresh token" });
  }
});

// LOGOUT: clear cookie and remove refresh token
router.post("/logout", async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    try {
      const jwt = await import("jsonwebtoken");
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.id);
      if (user) {
        user.refreshToken = undefined;
        await user.save();
      }
    } catch (err) { /* ignore */ }
  }
  res.clearCookie("refreshToken");
  return res.json({ message: "Logged out" });
});

// FORGOT PASSWORD: create reset OTP and email it
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "email required" });
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const otp = makeOtp();
  user.resetOtp = { code: otp, expiresAt: otpExpiryDate() };
  await user.save();

  await sendMail({
    to: email,
    subject: "Password reset OTP",
    text: `Your password reset code is ${otp}. It expires in ${OTP_EXPIRES_MIN} minutes.`,
  });

  return res.json({ message: "OTP sent to email", userId: user._id });
});

// VERIFY OTP for reset (optional separate step)
router.post("/verify-otp-reset", async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) return res.status(400).json({ message: "userId and otp required" });

  const user = await User.findById(userId);
  if (!user || !user.resetOtp) return res.status(400).json({ message: "Invalid request" });
  if (user.resetOtp.expiresAt < new Date()) return res.status(400).json({ message: "OTP expired" });
  if (user.resetOtp.code !== otp) return res.status(400).json({ message: "Invalid OTP" });

  // mark success by clearing OTP? We'll let front-end call reset-password next.
  return res.json({ message: "OTP verified" });
});

// RESET PASSWORD: after OTP verification (frontend should provide userId, otp, newPassword)
router.post("/reset-password", async (req, res) => {
  const { userId, otp, newPassword } = req.body;
  if (!userId || !otp || !newPassword) return res.status(400).json({ message: "Missing fields" });

  const user = await User.findById(userId);
  if (!user || !user.resetOtp) return res.status(400).json({ message: "Invalid request" });
  if (user.resetOtp.expiresAt < new Date()) return res.status(400).json({ message: "OTP expired" });
  if (user.resetOtp.code !== otp) return res.status(400).json({ message: "Invalid OTP" });

  user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.resetOtp = undefined;
  await user.save();

  return res.json({ message: "Password reset successful" });
});

export default router;
