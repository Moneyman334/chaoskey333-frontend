// Cosmic Replay Terminal v2.0 - Ascension Edition
// Handles replay events, rate limiting, and live replay pushes

import { 
  OMNI_SINGULARITY_CONFIG, 
  REPLAY_EVENT_TYPES,
  ReplayRateLimiter,
  ReplayStorage,
  omniLog 
} from './omni-singularity-config.js';

export class CosmicReplayTerminal {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = null;
    this.rateLimiter = new ReplayRateLimiter();
    this.storage = new ReplayStorage();
    this.isInitialized = false;
    this.terminalLines = [];
    this.maxLines = 50;
    this.autoScrollEnabled = true;
    this.replayQueue = [];
    this.processingReplay = false;
    
    omniLog('Initializing Cosmic Replay Terminal v2.0', 'info');
  }
  
  initialize() {
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      omniLog(`Container ${this.containerId} not found`, 'error');
      return false;
    }
    
    this.createTerminalStructure();
    this.setupEventListeners();
    this.startReplayProcessing();
    this.loadStoredReplays();
    
    this.isInitialized = true;
    omniLog('Cosmic Replay Terminal v2.0 initialized successfully', 'success');
    
    this.addTerminalLine('🌀 COSMIC REPLAY TERMINAL v2.0 - ASCENSION EDITION', 'system');
    this.addTerminalLine('⚡ Omni-Singularity Architecture Online', 'success');
    this.addTerminalLine(`🔄 Replay Rate Limit: ${OMNI_SINGULARITY_CONFIG.REPLAY_RATE_LIMIT / 1000}s`, 'info');
    this.addTerminalLine(`💾 Retention Policy: ${OMNI_SINGULARITY_CONFIG.REPLAY_RETENTION}`, 'info');
    
    return true;
  }
  
  createTerminalStructure() {
    const terminalContainer = document.createElement('div');
    terminalContainer.className = 'cosmic-replay-terminal';
    terminalContainer.innerHTML = `
      <div class="terminal-header">
        <div class="terminal-title">
          <span class="terminal-icon">🌀</span>
          <span class="terminal-name">COSMIC REPLAY TERMINAL v2.0</span>
          <span class="ascension-badge">ASCENSION EDITION</span>
        </div>
        <div class="terminal-controls">
          <button id="toggleAutoScroll" class="control-btn active">AUTO-SCROLL</button>
          <button id="clearTerminal" class="control-btn">CLEAR</button>
          <button id="forceReplay" class="control-btn danger">FORCE REPLAY</button>
        </div>
      </div>
      <div class="terminal-status">
        <div class="status-item">
          <span class="status-label">RATE LIMIT:</span>
          <span id="rateLimitStatus" class="status-value">READY</span>
        </div>
        <div class="status-item">
          <span class="status-label">QUEUE:</span>
          <span id="queueStatus" class="status-value">0</span>
        </div>
        <div class="status-item">
          <span class="status-label">REPLAYS:</span>
          <span id="replayCount" class="status-value">0</span>
        </div>
        <div class="status-item">
          <span class="status-label">RECURSION:</span>
          <span id="recursionStatus" class="status-value">${OMNI_SINGULARITY_CONFIG.REPLAY_RECURSIVE ? 'ON' : 'OFF'}</span>
        </div>
      </div>
      <div class="terminal-output" id="terminalOutput">
        <!-- Terminal lines will be added here -->
      </div>
      <div class="terminal-input">
        <span class="input-prompt">REPLAY> </span>
        <input type="text" id="terminalCommand" placeholder="Enter replay command..." />
        <button id="executeCommand" class="execute-btn">EXECUTE</button>
      </div>
    `;
    
    this.container.appendChild(terminalContainer);
    this.terminalOutput = document.getElementById('terminalOutput');
    this.setupControlHandlers();
  }
  
  setupControlHandlers() {
    // Auto-scroll toggle
    document.getElementById('toggleAutoScroll').addEventListener('click', () => {
      this.autoScrollEnabled = !this.autoScrollEnabled;
      const btn = document.getElementById('toggleAutoScroll');
      btn.classList.toggle('active', this.autoScrollEnabled);
      btn.textContent = this.autoScrollEnabled ? 'AUTO-SCROLL' : 'MANUAL';
    });
    
    // Clear terminal
    document.getElementById('clearTerminal').addEventListener('click', () => {
      this.clearTerminal();
    });
    
    // Force replay
    document.getElementById('forceReplay').addEventListener('click', () => {
      this.forceReplay();
    });
    
    // Command input
    const commandInput = document.getElementById('terminalCommand');
    commandInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.executeCommand(commandInput.value);
        commandInput.value = '';
      }
    });
    
    document.getElementById('executeCommand').addEventListener('click', () => {
      const commandInput = document.getElementById('terminalCommand');
      this.executeCommand(commandInput.value);
      commandInput.value = '';
    });
  }
  
  setupEventListeners() {
    // Listen for Omni-Singularity events
    document.addEventListener('omniNodeActivation', (e) => {
      this.handleNodeActivation(e.detail);
    });
    
    document.addEventListener('vaultBroadcastPulse', (e) => {
      this.handleVaultBroadcastPulse(e.detail);
    });
    
    document.addEventListener('relicMutation', (e) => {
      this.handleRelicMutation(e.detail);
    });
    
    document.addEventListener('chaosKeyGlyphOverride', (e) => {
      this.handleGlyphOverride(e.detail);
    });
  }
  
  addTerminalLine(text, type = 'normal', metadata = null) {
    const timestamp = new Date().toISOString().substr(11, 12);
    const line = {
      id: 'line_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      timestamp: timestamp,
      text: text,
      type: type,
      metadata: metadata
    };
    
    this.terminalLines.push(line);
    
    // Limit terminal history
    if (this.terminalLines.length > this.maxLines) {
      this.terminalLines = this.terminalLines.slice(-this.maxLines);
    }
    
    this.renderTerminalLine(line);
    this.updateScrollPosition();
  }
  
  renderTerminalLine(line) {
    const lineElement = document.createElement('div');
    lineElement.className = `terminal-line ${line.type}`;
    lineElement.id = line.id;
    
    const icon = this.getTypeIcon(line.type);
    lineElement.innerHTML = `
      <span class="line-timestamp">[${line.timestamp}]</span>
      <span class="line-icon">${icon}</span>
      <span class="line-content">${line.text}</span>
    `;
    
    this.terminalOutput.appendChild(lineElement);
    
    // Add fade-in animation
    setTimeout(() => {
      lineElement.classList.add('visible');
    }, 10);
  }
  
  getTypeIcon(type) {
    const icons = {
      'system': '⚙️',
      'success': '✅',
      'error': '❌',
      'warning': '⚠️',
      'info': 'ℹ️',
      'replay': '🔄',
      'broadcast': '📡',
      'mutation': '🧬',
      'glyph': '🔮',
      'override': '⚡',
      'normal': '▶'
    };
    return icons[type] || icons['normal'];
  }
  
  updateScrollPosition() {
    if (this.autoScrollEnabled) {
      this.terminalOutput.scrollTop = this.terminalOutput.scrollHeight;
    }
  }
  
  clearTerminal() {
    this.terminalLines = [];
    this.terminalOutput.innerHTML = '';
    this.addTerminalLine('🧹 Terminal cleared', 'system');
  }
  
  executeCommand(command) {
    if (!command.trim()) return;
    
    this.addTerminalLine(`REPLAY> ${command}`, 'normal');
    
    const cmd = command.toLowerCase().trim();
    
    switch (cmd) {
      case 'status':
        this.showStatus();
        break;
      case 'replays':
        this.showReplays();
        break;
      case 'clear':
        this.clearTerminal();
        break;
      case 'force':
        this.forceReplay();
        break;
      case 'test':
        this.testReplay();
        break;
      case 'help':
        this.showHelp();
        break;
      default:
        this.addTerminalLine(`Unknown command: ${command}`, 'error');
        this.addTerminalLine('Type "help" for available commands', 'info');
    }
  }
  
  showStatus() {
    const nextReplayTime = this.rateLimiter.getNextReplayTime();
    this.addTerminalLine('📊 REPLAY TERMINAL STATUS:', 'info');
    this.addTerminalLine(`   • Rate Limit: ${nextReplayTime > 0 ? `${Math.ceil(nextReplayTime/1000)}s remaining` : 'Ready'}`, 'info');
    this.addTerminalLine(`   • Queue Size: ${this.replayQueue.length}`, 'info');
    this.addTerminalLine(`   • Total Replays: ${this.rateLimiter.replayCount}`, 'info');
    this.addTerminalLine(`   • Recursion: ${OMNI_SINGULARITY_CONFIG.REPLAY_RECURSIVE ? 'Enabled' : 'Disabled'}`, 'info');
    this.addTerminalLine(`   • Auto-Scroll: ${this.autoScrollEnabled ? 'Enabled' : 'Disabled'}`, 'info');
  }
  
  showReplays() {
    const storedReplays = this.storage.getStoredReplays();
    this.addTerminalLine(`📋 STORED REPLAYS (${storedReplays.length}):`, 'info');
    
    if (storedReplays.length === 0) {
      this.addTerminalLine('   • No replays stored', 'info');
    } else {
      storedReplays.slice(-10).forEach(replay => {
        const timeAgo = Math.floor((Date.now() - replay.timestamp) / 1000);
        this.addTerminalLine(`   • ${replay.type} - ${timeAgo}s ago`, 'info');
      });
    }
  }
  
  showHelp() {
    this.addTerminalLine('🆘 AVAILABLE COMMANDS:', 'info');
    this.addTerminalLine('   • status  - Show terminal status', 'info');
    this.addTerminalLine('   • replays - List stored replays', 'info');
    this.addTerminalLine('   • clear   - Clear terminal', 'info');
    this.addTerminalLine('   • force   - Force immediate replay', 'info');
    this.addTerminalLine('   • test    - Test replay system', 'info');
    this.addTerminalLine('   • help    - Show this help', 'info');
  }
  
  testReplay() {
    this.addTerminalLine('🧪 Testing replay system...', 'info');
    this.queueReplayEvent(REPLAY_EVENT_TYPES.VAULT_BROADCAST, {
      test: true,
      source: 'manual_test',
      timestamp: Date.now()
    });
  }
  
  forceReplay() {
    if (OMNI_SINGULARITY_CONFIG.CHAOSKEY_GLYPH_OVERRIDE_ENABLED) {
      this.addTerminalLine('⚡ FORCE REPLAY INITIATED - CHAOSKEY GLYPH OVERRIDE', 'override');
      this.processLiveReplayOverride({
        forced: true,
        override: 'chaoskey_glyph',
        timestamp: Date.now()
      });
    } else {
      this.addTerminalLine('❌ Force replay disabled - ChaosKey Glyph Override not enabled', 'error');
    }
  }
  
  queueReplayEvent(eventType, data) {
    const event = {
      id: 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      type: eventType,
      data: data,
      timestamp: Date.now(),
      queued: Date.now()
    };
    
    this.replayQueue.push(event);
    this.updateQueueStatus();
    
    omniLog(`Replay event queued: ${eventType}`, 'info', event);
    return event.id;
  }
  
  startReplayProcessing() {
    const processQueue = () => {
      if (this.replayQueue.length > 0 && !this.processingReplay) {
        this.processNextReplay();
      }
      
      if (this.isInitialized) {
        setTimeout(processQueue, 100); // Check every 100ms
      }
    };
    
    processQueue();
  }
  
  processNextReplay() {
    if (this.replayQueue.length === 0 || this.processingReplay) return;
    
    const event = this.replayQueue.shift();
    this.processingReplay = true;
    
    if (this.rateLimiter.canReplay()) {
      this.executeReplay(event);
    } else {
      // Requeue event if rate limited
      this.replayQueue.unshift(event);
      this.addTerminalLine(`⏳ Replay rate limited - queued event ${event.type}`, 'warning');
    }
    
    this.processingReplay = false;
    this.updateQueueStatus();
    this.updateRateLimitStatus();
  }
  
  executeReplay(event) {
    this.addTerminalLine(`🔄 Executing replay: ${event.type}`, 'replay');
    
    // Store the replay event
    const storedId = this.storage.storeReplayEvent(event.type, event.data);
    
    // Process based on event type
    switch (event.type) {
      case REPLAY_EVENT_TYPES.VAULT_BROADCAST:
        this.processVaultBroadcastReplay(event);
        break;
      case REPLAY_EVENT_TYPES.RELIC_MUTATION:
        this.processRelicMutationReplay(event);
        break;
      case REPLAY_EVENT_TYPES.GLYPH_ACTIVATION:
        this.processGlyphActivationReplay(event);
        break;
      case REPLAY_EVENT_TYPES.LIVE_REPLAY_OVERRIDE:
        this.processLiveReplayOverride(event.data);
        break;
      default:
        this.addTerminalLine(`⚠️ Unknown replay type: ${event.type}`, 'warning');
    }
    
    this.updateReplayCount();
    omniLog(`Replay executed: ${event.type}`, 'success', { eventId: event.id, storedId });
  }
  
  processVaultBroadcastReplay(event) {
    this.addTerminalLine(`📡 Vault Broadcast Pulse processed`, 'broadcast');
    
    // Trigger Spectral Decode HUD update
    document.dispatchEvent(new CustomEvent('spectralDecodeUpdate', {
      detail: { source: 'vault_broadcast', data: event.data }
    }));
  }
  
  processRelicMutationReplay(event) {
    this.addTerminalLine(`🧬 Relic Mutation archived (PR #24 integration)`, 'mutation');
    
    // Archive mutation data
    const mutationArchive = {
      ...event.data,
      archivedAt: Date.now(),
      pr24Integration: true
    };
    
    this.storage.storeReplayEvent(REPLAY_EVENT_TYPES.RELIC_MUTATION, mutationArchive);
  }
  
  processGlyphActivationReplay(event) {
    this.addTerminalLine(`🔮 Glyph activation recorded`, 'glyph');
  }
  
  processLiveReplayOverride(data) {
    this.addTerminalLine(`⚡ LIVE REPLAY OVERRIDE EXECUTED`, 'override');
    this.addTerminalLine(`   └─ Immediate push initiated`, 'override');
    
    // Bypass rate limiting for override
    const overrideEvent = {
      type: REPLAY_EVENT_TYPES.LIVE_REPLAY_OVERRIDE,
      data: data,
      override: true,
      timestamp: Date.now()
    };
    
    this.storage.storeReplayEvent(REPLAY_EVENT_TYPES.LIVE_REPLAY_OVERRIDE, data);
    
    // Trigger immediate effects
    setTimeout(() => {
      this.addTerminalLine(`✅ Live replay push completed`, 'success');
    }, OMNI_SINGULARITY_CONFIG.LIVE_REPLAY_PUSH_TIMEOUT);
  }
  
  handleNodeActivation(detail) {
    this.addTerminalLine(`🌀 Relay node ${detail.nodeId} activated (Energy: ${detail.energy}%)`, 'info');
    this.queueReplayEvent(REPLAY_EVENT_TYPES.GLYPH_ACTIVATION, detail);
  }
  
  handleVaultBroadcastPulse(detail) {
    this.addTerminalLine(`📡 Vault Broadcast Pulse received`, 'broadcast');
    this.queueReplayEvent(REPLAY_EVENT_TYPES.VAULT_BROADCAST, detail);
  }
  
  handleRelicMutation(detail) {
    this.addTerminalLine(`🧬 Relic Mutation detected - PR #24 linkage active`, 'mutation');
    this.queueReplayEvent(REPLAY_EVENT_TYPES.RELIC_MUTATION, detail);
  }
  
  handleGlyphOverride(detail) {
    this.addTerminalLine(`⚡ ChaosKey333 Glyph Override triggered!`, 'override');
    this.processLiveReplayOverride(detail);
  }
  
  updateQueueStatus() {
    const queueStatus = document.getElementById('queueStatus');
    if (queueStatus) {
      queueStatus.textContent = this.replayQueue.length;
    }
  }
  
  updateRateLimitStatus() {
    const rateLimitStatus = document.getElementById('rateLimitStatus');
    if (rateLimitStatus) {
      const nextReplayTime = this.rateLimiter.getNextReplayTime();
      rateLimitStatus.textContent = nextReplayTime > 0 ? `${Math.ceil(nextReplayTime/1000)}s` : 'READY';
    }
  }
  
  updateReplayCount() {
    const replayCount = document.getElementById('replayCount');
    if (replayCount) {
      replayCount.textContent = this.rateLimiter.replayCount;
    }
  }
  
  loadStoredReplays() {
    const storedReplays = this.storage.getStoredReplays();
    this.addTerminalLine(`💾 Loaded ${storedReplays.length} stored replays`, 'info');
  }
  
  destroy() {
    this.isInitialized = false;
    
    if (this.container) {
      this.container.innerHTML = '';
    }
    
    omniLog('Cosmic Replay Terminal v2.0 destroyed', 'info');
  }
}

