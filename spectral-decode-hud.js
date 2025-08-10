// Spectral Decode HUD Component
// Syncs with audio/visual glyph pulses and displays circuit status

import { OMNI_SINGULARITY_CONFIG, omniLog } from './omni-singularity-config.js';

export class SpectralDecodeHUD {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = null;
    this.isInitialized = false;
    this.glyphPulses = [];
    this.audioContext = null;
    this.analyser = null;
    this.audioSyncEnabled = false;
    this.markers = [];
    this.activeCircuits = [];
    this.syncTimer = null;
    
    omniLog('Initializing Spectral Decode HUD', 'info');
  }
  
  initialize() {
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      omniLog(`Container ${this.containerId} not found`, 'error');
      return false;
    }
    
    this.createHUDStructure();
    this.initializeAudioSync();
    this.setupEventListeners();
    this.startSyncCycle();
    
    this.isInitialized = true;
    omniLog('Spectral Decode HUD initialized successfully', 'success');
    
    return true;
  }
  
  createHUDStructure() {
    const hudContainer = document.createElement('div');
    hudContainer.className = 'spectral-decode-hud';
    hudContainer.innerHTML = `
      <div class="hud-header">
        <div class="hud-title">
          <span class="hud-icon">🔮</span>
          <span class="hud-name">SPECTRAL DECODE HUD</span>
          <div class="sync-indicator" id="syncIndicator">
            <span class="sync-dot"></span>
            <span class="sync-text">SYNCING</span>
          </div>
        </div>
        <div class="hud-controls">
          <button id="toggleAudioSync" class="hud-btn">AUDIO SYNC</button>
          <button id="calibrateHUD" class="hud-btn">CALIBRATE</button>
        </div>
      </div>
      
      <div class="hud-main">
        <div class="circuit-display">
          <div class="circuit-header">
            <h4>🔗 ACTIVE CIRCUITS</h4>
            <span id="circuitCount" class="count-badge">0</span>
          </div>
          <div class="circuit-grid" id="circuitGrid">
            <!-- Circuit status indicators will be added here -->
          </div>
        </div>
        
        <div class="glyph-display">
          <div class="glyph-header">
            <h4>✨ GLYPH PULSE MATRIX</h4>
            <span id="glyphCount" class="count-badge">0</span>
          </div>
          <div class="glyph-matrix" id="glyphMatrix">
            <!-- Glyph pulse indicators will be added here -->
          </div>
        </div>
        
        <div class="frequency-display">
          <div class="frequency-header">
            <h4>🌊 SPECTRAL FREQUENCY</h4>
            <span id="frequencyValue" class="frequency-value">0 Hz</span>
          </div>
          <canvas id="frequencyCanvas" class="frequency-canvas" width="300" height="100"></canvas>
        </div>
      </div>
      
      <div class="hud-footer">
        <div class="marker-display">
          <div class="marker-label">SYNC MARKERS:</div>
          <div class="marker-grid" id="markerGrid">
            <!-- Sync markers will be added here -->
          </div>
        </div>
      </div>
    `;
    
    this.container.appendChild(hudContainer);
    this.setupHUDReferences();
  }
  
  setupHUDReferences() {
    this.circuitGrid = document.getElementById('circuitGrid');
    this.glyphMatrix = document.getElementById('glyphMatrix');
    this.markerGrid = document.getElementById('markerGrid');
    this.frequencyCanvas = document.getElementById('frequencyCanvas');
    this.frequencyContext = this.frequencyCanvas.getContext('2d');
    this.syncIndicator = document.getElementById('syncIndicator');
    
    this.setupControlHandlers();
  }
  
  setupControlHandlers() {
    document.getElementById('toggleAudioSync').addEventListener('click', () => {
      this.toggleAudioSync();
    });
    
    document.getElementById('calibrateHUD').addEventListener('click', () => {
      this.calibrateHUD();
    });
  }
  
  initializeAudioSync() {
    // Try to initialize audio context for frequency analysis
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      
      // Try to connect to existing audio if available
      const audioElement = document.getElementById('bassDrop');
      if (audioElement) {
        const source = this.audioContext.createMediaElementSource(audioElement);
        source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
        this.audioSyncEnabled = true;
        omniLog('Audio sync connected to bass drop audio', 'success');
      }
    } catch (error) {
      omniLog('Audio sync initialization failed: ' + error.message, 'warn');
    }
  }
  
  setupEventListeners() {
    // Listen for spectral decode updates
    document.addEventListener('spectralDecodeUpdate', (e) => {
      this.handleSpectralDecodeUpdate(e.detail);
    });
    
    // Listen for glyph pulse events
    document.addEventListener('glyphPulseDetected', (e) => {
      this.handleGlyphPulse(e.detail);
    });
    
    // Listen for circuit status updates
    document.addEventListener('circuitStatusUpdate', (e) => {
      this.updateCircuitStatus(e.detail);
    });
    
    // Listen for Omni-Singularity node activations
    document.addEventListener('omniNodeActivation', (e) => {
      this.createSyncMarker('node_activation', e.detail);
    });
  }
  
  toggleAudioSync() {
    if (this.audioSyncEnabled) {
      this.audioSyncEnabled = false;
      document.getElementById('toggleAudioSync').textContent = 'AUDIO SYNC OFF';
      omniLog('Audio sync disabled', 'info');
    } else {
      this.initializeAudioSync();
      document.getElementById('toggleAudioSync').textContent = 'AUDIO SYNC ON';
      omniLog('Audio sync enabled', 'info');
    }
  }
  
  calibrateHUD() {
    omniLog('Calibrating Spectral Decode HUD...', 'info');
    
    // Clear existing data
    this.markers = [];
    this.glyphPulses = [];
    this.activeCircuits = [];
    
    // Reset displays
    this.updateMarkerDisplay();
    this.updateGlyphMatrix();
    this.updateCircuitDisplay();
    
    // Create calibration pulse
    this.createSyncMarker('calibration', {
      timestamp: Date.now(),
      type: 'calibration_pulse'
    });
    
    setTimeout(() => {
      omniLog('HUD calibration complete', 'success');
    }, 1000);
  }
  
  startSyncCycle() {
    const syncLoop = () => {
      if (this.isInitialized) {
        this.updateFrequencyDisplay();
        this.processPendingPulses();
        this.updateSyncIndicator();
        
        setTimeout(syncLoop, OMNI_SINGULARITY_CONFIG.SPECTRAL_DECODE_SYNC_RATE);
      }
    };
    
    syncLoop();
  }
  
  handleSpectralDecodeUpdate(detail) {
    omniLog('Spectral decode update received', 'info', detail);
    
    // Create new sync marker
    this.createSyncMarker('spectral_update', detail);
    
    // Update circuit status if it's a vault broadcast
    if (detail.source === 'vault_broadcast') {
      this.addActiveCircuit({
        id: 'vault_to_replay',
        name: 'Vault → Replay Terminal',
        status: 'active',
        dataFlow: Math.random() * 100,
        timestamp: Date.now()
      });
    }
  }
  
  handleGlyphPulse(detail) {
    const pulse = {
      id: 'pulse_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      type: detail.type || 'unknown',
      intensity: detail.intensity || Math.random() * 100,
      frequency: detail.frequency || 440 + (Math.random() * 1000),
      timestamp: Date.now(),
      synced: false
    };
    
    this.glyphPulses.push(pulse);
    this.updateGlyphMatrix();
    
    // Create corresponding sync marker
    this.createSyncMarker('glyph_pulse', pulse);
    
    omniLog(`Glyph pulse detected: ${pulse.type} (${pulse.intensity.toFixed(1)}%)`, 'info');
  }
  
  createSyncMarker(type, data) {
    const marker = {
      id: 'marker_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      type: type,
      data: data,
      timestamp: Date.now(),
      synced: true
    };
    
    this.markers.push(marker);
    
    // Limit marker history
    if (this.markers.length > 20) {
      this.markers = this.markers.slice(-20);
    }
    
    this.updateMarkerDisplay();
    this.animateNewMarker(marker);
    
    return marker.id;
  }
  
  addActiveCircuit(circuit) {
    // Remove existing circuit with same ID
    this.activeCircuits = this.activeCircuits.filter(c => c.id !== circuit.id);
    
    // Add new circuit
    this.activeCircuits.push(circuit);
    
    // Limit active circuits
    if (this.activeCircuits.length > 8) {
      this.activeCircuits = this.activeCircuits.slice(-8);
    }
    
    this.updateCircuitDisplay();
  }
  
  updateCircuitStatus(detail) {
    const circuit = this.activeCircuits.find(c => c.id === detail.circuitId);
    if (circuit) {
      Object.assign(circuit, detail);
      this.updateCircuitDisplay();
    }
  }
  
  updateMarkerDisplay() {
    this.markerGrid.innerHTML = '';
    
    this.markers.slice(-10).forEach(marker => {
      const markerElement = document.createElement('div');
      markerElement.className = `sync-marker ${marker.type}`;
      markerElement.innerHTML = `
        <div class="marker-icon">${this.getMarkerIcon(marker.type)}</div>
        <div class="marker-info">
          <div class="marker-type">${marker.type.toUpperCase()}</div>
          <div class="marker-time">${this.formatTimestamp(marker.timestamp)}</div>
        </div>
      `;
      
      this.markerGrid.appendChild(markerElement);
    });
  }
  
  updateGlyphMatrix() {
    this.glyphMatrix.innerHTML = '';
    
    // Create 4x4 glyph matrix
    for (let i = 0; i < 16; i++) {
      const glyphElement = document.createElement('div');
      glyphElement.className = 'glyph-cell';
      
      // Check if there's a recent pulse for this cell
      const recentPulse = this.glyphPulses.find(p => {
        const cellIndex = Math.floor(p.frequency / 100) % 16;
        return cellIndex === i && (Date.now() - p.timestamp) < 5000;
      });
      
      if (recentPulse) {
        glyphElement.classList.add('active');
        glyphElement.style.background = `radial-gradient(circle, hsl(${recentPulse.frequency % 360}, 70%, 50%) 0%, transparent 70%)`;
        glyphElement.innerHTML = `<div class="glyph-pulse-indicator"></div>`;
      }
      
      this.glyphMatrix.appendChild(glyphElement);
    }
    
    // Update glyph count
    const activeGlyphs = this.glyphPulses.filter(p => (Date.now() - p.timestamp) < 5000);
    document.getElementById('glyphCount').textContent = activeGlyphs.length;
  }
  
  updateCircuitDisplay() {
    this.circuitGrid.innerHTML = '';
    
    this.activeCircuits.forEach(circuit => {
      const circuitElement = document.createElement('div');
      circuitElement.className = `circuit-item ${circuit.status}`;
      circuitElement.innerHTML = `
        <div class="circuit-name">${circuit.name}</div>
        <div class="circuit-status">
          <span class="status-light ${circuit.status}"></span>
          <span class="data-flow">${circuit.dataFlow?.toFixed(1) || 0}%</span>
        </div>
      `;
      
      this.circuitGrid.appendChild(circuitElement);
    });
    
    // Update circuit count
    document.getElementById('circuitCount').textContent = this.activeCircuits.length;
  }
  
  updateFrequencyDisplay() {
    if (!this.audioSyncEnabled || !this.analyser) {
      return;
    }
    
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);
    
    const ctx = this.frequencyContext;
    const canvas = this.frequencyCanvas;
    
    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw frequency bars
    const barWidth = canvas.width / bufferLength;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * canvas.height;
      
      const hue = (i / bufferLength) * 360;
      ctx.fillStyle = `hsl(${hue}, 70%, ${50 + (dataArray[i] / 255) * 30}%)`;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      
      x += barWidth;
    }
    
    // Calculate dominant frequency
    const maxIndex = dataArray.indexOf(Math.max(...dataArray));
    const dominantFrequency = (maxIndex / bufferLength) * (this.audioContext.sampleRate / 2);
    
    document.getElementById('frequencyValue').textContent = `${dominantFrequency.toFixed(1)} Hz`;
    
    // Trigger glyph pulse if frequency peak detected
    if (dataArray[maxIndex] > 200) {
      this.handleGlyphPulse({
        type: 'audio_peak',
        intensity: (dataArray[maxIndex] / 255) * 100,
        frequency: dominantFrequency
      });
    }
  }
  
  processPendingPulses() {
    // Clean up old pulses
    const now = Date.now();
    this.glyphPulses = this.glyphPulses.filter(p => (now - p.timestamp) < 10000);
    
    // Update glyph matrix if pulses have changed
    this.updateGlyphMatrix();
  }
  
  updateSyncIndicator() {
    const activeMarkers = this.markers.filter(m => (Date.now() - m.timestamp) < 5000);
    const activePulses = this.glyphPulses.filter(p => (Date.now() - p.timestamp) < 5000);
    
    if (activeMarkers.length > 0 || activePulses.length > 0) {
      this.syncIndicator.classList.add('active');
      this.syncIndicator.querySelector('.sync-text').textContent = 'SYNCED';
    } else {
      this.syncIndicator.classList.remove('active');
      this.syncIndicator.querySelector('.sync-text').textContent = 'IDLE';
    }
  }
  
  animateNewMarker(marker) {
    // Add visual feedback for new markers
    const markerElements = this.markerGrid.querySelectorAll('.sync-marker');
    const lastMarker = markerElements[markerElements.length - 1];
    
    if (lastMarker) {
      lastMarker.style.animation = 'markerPulse 1s ease-out';
      setTimeout(() => {
        lastMarker.style.animation = '';
      }, 1000);
    }
  }
  
  getMarkerIcon(type) {
    const icons = {
      'node_activation': '🌀',
      'spectral_update': '🔮',
      'glyph_pulse': '✨',
      'calibration': '⚙️',
      'circuit_update': '🔗',
      'audio_peak': '🌊'
    };
    return icons[type] || '📍';
  }
  
  formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toISOString().substr(11, 8);
  }
  
  destroy() {
    this.isInitialized = false;
    
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
    }
    
    if (this.audioContext) {
      this.audioContext.close();
    }
    
    if (this.container) {
      this.container.innerHTML = '';
    }
    
    omniLog('Spectral Decode HUD destroyed', 'info');
  }
}

