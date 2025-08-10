// Circuit Linking Module
// Vault Broadcast Pulse → Replay Terminal Core → Spectral Decode HUD
// Evolution Hooks and ChaosKey333 Glyph Override integration

import { OMNI_SINGULARITY_CONFIG, REPLAY_EVENT_TYPES, omniLog } from './omni-singularity-config.js';

export class CircuitLinkingSystem {
  constructor() {
    this.isInitialized = false;
    this.vaultBroadcastTimer = null;
    this.glyphOverrideCounter = 0;
    this.ascensionPathwayActive = false;
    this.relicMutationBuffer = [];
    this.circuitHealth = new Map();
    
    // Circuit components
    this.circuits = {
      'vault_to_replay': {
        id: 'vault_to_replay',
        name: 'Vault Broadcast → Replay Terminal',
        active: false,
        dataFlow: 0,
        health: 100,
        lastPulse: 0
      },
      'replay_to_spectral': {
        id: 'replay_to_spectral',
        name: 'Replay Terminal → Spectral HUD',
        active: false,
        dataFlow: 0,
        health: 100,
        lastPulse: 0
      },
      'ascension_pathway': {
        id: 'ascension_pathway',
        name: 'Ascension Pathway Circuit',
        active: OMNI_SINGULARITY_CONFIG.ASCENSION_PATHWAY_ENABLED,
        dataFlow: 0,
        health: 100,
        lastPulse: 0
      },
      'glyph_override': {
        id: 'glyph_override',
        name: 'ChaosKey333 Glyph Override',
        active: OMNI_SINGULARITY_CONFIG.CHAOSKEY_GLYPH_OVERRIDE_ENABLED,
        dataFlow: 0,
        health: 100,
        lastPulse: 0
      }
    };
    
    omniLog('Circuit Linking System initializing...', 'info');
  }
  
  initialize() {
    this.setupEventListeners();
    this.startVaultBroadcastPulse();
    this.initializeEvolutionHooks();
    this.startCircuitHealthMonitoring();
    
    this.isInitialized = true;
    omniLog('Circuit Linking System initialized successfully', 'success');
    
    // Send initial status to all connected components
    this.broadcastCircuitStatus();
    
    return true;
  }
  
  setupEventListeners() {
    // Listen for wallet connections to trigger initial vault broadcast
    document.addEventListener('walletConnected', (e) => {
      this.handleWalletConnection(e.detail);
    });
    
    // Listen for relic minting to trigger mutations
    document.addEventListener('relicMinted', (e) => {
      this.handleRelicMinting(e.detail);
    });
    
    // Listen for audio events that might trigger glyph overrides
    document.addEventListener('audioEvent', (e) => {
      this.handleAudioEvent(e.detail);
    });
    
    // Listen for manual glyph activations
    document.addEventListener('manualGlyphActivation', (e) => {
      this.handleManualGlyphActivation(e.detail);
    });
    
    // Listen for PR #24 relic mutation events
    document.addEventListener('pr24RelicMutation', (e) => {
      this.handlePR24RelicMutation(e.detail);
    });
  }
  
  startVaultBroadcastPulse() {
    const broadcastPulse = () => {
      if (this.isInitialized) {
        this.triggerVaultBroadcastPulse();
        this.scheduleNextBroadcast();
      }
    };
    
    // Initial broadcast after a short delay
    setTimeout(broadcastPulse, 2000);
  }
  
  scheduleNextBroadcast() {
    const interval = OMNI_SINGULARITY_CONFIG.VAULT_BROADCAST_PULSE_INTERVAL;
    const jitter = Math.random() * 1000; // Add some randomness
    
    this.vaultBroadcastTimer = setTimeout(() => {
      this.triggerVaultBroadcastPulse();
      this.scheduleNextBroadcast();
    }, interval + jitter);
  }
  
  triggerVaultBroadcastPulse() {
    const pulseData = {
      id: 'vault_pulse_' + Date.now(),
      timestamp: Date.now(),
      energy: 50 + (Math.random() * 50), // 50-100% energy
      frequency: 333 + (Math.random() * 200), // 333-533 Hz (ChaosKey reference)
      source: 'frankenstein_vault',
      circuitPath: ['vault_to_replay', 'replay_to_spectral']
    };
    
    // Update vault to replay circuit
    this.updateCircuitActivity('vault_to_replay', pulseData);
    
    // Dispatch vault broadcast pulse event
    document.dispatchEvent(new CustomEvent('vaultBroadcastPulse', {
      detail: pulseData
    }));
    
    omniLog(`Vault Broadcast Pulse triggered (${pulseData.energy.toFixed(1)}% energy)`, 'info');
    
    // Chain to replay terminal after a short delay
    setTimeout(() => {
      this.chainToReplayTerminal(pulseData);
    }, 500);
  }
  
