/**
 * 📡 Vault Broadcast Pulse System
 * Manages vault broadcast events and pulse triggers for the relic evolution system
 */

class VaultBroadcast {
  constructor() {
    this.pulseInterval = null;
    this.broadcastActive = false;
    this.pulseSequence = 0;
    this.connectedVaults = new Set();
    this.pulseListeners = [];
    this.loreEcosystem = new Map();
  }

  /**
   * Initialize the vault broadcast system
   */
  initialize() {
    console.log('📡 Initializing Vault Broadcast Pulse System...');
    this.setupBroadcastListeners();
    this.loadVaultConnections();
    this.startPulseMonitoring();
  }

  /**
   * Setup event listeners for broadcast events
   */
  setupBroadcastListeners() {
    // Listen for vault connection events
    document.addEventListener('vaultConnected', (event) => {
      this.handleVaultConnection(event.detail);
    });

    // Listen for relic mutations that need broadcasting
    document.addEventListener('relicMutationTriggered', (event) => {
      this.broadcastMutation(event.detail);
    });

    // Listen for lore ecosystem updates
    document.addEventListener('loreEcosystemUpdate', (event) => {
      this.updateLoreEcosystem(event.detail);
    });
  }

  /**
   * Load existing vault connections from storage
   */
  loadVaultConnections() {
    try {
      const stored = localStorage.getItem('connectedVaults');
      if (stored) {
        const vaults = JSON.parse(stored);
        vaults.forEach(vault => this.connectedVaults.add(vault));
        console.log(`🔗 Loaded ${this.connectedVaults.size} vault connections`);
      }
    } catch (error) {
      console.warn('⚠️ Could not load vault connections:', error);
    }
  }

  /**
   * Start monitoring for pulse events
   */
  startPulseMonitoring() {
    if (this.pulseInterval) {
      clearInterval(this.pulseInterval);
    }

    // Start pulse monitoring every 30 seconds
    this.pulseInterval = setInterval(() => {
      this.generatePulse();
    }, 30000);

    console.log('💓 Vault pulse monitoring started');
  }

  /**
   * Generate a vault broadcast pulse
   */
  generatePulse() {
    if (!this.broadcastActive || this.connectedVaults.size === 0) {
      return;
    }

    this.pulseSequence++;
    const pulse = {
      id: `pulse_${this.pulseSequence}_${Date.now()}`,
      sequence: this.pulseSequence,
      timestamp: Date.now(),
      connectedVaults: Array.from(this.connectedVaults),
      intensity: this.calculatePulseIntensity(),
      triggerMutation: this.shouldTriggerMutation()
    };

    console.log('💫 Generating vault broadcast pulse:', pulse);

    // Dispatch pulse event
    const pulseEvent = new CustomEvent('vaultBroadcastPulse', {
      detail: pulse
    });
    document.dispatchEvent(pulseEvent);

    // Notify pulse listeners
    this.notifyPulseListeners(pulse);

    // Broadcast to lore ecosystem
    this.broadcastToLoreEcosystem(pulse);
  }

  /**
   * Calculate pulse intensity based on connected vaults and activity
   */
  calculatePulseIntensity() {
    const baseIntensity = Math.min(this.connectedVaults.size * 0.1, 1.0);
    const timeBonus = (this.pulseSequence % 10) * 0.05; // Bonus every 10 pulses
    const randomVariation = (Math.random() - 0.5) * 0.2;
    
    return Math.max(0.1, Math.min(2.0, baseIntensity + timeBonus + randomVariation));
  }

  /**
   * Determine if this pulse should trigger a mutation
   */
  shouldTriggerMutation() {
    // Higher chance with more connected vaults and higher pulse sequences
    const baseChance = 0.3;
    const vaultBonus = Math.min(this.connectedVaults.size * 0.1, 0.4);
    const sequenceBonus = (this.pulseSequence % 5 === 0) ? 0.2 : 0;
    
    const chance = baseChance + vaultBonus + sequenceBonus;
    return Math.random() < chance;
  }

  /**
   * Handle new vault connection
   */
  handleVaultConnection(vaultData) {
    const vaultId = vaultData.id || vaultData.address;
    if (!vaultId) return;

    this.connectedVaults.add(vaultId);
    this.savevaultConnections();

    console.log(`🔗 Vault connected: ${vaultId}`);
    
    // If this is the first vault, activate broadcasting
    if (this.connectedVaults.size === 1 && !this.broadcastActive) {
      this.activateBroadcasting();
    }

    // Welcome pulse for new vault
    setTimeout(() => {
      this.generateWelcomePulse(vaultData);
    }, 1000);
  }

  /**
   * Generate a welcome pulse for newly connected vault
   */
  generateWelcomePulse(vaultData) {
    const welcomePulse = {
      id: `welcome_${Date.now()}`,
      type: 'welcome',
      timestamp: Date.now(),
      targetVault: vaultData.id || vaultData.address,
      intensity: 1.5,
      triggerMutation: true,
      welcomeMessage: '🎉 Vault connected to evolution network'
    };

    const welcomeEvent = new CustomEvent('vaultBroadcastPulse', {
      detail: welcomePulse
    });
    document.dispatchEvent(welcomeEvent);

    console.log('🎉 Welcome pulse generated for new vault');
  }

