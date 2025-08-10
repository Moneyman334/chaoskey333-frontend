// Omni-Singularity Architecture Integration Module
// Main module that initializes and coordinates all components

import { 
  OMNI_SINGULARITY_CONFIG, 
  omniLog, 
  ReplayRateLimiter, 
  ReplayStorage 
} from './omni-singularity-config.js';

import { 
  OmniSingularityMap, 
  OMNI_MAP_STYLES 
} from './omni-singularity-map.js';

import { 
  CosmicReplayTerminal, 
  COSMIC_TERMINAL_STYLES 
} from './cosmic-replay-terminal.js';

import { 
  SpectralDecodeHUD, 
  SPECTRAL_HUD_STYLES 
} from './spectral-decode-hud.js';

import { 
  CircuitLinkingSystem, 
  CIRCUIT_LINKING_STYLES 
} from './circuit-linking-system.js';

export class OmniSingularityArchitecture {
  constructor() {
    this.isInitialized = false;
    this.components = {};
    this.version = '2.0-ASCENSION';
    
    omniLog(`Initializing Omni-Singularity Architecture v${this.version}`, 'info');
  }
  
  async initialize() {
    try {
      // Inject CSS styles
      this.injectStyles();
      
      // Create container structure
      this.createArchitectureContainers();
      
      // Initialize components in sequence
      await this.initializeComponents();
      
      // Setup integration events
      this.setupIntegrationEvents();
      
      // Connect to existing vault system
      this.integrateWithVaultSystem();
      
      this.isInitialized = true;
      omniLog('Omni-Singularity Architecture fully initialized', 'success');
      
      // Show startup notification
      this.showStartupNotification();
      
      return true;
      
    } catch (error) {
      omniLog('Failed to initialize Omni-Singularity Architecture: ' + error.message, 'error');
      return false;
    }
  }
  
  injectStyles() {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'omni-singularity-styles';
    styleSheet.textContent = `
      ${OMNI_MAP_STYLES}
      ${COSMIC_TERMINAL_STYLES}
      ${SPECTRAL_HUD_STYLES}
      ${CIRCUIT_LINKING_STYLES}
      
      /* Additional integration styles */
      .omni-singularity-container {
        margin-top: 30px;
        padding: 20px;
        background: linear-gradient(135deg, #000 0%, #001122 50%, #000 100%);
        border: 2px solid #00ffcc;
        border-radius: 20px;
        position: relative;
        overflow: hidden;
      }
      
      .omni-singularity-container::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
          radial-gradient(circle at 20% 20%, rgba(0,255,204,0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(0,102,255,0.1) 0%, transparent 50%);
        pointer-events: none;
        animation: omniAura 10s ease-in-out infinite alternate;
      }
      
      .architecture-header {
        text-align: center;
        margin-bottom: 30px;
        border-bottom: 2px solid #00ffcc;
        padding-bottom: 15px;
        position: relative;
        z-index: 1;
      }
      
      .architecture-title {
        font-family: 'Orbitron', sans-serif;
        font-size: 2rem;
        color: #00ffcc;
        text-shadow: 0 0 20px #00ffcc;
        margin: 0;
        animation: titlePulse 3s ease-in-out infinite alternate;
      }
      
      .architecture-subtitle {
        font-family: 'Courier New', monospace;
        color: #ffcc00;
        font-size: 0.9rem;
        margin: 5px 0 0 0;
        font-weight: bold;
      }
      
      .version-badge {
        display: inline-block;
        background: linear-gradient(45deg, #ff00cc, #ffcc00);
        color: #000;
        padding: 4px 12px;
        border-radius: 15px;
        font-size: 0.7rem;
        font-weight: bold;
        margin-left: 10px;
        text-shadow: none;
      }
      
      .component-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 20px;
        position: relative;
        z-index: 1;
      }
      
      .integration-status {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 20px;
        margin: 20px 0;
        padding: 15px;
        background: rgba(0, 255, 204, 0.05);
        border: 1px solid #00ffcc;
        border-radius: 10px;
        font-family: 'Courier New', monospace;
      }
      
      .status-indicator {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 0.8rem;
      }
      
      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #00ff00;
        box-shadow: 0 0 10px #00ff00;
        animation: pulse 2s infinite;
      }
      
      .status-dot.warning {
        background: #ffaa00;
        box-shadow: 0 0 10px #ffaa00;
      }
      
      .status-dot.error {
        background: #ff3333;
        box-shadow: 0 0 10px #ff3333;
      }
      
      .startup-notification {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #000 0%, #003333 50%, #000 100%);
        border: 2px solid #00ffcc;
        border-radius: 15px;
        padding: 30px;
        text-align: center;
        font-family: 'Orbitron', sans-serif;
        color: #00ffcc;
        z-index: 10000;
        min-width: 400px;
        box-shadow: 0 0 50px rgba(0, 255, 204, 0.5);
        animation: notificationSlideIn 0.5s ease-out;
      }
      
      .startup-notification h2 {
        margin: 0 0 15px 0;
        color: #00ffcc;
        text-shadow: 0 0 15px #00ffcc;
        font-size: 1.5rem;
      }
      
      .startup-notification p {
        margin: 10px 0;
        font-size: 0.9rem;
        line-height: 1.4;
      }
      
      .feature-flags-display {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin: 15px 0;
        font-family: 'Courier New', monospace;
        font-size: 0.7rem;
      }
      
      .flag-item {
        background: rgba(0, 255, 204, 0.1);
        padding: 5px 10px;
        border-radius: 5px;
        border-left: 3px solid #00ffcc;
      }
      
      .flag-name {
        color: #ffcc00;
        font-weight: bold;
      }
      
      .flag-value {
        color: #00ffcc;
      }
      
      .dismiss-btn {
        background: #00ffcc;
        color: #000;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        font-family: 'Orbitron', sans-serif;
        font-weight: bold;
        cursor: pointer;
        margin-top: 15px;
        transition: all 0.3s ease;
      }
      
      .dismiss-btn:hover {
        background: #ffcc00;
        transform: scale(1.05);
      }
      
      @keyframes omniAura {
        0% { opacity: 0.3; }
        100% { opacity: 0.7; }
      }
      
      @keyframes titlePulse {
        0% { text-shadow: 0 0 20px #00ffcc; }
        100% { text-shadow: 0 0 30px #00ffcc, 0 0 40px #00ccff; }
      }
      
      @keyframes notificationSlideIn {
        from { 
          opacity: 0; 
          transform: translate(-50%, -50%) scale(0.8); 
        }
        to { 
          opacity: 1; 
          transform: translate(-50%, -50%) scale(1); 
        }
      }
    `;
    
    document.head.appendChild(styleSheet);
    omniLog('Omni-Singularity styles injected', 'success');
  }
  
