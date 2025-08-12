/**
 * Infinite Ignition Protocol - Core System
 * Implements Adaptive Relic Mutation, Spectral Lore Embers, and Vault-Wide Echo Drop
 */

class InfiniteIgnitionProtocol {
  constructor() {
    this.isActive = false;
    this.cosmicDay = 0;
    this.maxCosmicDays = 33;
    this.relicMutations = new Map();
    this.activeEmbers = [];
    this.vaultEchoes = [];
    this.lastEchoTimestamp = 0;
    this.echoInterval = 30000; // 30 seconds base interval
    this.cosmicSeasonStart = Date.now();
    
    // Initialize systems
    this.adaptiveRelicCore = new AdaptiveRelicMutationCore(this);
    this.spectralLoreEmbers = new SpectralLoreEmbers(this);
    this.vaultEchoDrop = new VaultWideEchoDrop(this);
    
    console.log("⚡ Infinite Ignition Protocol initialized");
  }

  /**
   * Activate the protocol and begin the infinite expansion cycle
   */
  activate() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.cosmicSeasonStart = Date.now();
    console.log("🌌 Infinite Ignition Protocol ACTIVATED - Beginning cosmic expansion cycle");
    
    // Start the main loop
    this.startMainLoop();
    
    // Initialize event listeners for user interactions
    this.initializeEventListeners();
    
    // Trigger initial relic mutation
    this.adaptiveRelicCore.triggerMutation('protocol_activation', { 
      walletAddress: window.userWalletAddress || 'unknown',
      timestamp: Date.now()
    });
  }

  /**
   * Main protocol loop - coordinates all three systems
   */
  startMainLoop() {
    const loop = () => {
      if (!this.isActive) return;
      
      // Update cosmic day
      const daysSinceStart = Math.floor((Date.now() - this.cosmicSeasonStart) / (24 * 60 * 60 * 1000));
      this.cosmicDay = daysSinceStart % this.maxCosmicDays;
      
      // Check for cosmic season reset
      if (daysSinceStart >= this.maxCosmicDays && daysSinceStart % this.maxCosmicDays === 0) {
        this.triggerCosmicSeasonReset();
      }
      
      // Execute the infinite loop mechanism:
      // 1. Relic mutation triggers lore embers
      // 2. Lore embers trigger vault echoes  
      // 3. Vault echoes reinitiate relic mutation cycle
      this.executeLoopMechanism();
      
      // Schedule next iteration
      setTimeout(loop, 1000); // Check every second
    };
    
    loop();
  }

  /**
   * Execute the core loop mechanism
   */
  executeLoopMechanism() {
    // Check if any new mutations should trigger embers
    this.adaptiveRelicCore.checkForEmberTriggers();
    
    // Update ember states and check for echo triggers
    this.spectralLoreEmbers.updateEmbers();
    
    // Process vault echoes and check for mutation triggers
    this.vaultEchoDrop.processEchoes();
  }

  /**
   * Initialize event listeners for user interactions
   */
  initializeEventListeners() {
    // Listen for any click/tap events that should trigger mutations
    document.addEventListener('click', (event) => {
      this.adaptiveRelicCore.triggerMutation('user_interaction', {
        element: event.target.tagName,
        timestamp: Date.now(),
        coordinates: { x: event.clientX, y: event.clientY }
      });
    });
    
    // Listen for wallet connection events
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          this.adaptiveRelicCore.triggerMutation('wallet_change', {
            newWallet: accounts[0],
            timestamp: Date.now()
          });
        }
      });
    }
    
    // Listen for page navigation/decode events
    window.addEventListener('popstate', () => {
      this.adaptiveRelicCore.triggerMutation('navigation_decode', {
        url: window.location.href,
        timestamp: Date.now()
      });
    });
  }

  /**
   * Trigger a cosmic season reset
   */
  triggerCosmicSeasonReset() {
    console.log("🌌 COSMIC SEASON RESET - 33-day cycle complete");
    
    // Reset cosmic day counter
    this.cosmicDay = 0;
    this.cosmicSeasonStart = Date.now();
    
    // Reset but preserve some evolution history
    this.adaptiveRelicCore.performCosmicReset();
    this.spectralLoreEmbers.performCosmicReset();
    this.vaultEchoDrop.performCosmicReset();
    
    // Trigger a massive vault-wide echo
    this.vaultEchoDrop.triggerCosmicResetEcho();
  }

  /**
   * Get current protocol status
   */
  getStatus() {
    return {
      isActive: this.isActive,
      cosmicDay: this.cosmicDay,
      totalMutations: this.relicMutations.size,
      activeEmbers: this.activeEmbers.length,
      totalEchoes: this.vaultEchoes.length,
      daysTillReset: this.maxCosmicDays - this.cosmicDay
    };
  }
}

