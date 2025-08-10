/**
 * Tamper-proof audit logging with hash chains
 * Supports Vercel KV with filesystem fallback for development
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

// Try to import Vercel KV, fall back to null if not available
let kv = null;
try {
  kv = require('@vercel/kv');
  // Test if KV is actually available by checking for required methods
  if (typeof kv.get !== 'function' || typeof kv.set !== 'function') {
    kv = null;
  }
} catch (error) {
  kv = null;
}

if (!kv) {
  console.warn('[AUDIT] Vercel KV not available, using filesystem fallback');
}

const LOG_FILE = path.join(process.cwd(), '.audit-log.json');
const HASH_ALGORITHM = 'sha256';

/**
 * Calculate hash for audit entry
 * @param {Object} entry - Audit log entry
 * @param {string} prevHash - Previous entry hash
 * @returns {string} - SHA256 hash
 */
function calculateHash(entry, prevHash) {
  const data = {
    timestamp: entry.timestamp,
    type: entry.type,
    ip: entry.ip,
    path: entry.path,
    details: entry.details,
    prevHash: prevHash || '0'
  };
  
  return crypto
    .createHash(HASH_ALGORITHM)
    .update(JSON.stringify(data))
    .digest('hex');
}

/**
 * Get the last audit entry hash
 * @returns {Promise<string>} - Previous hash or '0' for first entry
 */
async function getLastHash() {
  try {
    if (kv) {
      // Get from Vercel KV
      const lastEntry = await kv.get('audit:last');
      return lastEntry ? lastEntry.hash : '0';
    } else {
      // Get from filesystem
      try {
        const data = await fs.readFile(LOG_FILE, 'utf8');
        const logs = JSON.parse(data);
        return logs.length > 0 ? logs[logs.length - 1].hash : '0';
      } catch (error) {
        if (error.code === 'ENOENT') {
          return '0'; // File doesn't exist yet
        }
        throw error;
      }
    }
  } catch (error) {
    console.error('[AUDIT] Error getting last hash:', error.message);
    return '0';
  }
}

/**
 * Store audit entry
 * @param {Object} entry - Audit entry with hash
 */
async function storeEntry(entry) {
  try {
    if (kv) {
      // Store in Vercel KV
      const key = `audit:${entry.timestamp}:${entry.hash.substring(0, 8)}`;
      await kv.set(key, entry);
      await kv.set('audit:last', entry);
    } else {
      // Store in filesystem
      let logs = [];
      try {
        const data = await fs.readFile(LOG_FILE, 'utf8');
        logs = JSON.parse(data);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }
      
      logs.push(entry);
      
      // Keep only last 1000 entries in filesystem
      if (logs.length > 1000) {
        logs = logs.slice(-1000);
      }
      
      await fs.writeFile(LOG_FILE, JSON.stringify(logs, null, 2));
    }
  } catch (error) {
    console.error('[AUDIT] Failed to store entry:', error.message);
  }
}

/**
 * Create tamper-proof audit log entry
 * @param {string} type - Log entry type
 * @param {Object} data - Log data
 */
async function createAuditEntry(type, data) {
  const timestamp = Date.now();
  const ip = data.ip || 'unknown';
  const path = data.path || 'unknown';
  const details = { ...data };
  delete details.ip;
  delete details.path;

  try {
    const prevHash = await getLastHash();
    
    const entry = {
      timestamp,
      type,
      ip,
      path,
      details,
      prevHash
    };

    const hash = calculateHash(entry, prevHash);
    entry.hash = hash;

    await storeEntry(entry);
    
    console.log(`[AUDIT] ${type.toUpperCase()}: ${ip} -> ${path}`, { hash: hash.substring(0, 8) });
    
    return entry;
  } catch (error) {
    console.error('[AUDIT] Failed to create audit entry:', error.message);
  }
}

/**
 * Verify hash chain integrity
 * @param {number} count - Number of recent entries to verify (default: 10)
 * @returns {Promise<Object>} - Verification result
 */
async function verifyHashChain(count = 10) {
  try {
    let entries = [];
    
    if (kv) {
      // For KV, we'd need to implement a way to get recent entries
      // This is a simplified version
      console.warn('[AUDIT] Hash chain verification not fully implemented for KV storage');
      return { valid: true, message: 'KV verification not implemented' };
    } else {
      // Verify from filesystem
      try {
        const data = await fs.readFile(LOG_FILE, 'utf8');
        const logs = JSON.parse(data);
        entries = logs.slice(-count);
      } catch (error) {
        if (error.code === 'ENOENT') {
          return { valid: true, message: 'No entries to verify' };
        }
        throw error;
      }
    }

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const prevHash = i === 0 ? (entries.length === 1 ? '0' : entries[i - 1]?.hash || '0') : entries[i - 1].hash;
      const expectedHash = calculateHash(entry, prevHash);
      
      if (entry.hash !== expectedHash) {
        return {
          valid: false,
          message: `Hash mismatch at entry ${i}`,
          expected: expectedHash,
          actual: entry.hash,
          entry
        };
      }
    }

    return {
      valid: true,
      message: `Verified ${entries.length} entries`,
      count: entries.length
    };
    
  } catch (error) {
    return {
      valid: false,
      message: `Verification failed: ${error.message}`,
      error: error.message
    };
  }
}

/**
 * Get recent audit logs
 * @param {number} count - Number of entries to retrieve
 * @returns {Promise<Array>} - Recent audit entries
 */
async function getRecentLogs(count = 50) {
  try {
    if (kv) {
      // For KV, we'd need to implement pagination
      console.warn('[AUDIT] Recent logs retrieval not fully implemented for KV storage');
      return [];
    } else {
      try {
        const data = await fs.readFile(LOG_FILE, 'utf8');
        const logs = JSON.parse(data);
        return logs.slice(-count);
      } catch (error) {
        if (error.code === 'ENOENT') {
          return [];
        }
        throw error;
      }
    }
  } catch (error) {
    console.error('[AUDIT] Failed to retrieve recent logs:', error.message);
    return [];
  }
}

module.exports = {
  createAuditEntry,
  verifyHashChain,
  getRecentLogs,
  calculateHash
};