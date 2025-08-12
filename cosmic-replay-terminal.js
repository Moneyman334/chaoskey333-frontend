/**
 * 🌌 Cosmic Replay Terminal - PR #10 Ascension Edition
 * Permanent real-time replay buffer for Vault Broadcast Pulse events
 * Auto-archives all events without manual activation
 * Enables time-travel replay for decoders and keyholders
 */

class CosmicReplayTerminal {
  constructor(options = {}) {
    this.isActive = true; // Permanent feature - always active
    this.replayBuffer = [];
    this.maxBufferSize = options.maxBufferSize || 10000; // Store up to 10k events
    this.currentReplayIndex = -1;
    this.isReplaying = false;
    
    // Event types to capture
    this.captureEvents = [
      'vault_broadcast_pulse',
      'wallet_connection',
      'relic_mint_attempt',
      'relic_mint_success',
      'stripe_payment',
      'contract_interaction',
      'omni_singularity_event'
    ];
    
    this.callbacks = {
      onEventCaptured: options.onEventCaptured || (() => {}),
      onReplayStart: options.onReplayStart || (() => {}),
      onReplayEnd: options.onReplayEnd || (() => {})
    };
    
    console.log('🌌 Cosmic Replay Terminal initialized - PR #10 Ascension Edition');
    this.initializeTerminal();
  }

  /**
   * Initialize the permanent replay terminal
   */
  initializeTerminal() {
    // Auto-capture all vault events
    this.setupEventCapture();
    
    // Create terminal UI
    this.createTerminalUI();
    
    // Start real-time monitoring
    this.startRealtimeMonitoring();
    
    console.log('✨ Permanent replay buffer activated - all Vault Broadcast Pulses will be archived');
  }