  createArchitectureContainers() {
    // Find the main container (after the existing vault content)
    const mainContainer = document.querySelector('.resurrection-container');
    if (!mainContainer) {
      throw new Error('Main vault container not found');
    }
    
    // Create the Omni-Singularity container
    const omniContainer = document.createElement('div');
    omniContainer.className = 'omni-singularity-container';
    omniContainer.innerHTML = `
      <div class="architecture-header">
        <h1 class="architecture-title">
          ⚡ OMNI-SINGULARITY ARCHITECTURE ⚡
          <span class="version-badge">v${this.version}</span>
        </h1>
        <p class="architecture-subtitle">
          COSMIC REPLAY TERMINAL v2.0 • ASCENSION EDITION
        </p>
      </div>
      
      <div class="integration-status" id="integrationStatus">
        <div class="status-indicator">
          <div class="status-dot" id="mapStatus"></div>
          <span>Omni-Singularity Map</span>
        </div>
        <div class="status-indicator">
          <div class="status-dot" id="terminalStatus"></div>
          <span>Replay Terminal</span>
        </div>
        <div class="status-indicator">
          <div class="status-dot" id="hudStatus"></div>
          <span>Spectral HUD</span>
        </div>
        <div class="status-indicator">
          <div class="status-dot" id="circuitStatus"></div>
          <span>Circuit Linking</span>
        </div>
      </div>
      
      <div class="component-grid">
        <div id="omniSingularityMapContainer"></div>
        <div id="cosmicReplayTerminalContainer"></div>
        <div id="spectralDecodeHUDContainer"></div>
      </div>
    `;
    
    // Insert after the main vault container
    mainContainer.insertAdjacentElement('afterend', omniContainer);
    
    omniLog('Architecture containers created', 'success');
  }
  
