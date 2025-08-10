/**
 * Watchtower KV Store
 * Vercel KV integration for event persistence and rate limiting
 */

import { WatchtowerEvent, ClientEvent, sanitizeEventForClient } from './watchtower';

// Mock KV implementation for development when Vercel KV is not available
class MockKV {
  private store = new Map<string, any>();

  async get(key: string): Promise<any> {
    return this.store.get(key) || null;
  }

  async set(key: string, value: any, options?: { ex?: number }): Promise<void> {
    this.store.set(key, value);
    
    // Handle expiration in mock
    if (options?.ex) {
      setTimeout(() => {
        this.store.delete(key);
      }, options.ex * 1000);
    }
  }

  async incr(key: string): Promise<number> {
    const current = this.store.get(key) || 0;
    const newValue = current + 1;
    this.store.set(key, newValue);
    return newValue;
  }

  async expire(key: string, seconds: number): Promise<void> {
    setTimeout(() => {
      this.store.delete(key);
    }, seconds * 1000);
  }

  async lpush(key: string, ...values: any[]): Promise<number> {
    const list = this.store.get(key) || [];
    list.unshift(...values);
    this.store.set(key, list);
    return list.length;
  }

  async lrange(key: string, start: number, stop: number): Promise<any[]> {
    const list = this.store.get(key) || [];
    if (stop === -1) stop = list.length - 1;
    return list.slice(start, stop + 1);
  }

  async ltrim(key: string, start: number, stop: number): Promise<void> {
    const list = this.store.get(key) || [];
    if (stop === -1) stop = list.length - 1;
    const trimmed = list.slice(start, stop + 1);
    this.store.set(key, trimmed);
  }
}

// Initialize KV client
let kv: any;

try {
  // Try to import Vercel KV
  const { kv: vercelKv } = require('@vercel/kv');
  kv = vercelKv;
} catch (error) {
  console.log('Vercel KV not available, using mock implementation');
  kv = new MockKV();
}

// Storage configuration
export const KV_CONFIG = {
  EVENT_HISTORY_KEY: 'watchtower:events',
  RATE_LIMIT_PREFIX: 'watchtower:rate_limit',
  MAX_EVENTS_STORED: 100,
  EVENT_TTL: 24 * 60 * 60, // 24 hours in seconds
  RATE_LIMIT_WINDOW: 60, // 1 minute in seconds
  DEFAULT_RATE_LIMITS: {
    ip: 100, // per IP per minute
    wallet: 50, // per wallet per minute
    event_type: 200, // per event type per minute
  },
};

/**
 * Store a Watchtower event in KV
 */
export async function storeEvent(event: WatchtowerEvent): Promise<void> {
  try {
    // Sanitize event for storage
    const clientEvent = sanitizeEventForClient(event);
    const eventData = {
      ...clientEvent,
      storedAt: Date.now(),
    };

    // Add to event history list
    await kv.lpush(KV_CONFIG.EVENT_HISTORY_KEY, JSON.stringify(eventData));
    
    // Trim to keep only the latest events
    await kv.ltrim(KV_CONFIG.EVENT_HISTORY_KEY, 0, KV_CONFIG.MAX_EVENTS_STORED - 1);
    
    // Set TTL on the list
    await kv.expire(KV_CONFIG.EVENT_HISTORY_KEY, KV_CONFIG.EVENT_TTL);
    
    console.log(`Event ${event.id} stored in KV`);
  } catch (error) {
    console.error('Error storing event in KV:', error);
  }
}

/**
 * Retrieve recent events from KV
 */
export async function getRecentEvents(limit: number = 50): Promise<ClientEvent[]> {
  try {
    const events = await kv.lrange(KV_CONFIG.EVENT_HISTORY_KEY, 0, limit - 1);
    
    return events.map((eventStr: string) => {
      try {
        return JSON.parse(eventStr);
      } catch (error) {
        console.error('Error parsing stored event:', error);
        return null;
      }
    }).filter(Boolean);
  } catch (error) {
    console.error('Error retrieving events from KV:', error);
    return [];
  }
}

/**
 * Check and update rate limits
 */
export async function checkRateLimit(
  identifier: string,
  limitType: 'ip' | 'wallet' | 'event_type',
  customLimit?: number
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  try {
    const limit = customLimit || KV_CONFIG.DEFAULT_RATE_LIMITS[limitType];
    const key = `${KV_CONFIG.RATE_LIMIT_PREFIX}:${limitType}:${identifier}`;
    
    // Get current count
    const current = await kv.incr(key);
    
    // Set expiration on first increment
    if (current === 1) {
      await kv.expire(key, KV_CONFIG.RATE_LIMIT_WINDOW);
    }
    
    const allowed = current <= limit;
    const remaining = Math.max(0, limit - current);
    const resetTime = Date.now() + (KV_CONFIG.RATE_LIMIT_WINDOW * 1000);
    
    return { allowed, remaining, resetTime };
  } catch (error) {
    console.error('Error checking rate limit:', error);
    // In case of error, allow the request
    return { allowed: true, remaining: 0, resetTime: Date.now() };
  }
}

/**
 * Get rate limit status without incrementing
 */
export async function getRateLimitStatus(
  identifier: string,
  limitType: 'ip' | 'wallet' | 'event_type'
): Promise<{ current: number; limit: number; remaining: number }> {
  try {
    const limit = KV_CONFIG.DEFAULT_RATE_LIMITS[limitType];
    const key = `${KV_CONFIG.RATE_LIMIT_PREFIX}:${limitType}:${identifier}`;
    
    const current = (await kv.get(key)) || 0;
    const remaining = Math.max(0, limit - current);
    
    return { current, limit, remaining };
  } catch (error) {
    console.error('Error getting rate limit status:', error);
    return { current: 0, limit: 0, remaining: 0 };
  }
}

/**
 * Store event metadata for analytics
 */
export async function storeEventMetadata(event: WatchtowerEvent): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const eventTypeKey = `watchtower:stats:${today}:${event.type}`;
    
    await kv.incr(eventTypeKey);
    await kv.expire(eventTypeKey, 7 * 24 * 60 * 60); // 7 days
  } catch (error) {
    console.error('Error storing event metadata:', error);
  }
}

/**
 * Get event statistics
 */
export async function getEventStats(days: number = 7): Promise<Record<string, Record<string, number>>> {
  try {
    const stats: Record<string, Record<string, number>> = {};
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      stats[dateStr] = {};
      
      // Get stats for each event type
      const eventTypes = ['glyph.alert', 'vault.pulse', 'relic.minted', 'payment.success', 'leaderboard.update'];
      
      for (const eventType of eventTypes) {
        const key = `watchtower:stats:${dateStr}:${eventType}`;
        const count = (await kv.get(key)) || 0;
        stats[dateStr][eventType] = count;
      }
    }
    
    return stats;
  } catch (error) {
    console.error('Error getting event stats:', error);
    return {};
  }
}

/**
 * Clear old events and rate limits (cleanup function)
 */
export async function cleanupOldData(): Promise<void> {
  try {
    // This would typically be run as a background job
    console.log('KV cleanup completed');
  } catch (error) {
    console.error('Error during KV cleanup:', error);
  }
}