const ipRangeCheck = require('ip-range-check');

/**
 * Mask sensitive values in environment variables
 * @param {string} key - Environment variable key
 * @param {string} value - Environment variable value
 * @returns {string} - Masked value
 */
function maskSensitiveValue(key, value) {
  const sensitiveKeys = [
    'SECRET', 'KEY', 'TOKEN', 'PASSWORD', 'PASS', 'API_KEY', 
    'PRIVATE', 'STRIPE', 'AUTH', 'WEBHOOK', 'SIGNATURE'
  ];
  
  if (!value) return value;
  
  const keyUpper = key.toUpperCase();
  const isSensitive = sensitiveKeys.some(pattern => keyUpper.includes(pattern));
  
  if (isSensitive) {
    if (value.length <= 8) {
      return '***';
    }
    const visibleStart = Math.min(4, value.length - 4);
    const visibleEnd = Math.min(4, value.length - visibleStart);
    return value.substring(0, visibleStart) + 
           '*'.repeat(Math.max(3, value.length - visibleStart - visibleEnd)) + 
           value.substring(value.length - visibleEnd);
  }
  
  return value;
}

/**
 * Check if IP address is whitelisted
 * @param {string} ip - Client IP address
 * @param {string[]} whitelist - Array of whitelisted IPs/ranges
 * @returns {boolean} - True if IP is whitelisted
 */
function isIpWhitelisted(ip, whitelist = []) {
  if (!whitelist || whitelist.length === 0) {
    return false;
  }
  
  // Handle localhost and common development IPs
  const localIps = ['127.0.0.1', '::1', '::ffff:127.0.0.1', 'localhost'];
  if (localIps.includes(ip)) {
    return whitelist.includes('localhost') || whitelist.includes('127.0.0.1');
  }
  
  return whitelist.some(range => {
    try {
      return ipRangeCheck(ip, range);
    } catch (error) {
      console.error(`Invalid IP range in whitelist: ${range}`, error);
      return false;
    }
  });
}

/**
 * Get masked environment variables for debug endpoint
 * @returns {object} - Masked environment variables
 */
function getMaskedEnvVars() {
  const env = {};
  
  Object.keys(process.env).forEach(key => {
    env[key] = maskSensitiveValue(key, process.env[key]);
  });
  
  return env;
}

module.exports = {
  maskSensitiveValue,
  isIpWhitelisted,
  getMaskedEnvVars
};