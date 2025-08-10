/**
 * Vault-Wide Echo Drop System
 * Implements global resonance and synchronized broadcasts across all relic holders
 */

class VaultWideEchoDrop {
  constructor(protocol) {
    this.protocol = protocol;
    this.activeEchoes = [];
    this.connectedRelics = new Map();
    this.lastSyncBroadcast = 0;
    this.syncBroadcastInterval = 33000; // 33 seconds base interval
    this.cosmicIntervals = [33000, 66000, 99000, 132000]; // Cosmic intervals in ms
    this.globalResonanceActive = false;
    this.echoPropagationDelay = 2000; // 2 seconds
    this.maxEchoLifespan = 180000; // 3 minutes
    this.loreDatabase = new Map();
    this.pendingMutationTriggers = [];
    
    this.initializeLoreDatabase();
    this.startEchoProcessor();
  }

  /**
   * Initialize the interconnected lore database
   */
  initializeLoreDatabase() {
    const baseLore = [
      {
        id: 'origin_spark',
        content: 'The first spark ignited in the primordial vault...',
        connections: ['quantum_resonance', 'void_whispers'],
        propagationWeight: 1.0
      },
      {
        id: 'quantum_resonance',
        content: 'Quantum particles dance between dimensions...',
        connections: ['origin_spark', 'molecular_bonds'],
        propagationWeight: 0.8
      },
      {
        id: 'void_whispers',
        content: 'From the void come whispers of ancient knowledge...',
        connections: ['origin_spark', 'spectral_echoes'],
        propagationWeight: 0.9
      },
      {
        id: 'molecular_bonds',
        content: 'Every wallet signature creates molecular bonds...',
        connections: ['quantum_resonance', 'collective_memory'],
        propagationWeight: 0.7
      },
      {
        id: 'spectral_echoes',
        content: 'Spectral echoes reverberate across the multiverse...',
        connections: ['void_whispers', 'temporal_rifts'],
        propagationWeight: 0.85
      },
      {
        id: 'collective_memory',
        content: 'The collective memory of all relics grows stronger...',
        connections: ['molecular_bonds', 'unified_consciousness'],
        propagationWeight: 0.95
      },
      {
        id: 'temporal_rifts',
        content: 'Temporal rifts allow communication across time...',
        connections: ['spectral_echoes', 'cosmic_convergence'],
        propagationWeight: 0.6
      },
      {
        id: 'unified_consciousness',
        content: 'All relics share a unified consciousness...',
        connections: ['collective_memory', 'cosmic_convergence'],
        propagationWeight: 1.0
      },
      {
        id: 'cosmic_convergence',
        content: 'The cosmic convergence draws near...',
        connections: ['temporal_rifts', 'unified_consciousness'],
        propagationWeight: 1.0
      }
    ];
    
    baseLore.forEach(lore => {
      this.loreDatabase.set(lore.id, lore);
    });
  }

  /**
   * Start the echo processing system
   */
  startEchoProcessor() {
    const processEchoes = () => {
      if (!this.protocol.isActive) return;
      
      this.updateActiveEchoes();
      this.checkForSyncBroadcast();
      this.processPendingMutationTriggers();
      
      // Schedule next processing
      setTimeout(processEchoes, 1000);
    };
    
    processEchoes();
  }

