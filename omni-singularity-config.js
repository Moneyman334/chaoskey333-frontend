// Omni-Singularity Architecture Configuration
// Cosmic Replay Terminal v2.0 - Ascension Edition

// Environment variable handler with fallbacks
function getEnvVar(name, defaultValue = null) {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[name] || defaultValue;
  }
  return defaultValue;
}

// Feature Flags Configuration
export const OMNI_SINGULARITY_CONFIG = {
  // Replay System Configuration
  REPLAY_RECURSIVE: getEnvVar('NEXT_PUBLIC_REPLAY_RECURSIVE', 'off') === 'on',
  REPLAY_RATE_LIMIT: parseInt(getEnvVar('NEXT_PUBLIC_REPLAY_RATE_LIMIT', '60')) * 1000, // Convert to milliseconds
  REPLAY_RETENTION: getEnvVar('NEXT_PUBLIC_REPLAY_RETENTION', '30d'),
  
  // Circuit Configuration
  CIRCUIT_LINKING_ENABLED: true,
  VAULT_BROADCAST_PULSE_INTERVAL: 2000, // 2 seconds
  SPECTRAL_DECODE_SYNC_RATE: 1500, // 1.5 seconds
  
  // Map Configuration
  RELAY_NODE_COUNT: 7, // Number of glowing relay nodes
  RELAY_GLOW_INTENSITY: 'high',
  MAP_UPDATE_FREQUENCY: 5000, // 5 seconds
  
  // Glyph Override System
  CHAOSKEY_GLYPH_OVERRIDE_ENABLED: true,
  GLYPH_DETECTION_THRESHOLD: 3, // Minimum glyph activations for override
  LIVE_REPLAY_PUSH_TIMEOUT: 1000, // 1 second immediate push
  
  // Evolution Hooks
  ASCENSION_PATHWAY_ENABLED: true,
  RELIC_MUTATION_ARCHIVE_ENABLED: true,
  PR24_INTEGRATION_ENABLED: true
};

// Replay Event Types
export const REPLAY_EVENT_TYPES = {
  VAULT_BROADCAST: 'vault_broadcast',
  RELIC_MUTATION: 'relic_mutation',
  GLYPH_ACTIVATION: 'glyph_activation',
  ASCENSION_PATHWAY: 'ascension_pathway',
  SPECTRAL_DECODE: 'spectral_decode',
  LIVE_REPLAY_OVERRIDE: 'live_replay_override'
};

// Rate Limiting Controller
export class ReplayRateLimiter {
  constructor() {
    this.lastReplayTime = 0;
    this.replayCount = 0;
  }
  
  canReplay() {
    const now = Date.now();
    const timeSinceLastReplay = now - this.lastReplayTime;
    
    if (timeSinceLastReplay >= OMNI_SINGULARITY_CONFIG.REPLAY_RATE_LIMIT) {
      this.lastReplayTime = now;
      this.replayCount++;
      return true;
    }
    
    return false;
  }
  
  getNextReplayTime() {
    const now = Date.now();
    const timeSinceLastReplay = now - this.lastReplayTime;
    const timeUntilNext = OMNI_SINGULARITY_CONFIG.REPLAY_RATE_LIMIT - timeSinceLastReplay;
    return Math.max(0, timeUntilNext);
  }
}

// Storage utility for replay retention
export class ReplayStorage {
  constructor() {
    this.storageKey = 'omni_singularity_replays';
  }
  
  storeReplayEvent(eventType, data) {
    try {
      const replays = this.getStoredReplays();
      const event = {
        id: this.generateEventId(),
        type: eventType,
        data: data,
        timestamp: Date.now(),
        retention: OMNI_SINGULARITY_CONFIG.REPLAY_RETENTION
      };
      
      replays.push(event);
      this.cleanupExpiredEvents(replays);
      
      localStorage.setItem(this.storageKey, JSON.stringify(replays));
      console.log(`🌀 Replay event stored: ${eventType}`, event);
      
      return event.id;
    } catch (error) {
      console.error('❌ Failed to store replay event:', error);
      return null;
    }
  }
  
  getStoredReplays() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ Failed to retrieve stored replays:', error);
      return [];
    }
  }
  
  cleanupExpiredEvents(replays) {
    const now = Date.now();
    const retentionMs = this.parseRetentionToMs(OMNI_SINGULARITY_CONFIG.REPLAY_RETENTION);
    
    return replays.filter(event => {
      const eventAge = now - event.timestamp;
      return eventAge < retentionMs;
    });
  }
  
  parseRetentionToMs(retention) {
    const match = retention.match(/(\d+)([dhm])/);
    if (!match) return 30 * 24 * 60 * 60 * 1000; // Default 30 days
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
      case 'd': return value * 24 * 60 * 60 * 1000; // days
      case 'h': return value * 60 * 60 * 1000; // hours
      case 'm': return value * 60 * 1000; // minutes
      default: return 30 * 24 * 60 * 60 * 1000; // Default 30 days
    }
  }
  
  generateEventId() {
    return 'replay_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

// Console logging with Omni-Singularity branding
export function omniLog(message, type = 'info', data = null) {
  const prefix = '🌀 OMNI-SINGULARITY';
  const timestamp = new Date().toISOString().substr(11, 12);
  
  switch (type) {
    case 'error':
      console.error(`${prefix} [${timestamp}] ❌ ${message}`, data);
      break;
    case 'warn':
      console.warn(`${prefix} [${timestamp}] ⚠️ ${message}`, data);
      break;
    case 'success':
      console.log(`${prefix} [${timestamp}] ✅ ${message}`, data);
      break;
    default:
      console.log(`${prefix} [${timestamp}] 🔮 ${message}`, data);
  }
}