  chainToReplayTerminal(vaultData) {
    // Update replay to spectral circuit
    this.updateCircuitActivity('replay_to_spectral', vaultData);
    
    // Create spectral decode data
    const spectralData = {
      ...vaultData,
      id: 'spectral_decode_' + Date.now(),
      source: 'replay_terminal',
      decodedFrequency: vaultData.frequency * 1.618, // Golden ratio transformation
      harmonics: this.generateHarmonics(vaultData.frequency),
      glyphPattern: this.generateGlyphPattern(vaultData.energy)
    };
    
    // Dispatch to Spectral Decode HUD
    document.dispatchEvent(new CustomEvent('spectralDecodeUpdate', {
      detail: spectralData
    }));
    
    // Trigger glyph pulse if energy is high enough
    if (vaultData.energy > 75) {
      document.dispatchEvent(new CustomEvent('glyphPulseDetected', {
        detail: {
          type: 'vault_harmonic',
          intensity: vaultData.energy,
          frequency: spectralData.decodedFrequency,
          pattern: spectralData.glyphPattern
        }
      }));
    }
    
    omniLog('Circuit chain completed: Vault → Replay → Spectral HUD', 'success');
  }
  
  initializeEvolutionHooks() {
    if (OMNI_SINGULARITY_CONFIG.ASCENSION_PATHWAY_ENABLED) {
      omniLog('Ascension Pathway evolution hooks activated', 'info');
      this.activateAscensionPathway();
    }
    
    if (OMNI_SINGULARITY_CONFIG.RELIC_MUTATION_ARCHIVE_ENABLED) {
      omniLog('PR #24 Relic Mutation archival system activated', 'info');
      this.initializeRelicMutationArchive();
    }
  }
  
  activateAscensionPathway() {
    this.ascensionPathwayActive = true;
    this.updateCircuitActivity('ascension_pathway', {
      status: 'ascending',
      pathway: 'chaos_to_order',
      phase: 'initialization',
      timestamp: Date.now()
    });
    
    // Periodically check for ascension triggers
    setInterval(() => {
      this.checkAscensionTriggers();
    }, 10000); // Check every 10 seconds
  }
  
  checkAscensionTriggers() {
    // Check if multiple circuits are active and healthy
    const activeCircuits = Object.values(this.circuits).filter(c => c.active && c.health > 70);
    const totalDataFlow = activeCircuits.reduce((sum, c) => sum + c.dataFlow, 0);
    
    if (activeCircuits.length >= 3 && totalDataFlow > 200) {
      this.triggerAscensionEvent();
    }
  }
  
  triggerAscensionEvent() {
    const ascensionData = {
      id: 'ascension_' + Date.now(),
      type: 'pathway_convergence',
      activeCircuits: Object.values(this.circuits).filter(c => c.active).length,
      totalDataFlow: Object.values(this.circuits).reduce((sum, c) => sum + c.dataFlow, 0),
      timestamp: Date.now()
    };
    
    // Archive as replay event
    document.dispatchEvent(new CustomEvent('replayEventQueued', {
      detail: {
        type: REPLAY_EVENT_TYPES.ASCENSION_PATHWAY,
        data: ascensionData
      }
    }));
    
    omniLog('Ascension Event triggered - pathway convergence detected', 'success');
    
    // Update ascension circuit
    this.updateCircuitActivity('ascension_pathway', {
      ...ascensionData,
      phase: 'convergence_achieved'
    });
  }
  
  initializeRelicMutationArchive() {
    // Set up PR #24 integration for relic mutation logging
    setInterval(() => {
      this.processRelicMutationBuffer();
    }, 5000); // Process every 5 seconds
  }
  
  handleWalletConnection(detail) {
    omniLog(`Wallet connected: ${detail.walletType} - ${detail.address}`, 'info');
    
    // Trigger immediate vault broadcast pulse
    setTimeout(() => {
      this.triggerVaultBroadcastPulse();
    }, 1000);
    
    // Activate glyph override monitoring
    this.activateGlyphOverrideMonitoring();
  }
  