  /**
   * Create a new vault echo
   */
  createEcho(echoData) {
    const echo = {
      id: `echo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      source: echoData.source,
      timestamp: Date.now(),
      data: echoData,
      propagationStage: 0,
      maxPropagationStages: 3,
      affectedRelics: new Set(),
      loreRipples: [],
      visualEffects: this.generateEchoVisualEffects(echoData),
      soundscape: this.generateEchoSoundscape(echoData)
    };
    
    // Add to active echoes
    this.activeEchoes.push(echo);
    
    // Start propagation
    this.propagateEcho(echo);
    
    console.log(`🌊 Vault Echo Created: ${echo.source}`, echo);
    
    // Schedule mutation trigger
    this.scheduleMutationTrigger(echo);
  }

  /**
   * Propagate echo across the vault network
   */
  propagateEcho(echo) {
    echo.propagationStage++;
    
    // Visual propagation effect
    this.createVaultPulseEffect(echo);
    
    // Update connected relics
    this.updateConnectedRelics(echo);
    
    // Generate lore ripples
    this.generateLoreRipples(echo);
    
    // Broadcast to all relic holders (simulated)
    this.broadcastToRelicHolders(echo);
    
    // Schedule next propagation stage if not at max
    if (echo.propagationStage < echo.maxPropagationStages) {
      setTimeout(() => {
        this.propagateEcho(echo);
      }, this.echoPropagationDelay);
    }
  }

  /**
   * Create visual vault pulse effect
   */
  createVaultPulseEffect(echo) {
    const pulse = document.createElement('div');
    pulse.className = 'vault-pulse-effect';
    pulse.style.position = 'fixed';
    pulse.style.top = '50%';
    pulse.style.left = '50%';
    pulse.style.width = '50px';
    pulse.style.height = '50px';
    pulse.style.borderRadius = '50%';
    pulse.style.background = 'transparent';
    pulse.style.border = '3px solid rgba(0, 212, 255, 0.8)';
    pulse.style.transform = 'translate(-50%, -50%)';
    pulse.style.pointerEvents = 'none';
    pulse.style.zIndex = '9997';
    pulse.style.animation = `vault-pulse ${this.echoPropagationDelay}ms ease-out forwards`;
    
    document.body.appendChild(pulse);
    
    setTimeout(() => {
      if (pulse.parentNode) {
        pulse.parentNode.removeChild(pulse);
      }
    }, this.echoPropagationDelay);
  }

  /**
   * Update connected relics with echo data
   */
  updateConnectedRelics(echo) {
    // Simulate updating relic displays
    const relicElements = document.querySelectorAll('.relic-display, .vault-relic, .resurrection-container');
    
    relicElements.forEach((element, index) => {
      // Add echo effect to relic displays
      const echoEffect = document.createElement('div');
      echoEffect.style.position = 'absolute';
      echoEffect.style.top = '0';
      echoEffect.style.left = '0';
      echoEffect.style.width = '100%';
      echoEffect.style.height = '100%';
      echoEffect.style.background = 'radial-gradient(circle, rgba(0, 212, 255, 0.3), transparent)';
      echoEffect.style.pointerEvents = 'none';
      echoEffect.style.borderRadius = '50%';
      echoEffect.style.animation = 'echo-ripple 2s ease-out forwards';
      
      // Ensure element has relative positioning
      if (getComputedStyle(element).position === 'static') {
        element.style.position = 'relative';
      }
      
      element.appendChild(echoEffect);
      
      setTimeout(() => {
        if (echoEffect.parentNode) {
          echoEffect.parentNode.removeChild(echoEffect);
        }
      }, 2000);
      
      // Add to affected relics
      echo.affectedRelics.add(`relic_${index}`);
    });
    
    console.log(`🌐 Echo propagated to ${echo.affectedRelics.size} connected relics`);
  }

  /**
   * Generate lore ripples from echo
   */
  generateLoreRipples(echo) {
    // Select related lore based on echo source and data
    const sourceLore = this.selectSourceLore(echo);
    
    if (sourceLore) {
      // Propagate to connected lore entries
      const connectedLore = sourceLore.connections.map(id => this.loreDatabase.get(id)).filter(Boolean);
      
      connectedLore.forEach(lore => {
        if (Math.random() < lore.propagationWeight) {
          const ripple = {
            id: `ripple_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            fromLore: sourceLore.id,
            toLore: lore.id,
            content: lore.content,
            timestamp: Date.now(),
            echoId: echo.id
          };
          
          echo.loreRipples.push(ripple);
          this.displayLoreRipple(ripple);
        }
      });
    }
  }

  /**
   * Select source lore based on echo
   */
  selectSourceLore(echo) {
    const loreMap = {
      ember_interaction: 'spectral_echoes',
      ember_timeout: 'temporal_rifts',
      relic_mutation: 'quantum_resonance',
      wallet_connection: 'molecular_bonds',
      protocol_activation: 'origin_spark'
    };
    
    const loreId = loreMap[echo.source] || 'void_whispers';
    return this.loreDatabase.get(loreId);
  }

  /**
   * Display lore ripple effect
   */
  displayLoreRipple(ripple) {
    const rippleElement = document.createElement('div');
    rippleElement.className = 'lore-ripple';
    rippleElement.style.position = 'fixed';
    rippleElement.style.bottom = '20px';
    rippleElement.style.right = '20px';
    rippleElement.style.background = 'rgba(0, 0, 0, 0.9)';
    rippleElement.style.color = '#00d4ff';
    rippleElement.style.padding = '10px 15px';
    rippleElement.style.borderRadius = '5px';
    rippleElement.style.border = '1px solid #00d4ff';
    rippleElement.style.maxWidth = '300px';
    rippleElement.style.fontSize = '12px';
    rippleElement.style.fontFamily = '"Orbitron", monospace';
    rippleElement.style.zIndex = '10001';
    rippleElement.style.animation = 'lore-ripple-fade 4s ease-out forwards';
    
    rippleElement.innerHTML = `
      <div style="color: #888; font-size: 10px; margin-bottom: 5px;">LORE RIPPLE</div>
      <div>${ripple.content}</div>
    `;
    
    document.body.appendChild(rippleElement);
    
    setTimeout(() => {
      if (rippleElement.parentNode) {
        rippleElement.parentNode.removeChild(rippleElement);
      }
    }, 4000);
    
    console.log(`📖 Lore Ripple: ${ripple.fromLore} → ${ripple.toLore}`);
  }

  /**
   * Broadcast echo to all relic holders (simulated)
   */
  broadcastToRelicHolders(echo) {
    // In a real implementation, this would send to all connected clients
    // For now, we simulate the broadcast locally
    
    console.log(`📡 Broadcasting echo to all relic holders: ${echo.id}`);
    
    // Store broadcast in localStorage for persistence
    try {
      const broadcasts = JSON.parse(localStorage.getItem('vaultBroadcasts') || '[]');
      broadcasts.push({
        echoId: echo.id,
        source: echo.source,
        timestamp: Date.now(),
        propagationStage: echo.propagationStage
      });
      
      // Keep only last 50 broadcasts
      if (broadcasts.length > 50) {
        broadcasts.splice(0, broadcasts.length - 50);
      }
      
      localStorage.setItem('vaultBroadcasts', JSON.stringify(broadcasts));
    } catch (e) {
      console.warn('Could not store vault broadcast:', e);
    }
  }

  /**
   * Generate visual effects for echo
   */
  generateEchoVisualEffects(echoData) {
    const effectMap = {
      ember_interaction: ['pulse', 'ripple'],
      ember_timeout: ['fade', 'drift'],
      relic_mutation: ['transform', 'glow'],
      wallet_connection: ['connect', 'bind'],
      protocol_activation: ['ignite', 'expand']
    };
    
    return effectMap[echoData.source] || ['subtle'];
  }

  /**
   * Generate soundscape for echo
   */
  generateEchoSoundscape(echoData) {
    const soundMap = {
      ember_interaction: 'harmonic_chime',
      ember_timeout: 'whisper_fade',
      relic_mutation: 'quantum_hum',
      wallet_connection: 'connection_tone',
      protocol_activation: 'cosmic_ignition'
    };
    
    return soundMap[echoData.source] || 'ambient_echo';
  }

  /**
   * Check for synchronized broadcast
   */
  checkForSyncBroadcast() {
    const now = Date.now();
    const timeSinceLastSync = now - this.lastSyncBroadcast;
    
    // Check if it's time for a cosmic interval sync
    const shouldSync = this.cosmicIntervals.some(interval => {
      return timeSinceLastSync >= interval && timeSinceLastSync < interval + 1000;
    });
    
    if (shouldSync) {
      this.triggerSynchronizedBroadcast();
    }
  }

  /**
   * Trigger synchronized broadcast across all relics
   */
  triggerSynchronizedBroadcast() {
    this.lastSyncBroadcast = Date.now();
    this.globalResonanceActive = true;
    
    console.log("🌌 SYNCHRONIZED BROADCAST INITIATED - 33-second unified display");
    
    // Create global sync effect
    this.createGlobalSyncEffect();
    
    // Synchronize all relic displays
    this.synchronizeRelicDisplays();
    
    // Create unified soundscape
    this.playUnifiedSoundscape();
    
    // End synchronization after 33 seconds
    setTimeout(() => {
      this.endSynchronizedBroadcast();
    }, 33000);
  }

  /**
   * Create global synchronization effect
   */
  createGlobalSyncEffect() {
    const syncOverlay = document.createElement('div');
    syncOverlay.id = 'global-sync-overlay';
    syncOverlay.style.position = 'fixed';
    syncOverlay.style.top = '0';
    syncOverlay.style.left = '0';
    syncOverlay.style.width = '100vw';
    syncOverlay.style.height = '100vh';
    syncOverlay.style.background = 'radial-gradient(circle, rgba(0, 212, 255, 0.1), transparent)';
    syncOverlay.style.pointerEvents = 'none';
    syncOverlay.style.zIndex = '9996';
    syncOverlay.style.animation = 'global-sync-pulse 33s ease-in-out';
    
    document.body.appendChild(syncOverlay);
    
    // Add sync message
    const syncMessage = document.createElement('div');
    syncMessage.style.position = 'fixed';
    syncMessage.style.top = '20px';
    syncMessage.style.left = '50%';
    syncMessage.style.transform = 'translateX(-50%)';
    syncMessage.style.background = 'rgba(0, 0, 0, 0.8)';
    syncMessage.style.color = '#00d4ff';
    syncMessage.style.padding = '15px 25px';
    syncMessage.style.borderRadius = '25px';
    syncMessage.style.border = '2px solid #00d4ff';
    syncMessage.style.fontFamily = '"Orbitron", monospace';
    syncMessage.style.fontSize = '16px';
    syncMessage.style.zIndex = '10002';
    syncMessage.style.animation = 'sync-message-pulse 2s ease-in-out infinite';
    syncMessage.innerHTML = '🌌 GLOBAL RESONANCE ACTIVE - UNIFIED CONSCIOUSNESS ENGAGED';
    
    document.body.appendChild(syncMessage);
    
    // Remove after 33 seconds
    setTimeout(() => {
      if (syncOverlay.parentNode) syncOverlay.parentNode.removeChild(syncOverlay);
      if (syncMessage.parentNode) syncMessage.parentNode.removeChild(syncMessage);
    }, 33000);
  }

  /**
   * Synchronize all relic displays
   */
  synchronizeRelicDisplays() {
    const relicElements = document.querySelectorAll('.relic-display, .vault-relic, .resurrection-container');
    
    relicElements.forEach(element => {
      // Apply synchronized visual effects
      element.style.filter = 'hue-rotate(180deg) brightness(1.3) saturate(1.5)';
      element.style.transform = 'scale(1.05)';
      element.style.transition = 'all 2s ease-in-out';
      element.style.boxShadow = '0 0 30px rgba(0, 212, 255, 0.8)';
    });
    
    // Reset after sync period
    setTimeout(() => {
      relicElements.forEach(element => {
        element.style.filter = '';
        element.style.transform = '';
        element.style.boxShadow = '';
      });
    }, 33000);
  }

  /**
   * Play unified soundscape
   */
  playUnifiedSoundscape() {
    console.log("🎵 Playing unified cosmic soundscape for 33 seconds");
    // In a real implementation, this would play synchronized audio across all clients
  }

  /**
   * End synchronized broadcast
   */
  endSynchronizedBroadcast() {
    this.globalResonanceActive = false;
    console.log("🌌 Synchronized broadcast ended - Returning to individual resonance");
  }

  /**
   * Update active echoes
   */
  updateActiveEchoes() {
    const now = Date.now();
    
    this.activeEchoes = this.activeEchoes.filter(echo => {
      // Remove expired echoes
      if (now - echo.timestamp > this.maxEchoLifespan) {
        console.log(`🌊 Echo Expired: ${echo.id}`);
        return false;
      }
      
      return true;
    });
  }

  /**
   * Schedule mutation trigger from echo
   */
  scheduleMutationTrigger(echo) {
    const triggerTime = Date.now() + Math.random() * 20000 + 10000; // 10-30 seconds
    this.pendingMutationTriggers.push({
      echoId: echo.id,
      triggerTime,
      triggered: false
    });
  }

  /**
   * Process pending mutation triggers
   */
  processPendingMutationTriggers() {
    const now = Date.now();
    
    this.pendingMutationTriggers.forEach(trigger => {
      if (!trigger.triggered && now >= trigger.triggerTime) {
        trigger.triggered = true;
        
        // Trigger new relic mutation to complete the loop
        this.protocol.adaptiveRelicCore.triggerMutation('vault_echo_cycle', {
          sourceEcho: trigger.echoId,
          timestamp: now,
          cycleComplete: true
        });
        
        console.log(`🔄 Loop Cycle Complete: Echo ${trigger.echoId} triggered new mutation`);
      }
    });
    
    // Clean up triggered mutations
    this.pendingMutationTriggers = this.pendingMutationTriggers.filter(t => !t.triggered);
  }

  /**
   * Trigger cosmic reset echo
   */
  triggerCosmicResetEcho() {
    const resetEcho = {
      source: 'cosmic_reset',
      timestamp: Date.now(),
      power: 'maximum',
      duration: 33000
    };
    
    this.createEcho(resetEcho);
    
    // Trigger immediate synchronized broadcast
    setTimeout(() => {
      this.triggerSynchronizedBroadcast();
    }, 1000);
  }

  /**
   * Process echoes (main update function)
   */
  processEchoes() {
    // This method is called by the main protocol loop
    this.updateActiveEchoes();
  }

  /**
   * Perform cosmic reset
   */
  performCosmicReset() {
    // Clear active echoes but keep lore database
    this.activeEchoes = [];
    this.pendingMutationTriggers = [];
    this.lastSyncBroadcast = 0;
    this.globalResonanceActive = false;
    
    console.log("🌌 Vault-Wide Echo Drop: Cosmic reset completed");
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { VaultWideEchoDrop };
}