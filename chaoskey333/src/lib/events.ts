import { kv } from '@vercel/kv';

export interface Event {
  id: string;
  type: string;
  payload: any;
  actor: string;
  timestamp: number;
  metadata?: {
    ip?: string;
    userAgent?: string;
    sessionId?: string;
  };
}

export interface EventLogEntry extends Event {
  sequence: number;
}

const EVENT_COUNTER_KEY = 'events:counter';
const EVENT_KEY_PREFIX = 'events:log:';

export async function logEvent(eventData: Omit<Event, 'id'>): Promise<string> {
  try {
    // Generate unique event ID and sequence number
    const sequence = await getNextSequence();
    const eventId = `${eventData.timestamp}-${sequence}`;
    
    const event: EventLogEntry = {
      id: eventId,
      sequence,
      ...eventData
    };

    // Store the event
    const eventKey = `${EVENT_KEY_PREFIX}${eventId}`;
    await kv.set(eventKey, event);
    
    // Add to sequence index for efficient querying
    await kv.zadd('events:sequence', { score: sequence, member: eventId });
    
    // Add to type index for filtering
    await kv.sadd(`events:type:${eventData.type}`, eventId);
    
    // Add to actor index
    await kv.sadd(`events:actor:${eventData.actor}`, eventId);
    
    // Add to time-based index (by hour for efficient cleanup)
    const hourKey = Math.floor(eventData.timestamp / (1000 * 60 * 60));
    await kv.sadd(`events:time:${hourKey}`, eventId);
    
    console.log(`Event logged: ${eventId} - ${eventData.type}`);
    return eventId;
    
  } catch (error) {
    console.error('Failed to log event:', error);
    throw error;
  }
}

export async function getEvents(
  options: {
    since?: number;
    limit?: number;
    type?: string;
    actor?: string;
    beforeSequence?: number;
    afterSequence?: number;
  } = {}
): Promise<EventLogEntry[]> {
  try {
    const { 
      since, 
      limit = 50, 
      type, 
      actor, 
      beforeSequence, 
      afterSequence 
    } = options;

    let eventIds: string[] = [];

    if (type) {
      // Get events by type
      eventIds = await kv.smembers(`events:type:${type}`);
    } else if (actor) {
      // Get events by actor
      eventIds = await kv.smembers(`events:actor:${actor}`);
    } else {
      // Get events by sequence range using zrange instead
      if (beforeSequence || afterSequence) {
        const min = afterSequence || 0;
        const max = beforeSequence || -1;
        
        if (max === -1) {
          eventIds = await kv.zrange('events:sequence', min, -1);
        } else {
          // Get all and filter manually for now
          const allIds = await kv.zrange('events:sequence', 0, -1, { withScores: true });
          eventIds = [];
          
          for (let i = 0; i < allIds.length; i += 2) {
            const id = allIds[i] as string;
            const score = allIds[i + 1] as number;
            if (score > min && (max === -1 || score < max)) {
              eventIds.push(id);
            }
          }
        }
      } else {
        // Get latest events
        eventIds = await kv.zrange('events:sequence', -limit, -1);
      }
    }

    // Fetch event details
    const events: EventLogEntry[] = [];
    
    for (const eventId of eventIds.slice(0, limit)) {
      const event = await kv.get(`${EVENT_KEY_PREFIX}${eventId}`) as EventLogEntry;
      if (event) {
        // Filter by timestamp if since is provided
        if (!since || event.timestamp >= since) {
          events.push(event);
        }
      }
    }

    // Sort by sequence number (newest first)
    events.sort((a, b) => b.sequence - a.sequence);
    
    return events.slice(0, limit);
    
  } catch (error) {
    console.error('Failed to get events:', error);
    return [];
  }
}

export async function getEventsSince(timestamp: number, limit: number = 50): Promise<EventLogEntry[]> {
  return getEvents({ since: timestamp, limit });
}

