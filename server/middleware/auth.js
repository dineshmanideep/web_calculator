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

/**
 * Middleware to check if the authenticated user is an admin.
 * Must be used after isAuthenticated middleware.
 */
export const isAdmin = async (req, res, next) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: "Unauthorized: No active session" });
    }

    // Import User model to check admin status
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(req.session.user.id);
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
};