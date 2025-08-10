/**
 * Server-side Watchtower Event Emitter
 * Utility functions for emitting signed events from server-side code
 */

import { 
  WatchtowerEvent, 
  signEvent, 
  WatchtowerConfig, 
  EventBuilders,
  EventEmissionPayload 
} from './watchtower';

/**
 * Emit a signed event to the Watchtower stream
 */
export async function emitWatchtowerEvent(
  event: WatchtowerEvent, 
  source: string = 'server'
): Promise<boolean> {
  try {
    if (!WatchtowerConfig.enabled || !WatchtowerConfig.signingSecret) {
      console.log('Watchtower not enabled or configured, skipping event emission');
      return false;
    }

    // Sign the event
    const signedEvent = signEvent(event, WatchtowerConfig.signingSecret);

    // Prepare emission payload
    const payload: EventEmissionPayload = {
      event: signedEvent,
      source,
    };

    // In server context, we need to make an HTTP request to our own API
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : 'http://localhost:3000';

    const response = await fetch(`${baseUrl}${WatchtowerConfig.emitEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log(`✅ Event ${event.id} emitted successfully`);
      return true;
    } else {
      const error = await response.text();
      console.error(`❌ Failed to emit event ${event.id}:`, error);
      return false;
    }

  } catch (error) {
    console.error('Error emitting Watchtower event:', error);
    return false;
  }
}

/**
 * Convenience functions for common server-side events
 */
export const ServerEventEmitters = {
  /**
   * Emit a payment success event
   */
  paymentSuccess: async (sessionId: string, amount: number, walletAddress: string) => {
    const event = EventBuilders.paymentSuccess(sessionId, amount, walletAddress);
    return emitWatchtowerEvent(event, 'stripe-webhook');
  },

  /**
   * Emit a relic minted event
   */
  relicMinted: async (tokenId: string, walletAddress: string, relicType: string) => {
    const event = EventBuilders.relicMinted(tokenId, walletAddress, relicType);
    return emitWatchtowerEvent(event, 'mint-service');
  },

  /**
   * Emit a leaderboard update event
   */
  leaderboardUpdate: async (walletAddress: string, newRank: number, oldRank: number) => {
    const event = EventBuilders.leaderboardUpdate(walletAddress, newRank, oldRank);
    return emitWatchtowerEvent(event, 'leaderboard-service');
  },

  /**
   * Emit a glyph alert
   */
  glyphAlert: async (glyphType: string, message: string, priority: 'low' | 'medium' | 'high' | 'critical' = 'medium') => {
    const event = EventBuilders.glyphAlert(glyphType, message, priority);
    return emitWatchtowerEvent(event, 'glyph-system');
  },

  /**
   * Emit a vault pulse
   */
  vaultPulse: async (vaultId: string, activity: string) => {
    const event = EventBuilders.vaultPulse(vaultId, activity);
    return emitWatchtowerEvent(event, 'vault-monitor');
  },
};

/**
 * Test the Watchtower system with a sample event
 */
export async function testWatchtowerSystem(): Promise<boolean> {
  const testEvent = EventBuilders.glyphAlert(
    'test-glyph',
    'Watchtower system test - all systems operational! 🧪',
    'medium'
  );

  return emitWatchtowerEvent(testEvent, 'system-test');
}