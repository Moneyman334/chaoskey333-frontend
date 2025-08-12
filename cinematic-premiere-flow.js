// Cinematic Premiere Flow - Chained Ignition Timeline
// Orchestrates the entire ignition sequence for the Omni-Singularity Blueprint

class CinematicPremiereFlow {
  constructor() {
    this.isActive = false;
    this.timeline = [
      { time: 0, event: 'pr27_activate', description: 'PR #27 activates; lore reflections ripple through the vault' },
      { time: 12000, event: 'pr28_kickin', description: 'PR #28 kicks in; feedback mutations pulse across the halo' },
      { time: 22000, event: 'overdrive_flip', description: 'Overdrive Arm Switch flips—self-expansion begins' },
      { time: 33000, event: 'mutation_visible', description: 'Autonomous mutation sequence becomes globally visible' }
    ];
    this.currentEvent = 0;
    this.startTime = null;
    this.premiereDisplay = null;
    this.loreLayer = null;
    this.feedbackLoop = null;
    this.overdriveSwitch = null;
  }

  initialize(loreLayer, feedbackLoop, overdriveSwitch) {
    console.log("🎬 Initializing Cinematic Premiere Flow...");
    this.loreLayer = loreLayer;
    this.feedbackLoop = feedbackLoop;
    this.overdriveSwitch = overdriveSwitch;
    this.createPremiereDisplay();
    return this;
  }

