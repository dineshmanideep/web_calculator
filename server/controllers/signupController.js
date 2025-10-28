/**
 * Signup Controller
 *
 * Handles user signup operations:
 * - Send OTP to email for verification
 * - Verify OTP
 * - Complete signup after verification
 *
 * Uses temporary in-memory storage for OTPs during signup process
 */

import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { sendMail } from '../utils/mailer.js';
import { logAction } from '../middleware/auditLogger.js';

const SALT_ROUNDS = 10;
const OTP_EXPIRES_MIN = 10;

/**
 * Temporary in-memory storage for signup OTPs
 * Structure: { [email]: { code, expiresAt, verified } }
 * @private
 */
const tempSignupOtps = {};

/**
 * Generate 6-digit OTP
 * @returns {string} OTP code
 * @private
 */
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

/**
 * Send signup OTP to email
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const sendSignupOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      await logAction('SIGNUP', req, {
        email: email || 'Not provided',
        username: 'Anonymous',
        details: 'Signup OTP request - email not provided',
        input: email || 'Not provided',
        result: 'Failed: Email required',
        status: 'FAILED',
        errorMessage: 'Email required',
      });
      return res.status(400).json({ message: 'Email required' });
    }

    // If already registered, block
    const existing = await User.findOne({ email });
    if (existing) {
      await logAction('SIGNUP', req, {
        email,
        username: 'Anonymous',
        details: 'Signup attempt with existing email',
        input: email,
        result: 'Failed: Email already registered',
        status: 'FAILED',
        errorMessage: 'Email already registered',
      });
      return res.status(400).json({ message: 'Email already registered' });
    }

    const otp = generateOtp();
    tempSignupOtps[email] = {
      code: otp,
      expiresAt: getOtpExpiryDate(),
      verified: false,
    };

    await sendMail({
      to: email,
      subject: 'Signup verification OTP',
      text: `Your signup verification code is ${otp}. It expires in ${OTP_EXPIRES_MIN} minutes.`,
    });

    await logAction('SIGNUP', req, {
      email,
      username: 'Anonymous',
      details: 'Signup OTP sent successfully',
      input: email,
      result: 'OTP sent to email',
      status: 'SUCCESS',
    });

    return res.json({ message: 'OTP sent to email' });
  } catch (err) {
    console.error(err);
    await logAction('SIGNUP', req, {
      email: req.body?.email || 'Unknown',
      username: 'Anonymous',
      details: 'Signup OTP sending failed',
      input: req.body?.email || 'Unknown',
      result: `Error: ${err.message}`,
      status: 'ERROR',
      errorMessage: err.message,
    });
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Verify signup OTP
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const verifySignupOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      await logAction('SIGNUP_VERIFY', req, {
        email: email || 'Not provided',
        username: 'Anonymous',
        details: 'OTP verification - missing fields',
        input: email || 'Not provided',
        result: 'Failed: Email and OTP required',
        status: 'FAILED',
        errorMessage: 'Email and otp required',
      });
      return res.status(400).json({ message: 'Email and otp required' });
    }

    const record = tempSignupOtps[email];
    if (!record) {
      await logAction('SIGNUP_VERIFY', req, {
        email,
        username: 'Anonymous',
        details: 'No OTP found for email',
        input: email,
        result: 'Failed: No OTP sent for this email',
        status: 'FAILED',
        errorMessage: 'No OTP sent for this email',
      });
      return res.status(400).json({ message: 'No OTP sent for this email' });
    }

    if (record.expiresAt < new Date()) {
      delete tempSignupOtps[email];
      await logAction('SIGNUP_VERIFY', req, {
        email,
        username: 'Anonymous',
        details: 'OTP expired during verification',
        input: email,
        result: 'Failed: OTP expired',
        status: 'FAILED',
        errorMessage: 'OTP expired',
      });
      return res.status(400).json({ message: 'OTP expired' });
    }

    if (record.code !== otp) {
      await logAction('SIGNUP_VERIFY', req, {
        email,
        username: 'Anonymous',
        details: 'Invalid OTP provided',
        input: email,
        result: 'Failed: Invalid OTP',
        status: 'FAILED',
        errorMessage: 'Invalid OTP',
      });
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    record.verified = true;

    await logAction('SIGNUP_VERIFY', req, {
      email,
      username: 'Anonymous',
      details: 'Email verified successfully',
      input: email,
      result: 'Email verified',
      status: 'SUCCESS',
    });

    return res.json({ message: 'Email verified' });
  } catch (err) {
    console.error(err);
    await logAction('SIGNUP_VERIFY', req, {
      email: req.body?.email || 'Unknown',
      username: 'Anonymous',
      details: 'OTP verification error',
      input: req.body?.email || 'Unknown',
      result: `Error: ${err.message}`,
      status: 'ERROR',
      errorMessage: err.message,
    });
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Complete signup after email verification
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const completeSignup = async (req, res) => {
  try {
    const { email, username, fullName, password } = req.body;

    if (!email || !username || !password) {
      await logAction('SIGNUP', req, {
        email: email || 'Not provided',
        username: username || 'Anonymous',
        details: 'Signup completion - missing fields',
        input: email || 'Not provided',
        result: 'Failed: Missing fields',
        status: 'FAILED',
        errorMessage: 'Missing fields',
      });
      return res.status(400).json({ message: 'Missing fields' });
    }

    const record = tempSignupOtps[email];
    if (!record || !record.verified) {
      await logAction('SIGNUP', req, {
        email,
        username,
        details: 'Signup completion - email not verified',
        input: email,
        result: 'Failed: Email not verified',
        status: 'FAILED',
        errorMessage: 'Email not verified',
      });
      return res.status(400).json({ message: 'Email not verified' });
    }

    if (record.expiresAt < new Date()) {
      delete tempSignupOtps[email];
      await logAction('SIGNUP', req, {
        email,
        username,
        details: 'Signup completion - OTP expired',
        input: email,
        result: 'Failed: OTP expired',
        status: 'FAILED',
        errorMessage: 'OTP expired',
      });
      return res.status(400).json({ message: 'OTP expired' });
    }

    // Check username/email uniqueness again
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      await logAction('SIGNUP', req, {
        email,
        username,
        details: 'Signup completion - duplicate email or username',
        input: email,
        result: 'Failed: Email or username already in use',
        status: 'FAILED',
        errorMessage: 'Email or username already in use',
      });
      return res.status(400).json({ message: 'Email or username already in use' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({
      email,
      username,
      fullName,
      passwordHash,
      isVerified: true,
    });

    await user.save();

    // Cleanup temp record
    delete tempSignupOtps[email];

    await logAction('SIGNUP', req, {
      userId: user._id,
      email: user.email,
      username: user.username,
      details: 'Signup completed successfully',
      input: email,
      result: 'Account created successfully',
      status: 'SUCCESS',
    });

    return res.status(201).json({ message: 'Signup complete', userId: user._id });
  } catch (err) {
    console.error(err);
    await logAction('SIGNUP', req, {
      email: req.body?.email || 'Unknown',
      username: req.body?.username || 'Anonymous',
      details: 'Signup completion error',
      input: req.body?.email || 'Unknown',
      result: `Error: ${err.message}`,
      status: 'ERROR',
      errorMessage: err.message,
    });
    return res.status(500).json({ message: 'Server error' });
  }
};
