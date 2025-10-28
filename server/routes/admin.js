/**
 * Admin Routes
 *
 * Handles all administrative endpoints:
 * - Audit log management
 * - System statistics
 * - User management
 * - Action types listing
 */

import express from 'express';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';

// Import controllers
import {
  getAuditLogs,
  getStats,
  getUsers,
  getActions,
} from '../controllers/adminController.js';

const router = express.Router();

// All admin routes require authentication and admin privileges
router.get('/audit-logs', isAuthenticated, isAdmin, getAuditLogs);
router.get('/stats', isAuthenticated, isAdmin, getStats);
router.get('/users', isAuthenticated, isAdmin, getUsers);
router.get('/actions', isAuthenticated, isAdmin, getActions);

export default router;
