// Cosmic Sentinel Watchtower JavaScript

class SentinelWatchtower {
  constructor() {
    this.websocket = null;
    this.isAuthenticated = false;
    this.isPublicMode = true;
    this.walletAddress = null;
    this.telemetryData = null;
    this.narrativeHistory = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    
    this.init();
  }
  
  async init() {
    console.log('🔮 Initializing Cosmic Sentinel Watchtower...');
    
    // Initialize UI elements
    this.initializeUI();
    
    // Connect to WebSocket for real-time updates
    this.connectWebSocket();
    
    // Check for existing wallet connection
    await this.checkWalletConnection();
    
    // Start periodic health checks
    this.startHealthChecks();
    
    console.log('✨ Watchtower initialization complete');
  }
  
  initializeUI() {
    // Connect wallet button
    const connectBtn = document.getElementById('connectWalletBtn');
    if (connectBtn) {
      connectBtn.addEventListener('click', () => this.connectWallet());
    }
    
    // Update initial glyph state
    this.updateGlyphStates('gold');
    
    // Initialize metric displays
    this.updateMetricDisplays({
      cpu_usage: 0,
      memory_usage: 0,
      active_connections: 0,
      vault_integrity: 100,
      cosmic_load: 'minimal',
      anomaly_frequency: 0
    });
  }
  
  connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}`;
    
    try {
      this.websocket = new WebSocket(wsUrl);
      
      this.websocket.onopen = () => {
        console.log('🌐 Connected to Sentinel telemetry feed');
        this.updateConnectionStatus(true);
        this.reconnectAttempts = 0;
      };
      
      this.websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'telemetry_update') {
          this.handleTelemetryUpdate(data.data);
        }
      };
      
      this.websocket.onclose = () => {
        console.log('🔌 Disconnected from Sentinel feed');
        this.updateConnectionStatus(false);
        this.attemptReconnect();
      };
      
      this.websocket.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.updateConnectionStatus(false);
      };
      
    } catch (error) {
      console.error('❌ Failed to connect to Sentinel feed:', error);
      this.updateConnectionStatus(false);
    }
  }
  
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      console.log(`🔄 Attempting to reconnect to Sentinel feed (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay/1000}s`);
      
      setTimeout(() => {
        this.connectWebSocket();
      }, delay);
    } else {
      console.error('💀 Failed to reconnect to Sentinel feed after maximum attempts');
    }
  }
  
  updateConnectionStatus(connected) {
    const statusEl = document.getElementById('wsStatus');
    if (statusEl) {
      statusEl.textContent = connected ? '🟢' : '🔴';
    }
  }
  
  async checkWalletConnection() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_accounts' 
        });
        
        if (accounts.length > 0) {
          this.walletAddress = accounts[0];
          await this.authenticateKeyholder();
        }
      } catch (error) {
        console.log('No existing wallet connection found');
      }
    }
    
    this.updateAuthStatus();
  }
  
  async connectWallet() {
    if (typeof window.ethereum === 'undefined') {
      alert('🦊 MetaMask not detected. Please install MetaMask to access full Watchtower features.');
      return;
    }
    
    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      this.walletAddress = accounts[0];
      await this.authenticateKeyholder();
      this.updateAuthStatus();
      
      console.log('🔑 Wallet connected:', this.walletAddress);
    } catch (error) {
      console.error('❌ Wallet connection failed:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  }
  
  async authenticateKeyholder() {
    // Check if wallet holds ChaosKey333 tokens
    // This is a simplified check - in production, you'd verify actual token ownership
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      
      // For demo purposes, assume authentication based on wallet connection
      // In production, check actual ChaosKey333 token balance
      this.isAuthenticated = true;
      this.isPublicMode = false;
      
      console.log('✅ ChaosKey333 holder authenticated');
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      this.isAuthenticated = false;
    }
  }
  
  updateAuthStatus() {
    const authIndicator = document.getElementById('authIndicator');
    const authText = document.getElementById('authText');
    const connectBtn = document.getElementById('connectWalletBtn');
    
    if (this.isAuthenticated) {
      if (authIndicator) authIndicator.textContent = '🔓';
      if (authText) authText.textContent = `Keyholder: ${this.walletAddress.slice(0, 6)}...${this.walletAddress.slice(-4)}`;
      if (connectBtn) connectBtn.style.display = 'none';
    } else if (this.walletAddress) {
      if (authIndicator) authIndicator.textContent = '🔒';
      if (authText) authText.textContent = 'Wallet connected (No ChaosKey)';
      if (connectBtn) connectBtn.style.display = 'none';
    } else {
      if (authIndicator) authIndicator.textContent = '🔒';
      if (authText) authText.textContent = 'Connect wallet for full access';
      if (connectBtn) connectBtn.style.display = 'block';
    }
  }
  
  handleTelemetryUpdate(data) {
    this.telemetryData = data;
    
    // Apply privacy filters for public mode
    const displayData = this.isPublicMode ? this.applyPublicModeFilters(data) : data;
    
    // Update metric displays
    this.updateMetricDisplays(displayData);
    
    // Update glyph states
    this.updateGlyphStates(data.sentinel_state, data.anomaly_frequency);
    
    // Update lore narrative
    this.updateLoreNarrative(data.lore_narrative, data.timestamp);
    
    console.log('📊 Telemetry updated:', displayData);
  }
  
  applyPublicModeFilters(data) {
    if (!this.isAuthenticated) {
      // In public teaser mode, show limited/anonymized data
      return {
        ...data,
        cpu_usage: Math.round(data.cpu_usage / 10) * 10, // Round to nearest 10
        memory_usage: Math.round(data.memory_usage / 10) * 10,
        active_connections: '***', // Hide sensitive connection data
        vault_integrity: data.vault_integrity > 90 ? 'Optimal' : 'Monitoring',
        anomaly_frequency: data.anomaly_frequency > 5 ? 'Elevated' : 'Normal'
      };
    }
    return data;
  }
  
  updateMetricDisplays(data) {
    // CPU Usage
    const cpuEl = document.getElementById('cpuUsage');
    const cpuBarEl = document.getElementById('cpuBar');
    if (cpuEl && cpuBarEl) {
      cpuEl.textContent = typeof data.cpu_usage === 'number' ? `${data.cpu_usage.toFixed(1)}%` : data.cpu_usage;
      cpuBarEl.style.width = typeof data.cpu_usage === 'number' ? `${data.cpu_usage}%` : '0%';
    }
    
    // Memory Usage
    const memEl = document.getElementById('memoryUsage');
    const memBarEl = document.getElementById('memoryBar');
    if (memEl && memBarEl) {
      memEl.textContent = typeof data.memory_usage === 'number' ? `${data.memory_usage.toFixed(1)}%` : data.memory_usage;
      memBarEl.style.width = typeof data.memory_usage === 'number' ? `${data.memory_usage}%` : '0%';
    }
    
    // Active Connections
    const connEl = document.getElementById('activeConnections');
    if (connEl) {
      connEl.textContent = data.active_connections;
    }
    
    // Vault Integrity
    const integrityEl = document.getElementById('vaultIntegrity');
    const integrityBarEl = document.getElementById('integrityBar');
    if (integrityEl && integrityBarEl) {
      integrityEl.textContent = typeof data.vault_integrity === 'number' ? `${data.vault_integrity.toFixed(1)}%` : data.vault_integrity;
      integrityBarEl.style.width = typeof data.vault_integrity === 'number' ? `${data.vault_integrity}%` : '100%';
    }
    
    // Cosmic Load
    const loadEl = document.getElementById('cosmicLoad');
    const loadIndicatorEl = document.getElementById('loadIndicator');
    if (loadEl) {
      loadEl.textContent = data.cosmic_load.toUpperCase();
    }
    if (loadIndicatorEl) {
      loadIndicatorEl.className = `cosmic-indicator ${data.cosmic_load}`;
    }
    
    // Anomaly Frequency
    const anomalyEl = document.getElementById('anomalyFreq');
    const anomalyPulserEl = document.getElementById('anomalyPulser');
    if (anomalyEl) {
      anomalyEl.textContent = typeof data.anomaly_frequency === 'number' ? data.anomaly_frequency.toFixed(1) : data.anomaly_frequency;
    }
    if (anomalyPulserEl) {
      if (typeof data.anomaly_frequency === 'number' && data.anomaly_frequency > 2) {
        anomalyPulserEl.classList.add('active');
      } else {
        anomalyPulserEl.classList.remove('active');
      }
    }
  }
  
  updateGlyphStates(sentinelState, anomalyFreq = 0) {
    // Update primary glyph
    const primaryGlyph = document.getElementById('primaryGlyph');
    if (primaryGlyph) {
      const glyphEl = primaryGlyph.querySelector('.sentinel-glyph');
      if (glyphEl) {
        // Remove all state classes
        glyphEl.classList.remove('gold-glyph', 'crimson-glyph', 'indigo-glyph', 'active');
        
        // Add new state class
        glyphEl.classList.add(`${sentinelState}-glyph`, 'active');
        
        // Add anomaly sync classes for crimson state
        if (sentinelState === 'crimson' && anomalyFreq > 5) {
          glyphEl.classList.add('anomaly-sync-3');
        }
      }
    }
    
    // Update status glyphs
    const goldGlyph = document.getElementById('goldGlyph');
    const crimsonGlyph = document.getElementById('crimsonGlyph');
    const indigoGlyph = document.getElementById('indigoGlyph');
    
    // Remove active classes
    [goldGlyph, crimsonGlyph, indigoGlyph].forEach(glyph => {
      if (glyph) glyph.classList.remove('active');
    });
    
    // Add active class to current state
    const activeGlyph = document.getElementById(`${sentinelState}Glyph`);
    if (activeGlyph) {
      activeGlyph.classList.add('active');
    }
    
    // Add extreme anomaly effects
    const body = document.body;
    if (sentinelState === 'crimson' && anomalyFreq > 8) {
      body.classList.add('extreme-anomaly');
    } else {
      body.classList.remove('extreme-anomaly');
    }
  }
  
  updateLoreNarrative(narrative, timestamp) {
    const narrativeEl = document.getElementById('loreNarrative');
    const timestampEl = document.getElementById('loreTimestamp');
    const historyEl = document.getElementById('narrativeHistory');
    
    if (narrativeEl) {
      narrativeEl.textContent = narrative;
    }
    
    if (timestampEl) {
      const date = new Date(timestamp);
      timestampEl.textContent = date.toLocaleTimeString();
    }
    
    // Add to history
    this.narrativeHistory.unshift({
      text: narrative,
      timestamp: timestamp
    });
    
    // Keep only last 10 narratives
    if (this.narrativeHistory.length > 10) {
      this.narrativeHistory = this.narrativeHistory.slice(0, 10);
    }
    
    // Update history display
    if (historyEl) {
      historyEl.innerHTML = this.narrativeHistory
        .slice(1) // Skip current narrative
        .map(entry => {
          const date = new Date(entry.timestamp);
          return `<div class="history-entry">
            <span class="history-time">${date.toLocaleTimeString()}</span>
            <span class="history-text">${entry.text}</span>
          </div>`;
        })
        .join('');
    }
  }
  
  async startHealthChecks() {
    // Fallback health checks in case WebSocket fails
    setInterval(async () => {
      if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
        try {
          await this.fetchHealthData();
        } catch (error) {
          console.error('❌ Health check failed:', error);
        }
      }
    }, 10000); // Every 10 seconds
  }
  
  async fetchHealthData() {
    try {
      const response = await fetch('/health');
      const data = await response.json();
      
      if (data.telemetry) {
        this.handleTelemetryUpdate(data.telemetry);
      }
    } catch (error) {
      console.error('❌ Failed to fetch health data:', error);
    }
  }
}

// Global functions for UI interactions
async function refreshTelemetry() {
  try {
    const response = await fetch('/health');
    const data = await response.json();
    console.log('🔄 Manual telemetry refresh:', data);
    
    if (window.watchtower && data.telemetry) {
      window.watchtower.handleTelemetryUpdate(data.telemetry);
    }
  } catch (error) {
    console.error('❌ Failed to refresh telemetry:', error);
    alert('Failed to refresh telemetry data');
  }
}

async function accessArchive() {
  try {
    const response = await fetch('/api/vault/archive?limit=20');
    const data = await response.json();
    
    const modal = document.getElementById('archiveModal');
    const content = document.getElementById('archiveContent');
    
    if (content) {
      content.innerHTML = `
        <div class="archive-stats">
          <h4>📊 Archive Statistics</h4>
          <p>Total archived states: ${data.total_states}</p>
          <p>Showing recent: ${data.returned_states}</p>
          <p>Vault integrity: ${data.vault_integrity}</p>
        </div>
        <div class="archive-entries">
          ${data.archive.map(entry => `
            <div class="archive-entry">
              <div class="entry-header">
                <span class="entry-id">${entry.id}</span>
                <span class="entry-time">${new Date(entry.timestamp).toLocaleString()}</span>
              </div>
              <div class="entry-data">
                <span class="data-point">CPU: ${entry.cpu_usage.toFixed(1)}%</span>
                <span class="data-point">MEM: ${entry.memory_usage.toFixed(1)}%</span>
                <span class="data-point">State: ${entry.sentinel_state}</span>
                <span class="data-point">Anomaly: ${entry.anomaly_frequency.toFixed(1)}</span>
              </div>
              <div class="entry-narrative">${entry.lore_narrative}</div>
            </div>
          `).join('')}
        </div>
      `;
    }
    
    if (modal) {
      modal.classList.remove('hidden');
    }
  } catch (error) {
    console.error('❌ Failed to access archive:', error);
    alert('Failed to access vault archive');
  }
}

function closeArchive() {
  const modal = document.getElementById('archiveModal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

function togglePublicMode() {
  if (window.watchtower) {
    window.watchtower.isPublicMode = !window.watchtower.isPublicMode;
    
    const modeIcon = document.getElementById('modeIcon');
    const modeText = document.getElementById('modeText');
    
    if (window.watchtower.isPublicMode) {
      if (modeIcon) modeIcon.textContent = '👁️';
      if (modeText) modeText.textContent = 'TEASER MODE';
    } else {
      if (modeIcon) modeIcon.textContent = '🔓';
      if (modeText) modeText.textContent = 'FULL ACCESS';
    }
    
    // Re-apply current telemetry with new mode
    if (window.watchtower.telemetryData) {
      window.watchtower.handleTelemetryUpdate(window.watchtower.telemetryData);
    }
  }
}

// Initialize watchtower when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.watchtower = new SentinelWatchtower();
});

// Handle wallet account changes
if (typeof window.ethereum !== 'undefined') {
  window.ethereum.on('accountsChanged', (accounts) => {
    if (window.watchtower) {
      if (accounts.length > 0) {
        window.watchtower.walletAddress = accounts[0];
        window.watchtower.authenticateKeyholder();
      } else {
        window.watchtower.walletAddress = null;
        window.watchtower.isAuthenticated = false;
      }
      window.watchtower.updateAuthStatus();
    }
  });
}