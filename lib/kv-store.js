/**
 * Simple Key-Value store for audit logs and data persistence
 * In production, this would be replaced with Vercel KV or similar
 */

const fs = require('fs').promises;
const path = require('path');

class KVStore {
  constructor(storePath = './data') {
    this.storePath = storePath;
    this.ensureStorePath();
  }

  async ensureStorePath() {
    try {
      await fs.mkdir(this.storePath, { recursive: true });
    } catch (error) {
      console.error('Failed to create store path:', error);
    }
  }

  getFilePath(key) {
    return path.join(this.storePath, `${key}.json`);
  }

  async set(key, value) {
    try {
      const data = {
        value,
        timestamp: new Date().toISOString(),
        type: typeof value
      };
      await fs.writeFile(this.getFilePath(key), JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`KV Store: Failed to set ${key}:`, error);
      return false;
    }
  }

  async get(key) {
    try {
      const data = await fs.readFile(this.getFilePath(key), 'utf8');
      const parsed = JSON.parse(data);
      return parsed.value;
    } catch (error) {
      // Key doesn't exist or other error
      return null;
    }
  }

  async append(key, value) {
    try {
      let existing = await this.get(key) || [];
      if (!Array.isArray(existing)) {
        existing = [existing];
      }
      existing.push({
        ...value,
        timestamp: new Date().toISOString()
      });
      return await this.set(key, existing);
    } catch (error) {
      console.error(`KV Store: Failed to append to ${key}:`, error);
      return false;
    }
  }

  async exists(key) {
    try {
      await fs.access(this.getFilePath(key));
      return true;
    } catch {
      return false;
    }
  }

  async delete(key) {
    try {
      await fs.unlink(this.getFilePath(key));
      return true;
    } catch (error) {
      console.error(`KV Store: Failed to delete ${key}:`, error);
      return false;
    }
  }

  // Specific methods for different data types
  async logOrder(orderId, orderData) {
    return await this.set(`order:${orderId}`, orderData);
  }

  async getOrder(orderId) {
    return await this.get(`order:${orderId}`);
  }

  async logConversion(conversionId, conversionData) {
    return await this.set(`conversion:${conversionId}`, conversionData);
  }

  async getConversion(conversionId) {
    return await this.get(`conversion:${conversionId}`);
  }

  async setVipFlag(orderId, vipData) {
    return await this.set(`vip:${orderId}`, vipData);
  }

  async getVipFlag(orderId) {
    return await this.get(`vip:${orderId}`);
  }

  async logEvent(eventType, eventData) {
    const eventId = `${eventType}:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    return await this.append('events', {
      id: eventId,
      type: eventType,
      data: eventData
    });
  }

  async getEvents() {
    return await this.get('events') || [];
  }

  // Idempotency lock methods
  async acquireLock(lockKey, ttlMs = 300000) { // 5 minutes default
    const lockData = {
      acquired: new Date().toISOString(),
      expires: new Date(Date.now() + ttlMs).toISOString(),
      ttlMs
    };
    
    if (await this.exists(`lock:${lockKey}`)) {
      const existing = await this.get(`lock:${lockKey}`);
      if (new Date(existing.expires) > new Date()) {
        return false; // Lock still active
      }
    }
    
    return await this.set(`lock:${lockKey}`, lockData);
  }

  async releaseLock(lockKey) {
    return await this.delete(`lock:${lockKey}`);
  }

  async isLocked(lockKey) {
    if (!await this.exists(`lock:${lockKey}`)) {
      return false;
    }
    
    const lockData = await this.get(`lock:${lockKey}`);
    return new Date(lockData.expires) > new Date();
  }
}

// Export singleton instance
const kvStore = new KVStore();

module.exports = kvStore;