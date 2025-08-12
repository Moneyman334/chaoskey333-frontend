/**
 * Spectral Decode HUD - PR #23 Component
 * Handles decode operations and success detection for the Apex Node Ignition Protocol
 */

class SpectralDecodeHUD {
  constructor() {
    this.isActive = false;
    this.lastSolverImprint = null;
    this.decodeHistory = [];
    this.currentDecodeSession = null;
    this.decodeSuccessThreshold = 0.85; // 85% success rate for ignition
    this.solverSignatures = new Map();
  }

  /**
   * Initialize the Spectral Decode HUD
   */
  initialize() {
    try {
      console.log("🔍 Initializing Spectral Decode HUD...");
      this.createHUDElements();
      this.isActive = true;
      console.log("✅ Spectral Decode HUD initialized");
      return true;
    } catch (error) {
      console.error("❌ Spectral Decode HUD initialization failed:", error);
      return false;
    }
  }

  /**
   * Create HUD visual elements
   */
  createHUDElements() {
    const existingHUD = document.getElementById('spectralDecodeHUD');
    if (existingHUD) {
      existingHUD.remove();
    }

    const hudContainer = document.createElement('div');
    hudContainer.id = 'spectralDecodeHUD';
    hudContainer.className = 'spectral-decode-hud';
    hudContainer.innerHTML = `
      <div class="hud-header">
        <span class="hud-title">⊗ SPECTRAL DECODE HUD ⊗</span>
        <span class="hud-status" id="decodeStatus">MONITORING</span>
      </div>
      <div class="decode-grid">
        <div class="decode-channel" id="channel1">
          <div class="channel-label">ΩX1</div>
          <div class="spectral-bar"><div class="bar-fill"></div></div>
        </div>
        <div class="decode-channel" id="channel2">
          <div class="channel-label">ΩX2</div>
          <div class="spectral-bar"><div class="bar-fill"></div></div>
        </div>
        <div class="decode-channel" id="channel3">
          <div class="channel-label">ΩX3</div>
          <div class="spectral-bar"><div class="bar-fill"></div></div>
        </div>
        <div class="decode-channel" id="channel4">
          <div class="channel-label">ΩX4</div>
          <div class="spectral-bar"><div class="bar-fill"></div></div>
        </div>
      </div>
      <div class="solver-input-section">
        <input type="text" id="solverSignatureInput" placeholder="Enter ChaosKey333 signature..." class="signature-input">
        <button id="initiateDecode" class="decode-button">INITIATE DECODE</button>
      </div>
      <div class="decode-results" id="decodeResults">
        Awaiting solver input...
      </div>
    `;

    document.body.appendChild(hudContainer);
    this.bindHUDEvents();
  }

