import AuditLog from "../models/AuditLog.js";
import { parseUserAgent } from "../utils/deviceParser.js";
//Author:Dinesh Manideep
//Helper function to manually log an action
export const logAction = async (action, req, additionalData = {}) => {
  try {
    const deviceInfo = parseUserAgent(req.headers?.["user-agent"]);

    const logData = {
      // Prioritize additionalData for userId, username, email (important for LOGOUT)
      userId: additionalData.userId || req.session?.user?.id || null,
      username:
        additionalData.username || req.session?.user?.username || "Anonymous",
      email: additionalData.email || req.session?.user?.email || null,
      action,
      details: additionalData.details || "",
      input: additionalData.input || null,
      result: additionalData.result || null,
      ipAddress: req.ip || req.connection?.remoteAddress || "Unknown",
      userAgent: req.headers?.["user-agent"] || "Unknown",
      deviceType: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      status: additionalData.status || "SUCCESS",
      errorMessage: additionalData.errorMessage || null,
    };

    await AuditLog.create(logData);
  } catch (error) {
    console.error("Manual audit logging error:", error);
  }
};