/**
 * Adaptive Relic Mutation Core
 * Handles relic evolution based on decode/interaction events
 */
class AdaptiveRelicMutationCore {
  constructor(protocol) {
    this.protocol = protocol;
    this.glyphMatrix = new Map();
    this.evolutionHistory = [];
    this.molecularGlyphs = new Map(); // Wallet signatures as molecular glyphs
    this.pendingEmberTriggers = [];
  }

  /**
   * Trigger a relic mutation
   */
  triggerMutation(eventType, eventData) {
    const mutationId = `mutation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const mutation = {
      id: mutationId,
      eventType,
      eventData,
      timestamp: Date.now(),
      glyphChanges: this.generateGlyphChanges(eventType, eventData),
      visualEffects: this.generateVisualEffects(eventType),
      soundscapeChanges: this.generateSoundscapeChanges(eventType)
    };
    
    // Store mutation
    this.protocol.relicMutations.set(mutationId, mutation);
    this.evolutionHistory.push(mutationId);
    
    // Embed molecular glyph if wallet involved
    if (eventData.walletAddress || eventData.newWallet) {
      const wallet = eventData.walletAddress || eventData.newWallet;
      this.embedMolecularGlyph(wallet, mutationId);
    }
    
    // Apply visual and audio changes
    this.applyMutationEffects(mutation);
    
    // Queue ember trigger
    this.pendingEmberTriggers.push({
      mutationId,
      triggerTime: Date.now() + Math.random() * 5000 // Random delay 0-5 seconds
    });
    
    console.log(`🧬 Relic Mutation Triggered: ${eventType}`, mutation);
  }

  /**
   * Generate glyph matrix changes
   */
  generateGlyphChanges(eventType, eventData) {
    const glyphTypes = ['spectral', 'quantum', 'void', 'flame', 'frost', 'storm'];
    const selectedGlyph = glyphTypes[Math.floor(Math.random() * glyphTypes.length)];
    
    return {
      primary: selectedGlyph,
      intensity: Math.random() * 100,
      frequency: eventType === 'user_interaction' ? 'high' : 'medium',
      coordinates: eventData.coordinates || { x: Math.random() * 100, y: Math.random() * 100 }
    };
  }

  /**
   * Generate visual effects for the mutation
   */
  generateVisualEffects(eventType) {
    const effects = {
      user_interaction: ['pulse', 'ripple', 'glow'],
      wallet_change: ['transform', 'cascade', 'illuminate'],
      navigation_decode: ['phase', 'fragment', 'reconstruct'],
      protocol_activation: ['ignition', 'expansion', 'manifestation']
    };
    
    return effects[eventType] || ['subtle_shift'];
  }

  /**
   * Generate soundscape changes
   */
  generateSoundscapeChanges(eventType) {
    const soundscapes = {
      user_interaction: 'harmonic_resonance',
      wallet_change: 'quantum_shift',
      navigation_decode: 'void_whisper',
      protocol_activation: 'cosmic_ignition'
    };
    
    return soundscapes[eventType] || 'ambient_hum';
  }

  /**
   * Apply mutation effects to the DOM
   */
  applyMutationEffects(mutation) {
    // Add visual effects to the page
    this.createVisualEffect(mutation.visualEffects, mutation.glyphChanges.coordinates);
    
    // Update any existing relic displays
    this.updateRelicDisplay(mutation);
    
    // Store effect in localStorage for persistence
    this.storeMutationEffect(mutation);
  }

  /**
   * Create visual effects on the page
   */
  createVisualEffect(effects, coordinates) {
    effects.forEach(effect => {
      const effectElement = document.createElement('div');
      effectElement.className = `mutation-effect ${effect}`;
      effectElement.style.position = 'fixed';
      effectElement.style.left = `${coordinates.x}px`;
      effectElement.style.top = `${coordinates.y}px`;
      effectElement.style.width = '20px';
      effectElement.style.height = '20px';
      effectElement.style.borderRadius = '50%';
      effectElement.style.background = 'radial-gradient(circle, #ff6b35, #f7931e)';
      effectElement.style.boxShadow = '0 0 20px rgba(255, 107, 53, 0.8)';
      effectElement.style.animation = `${effect} 2s ease-out forwards`;
      effectElement.style.pointerEvents = 'none';
      effectElement.style.zIndex = '9999';
      
      document.body.appendChild(effectElement);
      
      // Remove after animation
      setTimeout(() => {
        if (effectElement.parentNode) {
          effectElement.parentNode.removeChild(effectElement);
        }
      }, 2000);
    });
  }

  /**
   * Update relic display elements
   */
  updateRelicDisplay(mutation) {
    // Update any relic viewer elements
    const relicDisplays = document.querySelectorAll('.relic-display, .vault-relic');
    relicDisplays.forEach(display => {
      display.style.filter = `hue-rotate(${mutation.glyphChanges.intensity * 3.6}deg) brightness(${1 + mutation.glyphChanges.intensity / 200})`;
      display.style.transition = 'filter 1s ease-in-out';
    });
  }

  /**
   * Store mutation effect for persistence
   */
  storeMutationEffect(mutation) {
    try {
      const storedMutations = JSON.parse(localStorage.getItem('relicMutations') || '[]');
      storedMutations.push({
        id: mutation.id,
        timestamp: mutation.timestamp,
        effects: mutation.visualEffects,
        glyphChanges: mutation.glyphChanges
      });
      
      // Keep only last 100 mutations
      if (storedMutations.length > 100) {
        storedMutations.splice(0, storedMutations.length - 100);
      }
      
      localStorage.setItem('relicMutations', JSON.stringify(storedMutations));
    } catch (e) {
      console.warn('Could not store mutation effect:', e);
    }
  }

  /**
   * Embed molecular glyph for wallet signature
   */
  embedMolecularGlyph(walletAddress, mutationId) {
    if (!this.molecularGlyphs.has(walletAddress)) {
      this.molecularGlyphs.set(walletAddress, []);
    }
    
    const molecularGlyph = {
      walletAddress,
      mutationId,
      timestamp: Date.now(),
      glyphSignature: this.generateGlyphSignature(walletAddress)
    };
    
    this.molecularGlyphs.get(walletAddress).push(molecularGlyph);
    console.log(`🧬 Molecular Glyph Embedded: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`);
  }

  /**
   * Generate unique glyph signature for wallet
   */
  generateGlyphSignature(walletAddress) {
    // Create a deterministic but unique signature based on wallet address
    let signature = '';
    for (let i = 0; i < walletAddress.length; i += 4) {
      const segment = walletAddress.slice(i, i + 4);
      const value = parseInt(segment, 16) || 0;
      signature += String.fromCharCode(65 + (value % 26)); // Convert to A-Z
    }
    return signature.slice(0, 8); // Keep it manageable
  }

  /**
   * Check for pending ember triggers
   */
  checkForEmberTriggers() {
    const now = Date.now();
    this.pendingEmberTriggers = this.pendingEmberTriggers.filter(trigger => {
      if (now >= trigger.triggerTime) {
        // Trigger ember creation
        this.protocol.spectralLoreEmbers.createEmber(trigger.mutationId);
        return false; // Remove from pending
      }
      return true; // Keep in pending
    });
  }

  /**
   * Perform cosmic reset while preserving some history
   */
  performCosmicReset() {
    // Keep last 10 mutations and all molecular glyphs
    const recentMutations = Array.from(this.protocol.relicMutations.entries()).slice(-10);
    this.protocol.relicMutations.clear();
    recentMutations.forEach(([id, mutation]) => {
      this.protocol.relicMutations.set(id, mutation);
    });
    
    // Reset pending triggers
    this.pendingEmberTriggers = [];
    
    console.log("🌌 Adaptive Relic Core: Cosmic reset completed");
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { InfiniteIgnitionProtocol, AdaptiveRelicMutationCore };
}