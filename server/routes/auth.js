import express from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendMail } from '../utils/mailer.js';
import { generateAccessToken, generateRefreshToken ,verifyAccessToken } from '../middleware/auth.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const SALT_ROUNDS = 10;
const OTP_LENGTH = 6;
const OTP_EXPIRES_MIN = 10;

const makeOtp = () => {
  return ('' + Math.floor(100000 + Math.random() * 900000)); // 6-digit
};

const otpExpiryDate = () => {
  return new Date(Date.now() + OTP_EXPIRES_MIN * 60 * 1000);
};



// LOGIN: email + password -> issue access + refresh tokens
router.post('/login', async (req, res) => {
  const { emailOrUsername, password } = req.body;
  if (!emailOrUsername || !password) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const user = await User.findOne({ $or: [{ email: emailOrUsername }, { username: emailOrUsername }] });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash || '');
  if (!ok) return res.status(400).json({ message: 'Invalid credentials' }); 

  const payload = { id: user._id, email: user.email };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // store refreshToken in DB (optional: maintain allowlist)
  user.refreshToken = refreshToken;
  await user.save();

  // set httpOnly cookie for refresh token
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // match refresh expiry
  });

  return res.json({
    accessToken,
    user: { id: user._id, email: user.email, username: user.username, fullName: user.fullName },
  });
});

// REFRESH token endpoint: reads refresh cookie, issues new access
router.post('/refresh', async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token' });

  // verify
  try {
    const jwt = await import('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const payload = { id: user._id, email: user.email };
    const accessToken = generateAccessToken(payload);
    return res.json({ accessToken });
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
});

// LOGOUT: clear cookie and remove refresh token
router.post('/logout', async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    try {
      const jwt = await import('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.id);
      if (user) {
        user.refreshToken = undefined;
        await user.save();
      }
    } catch (err) {
      // ignore
    }
  }
  res.clearCookie('refreshToken');
  return res.json({ message: 'Logged out' });
});

// FORGOT PASSWORD: create reset OTP and email it
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'email required' });
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const otp = makeOtp();
  user.resetOtp = { code: otp, expiresAt: otpExpiryDate() };
  await user.save();

  await sendMail({
    to: email,
    subject: 'Password reset OTP',
    text: `Your password reset code is ${otp}. It expires in ${OTP_EXPIRES_MIN} minutes.`,
  });

  return res.json({ message: 'OTP sent to email', userId: user._id });
});

// VERIFY OTP for reset (optional separate step)
router.post('/verify-otp-reset', async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) return res.status(400).json({ message: 'userId and otp required' });

  const user = await User.findById(userId);
  if (!user || !user.resetOtp) {
    return res.status(400).json({ message: 'Invalid request' });
  }
  if (user.resetOtp.expiresAt < new Date()) {
    return res.status(400).json({ message: 'OTP expired' });
  }
  if (user.resetOtp.code !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  // mark success by clearing OTP? We'll let front-end call reset-password next.
  return res.json({ message: 'OTP verified' });
});

// RESET PASSWORD: after OTP verification (frontend should provide userId, otp, newPassword)
router.post('/reset-password', async (req, res) => {
  const { userId, otp, newPassword } = req.body;
  if (!userId || !otp || !newPassword) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const user = await User.findById(userId);
  if (!user || !user.resetOtp) {
    return res.status(400).json({ message: 'Invalid request' });
  }
  if (user.resetOtp.expiresAt < new Date()) {
    return res.status(400).json({ message: 'OTP expired' });
  }
  if (user.resetOtp.code !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.resetOtp = undefined;
  await user.save();

  return res.json({ message: 'Password reset successful' });
});

// Temporary in-memory store for pending signup OTPs
// NOTE: for production replace with persistent store (Redis/DB)
const tempSignupOtps = {}; // { [email]: { code, expiresAt, verified } }

// STEP 1: Send OTP for signup (no DB user created yet)
router.post('/signup-send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    // if already registered, block
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const otp = makeOtp();
    tempSignupOtps[email] = { code: otp, expiresAt: otpExpiryDate(), verified: false };

    await sendMail({
      to: email,
      subject: 'Signup verification OTP',
      text: `Your signup verification code is ${otp}. It expires in ${OTP_EXPIRES_MIN} minutes.`,
    });

    return res.json({ message: 'OTP sent to email' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// STEP 2: Verify OTP for the email (marks temporary record verified)
router.post('/signup-verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and otp required' });

    const record = tempSignupOtps[email];
    if (!record) return res.status(400).json({ message: 'No OTP sent for this email' });
    if (record.expiresAt < new Date()) {
      delete tempSignupOtps[email];
      return res.status(400).json({ message: 'OTP expired' });
    }
    if (record.code !== otp) return res.status(400).json({ message: 'Invalid OTP' });

    record.verified = true;
    return res.json({ message: 'Email verified' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// STEP 3: Complete signup — only allowed if email was verified in temp store
router.post('/signup-complete', async (req, res) => {
  try {
    const { email, username, fullName, password } = req.body;
    if (!email || !username || !password) return res.status(400).json({ message: 'Missing fields' });

    const record = tempSignupOtps[email];
    if (!record || !record.verified) return res.status(400).json({ message: 'Email not verified' });
    if (record.expiresAt < new Date()) {
      delete tempSignupOtps[email];
      return res.status(400).json({ message: 'OTP expired' });
    }

    // check username/email uniqueness again
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(400).json({ message: 'Email or username already in use' });

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({
      email,
      username,
      fullName,
      passwordHash,
      isVerified: true,
    });

    await user.save();
    // cleanup temp record
    delete tempSignupOtps[email];

    return res.status(201).json({ message: 'Signup complete', userId: user._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});


// ...existing code...

// Get current user's history
router.get('/history', verifyAccessToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId, 'history');
    if (!user) return res.status(404).json({ message: 'User not found' });
    // return history in reverse chronological order
    const history = (user.history || []).slice().reverse();
    return res.json({ history });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Add one history entry (expr, result)
router.post('/history', verifyAccessToken, async (req, res) => {
  try {
    const { expr, result } = req.body;
    if (!expr || result === undefined) return res.status(400).json({ message: 'Missing expr or result' });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // push new entry and keep latest 100
    user.history = user.history || [];
    user.history.push({ expr, result: String(result), createdAt: new Date() });
    if (user.history.length > 100) user.history = user.history.slice(user.history.length - 100);

    await user.save();
    // return fresh history reversed
    return res.json({ history: user.history.slice().reverse() });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Clear history
router.delete('/history', verifyAccessToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.history = [];
    await user.save();
    return res.json({ message: 'History cleared' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;