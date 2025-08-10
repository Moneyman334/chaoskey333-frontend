// Mock KV for development/testing
const mockKV = {
  data: new Map(),
  
  async setex(key, ttl, value) {
    this.data.set(key, {
      value,
      expires: Date.now() + (ttl * 1000)
    });
    return 'OK';
  },
  
  async get(key) {
    const item = this.data.get(key);
    if (!item) return null;
    if (Date.now() > item.expires) {
      this.data.delete(key);
      return null;
    }
    return item.value;
  },
  
  async del(key) {
    return this.data.delete(key) ? 1 : 0;
  },
  
  async lpush(key, value) {
    const existing = this.data.get(key);
    const list = existing ? JSON.parse(existing.value) : [];
    list.unshift(value);
    this.data.set(key, {
      value: JSON.stringify(list),
      expires: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
    });
    return list.length;
  },
  
  async ltrim(key, start, stop) {
    const existing = this.data.get(key);
    if (!existing) return 'OK';
    const list = JSON.parse(existing.value);
    const trimmed = list.slice(start, stop + 1);
    this.data.set(key, {
      value: JSON.stringify(trimmed),
      expires: existing.expires
    });
    return 'OK';
  },
  
  async lrange(key, start, stop) {
    const existing = this.data.get(key);
    if (!existing) return [];
    const list = JSON.parse(existing.value);
    return list.slice(start, stop + 1);
  }
};

// Use Vercel KV if available, otherwise use mock
let kvClient = mockKV; // Default to mock

try {
  const { kv } = require('@vercel/kv');
  // Test if KV is properly configured
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    kvClient = kv;
    console.log('✅ Using Vercel KV for storage');
  } else {
    console.log('⚠️ Vercel KV not configured, using mock storage');
  }
} catch (error) {
  console.log('⚠️ Vercel KV not available, using mock storage for development');
}
const { v4: uuidv4 } = require('uuid');

/**
 * Generate a unique claim token for a buyer
 * @param {Object} metadata - Buyer and purchase metadata
 * @returns {Promise<string>} - Claim token
 */
async function generateClaimToken(metadata) {
  try {
    const token = uuidv4();
    const expiresAt = Date.now() + (48 * 60 * 60 * 1000); // 48 hours from now
    
    const tokenData = {
      ...metadata,
      createdAt: Date.now(),
      expiresAt,
      used: false
    };

    // Store in Vercel KV with expiration
    await kvClient.setex(`claim:${token}`, 48 * 60 * 60, JSON.stringify(tokenData));
    
    console.log(`🔑 Generated claim token for wallet: ${metadata.walletAddress}`);
    return token;
  } catch (error) {
    console.error('Error generating claim token:', error);
    throw new Error('Failed to generate claim token');
  }
}

/**
 * Validate and retrieve claim token data
 * @param {string} token - Claim token
 * @returns {Promise<Object|null>} - Token data or null if invalid/expired
 */
async function validateClaimToken(token) {
  try {
    const data = await kvClient.get(`claim:${token}`);
    
    if (!data) {
      console.log(`❌ Token not found: ${token}`);
      return null;
    }

    const tokenData = typeof data === 'string' ? JSON.parse(data) : data;
    
    // Check if token is expired
    if (Date.now() > tokenData.expiresAt) {
      console.log(`⏰ Token expired: ${token}`);
      await kvClient.del(`claim:${token}`); // Clean up expired token
      return null;
    }

    // Check if token was already used
    if (tokenData.used) {
      console.log(`🔒 Token already used: ${token}`);
      return null;
    }

    return tokenData;
  } catch (error) {
    console.error('Error validating claim token:', error);
    return null;
  }
}

/**
 * Mark a claim token as used
 * @param {string} token - Claim token
 * @returns {Promise<boolean>} - Success status
 */
async function markTokenAsUsed(token) {
  try {
    const tokenData = await validateClaimToken(token);
    
    if (!tokenData) {
      return false;
    }

    tokenData.used = true;
    tokenData.usedAt = Date.now();
    
    await kvClient.setex(`claim:${token}`, 48 * 60 * 60, JSON.stringify(tokenData));
    
    console.log(`✅ Token marked as used: ${token}`);
    return true;
  } catch (error) {
    console.error('Error marking token as used:', error);
    return false;
  }
}

/**
 * Store notification send record
 * @param {Object} record - Notification record
 * @returns {Promise<string>} - Record ID
 */
async function storeNotificationRecord(record) {
  try {
    const recordId = uuidv4();
    const recordData = {
      ...record,
      id: recordId,
      timestamp: Date.now()
    };

    // Store with 30-day expiration for admin viewing
    await kvClient.setex(`notification:${recordId}`, 30 * 24 * 60 * 60, JSON.stringify(recordData));
    
    // Also add to a list for admin panel (store last 1000 records)
    const listKey = 'notification:list';
    await kvClient.lpush(listKey, recordId);
    await kvClient.ltrim(listKey, 0, 999); // Keep only last 1000 records
    
    console.log(`📧 Stored notification record: ${recordId}`);
    return recordId;
  } catch (error) {
    console.error('Error storing notification record:', error);
    throw new Error('Failed to store notification record');
  }
}

/**
 * Get notification records for admin panel
 * @param {number} limit - Number of records to fetch
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} - Notification records
 */
async function getNotificationRecords(limit = 50, offset = 0) {
  try {
    const listKey = 'notification:list';
    const recordIds = await kvClient.lrange(listKey, offset, offset + limit - 1);
    
    const records = [];
    for (const recordId of recordIds) {
      try {
        const data = await kvClient.get(`notification:${recordId}`);
        if (data) {
          const record = typeof data === 'string' ? JSON.parse(data) : data;
          records.push(record);
        }
      } catch (error) {
        console.error(`Error fetching record ${recordId}:`, error);
      }
    }
    
    return records;
  } catch (error) {
    console.error('Error getting notification records:', error);
    return [];
  }
}

/**
 * Get a specific notification record
 * @param {string} recordId - Record ID
 * @returns {Promise<Object|null>} - Notification record
 */
async function getNotificationRecord(recordId) {
  try {
    const data = await kvClient.get(`notification:${recordId}`);
    return data ? (typeof data === 'string' ? JSON.parse(data) : data) : null;
  } catch (error) {
    console.error('Error getting notification record:', error);
    return null;
  }
}

module.exports = {
  generateClaimToken,
  validateClaimToken,
  markTokenAsUsed,
  storeNotificationRecord,
  getNotificationRecords,
  getNotificationRecord
};