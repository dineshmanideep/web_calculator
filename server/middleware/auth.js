import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Generates a JWT access token for the given payload.
 * The token is signed with the access secret and has a configurable expiration time.
 *
 * @param {Object} payload - The payload to include in the token (e.g., { id, email }).
 * @returns {string} The signed JWT access token.
 */
export function generateAccessToken(payload) {
  return jwt.sign(
    payload,
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
  );
}

/**
 * Generates a JWT refresh token for the given payload.
 * The token is signed with the refresh secret and has a configurable expiration time (longer than access token).
 *
 * @param {Object} payload - The payload to include in the token (e.g., { id, email }).
 * @returns {string} The signed JWT refresh token.
 */
export function generateRefreshToken(payload) {
  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' }
  );
}

/**
 * Middleware to verify the JWT access token from the Authorization header.
 * Extracts the token, verifies it, and attaches the user ID to the request object if valid.
 * Sends a 401 response if the token is missing, invalid, or expired.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export function verifyAccessToken(req, res, next) {
  const auth = req.headers.authorization;

  if (!auth) {
    return res.status(401).json({ message: 'No token' });
  }

  const token = auth.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}