  /**
   * Activate broadcasting system
   */
  activateBroadcasting() {
    this.broadcastActive = true;
    console.log('📡 Vault broadcasting activated');
    
    // Dispatch activation event
    const activationEvent = new CustomEvent('vaultBroadcastActivated', {
      detail: { timestamp: Date.now() }
    });
    document.dispatchEvent(activationEvent);
  }

  /**
   * Broadcast mutation to all connected systems
   */
  broadcastMutation(mutationData) {
    if (!this.broadcastActive) return;

    const broadcast = {
      type: 'mutation_broadcast',
      mutationId: mutationData.mutationId,
      timestamp: Date.now(),
      targets: Array.from(this.connectedVaults),
      evolutionStage: mutationData.evolutionStage,
      loreUpdate: this.generateLoreUpdate(mutationData)
    };

    console.log('📤 Broadcasting mutation across lore ecosystem:', broadcast);

    // Broadcast to lore ecosystem
    this.broadcastToLoreEcosystem(broadcast);

    // Dispatch global broadcast event
    const broadcastEvent = new CustomEvent('globalMutationBroadcast', {
      detail: broadcast
    });
    document.dispatchEvent(broadcastEvent);
  }

  /**
   * Generate lore update from mutation data
   */
  generateLoreUpdate(mutationData) {
    return {
      id: `lore_${mutationData.mutationId}`,
      timestamp: Date.now(),
      evolutionPhase: mutationData.evolutionStage?.stage || 'UNKNOWN',
      narrativeFragment: this.generateNarrativeFragment(mutationData),
      cosmicSignificance: this.calculateCosmicSignificance(mutationData)
    };
  }

  /**
   * Generate narrative fragment for lore
   */
  generateNarrativeFragment(mutationData) {
    const fragments = [
      'The ancient relics stir with newfound power...',
      'Whispers of evolution echo through the vault dimensions...',
      'The chaoskey resonance amplifies across reality...',
      'Mystical energies converge in the eternal dance...',
      'The vault pulse awakens dormant legendary forces...'
    ];
    
    return fragments[Math.floor(Math.random() * fragments.length)];
  }

  /**
   * Calculate cosmic significance of the mutation
   */
  calculateCosmicSignificance(mutationData) {
    const baseSignificance = mutationData.evolutionStage?.level || 50;
    const timeMultiplier = (Date.now() % 10000) / 10000; // Time-based variation
    
    return Math.min(100, baseSignificance + (timeMultiplier * 20));
  }

  /**
   * Broadcast to lore ecosystem
   */
  broadcastToLoreEcosystem(data) {
    // Update local lore ecosystem
    this.loreEcosystem.set(data.id || data.mutationId, {
      ...data,
      localTimestamp: Date.now()
    });

    // Dispatch to external lore systems
    const loreEvent = new CustomEvent('loreEcosystemBroadcast', {
      detail: data
    });
    document.dispatchEvent(loreEvent);

    console.log('🌌 Data broadcast to lore ecosystem');
  }

  /**
   * Update lore ecosystem with external data
   */
  updateLoreEcosystem(updateData) {
    this.loreEcosystem.set(updateData.id, updateData);
    console.log('🔄 Lore ecosystem updated:', updateData.id);
  }

  /**
   * Save vault connections to storage
   */
  savevaultConnections() {
    try {
      localStorage.setItem('connectedVaults', JSON.stringify(Array.from(this.connectedVaults)));
    } catch (error) {
      console.warn('⚠️ Could not save vault connections:', error);
    }
  }

  /**
   * Add pulse listener
   */
  addPulseListener(callback) {
    this.pulseListeners.push(callback);
    console.log('👂 Pulse listener registered');
  }

  /**
   * Remove pulse listener
   */
  removePulseListener(callback) {
    const index = this.pulseListeners.indexOf(callback);
    if (index > -1) {
      this.pulseListeners.splice(index, 1);
      console.log('🔇 Pulse listener removed');
    }
  }

  /**
   * Notify all pulse listeners
   */
  notifyPulseListeners(pulseData) {
    this.pulseListeners.forEach(listener => {
      try {
        listener(pulseData);
      } catch (error) {
        console.error('❌ Pulse listener error:', error);
      }
    });
  }

  /**
   * Get current broadcast status
   */
  getStatus() {
    return {
      broadcastActive: this.broadcastActive,
      connectedVaults: this.connectedVaults.size,
      pulseSequence: this.pulseSequence,
      loreEcosystemSize: this.loreEcosystem.size,
      listeners: this.pulseListeners.length
    };
  }

  /**
   * Stop broadcasting and cleanup
   */
  stop() {
    if (this.pulseInterval) {
      clearInterval(this.pulseInterval);
      this.pulseInterval = null;
    }
    this.broadcastActive = false;
    console.log('📡 Vault broadcasting stopped');
  }
}

// Export singleton instance
const vaultBroadcast = new VaultBroadcast();

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    vaultBroadcast.initialize();
  });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = vaultBroadcast;
}

// Export for ES6 modules
if (typeof window !== 'undefined') {
  window.vaultBroadcast = vaultBroadcast;
}