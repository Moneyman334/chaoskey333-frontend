/**
 * Cosmic Replay Terminal v2.0 - Ascension Edition
 * Handles test replay capsule generation and evolution to live lore capsules
 */

class CosmicReplayTerminal {
  constructor(config = {}) {
    this.version = "2.0 – Ascension Edition";
    this.config = {
      autoSave: true,
      indexedTimeline: true,
      mutationPlayback: true,
      exportFormats: ['mp4', 'gif', 'webm', 'nftMetadata'],
      ...config
    };
    
    this.isInitialized = false;
    this.testCapsules = new Map();
    this.liveCapsules = new Map();
    this.pulseScheduler = null;
    this.testResults = new Map();
    this.vaultFeedConnected = false;
    
    this.init();
  }

  async init() {
    console.log(`🌌 Initializing Cosmic Replay Terminal ${this.version}`);
    
    try {
      // Load master command configuration
      const masterConfig = await this.loadMasterConfig();
      this.config = { ...this.config, ...masterConfig };
      
      // Initialize pulse scheduler
      this.pulseScheduler = new VaultBroadcastPulseScheduler(this);
      
      // Connect to vault feed
      await this.connectToVaultFeed();
      
      this.isInitialized = true;
      console.log('✅ Cosmic Replay Terminal initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize Cosmic Replay Terminal:', error);
      throw error;
    }
  }

  async loadMasterConfig() {
    try {
      const response = await fetch('/config/master-command.json');
      const config = await response.json();
      return config.replayTerminal || {};
    } catch (error) {
      console.warn('⚠️ Could not load master config, using defaults');
      return {};
    }
  }

  async connectToVaultFeed() {
    // Simulate vault feed connection
    // In a real implementation, this would connect to the actual ChaosKey333 vault feed
    try {
      console.log('🔗 Connecting to ChaosKey333 vault feed...');
      
      // Check if vault feed endpoint is available
      const healthCheck = await fetch('/api/vault-feed/health').catch(() => null);
      
      if (healthCheck && healthCheck.ok) {
        this.vaultFeedConnected = true;
        console.log('✅ Connected to ChaosKey333 vault feed');
      } else {
        console.log('📡 Vault feed not available, using local mode');
        this.vaultFeedConnected = false;
      }
      
    } catch (error) {
      console.warn('⚠️ Vault feed connection failed, continuing in offline mode:', error);
      this.vaultFeedConnected = false;
    }
  }

  /**
   * Generate a test replay capsule with timestamp, pulse ID, and vault state snapshot
   */
  async generateReplayCapsule(testName, vaultState = {}) {
    if (!this.isInitialized) {
      throw new Error('Cosmic Replay Terminal not initialized');
    }

    const pulseId = this.generatePulseId();
    const timestamp = new Date().toISOString();
    
    console.log(`🧪 Generating test replay capsule: ${testName} (${pulseId})`);

    const capsule = {
      id: pulseId,
      type: 'test-replay',
      testName,
      timestamp,
      pulseId,
      vaultState: {
        connectedWallets: vaultState.connectedWallets || 0,
        activeTransactions: vaultState.activeTransactions || 0,
        mintedRelics: vaultState.mintedRelics || 0,
        vaultEnergy: vaultState.vaultEnergy || Math.random() * 100,
        cosmicResonance: vaultState.cosmicResonance || Math.random() * 10,
        ...vaultState
      },
      metadata: {
        version: this.version,
        generatedAt: timestamp,
        testEnvironment: true,
        formats: this.config.exportFormats
      },
      status: 'generated',
      testResults: null
    };

    // Store the test capsule
    this.testCapsules.set(pulseId, capsule);

    // Auto-save if enabled
    if (this.config.autoSave) {
      await this.saveCapsule(capsule);
    }

    // Schedule for pulse broadcasting
    this.pulseScheduler.schedule(capsule);

    console.log(`✅ Test replay capsule generated: ${pulseId}`);
    return capsule;
  }

  /**
   * Mark a test as passed and trigger capsule evolution to live lore capsule
   */
  async markTestPassed(pulseId, testResults = {}) {
    const testCapsule = this.testCapsules.get(pulseId);
    
    if (!testCapsule) {
      throw new Error(`Test capsule not found: ${pulseId}`);
    }

    console.log(`🧬 Test passed for capsule ${pulseId}, evolving to live lore capsule...`);

    // Update test results
    testCapsule.testResults = {
      passed: true,
      completedAt: new Date().toISOString(),
      results: testResults,
      stability: this.calculateStability(testResults)
    };

    this.testResults.set(pulseId, testCapsule.testResults);

    // Check if stable enough for evolution
    if (testCapsule.testResults.stability >= 0.8) {
      await this.evolveToLiveLoreCapsule(testCapsule);
    } else {
      console.log(`⚠️ Test stability too low (${testCapsule.testResults.stability}), keeping as test capsule`);
    }

    return testCapsule;
  }