// CSS Styles for the terminal
export const COSMIC_TERMINAL_STYLES = `
  .cosmic-replay-terminal {
    background: linear-gradient(135deg, #001a1a 0%, #003333 50%, #001a1a 100%);
    border: 2px solid #00ffcc;
    border-radius: 15px;
    padding: 15px;
    margin: 20px 0;
    font-family: 'Courier New', monospace;
    position: relative;
    overflow: hidden;
  }
  
  .terminal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    border-bottom: 1px solid #00ffcc;
    padding-bottom: 10px;
  }
  
  .terminal-title {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .terminal-icon {
    font-size: 1.5rem;
    animation: spin 4s linear infinite;
  }
  
  .terminal-name {
    color: #00ffcc;
    font-weight: bold;
    font-size: 1rem;
    text-shadow: 0 0 10px #00ffcc;
  }
  
  .ascension-badge {
    background: linear-gradient(45deg, #ff00cc, #ffcc00);
    color: #000;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 0.7rem;
    font-weight: bold;
    text-shadow: none;
  }
  
  .terminal-controls {
    display: flex;
    gap: 5px;
  }
  
  .control-btn {
    background: #003333;
    color: #00ffcc;
    border: 1px solid #00ffcc;
    padding: 5px 10px;
    border-radius: 5px;
    font-size: 0.7rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .control-btn:hover {
    background: #00ffcc;
    color: #003333;
  }
  
  .control-btn.active {
    background: #00ffcc;
    color: #003333;
  }
  
  .control-btn.danger {
    border-color: #ff3333;
    color: #ff3333;
  }
  
  .control-btn.danger:hover {
    background: #ff3333;
    color: #fff;
  }
  
  .terminal-status {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 10px;
    margin-bottom: 15px;
    padding: 10px;
    background: rgba(0, 255, 204, 0.05);
    border-radius: 5px;
  }
  
  .status-item {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
  }
  
  .status-label {
    color: #888;
  }
  
  .status-value {
    color: #00ffcc;
    font-weight: bold;
  }
  
  .terminal-output {
    background: #000;
    border: 1px solid #333;
    border-radius: 5px;
    padding: 10px;
    height: 300px;
    overflow-y: auto;
    margin-bottom: 15px;
    font-size: 0.85rem;
    line-height: 1.4;
  }
  
  .terminal-line {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 2px;
    opacity: 0;
    transform: translateX(-10px);
    transition: all 0.3s ease;
  }
  
  .terminal-line.visible {
    opacity: 1;
    transform: translateX(0);
  }
  
  .line-timestamp {
    color: #666;
    font-size: 0.7rem;
    min-width: 80px;
  }
  
  .line-icon {
    min-width: 20px;
    text-align: center;
  }
  
  .line-content {
    flex: 1;
  }
  
  .terminal-line.system .line-content { color: #ffcc00; }
  .terminal-line.success .line-content { color: #00ff00; }
  .terminal-line.error .line-content { color: #ff3333; }
  .terminal-line.warning .line-content { color: #ffaa00; }
  .terminal-line.info .line-content { color: #00ccff; }
  .terminal-line.replay .line-content { color: #cc99ff; }
  .terminal-line.broadcast .line-content { color: #ff9900; }
  .terminal-line.mutation .line-content { color: #99ff99; }
  .terminal-line.glyph .line-content { color: #ff66cc; }
  .terminal-line.override .line-content { color: #ff0000; font-weight: bold; }
  .terminal-line.normal .line-content { color: #00ffcc; }
  
  .terminal-input {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #000;
    border: 1px solid #333;
    border-radius: 5px;
    padding: 8px;
  }
  
  .input-prompt {
    color: #00ffcc;
    font-weight: bold;
    min-width: 60px;
  }
  
  #terminalCommand {
    flex: 1;
    background: transparent;
    border: none;
    color: #00ffcc;
    font-family: 'Courier New', monospace;
    font-size: 0.9rem;
    outline: none;
  }
  
  #terminalCommand::placeholder {
    color: #666;
  }
  
  .execute-btn {
    background: #003333;
    color: #00ffcc;
    border: 1px solid #00ffcc;
    padding: 5px 15px;
    border-radius: 3px;
    cursor: pointer;
    font-size: 0.8rem;
    transition: all 0.3s ease;
  }
  
  .execute-btn:hover {
    background: #00ffcc;
    color: #003333;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;