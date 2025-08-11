/**
 * Temporal Echo Integration - Connects Echo Layer to ChaosKey333 Frontend
 * 
 * This script bridges the Temporal Echo Layer with the existing application,
 * providing event dispatching and HUD integration.
 */

class TemporalEchoIntegration {
  constructor() {
    this.echoLayer = null;
    this.isInitialized = false;
    this.glyphElements = new Map();
    this.decodeInProgress = false;
    this.relicData = this.loadRelicData();
    this.simulationMode = false;
    
    this.init();
  }

  init() {
    // Wait for DOM and existing systems to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeEchoLayer());
    } else {
      this.initializeEchoLayer();
    }
  }

  initializeEchoLayer() {
    try {
      // Initialize the Temporal Echo Layer
      this.echoLayer = new TemporalEchoLayer({
        minOpacity: 0.2,
        maxOpacity: 0.4,
        breatheSpeed: 2000,
        colorShiftDuration: 1500,
        trailFadeTime: 800,
        fragmentFlashDuration: 100,
        bassThreshold: 0.3
      });

      this.setupHUDIntegration();
      this.setupRelicIntegration();
      this.setupSimulationMode();
      this.isInitialized = true;

      console.log('🌀 Temporal Echo Integration initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize Temporal Echo Integration:', error);
    }
  }

  setupHUDIntegration() {
    // Find and enhance existing UI elements
    this.enhanceExistingElements();
    
    // Set up mouse/touch tracking for motion trails
    this.setupMotionTracking();
    
    // Monitor for dynamically added elements
    this.observeNewElements();
  }

  enhanceExistingElements() {
    // Add HUD glyph class to relevant elements
    const buttons = document.querySelectorAll('button');
    const statusElements = document.querySelectorAll('[id*="Status"], [id*="status"]');
    const glyphLikeElements = document.querySelectorAll('.glow, .pulse, .frank-img');
    
    [...buttons, ...statusElements, ...glyphLikeElements].forEach((element, index) => {
      element.classList.add('hud-glyph');
      this.glyphElements.set(`glyph-${index}`, element);
      
      // Add hover effects that trigger decode sequences
      element.addEventListener('mouseenter', () => this.triggerGlyphInteraction(element));
      element.addEventListener('click', () => this.triggerDecodeSequence(element));
    });
  }

  setupMotionTracking() {
    let lastMousePosition = { x: 0, y: 0 };
    let mouseMoveCount = 0;
    let rapidMovementTimer = null;

    document.addEventListener('mousemove', (event) => {
      const currentPosition = { x: event.clientX, y: event.clientY };
      const distance = this.calculateDistance(lastMousePosition, currentPosition);
      
      // Track rapid movement for motion trails
      if (distance > 5) {
        mouseMoveCount++;
        
        // Clear existing timer
        if (rapidMovementTimer) {
          clearTimeout(rapidMovementTimer);
        }
        
        // Set new timer to detect rapid movement
        rapidMovementTimer = setTimeout(() => {
          if (mouseMoveCount > 3) {
            this.dispatchEvent('chaoskey:decode:glyph', {
              element: event.target,
              position: currentPosition,
              intensity: Math.min(mouseMoveCount / 10, 1)
            });
          }
          mouseMoveCount = 0;
        }, 100);
        
        lastMousePosition = currentPosition;
      }
    });

    // Touch support for mobile
    document.addEventListener('touchmove', (event) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        const position = { x: touch.clientX, y: touch.clientY };
        
        this.dispatchEvent('chaoskey:decode:glyph', {
          element: event.target,
          position: position,
          intensity: 0.8
        });
      }
    });
  }

  observeNewElements() {
    // Use MutationObserver to watch for new elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.enhanceNewElement(node);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  enhanceNewElement(element) {
    // Check if element should be enhanced as HUD element
    if (element.tagName === 'BUTTON' || 
        element.classList.contains('glow') ||
        element.classList.contains('pulse') ||
        element.id.includes('Status') ||
        element.id.includes('status')) {
      
      element.classList.add('hud-glyph');
      element.addEventListener('mouseenter', () => this.triggerGlyphInteraction(element));
      element.addEventListener('click', () => this.triggerDecodeSequence(element));
    }
  }

  setupRelicIntegration() {
    // Monitor for relic-related events from existing system
    this.monitorWalletConnections();
    this.monitorMintingProcess();
    this.monitorRelicState();
  }

  monitorWalletConnections() {
    // Watch for wallet connection events
    const connectButtons = document.querySelectorAll('[id*="connect"], [id*="Connect"]');
    connectButtons.forEach(button => {
      button.addEventListener('click', () => {
        setTimeout(() => {
          if (window.userWalletAddress || window.isWalletConnected) {
            this.handleRelicEvolution('connection', { wallet: window.userWalletAddress });
          }
        }, 1000);
      });
    });
  }

  monitorMintingProcess() {
    // Watch for minting process
    const mintButtons = document.querySelectorAll('[id*="payment"], [id*="mint"], [id*="Mint"]');
    mintButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.triggerDecodeSequence(button, 'minting');
        
        // Simulate minting success after delay
        setTimeout(() => {
          this.handleRelicEvolution('minted', { success: true });
        }, 3000);
      });
    });
  }

  monitorRelicState() {
    // Check for existing relic state changes
    setInterval(() => {
      const currentState = this.loadRelicData();
      if (JSON.stringify(currentState) !== JSON.stringify(this.relicData)) {
        this.handleRelicEvolution('state_change', currentState);
        this.relicData = currentState;
      }
    }, 2000);
  }

  setupSimulationMode() {
    // Enable simulation mode for demonstration
    this.simulationMode = true;
    
    // Add debug controls
    this.addDebugControls();
    
    // Start periodic simulation events
    this.startSimulationEvents();
  }

  addDebugControls() {
    const debugPanel = document.createElement('div');
    debugPanel.id = 'temporal-echo-debug';
    debugPanel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: #00ff00;
      padding: 10px;
      border-radius: 5px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      z-index: 10000;
      max-width: 200px;
    `;
    
    debugPanel.innerHTML = `
      <div>🌀 Temporal Echo Debug</div>
      <button onclick="temporalEchoIntegration.simulateDecodeSequence()">Decode</button>
      <button onclick="temporalEchoIntegration.simulateRelicMutation()">Mutate</button>
      <button onclick="temporalEchoIntegration.simulateBassHit()">Bass Hit</button>
      <div id="echo-status">Status: Active</div>
    `;
    
    document.body.appendChild(debugPanel);
  }

  startSimulationEvents() {
    if (!this.simulationMode) return;
    
    // Simulate periodic decode events
    setInterval(() => {
      if (Math.random() > 0.7) {
        this.simulateDecodeSequence();
      }
    }, 5000);
    
    // Simulate bass hits
    setInterval(() => {
      if (Math.random() > 0.5) {
        this.simulateBassHit();
      }
    }, 2000);
  }

  // Event handling methods
  triggerGlyphInteraction(element) {
    element.classList.add('decoding');
    
    this.dispatchEvent('chaoskey:decode:glyph', {
      element: element,
      position: this.getElementCenter(element),
      type: 'hover'
    });
    
    setTimeout(() => {
      element.classList.remove('decoding');
    }, 800);
  }

  triggerDecodeSequence(element, type = 'normal') {
    if (this.decodeInProgress) return;
    
    this.decodeInProgress = true;
    element.classList.add('decoding');
    
    this.dispatchEvent('chaoskey:decode:start', {
      element: element,
      type: type,
      timestamp: Date.now()
    });
    
    // Simulate decode sequence
    setTimeout(() => {
      this.dispatchEvent('chaoskey:decode:success', {
        element: element,
        type: type,
        fragment: this.generateLoreFragment()
      });
      
      element.classList.remove('decoding');
      this.decodeInProgress = false;
    }, 1500);
  }

  handleRelicEvolution(type, data) {
    const evolutionData = {
      type: type,
      timestamp: Date.now(),
      data: data,
      evolutionLevel: this.calculateEvolutionLevel(type),
      consciousness: this.calculateConsciousness(type, data)
    };
    
    this.dispatchEvent('chaoskey:relic:mutate', evolutionData);
    this.saveRelicData(evolutionData);
  }

  // Simulation methods
  simulateDecodeSequence() {
    const elements = Array.from(this.glyphElements.values());
    if (elements.length > 0) {
      const randomElement = elements[Math.floor(Math.random() * elements.length)];
      this.triggerDecodeSequence(randomElement, 'simulation');
    }
  }

  simulateRelicMutation() {
    const mutations = ['awakening', 'evolution', 'consciousness_shift'];
    const randomMutation = mutations[Math.floor(Math.random() * mutations.length)];
    
    this.handleRelicEvolution(randomMutation, {
      simulated: true,
      intensity: Math.random()
    });
  }

  simulateBassHit() {
    // Simulate a strong bass hit for testing
    if (this.echoLayer) {
      this.echoLayer.processBassData(0.8 + Math.random() * 0.2);
    }
  }

  // Utility methods
  dispatchEvent(eventName, detail) {
    const event = new CustomEvent(eventName, { detail });
    document.dispatchEvent(event);
  }

  calculateDistance(pos1, pos2) {
    return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
  }

  getElementCenter(element) {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }

  calculateEvolutionLevel(type) {
    const current = this.relicData.evolutionLevel || 0;
    const increments = {
      'connection': 1,
      'minted': 2,
      'awakening': 3,
      'evolution': 5
    };
    return Math.min(current + (increments[type] || 0), 10);
  }

  calculateConsciousness(type, data) {
    if (type === 'minted' || type === 'connection') return 'awakening';
    if (type === 'evolution' || (data && data.intensity > 0.7)) return 'evolved';
    return this.relicData.consciousness || 'dormant';
  }

  generateLoreFragment() {
    const fragments = [
      'The vault remembers...',
      'Echoes of ancient codes...',
      'ChaosKey consciousness stirs...',
      'Legacy patterns emerge...',
      'The relic evolves...',
      'Temporal memories surface...'
    ];
    return fragments[Math.floor(Math.random() * fragments.length)];
  }

  loadRelicData() {
    try {
      const saved = localStorage.getItem('chaoskey:relic-state');
      return saved ? JSON.parse(saved) : { evolutionLevel: 0, consciousness: 'dormant' };
    } catch (error) {
      return { evolutionLevel: 0, consciousness: 'dormant' };
    }
  }

  saveRelicData(data) {
    try {
      const current = this.loadRelicData();
      const updated = { ...current, ...data };
      localStorage.setItem('chaoskey:relic-state', JSON.stringify(updated));
    } catch (error) {
      console.warn('Failed to save relic data:', error);
    }
  }
}

// Initialize when script loads
let temporalEchoIntegration;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    temporalEchoIntegration = new TemporalEchoIntegration();
  });
} else {
  temporalEchoIntegration = new TemporalEchoIntegration();
}

// Global exposure for debugging
window.temporalEchoIntegration = temporalEchoIntegration;