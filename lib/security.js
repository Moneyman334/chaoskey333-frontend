/**
 * Security middleware for RBAC, rate limiting, and anomaly detection
 * Supports both x-api-role headers and JWT Bearer tokens
 */

const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');

// Role hierarchy: admin > ops > read
const ROLES = {
  admin: 3,
  ops: 2,
  read: 1
};

// Environment configuration
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const ADMIN_ALLOWLIST = process.env.ADMIN_ALLOWLIST ? process.env.ADMIN_ALLOWLIST.split(',') : [];

/**
 * Extract role from request headers or JWT token
 * @param {Request} req - Express request object
 * @returns {string|null} - Role string or null if not found/invalid
 */
function extractRole(req) {
  // Check x-api-role header first
  const headerRole = req.headers['x-api-role'];
  if (headerRole && ROLES[headerRole.toLowerCase()]) {
    return headerRole.toLowerCase();
  }

  // Check JWT Bearer token
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.role && ROLES[decoded.role.toLowerCase()]) {
        return decoded.role.toLowerCase();
      }
    } catch (error) {
      console.warn('Invalid JWT token:', error.message);
    }
  }

  return null;
}

/**
 * Check if user has required role level
 * @param {string} userRole - User's role
 * @param {string} requiredRole - Required minimum role
 * @returns {boolean} - Whether user has required access
 */
function hasRole(userRole, requiredRole) {
  if (!userRole || !requiredRole) return false;
  return ROLES[userRole] >= ROLES[requiredRole];
}

/**
 * Check if IP is in admin allowlist
 * @param {string} ip - Client IP address
 * @returns {boolean} - Whether IP is allowlisted
 */
function isIpAllowlisted(ip) {
  if (ADMIN_ALLOWLIST.length === 0) return true; // No allowlist means open access
  return ADMIN_ALLOWLIST.includes(ip);
}

/**
 * RBAC middleware factory
 * @param {string} requiredRole - Minimum required role
 * @param {Object} options - Additional options
 * @returns {Function} - Express middleware
 */
function requireRole(requiredRole, options = {}) {
  return (req, res, next) => {
    const userRole = extractRole(req);
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';

    // Log access attempt
    console.log(`[RBAC] Access attempt to ${req.path} - IP: ${clientIp}, Role: ${userRole || 'none'}, Required: ${requiredRole}`);

    // Check IP allowlist if required
    if (options.requireIpAllowlist && !isIpAllowlisted(clientIp)) {
      console.warn(`[RBAC] IP not allowlisted: ${clientIp}`);
      return res.status(403).json({
        error: 'Access denied',
        message: 'IP address not allowlisted',
        code: 'IP_NOT_ALLOWLISTED'
      });
    }

    // Check role
    if (!hasRole(userRole, requiredRole)) {
      console.warn(`[RBAC] Insufficient role: ${userRole || 'none'} < ${requiredRole} for IP: ${clientIp}`);
      
      // Trigger anomaly alert for role mismatch
      triggerAnomalyAlert('role_mismatch', {
        ip: clientIp,
        userRole: userRole || 'none',
        requiredRole,
        path: req.path,
        timestamp: new Date().toISOString()
      });

      return res.status(403).json({
        error: 'Insufficient privileges',
        message: `Role '${requiredRole}' or higher required`,
        code: 'INSUFFICIENT_ROLE'
      });
    }

    // Store role in request for later use
    req.userRole = userRole;
    req.clientIp = clientIp;
    next();
  };
}

// Anomaly detection storage (in-memory for now, should use Redis/KV in production)
const anomalyTracker = new Map();

/**
 * Trigger anomaly alert
 * @param {string} type - Alert type
 * @param {Object} data - Alert data
 */
function triggerAnomalyAlert(type, data) {
  const alertKey = `${type}_${data.ip}`;
  const now = Date.now();
  
  if (!anomalyTracker.has(alertKey)) {
    anomalyTracker.set(alertKey, []);
  }
  
  const alerts = anomalyTracker.get(alertKey);
  alerts.push(now);
  
  // Keep only alerts from last 10 seconds
  const recentAlerts = alerts.filter(timestamp => now - timestamp < 10000);
  anomalyTracker.set(alertKey, recentAlerts);
  
  // Trigger webhook if 3+ alerts in 10 seconds
  if (recentAlerts.length >= 3) {
    sendWebhookAlert(type, data, recentAlerts.length);
    anomalyTracker.delete(alertKey); // Reset counter after alert
  }
}

/**
 * Send webhook alert for anomalies
 * @param {string} type - Alert type
 * @param {Object} data - Alert data
 * @param {number} count - Number of recent alerts
 */
async function sendWebhookAlert(type, data, count) {
  const webhookUrl = process.env.ANOMALY_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('[ANOMALY] No webhook URL configured, logging alert instead');
    console.error(`[ANOMALY ALERT] ${type.toUpperCase()}: ${count} events from IP ${data.ip} in 10 seconds`, data);
    return;
  }

  try {
    const payload = {
      text: `🚨 Security Anomaly Detected`,
      attachments: [{
        color: 'danger',
        fields: [
          { title: 'Type', value: type.replace('_', ' ').toUpperCase(), short: true },
          { title: 'IP Address', value: data.ip, short: true },
          { title: 'Count', value: `${count} events in 10 seconds`, short: true },
          { title: 'Path', value: data.path, short: true },
          { title: 'Time', value: data.timestamp, short: false }
        ]
      }]
    };

    // In a real implementation, you'd use fetch or axios here
    console.log('[WEBHOOK] Would send to:', webhookUrl, payload);
  } catch (error) {
    console.error('[WEBHOOK] Failed to send alert:', error.message);
  }
}

/**
 * Create sliding window rate limiter with anomaly detection
 * @param {Object} options - Rate limiting options
 * @returns {Function} - Express middleware
 */
function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || 60000; // 1 minute
  const max = options.max || 60; // 60 requests per minute
  
  const limiter = rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too many requests',
      message: 'Rate limit exceeded',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Configure trust proxy for proper IP detection
    trustProxy: 1, // Trust first proxy
    handler: (req, res, next) => {
      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
      
      // Trigger anomaly alert for rate limit hits
      triggerAnomalyAlert('rate_limit', {
        ip: clientIp,
        path: req.path,
        timestamp: new Date().toISOString()
      });
      
      res.status(429).json({
        error: 'Too many requests',
        message: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });

  return limiter;
}

module.exports = {
  extractRole,
  hasRole,
  isIpAllowlisted,
  requireRole,
  createRateLimiter,
  triggerAnomalyAlert,
  ROLES
};