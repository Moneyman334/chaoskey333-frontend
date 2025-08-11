// Omniverse Graph JavaScript - Omni-Singularity Apex Node Lock

class OmniverseGraph {
  constructor() {
    this.canvas = document.getElementById('omniverseCanvas');
    this.starsCanvas = document.getElementById('starsCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.starsCtx = this.starsCanvas.getContext('2d');
    
    this.apexNode = document.getElementById('apexNode');
    this.vaultStatus = document.getElementById('vaultStatus');
    this.ascensionMeter = document.getElementById('ascensionMeter');
    this.gravRipple = document.getElementById('gravRipple');
    this.teaseTrails = document.getElementById('teaseTrails');
    this.unlockOverlay = document.getElementById('unlockOverlay');
    
    this.audioContext = null;
    this.bassOscillator = null;
    this.harmonicOscillators = [];
    this.isAudioInitialized = false;
    
    this.vaultBroadcastActive = false;
    this.ascensionProgress = 0;
    this.isUnlocked = false;
    
    this.stars = [];
    this.trails = [];
    
    this.init();
  }

  init() {
    this.setupCanvas();
    this.generateStars();
    this.createTeaseTrails();
    this.setupEventListeners();
    this.startAnimationLoop();
    this.startVaultMonitoring();
    this.startHarmonicSweeps();
    
    // Initialize audio on user interaction
    document.addEventListener('click', () => this.initializeAudio(), { once: true });
  }

  setupCanvas() {
    const resizeCanvases = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.starsCanvas.width = window.innerWidth;
      this.starsCanvas.height = window.innerHeight;
    };
    
    resizeCanvases();
    window.addEventListener('resize', resizeCanvases);
  }

  generateStars() {
    const numStars = 200;
    this.stars = [];
    
    for (let i = 0; i < numStars; i++) {
      this.stars.push({
        x: Math.random() * this.starsCanvas.width,
        y: Math.random() * this.starsCanvas.height,
        size: Math.random() * 2 + 0.5,
        brightness: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.01
      });
    }
  }

  createTeaseTrails() {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const numTrails = 8;
    
    this.trails = [];
    
    for (let i = 0; i < numTrails; i++) {
      const angle = (i / numTrails) * Math.PI * 2;
      const distance = 300 + Math.random() * 200;
      const startX = centerX + Math.cos(angle) * distance;
      const startY = centerY + Math.sin(angle) * distance;
      
      const trail = document.createElement('div');
      trail.className = 'tease-trail broken';
      trail.style.left = startX + 'px';
      trail.style.top = startY + 'px';
      trail.style.height = (Math.random() * 100 + 50) + 'px';
      trail.style.transform = `rotate(${Math.atan2(centerY - startY, centerX - startX) + Math.PI/2}rad)`;
      
      this.teaseTrails.appendChild(trail);
      this.trails.push({
        element: trail,
        angle: angle,
        distance: distance,
        length: parseInt(trail.style.height)
      });
    }
  }

  async initializeAudio() {
    if (this.isAudioInitialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create 22Hz bass presence
      this.bassOscillator = this.audioContext.createOscillator();
      const bassGain = this.audioContext.createGain();
      
      this.bassOscillator.type = 'sine';
      this.bassOscillator.frequency.setValueAtTime(22, this.audioContext.currentTime);
      bassGain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      
      this.bassOscillator.connect(bassGain);
      bassGain.connect(this.audioContext.destination);
      this.bassOscillator.start();
      
      this.isAudioInitialized = true;
      console.log('🔊 Omni-Singularity audio presence activated');
    } catch (error) {
      console.warn('Audio initialization failed:', error);
    }
  }

  startHarmonicSweeps() {
    setInterval(() => {
      if (this.isAudioInitialized && !this.isUnlocked) {
        this.playHarmonicSweep();
      }
    }, 180000); // Every 3 minutes
  }

