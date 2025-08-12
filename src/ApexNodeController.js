/**
 * Apex Node Ignition Protocol - Master Controller
 * Automates the decode-evolution chain within the Sentinel Omniverse Evolution Graph
 */

class ApexNodeController {
  constructor() {
    this.isInitialized = false;
    this.spectralDecodeHUD = null;
    this.relicEvolutionTrigger = null;
    this.cosmicReplayTerminal = null;
    this.eventLogger = null;
    this.ignitionActive = false;
    this.mutationSeed = null;
    this.lastDecodeCheck = 0;
    this.checkInterval = 5000; // Check every 5 seconds
  }

  /**
   * Initialize the Apex Node with all required components
   */
  async initialize() {
    try {
      console.log("🔥 Initializing Apex Node Ignition Protocol...");
      
      // Initialize sub-components
      this.spectralDecodeHUD = new SpectralDecodeHUD();
      this.relicEvolutionTrigger = new RelicEvolutionTrigger();
      this.cosmicReplayTerminal = new CosmicReplayTerminal();
      this.eventLogger = new EventLogger();

      // Start the decode monitoring loop
      this.startDecodeMonitoring();
      
      this.isInitialized = true;
      this.eventLogger.log('APEX_NODE_INITIALIZED', { timestamp: Date.now() });
      
      console.log("✅ Apex Node Ignition Protocol initialized successfully");
      return true;
    } catch (error) {
      console.error("❌ Apex Node initialization failed:", error);
      return false;
    }
  }

  /**
   * Start monitoring for PR #23 decode success
   */
  startDecodeMonitoring() {
    setInterval(() => {
      this.checkDecodeSuccess();
    }, this.checkInterval);
  }

  /**
   * Check for PR #23 decode success and trigger evolution if found
   */
  async checkDecodeSuccess() {
    try {
      if (!this.spectralDecodeHUD) return;

      const decodeStatus = await this.spectralDecodeHUD.checkDecodeStatus();
      
      if (decodeStatus.success && !this.ignitionActive) {
        console.log("🎯 PR #23 Decode Success detected! Starting Apex Ignition...");
        
        // Extract mutation seed from solver's ChaosKey333 signature
        this.mutationSeed = await this.extractMutationSeed(decodeStatus.solverSignature);
        
        // Trigger the ignition sequence
        await this.initiateApexIgnition(decodeStatus);
      }
    } catch (error) {
      console.error("❌ Decode check failed:", error);
    }
  }

  /**
   * Extract mutation seed from solver's ChaosKey333 signature
   */
  async extractMutationSeed(solverSignature) {
    try {
      // Generate mutation seed from signature hash
      const encoder = new TextEncoder();
      const data = encoder.encode(solverSignature + "ChaosKey333");
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      console.log("🧬 Mutation seed extracted:", hashHex.substring(0, 16));
      this.eventLogger.log('MUTATION_SEED_EXTRACTED', { 
        seed: hashHex.substring(0, 16),
        solverSignature,
        timestamp: Date.now()
      });
      
      return hashHex.substring(0, 16);
    } catch (error) {
      console.error("❌ Mutation seed extraction failed:", error);
      return null;
    }
  }

  /**
   * Initiate the complete Apex Ignition sequence
   */
  async initiateApexIgnition(decodeStatus) {
    try {
      this.ignitionActive = true;
      
      console.log("⚡ APEX NODE IGNITION SEQUENCE INITIATED ⚡");
      this.eventLogger.log('APEX_IGNITION_START', { 
        decodeStatus,
        mutationSeed: this.mutationSeed,
        timestamp: Date.now()
      });

      // Phase 1: Trigger visual effects
      await this.triggerIgnitionEffects();
      
      // Phase 2: Auto-trigger PR #24 permanent evolution logic
      await this.triggerPermanentEvolution();
      
      // Phase 3: Propagate to all systems
      await this.propagateEvolution();
      
      // Phase 4: Complete ignition
      await this.completeIgnition();
      
      console.log("🌟 APEX IGNITION COMPLETE - Relic ascension mode activated");
      
    } catch (error) {
      console.error("❌ Apex ignition failed:", error);
      this.ignitionActive = false;
    }
  }

  /**
   * Trigger synced ignition effects
   */
  async triggerIgnitionEffects() {
    // Visual: Apex Node flare surges outward through neural conduits
    this.triggerApexFlare();
    
    // Audio: Dual bass pulse + solver resonance tone
    this.triggerAudioEffects();
    
    // Update UI with ignition status
    this.updateIgnitionDisplay();
    
    await this.sleep(2000); // Allow effects to play
  }

