/**
 * Author:Dinesh Manideep
 * Middleware to check if a user is authenticated by verifying the userId from headers.
 * If the userId exists and valid, it proceeds to the next middleware.
 * Otherwise, it returns a 401 Unauthorized error.
 */
export const isAuthenticated = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] || req.body.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID provided" });
    }

    // Check if user exists and account status
    const User = (await import("../models/User.js")).default;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.isSuspended) {
      return res.status(403).json({ 
        message: "Account suspended. Please contact administrator.",
        suspended: true
      });
    }

    // Update last activity time
    user.lastActivity = new Date();
    await user.save();

    // Attach user to request for later use
    req.user = { id: user._id.toString(), email: user.email, username: user.username };

    return next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Middleware to check if the authenticated user is an admin.
 * Must be used after isAuthenticated middleware.
 */
export const isAdmin = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] || req.body.userId;
    
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No user ID provided" });
    }

    // Import User model to check admin status
    const User = (await import("../models/User.js")).default;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!user.isAdmin) {
      return res
        .status(403)
        .json({ message: "Forbidden: Admin access required" });
    }

    next();
  } catch (error) {
    console.error("Admin check error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