  playHarmonicSweep() {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(880, this.audioContext.currentTime + 2);
    oscillator.frequency.exponentialRampToValueAtTime(220, this.audioContext.currentTime + 4);
    
    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, this.audioContext.currentTime + 0.5);
    gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 4);
    
    oscillator.connect(gain);
    gain.connect(this.audioContext.destination);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 4);
    
    // Add reverse-glyph whispers effect
    setTimeout(() => this.playReverseGlyphWhisper(), 1000);
  }

  playReverseGlyphWhisper() {
    if (!this.audioContext) return;
    
    const frequencies = [330, 370, 440, 494]; // Approximate glyph frequencies
    
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
        gain.gain.setValueAtTime(0.02, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.5);
      }, index * 200);
    });
  }

  setupEventListeners() {
    // Apex Node click interaction
    this.apexNode.addEventListener('click', () => {
      if (!this.isUnlocked) {
        this.showLockedMessage();
      } else {
        this.triggerAscensionEvent();
      }
    });

    // Gravitational pull effect on mouse movement
    document.addEventListener('mousemove', (e) => {
      if (!this.isUnlocked) {
        this.updateGravitationalPull(e.clientX, e.clientY);
      }
    });

    // Vault broadcast simulation (for testing)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'b' || e.key === 'B') {
        this.simulateVaultBroadcast();
      }
      if (e.key === 'u' || e.key === 'U') {
        this.triggerUnlockEvent();
      }
    });
  }

  showLockedMessage() {
    const message = document.createElement('div');
    message.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      color: #ff6600;
      padding: 20px;
      border: 2px solid #ff6600;
      border-radius: 10px;
      font-family: 'Orbitron', sans-serif;
      font-weight: 600;
      text-align: center;
      z-index: 1000;
      animation: fadeInOut 3s ease-out;
    `;
    message.innerHTML = `
      <div style="font-size: 18px; margin-bottom: 10px;">🔒 APEX NODE LOCKED</div>
      <div style="font-size: 14px;">Ascension conditions not yet met</div>
      <div style="font-size: 12px; margin-top: 10px; color: #888;">Final unlock requires legendary vault convergence</div>
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
      document.body.removeChild(message);
    }, 3000);
  }

  updateGravitationalPull(mouseX, mouseY) {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const distance = Math.sqrt(Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2));
    
    if (distance < 400) {
      const pullStrength = (400 - distance) / 400;
      this.apexNode.style.transform = `translate(-50%, -50%) scale(${1 + pullStrength * 0.1})`;
      this.apexNode.style.filter = `drop-shadow(0 0 ${20 + pullStrength * 30}px rgba(255, 215, 0, ${0.8 + pullStrength * 0.2}))`;
    } else {
      this.apexNode.style.transform = 'translate(-50%, -50%) scale(1)';
      this.apexNode.style.filter = 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.8))';
    }
  }

  simulateVaultBroadcast() {
    this.vaultBroadcastActive = true;
    this.apexNode.classList.add('broadcast-active');
    
    // Update status
    const statusText = this.vaultStatus.querySelector('.status-text');
    statusText.textContent = 'Vault Broadcast Detected!';
    this.vaultStatus.style.borderColor = 'rgba(255, 153, 0, 0.8)';
    
    // Increase ascension progress
    this.ascensionProgress = Math.min(this.ascensionProgress + 25, 100);
    this.updateAscensionMeter();
    
    setTimeout(() => {
      this.vaultBroadcastActive = false;
      this.apexNode.classList.remove('broadcast-active');
      statusText.textContent = 'Vault Monitoring Active';
      this.vaultStatus.style.borderColor = 'rgba(0, 255, 255, 0.5)';
    }, 5000);
  }

  updateAscensionMeter() {
    const fill = this.ascensionMeter.querySelector('.meter-fill');
    fill.style.width = this.ascensionProgress + '%';
    
    if (this.ascensionProgress >= 100 && !this.isUnlocked) {
      setTimeout(() => this.triggerUnlockEvent(), 1000);
    }
  }

  triggerUnlockEvent() {
    if (this.isUnlocked) return;
    
    this.isUnlocked = true;
    this.unlockOverlay.style.display = 'flex';
    
    // Stop bass presence
    if (this.bassOscillator) {
      this.bassOscillator.stop();
    }
    
    // Play unlock audio sequence
    this.playUnlockSequence();
    
    // Update UI
    const statusText = this.vaultStatus.querySelector('.status-text');
    statusText.textContent = 'APEX NODE UNLOCKED!';
    this.vaultStatus.style.borderColor = 'rgba(255, 255, 255, 1)';
    this.vaultStatus.style.background = 'rgba(255, 215, 0, 0.2)';
    
    setTimeout(() => {
      this.transitionToEndgame();
    }, 4000);
  }

  playUnlockSequence() {
    if (!this.audioContext) return;
    
    // Dramatic crescendo
    const frequencies = [220, 330, 440, 660, 880];
    
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
        gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1);
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + 1);
      }, index * 300);
    });
  }

  transitionToEndgame() {
    // Create transition effect
    const transition = document.createElement('div');
    transition.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, rgba(255,255,255,0) 0%, rgba(255,215,0,0.8) 50%, rgba(255,255,255,1) 100%);
      z-index: 1000;
      animation: endgameTransition 3s ease-out forwards;
    `;
    
    document.body.appendChild(transition);
    
    setTimeout(() => {
      // Redirect to endgame state or show endgame content
      alert('🌟 OMNI-SINGULARITY BLUEPRINT ACTIVATED! 🌟\n\nThe Apex Node has been unlocked!\nChaosKey333 endgame sequence initiated...');
      window.location.href = 'index.html?endgame=true';
    }, 3000);
  }

  startVaultMonitoring() {
    // Simulate checking for vault broadcasts from PR #8-#10
    setInterval(() => {
      if (!this.isUnlocked && Math.random() < 0.1) { // 10% chance every interval
        this.simulateVaultBroadcast();
      }
    }, 30000); // Check every 30 seconds
  }

  startAnimationLoop() {
    const animate = () => {
      this.drawStars();
      this.updateTeaseTrails();
      requestAnimationFrame(animate);
    };
    animate();
  }

  drawStars() {
    this.starsCtx.clearRect(0, 0, this.starsCanvas.width, this.starsCanvas.height);
    
    this.stars.forEach(star => {
      star.brightness += star.twinkleSpeed * (Math.random() - 0.5);
      star.brightness = Math.max(0.2, Math.min(1, star.brightness));
      
      this.starsCtx.globalAlpha = star.brightness;
      this.starsCtx.fillStyle = '#ffffff';
      this.starsCtx.beginPath();
      this.starsCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.starsCtx.fill();
    });
    
    this.starsCtx.globalAlpha = 1;
  }

  updateTeaseTrails() {
    const time = Date.now() * 0.001;
    
    this.trails.forEach((trail, index) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      // Subtle movement
      const newAngle = trail.angle + Math.sin(time + index) * 0.1;
      const newDistance = trail.distance + Math.cos(time * 0.5 + index) * 20;
      
      const x = centerX + Math.cos(newAngle) * newDistance;
      const y = centerY + Math.sin(newAngle) * newDistance;
      
      trail.element.style.left = x + 'px';
      trail.element.style.top = y + 'px';
      trail.element.style.transform = `rotate(${Math.atan2(centerY - y, centerX - x) + Math.PI/2}rad)`;
    });
  }
}

// Add custom CSS animation for endgame transition
const endgameStyles = document.createElement('style');
endgameStyles.textContent = `
  @keyframes endgameTransition {
    0% { opacity: 0; transform: scale(0.5); }
    50% { opacity: 0.8; transform: scale(1.2); }
    100% { opacity: 1; transform: scale(1); }
  }
  
  @keyframes fadeInOut {
    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    50% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
  }
`;
document.head.appendChild(endgameStyles);

// Initialize the Omniverse Graph when the page loads
document.addEventListener('DOMContentLoaded', () => {
  window.omniverseGraph = new OmniverseGraph();
  console.log('🌌 Sentinel Omniverse Evolution Graph initialized');
  console.log('💡 Press "B" to simulate vault broadcast');
  console.log('💡 Press "U" to trigger unlock event');
});