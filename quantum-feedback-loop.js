// PR #28 - Quantum Feedback Loop
// Feeds viewer interactions back into the relic, mutating visual and audio layers

class QuantumFeedbackLoop {
  constructor() {
    this.isActive = false;
    this.engagementLevel = 0;
    this.maxEngagement = 100;
    this.interactionHistory = [];
    this.feedbackHalo = null;
    this.pulseAmplifiers = [];
    this.mutationStates = ['DORMANT', 'STIRRING', 'RESONANT', 'AMPLIFIED', 'TRANSCENDENT'];
    this.currentState = 0;
    this.audioContext = null;
    this.oscillator = null;
  }

  initialize() {
    console.log("🌀 Initializing Quantum Feedback Loop...");
    this.createFeedbackHalo();
    this.createPulseAmplifiers();
    this.initializeAudioContext();
    this.attachInteractionListeners();
    return this;
  }

  createFeedbackHalo() {
    // Create the feedback halo that responds to interactions
    this.feedbackHalo = document.createElement('div');
    this.feedbackHalo.id = 'quantum-feedback-halo';
    this.feedbackHalo.innerHTML = `
      <div class="halo-ring ring-1"></div>
      <div class="halo-ring ring-2"></div>
      <div class="halo-ring ring-3"></div>
      <div class="halo-center">
        <div class="mutation-state" id="mutation-state">DORMANT</div>
        <div class="engagement-meter" id="engagement-meter">
          <div class="engagement-fill" id="engagement-fill"></div>
        </div>
      </div>
    `;

    this.feedbackHalo.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      width: 200px;
      height: 200px;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 500;
      opacity: 0;
      transition: opacity 1s ease-out;
    `;

    document.body.appendChild(this.feedbackHalo);
  }

  createPulseAmplifiers() {
    // Create pulse amplifier nodes for cinematic effects
    for (let i = 0; i < 4; i++) {
      const amplifier = document.createElement('div');
      amplifier.className = 'pulse-amplifier';
      amplifier.style.cssText = `
        position: fixed;
        width: 50px;
        height: 50px;
        border: 2px solid #ff00ff;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255,0,255,0.3), transparent);
        pointer-events: none;
        z-index: 499;
        opacity: 0;
        transform: scale(0);
        transition: all 0.3s ease-out;
      `;

      // Position amplifiers in corners
      const positions = [
        { top: '20px', left: '20px' },
        { top: '20px', right: '20px' },
        { bottom: '20px', left: '20px' },
        { bottom: '20px', right: '20px' }
      ];

      Object.assign(amplifier.style, positions[i]);
      this.pulseAmplifiers.push(amplifier);
      document.body.appendChild(amplifier);
    }
  }

  initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn("Audio context not available for quantum feedback");
    }
  }

  attachInteractionListeners() {
    // Track various user interactions for feedback loop
    const interactions = [
      'click', 'mousemove', 'keydown', 'scroll', 'touchstart'
    ];

    interactions.forEach(eventType => {
      document.addEventListener(eventType, (e) => {
        if (this.isActive) {
          this.processInteraction(eventType, e);
        }
      });
    });

    // Special handling for wallet connections and button clicks
    document.addEventListener('click', (e) => {
      if (this.isActive && e.target.tagName === 'BUTTON') {
        this.processInteraction('button_click', e);
      }
    });
  }

  processInteraction(type, event) {
    const interaction = {
      type,
      timestamp: Date.now(),
      intensity: this.calculateInteractionIntensity(type, event)
    };

    this.interactionHistory.push(interaction);
    
    // Keep only recent interactions (last 10 seconds)
    const cutoff = Date.now() - 10000;
    this.interactionHistory = this.interactionHistory.filter(i => i.timestamp > cutoff);

    // Update engagement level
    this.updateEngagementLevel();
    
    // Trigger feedback mutations
    this.triggerFeedbackMutation(interaction);

    // Log interaction for debugging
    console.log(`🌀 Quantum feedback: ${type} (intensity: ${interaction.intensity})`);
  }

  calculateInteractionIntensity(type, event) {
    const intensityMap = {
      'click': 8,
      'button_click': 15,
      'mousemove': 1,
      'keydown': 5,
      'scroll': 3,
      'touchstart': 10
    };

    let baseIntensity = intensityMap[type] || 1;

    // Amplify based on rapid succession
    const recentInteractions = this.interactionHistory.filter(
      i => Date.now() - i.timestamp < 1000
    );
    
    if (recentInteractions.length > 5) {
      baseIntensity *= 2; // Rapid interaction bonus
    }

    return Math.min(baseIntensity, 20);
  }

  updateEngagementLevel() {
    // Calculate engagement based on recent interactions
    const recentIntensity = this.interactionHistory.reduce(
      (sum, i) => sum + i.intensity, 0
    );

    this.engagementLevel = Math.min(recentIntensity, this.maxEngagement);

    // Update mutation state
    const newState = Math.floor(this.engagementLevel / 20);
    if (newState !== this.currentState) {
      this.currentState = newState;
      this.updateMutationState();
    }

    // Update visual engagement meter
    this.updateEngagementMeter();
  }

  updateMutationState() {
    const stateElement = document.getElementById('mutation-state');
    if (stateElement) {
      const stateName = this.mutationStates[this.currentState] || 'UNKNOWN';
      stateElement.textContent = stateName;
      stateElement.style.color = this.getStateColor(this.currentState);
    }

    console.log(`🔄 Mutation state: ${this.mutationStates[this.currentState]}`);
  }

  getStateColor(state) {
    const colors = ['#666', '#ffaa00', '#00ff00', '#ff00ff', '#ffffff'];
    return colors[state] || '#666';
  }

  updateEngagementMeter() {
    const fillElement = document.getElementById('engagement-fill');
    if (fillElement) {
      const percentage = (this.engagementLevel / this.maxEngagement) * 100;
      fillElement.style.width = `${percentage}%`;
      fillElement.style.backgroundColor = this.getStateColor(this.currentState);
    }
  }

  triggerFeedbackMutation(interaction) {
    // Visual mutation - update halo rings
    this.animateHaloRings(interaction.intensity);

    // Audio mutation - bass surge for high intensity
    if (interaction.intensity > 10) {
      this.triggerBassSurge();
    }

    // Pulse amplification for sustained engagement
    if (this.engagementLevel > 60) {
      this.triggerPulseAmplification();
    }
  }

  animateHaloRings(intensity) {
    const rings = this.feedbackHalo.querySelectorAll('.halo-ring');
    
    rings.forEach((ring, index) => {
      const delay = index * 100;
      const scale = 1 + (intensity / 20);
      
      setTimeout(() => {
        ring.style.transform = `scale(${scale})`;
        ring.style.borderColor = `hsl(${(intensity * 20) % 360}, 70%, 60%)`;
        
        setTimeout(() => {
          ring.style.transform = 'scale(1)';
        }, 300);
      }, delay);
    });
  }

  triggerBassSurge() {
    if (!this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(80, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(40, this.audioContext.currentTime + 0.3);

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.3);

      console.log("🔊 Bass surge triggered!");
    } catch (e) {
      console.warn("Bass surge failed:", e);
    }
  }

  triggerPulseAmplification() {
    // Cinematic light surge across all amplifiers
    this.pulseAmplifiers.forEach((amplifier, index) => {
      setTimeout(() => {
        amplifier.style.opacity = '1';
        amplifier.style.transform = 'scale(1.5)';
        amplifier.style.boxShadow = '0 0 50px #ff00ff, inset 0 0 20px #ff00ff';

        setTimeout(() => {
          amplifier.style.opacity = '0';
          amplifier.style.transform = 'scale(0)';
          amplifier.style.boxShadow = 'none';
        }, 800);
      }, index * 200);
    });

    console.log("⚡ Pulse amplification triggered!");
  }

  activate() {
    console.log("🌀 Activating Quantum Feedback Loop...");
    this.isActive = true;

    // Show feedback halo
    this.feedbackHalo.style.opacity = '1';

    // Initialize audio context (user gesture required)
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    return this;
  }

  deactivate() {
    this.isActive = false;
    this.feedbackHalo.style.opacity = '0';
    this.pulseAmplifiers.forEach(amp => amp.style.opacity = '0');
  }

  getEngagementLevel() {
    return this.engagementLevel;
  }

  getMutationState() {
    return this.mutationStates[this.currentState];
  }
}

// CSS for quantum feedback effects
const quantumFeedbackCSS = `
  .halo-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    border: 2px solid #00ffff;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: all 0.3s ease-out;
  }

