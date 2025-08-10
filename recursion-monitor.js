// 🔄 Recursion Monitor Core Component
// Part of PR #42 - Tracks evolution cycles and broadcast pulses
// Connects to Vault Broadcast Pulse via SSE stream

class RecursionMonitor {
  constructor(options = {}) {
    this.isActive = false;
    this.pulseCount = 0;
    this.evolutionCycles = 0;
    this.lastPulseTime = null;
    this.eventsLog = [];
    this.sseConnection = null;
    this.maxPulses = options.maxPulses || 1000;
    this.pulseInterval = options.pulseInterval || 5000; // 5 seconds default
    this.adminKillEnabled = true;
    
    this.initializeUI();
    this.bindEventListeners();
    
    console.log('🔄 Recursion Monitor initialized');
  }

  // Initialize the monitor UI
  initializeUI() {
    const existingMonitor = document.getElementById('recursionMonitor');
    if (existingMonitor) {
      existingMonitor.remove();
    }

    const monitorHTML = `
      <div id="recursionMonitor" class="recursion-monitor">
        <div class="monitor-header">
          <h3>🔄 Recursion Monitor</h3>
          <div class="monitor-status">
            <span id="monitorStatus" class="status-inactive">INACTIVE</span>
            <button id="toggleMonitor" class="monitor-btn">START</button>
          </div>
        </div>
        <div class="monitor-metrics">
          <div class="metric">
            <label>Pulse Count:</label>
            <span id="pulseCount">0</span>
          </div>
          <div class="metric">
            <label>Evolution Cycles:</label>
            <span id="evolutionCycles">0</span>
          </div>
          <div class="metric">
            <label>Last Pulse:</label>
            <span id="lastPulse">Never</span>
          </div>
          <div class="metric">
            <label>SSE Stream:</label>
            <span id="sseStatus" class="status-disconnected">DISCONNECTED</span>
          </div>
        </div>
        <div class="monitor-controls">
          <button id="resetMonitor" class="monitor-btn secondary">RESET</button>
          <button id="triggerPulse" class="monitor-btn">MANUAL PULSE</button>
        </div>
        <div class="monitor-log">
          <h4>Event Log</h4>
          <div id="eventLog" class="event-log"></div>
        </div>
      </div>
    `;

    // Insert monitor after vault container
    const vaultContainer = document.querySelector('.resurrection-container');
    if (vaultContainer) {
      vaultContainer.insertAdjacentHTML('afterend', monitorHTML);
      this.addMonitorStyles();
    }
  }

  // Add CSS styles for the monitor
  addMonitorStyles() {
    const styles = `
      <style id="recursionMonitorStyles">
        .recursion-monitor {
          background: linear-gradient(135deg, #1a1a2e, #16213e);
          border: 2px solid #4ade80;
          border-radius: 10px;
          padding: 20px;
          margin: 20px auto;
          max-width: 800px;
          color: #fff;
          font-family: 'Orbitron', monospace;
          box-shadow: 0 0 20px rgba(74, 222, 128, 0.3);
        }
        
        .monitor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 1px solid #4ade80;
          padding-bottom: 10px;
        }
        
        .monitor-header h3 {
          margin: 0;
          color: #4ade80;
          text-shadow: 0 0 10px rgba(74, 222, 128, 0.5);
        }
        
        .monitor-status {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .status-active {
          color: #4ade80;
          font-weight: bold;
          animation: pulse 2s infinite;
        }
        
        .status-inactive {
          color: #ef4444;
        }
        
        .status-connected {
          color: #4ade80;
        }
        
        .status-disconnected {
          color: #f59e0b;
        }
        
        .monitor-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .metric {
          background: rgba(74, 222, 128, 0.1);
          padding: 10px;
          border-radius: 5px;
          border: 1px solid rgba(74, 222, 128, 0.3);
        }
        
        .metric label {
          display: block;
          font-size: 0.9em;
          color: #94a3b8;
          margin-bottom: 5px;
        }
        
        .metric span {
          font-size: 1.2em;
          font-weight: bold;
          color: #4ade80;
        }
        
        .monitor-controls {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        
        .monitor-btn {
          background: linear-gradient(45deg, #4ade80, #22c55e);
          border: none;
          color: white;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-family: 'Orbitron', monospace;
          font-weight: bold;
          transition: all 0.3s ease;
        }
        
        .monitor-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(74, 222, 128, 0.4);
        }
        
        .monitor-btn.secondary {
          background: linear-gradient(45deg, #6b7280, #4b5563);
        }
        
        .monitor-log {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 5px;
          padding: 15px;
          max-height: 300px;
          overflow-y: auto;
        }
        
        .monitor-log h4 {
          margin: 0 0 10px 0;
          color: #4ade80;
          font-size: 1em;
        }
        
        .event-log {
          font-family: 'Courier New', monospace;
          font-size: 0.85em;
          line-height: 1.4;
        }
        
        .log-entry {
          margin-bottom: 5px;
          padding: 5px;
          border-left: 3px solid #4ade80;
          background: rgba(74, 222, 128, 0.05);
        }
        
        .log-timestamp {
          color: #94a3b8;
          font-size: 0.8em;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      </style>
    `;

    document.head.insertAdjacentHTML('beforeend', styles);
  }