// CSS Styles for the HUD
export const SPECTRAL_HUD_STYLES = `
  .spectral-decode-hud {
    background: linear-gradient(135deg, #001122 0%, #002244 50%, #001122 100%);
    border: 2px solid #0066ff;
    border-radius: 15px;
    padding: 15px;
    margin: 20px 0;
    font-family: 'Courier New', monospace;
    position: relative;
    overflow: hidden;
  }
  
  .hud-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    border-bottom: 1px solid #0066ff;
    padding-bottom: 10px;
  }
  
  .hud-title {
    display: flex;
    align-items: center;
    gap: 15px;
  }
  
  .hud-icon {
    font-size: 1.5rem;
    animation: glyphPulse 2s ease-in-out infinite;
  }
  
  .hud-name {
    color: #0066ff;
    font-weight: bold;
    font-size: 1rem;
    text-shadow: 0 0 10px #0066ff;
  }
  
  .sync-indicator {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    border-radius: 15px;
    background: rgba(0, 102, 255, 0.1);
    border: 1px solid #0066ff;
  }
  
  .sync-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #666;
    animation: pulse 2s infinite;
  }
  
  .sync-indicator.active .sync-dot {
    background: #00ff00;
    box-shadow: 0 0 10px #00ff00;
  }
  
  .sync-text {
    color: #0066ff;
    font-size: 0.7rem;
    font-weight: bold;
  }
  
  .hud-controls {
    display: flex;
    gap: 5px;
  }
  
  .hud-btn {
    background: #002244;
    color: #0066ff;
    border: 1px solid #0066ff;
    padding: 5px 10px;
    border-radius: 5px;
    font-size: 0.7rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .hud-btn:hover {
    background: #0066ff;
    color: #002244;
  }
  
  .hud-main {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
    gap: 15px;
    margin-bottom: 15px;
  }
  
  .circuit-display {
    grid-column: 1;
    grid-row: 1;
  }
  
  .glyph-display {
    grid-column: 2;
    grid-row: 1;
  }
  
  .frequency-display {
    grid-column: 1 / -1;
    grid-row: 2;
  }
  
  .circuit-header, .glyph-header, .frequency-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    color: #0066ff;
    font-size: 0.9rem;
  }
  
  .count-badge {
    background: #0066ff;
    color: #fff;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 0.7rem;
    font-weight: bold;
  }
  
  .frequency-value {
    color: #ffcc00;
    font-weight: bold;
  }
  
  .circuit-grid {
    display: flex;
    flex-direction: column;
    gap: 5px;
    max-height: 150px;
    overflow-y: auto;
  }
  
  .circuit-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 10px;
    background: rgba(0, 102, 255, 0.1);
    border-radius: 5px;
    border-left: 3px solid #0066ff;
  }
  
  .circuit-item.active {
    border-left-color: #00ff00;
    background: rgba(0, 255, 0, 0.1);
  }
  
  .circuit-name {
    color: #0066ff;
    font-size: 0.8rem;
  }
  
  .circuit-status {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  
  .status-light {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #666;
  }
  
  .status-light.active {
    background: #00ff00;
    box-shadow: 0 0 5px #00ff00;
  }
  
  .data-flow {
    color: #ffcc00;
    font-size: 0.7rem;
    font-weight: bold;
  }
  
  .glyph-matrix {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 3px;
    height: 120px;
  }
  
  .glyph-cell {
    border: 1px solid #333;
    border-radius: 3px;
    background: #000;
    position: relative;
    transition: all 0.3s ease;
  }
  
  .glyph-cell.active {
    border-color: #0066ff;
    box-shadow: 0 0 10px rgba(0, 102, 255, 0.5);
    animation: glyphCellPulse 1s ease-in-out;
  }
  
  .glyph-pulse-indicator {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 4px;
    height: 4px;
    background: #fff;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    animation: pulseIndicator 0.5s ease-out;
  }
  
  .frequency-canvas {
    border: 1px solid #333;
    border-radius: 5px;
    background: #000;
    width: 100%;
    height: 100px;
  }
  
  .hud-footer {
    border-top: 1px solid #0066ff;
    padding-top: 10px;
  }
  
  .marker-display {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .marker-label {
    color: #0066ff;
    font-size: 0.8rem;
    font-weight: bold;
    min-width: 100px;
  }
  
  .marker-grid {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
    flex: 1;
  }
  
  .sync-marker {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 3px 8px;
    background: rgba(0, 102, 255, 0.2);
    border-radius: 15px;
    border: 1px solid #0066ff;
    font-size: 0.7rem;
  }
  
  .marker-icon {
    font-size: 0.8rem;
  }
  
  .marker-info {
    display: flex;
    flex-direction: column;
    line-height: 1;
  }
  
  .marker-type {
    color: #0066ff;
    font-weight: bold;
  }
  
  .marker-time {
    color: #666;
    font-size: 0.6rem;
  }
  
  @keyframes glyphPulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.8; }
  }
  
  @keyframes glyphCellPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
  
  @keyframes pulseIndicator {
    0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    100% { opacity: 0; transform: translate(-50%, -50%) scale(3); }
  }
  
  @keyframes markerPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); background: rgba(0, 255, 0, 0.3); }
    100% { transform: scale(1); }
  }
`;