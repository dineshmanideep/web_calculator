import AuditLog from '../models/AuditLog.js';
import { parseUserAgent } from '../utils/deviceParser.js';

/**
 * Middleware to log user actions to the audit log
 */
export const auditLogger = (action) => {
  return async (req, res, next) => {
    // Store original res.json to intercept response
    const originalJson = res.json.bind(res);
    
    res.json = function (data) {
      // Log the action after response
      setImmediate(async () => {
        try {
          const deviceInfo = parseUserAgent(req.headers['user-agent']);
          
          const logData = {
            userId: req.session?.user?.id || null,
            username: req.session?.user?.username || req.body?.username || 'Anonymous',
            email: req.session?.user?.email || req.body?.email || req.body?.emailOrUsername || null,
            action: action,
            details: JSON.stringify(req.body),
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            deviceType: deviceInfo.deviceType,
            browser: deviceInfo.browser,
            os: deviceInfo.os,
            status: res.statusCode >= 200 && res.statusCode < 300 ? 'SUCCESS' : 'FAILED',
            errorMessage: data.message && res.statusCode >= 400 ? data.message : null
          };

          // Special handling for calculations
          if (action === 'CALCULATION' && req.body) {
            logData.input = req.body.expression;
            logData.result = data.result || data.message;
          }

          await AuditLog.create(logData);
        } catch (error) {
          console.error('Audit logging error:', error);
          // Don't fail the request if audit logging fails
        }
      });

      return originalJson(data);
    };

    next();
  };
};

/**
 * Helper function to manually log an action
 */
export const logAction = async (action, req, additionalData = {}) => {
  try {
    const deviceInfo = parseUserAgent(req.headers?.['user-agent']);
    
    const logData = {
      userId: req.session?.user?.id || null,
      username: req.session?.user?.username || additionalData.username || 'Anonymous',
      email: req.session?.user?.email || additionalData.email || null,
      action: action,
      details: additionalData.details || '',
      input: additionalData.input || null,
      result: additionalData.result || null,
      ipAddress: req.ip || req.connection?.remoteAddress || 'Unknown',
      userAgent: req.headers?.['user-agent'] || 'Unknown',
      deviceType: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      status: additionalData.status || 'SUCCESS',
      errorMessage: additionalData.errorMessage || null
    };

    await AuditLog.create(logData);
  } catch (error) {
    console.error('Manual audit logging error:', error);
  }
};