  /**
   * Evolve a test replay capsule into a live lore capsule
   */
  async evolveToLiveLoreCapsule(testCapsule) {
    console.log(`🌟 Evolving capsule ${testCapsule.id} to live lore capsule...`);

    const liveCapsule = {
      ...testCapsule,
      id: this.generatePulseId(), // New ID for live capsule
      type: 'live-lore',
      parentTestId: testCapsule.id,
      evolvedAt: new Date().toISOString(),
      status: 'live',
      metadata: {
        ...testCapsule.metadata,
        testEnvironment: false,
        productionReady: true,
        ascensionEdition: true
      }
    };

    // Store the live capsule
    this.liveCapsules.set(liveCapsule.id, liveCapsule);

    // Export in all required formats
    await this.exportCapsuleFormats(liveCapsule);

    // Broadcast to vault feed
    if (this.vaultFeedConnected) {
      await this.broadcastToVaultFeed(liveCapsule);
    }

    // Update test capsule status
    testCapsule.status = 'evolved';
    testCapsule.liveCapsuleId = liveCapsule.id;

    console.log(`✨ Successfully evolved to live lore capsule: ${liveCapsule.id}`);
    return liveCapsule;
  }

  /**
   * Export capsule in multiple formats (4K MP4, WebM, NFT metadata)
   */
  async exportCapsuleFormats(capsule) {
    console.log(`📦 Exporting capsule ${capsule.id} in multiple formats...`);

    const exports = {};

    for (const format of this.config.exportFormats) {
      try {
        exports[format] = await this.exportFormat(capsule, format);
        console.log(`✅ Exported ${format} format for capsule ${capsule.id}`);
      } catch (error) {
        console.error(`❌ Failed to export ${format} format:`, error);
        exports[format] = { error: error.message };
      }
    }

    capsule.exports = exports;
    return exports;
  }

  async exportFormat(capsule, format) {
    // Simulate format export - in real implementation this would generate actual files
    const exportData = {
      format,
      capsuleId: capsule.id,
      timestamp: new Date().toISOString(),
      size: Math.floor(Math.random() * 100000000), // Random file size
      checksum: this.generateChecksum(capsule.id + format),
    };

    switch (format) {
      case 'mp4':
        exportData.resolution = '4K';
        exportData.codec = 'H.265';
        exportData.bitrate = '50Mbps';
        break;
      case 'webm':
        exportData.resolution = '4K';
        exportData.codec = 'VP9';
        exportData.bitrate = '45Mbps';
        break;
      case 'gif':
        exportData.resolution = '1080p';
        exportData.fps = 30;
        exportData.optimized = true;
        break;
      case 'nftMetadata':
        exportData.metadata = {
          name: `ChaosKey333 Lore Capsule #${capsule.id}`,
          description: `Ascension Edition lore capsule evolved from test ${capsule.parentTestId}`,
          attributes: [
            { trait_type: 'Type', value: capsule.type },
            { trait_type: 'Vault Energy', value: capsule.vaultState.vaultEnergy },
            { trait_type: 'Cosmic Resonance', value: capsule.vaultState.cosmicResonance },
            { trait_type: 'Evolved At', value: capsule.evolvedAt }
          ]
        };
        break;
    }

    return exportData;
  }