  async initializeComponents() {
    const components = [
      {
        name: 'omniSingularityMap',
        class: OmniSingularityMap,
        container: 'omniSingularityMapContainer',
        statusId: 'mapStatus'
      },
      {
        name: 'cosmicReplayTerminal', 
        class: CosmicReplayTerminal,
        container: 'cosmicReplayTerminalContainer',
        statusId: 'terminalStatus'
      },
      {
        name: 'spectralDecodeHUD',
        class: SpectralDecodeHUD,
        container: 'spectralDecodeHUDContainer', 
        statusId: 'hudStatus'
      },
      {
        name: 'circuitLinkingSystem',
        class: CircuitLinkingSystem,
        container: null, // System component, no container
        statusId: 'circuitStatus'
      }
    ];
    
    for (const component of components) {
      try {
        omniLog(`Initializing ${component.name}...`, 'info');
        
        if (component.container) {
          this.components[component.name] = new component.class(component.container);
        } else {
          this.components[component.name] = new component.class();
        }
        
        const initialized = await this.components[component.name].initialize();
        
        if (initialized) {
          this.updateStatusIndicator(component.statusId, 'success');
          omniLog(`${component.name} initialized successfully`, 'success');
        } else {
          this.updateStatusIndicator(component.statusId, 'error');
          omniLog(`${component.name} failed to initialize`, 'error');
        }
        
        // Small delay between initializations
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        this.updateStatusIndicator(component.statusId, 'error');
        omniLog(`Error initializing ${component.name}: ${error.message}`, 'error');
      }
    }
  }
  
  setupIntegrationEvents() {
    // Listen for system-wide events and coordinate responses
    document.addEventListener('omniSingularityStatus', (e) => {
      this.handleSystemStatus(e.detail);
    });
    
    // Integration event logging
    const eventTypes = [
      'vaultBroadcastPulse',
      'spectralDecodeUpdate', 
      'relicMutation',
      'chaosKeyGlyphOverride',
      'omniNodeActivation'
    ];
    
    eventTypes.forEach(eventType => {
      document.addEventListener(eventType, (e) => {
        omniLog(`Integration event: ${eventType}`, 'info', e.detail);
      });
    });
    
    omniLog('Integration event handlers setup complete', 'success');
  }
  
  integrateWithVaultSystem() {
    // Hook into existing wallet connection events
    const originalConnectWallet = window.connectWallet;
    if (originalConnectWallet) {
      window.connectWallet = async () => {
        const result = await originalConnectWallet();
        
        // Trigger wallet connection event for Omni-Singularity
        if (window.userWalletAddress) {
          document.dispatchEvent(new CustomEvent('walletConnected', {
            detail: {
              address: window.userWalletAddress,
              walletType: window.connectedWalletType || 'unknown'
            }
          }));
        }
        
        return result;
      };
    }
    
    // Hook into relic minting
    const originalMintRelic = window.mintRelic;
    if (originalMintRelic) {
      window.mintRelic = async () => {
        const result = await originalMintRelic();
        
        // Trigger relic minting event
        document.dispatchEvent(new CustomEvent('relicMinted', {
          detail: {
            walletAddress: window.userWalletAddress,
            relicId: 'relic_' + Date.now(),
            timestamp: Date.now()
          }
        }));
        
        return result;
      };
    }
    
    // Hook into audio events
    const audioElement = document.getElementById('bassDrop');
    if (audioElement) {
      audioElement.addEventListener('play', () => {
        document.dispatchEvent(new CustomEvent('audioEvent', {
          detail: {
            type: 'bass_drop',
            intensity: 85,
            timestamp: Date.now()
          }
        }));
      });
    }
    
    // Hook into the resurrect function
    const originalResurrect = window.resurrect;
    if (originalResurrect) {
      window.resurrect = () => {
        originalResurrect();
        
        // Trigger manual glyph activation
        document.dispatchEvent(new CustomEvent('manualGlyphActivation', {
          detail: {
            type: 'resurrection_trigger',
            source: 'vault_ignition',
            timestamp: Date.now()
          }
        }));
      };
    }
    
    omniLog('Vault system integration complete', 'success');
  }
  
  updateStatusIndicator(statusId, status) {
    const statusElement = document.getElementById(statusId);
    if (!statusElement) return;
    
    // Remove existing status classes
    statusElement.classList.remove('warning', 'error');
    
    switch (status) {
      case 'success':
        // Keep default green
        break;
      case 'warning':
        statusElement.classList.add('warning');
        break;
      case 'error':
        statusElement.classList.add('error');
        break;
    }
  }
  
