/**
 * Enhanced monitoring endpoints with security, observability, and safety features
 */

const express = require('express');
const { requireRole, createRateLimiter } = require('./security');
const { createAuditEntry, verifyHashChain } = require('./audit');

const router = express.Router();

// Rate limiter for monitoring endpoints
const monitoringRateLimit = createRateLimiter({
  windowMs: 60000, // 1 minute
  max: 60 // 60 requests per minute per IP
});

/**
 * Redact sensitive environment variables
 * @param {Object} env - Environment variables
 * @returns {Object} - Redacted environment variables
 */
function redactSensitiveEnv(env) {
  const sensitivePattern = /key|secret|token|password|private|auth|credential/i;
  const redacted = {};
  
  Object.keys(env).forEach(key => {
    if (sensitivePattern.test(key)) {
      redacted[key] = '***REDACTED***';
    } else {
      redacted[key] = env[key];
    }
  });
  
  return redacted;
}

/**
 * Enhanced /health endpoint with role-based access
 * - Public: Basic status only
 * - ops/admin: Full health details
 */
router.get('/health', monitoringRateLimit, async (req, res) => {
  const userRole = req.headers['x-api-role'] || 'public';
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
  
  try {
    // Create audit entry
    await createAuditEntry('health_check', {
      ip: clientIp,
      path: '/health',
      role: userRole,
      userAgent: req.headers['user-agent']
    });

    const startTime = process.hrtime();
    const uptime = process.uptime();
    const timestamp = new Date().toISOString();
    
    // Base health response (public)
    const healthData = {
      status: 'healthy',
      timestamp,
      uptime: Math.floor(uptime),
      version: process.env.npm_package_version || '1.0.0'
    };

    // Enhanced details for ops/admin roles
    if (userRole === 'ops' || userRole === 'admin') {
      const memUsage = process.memoryUsage();
      const endTime = process.hrtime(startTime);
      const responseTime = endTime[0] * 1000 + endTime[1] * 1e-6;

      healthData.details = {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: {
          used: Math.round(memUsage.heapUsed / 1024 / 1024),
          total: Math.round(memUsage.heapTotal / 1024 / 1024),
          external: Math.round(memUsage.external / 1024 / 1024)
        },
        responseTime: Math.round(responseTime * 100) / 100,
        pid: process.pid
      };

      // Additional admin-only details
      if (userRole === 'admin') {
        healthData.details.loadAverage = require('os').loadavg();
        healthData.details.freeMemory = Math.round(require('os').freemem() / 1024 / 1024);
        healthData.details.totalMemory = Math.round(require('os').totalmem() / 1024 / 1024);
      }
    }

    res.json(healthData);
    
  } catch (error) {
    console.error('[HEALTH] Error generating health check:', error.message);
    
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Health check failed',
      error: error.message
    });
  }
});

/**
 * Debug environment endpoint - Admin only with IP allowlist
 * Disabled by default unless ENABLE_DEBUG=true
 */
router.get('/debug/env', 
  monitoringRateLimit,
  requireRole('admin', { requireIpAllowlist: true }),
  async (req, res) => {
    // Check if debug endpoint is enabled
    if (process.env.ENABLE_DEBUG !== 'true') {
      return res.status(404).json({
        error: 'Not found',
        message: 'Debug endpoint is disabled',
        code: 'DEBUG_DISABLED'
      });
    }

    const clientIp = req.clientIp;
    const userRole = req.userRole;

    try {
      // Create audit entry
      await createAuditEntry('debug_access', {
        ip: clientIp,
        path: '/debug/env',
        role: userRole,
        userAgent: req.headers['user-agent']
      });

      // Verify hash chain integrity
      const hashVerification = await verifyHashChain(10);

      const debugData = {
        timestamp: new Date().toISOString(),
        server: {
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
          uptime: process.uptime(),
          pid: process.pid,
          cwd: process.cwd()
        },
        environment: redactSensitiveEnv(process.env),
        audit: {
          hashChain: hashVerification
        },
        request: {
          ip: clientIp,
          role: userRole,
          headers: {
            'user-agent': req.headers['user-agent'],
            'x-forwarded-for': req.headers['x-forwarded-for'],
            'x-real-ip': req.headers['x-real-ip']
          }
        }
      };

      res.json(debugData);

    } catch (error) {
      console.error('[DEBUG] Error generating debug info:', error.message);
      
      await createAuditEntry('debug_error', {
        ip: clientIp,
        path: '/debug/env',
        role: userRole,
        error: error.message
      });

      res.status(500).json({
        error: 'Debug endpoint error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * Audit logs endpoint - Admin only
 */
router.get('/debug/audit',
  monitoringRateLimit,
  requireRole('admin'),
  async (req, res) => {
    const clientIp = req.clientIp;
    const userRole = req.userRole;
    const count = parseInt(req.query.count) || 50;

    try {
      await createAuditEntry('audit_access', {
        ip: clientIp,
        path: '/debug/audit',
        role: userRole,
        count
      });

      const { getRecentLogs } = require('./audit');
      const logs = await getRecentLogs(Math.min(count, 100)); // Max 100 entries

      res.json({
        timestamp: new Date().toISOString(),
        count: logs.length,
        logs
      });

    } catch (error) {
      console.error('[AUDIT] Error retrieving audit logs:', error.message);
      res.status(500).json({
        error: 'Failed to retrieve audit logs',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
);

module.exports = router;