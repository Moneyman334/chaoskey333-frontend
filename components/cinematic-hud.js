// Cinematic HUD Controller
class CinematicHUD {
  constructor() {
    this.isPlaying = false;
    this.currentStep = 1;
    this.totalSteps = 4;
    this.progress = 0;
    this.solverCode = this.generateSolverCode();
    this.evolutionStartTime = null;
    
    this.initializeElements();
    this.bindEvents();
    this.startInitialization();
  }

  initializeElements() {
    this.hudElement = document.getElementById('cinematicHUD');
    this.progressFill = document.getElementById('progressFill');
    this.progressPercent = document.getElementById('progressPercent');
    this.solverCodeElement = document.getElementById('solverCode');
    this.timestampElement = document.getElementById('evolutionTimestamp');
    this.protocolStatus = document.querySelector('.protocol-status');
    this.startButton = document.getElementById('startEvolution');
    this.skipButton = document.getElementById('skipCinematic');
    this.resonanceAudio = document.getElementById('resonanceTone');
    
    this.glyphs = document.querySelectorAll('.glyph');
    this.timelineSteps = document.querySelectorAll('.timeline-step');
    this.frequencyBars = document.querySelectorAll('.freq-bar');
  }

  bindEvents() {
    this.startButton.addEventListener('click', () => this.startEvolution());
    this.skipButton.addEventListener('click', () => this.skipToVault());
    
    // Glyph hover effects
    this.glyphs.forEach((glyph, index) => {
      glyph.addEventListener('mouseenter', () => this.onGlyphHover(index));
      glyph.addEventListener('click', () => this.onGlyphClick(index));
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        this.startEvolution();
      } else if (e.code === 'Escape') {
        this.skipToVault();
      }
    });
  }

  generateSolverCode() {
    const chars = 'ABCDEF0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  startInitialization() {
    // Animate solver code generation
    this.animateSolverCodeGeneration();
    
    // Set initial timestamp
    this.updateTimestamp();
    
    // Start ambient resonance visualization
    this.startResonanceVisualization();
  }

  animateSolverCodeGeneration() {
    const finalCode = this.solverCode;
    let currentCode = 'XXXXXXXX';
    let iterations = 0;
    const maxIterations = 20;

    const generateStep = () => {
      if (iterations < maxIterations) {
        // Randomly change characters
        let newCode = '';
        for (let i = 0; i < 8; i++) {
          if (Math.random() < 0.3 || iterations > maxIterations - 8) {
            newCode += finalCode[i];
          } else {
            newCode += 'ABCDEF0123456789'[Math.floor(Math.random() * 16)];
          }
        }
        currentCode = newCode;
        this.solverCodeElement.textContent = currentCode;
        iterations++;
        setTimeout(generateStep, 100);
      } else {
        this.solverCodeElement.textContent = finalCode;
        this.protocolStatus.textContent = 'EVOLUTION SEQUENCE READY';
      }
    };

    setTimeout(generateStep, 500);
  }

  updateTimestamp() {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '').slice(0, -1);
    this.timestampElement.textContent = `EVOLUTION TIMESTAMP: ${timestamp}`;
  }

  startResonanceVisualization() {
    // Create continuous frequency visualization
    this.frequencyBars.forEach((bar, index) => {
      const delay = index * 0.1;
      bar.style.animationDelay = `${delay}s`;
    });
  }

  async startEvolution() {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    this.evolutionStartTime = Date.now();
    this.startButton.disabled = true;
    this.startButton.textContent = '⚡ EVOLUTION IN PROGRESS';
    
    // Start resonance audio
    this.playResonanceTone();
    
    // Begin evolution sequence
    await this.executeEvolutionSequence();
  }

  async executeEvolutionSequence() {
    const sequences = [
      { step: 1, duration: 2000, action: 'initialize' },
      { step: 2, duration: 3000, action: 'activateGlyphs' },
      { step: 3, duration: 2500, action: 'synchronizeResonance' },
      { step: 4, duration: 2000, action: 'completeEvolution' }
    ];

    for (const sequence of sequences) {
      await this.executeStep(sequence);
    }

    this.onEvolutionComplete();
  }

  async executeStep(sequence) {
    const { step, duration, action } = sequence;
    
    // Update timeline
    this.updateTimelineStep(step);
    
    // Execute step-specific actions
    switch (action) {
      case 'initialize':
        this.protocolStatus.textContent = 'INITIALIZING QUANTUM MATRICES...';
        break;
      case 'activateGlyphs':
        this.protocolStatus.textContent = 'ACTIVATING GLYPH RESONANCE...';
        await this.activateGlyphSequence();
        break;
      case 'synchronizeResonance':
        this.protocolStatus.textContent = 'SYNCHRONIZING FREQUENCIES...';
        this.intensifyResonanceVisualization();
        break;
      case 'completeEvolution':
        this.protocolStatus.textContent = 'EVOLUTION SEQUENCE COMPLETE';
        this.activateAllGlyphs();
        break;
    }

    // Animate progress
    const startProgress = this.progress;
    const endProgress = (step / this.totalSteps) * 100;
    await this.animateProgress(startProgress, endProgress, duration);
  }

  async activateGlyphSequence() {
    for (let i = 0; i < this.glyphs.length; i++) {
      await new Promise(resolve => {
        setTimeout(() => {
          this.glyphs[i].classList.add('active');
          this.playGlyphActivationSound(i);
          resolve();
        }, i * 400);
      });
    }
  }

  activateAllGlyphs() {
    this.glyphs.forEach(glyph => {
      glyph.classList.add('active');
    });
  }

  intensifyResonanceVisualization() {
    this.frequencyBars.forEach((bar, index) => {
      bar.style.animation = `frequencyPulse 0.5s ease-in-out infinite`;
      bar.style.animationDelay = `${index * 0.05}s`;
    });
  }

  updateTimelineStep(step) {
    this.timelineSteps.forEach((stepElement, index) => {
      const stepNumber = index + 1;
      if (stepNumber < step) {
        stepElement.classList.add('completed');
        stepElement.classList.remove('active');
      } else if (stepNumber === step) {
        stepElement.classList.add('active');
        stepElement.classList.remove('completed');
      } else {
        stepElement.classList.remove('active', 'completed');
      }
    });
  }

  async animateProgress(startProgress, endProgress, duration) {
    const startTime = Date.now();
    
    return new Promise(resolve => {
      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentProgress = startProgress + (endProgress - startProgress) * progress;
        this.progress = currentProgress;
        
        this.progressFill.style.width = `${currentProgress}%`;
        this.progressPercent.textContent = `${Math.round(currentProgress)}%`;
        
        if (progress < 1) {
          requestAnimationFrame(updateProgress);
        } else {
          resolve();
        }
      };
      updateProgress();
    });
  }

  playResonanceTone() {
    if (this.resonanceAudio) {
      this.resonanceAudio.volume = 0.3;
      this.resonanceAudio.play().catch(e => {
        console.log('Audio playback requires user interaction');
      });
    }
  }

  playGlyphActivationSound(index) {
    // Create synthetic glyph activation sound
    if (window.AudioContext || window.webkitAudioContext) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(333 + (index * 50), audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    }
  }

  onGlyphHover(index) {
    if (!this.isPlaying) {
      this.glyphs[index].style.transform = 'scale(1.1)';
      this.glyphs[index].style.textShadow = '0 0 20px currentColor';
    }
  }

  onGlyphClick(index) {
    if (!this.isPlaying) {
      this.playGlyphActivationSound(index);
      this.glyphs[index].classList.toggle('active');
    }
  }

  onEvolutionComplete() {
    this.protocolStatus.textContent = 'RELIC EVOLUTION COMPLETE - ACCESSING VAULT...';
    
    // Stop resonance audio
    if (this.resonanceAudio) {
      this.resonanceAudio.pause();
    }

    // Update UI
    this.startButton.textContent = '✅ EVOLUTION COMPLETE';
    this.skipButton.textContent = '➤ ENTER VAULT';

    // Auto-transition to vault after delay
    setTimeout(() => {
      this.transitionToVault();
    }, 3000);
  }

  skipToVault() {
    if (this.resonanceAudio) {
      this.resonanceAudio.pause();
    }
    this.transitionToVault();
  }

  transitionToVault() {
    // Create transition effect
    this.hudElement.style.animation = 'hudInitialize 1s ease-in reverse';
    
    setTimeout(() => {
      // Store evolution data for vault
      const evolutionData = {
        solverCode: this.solverCode,
        timestamp: this.evolutionStartTime,
        completed: this.progress === 100
      };
      
      localStorage.setItem('chaoskey333_evolution', JSON.stringify(evolutionData));
      
      // Redirect to vault
      window.location.href = '../vault.html';
    }, 1000);
  }

  // Public API for integration with other components
  show() {
    this.hudElement.style.display = 'flex';
  }

  hide() {
    this.hudElement.style.display = 'none';
  }

  reset() {
    this.isPlaying = false;
    this.currentStep = 1;
    this.progress = 0;
    this.progressFill.style.width = '0%';
    this.progressPercent.textContent = '0%';
    this.startButton.disabled = false;
    this.startButton.textContent = '⚡ INITIATE EVOLUTION';
    this.skipButton.textContent = '⏭ SKIP TO VAULT';
    this.glyphs.forEach(glyph => glyph.classList.remove('active'));
    this.updateTimelineStep(1);
    if (this.resonanceAudio) {
      this.resonanceAudio.pause();
      this.resonanceAudio.currentTime = 0;
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.cinematicHUD = new CinematicHUD();
});

// Expose global functions for external integration
window.ChaosKey333 = {
  startCinematic: () => window.cinematicHUD?.show(),
  hideCinematic: () => window.cinematicHUD?.hide(),
  resetCinematic: () => window.cinematicHUD?.reset()
};