// Cosmic Replay Terminal - Core Functionality
// ChaosKey333 Vault Evolution Playback System

class CosmicReplayTerminal {
  constructor() {
    this.isPlaying = false;
    this.isPaused = false;
    this.currentTime = 0;
    this.totalDuration = 120; // 2 minutes default evolution time
    this.playbackSpeed = 1.0;
    this.spectrogramEnabled = false;
    this.evolutionData = [];
    this.currentRelic = null;
    this.autoSaveEnabled = true;
    
    // Key evolution moments (in seconds)
    this.keyMoments = {
      mutation1: 24,
      solver1: 54,
      lore1: 84,
      evolution1: 108
    };
    
    this.initializeTerminal();
  }
  
  initializeTerminal() {
    console.log("🌀 Initializing Cosmic Replay Terminal...");
    
    // Load any existing relic data
    this.loadRelicData();
    
    // Initialize spectrogram canvas
    this.initializeSpectrogram();
    
    // Start sync with Spectral Decode HUD
    this.initializeSpectralSync();
    
    // Setup auto-save monitoring
    this.setupAutoSave();
    
    console.log("✅ Cosmic Replay Terminal initialized");
  }
  
  loadRelicData() {
    // Try to load relic data from local storage or wallet
    const savedRelic = localStorage.getItem('currentRelic');
    if (savedRelic) {
      this.currentRelic = JSON.parse(savedRelic);
      this.generateEvolutionData();
    } else {
      // Generate sample evolution data for demo
      this.generateSampleEvolutionData();
    }
  }
  
  generateSampleEvolutionData() {
    this.evolutionData = [
      { time: 0, state: "Origin Flare", mutations: 0, solvers: 0, lore: 0, frequency: 440 },
      { time: 24, state: "Chaos Spark", mutations: 1, solvers: 0, lore: 0, frequency: 523 },
      { time: 54, state: "Solver Touched", mutations: 1, solvers: 1, lore: 0, frequency: 659 },
      { time: 84, state: "Lore Awakened", mutations: 1, solvers: 1, lore: 1, frequency: 784 },
      { time: 108, state: "Vault Ascended", mutations: 2, solvers: 2, lore: 2, frequency: 880 },
      { time: 120, state: "Cosmic Complete", mutations: 3, solvers: 3, lore: 3, frequency: 1047 }
    ];
    
    console.log("📊 Generated sample evolution data:", this.evolutionData.length, "states");
  }
  
  generateEvolutionData() {
    if (!this.currentRelic) return;
    
    // Generate evolution data based on current relic
    // This would normally be fetched from blockchain/IPFS
    this.evolutionData = [];
    // Implementation would depend on actual relic data structure
  }
  
