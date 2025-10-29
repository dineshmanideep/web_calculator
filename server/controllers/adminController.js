/**
 * Admin Controller
 *
 * Handles administrative operations:
 * - Fetch audit logs with filtering and pagination
 * - Get audit statistics
 * - Manage users
 * - Get available action types
 */

import AuditLog from "../models/AuditLog.js";
import User from "../models/User.js";
import { logAction } from "../middleware/auditLogger.js";

/**
 * Get audit logs with filtering and pagination
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const getAuditLogs = async (req, res) => {
  try {
    // Log admin access
    await logAction("ADMIN_ACCESS", req, {
      details: "Accessed audit logs",
      status: "SUCCESS",
    });

    const {
      page = 1,
      limit = 50,
      action,
      userId,
      status,
      startDate,
      endDate,
      search,
    } = req.query;

    // Build filter query
    const filter = {};

    if (action) {
      filter.action = action;
    }

    if (userId) {
      filter.userId = userId;
    }

    if (status) {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        filter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.timestamp.$lte = new Date(endDate);
      }
    }

    // Search in username, email, or details
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { details: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    return res.status(200).json({
      logs,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / parseInt(limit, 10)),
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);

    // Log the failed access attempt
    await logAction("ADMIN_ACCESS", req, {
      details: "Failed to fetch audit logs",
      status: "ERROR",
      errorMessage: error.message,
    });

    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get audit log statistics
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const getStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) {
        dateFilter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.timestamp.$lte = new Date(endDate);
      }
    }

    const [totalLogs, actionStats, statusStats, recentActivity] =
      await Promise.all([
        AuditLog.countDocuments(dateFilter),
        AuditLog.aggregate([
          { $match: dateFilter },
          { $group: { _id: "$action", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        AuditLog.aggregate([
          { $match: dateFilter },
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
        AuditLog.find(dateFilter).sort({ timestamp: -1 }).limit(10).lean(),
      ]);

    return res.status(200).json({
      totalLogs,
      actionStats,
      statusStats,
      recentActivity,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get all users for admin management
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("-passwordHash -signupOtp -resetOtp")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get list of all available action types
 * Used for filter dropdowns in admin interface
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const getActions = async (req, res) => {
  try {
    const actions = [
      "LOGIN_SUCCESS",
      "LOGIN_FAILED",
      "LOGOUT",
      "SIGNUP",
      "SIGNUP_VERIFY",
      "PASSWORD_RESET_REQUEST",
      "PASSWORD_RESET_SUCCESS",
      "CALCULATION",
      "HISTORY_SAVE",
      "HISTORY_CLEAR",
      "ADMIN_ACCESS",
      "UNAUTHORIZED_ACCESS",
    ];

    return res.status(200).json({ actions });
  } catch (error) {
    console.error("Error fetching actions:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
