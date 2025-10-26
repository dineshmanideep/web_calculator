/**
 * Middleware to check if a user is authenticated by verifying the session.
 * If the session exists, it proceeds to the next middleware.
 * Otherwise, it returns a 401 Unauthorized error.
 */
export const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  } else {
    return res.status(401).json({ message: "Unauthorized: No active session" });
  }
};