  initializeSpectrogram() {
    const canvas = document.getElementById('spectrogramCanvas');
    if (canvas) {
      this.spectrogramCtx = canvas.getContext('2d');
      this.spectrogramCtx.fillStyle = '#000';
      this.spectrogramCtx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }
  
  initializeSpectralSync() {
    // Initialize connection with Spectral Decode HUD
    if (window.SpectralDecodeHUD) {
      window.SpectralDecodeHUD.connect(this);
      this.updateSyncStatus("Connected to Spectral HUD", true);
    } else {
      this.updateSyncStatus("Spectral HUD not found", false);
    }
  }
  
  setupAutoSave() {
    // Monitor for mutation events and auto-save
    setInterval(() => {
      if (this.autoSaveEnabled && this.isPlaying) {
        this.checkForMutationEvents();
      }
    }, 1000);
  }
  
  checkForMutationEvents() {
    const currentData = this.getCurrentEvolutionData();
    if (currentData && this.lastMutationCount !== currentData.mutations) {
      console.log("🧬 Mutation detected! Auto-saving replay...");
      this.autoSaveReplay();
      this.lastMutationCount = currentData.mutations;
    }
  }
  
  autoSaveReplay() {
    const replayState = {
      timestamp: Date.now(),
      currentTime: this.currentTime,
      evolutionData: this.evolutionData,
      relic: this.currentRelic,
      mutations: this.getCurrentEvolutionData()?.mutations || 0
    };
    
    localStorage.setItem('autoSavedReplay', JSON.stringify(replayState));
    
    // Trigger chained evolution event (PR #8 → PR #23 → PR #24)
    this.triggerChainedEvolution(replayState);
    
    console.log("💾 Replay auto-saved at mutation event");
  }
  
  triggerChainedEvolution(replayState) {
    // This would trigger the PR #23 → PR #24 chained evolution
    if (window.VaultPulseTimeline) {
      window.VaultPulseTimeline.recordEvolutionEvent(replayState);
    }
    
    // Emit event for other systems to listen
    window.dispatchEvent(new CustomEvent('cosmicEvolution', {
      detail: { replayState, chainedFrom: 'PR8' }
    }));
  }
  
  updateSyncStatus(message, isConnected) {
    const syncText = document.getElementById('syncText');
    if (syncText) {
      syncText.textContent = message;
      syncText.parentElement.style.borderColor = isConnected ? '#00ff00' : '#ff0000';
    }
  }
  
  play() {
    if (this.isPaused) {
      this.isPaused = false;
    } else {
      this.currentTime = 0;
    }
    
    this.isPlaying = true;
    this.updateControls();
    this.startPlayback();
    
    console.log("▶️ Starting replay at speed", this.playbackSpeed + "x");
  }
  
  pause() {
    this.isPaused = true;
    this.isPlaying = false;
    this.updateControls();
    
    console.log("⏸️ Replay paused at", this.currentTime + "s");
    
    // Sync pause with Spectral HUD
    if (window.SpectralDecodeHUD) {
      window.SpectralDecodeHUD.pause();
    }
  }
  
  stop() {
    this.isPlaying = false;
    this.isPaused = false;
    this.currentTime = 0;
    this.updateControls();
    this.updateDisplay();
    
    console.log("⏹️ Replay stopped");
    
    // Sync stop with Spectral HUD
    if (window.SpectralDecodeHUD) {
      window.SpectralDecodeHUD.stop();
    }
  }
  
  setSpeed(speed) {
    this.playbackSpeed = parseFloat(speed);
    document.getElementById('speedDisplay').textContent = speed + "x";
    
    console.log("⚡ Speed changed to", this.playbackSpeed + "x");
    
    // Sync speed with Spectral HUD
    if (window.SpectralDecodeHUD) {
      window.SpectralDecodeHUD.setSpeed(this.playbackSpeed);
    }
  }
  
  toggleSpectrogram() {
    this.spectrogramEnabled = !this.spectrogramEnabled;
    const container = document.getElementById('spectrogramContainer');
    const btn = document.getElementById('spectrogramBtn');
    
    if (this.spectrogramEnabled) {
      container.style.display = 'block';
      btn.textContent = '📊 HIDE SPECTROGRAM';
      btn.style.background = 'linear-gradient(45deg, #ff0080, #8000ff)';
      this.startSpectrogram();
    } else {
      container.style.display = 'none';
      btn.textContent = '📊 SPECTROGRAM';
      btn.style.background = 'linear-gradient(45deg, #00ffff, #0088ff)';
    }
    
    console.log("📊 Spectrogram", this.spectrogramEnabled ? "enabled" : "disabled");
  }
  
  jumpToMoment(momentKey) {
    const targetTime = this.keyMoments[momentKey];
    if (targetTime !== undefined) {
      this.currentTime = targetTime;
      this.updateDisplay();
      
      console.log("🎯 Jumped to", momentKey, "at", targetTime + "s");
      
      // Sync jump with Spectral HUD
      if (window.SpectralDecodeHUD) {
        window.SpectralDecodeHUD.jumpTo(targetTime);
      }
    }
  }
  
  startPlayback() {
    if (!this.isPlaying) return;
    
    const interval = setInterval(() => {
      if (!this.isPlaying || this.isPaused) {
        clearInterval(interval);
        return;
      }
      
      this.currentTime += (0.1 * this.playbackSpeed);
      
      if (this.currentTime >= this.totalDuration) {
        this.stop();
        return;
      }
      
      this.updateDisplay();
      
      if (this.spectrogramEnabled) {
        this.updateSpectrogram();
      }
      
    }, 100);
  }
  
  updateDisplay() {
    // Update timeline progress
    const progress = (this.currentTime / this.totalDuration) * 100;
    document.getElementById('timelineProgress').style.width = progress + '%';
    
    // Update current state
    const currentData = this.getCurrentEvolutionData();
    if (currentData) {
      document.getElementById('currentState').textContent = currentData.state;
      document.getElementById('mutationCount').textContent = currentData.mutations;
      document.getElementById('solverCount').textContent = currentData.solvers;
      document.getElementById('loreCount').textContent = currentData.lore;
    }
    
    // Update time display
    const minutes = Math.floor(this.currentTime / 60);
    const seconds = Math.floor(this.currentTime % 60);
    document.getElementById('stateTime').textContent = 
      `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update evolution display
    this.updateEvolutionDisplay(currentData);
  }
  
  getCurrentEvolutionData() {
    // Find the current evolution state based on time
    let currentData = this.evolutionData[0];
    
    for (let i = 0; i < this.evolutionData.length; i++) {
      if (this.evolutionData[i].time <= this.currentTime) {
        currentData = this.evolutionData[i];
      } else {
        break;
      }
    }
    
    return currentData;
  }
  
  updateEvolutionDisplay(data) {
    const display = document.getElementById('evolutionDisplay');
    if (data && display) {
      display.innerHTML = `
        <h4>🔮 ${data.state}</h4>
        <p>⏱️ Evolution Time: ${this.formatTime(this.currentTime)}</p>
        <p>🧬 Mutations: ${data.mutations}</p>
        <p>🧠 Solver Imprints: ${data.solvers}</p>
        <p>📜 Lore Fragments: ${data.lore}</p>
        <p>🎵 Resonance Frequency: ${data.frequency} Hz</p>
        <div style="margin-top: 10px; padding: 10px; background: rgba(0,255,255,0.1); border-radius: 5px;">
          <p>🌀 Spectral Analysis: Evolution energy patterns detected</p>
        </div>
      `;
    }
  }
  
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  updateControls() {
    document.getElementById('playBtn').disabled = this.isPlaying && !this.isPaused;
    document.getElementById('pauseBtn').disabled = !this.isPlaying || this.isPaused;
  }
  
  startSpectrogram() {
    // Initialize spectrogram visualization
    if (this.spectrogramCtx) {
      this.renderSpectrogramBackground();
    }
  }
  
  updateSpectrogram() {
    if (!this.spectrogramCtx || !this.spectrogramEnabled) return;
    
    const currentData = this.getCurrentEvolutionData();
    if (!currentData) return;
    
    // Simple spectrogram visualization
    const canvas = this.spectrogramCtx.canvas;
    const frequency = currentData.frequency;
    const intensity = (currentData.mutations + 1) * 50;
    
    // Shift existing content left
    const imageData = this.spectrogramCtx.getImageData(1, 0, canvas.width - 1, canvas.height);
    this.spectrogramCtx.putImageData(imageData, 0, 0);
    
    // Draw new frequency data on the right
    const x = canvas.width - 1;
    const y = canvas.height - (frequency / 1200 * canvas.height);
    
    this.spectrogramCtx.fillStyle = `hsl(${frequency / 4}, 100%, ${intensity}%)`;
    this.spectrogramCtx.fillRect(x, y - 2, 1, 4);
  }
  
  renderSpectrogramBackground() {
    const canvas = this.spectrogramCtx.canvas;
    
    // Clear and draw grid
    this.spectrogramCtx.fillStyle = '#000';
    this.spectrogramCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw frequency grid lines
    this.spectrogramCtx.strokeStyle = '#333';
    this.spectrogramCtx.lineWidth = 1;
    
    for (let i = 0; i < canvas.height; i += 50) {
      this.spectrogramCtx.beginPath();
      this.spectrogramCtx.moveTo(0, i);
      this.spectrogramCtx.lineTo(canvas.width, i);
      this.spectrogramCtx.stroke();
    }
  }
}

// Global functions for HTML onclick handlers
function playReplay() {
  window.cosmicTerminal.play();
}

function pauseReplay() {
  window.cosmicTerminal.pause();
}

function stopReplay() {
  window.cosmicTerminal.stop();
}

function updateSpeed(speed) {
  window.cosmicTerminal.setSpeed(speed);
}

function toggleSpectrogram() {
  window.cosmicTerminal.toggleSpectrogram();
}

function jumpToMoment(moment) {
  window.cosmicTerminal.jumpToMoment(moment);
}

// Initialize terminal when page loads
document.addEventListener('DOMContentLoaded', function() {
  window.cosmicTerminal = new CosmicReplayTerminal();
  console.log("🌀 Cosmic Replay Terminal loaded and ready");
});