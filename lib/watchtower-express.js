/**
 * Watchtower Integration Helper for Express.js Server
 * Allows the main Express server to emit events to the Next.js Watchtower system
 */

const fetch = require('node-fetch');

// Configuration
const WATCHTOWER_CONFIG = {
  enabled: process.env.WATCHTOWER_ENABLED === 'true' || process.env.NEXT_PUBLIC_WATCHTOWER_ENABLED === 'true',
  signingSecret: process.env.WATCHTOWER_SIGNING_SECRET || 'chaos-vault-watchtower-secret-key-333',
  nextjsBaseUrl: process.env.NEXTJS_BASE_URL || 'http://localhost:3000',
  emitEndpoint: '/api/watchtower/emit',
};

// HMAC signing function (simplified for Node.js)
function createHmac(algorithm, secret) {
  const crypto = require('crypto');
  return crypto.createHmac(algorithm, secret);
}

// Generate event ID
function generateEventId() {
  return `watchtower_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Create and sign an event
function createSignedEvent(type, data, metadata = {}) {
  const event = {
    id: generateEventId(),
    type,
    timestamp: Date.now(),
    data,
    metadata,
  };

  const payload = JSON.stringify({
    id: event.id,
    type: event.type,
    timestamp: event.timestamp,
    data: event.data,
  });
  
  const signature = createHmac('sha256', WATCHTOWER_CONFIG.signingSecret)
    .update(payload)
    .digest('hex');

  return {
    ...event,
    signature,
  };
}

// Emit event to Watchtower system
async function emitWatchtowerEvent(type, data, metadata = {}, source = 'express-server') {
  if (!WATCHTOWER_CONFIG.enabled) {
    console.log('Watchtower not enabled, skipping event emission');
    return false;
  }

  try {
    const signedEvent = createSignedEvent(type, data, metadata);
    
    const payload = {
      event: signedEvent,
      source,
    };

    const response = await fetch(`${WATCHTOWER_CONFIG.nextjsBaseUrl}${WATCHTOWER_CONFIG.emitEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log(`✅ Watchtower event ${signedEvent.id} emitted successfully`);
      return true;
    } else {
      const error = await response.text();
      console.error(`❌ Failed to emit Watchtower event:`, error);
      return false;
    }

  } catch (error) {
    console.error('Error emitting Watchtower event:', error);
    return false;
  }
}

// Pre-built event emitters for common Express.js use cases
const WatchtowerEmitters = {
  // Payment success from Stripe webhook
  paymentSuccess: async (sessionId, amount, walletAddress) => {
    return emitWatchtowerEvent('payment.success', {
      sessionId,
      amount,
      currency: 'USD',
      message: '💰 Payment successful! Relic mint initiated.',
    }, {
      walletAddress,
      amount,
      sessionId,
      priority: 'high',
    }, 'stripe-webhook');
  },

  // Relic minted event
  relicMinted: async (tokenId, walletAddress, relicType) => {
    return emitWatchtowerEvent('relic.minted', {
      tokenId,
      relicType,
      message: `🧿 ${relicType} relic minted to vault!`,
    }, {
      walletAddress,
      priority: 'critical',
    }, 'mint-service');
  },

  // Generic glyph alert
  glyphAlert: async (glyphType, message, priority = 'medium') => {
    return emitWatchtowerEvent('glyph.alert', {
      glyphType,
      message: `🔮 ${message}`,
    }, {
      priority,
    }, 'glyph-system');
  },

  // Vault pulse activity
  vaultPulse: async (vaultId, activity) => {
    return emitWatchtowerEvent('vault.pulse', {
      vaultId,
      activity,
      message: `⚡ Vault activity: ${activity}`,
    }, {
      priority: 'low',
    }, 'vault-monitor');
  },
};

module.exports = {
  WatchtowerEmitters,
  emitWatchtowerEvent,
  WATCHTOWER_CONFIG,
};