  // Bind event listeners
  bindEventListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.id === 'toggleMonitor') {
        this.toggle();
      } else if (e.target.id === 'resetMonitor') {
        this.reset();
      } else if (e.target.id === 'triggerPulse') {
        this.triggerManualPulse();
      }
    });

    // Listen for wallet connection events
    window.addEventListener('walletConnected', (e) => {
      this.logEvent('WALLET_CONNECTED', `Wallet ${e.detail.address} connected`);
    });

    // Listen for payment events
    window.addEventListener('paymentCompleted', (e) => {
      this.logEvent('PAYMENT_COMPLETED', `Payment completed: ${e.detail.sessionId}`);
      this.triggerEvolutionCycle();
    });
  }

  // Start/Stop the monitor
  toggle() {
    if (this.isActive) {
      this.stop();
    } else {
      this.start();
    }
  }

  // Start monitoring
  start() {
    if (this.isActive) return;

    this.isActive = true;
    this.updateUI();
    this.connectSSE();
    this.startPulseLoop();
    
    this.logEvent('MONITOR_STARTED', 'Recursion monitor activated');
    console.log('🔄 Recursion Monitor started');
  }

  // Stop monitoring
  stop() {
    if (!this.isActive) return;

    this.isActive = false;
    this.disconnectSSE();
    this.updateUI();
    
    this.logEvent('MONITOR_STOPPED', 'Recursion monitor deactivated');
    console.log('🔄 Recursion Monitor stopped');
  }

  // Reset monitor state
  reset() {
    this.stop();
    this.pulseCount = 0;
    this.evolutionCycles = 0;
    this.lastPulseTime = null;
    this.eventsLog = [];
    this.updateUI();
    this.clearEventLog();
    
    console.log('🔄 Recursion Monitor reset');
  }

  // Connect to SSE stream
  connectSSE() {
    if (this.sseConnection) {
      this.sseConnection.close();
    }

    try {
      this.sseConnection = new EventSource('/api/pulse-stream');
      
      this.sseConnection.onopen = () => {
        this.updateSSEStatus('CONNECTED');
        this.logEvent('SSE_CONNECTED', 'Pulse stream connected');
      };

      this.sseConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handlePulseEvent(data);
        } catch (e) {
          console.warn('Invalid pulse data received:', event.data);
        }
      };

      this.sseConnection.onerror = () => {
        this.updateSSEStatus('ERROR');
        this.logEvent('SSE_ERROR', 'Pulse stream connection error');
        
        // Attempt reconnection after delay
        setTimeout(() => {
          if (this.isActive) {
            this.connectSSE();
          }
        }, 5000);
      };

    } catch (error) {
      console.error('Failed to connect SSE:', error);
      this.updateSSEStatus('FAILED');
    }
  }

  // Disconnect SSE stream
  disconnectSSE() {
    if (this.sseConnection) {
      this.sseConnection.close();
      this.sseConnection = null;
      this.updateSSEStatus('DISCONNECTED');
    }
  }

  // Start pulse loop
  startPulseLoop() {
    if (this.pulseLoop) {
      clearInterval(this.pulseLoop);
    }

    this.pulseLoop = setInterval(() => {
      if (this.isActive && this.pulseCount < this.maxPulses) {
        this.generatePulse();
      }
    }, this.pulseInterval);
  }

  // Generate a pulse
  generatePulse() {
    this.pulseCount++;
    this.lastPulseTime = new Date();
    
    const pulseData = {
      id: Date.now(),
      count: this.pulseCount,
      timestamp: this.lastPulseTime.toISOString(),
      type: 'AUTO_PULSE'
    };

    this.logEvent('PULSE_GENERATED', `Auto pulse #${this.pulseCount}`);
    this.updateUI();

    // Broadcast pulse to other components
    this.broadcastPulse(pulseData);

    // Check if evolution cycle should trigger
    if (this.pulseCount % 10 === 0) {
      this.triggerEvolutionCycle();
    }
  }

  // Trigger manual pulse
  triggerManualPulse() {
    if (!this.isActive) {
      alert('Monitor must be active to trigger manual pulse');
      return;
    }

    const pulseData = {
      id: Date.now(),
      count: ++this.pulseCount,
      timestamp: new Date().toISOString(),
      type: 'MANUAL_PULSE'
    };

    this.lastPulseTime = new Date();
    this.logEvent('MANUAL_PULSE', `Manual pulse triggered #${this.pulseCount}`);
    this.updateUI();
    this.broadcastPulse(pulseData);
  }

  // Trigger evolution cycle
  triggerEvolutionCycle() {
    this.evolutionCycles++;
    this.logEvent('EVOLUTION_CYCLE', `Evolution cycle #${this.evolutionCycles} initiated`);
    this.updateUI();

    // Dispatch evolution event
    window.dispatchEvent(new CustomEvent('evolutionCycle', {
      detail: {
        cycle: this.evolutionCycles,
        timestamp: new Date().toISOString()
      }
    }));
  }

  // Handle pulse events from SSE
  handlePulseEvent(data) {
    this.logEvent('SSE_PULSE', `Received: ${data.type || 'unknown'}`);
    
    // Update local state based on remote pulse
    if (data.sync) {
      this.pulseCount = data.pulseCount || this.pulseCount;
      this.evolutionCycles = data.evolutionCycles || this.evolutionCycles;
      this.updateUI();
    }
  }

  // Broadcast pulse to other components
  broadcastPulse(pulseData) {
    // Dispatch to window for other components
    window.dispatchEvent(new CustomEvent('vaultPulse', {
      detail: pulseData
    }));

    // Send to server for SSE broadcast
    fetch('/api/broadcast-pulse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pulseData)
    }).catch(err => {
      console.warn('Failed to broadcast pulse:', err);
    });
  }

  // Log event
  logEvent(type, message) {
    const event = {
      type,
      message,
      timestamp: new Date().toISOString(),
      pulseCount: this.pulseCount,
      evolutionCycles: this.evolutionCycles
    };

    this.eventsLog.unshift(event);
    
    // Keep only last 50 events
    if (this.eventsLog.length > 50) {
      this.eventsLog = this.eventsLog.slice(0, 50);
    }

    this.addLogEntry(event);
  }

  // Add log entry to UI
  addLogEntry(event) {
    const logContainer = document.getElementById('eventLog');
    if (!logContainer) return;

    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `
      <div class="log-timestamp">${new Date(event.timestamp).toLocaleTimeString()}</div>
      <div><strong>${event.type}:</strong> ${event.message}</div>
    `;

    logContainer.insertBefore(entry, logContainer.firstChild);

    // Keep only last 20 entries in UI
    while (logContainer.children.length > 20) {
      logContainer.removeChild(logContainer.lastChild);
    }
  }

  // Clear event log UI
  clearEventLog() {
    const logContainer = document.getElementById('eventLog');
    if (logContainer) {
      logContainer.innerHTML = '';
    }
  }

  // Update UI elements
  updateUI() {
    const statusEl = document.getElementById('monitorStatus');
    const toggleBtn = document.getElementById('toggleMonitor');
    const pulseCountEl = document.getElementById('pulseCount');
    const evolutionCyclesEl = document.getElementById('evolutionCycles');
    const lastPulseEl = document.getElementById('lastPulse');

    if (statusEl) {
      statusEl.textContent = this.isActive ? 'ACTIVE' : 'INACTIVE';
      statusEl.className = this.isActive ? 'status-active' : 'status-inactive';
    }

    if (toggleBtn) {
      toggleBtn.textContent = this.isActive ? 'STOP' : 'START';
    }

    if (pulseCountEl) {
      pulseCountEl.textContent = this.pulseCount;
    }

    if (evolutionCyclesEl) {
      evolutionCyclesEl.textContent = this.evolutionCycles;
    }

    if (lastPulseEl) {
      lastPulseEl.textContent = this.lastPulseTime 
        ? this.lastPulseTime.toLocaleTimeString()
        : 'Never';
    }
  }

  // Update SSE status
  updateSSEStatus(status) {
    const sseStatusEl = document.getElementById('sseStatus');
    if (sseStatusEl) {
      sseStatusEl.textContent = status;
      sseStatusEl.className = status === 'CONNECTED' ? 'status-connected' : 'status-disconnected';
    }
  }

  // Admin kill switch (external access)
  adminKillSwitch() {
    if (!this.adminKillEnabled) return false;

    this.stop();
    this.reset();
    this.logEvent('ADMIN_KILL', 'Emergency stop activated by admin');
    
    // Disable monitor for 30 seconds
    this.adminKillEnabled = false;
    setTimeout(() => {
      this.adminKillEnabled = true;
    }, 30000);

    return true;
  }

  // Get current state
  getState() {
    return {
      isActive: this.isActive,
      pulseCount: this.pulseCount,
      evolutionCycles: this.evolutionCycles,
      lastPulseTime: this.lastPulseTime,
      sseConnected: this.sseConnection && this.sseConnection.readyState === EventSource.OPEN,
      adminKillEnabled: this.adminKillEnabled,
      eventsLog: this.eventsLog.slice(0, 10) // Last 10 events
    };
  }
}

// Global instance
window.recursionMonitor = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize after a short delay to ensure other scripts are loaded
  setTimeout(() => {
    if (!window.recursionMonitor) {
      window.recursionMonitor = new RecursionMonitor();
      console.log('🔄 Global Recursion Monitor instance created');
    }
  }, 1000);
});

// Export for module environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RecursionMonitor;
}