  handleRelicMinting(detail) {
    // Generate relic mutation data
    const mutationData = {
      id: 'mutation_' + Date.now(),
      relicId: detail.relicId || 'unknown',
      walletAddress: detail.walletAddress,
      mutationType: this.generateMutationType(),
      mutationIndex: Math.floor(Math.random() * 1000),
      energySignature: Math.random() * 100,
      timestamp: Date.now(),
      pr24Integration: true
    };
    
    this.relicMutationBuffer.push(mutationData);
    
    omniLog(`Relic mutation detected: ${mutationData.mutationType}`, 'info');
    
    // Trigger mutation replay event
    document.dispatchEvent(new CustomEvent('relicMutation', {
      detail: mutationData
    }));
  }
  
  handleAudioEvent(detail) {
    // Check if audio event could trigger glyph override
    if (detail.type === 'bass_drop' || detail.intensity > 80) {
      this.incrementGlyphOverrideCounter();
    }
  }
  
  handleManualGlyphActivation(detail) {
    this.incrementGlyphOverrideCounter();
    
    // Update glyph override circuit
    this.updateCircuitActivity('glyph_override', {
      activation: 'manual',
      ...detail
    });
  }
  
  handlePR24RelicMutation(detail) {
    // Direct PR #24 integration
    const mutationArchive = {
      ...detail,
      pr24Integration: true,
      archivedAt: Date.now(),
      archiveType: 'direct_pr24_link'
    };
    
    this.relicMutationBuffer.push(mutationArchive);
    
    omniLog('PR #24 Relic Mutation linked and archived', 'success');
  }
  
  incrementGlyphOverrideCounter() {
    this.glyphOverrideCounter++;
    
    omniLog(`Glyph activation count: ${this.glyphOverrideCounter}`, 'info');
    
    // Check if threshold reached for ChaosKey333 override
    if (this.glyphOverrideCounter >= OMNI_SINGULARITY_CONFIG.GLYPH_DETECTION_THRESHOLD) {
      this.triggerChaosKeyGlyphOverride();
      this.glyphOverrideCounter = 0; // Reset counter
    }
  }
  
  triggerChaosKeyGlyphOverride() {
    const overrideData = {
      id: 'chaoskey_override_' + Date.now(),
      type: 'chaoskey333_glyph_override',
      activationCount: this.glyphOverrideCounter,
      energyAmplification: 150, // 150% amplification
      immediateReplayPush: true,
      timestamp: Date.now()
    };
    
    // Update glyph override circuit with maximum activity
    this.updateCircuitActivity('glyph_override', {
      ...overrideData,
      dataFlow: 100,
      health: 100
    });
    
    // Trigger immediate live replay override
    document.dispatchEvent(new CustomEvent('chaosKeyGlyphOverride', {
      detail: overrideData
    }));
    
    omniLog('🔥 CHAOSKEY333 GLYPH OVERRIDE ACTIVATED! 🔥', 'success');
    
    // Amplify all circuit activity
    this.amplifyAllCircuits(overrideData.energyAmplification);
  }
  
  amplifyAllCircuits(amplificationPercent) {
    Object.values(this.circuits).forEach(circuit => {
      if (circuit.active) {
        circuit.dataFlow = Math.min(100, circuit.dataFlow * (amplificationPercent / 100));
        circuit.health = Math.min(100, circuit.health * 1.1);
        circuit.lastPulse = Date.now();
      }
    });
    
    this.broadcastCircuitStatus();
    omniLog(`All circuits amplified by ${amplificationPercent}%`, 'success');
  }
  
  processRelicMutationBuffer() {
    if (this.relicMutationBuffer.length === 0) return;
    
    const mutations = this.relicMutationBuffer.splice(0, 10); // Process up to 10 at a time
    
    mutations.forEach(mutation => {
      // Archive as replay event
      document.dispatchEvent(new CustomEvent('replayEventQueued', {
        detail: {
          type: REPLAY_EVENT_TYPES.RELIC_MUTATION,
          data: mutation
        }
      }));
    });
    
    omniLog(`Processed ${mutations.length} relic mutations for replay archival`, 'info');
  }
  
