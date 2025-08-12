/**
 * Enhanced Cosmic Replay Terminal v3.0 - Real-Time Buffer Edition
 * Integrates real-time replay buffer with live/replay hybrid functionality
 */

class EnhancedCosmicReplayTerminal {
  constructor() {
    this.replayBuffer = null;
    this.isInitialized = false;
    this.isSpectralScrubMode = false;
    this.playbackSpeed = 1.0;
    this.savedReplayRelics = [];
    
    // UI Elements
    this.elements = {};
    
    // Event handlers
    this.handlers = {};
    
    this.init();
  }

  async init() {
    await this.initializeUI();
    this.initializeReplayBuffer();
    this.setupEventListeners();
    this.startStatusUpdates();
    this.loadSavedRelics();
    
    this.isInitialized = true;
    this.showNotification('Enhanced Cosmic Replay Terminal v3.0 Initialized', 'success');
  }

  async initializeUI() {
    // Create the main terminal interface
    const body = document.body;
    body.innerHTML = ''; // Clear existing content
    
    const terminalHTML = `
      <div class="enhanced-terminal-container">
        <div class="terminal-header">
          <div class="terminal-title">
            <span class="glow-text">⚡ COSMIC REPLAY TERMINAL v3.0 ⚡</span>
            <span class="buffer-badge">REAL-TIME BUFFER</span>
          </div>
          <div class="terminal-status">
            <span id="bufferStatus" class="status-indicator">🔴 INITIALIZING</span>
            <span id="modeStatus" class="status-indicator">📡 LIVE</span>
            <span id="connectionStatus" class="status-indicator">🔗 VAULT CONNECTED</span>
          </div>
        </div>

        <div class="terminal-main">
          <!-- Live/Replay Viewport -->
          <div class="enhanced-viewport">
            <div class="viewport-header">
              <div class="viewport-title">VAULT BROADCAST PULSE VIEWER</div>
              <div class="live-replay-toggle">
                <button id="spectralScrubBtn" class="scrub-btn">🌀 SPECTRAL SCRUB</button>
                <div class="live-indicator" id="liveIndicator">
                  <span class="live-dot"></span>
                  <span>LIVE</span>
                </div>
              </div>
            </div>
            
            <div class="replay-canvas" id="replayCanvas">
              <div class="relic-display" id="relicDisplay">
                <div class="relic-state" id="relicState">
                  <div class="glyph-sequence" id="glyphSequence">∴ ◊ ∞ ◊ ∴</div>
                  <div class="energy-field rotating" id="energyField"></div>
                  <div class="energy-level-bar">
                    <div class="energy-fill" id="energyFill"></div>
                  </div>
                </div>
                <div class="cosmic-particles" id="cosmicParticles"></div>
              </div>
              
              <!-- Buffer Status Overlay -->
              <div class="buffer-overlay" id="bufferOverlay">
                <div class="buffer-info">
                  <div id="bufferTime">Buffer: 0s / 90s</div>
                  <div id="timeBehind" class="time-behind">Live</div>
                </div>
              </div>
              
              <!-- Hotspot Markers -->
              <div class="hotspot-markers" id="hotspotMarkers"></div>
            </div>
          </div>

          <!-- Enhanced Controls Panel -->
          <div class="enhanced-controls-panel">
            <!-- Buffer Controls -->
            <div class="control-section">
              <h3 class="section-title">🔄 LIVE + REPLAY HYBRID</h3>
              <div class="buffer-controls">
                <button id="liveBtn" class="control-btn primary">📡 GO LIVE</button>
                <button id="catchUpBtn" class="control-btn">⚡ CATCH-UP BOOST</button>
                <div class="catch-up-speed" id="catchUpSpeed">1.0x</div>
              </div>
              
              <div class="buffer-timeline">
                <div class="timeline-track" id="bufferTimeline">
                  <div class="timeline-fill" id="timelineFill"></div>
                  <div class="playhead" id="bufferPlayhead"></div>
                  <div class="live-marker" id="liveMarker">LIVE</div>
                </div>
                <div class="timeline-labels">
                  <span>-90s</span>
                  <span>-45s</span>
                  <span>LIVE</span>
                </div>
              </div>
            </div>

            <!-- Hotspot Detection -->
            <div class="control-section">
              <h3 class="section-title">🔥 HOTSPOT MARKERS</h3>
              <div class="hotspot-list" id="hotspotList">
                <!-- Auto-detected hotspots will appear here -->
              </div>
              <div class="hotspot-stats">
                <span id="corePixelCount">Core Pulses: 0</span>
                <span id="glyphBurstCount">Glyph Bursts: 0</span>
                <span id="relicEvolutionCount">Relic Evolutions: 0</span>
              </div>
            </div>

            <!-- Replay Relic Creation -->
            <div class="control-section">
              <h3 class="section-title">💾 REPLAY RELIC CREATION</h3>
              <div class="relic-creation">
                <div class="time-selection">
                  <label>Start Time:</label>
                  <input type="number" id="relicStartTime" min="0" step="0.1" value="0">
                  <label>End Time:</label>
                  <input type="number" id="relicEndTime" min="0" step="0.1" value="10">
                </div>
                <div class="relic-metadata">
                  <input type="text" id="relicName" placeholder="Relic name...">
                  <textarea id="relicDescription" placeholder="Description..."></textarea>
                </div>
                <div class="relic-actions">
                  <button id="createRelicBtn" class="control-btn primary">💾 CREATE REPLAY RELIC</button>
                  <button id="mintRelicBtn" class="control-btn mint">⚙️ MINT TO VAULT</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Saved Replay Relics -->
        <div class="relic-vault">
          <div class="vault-header">
            <h3>🏛️ REPLAY RELIC VAULT</h3>
            <button id="toggleVaultBtn" class="toggle-btn">📋</button>
          </div>
          <div class="vault-content" id="vaultContent">
            <div class="relic-gallery" id="relicGallery">
              <!-- Saved replay relics will appear here -->
            </div>
          </div>
        </div>
      </div>
    `;
    
    body.innerHTML = terminalHTML;
    
    // Cache DOM elements
    this.elements = {
      bufferStatus: document.getElementById('bufferStatus'),
      modeStatus: document.getElementById('modeStatus'),
      spectralScrubBtn: document.getElementById('spectralScrubBtn'),
      liveIndicator: document.getElementById('liveIndicator'),
      glyphSequence: document.getElementById('glyphSequence'),
      energyField: document.getElementById('energyField'),
      energyFill: document.getElementById('energyFill'),
      bufferTime: document.getElementById('bufferTime'),
      timeBehind: document.getElementById('timeBehind'),
      hotspotMarkers: document.getElementById('hotspotMarkers'),
      liveBtn: document.getElementById('liveBtn'),
      catchUpBtn: document.getElementById('catchUpBtn'),
      catchUpSpeed: document.getElementById('catchUpSpeed'),
      bufferTimeline: document.getElementById('bufferTimeline'),
      timelineFill: document.getElementById('timelineFill'),
      bufferPlayhead: document.getElementById('bufferPlayhead'),
      liveMarker: document.getElementById('liveMarker'),
      hotspotList: document.getElementById('hotspotList'),
      corePixelCount: document.getElementById('corePixelCount'),
      glyphBurstCount: document.getElementById('glyphBurstCount'),
      relicEvolutionCount: document.getElementById('relicEvolutionCount'),
      createRelicBtn: document.getElementById('createRelicBtn'),
      mintRelicBtn: document.getElementById('mintRelicBtn'),
      relicGallery: document.getElementById('relicGallery')
    };
    
    // Load CSS
    await this.loadEnhancedStyles();
  }

