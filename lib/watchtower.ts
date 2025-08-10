import crypto from 'crypto';

// Core event types for the Watchtower system
export interface WatchtowerEvent {
  id: string;
  type: 'glyph_detection' | 'vault_event' | 'relic_mint' | 'chaos_alert';
  data: {
    glyphId?: string;
    eventCode?: string;
    vaultUrl?: string;
    timestamp: number;
    metadata?: Record<string, any>;
  };
  signature?: string;
  channels?: ('twitter' | 'email' | 'sms')[];
}

// Multi-channel pulse configuration
export interface PulseConfig {
  twitter: {
    enabled: boolean;
    accessToken?: string;
    accessSecret?: string;
    consumerKey?: string;
    consumerSecret?: string;
  };
  email: {
    enabled: boolean;
    smtpHost?: string;
    smtpUser?: string;
    smtpPass?: string;
  };
  sms: {
    enabled: boolean;
    twilioSid?: string;
    twilioToken?: string;
    fromNumber?: string;
  };
  syncWindow: number; // seconds for pulse synchronization
}

// Event bus for real-time communication
export class WatchtowerEventBus {
  private listeners: Map<string, ((event: WatchtowerEvent) => void)[]> = new Map();
  private hmacSecret: string;

  constructor(hmacSecret?: string) {
    this.hmacSecret = hmacSecret || process.env.WATCHTOWER_HMAC_SECRET || 'default-secret';
  }

  // Sign events with HMAC for security
  signEvent(event: WatchtowerEvent): WatchtowerEvent {
    const payload = JSON.stringify({
      id: event.id,
      type: event.type,
      data: event.data
    });
    
    const signature = crypto
      .createHmac('sha256', this.hmacSecret)
      .update(payload)
      .digest('hex');

    return { ...event, signature };
  }

  // Verify event signature
  verifyEvent(event: WatchtowerEvent): boolean {
    if (!event.signature) return false;
    
    const payload = JSON.stringify({
      id: event.id,
      type: event.type,
      data: event.data
    });
    
    const expectedSignature = crypto
      .createHmac('sha256', this.hmacSecret)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(event.signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  // Subscribe to events
  on(eventType: string, callback: (event: WatchtowerEvent) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);
  }

  // Emit events to subscribers
  emit(event: WatchtowerEvent) {
    const signedEvent = this.signEvent(event);
    
    // Emit to specific type listeners
    const typeListeners = this.listeners.get(signedEvent.type) || [];
    typeListeners.forEach(callback => callback(signedEvent));

    // Emit to all listeners
    const allListeners = this.listeners.get('*') || [];
    allListeners.forEach(callback => callback(signedEvent));
  }

  // Remove listeners
  off(eventType: string, callback: (event: WatchtowerEvent) => void) {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
}

// Utility functions for chaos glyph generation
export function generateChaosGlyphId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 8);
  return `CG${timestamp}${random}`.toUpperCase();
}

export function generateEventCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Format vault URL for multi-channel distribution
export function formatVaultUrl(eventId: string): string {
  const baseUrl = process.env.VAULT_BASE_URL || 'https://chaoskey333.web.app';
  return `${baseUrl}/vault?event=${eventId}`;
}

// Create singleton instance
export const watchtowerBus = new WatchtowerEventBus();