  /**
   * Setup automatic event capture for all vault operations
   */
  setupEventCapture() {
    // Capture wallet events
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        this.captureEvent('wallet_connection', {
          type: 'account_change',
          accounts: accounts,
          timestamp: Date.now(),
          metadata: { connection_type: 'ethereum' }
        });
      });
    }

    // Override console.log to capture important events
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      const message = args.join(' ');
      
      // Detect vault broadcast pulses and other important events
      if (message.includes('Connected') || 
          message.includes('Stripe') || 
          message.includes('Mint') ||
          message.includes('Bass') ||
          message.includes('Vault') ||
          message.includes('Relic')) {
        
        this.captureEvent('vault_broadcast_pulse', {
          type: 'console_event',
          message: message,
          timestamp: Date.now(),
          args: args
        });
      }
      
      return originalConsoleLog.apply(console, args);
    };
  }

  /**
   * Capture and archive events automatically
   */
  captureEvent(eventType, eventData) {
    const event = {
      id: this.generateEventId(),
      type: eventType,
      data: eventData,
      timestamp: Date.now(),
      replayable: true,
      archived: true // Auto-archive without manual activation
    };

    // Add to buffer (maintain size limit)
    this.replayBuffer.unshift(event);
    if (this.replayBuffer.length > this.maxBufferSize) {
      this.replayBuffer.pop();
    }

    // Update terminal display
    this.updateTerminalDisplay();
    
    // Notify callback
    this.callbacks.onEventCaptured(event);
    
    console.log(`🌀 Event captured and archived: ${eventType}`, event);
  }

  /**
   * Create the permanent terminal UI
   */
  createTerminalUI() {
    // Check if terminal already exists
    if (document.getElementById('cosmic-replay-terminal')) {
      return;
    }

    const terminalHTML = `
      <div id="cosmic-replay-terminal" class="cosmic-terminal-container">
        <div class="cosmic-terminal-header">
          <span class="terminal-title">🌌 Cosmic Replay Terminal - Ascension Edition</span>
          <div class="terminal-controls">
            <button id="replay-toggle" class="terminal-btn">⏮️ Time Travel</button>
            <button id="clear-buffer" class="terminal-btn">🗑️ Clear Buffer</button>
            <button id="export-logs" class="terminal-btn">📤 Export Archive</button>
          </div>
        </div>
        <div class="cosmic-terminal-body">
          <div id="replay-timeline" class="replay-timeline">
            <div class="timeline-controls">
              <button id="replay-prev" class="timeline-btn">⏪</button>
              <span id="replay-position">Live</span>
              <button id="replay-next" class="timeline-btn">⏩</button>
              <button id="replay-live" class="timeline-btn live-btn">🔴 LIVE</button>
            </div>
          </div>
          <div id="terminal-output" class="terminal-output">
            <div class="boot-message">
              ✨ Cosmic Replay Terminal ACTIVE ✨<br/>
              📡 Auto-archiving all Vault Broadcast Pulse events...<br/>
              🔮 Decoders and keyholders can jump back in time instantly<br/>
              🌀 Omni-Singularity architecture is alive and self-aware<br/>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add to the page
    document.body.insertAdjacentHTML('beforeend', terminalHTML);
    
    // Add CSS styles
    this.addTerminalStyles();
    
    // Setup event listeners
    this.setupTerminalControls();
  }

  /**
   * Add CSS styles for the terminal
   */
  addTerminalStyles() {
    const styles = `
      <style id="cosmic-terminal-styles">
        .cosmic-terminal-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 450px;
          height: 300px;
          background: rgba(0, 0, 0, 0.95);
          border: 2px solid #00ff88;
          border-radius: 8px;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
        }

        .cosmic-terminal-header {
          background: linear-gradient(90deg, #001122, #003344);
          color: #00ff88;
          padding: 8px 12px;
          border-bottom: 1px solid #00ff88;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .terminal-title {
          font-weight: bold;
          font-size: 11px;
        }

        .terminal-controls {
          display: flex;
          gap: 5px;
        }

        .terminal-btn {
          background: #003322;
          color: #00ff88;
          border: 1px solid #00ff88;
          padding: 2px 6px;
          font-size: 10px;
          cursor: pointer;
          border-radius: 3px;
        }

        .terminal-btn:hover {
          background: #00ff88;
          color: #000;
        }

        .cosmic-terminal-body {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .replay-timeline {
          background: #001122;
          border-bottom: 1px solid #00ff88;
          padding: 5px 8px;
        }

        .timeline-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .timeline-btn {
          background: #002244;
          color: #00ff88;
          border: 1px solid #00ff88;
          padding: 2px 8px;
          font-size: 10px;
          cursor: pointer;
          border-radius: 2px;
        }

        .timeline-btn:hover {
          background: #00ff88;
          color: #000;
        }

        .live-btn {
          background: #220000;
          color: #ff3333;
          border-color: #ff3333;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        .terminal-output {
          flex: 1;
          background: #000011;
          color: #00ff88;
          padding: 8px;
          overflow-y: auto;
          font-size: 11px;
          line-height: 1.3;
        }

        .boot-message {
          color: #88ff00;
          text-align: center;
          margin-bottom: 10px;
          border-bottom: 1px solid #333;
          padding-bottom: 8px;
        }

        .event-entry {
          margin: 2px 0;
          padding: 3px;
          border-left: 2px solid #00ff88;
          padding-left: 6px;
        }

        .event-timestamp {
          color: #666;
          font-size: 10px;
        }

        .event-type {
          color: #ffaa00;
          font-weight: bold;
        }

        .event-data {
          color: #00ff88;
          font-size: 10px;
          margin-left: 15px;
        }

        .replay-mode {
          background: #440044 !important;
          border-color: #ff00ff !important;
        }

        .replay-mode .terminal-title {
          color: #ff00ff !important;
        }
      </style>
    `;

    document.head.insertAdjacentHTML('beforeend', styles);
  }

  /**
   * Setup terminal control event listeners
   */
  setupTerminalControls() {
    // Replay toggle
    document.getElementById('replay-toggle').addEventListener('click', () => {
      this.toggleReplayMode();
    });

    // Clear buffer
    document.getElementById('clear-buffer').addEventListener('click', () => {
      this.clearReplayBuffer();
    });

    // Export logs
    document.getElementById('export-logs').addEventListener('click', () => {
      this.exportReplayArchive();
    });

    // Timeline navigation
    document.getElementById('replay-prev').addEventListener('click', () => {
      this.replayPrevious();
    });

    document.getElementById('replay-next').addEventListener('click', () => {
      this.replayNext();
    });

    document.getElementById('replay-live').addEventListener('click', () => {
      this.returnToLive();
    });
  }

  /**
   * Start real-time monitoring for auto-archiving
   */
  startRealtimeMonitoring() {
    // Monitor DOM changes for vault events
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check for status updates that indicate vault events
              const textContent = node.textContent || '';
              if (textContent.includes('Connected') || 
                  textContent.includes('Minting') ||
                  textContent.includes('Success') ||
                  textContent.includes('Failed')) {
                
                this.captureEvent('vault_broadcast_pulse', {
                  type: 'dom_update',
                  content: textContent,
                  timestamp: Date.now(),
                  element: node.tagName
                });
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Monitor localStorage changes for vault state
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = (key, value) => {
      this.captureEvent('vault_broadcast_pulse', {
        type: 'storage_update',
        key: key,
        value: value,
        timestamp: Date.now()
      });
      return originalSetItem.call(localStorage, key, value);
    };
  }

  /**
   * Update terminal display with latest events
   */
  updateTerminalDisplay() {
    const output = document.getElementById('terminal-output');
    if (!output) return;

    // Clear existing content except boot message
    const bootMessage = output.querySelector('.boot-message');
    output.innerHTML = '';
    if (bootMessage) {
      output.appendChild(bootMessage);
    }

    // Display recent events (last 20)
    const recentEvents = this.replayBuffer.slice(0, 20);
    recentEvents.forEach((event, index) => {
      const eventDiv = document.createElement('div');
      eventDiv.className = 'event-entry';
      eventDiv.innerHTML = `
        <span class="event-timestamp">[${new Date(event.timestamp).toLocaleTimeString()}]</span>
        <span class="event-type">${event.type}</span>
        <div class="event-data">${JSON.stringify(event.data, null, 2)}</div>
      `;
      output.appendChild(eventDiv);
    });

    // Auto-scroll to bottom
    output.scrollTop = output.scrollHeight;
  }

  /**
   * Toggle replay mode for time travel
   */
  toggleReplayMode() {
    this.isReplaying = !this.isReplaying;
    const terminal = document.getElementById('cosmic-replay-terminal');
    const toggleBtn = document.getElementById('replay-toggle');
    
    if (this.isReplaying) {
      terminal.classList.add('replay-mode');
      toggleBtn.textContent = '⏸️ Exit Replay';
      this.currentReplayIndex = 0;
      this.callbacks.onReplayStart();
      console.log('🔮 Entering time travel mode - you can now replay past events');
    } else {
      terminal.classList.remove('replay-mode');
      toggleBtn.textContent = '⏮️ Time Travel';
      this.currentReplayIndex = -1;
      this.callbacks.onReplayEnd();
      console.log('🌟 Returning to live mode');
    }
  }

  /**
   * Navigate to previous event in replay
   */
  replayPrevious() {
    if (!this.isReplaying) return;
    
    if (this.currentReplayIndex < this.replayBuffer.length - 1) {
      this.currentReplayIndex++;
      this.displayReplayEvent();
    }
  }

  /**
   * Navigate to next event in replay
   */
  replayNext() {
    if (!this.isReplaying) return;
    
    if (this.currentReplayIndex > 0) {
      this.currentReplayIndex--;
      this.displayReplayEvent();
    }
  }

  /**
   * Return to live mode
   */
  returnToLive() {
    if (this.isReplaying) {
      this.toggleReplayMode();
    }
  }

  /**
   * Display specific replay event
   */
  displayReplayEvent() {
    if (this.currentReplayIndex >= 0 && this.currentReplayIndex < this.replayBuffer.length) {
      const event = this.replayBuffer[this.currentReplayIndex];
      document.getElementById('replay-position').textContent = 
        `Event ${this.replayBuffer.length - this.currentReplayIndex}/${this.replayBuffer.length}`;
      
      // Highlight the current event in the display
      this.updateTerminalDisplay();
      const entries = document.querySelectorAll('.event-entry');
      if (entries[this.currentReplayIndex]) {
        entries[this.currentReplayIndex].style.background = 'rgba(255, 0, 255, 0.3)';
      }
    }
  }

  /**
   * Clear replay buffer
   */
  clearReplayBuffer() {
    this.replayBuffer = [];
    this.currentReplayIndex = -1;
    this.updateTerminalDisplay();
    console.log('🗑️ Replay buffer cleared');
  }

  /**
   * Export replay archive for future integrations
   */
  exportReplayArchive() {
    const archive = {
      timestamp: Date.now(),
      version: 'PR#10-Ascension-Edition',
      totalEvents: this.replayBuffer.length,
      events: this.replayBuffer,
      metadata: {
        export_type: 'cosmic_replay_archive',
        compatible_with: ['auto_highlights', 'relic_mutation_triggers', 'lore_exports'],
        pr_evolution_chain: ['PR#23', 'PR#24']
      }
    };

    const blob = new Blob([JSON.stringify(archive, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cosmic-replay-archive-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    console.log('📤 Replay archive exported - ready for future PR integrations');
  }

  /**
   * Generate unique event ID
   */
  generateEventId() {
    return `cosmic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get replay buffer status
   */
  getStatus() {
    return {
      active: this.isActive,
      bufferSize: this.replayBuffer.length,
      maxBufferSize: this.maxBufferSize,
      isReplaying: this.isReplaying,
      currentReplayIndex: this.currentReplayIndex
    };
  }
}

// Auto-initialize when script loads
if (typeof window !== 'undefined') {
  // Initialize the permanent Cosmic Replay Terminal
  window.cosmicReplayTerminal = new CosmicReplayTerminal({
    maxBufferSize: 10000,
    onEventCaptured: (event) => {
      // Future hook for auto-highlights and relic mutations
      console.log('🌌 Vault Broadcast Pulse archived:', event.type);
    },
    onReplayStart: () => {
      console.log('🔮 Time travel initiated - decoder access granted');
    },
    onReplayEnd: () => {
      console.log('🌟 Returned to live Omni-Singularity stream');
    }
  });

  console.log('✨ Cosmic Replay Terminal permanently activated - PR #10 Ascension Edition');
}