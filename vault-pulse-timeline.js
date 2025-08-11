// Vault Pulse Timeline Map - Interactive Timeline for Relic Evolution
// ChaosKey333 Vault Historical Navigation System

class VaultPulseTimeline {
  constructor() {
    this.timelineEvents = [];
    this.currentPosition = 0;
    this.isInitialized = false;
    this.replayIntegration = null;
    this.eventTypes = {
      mutation: { icon: '🧬', color: '#ff0080', priority: 3 },
      solver: { icon: '🧠', color: '#0080ff', priority: 2 },
      lore: { icon: '📜', color: '#ffaa00', priority: 2 },
      evolution: { icon: '⚡', color: '#00ff80', priority: 4 },
      creation: { icon: '🌟', color: '#ffffff', priority: 5 },
      transfer: { icon: '🔄', color: '#8080ff', priority: 1 }
    };
    
    this.initializeTimeline();
  }
  
  initializeTimeline() {
    console.log("📊 Initializing Vault Pulse Timeline Map...");
    this.loadHistoricalData();
    this.createTimelineInterface();
    this.setupReplayIntegration();
    this.isInitialized = true;
    console.log("✅ Vault Pulse Timeline Map initialized");
  }
  
  loadHistoricalData() {
    // Load existing timeline data from localStorage or generate sample data
    const savedTimeline = localStorage.getItem('vaultTimeline');
    if (savedTimeline) {
      this.timelineEvents = JSON.parse(savedTimeline);
    } else {
      this.generateSampleTimeline();
    }
    
    console.log("📚 Loaded", this.timelineEvents.length, "timeline events");
  }
  
  generateSampleTimeline() {
    // Generate sample timeline events for demo
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    
    this.timelineEvents = [
      {
        id: 'creation_1',
        type: 'creation',
        timestamp: now - (30 * dayMs),
        title: 'Origin Flare Genesis',
        description: 'First relic emerged from the chaos vault',
        relicId: 'relic_001',
        metadata: { energy: 100, rarity: 'legendary' }
      },
      {
        id: 'mutation_1',
        type: 'mutation',
        timestamp: now - (25 * dayMs),
        title: 'Chaos Spark Mutation',
        description: 'Energy patterns shifted, unlocking chaos resonance',
        relicId: 'relic_001',
        metadata: { mutationLevel: 1, newAbilities: ['chaos_spark'] }
      },
      {
        id: 'solver_1',
        type: 'solver',
        timestamp: now - (20 * dayMs),
        title: 'Solver Imprint: Echo-7',
        description: 'Advanced AI solver left permanent neural imprint',
        relicId: 'relic_001',
        metadata: { solverType: 'Echo-7', complexity: 847 }
      },
      {
        id: 'lore_1',
        type: 'lore',
        timestamp: now - (15 * dayMs),
        title: 'Ancient Protocol Fragment',
        description: 'Discovered fragment of pre-chaos vault protocols',
        relicId: 'relic_001',
        metadata: { fragmentId: 'protocol_alpha', age: 'ancient' }
      },
      {
        id: 'evolution_1',
        type: 'evolution',
        timestamp: now - (10 * dayMs),
        title: 'Ascension to Vault Guardian',
        description: 'Complete evolutionary transformation achieved',
        relicId: 'relic_001',
        metadata: { evolutionStage: 'guardian', powerLevel: 9001 }
      },
      {
        id: 'transfer_1',
        type: 'transfer',
        timestamp: now - (5 * dayMs),
        title: 'Vault Transfer Event',
        description: 'Relic transferred to new cosmic address',
        relicId: 'relic_001',
        metadata: { fromAddress: '0x...1234', toAddress: '0x...5678' }
      }
    ];
    
    // Sort by timestamp
    this.timelineEvents.sort((a, b) => a.timestamp - b.timestamp);
  }
  
  createTimelineInterface() {
    // Create timeline interface and inject into page
    const timelineContainer = document.createElement('div');
    timelineContainer.id = 'vaultTimelineContainer';
    timelineContainer.innerHTML = this.generateTimelineHTML();
    
    // Add timeline styles
    this.injectTimelineStyles();
    
    // Find a good place to insert the timeline
    const targetElement = document.querySelector('.evolution-viewer') || document.body;
    targetElement.parentNode.insertBefore(timelineContainer, targetElement.nextSibling);
    
    // Setup event listeners
    this.setupTimelineEvents();
  }
  
