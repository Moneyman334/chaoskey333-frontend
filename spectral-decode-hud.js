// Spectral Decode HUD - Direct Sync with Cosmic Replay Terminal
// ChaosKey333 Vault Evolution Moment Analysis System

class SpectralDecodeHUD {
  constructor() {
    this.isConnected = false;
    this.replayTerminal = null;
    this.hudElement = null;
    this.evolutionMoments = [];
    this.currentMoment = null;
    this.analysisData = {};
    
    this.initializeHUD();
  }
  
  initializeHUD() {
    console.log("🎭 Initializing Spectral Decode HUD...");
    this.createHUDElement();
    this.setupEventListeners();
    console.log("✅ Spectral Decode HUD initialized");
  }
  
  createHUDElement() {
    // Create floating HUD element
    this.hudElement = document.createElement('div');
    this.hudElement.id = 'spectralHUD';
    this.hudElement.innerHTML = `
      <div class="spectral-hud">
        <div class="hud-header">
          <span>🎭 SPECTRAL DECODE HUD</span>
          <button class="hud-toggle" onclick="toggleSpectralHUD()">−</button>
        </div>
        <div class="hud-content">
          <div class="moment-analysis">
            <h4>⚡ Evolution Moment Analysis</h4>
            <div class="analysis-grid">
              <div class="analysis-item">
                <label>🔍 Intensity:</label>
                <div class="intensity-bar">
                  <div class="intensity-fill" id="intensityFill"></div>
                </div>
                <span id="intensityValue">0%</span>
              </div>
              <div class="analysis-item">
                <label>🎵 Frequency:</label>
                <span id="frequencyValue">440 Hz</span>
              </div>
              <div class="analysis-item">
                <label>🧬 Mutation Rate:</label>
                <span id="mutationRate">0.0/s</span>
              </div>
              <div class="analysis-item">
                <label>⏱️ Moment Type:</label>
                <span id="momentType">Evolution</span>
              </div>
            </div>
          </div>
          
          <div class="hud-controls">
            <h4>🎮 Spectral Controls</h4>
            <div class="control-row">
              <button class="hud-btn" id="slowMotionBtn" onclick="enableSlowMotion()">
                🐌 SLOW MOTION
              </button>
              <button class="hud-btn" id="freezeBtn" onclick="freezeMoment()">
                ❄️ FREEZE MOMENT
              </button>
            </div>
            <div class="control-row">
              <button class="hud-btn" id="enhanceBtn" onclick="enhanceSpectrum()">
                ✨ ENHANCE SPECTRUM
              </button>
              <button class="hud-btn" id="analyzeBtn" onclick="deepAnalyze()">
                🔬 DEEP ANALYZE
              </button>
            </div>
          </div>
          
          <div class="moment-history">
            <h4>📊 Recent Moments</h4>
            <div class="moment-list" id="momentList">
              <div class="moment-item">🌀 Awaiting first evolution moment...</div>
            </div>
          </div>
          
          <div class="sync-panel">
            <h4>🔗 Terminal Sync</h4>
            <div class="sync-indicator">
              <span class="sync-dot" id="syncDot"></span>
              <span id="syncStatusText">Waiting for connection...</span>
            </div>
            <div class="sync-controls">
              <button class="hud-btn small" onclick="forceSyncResync()">🔄 RESYNC</button>
              <button class="hud-btn small" onclick="exportAnalysis()">💾 EXPORT</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add HUD styles
    const style = document.createElement('style');
    style.textContent = `
      .spectral-hud {
        position: fixed;
        top: 80px;
        left: 20px;
        width: 320px;
        background: rgba(16, 33, 62, 0.95);
        border: 2px solid #00ffff;
        border-radius: 10px;
        font-family: 'Courier New', monospace;
        color: #00ffff;
        z-index: 1000;
        backdrop-filter: blur(10px);
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
      }
      
      .hud-header {
        background: linear-gradient(90deg, #00ffff, #0088ff);
        color: #000;
        padding: 10px 15px;
        border-radius: 8px 8px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: bold;
        font-size: 14px;
      }
      
      .hud-toggle {
        background: none;
        border: none;
        color: #000;
        font-size: 18px;
        cursor: pointer;
        font-weight: bold;
      }
      
      .hud-content {
        padding: 15px;
        max-height: 600px;
        overflow-y: auto;
      }
      
      .hud-content h4 {
        margin: 0 0 10px 0;
        color: #00ffff;
        font-size: 12px;
        border-bottom: 1px solid #333;
        padding-bottom: 5px;
      }
      
      .analysis-grid {
        display: grid;
        gap: 8px;
        margin-bottom: 15px;
      }
      
      .analysis-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 11px;
      }
      
      .analysis-item label {
        color: #88ffff;
        min-width: 80px;
      }
      
      .intensity-bar {
        width: 80px;
        height: 8px;
        background: #333;
        border-radius: 4px;
        overflow: hidden;
        margin: 0 5px;
      }
      
      .intensity-fill {
        height: 100%;
        background: linear-gradient(90deg, #00ffff, #ff0080);
        width: 0%;
        transition: width 0.3s ease;
      }
      
      .control-row {
        display: flex;
        gap: 5px;
        margin-bottom: 8px;
      }
      
      .hud-btn {
        background: linear-gradient(45deg, #0066cc, #0088ff);
        color: #fff;
        border: none;
        padding: 6px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 10px;
        font-weight: bold;
        flex: 1;
        transition: all 0.2s ease;
      }
      
      .hud-btn:hover {
        background: linear-gradient(45deg, #0088ff, #00aaff);
        transform: scale(1.02);
      }
      
      .hud-btn:active {
        background: linear-gradient(45deg, #004488, #0066cc);
      }
      
      .hud-btn.small {
        flex: none;
        padding: 4px 8px;
        font-size: 9px;
      }
      
      .hud-btn.active {
        background: linear-gradient(45deg, #ff0080, #8000ff);
      }
      
      .moment-list {
        max-height: 120px;
        overflow-y: auto;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 5px;
        padding: 8px;
        margin-bottom: 15px;
      }
      
      .moment-item {
        font-size: 10px;
        padding: 4px 0;
        border-bottom: 1px solid #444;
        color: #aaffff;
      }
      
      .moment-item:last-child {
        border-bottom: none;
      }
      
      .moment-item.highlight {
        color: #00ffff;
        background: rgba(0, 255, 255, 0.1);
        padding: 4px;
        border-radius: 3px;
      }
      
      .sync-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 10px;
        font-size: 11px;
      }
      
      .sync-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #ff0000;
        animation: blink 1s infinite;
      }
      
      .sync-dot.connected {
        background: #00ff00;
        animation: pulse 2s infinite;
      }
      
      .sync-controls {
        display: flex;
        gap: 5px;
      }
      
      @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0.3; }
      }
      
      .spectral-hud.minimized .hud-content {
        display: none;
      }
      
      .spectral-hud.minimized {
        width: auto;
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(this.hudElement);
  }
  
  setupEventListeners() {
    // Listen for cosmic evolution events
    window.addEventListener('cosmicEvolution', (event) => {
      this.handleEvolutionEvent(event.detail);
    });
    
    // Listen for mutation events
    window.addEventListener('relicMutation', (event) => {
      this.handleMutationEvent(event.detail);
    });
  }
  
  connect(replayTerminal) {
    this.replayTerminal = replayTerminal;
    this.isConnected = true;
    
    // Update sync status
    document.getElementById('syncDot').classList.add('connected');
    document.getElementById('syncStatusText').textContent = 'Connected to Replay Terminal';
    
    console.log("🔗 Spectral HUD connected to Replay Terminal");
  }
  
  disconnect() {
    this.replayTerminal = null;
    this.isConnected = false;
    
    // Update sync status
    document.getElementById('syncDot').classList.remove('connected');
    document.getElementById('syncStatusText').textContent = 'Disconnected';
    
    console.log("🔌 Spectral HUD disconnected");
  }
  
  pause() {
    if (this.isConnected) {
      this.analyzeMoment('pause');
      console.log("⏸️ Spectral HUD synced pause");
    }
  }
  
  stop() {
    if (this.isConnected) {
      this.resetAnalysis();
      console.log("⏹️ Spectral HUD synced stop");
    }
  }
  
  setSpeed(speed) {
    if (this.isConnected) {
      this.updateMutationRate(speed);
      console.log("⚡ Spectral HUD synced speed:", speed + "x");
    }
  }
  
  jumpTo(time) {
    if (this.isConnected) {
      this.analyzeTimeJump(time);
      console.log("🎯 Spectral HUD synced jump to:", time + "s");
    }
  }
  
  analyzeMoment(type = 'evolution') {
    if (!this.replayTerminal) return;
    
    const currentData = this.replayTerminal.getCurrentEvolutionData();
    if (!currentData) return;
    
    this.currentMoment = {
      time: this.replayTerminal.currentTime,
      type: type,
      data: currentData,
      timestamp: Date.now(),
      analysis: this.generateAnalysis(currentData)
    };
    
    this.updateHUDDisplay();
    this.addMomentToHistory();
  }
  
  generateAnalysis(data) {
    // Generate spectral analysis data
    const intensity = Math.min(100, (data.mutations * 25) + (data.solvers * 35) + (data.lore * 15));
    const complexity = data.mutations + data.solvers + data.lore;
    
    return {
      intensity: intensity,
      frequency: data.frequency,
      complexity: complexity,
      resonance: this.calculateResonance(data),
      evolutionPotential: this.calculateEvolutionPotential(data)
    };
  }
  
  calculateResonance(data) {
    // Calculate spectral resonance based on evolution state
    const baseResonance = data.frequency / 440; // A4 reference
    const mutationBoost = data.mutations * 0.25;
    const solverBoost = data.solvers * 0.35;
    const loreBoost = data.lore * 0.15;
    
    return baseResonance + mutationBoost + solverBoost + loreBoost;
  }
  
  calculateEvolutionPotential(data) {
    // Calculate potential for future evolution
    const currentLevel = data.mutations + data.solvers + data.lore;
    const maxLevel = 9; // 3 mutations + 3 solvers + 3 lore
    
    return (currentLevel / maxLevel) * 100;
  }
  
  updateHUDDisplay() {
    if (!this.currentMoment) return;
    
    const analysis = this.currentMoment.analysis;
    
    // Update intensity bar
    document.getElementById('intensityFill').style.width = analysis.intensity + '%';
    document.getElementById('intensityValue').textContent = Math.round(analysis.intensity) + '%';
    
    // Update frequency
    document.getElementById('frequencyValue').textContent = analysis.frequency + ' Hz';
    
    // Update mutation rate
    const rate = this.replayTerminal ? this.replayTerminal.playbackSpeed * analysis.complexity : 0;
    document.getElementById('mutationRate').textContent = rate.toFixed(1) + '/s';
    
    // Update moment type
    document.getElementById('momentType').textContent = this.currentMoment.type.charAt(0).toUpperCase() + 
                                                       this.currentMoment.type.slice(1);
  }
  
  addMomentToHistory() {
    if (!this.currentMoment) return;
    
    const momentList = document.getElementById('momentList');
    const momentElement = document.createElement('div');
    momentElement.className = 'moment-item highlight';
    
    const timeStr = this.formatTime(this.currentMoment.time);
    const intensityStr = Math.round(this.currentMoment.analysis.intensity) + '%';
    
    momentElement.innerHTML = `
      ${timeStr} - ${this.currentMoment.type} (${intensityStr})
      <br>🎵 ${this.currentMoment.analysis.frequency}Hz
    `;
    
    // Add to beginning of list
    if (momentList.firstChild) {
      momentList.insertBefore(momentElement, momentList.firstChild);
    } else {
      momentList.appendChild(momentElement);
    }
    
    // Remove highlight after a moment
    setTimeout(() => {
      momentElement.classList.remove('highlight');
    }, 2000);
    
    // Keep only last 10 moments
    while (momentList.children.length > 10) {
      momentList.removeChild(momentList.lastChild);
    }
    
    // Store in evolution moments array
    this.evolutionMoments.push(this.currentMoment);
    if (this.evolutionMoments.length > 50) {
      this.evolutionMoments = this.evolutionMoments.slice(-50);
    }
  }
  
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  updateMutationRate(speed) {
    if (!this.currentMoment) return;
    
    const rate = speed * this.currentMoment.analysis.complexity;
    document.getElementById('mutationRate').textContent = rate.toFixed(1) + '/s';
  }
  
  analyzeTimeJump(time) {
    // Analyze the moment we jumped to
    setTimeout(() => {
      this.analyzeMoment('jump');
    }, 100);
  }
  
  resetAnalysis() {
    document.getElementById('intensityFill').style.width = '0%';
    document.getElementById('intensityValue').textContent = '0%';
    document.getElementById('frequencyValue').textContent = '440 Hz';
    document.getElementById('mutationRate').textContent = '0.0/s';
    document.getElementById('momentType').textContent = 'Standby';
    
    const momentList = document.getElementById('momentList');
    momentList.innerHTML = '<div class="moment-item">🌀 Awaiting first evolution moment...</div>';
  }
  
  handleEvolutionEvent(detail) {
    console.log("🧬 Handling evolution event:", detail);
    this.analyzeMoment('evolution');
  }
  
  handleMutationEvent(detail) {
    console.log("⚡ Handling mutation event:", detail);
    this.analyzeMoment('mutation');
  }
  
  exportAnalysis() {
    const exportData = {
      timestamp: Date.now(),
      moments: this.evolutionMoments,
      currentAnalysis: this.currentMoment,
      replaySession: this.replayTerminal ? {
        currentTime: this.replayTerminal.currentTime,
        speed: this.replayTerminal.playbackSpeed
      } : null
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `spectral-analysis-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log("💾 Spectral analysis exported");
  }
}

// Global functions for HUD controls
function toggleSpectralHUD() {
  const hud = document.querySelector('.spectral-hud');
  const toggle = document.querySelector('.hud-toggle');
  
  hud.classList.toggle('minimized');
  toggle.textContent = hud.classList.contains('minimized') ? '+' : '−';
}

function enableSlowMotion() {
  if (window.cosmicTerminal && window.spectralHUD.isConnected) {
    window.cosmicTerminal.setSpeed(0.25);
    
    const btn = document.getElementById('slowMotionBtn');
    btn.classList.toggle('active');
    btn.textContent = btn.classList.contains('active') ? '🐌 SLOW ACTIVE' : '🐌 SLOW MOTION';
    
    console.log("🐌 Slow motion toggled");
  }
}

function freezeMoment() {
  if (window.cosmicTerminal && window.spectralHUD.isConnected) {
    if (window.cosmicTerminal.isPlaying) {
      window.cosmicTerminal.pause();
      window.spectralHUD.analyzeMoment('freeze');
    }
    
    const btn = document.getElementById('freezeBtn');
    btn.classList.add('active');
    setTimeout(() => btn.classList.remove('active'), 1000);
    
    console.log("❄️ Moment frozen for analysis");
  }
}

function enhanceSpectrum() {
  if (window.spectralHUD.currentMoment) {
    // Enhance the current spectral analysis
    const analysis = window.spectralHUD.currentMoment.analysis;
    analysis.intensity = Math.min(100, analysis.intensity * 1.5);
    
    window.spectralHUD.updateHUDDisplay();
    
    const btn = document.getElementById('enhanceBtn');
    btn.classList.add('active');
    setTimeout(() => btn.classList.remove('active'), 2000);
    
    console.log("✨ Spectrum enhanced");
  }
}

function deepAnalyze() {
  if (window.spectralHUD.currentMoment) {
    window.spectralHUD.analyzeMoment('deep-analysis');
    
    const btn = document.getElementById('analyzeBtn');
    btn.classList.add('active');
    btn.textContent = '🔬 ANALYZING...';
    
    setTimeout(() => {
      btn.classList.remove('active');
      btn.textContent = '🔬 DEEP ANALYZE';
    }, 3000);
    
    console.log("🔬 Deep analysis initiated");
  }
}

function forceSyncResync() {
  if (window.cosmicTerminal) {
    window.spectralHUD.disconnect();
    setTimeout(() => {
      window.spectralHUD.connect(window.cosmicTerminal);
    }, 1000);
    
    console.log("🔄 Force resync initiated");
  }
}

function exportAnalysis() {
  window.spectralHUD.exportAnalysis();
}

// Initialize Spectral HUD when page loads
document.addEventListener('DOMContentLoaded', function() {
  window.spectralHUD = new SpectralDecodeHUD();
  console.log("🎭 Spectral Decode HUD loaded and ready");
  
  // Auto-connect to cosmic terminal when it becomes available
  const checkConnection = setInterval(() => {
    if (window.cosmicTerminal && !window.spectralHUD.isConnected) {
      window.spectralHUD.connect(window.cosmicTerminal);
      clearInterval(checkConnection);
    }
  }, 1000);
});