  .ring-1 {
    width: 60px;
    height: 60px;
    animation: haloRotate 4s linear infinite;
  }

  .ring-2 {
    width: 100px;
    height: 100px;
    animation: haloRotate 6s linear infinite reverse;
  }

  .ring-3 {
    width: 140px;
    height: 140px;
    animation: haloRotate 8s linear infinite;
  }

  .halo-center {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 40px;
    height: 40px;
    transform: translate(-50%, -50%);
    text-align: center;
  }

  .mutation-state {
    font-size: 8px;
    font-weight: bold;
    color: #666;
    margin-bottom: 5px;
    font-family: 'Courier New', monospace;
  }

  .engagement-meter {
    width: 30px;
    height: 4px;
    border: 1px solid #333;
    background: #000;
    margin: 0 auto;
  }

  .engagement-fill {
    height: 100%;
    width: 0%;
    background: #666;
    transition: width 0.3s ease-out;
  }

  @keyframes haloRotate {
    0% { transform: translate(-50%, -50%) rotate(0deg); }
    100% { transform: translate(-50%, -50%) rotate(360deg); }
  }

  .pulse-amplifier {
    animation: pulseGlow 2s ease-in-out infinite alternate;
  }

  @keyframes pulseGlow {
    0% { box-shadow: 0 0 10px rgba(255,0,255,0.3); }
    100% { box-shadow: 0 0 30px rgba(255,0,255,0.8); }
  }
`;

// Inject CSS
const quantumFeedbackStyle = document.createElement('style');
quantumFeedbackStyle.textContent = quantumFeedbackCSS;
document.head.appendChild(quantumFeedbackStyle);

// Export for use in main script
window.QuantumFeedbackLoop = QuantumFeedbackLoop;