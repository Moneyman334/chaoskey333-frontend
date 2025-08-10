const stripe = require('stripe');
const fs = require('fs');
const path = require('path');

// Store server start time for uptime calculation
const startTime = Date.now();

/**
 * Check Stripe API connectivity
 * @param {string} stripeSecretKey - Stripe secret key
 * @returns {Promise<object>} - Health check result
 */
async function checkStripeHealth(stripeSecretKey) {
  if (!stripeSecretKey) {
    return {
      status: 'disabled',
      message: 'Stripe secret key not configured',
      responseTime: 0,
      service: 'stripe'
    };
  }

  const start = Date.now();
  try {
    const stripeClient = stripe(stripeSecretKey);
    await stripeClient.accounts.retrieve();
    
    return {
      status: 'healthy',
      responseTime: Date.now() - start,
      service: 'stripe'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      responseTime: Date.now() - start,
      service: 'stripe'
    };
  }
}

/**
 * Get application version from package.json
 * @returns {string} - Application version
 */
function getAppVersion() {
  try {
    const packagePath = path.join(__dirname, '..', 'package.json');
    const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    return packageData.version || 'unknown';
  } catch (error) {
    return 'unknown';
  }
}

/**
 * Get last deploy timestamp (using package.json mtime as proxy)
 * @returns {string} - Last deploy timestamp
 */
function getLastDeployTime() {
  try {
    const packagePath = path.join(__dirname, '..', 'package.json');
    const stats = fs.statSync(packagePath);
    return stats.mtime.toISOString();
  } catch (error) {
    return 'unknown';
  }
}

/**
 * Get server uptime in seconds
 * @returns {number} - Uptime in seconds
 */
function getUptime() {
  return Math.floor((Date.now() - startTime) / 1000);
}

/**
 * Perform comprehensive health check
 * @param {string} stripeSecretKey - Stripe secret key
 * @returns {Promise<object>} - Complete health check result
 */
async function performHealthCheck(stripeSecretKey) {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: getUptime(),
    version: getAppVersion(),
    lastDeploy: getLastDeployTime(),
    dependencies: {}
  };

  // Check Stripe connectivity
  const stripeHealth = await checkStripeHealth(stripeSecretKey);
  healthCheck.dependencies.stripe = stripeHealth;

  // Overall health status based on critical dependencies
  if (stripeHealth.status === 'unhealthy') {
    healthCheck.status = 'degraded';
  }
  // Note: 'disabled' status for Stripe doesn't affect overall health

  return healthCheck;
}

/**
 * Log error to monitoring service (placeholder for actual implementation)
 * @param {string} service - Service name
 * @param {Error} error - Error object
 * @param {object} context - Additional context
 */
function logError(service, error, context = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    service,
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    },
    context
  };

  // For now, log to console. In production, this would integrate with
  // monitoring services like DataDog, New Relic, Sentry, etc.
  console.error('🚨 Error logged:', JSON.stringify(logEntry, null, 2));
  
  // TODO: Integrate with actual monitoring service
  // Examples:
  // - Sentry.captureException(error, { extra: context })
  // - Winston logger with external transport
  // - HTTP POST to monitoring webhook
}

module.exports = {
  checkStripeHealth,
  getAppVersion,
  getLastDeployTime,
  getUptime,
  performHealthCheck,
  logError
};