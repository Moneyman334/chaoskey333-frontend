/**
 * 🧬 Permanent Relic Evolution Trigger - Mutation Hooks System
 * Enables replay events in Mythic Mode to trigger live relic mutations during Vault Broadcast Pulse events
 */

class MutationHooks {
  constructor() {
    this.mutationListeners = [];
    this.replayEventQueue = [];
    this.mythicModeActive = false;
    this.vaultBroadcastActive = false;
  }

  /**
   * Initialize the mutation hooks system
   */
  initialize() {
    console.log('🧬 Initializing Permanent Relic Evolution Trigger...');
    this.setupEventListeners();
    this.loadMythicModeState();
  }

  /**
   * Setup event listeners for mutation triggers
   */
  setupEventListeners() {
    // Listen for Mythic Mode activation
    document.addEventListener('mythicModeActivated', (event) => {
      this.mythicModeActive = true;
      console.log('⚡ Mythic Mode activated - mutation hooks ready');
      this.processQueuedReplayEvents();
    });

    // Listen for Vault Broadcast Pulse events
    document.addEventListener('vaultBroadcastPulse', (event) => {
      this.vaultBroadcastActive = true;
      console.log('📡 Vault Broadcast Pulse detected - triggering mutations');
      this.triggerMutationSequence(event.detail);
    });

    // Listen for replay events
    document.addEventListener('relicReplayEvent', (event) => {
      this.handleReplayEvent(event.detail);
    });
  }

  /**
   * Load current Mythic Mode state from storage or contract
   */
  loadMythicModeState() {
    try {
      const storedState = localStorage.getItem('mythicModeState');
      if (storedState) {
        const state = JSON.parse(storedState);
        this.mythicModeActive = state.active || false;
        console.log(`🔮 Mythic Mode state loaded: ${this.mythicModeActive ? 'ACTIVE' : 'INACTIVE'}`);
      }
    } catch (error) {
      console.warn('⚠️ Could not load Mythic Mode state:', error);
    }
  }

  /**
   * Handle incoming replay events
   */
  handleReplayEvent(replayData) {
    console.log('🎬 Processing replay event:', replayData);
    
    if (this.mythicModeActive && this.vaultBroadcastActive) {
      // Immediately trigger mutation if both conditions are met
      this.executeMutation(replayData);
    } else {
      // Queue the event for later processing
      this.replayEventQueue.push({
        ...replayData,
        timestamp: Date.now()
      });
      console.log('⏳ Replay event queued for mutation trigger');
    }
  }

  /**
   * Process queued replay events when conditions are met
   */
  processQueuedReplayEvents() {
    if (this.replayEventQueue.length === 0) return;

    console.log(`🔄 Processing ${this.replayEventQueue.length} queued replay events`);
    
    const events = [...this.replayEventQueue];
    this.replayEventQueue = [];

    events.forEach(event => {
      if (this.vaultBroadcastActive) {
        this.executeMutation(event);
      } else {
        // Re-queue if vault broadcast is not active
        this.replayEventQueue.push(event);
      }
    });
  }

  /**
   * Trigger the mutation sequence during vault broadcast pulse
   */
  triggerMutationSequence(pulseData) {
    if (!this.mythicModeActive) {
      console.log('⚠️ Mutation sequence blocked - Mythic Mode not active');
      return;
    }

    console.log('🌀 Initiating mutation sequence with pulse data:', pulseData);

    // Process any queued replay events
    this.processQueuedReplayEvents();

    // Trigger mutation for current pulse
    if (pulseData.triggerMutation) {
      this.executeMutation({
        type: 'vaultPulse',
        data: pulseData,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Execute a single mutation
   */
  async executeMutation(mutationData) {
    try {
      console.log('🧬 Executing relic mutation:', mutationData);

      const mutationEvent = new CustomEvent('relicMutationTriggered', {
        detail: {
          mutationId: this.generateMutationId(),
          replayData: mutationData,
          timestamp: Date.now(),
          evolutionStage: this.calculateEvolutionStage(mutationData)
        }
      });

      // Dispatch mutation event for global broadcasting
      document.dispatchEvent(mutationEvent);

      // Notify registered listeners
      this.notifyMutationListeners(mutationEvent.detail);

      console.log('✅ Relic mutation executed successfully');
      
    } catch (error) {
      console.error('❌ Mutation execution failed:', error);
      throw error;
    }
  }

  /**
   * Generate unique mutation ID
   */
  generateMutationId() {
    return `mutation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate evolution stage based on mutation data
   */
  calculateEvolutionStage(mutationData) {
    // Simple evolution stage calculation
    const baseStage = mutationData.type === 'vaultPulse' ? 'PULSE_EVOLUTION' : 'REPLAY_EVOLUTION';
    const intensity = mutationData.data?.intensity || 1;
    
    return {
      stage: baseStage,
      level: Math.min(intensity * 10, 100),
      timestamp: Date.now()
    };
  }

  /**
   * Register a mutation listener
   */
  addMutationListener(callback) {
    this.mutationListeners.push(callback);
    console.log('👂 Mutation listener registered');
  }

  /**
   * Remove a mutation listener
   */
  removeMutationListener(callback) {
    const index = this.mutationListeners.indexOf(callback);
    if (index > -1) {
      this.mutationListeners.splice(index, 1);
      console.log('🔇 Mutation listener removed');
    }
  }

  /**
   * Notify all registered mutation listeners
   */
  notifyMutationListeners(mutationData) {
    this.mutationListeners.forEach(listener => {
      try {
        listener(mutationData);
      } catch (error) {
        console.error('❌ Mutation listener error:', error);
      }
    });
  }

  /**
   * Get current mutation hooks status
   */
  getStatus() {
    return {
      mythicModeActive: this.mythicModeActive,
      vaultBroadcastActive: this.vaultBroadcastActive,
      queuedEvents: this.replayEventQueue.length,
      listeners: this.mutationListeners.length
    };
  }
}

// Export singleton instance
const mutationHooks = new MutationHooks();

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    mutationHooks.initialize();
  });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = mutationHooks;
}

// Export for ES6 modules
if (typeof window !== 'undefined') {
  window.mutationHooks = mutationHooks;
}