  /**
   * Bind HUD event listeners
   */
  bindHUDEvents() {
    const initiateButton = document.getElementById('initiateDecode');
    const signatureInput = document.getElementById('solverSignatureInput');

    if (initiateButton) {
      initiateButton.addEventListener('click', () => {
        this.initiateDecodeSequence();
      });
    }

    if (signatureInput) {
      signatureInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.initiateDecodeSequence();
        }
      });
    }
  }

  /**
   * Initiate a decode sequence
   */
  async initiateDecodeSequence() {
    const signatureInput = document.getElementById('solverSignatureInput');
    const signature = signatureInput?.value?.trim();

    if (!signature) {
      this.updateResults("❌ ChaosKey333 signature required");
      return;
    }

    console.log("🔍 Initiating spectral decode sequence...");
    this.updateHUDStatus("DECODING");
    this.updateResults("⚡ Spectral decode initiated...");

    // Start decode animation
    this.animateDecodeChannels();

    // Process the signature
    const decodeResult = await this.processSignature(signature);
    
    // Store session data
    this.currentDecodeSession = {
      signature,
      result: decodeResult,
      timestamp: Date.now(),
      sessionId: this.generateSessionId()
    };

    this.decodeHistory.push(this.currentDecodeSession);
    this.lastSolverImprint = this.extractSolverImprint(signature);

    // Update display based on result
    if (decodeResult.success) {
      this.handleDecodeSuccess(decodeResult);
    } else {
      this.handleDecodeFailed(decodeResult);
    }
  }

  /**
   * Process a solver signature and determine decode success
   */
  async processSignature(signature) {
    return new Promise((resolve) => {
      // Simulate complex decode processing
      setTimeout(() => {
        const signatureHash = this.hashSignature(signature);
        const spectralCoherence = this.calculateSpectralCoherence(signatureHash);
        const omnipattern = this.extractOmnipattern(signatureHash);
        const quantumResonance = this.measureQuantumResonance(signature);

        const success = spectralCoherence >= this.decodeSuccessThreshold;

        resolve({
          success,
          spectralCoherence,
          omnipattern,
          quantumResonance,
          signatureHash,
          decodedAt: Date.now()
        });
      }, 3000); // 3 second decode process
    });
  }

  /**
   * Calculate spectral coherence from signature hash
   */
  calculateSpectralCoherence(hash) {
    // Convert hash to numeric values and calculate coherence
    let coherence = 0;
    for (let i = 0; i < hash.length; i += 2) {
      const byte = parseInt(hash.substr(i, 2), 16);
      coherence += Math.sin(byte * 0.024543692) * 0.1;
    }
    return Math.abs(coherence) % 1;
  }

  /**
   * Extract omnipattern from hash
   */
  extractOmnipattern(hash) {
    const patterns = ['NEXUS', 'VORTEX', 'MATRIX', 'FLUX', 'APEX'];
    const index = parseInt(hash.substr(0, 2), 16) % patterns.length;
    return patterns[index];
  }

  /**
   * Measure quantum resonance
   */
  measureQuantumResonance(signature) {
    const chaosFactors = signature.match(/chaos|key|333|omega|alpha/gi);
    return (chaosFactors?.length || 0) * 0.15;
  }

  /**
   * Hash a signature
   */
  hashSignature(signature) {
    let hash = 0;
    for (let i = 0; i < signature.length; i++) {
      const char = signature.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Extract solver imprint from signature
   */
  extractSolverImprint(signature) {
    const timestamp = Date.now();
    const hash = this.hashSignature(signature);
    return `SOLVER_${hash.substring(0, 8)}_${timestamp}`;
  }

  /**
   * Generate session ID
   */
  generateSessionId() {
    return 'DEC_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  /**
   * Handle successful decode
   */
  handleDecodeSuccess(result) {
    console.log("✅ Spectral decode SUCCESS! Coherence:", result.spectralCoherence);
    
    this.updateHUDStatus("SUCCESS");
    this.updateResults(`
      🌟 DECODE SUCCESS 🌟<br>
      Spectral Coherence: ${(result.spectralCoherence * 100).toFixed(1)}%<br>
      Omnipattern: ${result.omnipattern}<br>
      Quantum Resonance: ${result.quantumResonance.toFixed(3)}<br>
      <span class="success-indicator">⚡ READY FOR APEX IGNITION ⚡</span>
    `);

    // Trigger success animation
    this.triggerSuccessAnimation();

    // Store solver signature for Apex Node
    this.solverSignatures.set(this.currentDecodeSession.sessionId, {
      signature: this.currentDecodeSession.signature,
      result,
      timestamp: Date.now()
    });
  }

  /**
   * Handle failed decode
   */
  handleDecodeFailed(result) {
    console.log("❌ Spectral decode FAILED. Coherence:", result.spectralCoherence);
    
    this.updateHUDStatus("FAILED");
    this.updateResults(`
      ❌ DECODE FAILED<br>
      Spectral Coherence: ${(result.spectralCoherence * 100).toFixed(1)}% (Minimum: 85%)<br>
      Omnipattern: ${result.omnipattern}<br>
      <span class="failure-indicator">Insufficient coherence for ignition</span>
    `);

    // Reset for next attempt
    setTimeout(() => {
      this.updateHUDStatus("MONITORING");
      this.updateResults("Awaiting solver input...");
    }, 5000);
  }

  /**
   * Animate decode channels
   */
  animateDecodeChannels() {
    for (let i = 1; i <= 4; i++) {
      const channel = document.getElementById(`channel${i}`);
      const barFill = channel?.querySelector('.bar-fill');
      
      if (barFill) {
        barFill.style.animation = 'none';
        setTimeout(() => {
          barFill.style.animation = 'spectralPulse 3s ease-in-out';
        }, i * 200);
      }
    }
  }

  /**
   * Trigger success animation
   */
  triggerSuccessAnimation() {
    const hud = document.getElementById('spectralDecodeHUD');
    if (hud) {
      hud.classList.add('decode-success');
      setTimeout(() => {
        hud.classList.remove('decode-success');
      }, 2000);
    }
  }

  /**
   * Update HUD status display
   */
  updateHUDStatus(status) {
    const statusElement = document.getElementById('decodeStatus');
    if (statusElement) {
      statusElement.textContent = status;
      statusElement.className = `hud-status status-${status.toLowerCase()}`;
    }
  }

  /**
   * Update results display
   */
  updateResults(message) {
    const resultsElement = document.getElementById('decodeResults');
    if (resultsElement) {
      resultsElement.innerHTML = message;
    }
  }

  /**
   * Check current decode status (called by Apex Node)
   */
  async checkDecodeStatus() {
    if (!this.currentDecodeSession) {
      return { success: false, reason: 'NO_ACTIVE_SESSION' };
    }

    const session = this.currentDecodeSession;
    
    if (session.result.success) {
      return {
        success: true,
        solverSignature: session.signature,
        spectralCoherence: session.result.spectralCoherence,
        omnipattern: session.result.omnipattern,
        sessionId: session.sessionId,
        timestamp: session.timestamp
      };
    }

    return { 
      success: false, 
      reason: 'INSUFFICIENT_COHERENCE',
      coherence: session.result.spectralCoherence 
    };
  }

  /**
   * Get last solver imprint
   */
  getLastSolverImprint() {
    return this.lastSolverImprint;
  }

  /**
   * Get decode history
   */
  getDecodeHistory() {
    return this.decodeHistory;
  }

  /**
   * Reset decode session
   */
  resetSession() {
    this.currentDecodeSession = null;
    this.updateHUDStatus("MONITORING");
    this.updateResults("Awaiting solver input...");
    
    const signatureInput = document.getElementById('solverSignatureInput');
    if (signatureInput) {
      signatureInput.value = '';
    }
  }

  /**
   * Hide/Show HUD
   */
  toggleVisibility() {
    const hud = document.getElementById('spectralDecodeHUD');
    if (hud) {
      hud.style.display = hud.style.display === 'none' ? 'block' : 'none';
    }
  }
}

// Export for use in other modules
window.SpectralDecodeHUD = SpectralDecodeHUD;