export async function getEventsByType(type: string, limit: number = 50): Promise<EventLogEntry[]> {
  return getEvents({ type, limit });
}

export async function getEventsByActor(actor: string, limit: number = 50): Promise<EventLogEntry[]> {
  return getEvents({ actor, limit });
}

export async function getLatestEvents(limit: number = 50): Promise<EventLogEntry[]> {
  return getEvents({ limit });
}

export async function getEventById(eventId: string): Promise<EventLogEntry | null> {
  try {
    const event = await kv.get(`${EVENT_KEY_PREFIX}${eventId}`) as EventLogEntry;
    return event || null;
  } catch (error) {
    console.error('Failed to get event by ID:', error);
    return null;
  }
}

export async function getEventStats(): Promise<{
  totalEvents: number;
  latestSequence: number;
  eventTypes: Record<string, number>;
  recentActivity: { hour: number; count: number }[];
}> {
  try {
    const latestSequence = await getLatestSequence();
    
    // Get recent activity by hour (last 24 hours)
    const now = Date.now();
    const recentActivity: { hour: number; count: number }[] = [];
    
    for (let i = 0; i < 24; i++) {
      const hourTimestamp = now - (i * 60 * 60 * 1000);
      const hourKey = Math.floor(hourTimestamp / (1000 * 60 * 60));
      const count = await kv.scard(`events:time:${hourKey}`);
      recentActivity.push({ hour: hourKey, count });
    }

    // Get event type statistics
    const allEventIds = await kv.zrange('events:sequence', 0, -1);
    const eventTypes: Record<string, number> = {};
    
    for (const eventId of allEventIds.slice(-1000)) { // Last 1000 events for stats
      const event = await kv.get(`${EVENT_KEY_PREFIX}${eventId}`) as EventLogEntry;
      if (event) {
        eventTypes[event.type] = (eventTypes[event.type] || 0) + 1;
      }
    }

    return {
      totalEvents: latestSequence,
      latestSequence,
      eventTypes,
      recentActivity: recentActivity.reverse()
    };
    
  } catch (error) {
    console.error('Failed to get event stats:', error);
    return {
      totalEvents: 0,
      latestSequence: 0,
      eventTypes: {},
      recentActivity: []
    };
  }
}

async function getNextSequence(): Promise<number> {
  try {
    const sequence = await kv.incr(EVENT_COUNTER_KEY);
    return sequence;
  } catch (error) {
    console.error('Failed to get next sequence:', error);
    // Fallback to timestamp-based sequence
    return Date.now();
  }
}

async function getLatestSequence(): Promise<number> {
  try {
    const sequence = await kv.get(EVENT_COUNTER_KEY) as number;
    return sequence || 0;
  } catch (error) {
    console.error('Failed to get latest sequence:', error);
    return 0;
  }
}

// Cleanup old events (should be run periodically)
export async function cleanupOldEvents(olderThanHours: number = 24 * 30): Promise<number> {
  try {
    const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);
    const cutoffHour = Math.floor(cutoffTime / (1000 * 60 * 60));
    
    let deletedCount = 0;
    
    // Get time-based keys older than cutoff
    const hourKeys = await kv.keys(`events:time:*`);
    
    for (const hourKeyFull of hourKeys) {
      const hourMatch = hourKeyFull.match(/events:time:(\d+)/);
      if (hourMatch) {
        const hour = parseInt(hourMatch[1]);
        if (hour < cutoffHour) {
          const eventIds = await kv.smembers(hourKeyFull);
          
          // Delete individual events
          for (const eventId of eventIds) {
            await kv.del(`${EVENT_KEY_PREFIX}${eventId}`);
            await kv.zrem('events:sequence', eventId);
            deletedCount++;
          }
          
          // Delete the hour key
          await kv.del(hourKeyFull);
        }
      }
    }
    
    console.log(`Cleaned up ${deletedCount} old events`);
    return deletedCount;
    
  } catch (error) {
    console.error('Failed to cleanup old events:', error);
    return 0;
  }
}