  updateCircuitActivity(circuitId, data) {
    const circuit = this.circuits[circuitId];
    if (!circuit) return;
    
    // Update circuit properties
    circuit.active = true;
    circuit.dataFlow = Math.min(100, (circuit.dataFlow + 20 + (Math.random() * 30)));
    circuit.health = Math.min(100, circuit.health + 5);
    circuit.lastPulse = Date.now();
    
    // Broadcast circuit update
    document.dispatchEvent(new CustomEvent('circuitStatusUpdate', {
      detail: {
        circuitId: circuitId,
        ...circuit,
        updateData: data
      }
    }));
  }
  
  startCircuitHealthMonitoring() {
    setInterval(() => {
      this.updateCircuitHealth();
    }, 2000); // Update every 2 seconds
  }
  
  updateCircuitHealth() {
    const now = Date.now();
    
    Object.values(this.circuits).forEach(circuit => {
      if (circuit.active) {
        // Slowly degrade health and data flow over time
        const timeSinceLastPulse = now - circuit.lastPulse;
        
        if (timeSinceLastPulse > 10000) { // 10 seconds without activity
          circuit.health = Math.max(20, circuit.health - 2);
          circuit.dataFlow = Math.max(0, circuit.dataFlow - 5);
        }
        
        // Circuit becomes inactive if health drops too low
        if (circuit.health < 30) {
          circuit.active = false;
          circuit.dataFlow = 0;
        }
      }
    });
    
    // Broadcast status periodically
    if (Math.random() < 0.3) { // 30% chance each cycle
      this.broadcastCircuitStatus();
    }
  }
  
  broadcastCircuitStatus() {
    const statusSummary = {
      totalCircuits: Object.keys(this.circuits).length,
      activeCircuits: Object.values(this.circuits).filter(c => c.active).length,
      averageHealth: Object.values(this.circuits).reduce((sum, c) => sum + c.health, 0) / Object.keys(this.circuits).length,
      totalDataFlow: Object.values(this.circuits).reduce((sum, c) => sum + c.dataFlow, 0),
      circuits: this.circuits,
      timestamp: Date.now()
    };
    
    // Send to all components
    document.dispatchEvent(new CustomEvent('omniSingularityStatus', {
      detail: statusSummary
    }));
  }
  
  generateMutationType() {
    const types = [
      'harmonic_resonance',
      'frequency_shift',
      'energy_amplification',
      'spectral_inversion',
      'chaos_alignment',
      'temporal_distortion'
    ];
    return types[Math.floor(Math.random() * types.length)];
  }
  
  generateHarmonics(baseFrequency) {
    return [
      baseFrequency * 2,      // Octave
      baseFrequency * 3,      // Perfect fifth
      baseFrequency * 4,      // Double octave
      baseFrequency * 1.618,  // Golden ratio
      baseFrequency * 0.618   // Inverse golden ratio
    ];
  }
  
  generateGlyphPattern(energy) {
    const patterns = ['spiral', 'pentagon', 'hexagon', 'infinity', 'chaos'];
    const patternIndex = Math.floor(energy / 20); // 0-4 based on energy level
    return patterns[Math.min(patternIndex, patterns.length - 1)];
  }
  
  getSystemStatus() {
    return {
      initialized: this.isInitialized,
      circuits: this.circuits,
      glyphOverrideCounter: this.glyphOverrideCounter,
      ascensionPathwayActive: this.ascensionPathwayActive,
      mutationBufferSize: this.relicMutationBuffer.length,
      timestamp: Date.now()
    };
  }
  
  destroy() {
    this.isInitialized = false;
    
    if (this.vaultBroadcastTimer) {
      clearTimeout(this.vaultBroadcastTimer);
    }
    
    // Clear all intervals and timers
    // (In a real implementation, we'd track these)
    
    omniLog('Circuit Linking System destroyed', 'info');
  }
}

// CSS for circuit status indicators
export const CIRCUIT_LINKING_STYLES = `
  .circuit-status-overlay {
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.8);
    border: 1px solid #00ffcc;
    border-radius: 5px;
    padding: 10px;
    font-family: 'Courier New', monospace;
    font-size: 0.7rem;
    color: #00ffcc;
    z-index: 1000;
    min-width: 200px;
  }
  
  .circuit-status-title {
    color: #ffcc00;
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .circuit-status-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 2px;
  }
  
  .circuit-active {
    color: #00ff00;
  }
  
  .circuit-inactive {
    color: #666;
  }
  
  .circuit-degraded {
    color: #ffaa00;
  }
`;