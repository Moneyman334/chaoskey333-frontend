/**
 * Temporal Echo Layer - Enhanced Implementation for PR #58
 * 
 * Features:
 * - Dynamic opacity breathing (20-40%) synced with bass pulses
 * - Gold-violet spectral color shifts during glyph decoding
 * - Motion drag trails for HUD elements
 * - Lore fragment flash overlays
 * - Auto-save echo state for replay consistency
 * - Historical evolution tied to relic consciousness
 */

class TemporalEchoLayer {
  constructor(options = {}) {
    this.options = {
      minOpacity: 0.2,
      maxOpacity: 0.4,
      breatheSpeed: 2000,
      colorShiftDuration: 1500,
      trailFadeTime: 800,
      fragmentFlashDuration: 100,
      bassThreshold: 0.3,
      ...options
    };

    this.isActive = false;
    this.currentOpacity = this.options.minOpacity;
    this.breatheDirection = 1;
    this.audioContext = null;
    this.analyser = null;
    this.bassFrequencyData = null;
    this.echoContainer = null;
    this.ghostOverlay = null;
    this.relicState = this.loadRelicState();
    this.motionTrails = new Map();
    this.fragmentQueue = [];
    
    this.init();
  }

  init() {
    this.createEchoContainer();
    this.createGhostOverlay();
    this.setupAudioAnalysis();
    this.bindEvents();
    this.startBreathingAnimation();
    
    console.log('🌀 Temporal Echo Layer initialized');
  }

  createEchoContainer() {
    this.echoContainer = document.createElement('div');
    this.echoContainer.id = 'temporal-echo-container';
    this.echoContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 1000;
      mix-blend-mode: screen;
      transition: opacity 0.1s ease-out;
    `;
    
    document.body.appendChild(this.echoContainer);
  }

  createGhostOverlay() {
    this.ghostOverlay = document.createElement('canvas');
    this.ghostOverlay.id = 'ghost-overlay';
    this.ghostOverlay.width = window.innerWidth;
    this.ghostOverlay.height = window.innerHeight;
    this.ghostOverlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: ${this.currentOpacity};
      background: radial-gradient(circle at 50% 50%, 
        rgba(255, 215, 0, 0.1) 0%,
        rgba(138, 43, 226, 0.05) 50%,
        transparent 70%);
      filter: blur(1px);
    `;
    
    this.echoContainer.appendChild(this.ghostOverlay);
  }

  setupAudioAnalysis() {
    try {
      // Try to connect to existing audio context or create new one
      const audioElement = document.getElementById('bassDrop');
      if (audioElement && !this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        
        const source = this.audioContext.createMediaElementSource(audioElement);
        source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
        
        this.bassFrequencyData = new Uint8Array(this.analyser.frequencyBinCount);
        console.log('🎵 Audio analysis connected');
      }
    } catch (error) {
      console.warn('⚠️ Audio analysis setup failed:', error);
      // Fallback to simulated bass pulses
      this.simulateBassPulses();
    }
  }

  simulateBassPulses() {
    // Fallback simulation for when audio analysis isn't available
    setInterval(() => {
      const intensity = Math.random() * 0.6 + 0.4; // 0.4-1.0
      this.processBassData(intensity);
    }, 800 + Math.random() * 400); // Variable timing
  }

  bindEvents() {
    window.addEventListener('resize', () => this.handleResize());
    
    // Listen for decode events
    document.addEventListener('chaoskey:decode:start', (e) => this.onDecodeStart(e.detail));
    document.addEventListener('chaoskey:decode:success', (e) => this.onDecodeSuccess(e.detail));
    document.addEventListener('chaoskey:decode:glyph', (e) => this.onGlyphUpdate(e.detail));
    
    // Listen for relic mutation events
    document.addEventListener('chaoskey:relic:mutate', (e) => this.onRelicMutation(e.detail));
  }

  startBreathingAnimation() {
    this.isActive = true;
    this.breatheLoop();
  }

  breatheLoop() {
    if (!this.isActive) return;

    // Get bass data for opacity sync
    let bassIntensity = 0.5; // Default
    if (this.analyser && this.bassFrequencyData) {
      this.analyser.getByteFrequencyData(this.bassFrequencyData);
      // Focus on bass frequencies (0-60Hz range)
      const bassRange = this.bassFrequencyData.slice(0, 8);
      bassIntensity = bassRange.reduce((sum, val) => sum + val, 0) / (bassRange.length * 255);
    }

    this.processBassData(bassIntensity);
    requestAnimationFrame(() => this.breatheLoop());
  }

  processBassData(intensity) {
    // Calculate opacity based on bass intensity
    const intensityFactor = Math.max(intensity, 0.3); // Minimum baseline
    const opacityRange = this.options.maxOpacity - this.options.minOpacity;
    const targetOpacity = this.options.minOpacity + (opacityRange * intensityFactor);
    
    // Smooth transition
    this.currentOpacity += (targetOpacity - this.currentOpacity) * 0.1;
    
    if (this.ghostOverlay) {
      this.ghostOverlay.style.opacity = this.currentOpacity;
      
      // Add bass-reactive glow effect
      if (intensity > this.options.bassThreshold) {
        this.ghostOverlay.style.filter = `blur(${1 + intensity}px) brightness(${1 + intensity * 0.5})`;
      }
    }
  }

  onDecodeStart(data) {
    this.addColorShiftEffect();
    console.log('🔮 Decode sequence started - Color shift active');
  }

  onDecodeSuccess(data) {
    this.flashLoreFragment(data);
    this.saveEchoState();
    console.log('✨ Decode success - Lore fragment flashed');
  }

  onGlyphUpdate(data) {
    if (data.element) {
      this.addMotionTrail(data.element, data.position);
    }
  }