  generateTimelineHTML() {
    const events = this.timelineEvents;
    const timelineWidth = 800;
    const totalDuration = events.length > 0 ? 
      events[events.length - 1].timestamp - events[0].timestamp : 
      30 * 24 * 60 * 60 * 1000; // 30 days fallback
    
    let eventsHTML = '';
    
    events.forEach((event, index) => {
      const eventType = this.eventTypes[event.type] || this.eventTypes.mutation;
      const position = events.length > 1 ? 
        ((event.timestamp - events[0].timestamp) / totalDuration) * 100 : 
        (index / Math.max(events.length - 1, 1)) * 100;
      
      eventsHTML += `
        <div class="timeline-event" 
             data-event-id="${event.id}"
             data-event-type="${event.type}"
             style="left: ${position}%;"
             onclick="jumpToTimelineEvent('${event.id}')">
          <div class="event-marker" style="background-color: ${eventType.color};">
            ${eventType.icon}
          </div>
          <div class="event-tooltip">
            <h4>${event.title}</h4>
            <p>${event.description}</p>
            <small>${this.formatDate(event.timestamp)}</small>
          </div>
        </div>
      `;
    });
    
    return `
      <div class="vault-timeline-map">
        <div class="timeline-header">
          <h3>🗺️ Vault Pulse Timeline Map</h3>
          <div class="timeline-controls">
            <button class="timeline-btn" onclick="zoomTimelineIn()">🔍+ Zoom In</button>
            <button class="timeline-btn" onclick="zoomTimelineOut()">🔍- Zoom Out</button>
            <button class="timeline-btn" onclick="centerTimeline()">🎯 Center</button>
            <button class="timeline-btn" onclick="exportTimelineData()">💾 Export</button>
          </div>
        </div>
        
        <div class="timeline-legend">
          <div class="legend-item">
            <span class="legend-icon" style="background: ${this.eventTypes.creation.color};">${this.eventTypes.creation.icon}</span>
            <span>Creation</span>
          </div>
          <div class="legend-item">
            <span class="legend-icon" style="background: ${this.eventTypes.mutation.color};">${this.eventTypes.mutation.icon}</span>
            <span>Mutation</span>
          </div>
          <div class="legend-item">
            <span class="legend-icon" style="background: ${this.eventTypes.solver.color};">${this.eventTypes.solver.icon}</span>
            <span>Solver</span>
          </div>
          <div class="legend-item">
            <span class="legend-icon" style="background: ${this.eventTypes.lore.color};">${this.eventTypes.lore.icon}</span>
            <span>Lore</span>
          </div>
          <div class="legend-item">
            <span class="legend-icon" style="background: ${this.eventTypes.evolution.color};">${this.eventTypes.evolution.icon}</span>
            <span>Evolution</span>
          </div>
        </div>
        
        <div class="timeline-viewport">
          <div class="timeline-track">
            <div class="timeline-background"></div>
            <div class="timeline-events">
              ${eventsHTML}
            </div>
            <div class="timeline-cursor" id="timelineCursor"></div>
          </div>
        </div>
        
        <div class="timeline-info">
          <div class="current-event-info" id="currentEventInfo">
            <h4>Select an event to view details</h4>
            <p>Click on any timeline marker to jump to that moment in relic history.</p>
          </div>
        </div>
      </div>
    `;
  }
  
  injectTimelineStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .vault-timeline-map {
        background: rgba(16, 33, 62, 0.9);
        border: 2px solid #00ffff;
        border-radius: 10px;
        padding: 20px;
        margin: 20px 0;
        color: #00ffff;
        font-family: 'Courier New', monospace;
      }
      
