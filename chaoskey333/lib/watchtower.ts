/**
 * Watchtower Signal Amplifier SDK
 * Lightweight event bus with HMAC signing for trusted emissions
 */

import { createHmac } from 'crypto';

// Watchtower event types
export type WatchtowerEventType = 
  | 'glyph.alert'
  | 'vault.pulse'
  | 'relic.minted'
  | 'payment.success'
  | 'leaderboard.update'
  | 'system.heartbeat';

// Core event structure
export interface WatchtowerEvent {
  id: string;
  type: WatchtowerEventType;
  timestamp: number;
  data: Record<string, any>;
  metadata?: {
    walletAddress?: string;
    amount?: number;
    sessionId?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
  };
}

// Signed event with HMAC verification
export interface SignedWatchtowerEvent extends WatchtowerEvent {
  signature: string;
}

// Event emission payload
export interface EventEmissionPayload {
  event: WatchtowerEvent;
  source: string; // identify the source service/component
}

// Client-safe event (shortened sensitive data)
export interface ClientEvent extends Omit<WatchtowerEvent, 'metadata'> {
  metadata?: {
    priority?: 'low' | 'medium' | 'high' | 'critical';
    // Sensitive fields removed for client safety
  };
}

/**
 * Generate a unique event ID
 */
export function generateEventId(): string {
  return `watchtower_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a Watchtower event
 */
export function createWatchtowerEvent(
  type: WatchtowerEventType,
  data: Record<string, any>,
  metadata?: WatchtowerEvent['metadata']
): WatchtowerEvent {
  return {
    id: generateEventId(),
    type,
    timestamp: Date.now(),
    data,
    metadata,
  };
}

/**
 * Sign a Watchtower event with HMAC
 */
export function signEvent(event: WatchtowerEvent, secret: string): SignedWatchtowerEvent {
  const payload = JSON.stringify({
    id: event.id,
    type: event.type,
    timestamp: event.timestamp,
    data: event.data,
  });
  
  const signature = createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return {
    ...event,
    signature,
  };
}

/**
 * Verify a signed event
 */
export function verifyEventSignature(signedEvent: SignedWatchtowerEvent, secret: string): boolean {
  try {
    const { signature, ...event } = signedEvent;
    const expectedSignature = signEvent(event, secret).signature;
    
    // Use timing-safe comparison
    return signature.length === expectedSignature.length &&
           createHmac('sha256', secret)
             .update(signature)
             .digest('hex') === 
           createHmac('sha256', secret)
             .update(expectedSignature)
             .digest('hex');
  } catch (error) {
    console.error('Error verifying event signature:', error);
    return false;
  }
}

/**
 * Sanitize event for client consumption (remove sensitive data)
 */
export function sanitizeEventForClient(event: WatchtowerEvent): ClientEvent {
  const { metadata, ...clientEvent } = event;
  
  return {
    ...clientEvent,
    metadata: metadata ? {
      priority: metadata.priority,
    } : undefined,
  };
}

/**
 * Create pre-configured event builders for common use cases
 */
export const EventBuilders = {
  /**
   * Create a payment success event
   */
  paymentSuccess: (sessionId: string, amount: number, walletAddress: string) =>
    createWatchtowerEvent('payment.success', {
      sessionId,
      amount,
      currency: 'USD',
      message: '💰 Payment successful! Relic mint initiated.',
    }, {
      walletAddress,
      amount,
      sessionId,
      priority: 'high',
    }),

  /**
   * Create a relic minted event
   */
  relicMinted: (tokenId: string, walletAddress: string, relicType: string) =>
    createWatchtowerEvent('relic.minted', {
      tokenId,
      relicType,
      message: `🧿 ${relicType} relic minted to vault!`,
    }, {
      walletAddress,
      priority: 'critical',
    }),

  /**
   * Create a leaderboard update event
   */
  leaderboardUpdate: (walletAddress: string, newRank: number, oldRank: number) =>
    createWatchtowerEvent('leaderboard.update', {
      newRank,
      oldRank,
      rankChange: oldRank - newRank,
      message: `🏆 Rank ${newRank > oldRank ? 'up' : 'down'}: #${newRank}`,
    }, {
      walletAddress,
      priority: newRank <= 10 ? 'high' : 'medium',
    }),

  /**
   * Create a glyph alert event
   */
  glyphAlert: (glyphType: string, message: string, priority: 'low' | 'medium' | 'high' | 'critical' = 'medium') =>
    createWatchtowerEvent('glyph.alert', {
      glyphType,
      message: `🔮 ${message}`,
    }, {
      priority,
    }),

  /**
   * Create a vault pulse event
   */
  vaultPulse: (vaultId: string, activity: string) =>
    createWatchtowerEvent('vault.pulse', {
      vaultId,
      activity,
      message: `⚡ Vault activity: ${activity}`,
    }, {
      priority: 'low',
    }),

  /**
   * Create a system heartbeat event
   */
  systemHeartbeat: () =>
    createWatchtowerEvent('system.heartbeat', {
      status: 'operational',
      timestamp: Date.now(),
      message: '💚 Watchtower operational',
    }, {
      priority: 'low',
    }),
};

/**
 * Environment configuration
 */
export const WatchtowerConfig = {
  enabled: process.env.NEXT_PUBLIC_WATCHTOWER_ENABLED === 'true',
  signingSecret: process.env.WATCHTOWER_SIGNING_SECRET || '',
  streamEndpoint: '/api/watchtower/stream',
  emitEndpoint: '/api/watchtower/emit',
  heartbeatInterval: 30000, // 30 seconds
  maxReconnectAttempts: 5,
  reconnectDelay: 1000, // 1 second base delay
};