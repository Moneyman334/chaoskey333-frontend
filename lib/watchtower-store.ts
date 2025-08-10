import { WatchtowerEvent } from './watchtower';

// KV storage interface for persistence
export interface WatchtowerStore {
  set(key: string, value: any, ttl?: number): Promise<void>;
  get(key: string): Promise<any>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  incr(key: string, ttl?: number): Promise<number>;
}

// In-memory implementation for development/fallback
export class MemoryWatchtowerStore implements WatchtowerStore {
  private store: Map<string, { value: any; expires?: number }> = new Map();

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const expires = ttl ? Date.now() + (ttl * 1000) : undefined;
    this.store.set(key, { value, expires });
  }

  async get(key: string): Promise<any> {
    const item = this.store.get(key);
    if (!item) return null;
    
    if (item.expires && Date.now() > item.expires) {
      this.store.delete(key);
      return null;
    }
    
    return item.value;
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    const item = this.store.get(key);
    if (!item) return false;
    
    if (item.expires && Date.now() > item.expires) {
      this.store.delete(key);
      return false;
    }
    
    return true;
  }

  async incr(key: string, ttl?: number): Promise<number> {
    const current = await this.get(key) || 0;
    const newValue = current + 1;
    await this.set(key, newValue, ttl);
    return newValue;
  }
}

// Vercel KV implementation for production
export class VercelKVWatchtowerStore implements WatchtowerStore {
  private kv: any;

  constructor() {
    // Use Vercel KV if available
    try {
      this.kv = require('@vercel/kv');
    } catch {
      console.warn('Vercel KV not available, falling back to memory store');
      throw new Error('Vercel KV not available');
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (ttl) {
      await this.kv.setex(key, ttl, JSON.stringify(value));
    } else {
      await this.kv.set(key, JSON.stringify(value));
    }
  }

  async get(key: string): Promise<any> {
    const value = await this.kv.get(key);
    return value ? JSON.parse(value) : null;
  }

  async del(key: string): Promise<void> {
    await this.kv.del(key);
  }

  async exists(key: string): Promise<boolean> {
    return !!(await this.kv.exists(key));
  }

  async incr(key: string, ttl?: number): Promise<number> {
    const result = await this.kv.incr(key);
    if (ttl) {
      await this.kv.expire(key, ttl);
    }
    return result;
  }
}

// Event persistence and rate limiting
export class WatchtowerEventStore {
  private store: WatchtowerStore;

  constructor(store?: WatchtowerStore) {
    this.store = store || this.createDefaultStore();
  }

  private createDefaultStore(): WatchtowerStore {
    try {
      return new VercelKVWatchtowerStore();
    } catch {
      return new MemoryWatchtowerStore();
    }
  }

  // Store event for replay/history
  async storeEvent(event: WatchtowerEvent): Promise<void> {
    const key = `event:${event.id}`;
    await this.store.set(key, event, 24 * 60 * 60); // 24 hour TTL
  }

  // Get event by ID
  async getEvent(eventId: string): Promise<WatchtowerEvent | null> {
    const key = `event:${eventId}`;
    return await this.store.get(key);
  }

  // Rate limiting for event emissions
  async checkRateLimit(identifier: string, limit: number, window: number): Promise<boolean> {
    const key = `rate:${identifier}`;
    const count = await this.store.incr(key, window);
    return count <= limit;
  }

  // Store recent events for replay to new subscribers
  async addToRecentEvents(event: WatchtowerEvent): Promise<void> {
    const recentKey = 'recent_events';
    const existing = await this.store.get(recentKey) || [];
    
    // Keep only last 100 events
    existing.push(event);
    if (existing.length > 100) {
      existing.shift();
    }
    
    await this.store.set(recentKey, existing, 60 * 60); // 1 hour TTL
  }

  // Get recent events for new subscribers
  async getRecentEvents(limit: number = 10): Promise<WatchtowerEvent[]> {
    const recentKey = 'recent_events';
    const events = await this.store.get(recentKey) || [];
    return events.slice(-limit);
  }

  // Store subscriber connection info
  async addSubscriber(subscriberId: string): Promise<void> {
    const key = `subscriber:${subscriberId}`;
    await this.store.set(key, { connected: Date.now() }, 60 * 60); // 1 hour TTL
  }

  // Remove subscriber
  async removeSubscriber(subscriberId: string): Promise<void> {
    const key = `subscriber:${subscriberId}`;
    await this.store.del(key);
  }

  // Get active subscriber count
  async getActiveSubscriberCount(): Promise<number> {
    // This is a simplified implementation
    // In production, you'd want to track this more efficiently
    return 0;
  }

  // Store pulse status for multi-channel sync
  async storePulseStatus(eventId: string, channel: string, status: 'pending' | 'sent' | 'failed'): Promise<void> {
    const key = `pulse:${eventId}:${channel}`;
    await this.store.set(key, { status, timestamp: Date.now() }, 60 * 60); // 1 hour TTL
  }

  // Get pulse status for all channels
  async getPulseStatus(eventId: string): Promise<Record<string, any>> {
    const channels = ['twitter', 'email', 'sms'];
    const status: Record<string, any> = {};
    
    for (const channel of channels) {
      const key = `pulse:${eventId}:${channel}`;
      status[channel] = await this.store.get(key);
    }
    
    return status;
  }
}

// Singleton instance
export const watchtowerStore = new WatchtowerEventStore();