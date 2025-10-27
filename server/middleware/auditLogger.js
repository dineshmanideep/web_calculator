import AuditLog from '../models/AuditLog.js';
import { parseUserAgent } from '../utils/deviceParser.js';

/**
 * Middleware to log user actions to the audit log
 * Note: Calculations are handled in frontend, so this middleware focuses on auth/backend actions
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

          // Populate input/result for auth-related actions
          const isSuccess = res.statusCode >= 200 && res.statusCode < 300;
          
          switch(action) {
            case 'LOGIN_SUCCESS':
            case 'LOGIN_FAILED':
              logData.input = req.body?.emailOrUsername || req.body?.email || 'Unknown';
              logData.result = isSuccess ? 'Login successful' : (data.message || 'Login failed');
              break;
              
            case 'SIGNUP':
              logData.input = req.body?.email || 'Unknown';
              logData.result = isSuccess ? 'Signup successful - OTP sent' : (data.message || 'Signup failed');
              break;
              
            case 'SIGNUP_VERIFY':
              logData.input = req.body?.email || 'Unknown';
              logData.result = isSuccess ? 'Account verified successfully' : (data.message || 'Verification failed');
              break;
              
            case 'PASSWORD_RESET_REQUEST':
              logData.input = req.body?.email || 'Unknown';
              logData.result = isSuccess ? 'Reset OTP sent' : (data.message || 'Request failed');
              break;
              
            case 'PASSWORD_RESET_SUCCESS':
              logData.input = req.body?.email || 'Unknown';
              logData.result = isSuccess ? 'Password reset successful' : (data.message || 'Reset failed');
              break;
              
            case 'ADMIN_ACCESS':
              logData.input = req.originalUrl || req.path || 'Unknown route';
              logData.result = isSuccess ? 'Access granted' : 'Access denied';
              break;
              
            case 'UNAUTHORIZED_ACCESS':
              logData.input = req.originalUrl || req.path || 'Unknown route';
              logData.result = 'Unauthorized attempt';
              break;
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
      // Prioritize additionalData for userId, username, email (important for LOGOUT)
      userId: additionalData.userId || req.session?.user?.id || null,
      username: additionalData.username || req.session?.user?.username || 'Anonymous',
      email: additionalData.email || req.session?.user?.email || null,
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