  /**
   * Broadcast live lore capsule to ChaosKey333 vault feed
   */
  async broadcastToVaultFeed(liveCapsule) {
    if (!this.vaultFeedConnected) {
      console.log('📡 Vault feed not connected, storing for later broadcast');
      return;
    }

    console.log(`📡 Broadcasting live lore capsule ${liveCapsule.id} to vault feed...`);

    try {
      const broadcastPayload = {
        capsuleId: liveCapsule.id,
        type: 'live-lore-capsule',
        timestamp: new Date().toISOString(),
        capsule: liveCapsule,
        targetAudience: 'keyholders',
        priority: 'real-time'
      };

      // Simulate broadcast to vault feed
      const response = await fetch('/api/vault-feed/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(broadcastPayload)
      }).catch(() => ({ ok: false }));

      if (response.ok) {
        liveCapsule.broadcastedAt = new Date().toISOString();
        liveCapsule.status = 'broadcasted';
        console.log(`✅ Successfully broadcasted capsule ${liveCapsule.id} to vault feed`);
      } else {
        throw new Error('Broadcast failed');
      }

    } catch (error) {
      console.error(`❌ Failed to broadcast capsule ${liveCapsule.id}:`, error);
      liveCapsule.broadcastError = error.message;
    }
  }

  /**
   * Calculate test stability score based on test results
   */
  calculateStability(testResults) {
    // Simple stability calculation - can be enhanced
    const factors = {
      passRate: testResults.passRate || 1,
      performance: testResults.performance || 1,
      consistency: testResults.consistency || 1,
      errorRate: 1 - (testResults.errorRate || 0)
    };

    const stability = Object.values(factors).reduce((sum, factor) => sum + factor, 0) / Object.keys(factors).length;
    return Math.max(0, Math.min(1, stability)); // Clamp between 0 and 1
  }

  /**
   * Save capsule to storage
   */
  async saveCapsule(capsule) {
    // In a real implementation, this would save to persistent storage
    console.log(`💾 Saving capsule ${capsule.id} to storage...`);
    
    try {
      localStorage.setItem(`capsule_${capsule.id}`, JSON.stringify(capsule));
      console.log(`✅ Capsule ${capsule.id} saved successfully`);
    } catch (error) {
      console.error(`❌ Failed to save capsule ${capsule.id}:`, error);
    }
  }

  /**
   * Utility methods
   */
  generatePulseId() {
    return `PULSE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateChecksum(input) {
    // Simple checksum - in real implementation use proper hashing
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Get status and statistics
   */
  getStatus() {
    return {
      version: this.version,
      initialized: this.isInitialized,
      testCapsules: this.testCapsules.size,
      liveCapsules: this.liveCapsules.size,
      vaultFeedConnected: this.vaultFeedConnected,
      config: this.config
    };
  }
}

/**
 * Vault Broadcast Pulse Scheduler
 * Manages timing and broadcasting of capsule pulses
 */
class VaultBroadcastPulseScheduler {
  constructor(terminal) {
    this.terminal = terminal;
    this.pulseQueue = [];
    this.isRunning = false;
    this.pulseInterval = 5000; // 5 seconds between pulses
    this.scheduledPulses = new Map();
  }

  schedule(capsule, delay = 0) {
    const scheduledTime = Date.now() + delay;
    
    console.log(`⏰ Scheduling pulse for capsule ${capsule.id} in ${delay}ms`);
    
    const scheduledPulse = {
      capsule,
      scheduledTime,
      id: this.terminal.generatePulseId()
    };

    this.scheduledPulses.set(scheduledPulse.id, scheduledPulse);
    this.pulseQueue.push(scheduledPulse);
    
    if (!this.isRunning) {
      this.start();
    }

    return scheduledPulse.id;
  }

  start() {
    if (this.isRunning) return;
    
    console.log('🔄 Starting Vault Broadcast Pulse Scheduler...');
    this.isRunning = true;
    this.processPulseQueue();
  }

  stop() {
    console.log('⏹️ Stopping Vault Broadcast Pulse Scheduler...');
    this.isRunning = false;
  }

  async processPulseQueue() {
    while (this.isRunning && this.pulseQueue.length > 0) {
      const now = Date.now();
      const readyPulses = this.pulseQueue.filter(pulse => pulse.scheduledTime <= now);

      for (const pulse of readyPulses) {
        await this.executePulse(pulse);
        this.pulseQueue = this.pulseQueue.filter(p => p.id !== pulse.id);
        this.scheduledPulses.delete(pulse.id);
      }

      // Wait before next check
      await new Promise(resolve => setTimeout(resolve, this.pulseInterval));
    }

    if (this.pulseQueue.length === 0) {
      this.isRunning = false;
      console.log('📡 Pulse queue empty, scheduler stopped');
    }
  }

  async executePulse(scheduledPulse) {
    const { capsule } = scheduledPulse;
    
    console.log(`📡 Executing pulse for capsule ${capsule.id}...`);

    try {
      // Update capsule status
      capsule.lastPulseAt = new Date().toISOString();
      
      // If it's a live capsule, broadcast it
      if (capsule.type === 'live-lore' && this.terminal.vaultFeedConnected) {
        await this.terminal.broadcastToVaultFeed(capsule);
      }

      console.log(`✅ Pulse executed successfully for capsule ${capsule.id}`);
      
    } catch (error) {
      console.error(`❌ Pulse execution failed for capsule ${capsule.id}:`, error);
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CosmicReplayTerminal, VaultBroadcastPulseScheduler };
} else if (typeof window !== 'undefined') {
  window.CosmicReplayTerminal = CosmicReplayTerminal;
  window.VaultBroadcastPulseScheduler = VaultBroadcastPulseScheduler;
}