  async loadEnhancedStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* Enhanced Terminal Styles */
      body {
        margin: 0;
        padding: 0;
        background: linear-gradient(135deg, #0a0a0a 0%, #1a0b2e 50%, #0a0a0a 100%);
        color: #00ff88;
        font-family: 'Share Tech Mono', monospace;
        min-height: 100vh;
      }

      .enhanced-terminal-container {
        max-width: 1800px;
        margin: 0 auto;
        padding: 20px;
        min-height: 100vh;
      }

      .terminal-header {
        background: rgba(0, 255, 136, 0.1);
        border: 2px solid #00ff88;
        border-radius: 10px;
        padding: 15px 25px;
        margin-bottom: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
      }

      .glow-text {
        font-family: 'Orbitron', monospace;
        font-weight: 900;
        font-size: 1.8rem;
        text-shadow: 0 0 10px #00ff88, 0 0 20px #00ff88, 0 0 30px #00ff88;
        animation: pulse-glow 2s ease-in-out infinite alternate;
      }

      .buffer-badge {
        background: linear-gradient(45deg, #ff1744, #ff5722);
        color: #fff;
        padding: 5px 12px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: bold;
        margin-left: 15px;
        animation: badge-pulse 3s ease-in-out infinite;
      }

      .terminal-status {
        display: flex;
        gap: 15px;
      }

      .status-indicator {
        padding: 8px 15px;
        background: rgba(0, 0, 0, 0.5);
        border: 1px solid #00ff88;
        border-radius: 5px;
        font-size: 0.9rem;
      }

      .terminal-main {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 20px;
        margin-bottom: 20px;
      }

      .enhanced-viewport {
        background: rgba(0, 0, 0, 0.8);
        border: 2px solid #00ff88;
        border-radius: 10px;
        overflow: hidden;
      }

      .viewport-header {
        background: rgba(0, 255, 136, 0.2);
        padding: 12px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #00ff88;
      }

      .live-replay-toggle {
        display: flex;
        align-items: center;
        gap: 15px;
      }

      .scrub-btn {
        background: rgba(156, 39, 176, 0.8);
        color: #fff;
        border: 2px solid #9c27b0;
        border-radius: 20px;
        padding: 8px 16px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .scrub-btn:hover {
        background: rgba(156, 39, 176, 1);
        box-shadow: 0 0 20px rgba(156, 39, 176, 0.5);
      }

      .scrub-btn.active {
        background: #9c27b0;
        box-shadow: 0 0 30px rgba(156, 39, 176, 0.8);
      }

      .live-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        background: rgba(76, 175, 80, 0.2);
        border: 1px solid #4caf50;
        border-radius: 15px;
      }

      .live-dot {
        width: 10px;
        height: 10px;
        background: #4caf50;
        border-radius: 50%;
        animation: live-pulse 1s ease-in-out infinite;
      }

      .replay-canvas {
        height: 500px;
        position: relative;
        background: radial-gradient(circle at center, rgba(0, 255, 136, 0.1) 0%, rgba(0, 0, 0, 0.9) 100%);
        overflow: hidden;
      }

      .buffer-overlay {
        position: absolute;
        top: 15px;
        left: 15px;
        background: rgba(0, 0, 0, 0.8);
        border: 1px solid #00ff88;
        border-radius: 5px;
        padding: 10px;
        font-size: 0.9rem;
      }

      .time-behind {
        color: #ff9800;
        font-weight: bold;
      }

      .energy-level-bar {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        width: 200px;
        height: 10px;
        background: rgba(0, 0, 0, 0.5);
        border: 1px solid #00ff88;
        border-radius: 5px;
        overflow: hidden;
      }

      .energy-fill {
        height: 100%;
        background: linear-gradient(90deg, #00ff88, #ffaa00, #ff6b00);
        width: 50%;
        transition: width 0.3s ease;
      }

      .enhanced-controls-panel {
        background: rgba(0, 0, 0, 0.8);
        border: 2px solid #00ff88;
        border-radius: 10px;
        padding: 20px;
        height: fit-content;
        max-height: 600px;
        overflow-y: auto;
      }

      .control-section {
        margin-bottom: 25px;
        padding-bottom: 20px;
        border-bottom: 1px solid rgba(0, 255, 136, 0.3);
      }

      .section-title {
        color: #00ff88;
        font-family: 'Orbitron', monospace;
        font-size: 1rem;
        margin-bottom: 15px;
        text-shadow: 0 0 5px #00ff88;
      }

      .buffer-controls {
        display: flex;
        gap: 10px;
        margin-bottom: 15px;
        align-items: center;
      }

      .control-btn {
        background: rgba(0, 255, 136, 0.1);
        color: #00ff88;
        border: 1px solid #00ff88;
        border-radius: 5px;
        padding: 8px 12px;
        font-family: inherit;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .control-btn:hover {
        background: rgba(0, 255, 136, 0.2);
        box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
      }

      .control-btn.primary {
        background: rgba(0, 255, 136, 0.3);
      }

      .control-btn.mint {
        background: rgba(255, 193, 7, 0.3);
        color: #ffc107;
        border-color: #ffc107;
      }

      .catch-up-speed {
        color: #ff9800;
        font-weight: bold;
        font-size: 1.1rem;
      }

      .buffer-timeline {
        margin-top: 15px;
      }

      .timeline-track {
        height: 20px;
        background: rgba(0, 0, 0, 0.5);
        border: 1px solid #00ff88;
        border-radius: 10px;
        position: relative;
        cursor: pointer;
      }

      .timeline-fill {
        height: 100%;
        background: rgba(0, 255, 136, 0.3);
        border-radius: 10px;
        width: 100%;
      }

      .playhead {
        position: absolute;
        top: -5px;
        width: 4px;
        height: 30px;
        background: #ffaa00;
        border-radius: 2px;
        box-shadow: 0 0 10px #ffaa00;
        transition: left 0.1s ease;
      }

      .live-marker {
        position: absolute;
        right: 5px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 0.8rem;
        color: #4caf50;
        font-weight: bold;
      }

      .timeline-labels {
        display: flex;
        justify-content: space-between;
        margin-top: 5px;
        font-size: 0.8rem;
        color: #888;
      }

      .hotspot-list {
        max-height: 150px;
        overflow-y: auto;
        margin-bottom: 10px;
      }

      .hotspot-item {
        background: rgba(255, 107, 0, 0.1);
        border: 1px solid #ff6b00;
        border-radius: 5px;
        padding: 8px 12px;
        margin-bottom: 5px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .hotspot-item:hover {
        background: rgba(255, 107, 0, 0.2);
      }

      .hotspot-stats {
        display: flex;
        flex-direction: column;
        gap: 5px;
        font-size: 0.8rem;
        color: #888;
      }

      .relic-creation {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .time-selection {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 10px;
        align-items: center;
      }

      .time-selection input {
        background: rgba(0, 0, 0, 0.6);
        color: #00ff88;
        border: 1px solid #00ff88;
        border-radius: 3px;
        padding: 5px 8px;
      }

      .relic-metadata input,
      .relic-metadata textarea {
        background: rgba(0, 0, 0, 0.6);
        color: #00ff88;
        border: 1px solid #00ff88;
        border-radius: 3px;
        padding: 8px 12px;
        font-family: inherit;
        width: 100%;
        box-sizing: border-box;
      }

      .relic-metadata textarea {
        height: 60px;
        resize: vertical;
      }

      .relic-actions {
        display: flex;
        gap: 10px;
      }

      .relic-vault {
        background: rgba(0, 0, 0, 0.9);
        border: 2px solid #00ff88;
        border-radius: 10px;
        margin-top: 20px;
      }

      .vault-header {
        background: rgba(0, 255, 136, 0.2);
        padding: 15px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #00ff88;
      }

      .vault-content {
        padding: 20px;
        max-height: 300px;
        overflow-y: auto;
      }

      .relic-gallery {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 15px;
      }

      .relic-card {
        background: rgba(0, 255, 136, 0.05);
        border: 1px solid rgba(0, 255, 136, 0.3);
        border-radius: 10px;
        padding: 15px;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .relic-card:hover {
        background: rgba(0, 255, 136, 0.1);
        box-shadow: 0 0 15px rgba(0, 255, 136, 0.3);
      }

      .relic-name {
        font-weight: bold;
        margin-bottom: 5px;
        color: #00ff88;
      }

      .relic-info {
        font-size: 0.8rem;
        color: #888;
        margin-bottom: 10px;
      }

      .relic-actions-card {
        display: flex;
        gap: 10px;
      }

      /* Animations */
      @keyframes pulse-glow {
        0% { text-shadow: 0 0 10px #00ff88, 0 0 20px #00ff88, 0 0 30px #00ff88; }
        100% { text-shadow: 0 0 20px #00ff88, 0 0 30px #00ff88, 0 0 40px #00ff88; }
      }

      @keyframes badge-pulse {
        0%, 100% { box-shadow: 0 0 10px rgba(255, 23, 68, 0.5); }
        50% { box-shadow: 0 0 20px rgba(255, 87, 34, 0.8); }
      }

      @keyframes live-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }

      /* Responsive Design */
      @media (max-width: 1200px) {
        .terminal-main {
          grid-template-columns: 1fr;
        }
      }
    `;
    
    document.head.appendChild(style);
  }

  initializeReplayBuffer() {
    this.replayBuffer = new ReplayBuffer(90); // 90-second buffer
    
    // Set up buffer event handlers
    this.replayBuffer.onHotspotDetected = (hotspot) => {
      this.handleHotspotDetected(hotspot);
    };
    
    this.replayBuffer.onBufferUpdate = (status) => {
      this.updateBufferStatus(status);
    };
    
    this.elements.bufferStatus.textContent = '🟢 RECORDING';
  }

  setupEventListeners() {
    // Spectral Scrub Mode Toggle
    this.elements.spectralScrubBtn.addEventListener('click', () => {
      this.toggleSpectralScrubMode();
    });
    
    // Live Button
    this.elements.liveBtn.addEventListener('click', () => {
      this.goLive();
    });
    
    // Catch-up Boost
    this.elements.catchUpBtn.addEventListener('click', () => {
      this.triggerCatchUpBoost();
    });
    
    // Timeline scrubbing
    this.elements.bufferTimeline.addEventListener('click', (e) => {
      this.scrubTimeline(e);
    });
    
    // Replay Relic creation
    this.elements.createRelicBtn.addEventListener('click', () => {
      this.createReplayRelic();
    });
    
    this.elements.mintRelicBtn.addEventListener('click', () => {
      this.mintReplayRelic();
    });
  }

  toggleSpectralScrubMode() {
    if (this.isSpectralScrubMode) {
      // Exit scrub mode
      this.isSpectralScrubMode = false;
      this.replayBuffer.exitScrubMode();
      this.elements.spectralScrubBtn.textContent = '🌀 SPECTRAL SCRUB';
      this.elements.spectralScrubBtn.classList.remove('active');
      this.elements.modeStatus.textContent = '📡 LIVE';
      this.elements.liveIndicator.style.display = 'flex';
    } else {
      // Enter scrub mode
      this.isSpectralScrubMode = true;
      this.replayBuffer.enterScrubMode();
      this.elements.spectralScrubBtn.textContent = '📡 EXIT SCRUB';
      this.elements.spectralScrubBtn.classList.add('active');
      this.elements.modeStatus.textContent = '🌀 SCRUB MODE';
      this.elements.liveIndicator.style.display = 'none';
    }
  }

  goLive() {
    if (this.isSpectralScrubMode) {
      this.toggleSpectralScrubMode();
    }
    this.replayBuffer.currentTime = this.replayBuffer.liveTime;
  }

  triggerCatchUpBoost() {
    if (!this.replayBuffer.isLive && this.replayBuffer.currentTime < this.replayBuffer.liveTime) {
      this.replayBuffer.exitScrubMode();
      this.showNotification('Catch-up boost activated!', 'info');
    }
  }

  scrubTimeline(event) {
    const rect = this.elements.bufferTimeline.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = x / rect.width;
    
    // Convert to time (90 seconds ago to live)
    const targetTime = this.replayBuffer.liveTime - (90 * (1 - percentage));
    
    if (!this.isSpectralScrubMode) {
      this.toggleSpectralScrubMode();
    }
    
    this.replayBuffer.seekToTime(targetTime);
  }

  handleHotspotDetected(hotspot) {
    // Add hotspot to UI
    const hotspotElement = document.createElement('div');
    hotspotElement.className = 'hotspot-item';
    hotspotElement.innerHTML = `
      <div>
        <span class="hotspot-type">${this.getHotspotIcon(hotspot.type)} ${hotspot.type}</span>
        <span class="hotspot-time">${this.formatTime(hotspot.time)}</span>
      </div>
      <span class="hotspot-intensity">${hotspot.intensity.toFixed(0)}%</span>
    `;
    
    hotspotElement.addEventListener('click', () => {
      this.jumpToHotspot(hotspot);
    });
    
    this.elements.hotspotList.insertBefore(hotspotElement, this.elements.hotspotList.firstChild);
    
    // Update stats
    this.updateHotspotStats();
    
    // Show visual indicator on timeline
    this.addHotspotMarker(hotspot);
    
    this.showNotification(`${hotspot.type} detected! Intensity: ${hotspot.intensity.toFixed(0)}%`, 'warning');
  }

  getHotspotIcon(type) {
    const icons = {
      'core-pulse': '💥',
      'glyph-burst': '✨',
      'relic-evolution': '🔮'
    };
    return icons[type] || '⚡';
  }

  jumpToHotspot(hotspot) {
    if (!this.isSpectralScrubMode) {
      this.toggleSpectralScrubMode();
    }
    this.replayBuffer.seekToTime(hotspot.time);
    this.showNotification(`Jumped to ${hotspot.type} at ${this.formatTime(hotspot.time)}`, 'info');
  }

  addHotspotMarker(hotspot) {
    const marker = document.createElement('div');
    marker.className = 'timeline-hotspot-marker';
    marker.style.cssText = `
      position: absolute;
      top: 0;
      height: 100%;
      width: 2px;
      background: ${this.getHotspotColor(hotspot.type)};
      left: ${((hotspot.time - (this.replayBuffer.liveTime - 90)) / 90) * 100}%;
      z-index: 10;
      cursor: pointer;
    `;
    
    marker.title = `${hotspot.type} - ${this.formatTime(hotspot.time)}`;
    marker.addEventListener('click', (e) => {
      e.stopPropagation();
      this.jumpToHotspot(hotspot);
    });
    
    this.elements.bufferTimeline.appendChild(marker);
  }

  getHotspotColor(type) {
    const colors = {
      'core-pulse': '#ff1744',
      'glyph-burst': '#ffeb3b',
      'relic-evolution': '#9c27b0'
    };
    return colors[type] || '#ff6b00';
  }

  updateHotspotStats() {
    const stats = this.replayBuffer.hotspots.reduce((acc, hotspot) => {
      acc[hotspot.type] = (acc[hotspot.type] || 0) + 1;
      return acc;
    }, {});
    
    this.elements.corePixelCount.textContent = `Core Pulses: ${stats['core-pulse'] || 0}`;
    this.elements.glyphBurstCount.textContent = `Glyph Bursts: ${stats['glyph-burst'] || 0}`;
    this.elements.relicEvolutionCount.textContent = `Relic Evolutions: ${stats['relic-evolution'] || 0}`;
  }

  updateBufferStatus(status) {
    // Update buffer info
    this.elements.bufferTime.textContent = `Buffer: ${Math.floor(status.currentTime)}s / ${status.bufferDuration}s`;
    
    if (status.isLive) {
      this.elements.timeBehind.textContent = 'Live';
      this.elements.timeBehind.style.color = '#4caf50';
    } else {
      const behind = Math.floor(status.timeBehind);
      this.elements.timeBehind.textContent = `${behind}s behind`;
      this.elements.timeBehind.style.color = '#ff9800';
    }
    
    // Update catch-up speed display
    if (status.isCatchingUp) {
      this.elements.catchUpSpeed.textContent = `${status.catchUpSpeed.toFixed(1)}x`;
      this.elements.catchUpSpeed.style.color = '#ff5722';
    } else {
      this.elements.catchUpSpeed.textContent = '1.0x';
      this.elements.catchUpSpeed.style.color = '#888';
    }
    
    // Update timeline playhead
    const progress = Math.max(0, Math.min(1, (status.currentTime - (status.liveTime - 90)) / 90));
    this.elements.bufferPlayhead.style.left = `${progress * 100}%`;
    
    // Update visual state
    this.updateVisualState(status);
  }

  updateVisualState(status) {
    const currentFrame = this.replayBuffer.getCurrentFrame();
    if (!currentFrame) return;
    
    // Update glyph sequence
    this.elements.glyphSequence.textContent = currentFrame.glyphSequence;
    
    // Update energy level
    this.elements.energyFill.style.width = `${currentFrame.energyLevel}%`;
    
    // Update energy field based on energy level
    const energyField = this.elements.energyField;
    if (currentFrame.energyLevel > 80) {
      energyField.style.boxShadow = '0 0 40px #ff1744, inset 0 0 40px rgba(255, 23, 68, 0.5)';
      energyField.style.animationDuration = '1s';
    } else if (currentFrame.energyLevel > 60) {
      energyField.style.boxShadow = '0 0 30px #ff9800, inset 0 0 30px rgba(255, 152, 0, 0.4)';
      energyField.style.animationDuration = '2s';
    } else {
      energyField.style.boxShadow = '0 0 20px #00ff88, inset 0 0 20px rgba(0, 255, 136, 0.3)';
      energyField.style.animationDuration = '8s';
    }
  }

  createReplayRelic() {
    const startTime = parseFloat(document.getElementById('relicStartTime').value) || 0;
    const endTime = parseFloat(document.getElementById('relicEndTime').value) || 10;
    const name = document.getElementById('relicName').value || `Replay Relic ${Date.now()}`;
    const description = document.getElementById('relicDescription').value || 'Auto-generated replay relic';
    
    if (startTime >= endTime) {
      this.showNotification('End time must be greater than start time', 'error');
      return;
    }
    
    const maxStartTime = this.replayBuffer.liveTime - 90;
    const adjustedStartTime = Math.max(maxStartTime, this.replayBuffer.liveTime - (90 - startTime));
    const adjustedEndTime = Math.max(adjustedStartTime + 1, this.replayBuffer.liveTime - (90 - endTime));
    
    const relic = this.replayBuffer.createReplayRelic(adjustedStartTime, adjustedEndTime, {
      name: name,
      description: description,
      creator: 'Enhanced Cosmic Replay Terminal v3.0'
    });
    
    this.savedReplayRelics.push(relic);
    this.saveRelicsToStorage();
    this.renderReplayRelics();
    
    this.showNotification(`Replay Relic "${name}" created successfully!`, 'success');
  }

  async mintReplayRelic() {
    if (this.savedReplayRelics.length === 0) {
      this.showNotification('No replay relics to mint', 'error');
      return;
    }
    
    const latestRelic = this.savedReplayRelics[this.savedReplayRelics.length - 1];
    
    try {
      // Here you would integrate with the existing minting system
      // For now, simulate the minting process
      this.showNotification('Initiating mint process...', 'info');
      
      // Simulate async minting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      latestRelic.minted = true;
      latestRelic.mintTimestamp = new Date().toISOString();
      latestRelic.tokenId = Math.floor(Math.random() * 100000);
      
      this.saveRelicsToStorage();
      this.renderReplayRelics();
      
      this.showNotification(`Replay Relic minted as Token #${latestRelic.tokenId}!`, 'success');
    } catch (error) {
      this.showNotification('Minting failed: ' + error.message, 'error');
    }
  }

  renderReplayRelics() {
    this.elements.relicGallery.innerHTML = '';
    
    this.savedReplayRelics.forEach((relic, index) => {
      const relicCard = document.createElement('div');
      relicCard.className = 'relic-card';
      relicCard.innerHTML = `
        <div class="relic-name">${relic.metadata.name}</div>
        <div class="relic-info">
          Duration: ${relic.duration.toFixed(1)}s | Frames: ${relic.frameCount} | Hotspots: ${relic.hotspots.length}
          ${relic.minted ? `<br>🏆 Minted as Token #${relic.tokenId}` : ''}
        </div>
        <div class="relic-actions-card">
          <button class="control-btn" onclick="window.enhancedTerminal.playReplayRelic(${index})">▶️ Play</button>
          ${!relic.minted ? '<button class="control-btn mint" onclick="window.enhancedTerminal.mintSpecificRelic(' + index + ')">⚙️ Mint</button>' : ''}
          <button class="control-btn" onclick="window.enhancedTerminal.deleteReplayRelic(${index})">🗑️ Delete</button>
        </div>
      `;
      
      this.elements.relicGallery.appendChild(relicCard);
    });
  }

  playReplayRelic(index) {
    const relic = this.savedReplayRelics[index];
    if (!relic) return;
    
    // Enter scrub mode and seek to relic start
    if (!this.isSpectralScrubMode) {
      this.toggleSpectralScrubMode();
    }
    
    this.replayBuffer.seekToTime(relic.startTime);
    this.showNotification(`Playing replay relic: ${relic.metadata.name}`, 'info');
  }

  async mintSpecificRelic(index) {
    const relic = this.savedReplayRelics[index];
    if (!relic) return;
    
    try {
      this.showNotification(`Minting "${relic.metadata.name}"...`, 'info');
      
      // Simulate minting process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      relic.minted = true;
      relic.mintTimestamp = new Date().toISOString();
      relic.tokenId = Math.floor(Math.random() * 100000);
      
      this.saveRelicsToStorage();
      this.renderReplayRelics();
      
      this.showNotification(`"${relic.metadata.name}" minted as Token #${relic.tokenId}!`, 'success');
    } catch (error) {
      this.showNotification('Minting failed: ' + error.message, 'error');
    }
  }

  deleteReplayRelic(index) {
    const relic = this.savedReplayRelics[index];
    if (!relic) return;
    
    if (confirm(`Delete replay relic "${relic.metadata.name}"?`)) {
      this.savedReplayRelics.splice(index, 1);
      this.saveRelicsToStorage();
      this.renderReplayRelics();
      this.showNotification('Replay relic deleted', 'info');
    }
  }

  startStatusUpdates() {
    setInterval(() => {
      if (this.replayBuffer) {
        const status = this.replayBuffer.getBufferStatus();
        this.updateBufferStatus(status);
      }
    }, 100); // Update every 100ms
  }

  loadSavedRelics() {
    try {
      const saved = localStorage.getItem('enhancedCosmicReplayRelics');
      if (saved) {
        this.savedReplayRelics = JSON.parse(saved);
        this.renderReplayRelics();
      }
    } catch (error) {
      console.warn('Failed to load saved replay relics:', error);
    }
  }

  saveRelicsToStorage() {
    try {
      localStorage.setItem('enhancedCosmicReplayRelics', JSON.stringify(this.savedReplayRelics));
    } catch (error) {
      console.warn('Failed to save replay relics:', error);
    }
  }

  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
    }
  }

  showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${this.getNotificationColor(type)};
      color: ${type === 'success' || type === 'error' ? '#fff' : '#000'};
      padding: 15px 20px;
      border-radius: 5px;
      z-index: 10000;
      font-family: 'Share Tech Mono', monospace;
      max-width: 350px;
      word-wrap: break-word;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
      animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, duration);
  }

  getNotificationColor(type) {
    const colors = {
      success: 'rgba(76, 175, 80, 0.9)',
      error: 'rgba(244, 67, 54, 0.9)',
      warning: 'rgba(255, 152, 0, 0.9)',
      info: 'rgba(0, 255, 136, 0.9)'
    };
    return colors[type] || colors.info;
  }

  destroy() {
    if (this.replayBuffer) {
      this.replayBuffer.destroy();
    }
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.enhancedTerminal = new EnhancedCosmicReplayTerminal();
});

// Add notification animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnhancedCosmicReplayTerminal;
}