  handleSystemStatus(status) {
    // Update integration status based on system health
    const healthPercentage = status.averageHealth;
    
    if (healthPercentage > 80) {
      this.updateStatusIndicator('circuitStatus', 'success');
    } else if (healthPercentage > 50) {
      this.updateStatusIndicator('circuitStatus', 'warning');
    } else {
      this.updateStatusIndicator('circuitStatus', 'error');
    }
  }
  
  showStartupNotification() {
    const notification = document.createElement('div');
    notification.className = 'startup-notification';
    notification.innerHTML = `
      <h2>🌀 OMNI-SINGULARITY ARCHITECTURE ONLINE</h2>
      <p>Cosmic Replay Terminal v2.0 - Ascension Edition has been successfully integrated!</p>
      
      <div class="feature-flags-display">
        <div class="flag-item">
          <div class="flag-name">REPLAY_RECURSIVE:</div>
          <div class="flag-value">${OMNI_SINGULARITY_CONFIG.REPLAY_RECURSIVE ? 'ON' : 'OFF'}</div>
        </div>
        <div class="flag-item">
          <div class="flag-name">RATE_LIMIT:</div>
          <div class="flag-value">${OMNI_SINGULARITY_CONFIG.REPLAY_RATE_LIMIT / 1000}s</div>
        </div>
        <div class="flag-item">
          <div class="flag-name">RETENTION:</div>
          <div class="flag-value">${OMNI_SINGULARITY_CONFIG.REPLAY_RETENTION}</div>
        </div>
        <div class="flag-item">
          <div class="flag-name">GLYPH_OVERRIDE:</div>
          <div class="flag-value">${OMNI_SINGULARITY_CONFIG.CHAOSKEY_GLYPH_OVERRIDE_ENABLED ? 'ENABLED' : 'DISABLED'}</div>
        </div>
      </div>
      
      <p><strong>✅ Map Injection:</strong> Glowing relay nodes active</p>
      <p><strong>🔗 Circuit Linking:</strong> Vault → Replay → Spectral HUD</p>
      <p><strong>🧬 Evolution Hooks:</strong> PR #24 relic mutations linked</p>
      <p><strong>⚡ Failsafe Path:</strong> ChaosKey333 glyph override ready</p>
      
      <button class="dismiss-btn" onclick="this.parentElement.remove()">
        ACKNOWLEDGE INTEGRATION
      </button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  }
  
  getSystemStatus() {
    const componentStatus = {};
    
    Object.keys(this.components).forEach(name => {
      const component = this.components[name];
      if (component && typeof component.getSystemStatus === 'function') {
        componentStatus[name] = component.getSystemStatus();
      } else {
        componentStatus[name] = { initialized: !!component };
      }
    });
    
    return {
      architecture: {
        version: this.version,
        initialized: this.isInitialized,
        timestamp: Date.now()
      },
      config: OMNI_SINGULARITY_CONFIG,
      components: componentStatus
    };
  }
  
  destroy() {
    // Destroy all components
    Object.values(this.components).forEach(component => {
      if (component && typeof component.destroy === 'function') {
        component.destroy();
      }
    });
    
    // Remove injected styles
    const styleSheet = document.getElementById('omni-singularity-styles');
    if (styleSheet) {
      styleSheet.remove();
    }
    
    // Remove container
    const container = document.querySelector('.omni-singularity-container');
    if (container) {
      container.remove();
    }
    
    this.isInitialized = false;
    omniLog('Omni-Singularity Architecture destroyed', 'info');
  }
}

// Global initialization function
window.initializeOmniSingularityArchitecture = async () => {
  if (window.omniSingularityArchitecture) {
    omniLog('Architecture already initialized', 'warn');
    return window.omniSingularityArchitecture;
  }
  
  window.omniSingularityArchitecture = new OmniSingularityArchitecture();
  const success = await window.omniSingularityArchitecture.initialize();
  
  if (success) {
    omniLog('🚀 Omni-Singularity Architecture fully operational!', 'success');
  } else {
    omniLog('❌ Failed to initialize Omni-Singularity Architecture', 'error');
  }
  
  return window.omniSingularityArchitecture;
};

export default OmniSingularityArchitecture;