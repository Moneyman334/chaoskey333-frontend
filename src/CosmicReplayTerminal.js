/**
 * Cosmic Replay Terminal v2.0 - Propagation Layer
 * Handles real-time broadcasting, NFT updates, and public display for the Apex Node Ignition Protocol
 */

class CosmicReplayTerminal {
  constructor() {
    this.isActive = false;
    this.version = "2.0";
    this.connectedClients = new Set();
    this.broadcastQueue = [];
    this.replayHistory = [];
    this.currentBroadcast = null;
    this.scrubPosition = 0;
    this.isReplaying = false;
    this.websocketUrl = null; // Would be configured for real-time broadcasting
  }

  /**
   * Initialize the Cosmic Replay Terminal
   */
  async initialize() {
    try {
      console.log("🌌 Initializing Cosmic Replay Terminal v2.0...");
      
      this.createTerminalInterface();
      this.initializeBroadcastSystem();
      
      this.isActive = true;
      console.log("✅ Cosmic Replay Terminal v2.0 initialized");
      return true;
    } catch (error) {
      console.error("❌ Cosmic Replay Terminal initialization failed:", error);
      return false;
    }
  }

  /**
   * Create terminal interface elements
   */
  createTerminalInterface() {
    const existingTerminal = document.getElementById('cosmicReplayTerminal');
    if (existingTerminal) {
      existingTerminal.remove();
    }

    const terminalContainer = document.createElement('div');
    terminalContainer.id = 'cosmicReplayTerminal';
    terminalContainer.className = 'cosmic-replay-terminal';
    terminalContainer.innerHTML = `
      <div class="terminal-header">
        <span class="terminal-title">◉ COSMIC REPLAY TERMINAL v${this.version} ◉</span>
        <div class="terminal-controls">
          <button id="toggleTerminal" class="control-btn">─</button>
          <button id="closeTerminal" class="control-btn">✕</button>
        </div>
      </div>
      <div class="terminal-body">
        <div class="broadcast-section">
          <div class="section-title">📡 VAULT BROADCAST STATUS</div>
          <div id="broadcastStatus" class="status-display">STANDBY</div>
          <div id="connectedClients" class="client-count">Connected Clients: 0</div>
        </div>
        <div class="replay-section">
          <div class="section-title">⏯️ REPLAY CONTROLS</div>
          <div class="replay-controls">
            <button id="replayPlay" class="replay-btn">▶️</button>
            <button id="replayPause" class="replay-btn">⏸️</button>
            <button id="replayStop" class="replay-btn">⏹️</button>
            <button id="replayRewind" class="replay-btn">⏪</button>
            <button id="replayForward" class="replay-btn">⏩</button>
          </div>
          <div class="scrub-bar">
            <input type="range" id="scrubSlider" min="0" max="100" value="0" class="scrub-slider">
            <div id="scrubTime" class="scrub-time">00:00 / 00:00</div>
          </div>
        </div>
        <div class="evolution-log">
          <div class="section-title">📜 EVOLUTION LOG</div>
          <div id="evolutionLog" class="log-display">
            <div class="log-entry">Terminal initialized. Awaiting evolution events...</div>
          </div>
        </div>
        <div class="asset-display">
          <div class="section-title">🎨 ASSET DISPLAY</div>
          <div id="assetPreview" class="asset-preview">
            <div class="asset-placeholder">Awaiting evolved asset...</div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(terminalContainer);
    this.bindTerminalEvents();
  }

  /**
   * Bind terminal event listeners
   */
  bindTerminalEvents() {
    // Terminal controls
    document.getElementById('toggleTerminal')?.addEventListener('click', () => {
      this.toggleTerminal();
    });

    document.getElementById('closeTerminal')?.addEventListener('click', () => {
      this.hideTerminal();
    });

    // Replay controls
    document.getElementById('replayPlay')?.addEventListener('click', () => {
      this.startReplay();
    });

    document.getElementById('replayPause')?.addEventListener('click', () => {
      this.pauseReplay();
    });

    document.getElementById('replayStop')?.addEventListener('click', () => {
      this.stopReplay();
    });

    document.getElementById('replayRewind')?.addEventListener('click', () => {
      this.rewindReplay();
    });

    document.getElementById('replayForward')?.addEventListener('click', () => {
      this.forwardReplay();
    });

    // Scrub bar
    document.getElementById('scrubSlider')?.addEventListener('input', (e) => {
      this.scrubToPosition(parseInt(e.target.value));
    });
  }

  /**
   * Initialize broadcast system
   */
  initializeBroadcastSystem() {
    // Simulate connected clients
    this.simulateClientConnections();
    
    // Start broadcast heartbeat
    setInterval(() => {
      this.updateClientDisplay();
      this.processBroadcastQueue();
    }, 1000);
  }

  /**
   * Simulate client connections for demo
   */
  simulateClientConnections() {
    const clientIds = [
      'VAULT_CLIENT_ALPHA',
      'VAULT_CLIENT_BETA', 
      'VAULT_CLIENT_GAMMA',
      'VAULT_CLIENT_OMEGA'
    ];

    clientIds.forEach((id, index) => {
      setTimeout(() => {
        this.connectedClients.add(id);
        this.logEvolution(`Client connected: ${id}`);
      }, (index + 1) * 2000);
    });
  }

  /**
   * Broadcast evolution to all vault clients
   */
  async broadcastEvolution(evolutionData) {
    try {
      console.log("📡 Broadcasting evolution to all vault clients...", evolutionData);

      const broadcast = {
        id: this.generateBroadcastId(),
        type: 'EVOLUTION_BROADCAST',
        data: evolutionData,
        timestamp: Date.now(),
        clientCount: this.connectedClients.size,
        status: 'BROADCASTING'
      };

      this.currentBroadcast = broadcast;
      this.broadcastQueue.push(broadcast);

      // Update status display
      this.updateBroadcastStatus('BROADCASTING EVOLUTION');
      this.logEvolution(`🌟 Broadcasting ${evolutionData.evolutionLevel} evolution to ${this.connectedClients.size} clients`);

      // Simulate real-time propagation
      await this.simulatePropagation(broadcast);

      // Update NFT metadata
      await this.updateNFTMetadata(evolutionData);

      // Update public display assets
      await this.updatePublicDisplayAssets(evolutionData);

      broadcast.status = 'COMPLETE';
      broadcast.completionTime = Date.now();

      this.replayHistory.push(broadcast);
      this.updateBroadcastStatus('BROADCAST COMPLETE');
      this.logEvolution('✅ Evolution broadcast complete - All clients synchronized');

      return broadcast;

    } catch (error) {
      console.error("❌ Broadcast failed:", error);
      this.updateBroadcastStatus('BROADCAST FAILED');
      this.logEvolution(`❌ Broadcast failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Simulate propagation to connected clients
   */
  async simulatePropagation(broadcast) {
    const clients = Array.from(this.connectedClients);
    
    for (let i = 0; i < clients.length; i++) {
      const client = clients[i];
      
      // Simulate network delay
      await this.sleep(500 + Math.random() * 1000);
      
      this.logEvolution(`📡 ${client} received evolution data`);
      
      // Update progress
      const progress = ((i + 1) / clients.length) * 100;
      this.updateBroadcastProgress(progress);
    }
  }

  /**
   * Update NFT metadata via blockchain mutation push
   */
  async updateNFTMetadata(evolutionData) {
    try {
      console.log("⛓️ Updating NFT metadata via blockchain mutation push...");
      
      this.logEvolution('⛓️ Initiating blockchain metadata update...');

      // Simulate blockchain interaction
      await this.sleep(2000);

      const metadataUpdate = {
        tokenId: evolutionData.tokenId || 'UNKNOWN',
        newMetadataURI: `ipfs://evolved_${evolutionData.mutationSeed}_${Date.now()}`,
        evolutionLevel: evolutionData.evolutionLevel,
        mutationSeed: evolutionData.mutationSeed,
        updateTimestamp: Date.now()
      };

      // Simulate transaction
      const txHash = `0x${this.generateMockHash()}`;
      metadataUpdate.transactionHash = txHash;

      this.logEvolution(`✅ NFT metadata updated: ${metadataUpdate.newMetadataURI}`);
      this.logEvolution(`📝 Transaction: ${txHash}`);

      return metadataUpdate;

    } catch (error) {
      this.logEvolution(`❌ NFT metadata update failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update public display assets with synced asset swap
   */
  async updatePublicDisplayAssets(evolutionData) {
    try {
      console.log("🎨 Updating public display assets...");
      
      this.logEvolution('🎨 Generating evolved assets...');

      // Generate asset URLs for different formats
      const assetFormats = {
        webm: `https://evolved-assets.chaoskey333.com/webm/evolved_${evolutionData.mutationSeed}.webm`,
        mp4: `https://evolved-assets.chaoskey333.com/mp4/evolved_${evolutionData.mutationSeed}.mp4`,
        gif: `https://evolved-assets.chaoskey333.com/gif/evolved_${evolutionData.mutationSeed}.gif`,
        png: `https://evolved-assets.chaoskey333.com/png/evolved_${evolutionData.mutationSeed}.png`
      };

      // Update asset preview in terminal
      this.updateAssetPreview(assetFormats, evolutionData);

      // Simulate asset processing time
      await this.sleep(1500);

      this.logEvolution('✅ Public display assets updated and synchronized');
      this.logEvolution(`🎬 WebM: ${assetFormats.webm}`);
      this.logEvolution(`🎥 MP4: ${assetFormats.mp4}`);
      this.logEvolution(`🖼️ GIF: ${assetFormats.gif}`);

      return assetFormats;

    } catch (error) {
      this.logEvolution(`❌ Asset update failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update asset preview in terminal
   */
  updateAssetPreview(assetFormats, evolutionData) {
    const previewElement = document.getElementById('assetPreview');
    if (previewElement) {
      previewElement.innerHTML = `
        <div class="evolved-asset-preview">
          <div class="asset-title">🌟 EVOLVED RELIC - ${evolutionData.evolutionLevel}</div>
          <div class="asset-seed">Mutation Seed: ${evolutionData.mutationSeed}</div>
          <div class="asset-formats">
            <div class="format-item">📹 WebM Ready</div>
            <div class="format-item">🎥 MP4 Ready</div>
            <div class="format-item">🖼️ GIF Ready</div>
            <div class="format-item">🖼️ PNG Ready</div>
          </div>
          <div class="asset-timestamp">Generated: ${new Date(evolutionData.timestamp).toLocaleString()}</div>
        </div>
      `;
    }
  }

  /**
   * Start replay functionality
   */
  startReplay() {
    if (this.replayHistory.length === 0) {
      this.logEvolution('⚠️ No replay data available');
      return;
    }

    this.isReplaying = true;
    this.logEvolution('▶️ Starting replay...');
    
    // Simulate replay playback
    this.simulateReplayPlayback();
  }

  /**
   * Simulate replay playback
   */
  simulateReplayPlayback() {
    const totalDuration = 10000; // 10 seconds
    const interval = 100; // Update every 100ms
    let elapsed = this.scrubPosition * totalDuration / 100;

    const playbackInterval = setInterval(() => {
      if (!this.isReplaying) {
        clearInterval(playbackInterval);
        return;
      }

      elapsed += interval;
      this.scrubPosition = (elapsed / totalDuration) * 100;

      if (this.scrubPosition >= 100) {
        this.scrubPosition = 100;
        this.isReplaying = false;
        clearInterval(playbackInterval);
        this.logEvolution('⏹️ Replay complete');
      }

      this.updateScrubDisplay();
    }, interval);
  }

  /**
   * Pause replay
   */
  pauseReplay() {
    this.isReplaying = false;
    this.logEvolution('⏸️ Replay paused');
  }

  /**
   * Stop replay
   */
  stopReplay() {
    this.isReplaying = false;
    this.scrubPosition = 0;
    this.updateScrubDisplay();
    this.logEvolution('⏹️ Replay stopped');
  }

  /**
   * Rewind replay
   */
  rewindReplay() {
    this.scrubPosition = Math.max(0, this.scrubPosition - 10);
    this.updateScrubDisplay();
    this.logEvolution('⏪ Rewind -10%');
  }

  /**
   * Forward replay
   */
  forwardReplay() {
    this.scrubPosition = Math.min(100, this.scrubPosition + 10);
    this.updateScrubDisplay();
    this.logEvolution('⏩ Forward +10%');
  }

  /**
   * Scrub to specific position
   */
  scrubToPosition(position) {
    this.scrubPosition = position;
    this.updateScrubDisplay();
    this.logEvolution(`📍 Scrub to ${position}%`);
  }

  /**
   * Update scrub display
   */
  updateScrubDisplay() {
    const scrubSlider = document.getElementById('scrubSlider');
    const scrubTime = document.getElementById('scrubTime');

    if (scrubSlider) {
      scrubSlider.value = this.scrubPosition;
    }

    if (scrubTime) {
      const currentSeconds = Math.floor((this.scrubPosition / 100) * 600); // 10 minutes max
      const totalSeconds = 600;
      
      const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      };

      scrubTime.textContent = `${formatTime(currentSeconds)} / ${formatTime(totalSeconds)}`;
    }
  }

  /**
   * Update broadcast status display
   */
  updateBroadcastStatus(status) {
    const statusElement = document.getElementById('broadcastStatus');
    if (statusElement) {
      statusElement.textContent = status;
      statusElement.className = `status-display ${status.toLowerCase().replace(' ', '-')}`;
    }
  }

  /**
   * Update broadcast progress
   */
  updateBroadcastProgress(progress) {
    this.updateBroadcastStatus(`BROADCASTING ${progress.toFixed(0)}%`);
  }

  /**
   * Update client display
   */
  updateClientDisplay() {
    const clientElement = document.getElementById('connectedClients');
    if (clientElement) {
      clientElement.textContent = `Connected Clients: ${this.connectedClients.size}`;
    }
  }

  /**
   * Process broadcast queue
   */
  processBroadcastQueue() {
    // Process any pending broadcasts
    if (this.broadcastQueue.length > 0) {
      const pending = this.broadcastQueue.filter(b => b.status === 'PENDING');
      // Handle pending broadcasts if any
    }
  }

  /**
   * Log evolution event
   */
  logEvolution(message) {
    const logElement = document.getElementById('evolutionLog');
    if (logElement) {
      const timestamp = new Date().toLocaleTimeString();
      const logEntry = document.createElement('div');
      logEntry.className = 'log-entry';
      logEntry.innerHTML = `<span class="timestamp">[${timestamp}]</span> ${message}`;
      
      logElement.appendChild(logEntry);
      logElement.scrollTop = logElement.scrollHeight;

      // Keep only last 50 entries
      while (logElement.children.length > 50) {
        logElement.removeChild(logElement.firstChild);
      }
    }
  }

  /**
   * Toggle terminal visibility
   */
  toggleTerminal() {
    const terminal = document.getElementById('cosmicReplayTerminal');
    const body = terminal?.querySelector('.terminal-body');
    
    if (body) {
      body.style.display = body.style.display === 'none' ? 'block' : 'none';
    }
  }

  /**
   * Hide terminal
   */
  hideTerminal() {
    const terminal = document.getElementById('cosmicReplayTerminal');
    if (terminal) {
      terminal.style.display = 'none';
    }
  }

  /**
   * Show terminal
   */
  showTerminal() {
    const terminal = document.getElementById('cosmicReplayTerminal');
    if (terminal) {
      terminal.style.display = 'block';
    }
  }

  /**
   * Generate broadcast ID
   */
  generateBroadcastId() {
    return 'BROADCAST_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  /**
   * Generate mock hash
   */
  generateMockHash() {
    return Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }

  /**
   * Utility function for delays
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get terminal status
   */
  getStatus() {
    return {
      active: this.isActive,
      version: this.version,
      connectedClients: this.connectedClients.size,
      broadcastQueueLength: this.broadcastQueue.length,
      replayHistoryLength: this.replayHistory.length,
      isReplaying: this.isReplaying
    };
  }
}

// Export for use in other modules
window.CosmicReplayTerminal = CosmicReplayTerminal;