  onRelicMutation(data) {
    this.relicState = { ...this.relicState, ...data };
    this.evolveGhostMemory();
    this.saveRelicState();
    console.log('🧬 Relic mutation detected - Ghost memory evolved');
  }

  addColorShiftEffect() {
    const colorShift = document.createElement('div');
    colorShift.className = 'echo-color-shift';
    colorShift.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(45deg, 
        rgba(255, 215, 0, 0.15) 0%,
        rgba(138, 43, 226, 0.1) 100%);
      opacity: 0;
      animation: colorShiftPulse ${this.options.colorShiftDuration}ms ease-out;
      pointer-events: none;
    `;
    
    this.echoContainer.appendChild(colorShift);
    
    // Remove after animation
    setTimeout(() => {
      if (colorShift.parentNode) {
        colorShift.parentNode.removeChild(colorShift);
      }
    }, this.options.colorShiftDuration);
  }

  addMotionTrail(element, position) {
    const trailId = `trail-${Date.now()}-${Math.random()}`;
    const trail = document.createElement('div');
    trail.className = 'echo-motion-trail';
    trail.style.cssText = `
      position: absolute;
      left: ${position.x}px;
      top: ${position.y}px;
      width: 4px;
      height: 4px;
      background: rgba(0, 255, 204, 0.6);
      border-radius: 50%;
      box-shadow: 0 0 8px rgba(0, 255, 204, 0.8);
      opacity: 1;
      animation: trailFade ${this.options.trailFadeTime}ms ease-out forwards;
      pointer-events: none;
    `;
    
    this.echoContainer.appendChild(trail);
    this.motionTrails.set(trailId, trail);
    
    // Clean up trail
    setTimeout(() => {
      if (trail.parentNode) {
        trail.parentNode.removeChild(trail);
      }
      this.motionTrails.delete(trailId);
    }, this.options.trailFadeTime);
  }

  flashLoreFragment(data) {
    const fragment = document.createElement('div');
    fragment.className = 'echo-lore-fragment';
    fragment.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-family: 'Courier New', monospace;
      font-size: 24px;
      color: rgba(255, 215, 0, 0.9);
      text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
      opacity: 0;
      animation: fragmentFlash ${this.options.fragmentFlashDuration}ms ease-out;
      pointer-events: none;
      z-index: 1001;
    `;
    
    // Generate mysterious glyph fragment based on decode data
    const glyphFragments = ['◊', '⧈', '⟡', '◈', '⬟', '⬢', '⟐', '◉'];
    const selectedGlyph = glyphFragments[Math.floor(Math.random() * glyphFragments.length)];
    fragment.textContent = selectedGlyph;
    
    this.echoContainer.appendChild(fragment);
    
    // Remove after flash
    setTimeout(() => {
      if (fragment.parentNode) {
        fragment.parentNode.removeChild(fragment);
      }
    }, this.options.fragmentFlashDuration * 2);
  }

  evolveGhostMemory() {
    // Adapt ghost overlay based on relic consciousness evolution
    const evolutionLevel = this.relicState.evolutionLevel || 0;
    const consciousness = this.relicState.consciousness || 'dormant';
    
    let backgroundGradient = 'radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.1) 0%, rgba(138, 43, 226, 0.05) 50%, transparent 70%)';
    
    if (consciousness === 'awakening') {
      backgroundGradient = 'radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.15) 0%, rgba(138, 43, 226, 0.08) 40%, rgba(0, 255, 255, 0.05) 70%, transparent 90%)';
    } else if (consciousness === 'evolved') {
      backgroundGradient = 'radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.2) 0%, rgba(138, 43, 226, 0.12) 30%, rgba(0, 255, 255, 0.08) 60%, rgba(255, 0, 128, 0.05) 80%, transparent 95%)';
    }
    
    if (this.ghostOverlay) {
      this.ghostOverlay.style.background = backgroundGradient;
      this.ghostOverlay.style.filter = `blur(${1 + evolutionLevel * 0.5}px)`;
    }
  }

  saveEchoState() {
    const echoState = {
      timestamp: Date.now(),
      opacity: this.currentOpacity,
      relicState: this.relicState,
      trails: Array.from(this.motionTrails.keys()),
      consciousness: this.relicState.consciousness || 'dormant'
    };
    
    localStorage.setItem('chaoskey:echo-state', JSON.stringify(echoState));
  }

  loadEchoState() {
    try {
      const saved = localStorage.getItem('chaoskey:echo-state');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.warn('⚠️ Failed to load echo state:', error);
      return {};
    }
  }

  saveRelicState() {
    localStorage.setItem('chaoskey:relic-state', JSON.stringify(this.relicState));
  }

  loadRelicState() {
    try {
      const saved = localStorage.getItem('chaoskey:relic-state');
      return saved ? JSON.parse(saved) : { evolutionLevel: 0, consciousness: 'dormant' };
    } catch (error) {
      console.warn('⚠️ Failed to load relic state:', error);
      return { evolutionLevel: 0, consciousness: 'dormant' };
    }
  }

  handleResize() {
    if (this.ghostOverlay) {
      this.ghostOverlay.width = window.innerWidth;
      this.ghostOverlay.height = window.innerHeight;
    }
  }

  destroy() {
    this.isActive = false;
    
    if (this.echoContainer && this.echoContainer.parentNode) {
      this.echoContainer.parentNode.removeChild(this.echoContainer);
    }
    
    if (this.audioContext) {
      this.audioContext.close();
    }
    
    console.log('🌀 Temporal Echo Layer destroyed');
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TemporalEchoLayer;
}

// Global exposure for script tag usage
window.TemporalEchoLayer = TemporalEchoLayer;