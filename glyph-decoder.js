/**
 * ChaosKey333 Glyph Event Decoding System (PR #23 Functionality)
 * 
 * This module provides functionality for decoding cosmic glyph events
 * that occur during vault interactions and relic evolution processes.
 */

class GlyphEventDecoder {
  constructor() {
    this.activeGlyphs = new Map();
    this.eventHistory = [];
    this.decodingCallbacks = new Set();
  }

  /**
   * Register a callback for when glyph events are decoded
   */
  onGlyphDecoded(callback) {
    this.decodingCallbacks.add(callback);
  }

  /**
   * Remove a glyph decoding callback
   */
  offGlyphDecoded(callback) {
    this.decodingCallbacks.delete(callback);
  }

  /**
   * Decode a raw glyph event from the blockchain or user interaction
   */
  decodeGlyphEvent(rawEvent) {
    const decodedEvent = {
      id: this.generateGlyphId(),
      timestamp: Date.now(),
      type: this.determineGlyphType(rawEvent),
      intensity: this.calculateIntensity(rawEvent),
      source: rawEvent.source || 'unknown',
      metadata: this.extractMetadata(rawEvent),
      evolutionTrigger: this.checkEvolutionTrigger(rawEvent)
    };

    // Store in active glyphs
    this.activeGlyphs.set(decodedEvent.id, decodedEvent);
    
    // Add to history
    this.eventHistory.push(decodedEvent);
    
    // Notify all callbacks
    this.decodingCallbacks.forEach(callback => {
      try {
        callback(decodedEvent);
      } catch (error) {
        console.error('Error in glyph decoding callback:', error);
      }
    });

    return decodedEvent;
  }

  /**
   * Get all currently active glyph events
   */
  getActiveGlyphs() {
    return Array.from(this.activeGlyphs.values());
  }

  /**
   * Get glyph event history
   */
  getGlyphHistory(limit = 50) {
    return this.eventHistory.slice(-limit);
  }

  /**
   * Clear expired glyph events (older than 5 minutes)
   */
  cleanupExpiredGlyphs() {
    const now = Date.now();
    const expireTime = 5 * 60 * 1000; // 5 minutes

    for (const [id, event] of this.activeGlyphs) {
      if (now - event.timestamp > expireTime) {
        this.activeGlyphs.delete(id);
      }
    }
  }

  // Private helper methods
  generateGlyphId() {
    return `glyph_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  determineGlyphType(rawEvent) {
    const types = ['resonance', 'transmutation', 'amplification', 'convergence', 'divergence'];
    if (rawEvent.type) return rawEvent.type;
    
    // Determine type based on event characteristics
    if (rawEvent.transactionHash) return 'transmutation';
    if (rawEvent.amplitude > 0.8) return 'amplification';
    if (rawEvent.frequency > 1000) return 'resonance';
    
    return types[Math.floor(Math.random() * types.length)];
  }

  calculateIntensity(rawEvent) {
    // Calculate intensity based on various factors
    let intensity = 0.5;
    
    if (rawEvent.amplitude) intensity += rawEvent.amplitude * 0.3;
    if (rawEvent.frequency) intensity += Math.min(rawEvent.frequency / 1000, 0.3);
    if (rawEvent.transactionValue) intensity += Math.min(rawEvent.transactionValue / 100, 0.2);
    
    return Math.min(Math.max(intensity, 0), 1);
  }

  extractMetadata(rawEvent) {
    return {
      walletAddress: rawEvent.walletAddress || null,
      transactionHash: rawEvent.transactionHash || null,
      blockNumber: rawEvent.blockNumber || null,
      amplitude: rawEvent.amplitude || 0,
      frequency: rawEvent.frequency || 0,
      signature: rawEvent.signature || null
    };
  }

  checkEvolutionTrigger(rawEvent) {
    // Check if this glyph event should trigger relic evolution
    const triggers = {
      highIntensity: rawEvent.amplitude > 0.9,
      rareFrequency: rawEvent.frequency > 2000,
      perfectResonance: rawEvent.resonance === 'perfect',
      cascadingEvent: rawEvent.cascading === true
    };

    return Object.keys(triggers).filter(key => triggers[key]);
  }
}

// Singleton instance
const glyphDecoder = new GlyphEventDecoder();

// Auto-cleanup every minute
setInterval(() => {
  glyphDecoder.cleanupExpiredGlyphs();
}, 60000);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GlyphEventDecoder;
} else {
  window.GlyphEventDecoder = GlyphEventDecoder;
  window.glyphDecoder = glyphDecoder;
}