      .timeline-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        border-bottom: 1px solid #333;
        padding-bottom: 10px;
      }
      
      .timeline-header h3 {
        margin: 0;
        color: #00ffff;
      }
      
      .timeline-controls {
        display: flex;
        gap: 8px;
      }
      
      .timeline-btn {
        background: linear-gradient(45deg, #0066cc, #0088ff);
        color: #fff;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
        font-weight: bold;
        transition: all 0.2s ease;
      }
      
      .timeline-btn:hover {
        background: linear-gradient(45deg, #0088ff, #00aaff);
        transform: scale(1.05);
      }
      
      .timeline-legend {
        display: flex;
        gap: 15px;
        margin-bottom: 15px;
        flex-wrap: wrap;
      }
      
      .legend-item {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 12px;
        color: #aaffff;
      }
      
      .legend-icon {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        color: #000;
        font-weight: bold;
      }
      
      .timeline-viewport {
        background: rgba(0, 0, 0, 0.5);
        border: 1px solid #333;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 15px;
        overflow-x: auto;
        min-height: 120px;
      }
      
      .timeline-track {
        position: relative;
        height: 80px;
        min-width: 800px;
      }
      
      .timeline-background {
        position: absolute;
        top: 35px;
        left: 0;
        right: 0;
        height: 10px;
        background: linear-gradient(90deg, #333, #555, #333);
        border-radius: 5px;
      }
      
      .timeline-events {
        position: relative;
        height: 100%;
      }
      
      .timeline-event {
        position: absolute;
        top: 0;
        transform: translateX(-50%);
        cursor: pointer;
      }
      
      .event-marker {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: #000;
        font-weight: bold;
        margin: 25px auto 5px;
        border: 2px solid #000;
        transition: all 0.3s ease;
        position: relative;
        z-index: 2;
      }
      
      .timeline-event:hover .event-marker {
        transform: scale(1.3);
        box-shadow: 0 0 15px currentColor;
        z-index: 3;
      }
      
      .event-tooltip {
        position: absolute;
        bottom: 90px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.95);
        color: #00ffff;
        padding: 10px;
        border-radius: 8px;
        border: 1px solid #00ffff;
        min-width: 200px;
        max-width: 300px;
        font-size: 11px;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
        z-index: 10;
      }
      
      .timeline-event:hover .event-tooltip {
        opacity: 1;
      }
      
      .event-tooltip h4 {
        margin: 0 0 5px 0;
        color: #fff;
        font-size: 12px;
      }
      
      .event-tooltip p {
        margin: 0 0 5px 0;
        color: #aaffff;
      }
      
      .event-tooltip small {
        color: #666;
      }
      
      .timeline-cursor {
        position: absolute;
        top: 20px;
        width: 3px;
        height: 50px;
        background: #ff0080;
        border-radius: 1.5px;
        left: 0%;
        transition: left 0.3s ease;
        box-shadow: 0 0 10px #ff0080;
      }
      
      .timeline-info {
        background: rgba(0, 0, 0, 0.3);
        border-radius: 8px;
        padding: 15px;
      }
      
      .current-event-info h4 {
        margin: 0 0 8px 0;
        color: #00ffff;
      }
      
      .current-event-info p {
        margin: 0;
        color: #aaffff;
        font-size: 12px;
        line-height: 1.4;
      }
      
      .timeline-event.active .event-marker {
        transform: scale(1.4);
        box-shadow: 0 0 20px currentColor;
        animation: pulse-marker 2s infinite;
      }
      
      @keyframes pulse-marker {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
    `;
    
    document.head.appendChild(style);
  }
  
  setupTimelineEvents() {
    // Setup click handlers and other interactive events
    console.log("🎮 Setting up timeline event handlers");
  }
  
  setupReplayIntegration() {
    // Listen for replay terminal events
    window.addEventListener('cosmicEvolution', (event) => {
      this.recordEvolutionEvent(event.detail.replayState);
    });
    
    // Check for existing replay terminal
    if (window.cosmicTerminal) {
      this.replayIntegration = window.cosmicTerminal;
      console.log("🔗 Timeline integrated with Replay Terminal");
    }
  }
  
  recordEvolutionEvent(replayState) {
    // Record a new evolution event from the replay system
    const eventId = 'auto_' + Date.now();
    const newEvent = {
      id: eventId,
      type: 'evolution',
      timestamp: Date.now(),
      title: 'Auto-Saved Evolution',
      description: `Evolution captured at ${this.formatTime(replayState.currentTime)}`,
      relicId: replayState.relic?.id || 'current',
      metadata: {
        replayTime: replayState.currentTime,
        mutations: replayState.mutations,
        autoSaved: true,
        chainedFrom: 'PR8'
      }
    };
    
    this.addEvent(newEvent);
    console.log("📊 Recorded evolution event:", eventId);
  }
  
  addEvent(event) {
    this.timelineEvents.push(event);
    this.timelineEvents.sort((a, b) => a.timestamp - b.timestamp);
    
    // Save to localStorage
    this.saveTimelineData();
    
    // Refresh the timeline display
    this.refreshTimeline();
  }
  
  jumpToEvent(eventId) {
    const event = this.timelineEvents.find(e => e.id === eventId);
    if (!event) return;
    
    // Update current position
    this.currentPosition = this.timelineEvents.indexOf(event);
    
    // Update timeline cursor
    this.updateTimelineCursor();
    
    // Show event details
    this.showEventDetails(event);
    
    // If integrated with replay terminal, sync the jump
    if (this.replayIntegration && event.metadata.replayTime) {
      this.replayIntegration.currentTime = event.metadata.replayTime;
      this.replayIntegration.updateDisplay();
    }
    
    console.log("🎯 Jumped to timeline event:", event.title);
  }
  
  updateTimelineCursor() {
    const cursor = document.getElementById('timelineCursor');
    if (!cursor || this.timelineEvents.length === 0) return;
    
    const position = this.timelineEvents.length > 1 ? 
      (this.currentPosition / (this.timelineEvents.length - 1)) * 100 : 
      0;
    
    cursor.style.left = position + '%';
  }
  
  showEventDetails(event) {
    const infoElement = document.getElementById('currentEventInfo');
    if (!infoElement) return;
    
    const eventType = this.eventTypes[event.type] || this.eventTypes.mutation;
    
    infoElement.innerHTML = `
      <h4>${eventType.icon} ${event.title}</h4>
      <p><strong>Type:</strong> ${event.type.charAt(0).toUpperCase() + event.type.slice(1)}</p>
      <p><strong>Description:</strong> ${event.description}</p>
      <p><strong>Date:</strong> ${this.formatDate(event.timestamp)}</p>
      ${event.metadata.replayTime ? `<p><strong>Replay Time:</strong> ${this.formatTime(event.metadata.replayTime)}</p>` : ''}
      ${event.metadata.mutations !== undefined ? `<p><strong>Mutations:</strong> ${event.metadata.mutations}</p>` : ''}
      ${event.metadata.autoSaved ? `<p><strong>Auto-Saved:</strong> ✅ Yes</p>` : ''}
    `;
    
    // Highlight the active event
    document.querySelectorAll('.timeline-event').forEach(el => {
      el.classList.remove('active');
    });
    
    const activeEvent = document.querySelector(`[data-event-id="${event.id}"]`);
    if (activeEvent) {
      activeEvent.classList.add('active');
    }
  }
  
  refreshTimeline() {
    // Regenerate and replace the timeline
    const container = document.getElementById('vaultTimelineContainer');
    if (container) {
      container.innerHTML = this.generateTimelineHTML();
      this.setupTimelineEvents();
    }
  }
  
  saveTimelineData() {
    localStorage.setItem('vaultTimeline', JSON.stringify(this.timelineEvents));
  }
  
  exportTimelineData() {
    const exportData = {
      version: '1.0',
      timestamp: Date.now(),
      events: this.timelineEvents,
      metadata: {
        totalEvents: this.timelineEvents.length,
        eventTypes: Object.keys(this.eventTypes),
        exportedBy: 'VaultPulseTimeline'
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `vault-timeline-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log("💾 Timeline data exported");
  }
  
  formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

// Global functions for timeline controls
function jumpToTimelineEvent(eventId) {
  if (window.vaultTimeline) {
    window.vaultTimeline.jumpToEvent(eventId);
  }
}

function zoomTimelineIn() {
  // Implement timeline zoom functionality
  console.log("🔍 Zooming timeline in");
}

function zoomTimelineOut() {
  // Implement timeline zoom functionality
  console.log("🔍 Zooming timeline out");
}

function centerTimeline() {
  // Center timeline on current position
  console.log("🎯 Centering timeline");
}

function exportTimelineData() {
  if (window.vaultTimeline) {
    window.vaultTimeline.exportTimelineData();
  }
}

// Initialize Vault Timeline when page loads
document.addEventListener('DOMContentLoaded', function() {
  // Wait for other components to load first
  setTimeout(() => {
    window.vaultTimeline = new VaultPulseTimeline();
    console.log("🗺️ Vault Pulse Timeline Map loaded and ready");
  }, 1000);
});