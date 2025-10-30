/**
 * Session Monitor
 * 
 * Periodically checks for users whose sessions have expired
 * and logs them to the audit system
 */

import User from "../models/User.js";
import { logAction } from "../middleware/auditLogger.js";

/**
 * Check for expired sessions and log them
 * A session is considered expired if:
 * - User has lastActivity
 * - lastActivity is older than SESSION_TIMEOUT (30 minutes)
 * - No logout recorded after that activity
 */
export async function checkExpiredSessions() {
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
  const now = new Date();
  const expiryThreshold = new Date(now.getTime() - SESSION_TIMEOUT);

  try {
    // Find users whose lastActivity is older than 30 minutes
    const users = await User.find({
      lastActivity: { $exists: true, $lt: expiryThreshold },
    });

    for (const user of users) {
      // Check if user has already been logged out after their last activity
      if (user.lastLogout && user.lastLogout >= user.lastActivity) {
        continue; // Skip - already logged out after last activity
      }

      // Calculate when the session actually expired
      const sessionExpiredAt = new Date(
        user.lastActivity.getTime() + SESSION_TIMEOUT
      );

      // Only log if we haven't already logged this expiry
      // (Check if session expired recently - within last check interval)
      const timeSinceExpiry = now.getTime() - sessionExpiredAt.getTime();
      
      // Only log if expired within the last check interval (avoid duplicate logs)
      if (timeSinceExpiry < 5 * 60 * 1000) { // Within last 5 minutes
        console.log(`Session expired for user: ${user.email} at ${sessionExpiredAt.toISOString()}`);

        // Log to audit system
        await logAction(
          "SESSION_EXPIRED",
          { ip: "system", headers: { "user-agent": "Session Monitor" } },
          {
            userId: user._id,
            email: user.email,
            username: user.username,
            details: "Session expired due to inactivity",
            lastActivity: user.lastActivity,
            expiredAt: sessionExpiredAt,
            result: "Session timeout",
            status: "INFO",
          }
        );

        // Update lastLogout to reflect the session expiry time
        user.lastLogout = sessionExpiredAt;
        await user.save();
      }
    }
  } catch (error) {
    console.error(" Error checking expired sessions:", error);
  }
}

/**
 * Start the session monitor
 * Checks every 5 minutes for expired sessions
 */
export function startSessionMonitor() {
  const CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes

  console.log("✓ Session monitor started (checking every 5 minutes)");

  // Run initial check after 1 minute
  setTimeout(() => {
    checkExpiredSessions();
  }, 60 * 1000);

  // Then run periodically
  setInterval(() => {
    checkExpiredSessions();
  }, CHECK_INTERVAL);
}
