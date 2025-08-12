/**
 * Spectral-Lock Memory Cache System (PR #76)
 * Caches evolution events for instant replay in Cosmic Replay Terminal v2.0
 */

class SpectralCache {
  constructor() {
    this.cache = new Map();
    this.eternalEchoes = [];
    this.cacheName = 'chaoskey333-spectral-cache';
    this.maxCacheSize = 1000;
    this.isInitialized = false;
    
    // Initialize cache from localStorage on creation
    this.initialize();
  }

  /**
   * Initialize the spectral cache system
   */
  initialize() {
    try {
      // Load eternal echoes from localStorage
      const storedEchoes = localStorage.getItem(`${this.cacheName}-echoes`);
      if (storedEchoes) {
        this.eternalEchoes = JSON.parse(storedEchoes);
        console.log(`🌌 Loaded ${this.eternalEchoes.length} eternal echoes from vault history`);
      }

      // Load active cache from sessionStorage for current session
      const sessionCache = sessionStorage.getItem(`${this.cacheName}-session`);
      if (sessionCache) {
        const cacheData = JSON.parse(sessionCache);
        this.cache = new Map(cacheData);
        console.log(`⚡ Restored ${this.cache.size} spectral events to active cache`);
      }

      this.isInitialized = true;
      console.log('🔮 Spectral-Lock Memory Cache initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Spectral Cache:', error);
    }
  }

  /**
   * Cache a relic evolution event with spectral-lock
   */
  cacheEvolutionEvent(evolutionData) {
    if (!this.isInitialized) {
      console.warn('⚠️ Spectral Cache not initialized');
      return false;
    }

    const timestamp = Date.now();
    const eventId = `evolution_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
    
    const spectralEvent = {
      id: eventId,
      type: 'relic_evolution',
      timestamp: timestamp,
      prChain: evolutionData.prChain || ['PR-23', 'PR-24'],
      walletAddress: evolutionData.walletAddress,
      relicId: evolutionData.relicId,
      evolutionStage: evolutionData.evolutionStage,
      spectralSignature: this.generateSpectralSignature(evolutionData),
      cosmicState: evolutionData.cosmicState || {},
      isEternalEcho: true
    };

    // Add to active cache
    this.cache.set(eventId, spectralEvent);

    // Add to eternal echoes for permanent storage
    this.eternalEchoes.push(spectralEvent);

    // Maintain cache size limit
    if (this.eternalEchoes.length > this.maxCacheSize) {
      this.eternalEchoes = this.eternalEchoes.slice(-this.maxCacheSize);
    }

    // Persist to storage
    this.persistCache();

    console.log(`🌟 Evolution event spectrally cached: ${eventId}`);
    return spectralEvent;
  }

  /**
   * Generate unique spectral signature for event integrity
   */
  generateSpectralSignature(data) {
    const signatureData = JSON.stringify({
      wallet: data.walletAddress,
      relic: data.relicId,
      stage: data.evolutionStage,
      timestamp: Date.now()
    });
    
    // Simple hash for spectral signature
    let hash = 0;
    for (let i = 0; i < signatureData.length; i++) {
      const char = signatureData.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return `spectral_${Math.abs(hash).toString(16)}_${Date.now()}`;
  }

  /**
   * Retrieve cached evolution events for replay
   */
  getEvolutionEvents(filter = {}) {
    let events = [...this.eternalEchoes];

    // Apply filters
    if (filter.walletAddress) {
      events = events.filter(e => e.walletAddress === filter.walletAddress);
    }
    
    if (filter.relicId) {
      events = events.filter(e => e.relicId === filter.relicId);
    }
    
    if (filter.since) {
      events = events.filter(e => e.timestamp >= filter.since);
    }

    // Sort by timestamp (newest first)
    return events.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get specific event for replay terminal
   */
  getEventById(eventId) {
    return this.cache.get(eventId) || this.eternalEchoes.find(e => e.id === eventId);
  }

  /**
   * Prepare event data for Cosmic Replay Terminal v2.0
   */
  prepareForReplay(eventId) {
    const event = this.getEventById(eventId);
    if (!event) {
      console.warn(`⚠️ Event not found in spectral cache: ${eventId}`);
      return null;
    }

    return {
      id: event.id,
      type: 'replay_sequence',
      originalEvent: event,
      replayData: {
        prSequence: event.prChain,
        evolutionStage: event.evolutionStage,
        cosmicState: event.cosmicState,
        spectralSignature: event.spectralSignature,
        timestamp: event.timestamp
      },
      terminalVersion: '2.0 – Ascension Edition'
    };
  }

  /**
   * Persist cache to storage
   */
  persistCache() {
    try {
      // Store eternal echoes in localStorage for persistence
      localStorage.setItem(`${this.cacheName}-echoes`, JSON.stringify(this.eternalEchoes));
      
      // Store active cache in sessionStorage for current session
      sessionStorage.setItem(`${this.cacheName}-session`, JSON.stringify([...this.cache]));
      
      console.log('💾 Spectral cache persisted to vault storage');
    } catch (error) {
      console.error('❌ Failed to persist spectral cache:', error);
    }
  }

  /**
   * Clear all cached events (admin function)
   */
  clearCache() {
    this.cache.clear();
    this.eternalEchoes = [];
    localStorage.removeItem(`${this.cacheName}-echoes`);
    sessionStorage.removeItem(`${this.cacheName}-session`);
    console.log('🧹 Spectral cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      activeCacheSize: this.cache.size,
      eternalEchoCount: this.eternalEchoes.length,
      isInitialized: this.isInitialized,
      oldestEcho: this.eternalEchoes.length > 0 ? this.eternalEchoes[0].timestamp : null,
      newestEcho: this.eternalEchoes.length > 0 ? this.eternalEchoes[this.eternalEchoes.length - 1].timestamp : null
    };
  }
}

// Create global spectral cache instance
if (typeof window !== 'undefined') {
  window.SpectralCache = SpectralCache;
  window.spectralCache = new SpectralCache();
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SpectralCache;
}