  /**
   * Trigger visual apex flare effects
   */
  triggerApexFlare() {
    const body = document.body;
    body.classList.add('apex-ignition-active');
    
    // Create dynamic flare elements
    const flareContainer = document.createElement('div');
    flareContainer.className = 'apex-flare-container';
    flareContainer.innerHTML = `
      <div class="singularity-core"></div>
      <div class="neural-conduit conduit-1"></div>
      <div class="neural-conduit conduit-2"></div>
      <div class="neural-conduit conduit-3"></div>
      <div class="neural-conduit conduit-4"></div>
    `;
    
    body.appendChild(flareContainer);
    
    // Remove after animation
    setTimeout(() => {
      if (flareContainer.parentNode) {
        flareContainer.parentNode.removeChild(flareContainer);
      }
    }, 5000);
  }

  /**
   * Trigger audio effects
   */
  triggerAudioEffects() {
    // Create dual bass pulse
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.playDualBassPulse(audioContext);
    
    // Play solver resonance tone
    setTimeout(() => {
      this.playSolverResonance(audioContext);
    }, 1000);
  }

  /**
   * Play dual bass pulse
   */
  playDualBassPulse(audioContext) {
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator1.frequency.setValueAtTime(60, audioContext.currentTime); // Low bass
    oscillator2.frequency.setValueAtTime(80, audioContext.currentTime); // Slightly higher bass
    
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
    
    oscillator1.start();
    oscillator2.start();
    oscillator1.stop(audioContext.currentTime + 2);
    oscillator2.stop(audioContext.currentTime + 2);
  }

  /**
   * Play solver resonance tone
   */
  playSolverResonance(audioContext) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.frequency.setValueAtTime(432, audioContext.currentTime); // Sacred frequency
    oscillator.type = 'sine';
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 3);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 3);
  }

  /**
   * Update ignition display
   */
  updateIgnitionDisplay() {
    const statusElement = document.getElementById('mintStatus') || document.getElementById('apexStatus');
    if (statusElement) {
      statusElement.innerHTML = '⚡ APEX IGNITION ACTIVE - Neural conduits charging...';
      statusElement.classList.add('apex-ignition-text');
    }
  }

  /**
   * Auto-trigger PR #24 permanent evolution logic
   */
  async triggerPermanentEvolution() {
    if (!this.relicEvolutionTrigger) return;
    
    console.log("🧬 Triggering PR #24 Permanent Relic Evolution...");
    
    const evolutionResult = await this.relicEvolutionTrigger.triggerEvolution({
      mutationSeed: this.mutationSeed,
      ignitionTimestamp: Date.now(),
      solverImprint: this.spectralDecodeHUD.getLastSolverImprint()
    });
    
    this.eventLogger.log('PERMANENT_EVOLUTION_TRIGGERED', evolutionResult);
    return evolutionResult;
  }

  /**
   * Propagate evolution to all systems
   */
  async propagateEvolution() {
    console.log("📡 Propagating evolution to all vault clients...");
    
    if (this.cosmicReplayTerminal) {
      await this.cosmicReplayTerminal.broadcastEvolution({
        mutationSeed: this.mutationSeed,
        timestamp: Date.now(),
        evolutionLevel: 'APEX'
      });
    }
  }

  /**
   * Complete the ignition sequence
   */
  async completeIgnition() {
    // Update archive with solver imprint and completion seal
    this.updateArchive();
    
    // Mark ignition as complete
    this.ignitionActive = false;
    
    this.eventLogger.log('APEX_IGNITION_COMPLETE', {
      timestamp: Date.now(),
      mutationSeed: this.mutationSeed,
      status: 'COMPLETE'
    });
    
    // Update final display
    const statusElement = document.getElementById('mintStatus') || document.getElementById('apexStatus');
    if (statusElement) {
      statusElement.innerHTML = '🌟 APEX IGNITION COMPLETE - Autonomous relic ascension mode activated';
      statusElement.classList.add('ignition-complete');
    }
  }

  /**
   * Update archive with solver imprint and completion seal
   */
  updateArchive() {
    const archive = {
      solverImprint: this.spectralDecodeHUD?.getLastSolverImprint() || 'UNKNOWN',
      completionSeal: 'APEX_IGNITION_COMPLETE',
      timestamp: Date.now(),
      mutationSeed: this.mutationSeed,
      blockchainHash: null // Will be set when blockchain interaction occurs
    };
    
    localStorage.setItem('apexArchive', JSON.stringify(archive));
    console.log("📜 Archive updated with Apex Ignition Complete seal");
  }

  /**
   * Utility function for delays
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      ignitionActive: this.ignitionActive,
      mutationSeed: this.mutationSeed,
      lastDecodeCheck: this.lastDecodeCheck
    };
  }
}

// Export for use in other modules
window.ApexNodeController = ApexNodeController;