  createPremiereDisplay() {
    this.premiereDisplay = document.createElement('div');
    this.premiereDisplay.id = 'premiere-display';
    this.premiereDisplay.innerHTML = `
      <div class="premiere-header">🎬 CHAINED IGNITION PREMIERE 🎬</div>
      <div class="premiere-status" id="premiere-status">READY FOR IGNITION</div>
      <div class="timeline-display">
        <div class="timeline-event" id="event-0">T=0s: Lore Reflection Layer</div>
        <div class="timeline-event" id="event-1">T=+12s: Quantum Feedback Loop</div>
        <div class="timeline-event" id="event-2">T=+22s: Overdrive Arm Switch</div>
        <div class="timeline-event" id="event-3">T=+33s: Global Mutation Sequence</div>
      </div>
      <div class="premiere-controls">
        <button class="ignition-button" id="ignition-button">🚀 IGNITE SEQUENCE</button>
        <button class="abort-button" id="abort-button" style="display:none;">⚠️ ABORT</button>
      </div>
      <div class="premiere-countdown" id="premiere-countdown"></div>
    `;

    this.premiereDisplay.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      width: 400px;
      min-height: 300px;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, rgba(0,0,0,0.95), rgba(40,0,80,0.95));
      border: 3px solid #ffaa00;
      border-radius: 15px;
      padding: 20px;
      font-family: 'Orbitron', monospace;
      color: #ffaa00;
      text-align: center;
      z-index: 2000;
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.8);
      transition: all 1s ease-out;
      box-shadow: 0 0 50px rgba(255,170,0,0.5);
    `;

    document.body.appendChild(this.premiereDisplay);
    this.attachEventListeners();
  }

  attachEventListeners() {
    const ignitionButton = document.getElementById('ignition-button');
    const abortButton = document.getElementById('abort-button');

    ignitionButton.addEventListener('click', () => {
      this.startIgnitionSequence();
    });

    abortButton.addEventListener('click', () => {
      this.abortSequence();
    });
  }

  show() {
    console.log("🎬 Showing Cinematic Premiere Display...");
    
    setTimeout(() => {
      this.premiereDisplay.style.opacity = '1';
      this.premiereDisplay.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 500);

    return this;
  }

  hide() {
    this.premiereDisplay.style.opacity = '0';
    this.premiereDisplay.style.transform = 'translate(-50%, -50%) scale(0.8)';
    
    setTimeout(() => {
      if (this.premiereDisplay && this.premiereDisplay.parentNode) {
        this.premiereDisplay.style.display = 'none';
      }
    }, 1000);
  }

  startIgnitionSequence() {
    if (this.isActive) {
      console.warn("🎬 Ignition sequence already active");
      return;
    }

    console.log("🚀 STARTING CHAINED IGNITION SEQUENCE!");
    this.isActive = true;
    this.startTime = Date.now();
    this.currentEvent = 0;

    // Update UI
    document.getElementById('premiere-status').textContent = 'IGNITION SEQUENCE ACTIVE';
    document.getElementById('ignition-button').style.display = 'none';
    document.getElementById('abort-button').style.display = 'inline-block';

    // Start timeline monitoring
    this.monitorTimeline();

    // Add dramatic screen effects
    this.addIgnitionEffects();

    return this;
  }

  monitorTimeline() {
    const checkTimeline = () => {
      if (!this.isActive) return;

      const elapsed = Date.now() - this.startTime;
      
      // Update countdown display
      this.updateCountdown(elapsed);

      // Check for next event
      if (this.currentEvent < this.timeline.length) {
        const nextEvent = this.timeline[this.currentEvent];
        
        if (elapsed >= nextEvent.time) {
          this.executeEvent(nextEvent);
          this.currentEvent++;
        }
      }

      // Continue monitoring if sequence is active
      if (this.isActive) {
        requestAnimationFrame(checkTimeline);
      }
    };

    checkTimeline();
  }

  updateCountdown(elapsed) {
    const countdownElement = document.getElementById('premiere-countdown');
    
    if (this.currentEvent < this.timeline.length) {
      const nextEvent = this.timeline[this.currentEvent];
      const timeToNext = Math.max(0, nextEvent.time - elapsed);
      const seconds = Math.ceil(timeToNext / 1000);
      
      countdownElement.textContent = `Next event in: ${seconds}s`;
      countdownElement.style.color = seconds <= 3 ? '#ff0000' : '#ffaa00';
    } else {
      countdownElement.textContent = 'SEQUENCE COMPLETE';
      countdownElement.style.color = '#00ff00';
    }

    // Update timeline events display
    this.updateTimelineDisplay(elapsed);
  }

  updateTimelineDisplay(elapsed) {
    this.timeline.forEach((event, index) => {
      const eventElement = document.getElementById(`event-${index}`);
      if (eventElement) {
        if (elapsed >= event.time) {
          eventElement.style.color = '#00ff00';
          eventElement.style.textShadow = '0 0 10px #00ff00';
          eventElement.innerHTML = `✅ ${event.description}`;
        } else if (index === this.currentEvent) {
          eventElement.style.color = '#ffff00';
          eventElement.style.textShadow = '0 0 10px #ffff00';
          eventElement.innerHTML = `⏳ ${event.description}`;
        } else {
          eventElement.style.color = '#666';
          eventElement.innerHTML = `⏸️ ${event.description}`;
        }
      }
    });
  }

  executeEvent(event) {
    console.log(`🎬 Executing event: ${event.event} - ${event.description}`);

    switch (event.event) {
      case 'pr27_activate':
        this.activatePR27();
        break;
      case 'pr28_kickin':
        this.activatePR28();
        break;
      case 'overdrive_flip':
        this.activateOverdrive();
        break;
      case 'mutation_visible':
        this.activateGlobalMutation();
        break;
    }

    // Add event flash effect
    this.addEventFlash(event.event);
  }

  activatePR27() {
    console.log("🌟 PR #27 ACTIVATION: Dynamic Lore Reflection Layer");
    
    if (this.loreLayer) {
      this.loreLayer.activate();
    }

    // Add screen ripple effect
    this.addRippleEffect('#00ffff');
    
    // Play activation sound
    this.playActivationSound(200);
  }

  activatePR28() {
    console.log("🌀 PR #28 ACTIVATION: Quantum Feedback Loop");
    
    if (this.feedbackLoop) {
      this.feedbackLoop.activate();
    }

    // Add pulse effect across screen
    this.addPulseEffect('#ff00ff');
    
    // Play activation sound
    this.playActivationSound(150);
  }

  activateOverdrive() {
    console.log("⚡ OVERDRIVE ARM SWITCH ACTIVATION");
    
    if (this.overdriveSwitch) {
      this.overdriveSwitch.activate();
    }

    // Add lightning effect
    this.addLightningEffect();
    
    // Play activation sound
    this.playActivationSound(100);
  }

  activateGlobalMutation() {
    console.log("🌌 GLOBAL MUTATION SEQUENCE ACTIVATION");
    
    // Make all systems globally visible and synchronized
    this.synchronizeAllSystems();
    
    // Add cosmic effect
    this.addCosmicEffect();
    
    // Play completion sound
    this.playActivationSound(80);

    // Sequence complete
    setTimeout(() => {
      this.completeSequence();
    }, 3000);
  }

  synchronizeAllSystems() {
    console.log("🔄 Synchronizing all systems for global mutation visibility...");
    
    // Ensure all components are visible and active
    if (this.loreLayer && !this.loreLayer.isActive) {
      this.loreLayer.activate();
    }
    
    if (this.feedbackLoop && !this.feedbackLoop.isActive) {
      this.feedbackLoop.activate();
    }
    
    if (this.overdriveSwitch && !this.overdriveSwitch.isOverdriveActive()) {
      this.overdriveSwitch.armSwitch();
      setTimeout(() => this.overdriveSwitch.activateOverdrive(), 1000);
    }

    // Add global synchronization indicator
    this.addSyncIndicator();
  }

  addIgnitionEffects() {
    // Screen flash effect
    const flash = document.createElement('div');
    flash.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, rgba(255,255,255,0.3), transparent);
      pointer-events: none;
      z-index: 9999;
      animation: ignitionFlash 2s ease-out;
    `;
    
    document.body.appendChild(flash);
    
    setTimeout(() => {
      flash.remove();
    }, 2000);
  }

  addEventFlash(eventType) {
    const colors = {
      'pr27_activate': '#00ffff',
      'pr28_kickin': '#ff00ff',
      'overdrive_flip': '#ffaa00',
      'mutation_visible': '#ffffff'
    };

    const flash = document.createElement('div');
    flash.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: ${colors[eventType] || '#ffffff'};
      opacity: 0.6;
      pointer-events: none;
      z-index: 9998;
      animation: eventFlash 0.5s ease-out;
    `;
    
    document.body.appendChild(flash);
    
    setTimeout(() => {
      flash.remove();
    }, 500);
  }

  addRippleEffect(color) {
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border: 2px solid ${color};
      border-radius: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 9997;
      animation: rippleExpand 2s ease-out;
    `;
    
    document.body.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 2000);
  }

  addPulseEffect(color) {
    const pulse = document.createElement('div');
    pulse.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, ${color}33, transparent);
      pointer-events: none;
      z-index: 9997;
      animation: pulseExpand 1.5s ease-out;
    `;
    
    document.body.appendChild(pulse);
    
    setTimeout(() => {
      pulse.remove();
    }, 1500);
  }

  addLightningEffect() {
    // Create multiple lightning bolts
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const lightning = document.createElement('div');
        lightning.style.cssText = `
          position: fixed;
          top: ${Math.random() * 100}%;
          left: ${Math.random() * 100}%;
          width: 3px;
          height: ${50 + Math.random() * 100}px;
          background: linear-gradient(180deg, #ffffff, #ffaa00, transparent);
          transform: rotate(${Math.random() * 60 - 30}deg);
          pointer-events: none;
          z-index: 9997;
          opacity: 0;
          animation: lightningStrike 0.2s ease-out;
        `;
        
        document.body.appendChild(lightning);
        
        setTimeout(() => {
          lightning.remove();
        }, 200);
      }, i * 100);
    }
  }

  addCosmicEffect() {
    // Create cosmic particle field
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const particle = document.createElement('div');
        particle.style.cssText = `
          position: fixed;
          top: ${Math.random() * 100}%;
          left: ${Math.random() * 100}%;
          width: 4px;
          height: 4px;
          background: radial-gradient(circle, #ffffff, #9966ff);
          border-radius: 50%;
          pointer-events: none;
          z-index: 9997;
          animation: cosmicFloat 3s ease-out forwards;
        `;
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
          particle.remove();
        }, 3000);
      }, i * 50);
    }
  }

  addSyncIndicator() {
    const syncBar = document.createElement('div');
    syncBar.innerHTML = `
      <div class="sync-text">🌌 SYSTEMS SYNCHRONIZED 🌌</div>
      <div class="sync-bar"></div>
    `;
    
    syncBar.style.cssText = `
      position: fixed;
      bottom: 50px;
      left: 50%;
      transform: translateX(-50%);
      width: 300px;
      background: rgba(0,0,0,0.8);
      border: 2px solid #00ff00;
      border-radius: 10px;
      padding: 15px;
      text-align: center;
      color: #00ff00;
      font-family: 'Orbitron', monospace;
      z-index: 9996;
      animation: syncPulse 2s ease-in-out infinite alternate;
    `;
    
    document.body.appendChild(syncBar);
    
    setTimeout(() => {
      syncBar.remove();
    }, 5000);
  }

  playActivationSound(frequency) {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 2, audioContext.currentTime + 0.1);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.5, audioContext.currentTime + 0.3);

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      console.warn("Audio context not available for activation sound");
    }
  }

  completeSequence() {
    console.log("🎉 CHAINED IGNITION SEQUENCE COMPLETE!");
    
    document.getElementById('premiere-status').textContent = 'IGNITION SEQUENCE COMPLETE';
    document.getElementById('premiere-status').style.color = '#00ff00';
    document.getElementById('abort-button').style.display = 'none';

    // Show completion message
    const completionMessage = document.createElement('div');
    completionMessage.innerHTML = `
      <div style="font-size: 18px; margin: 20px 0; color: #00ff00; text-shadow: 0 0 15px #00ff00;">
        ✨ OMNI-SINGULARITY BLUEPRINT ACTIVATED ✨
      </div>
      <div style="font-size: 12px; color: #ffaa00;">
        Self-expanding intelligence artifact is now operational
      </div>
    `;
    
    this.premiereDisplay.appendChild(completionMessage);

    // Auto-hide after completion
    setTimeout(() => {
      this.hide();
    }, 5000);
  }

  abortSequence() {
    console.log("⚠️ ABORTING IGNITION SEQUENCE");
    this.isActive = false;
    
    // Deactivate all systems
    if (this.loreLayer) this.loreLayer.deactivate();
    if (this.feedbackLoop) this.feedbackLoop.deactivate();
    if (this.overdriveSwitch) this.overdriveSwitch.deactivate();

    // Update UI
    document.getElementById('premiere-status').textContent = 'SEQUENCE ABORTED';
    document.getElementById('premiere-status').style.color = '#ff0000';
    document.getElementById('ignition-button').style.display = 'inline-block';
    document.getElementById('abort-button').style.display = 'none';

    this.currentEvent = 0;
  }
}

// CSS for cinematic effects
const cinematicCSS = `
  .premiere-header {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 15px;
    text-shadow: 0 0 15px #ffaa00;
  }

  .premiere-status {
    font-size: 14px;
    margin-bottom: 20px;
    color: #ffaa00;
    font-weight: bold;
  }

  .timeline-display {
    text-align: left;
    margin: 20px 0;
    font-size: 12px;
  }

  .timeline-event {
    margin: 8px 0;
    padding: 5px;
    border-left: 3px solid #333;
    padding-left: 10px;
    color: #666;
    transition: all 0.3s ease;
  }

  .premiere-controls {
    margin: 20px 0;
  }

  .ignition-button {
    background: linear-gradient(45deg, #ff6600, #ffaa00);
    border: none;
    color: #000;
    padding: 12px 20px;
    border-radius: 8px;
    font-family: 'Orbitron', monospace;
    font-weight: bold;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s ease;
    box-shadow: 0 0 20px rgba(255,170,0,0.5);
  }

  .ignition-button:hover {
    transform: scale(1.05);
    box-shadow: 0 0 30px rgba(255,170,0,0.8);
  }

  .abort-button {
    background: linear-gradient(45deg, #cc0000, #ff3333);
    border: none;
    color: #fff;
    padding: 8px 16px;
    border-radius: 6px;
    font-family: 'Orbitron', monospace;
    cursor: pointer;
    font-size: 12px;
    margin-left: 10px;
  }

  .premiere-countdown {
    font-size: 18px;
    font-weight: bold;
    margin-top: 15px;
    text-shadow: 0 0 10px currentColor;
  }

  .sync-text {
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 10px;
  }

  .sync-bar {
    width: 100%;
    height: 6px;
    background: linear-gradient(90deg, #00ff00, #00ffff, #9966ff);
    border-radius: 3px;
    animation: syncFlow 1s linear infinite;
  }

  @keyframes ignitionFlash {
    0% { opacity: 0; }
    20% { opacity: 0.8; }
    100% { opacity: 0; }
  }

  @keyframes eventFlash {
    0% { opacity: 0; }
    50% { opacity: 0.6; }
    100% { opacity: 0; }
  }

  @keyframes rippleExpand {
    0% { width: 0; height: 0; opacity: 1; }
    100% { width: 500px; height: 500px; opacity: 0; }
  }

  @keyframes pulseExpand {
    0% { transform: scale(0); opacity: 1; }
    100% { transform: scale(3); opacity: 0; }
  }

  @keyframes lightningStrike {
    0% { opacity: 0; }
    10% { opacity: 1; }
    20% { opacity: 0; }
    30% { opacity: 1; }
    100% { opacity: 0; }
  }

  @keyframes cosmicFloat {
    0% { transform: scale(0) rotate(0deg); opacity: 1; }
    50% { transform: scale(1) rotate(180deg); opacity: 0.8; }
    100% { transform: scale(0) rotate(360deg); opacity: 0; }
  }

  @keyframes syncPulse {
    0% { box-shadow: 0 0 10px rgba(0,255,0,0.5); }
    100% { box-shadow: 0 0 30px rgba(0,255,0,1); }
  }

  @keyframes syncFlow {
    0% { background-position: 0% 0%; }
    100% { background-position: 100% 0%; }
  }
`;

// Inject CSS
const cinematicStyle = document.createElement('style');
cinematicStyle.textContent = cinematicCSS;
document.head.appendChild(cinematicStyle);

// Export for use in main script
window.CinematicPremiereFlow = CinematicPremiereFlow;