// Meta-Update Logs System
class MetaUpdateLogs {
  constructor() {
    this.isLogging = false;
    this.logs = [];
    this.stats = {
      totalEvents: 0,
      totalMutations: 0,
      onChainEvents: 0,
      solverImprints: 0
    };
    this.logLevel = 'all';
    this.logSource = 'all';
    this.autoScroll = true;
    
    this.initializeElements();
    this.bindEvents();
    this.startSystemMonitoring();
  }

  initializeElements() {
    this.logEntries = document.getElementById('logEntries');
    this.systemTimestamp = document.getElementById('systemTimestamp');
    this.startButton = document.getElementById('startLogging');
    this.pauseButton = document.getElementById('pauseLogging');
    this.clearButton = document.getElementById('clearLogs');
    this.exportButton = document.getElementById('exportLogs');
    this.levelFilter = document.getElementById('logLevel');
    this.sourceFilter = document.getElementById('logSource');
    this.autoScrollCheckbox = document.getElementById('autoScroll');
    
    // Stats elements
    this.totalEventsElement = document.getElementById('totalEvents');
    this.totalMutationsElement = document.getElementById('totalMutations');
    this.onChainEventsElement = document.getElementById('onChainEvents');
    this.solverImprintsElement = document.getElementById('solverImprints');
    
    // Flow elements
    this.sourceNode = document.getElementById('sourceNode');
    this.processorNode = document.getElementById('processorNode');
    this.destinationNode = document.getElementById('destinationNode');
    this.eventTimeline = document.getElementById('eventTimeline');
    this.networkName = document.getElementById('networkName');
    
    this.resetFlowButton = document.getElementById('resetFlow');
  }

  bindEvents() {
    this.startButton.addEventListener('click', () => this.startLogging());
    this.pauseButton.addEventListener('click', () => this.pauseLogging());
    this.clearButton.addEventListener('click', () => this.clearLogs());
    this.exportButton.addEventListener('click', () => this.exportLogs());
    this.resetFlowButton.addEventListener('click', () => this.resetFlow());
    
    this.levelFilter.addEventListener('change', (e) => {
      this.logLevel = e.target.value;
      this.filterLogs();
    });
    
    this.sourceFilter.addEventListener('change', (e) => {
      this.logSource = e.target.value;
      this.filterLogs();
    });
    
    this.autoScrollCheckbox.addEventListener('change', (e) => {
      this.autoScroll = e.target.checked;
    });
  }

  startSystemMonitoring() {
    this.updateSystemTimestamp();
    setInterval(() => this.updateSystemTimestamp(), 1000);
    
    // Initialize with system logs
    this.addLog('info', 'system', 'Meta-Update Logs System initialized', { version: '1.0.0' });
    this.addLog('info', 'metadata', 'Metadata propagation engine started');
    this.addLog('info', 'blockchain', 'Blockchain event monitor connected', { network: 'Ethereum Mainnet' });
  }

  updateSystemTimestamp() {
    const now = new Date();
    this.systemTimestamp.textContent = now.toISOString().replace('T', ' ').slice(0, 19);
  }

  startLogging() {
    if (this.isLogging) return;
    
    this.isLogging = true;
    this.startButton.disabled = true;
    this.pauseButton.disabled = false;
    
    this.addLog('info', 'system', 'Active logging started');
    
    // Start simulating events
    this.startEventSimulation();
  }

  pauseLogging() {
    this.isLogging = false;
    this.startButton.disabled = false;
    this.pauseButton.disabled = true;
    
    this.addLog('warning', 'system', 'Logging paused');
    
    // Stop event simulation
    this.stopEventSimulation();
  }

  clearLogs() {
    this.logs = [];
    this.logEntries.innerHTML = '';
    this.resetStats();
    this.addLog('info', 'system', 'Log history cleared');
  }

  exportLogs() {
    const exportData = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      logs: this.logs
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chaoskey333-meta-logs-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.addLog('info', 'system', 'Log data exported', { filename: a.download });
  }

  addLog(level, source, message, data = null) {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 23);
    const logEntry = {
      id: Date.now() + Math.random(),
      timestamp,
      level,
      source,
      message,
      data
    };
    
    this.logs.push(logEntry);
    this.updateStats(logEntry);
    
    if (this.shouldShowLog(logEntry)) {
      this.renderLogEntry(logEntry);
    }
  }

  shouldShowLog(logEntry) {
    if (this.logLevel !== 'all' && logEntry.level !== this.logLevel) {
      return false;
    }
    if (this.logSource !== 'all' && logEntry.source !== this.logSource) {
      return false;
    }
    return true;
  }

  renderLogEntry(logEntry) {
    const entryElement = document.createElement('div');
    entryElement.className = 'log-entry';
    entryElement.innerHTML = `
      <span class="log-timestamp">${logEntry.timestamp}</span>
      <span class="log-level ${logEntry.level}">${logEntry.level}</span>
      <span class="log-source">${logEntry.source}</span>
      <span class="log-message">${logEntry.message}</span>
      ${logEntry.data ? `<span class="log-data">${JSON.stringify(logEntry.data)}</span>` : ''}
    `;
    
    this.logEntries.appendChild(entryElement);
    
    if (this.autoScroll) {
      this.logEntries.scrollTop = this.logEntries.scrollHeight;
    }
    
    // Trigger flow visualization based on log type
    this.triggerFlowVisualization(logEntry);
  }

  updateStats(logEntry) {
    this.stats.totalEvents++;
    
    switch (logEntry.source) {
      case 'metadata':
        if (logEntry.message.includes('mutation')) {
          this.stats.totalMutations++;
        }
        break;
      case 'blockchain':
        this.stats.onChainEvents++;
        break;
      case 'solver':
        if (logEntry.message.includes('imprint')) {
          this.stats.solverImprints++;
        }
        break;
    }
    
    this.renderStats();
  }

  renderStats() {
    this.totalEventsElement.textContent = this.stats.totalEvents;
    this.totalMutationsElement.textContent = this.stats.totalMutations;
    this.onChainEventsElement.textContent = this.stats.onChainEvents;
    this.solverImprintsElement.textContent = this.stats.solverImprints;
  }

  resetStats() {
    this.stats = {
      totalEvents: 0,
      totalMutations: 0,
      onChainEvents: 0,
      solverImprints: 0
    };
    this.renderStats();
  }

  filterLogs() {
    this.logEntries.innerHTML = '';
    this.logs.forEach(log => {
      if (this.shouldShowLog(log)) {
        this.renderLogEntry(log);
      }
    });
  }

  startEventSimulation() {
    this.eventSimulationInterval = setInterval(() => {
      if (!this.isLogging) return;
      
      this.simulateRandomEvent();
    }, 2000 + Math.random() * 3000); // Random interval between 2-5 seconds
  }

  stopEventSimulation() {
    if (this.eventSimulationInterval) {
      clearInterval(this.eventSimulationInterval);
    }
  }

  simulateRandomEvent() {
    const eventTypes = [
      {
        level: 'info',
        source: 'metadata',
        message: 'Metadata propagation initiated',
        data: { entityId: this.generateId(), propagationTime: Math.random() * 1000 }
      },
      {
        level: 'info',
        source: 'metadata',
        message: 'Mutation flow detected',
        data: { mutationId: this.generateId(), type: 'structural' }
      },
      {
        level: 'info',
        source: 'blockchain',
        message: 'On-chain event detected',
        data: { txHash: this.generateTxHash(), blockNumber: Math.floor(Math.random() * 1000000) }
      },
      {
        level: 'info',
        source: 'solver',
        message: 'Solver imprint generated',
        data: { solverId: this.generateSolverId(), timestamp: Date.now() }
      },
      {
        level: 'info',
        source: 'evolution',
        message: 'Relic evolution step completed',
        data: { relicId: this.generateId(), step: Math.floor(Math.random() * 4) + 1 }
      },
      {
        level: 'warning',
        source: 'metadata',
        message: 'Propagation delay detected',
        data: { delay: Math.floor(Math.random() * 5000) + 'ms' }
      },
      {
        level: 'error',
        source: 'blockchain',
        message: 'Transaction confirmation timeout',
        data: { txHash: this.generateTxHash() }
      }
    ];
    
    const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    this.addLog(randomEvent.level, randomEvent.source, randomEvent.message, randomEvent.data);
  }

  generateId() {
    return 'CK333-' + Math.random().toString(36).substr(2, 8).toUpperCase();
  }

  generateSolverId() {
    return 'SLVR-' + Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  generateTxHash() {
    return '0x' + Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  triggerFlowVisualization(logEntry) {
    // Activate appropriate flow nodes based on log source
    this.resetFlowAnimation();
    
    setTimeout(() => {
      switch (logEntry.source) {
        case 'metadata':
          this.activateFlowSequence(['source', 'processor']);
          break;
        case 'blockchain':
          this.activateFlowSequence(['processor', 'destination']);
          break;
        case 'evolution':
          this.activateFlowSequence(['source', 'processor', 'destination']);
          break;
        default:
          this.activateFlowSequence(['source']);
      }
    }, 100);
    
    // Add blockchain event to timeline if it's a blockchain event
    if (logEntry.source === 'blockchain') {
      this.addBlockchainEvent(logEntry);
    }
  }

  resetFlowAnimation() {
    [this.sourceNode, this.processorNode, this.destinationNode].forEach(node => {
      node.classList.remove('active');
    });
  }

  activateFlowSequence(nodeNames) {
    nodeNames.forEach((nodeName, index) => {
      setTimeout(() => {
        const nodeElement = this[nodeName + 'Node'];
        if (nodeElement) {
          nodeElement.classList.add('active');
        }
      }, index * 500);
    });
  }

  resetFlow() {
    this.resetFlowAnimation();
    this.addLog('info', 'system', 'Flow visualization reset');
  }

  addBlockchainEvent(logEntry) {
    const eventElement = document.createElement('div');
    eventElement.className = 'blockchain-event';
    
    const eventIcon = this.getEventIcon(logEntry.message);
    const timestamp = new Date().toLocaleTimeString();
    
    eventElement.innerHTML = `
      <div class="event-icon">${eventIcon}</div>
      <div class="event-details">
        <div class="event-type">${this.getEventType(logEntry.message)}</div>
        <div class="event-description">${logEntry.message}</div>
      </div>
      <div class="event-timestamp">${timestamp}</div>
    `;
    
    this.eventTimeline.insertBefore(eventElement, this.eventTimeline.firstChild);
    
    // Keep only last 10 events
    while (this.eventTimeline.children.length > 10) {
      this.eventTimeline.removeChild(this.eventTimeline.lastChild);
    }
  }

  getEventIcon(message) {
    if (message.includes('transaction') || message.includes('tx')) return '₿';
    if (message.includes('mint')) return '⚡';
    if (message.includes('transfer')) return '↔';
    if (message.includes('error') || message.includes('timeout')) return '⚠';
    return '●';
  }

  getEventType(message) {
    if (message.includes('transaction')) return 'TRANSACTION';
    if (message.includes('mint')) return 'MINT';
    if (message.includes('transfer')) return 'TRANSFER';
    if (message.includes('event')) return 'CONTRACT EVENT';
    if (message.includes('error') || message.includes('timeout')) return 'ERROR';
    return 'BLOCKCHAIN EVENT';
  }

  // Public API for external integration
  logMetadataMutation(data) {
    this.addLog('info', 'metadata', 'Metadata mutation triggered', data);
  }

  logBlockchainEvent(txHash, eventType, data) {
    this.addLog('info', 'blockchain', `${eventType} confirmed`, { txHash, ...data });
  }

  logSolverImprint(solverId, imprint) {
    this.addLog('info', 'solver', 'Solver imprint recorded', { solverId, imprint });
  }

  logEvolutionStep(step, relicId) {
    this.addLog('info', 'evolution', `Evolution step ${step} completed`, { relicId });
  }

  logError(source, message, error) {
    this.addLog('error', source, message, { error: error.message });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.metaUpdateLogs = new MetaUpdateLogs();
});

// Expose global API
window.ChaosKey333 = window.ChaosKey333 || {};
window.ChaosKey333.logs = {
  logMetadataMutation: (data) => window.metaUpdateLogs?.logMetadataMutation(data),
  logBlockchainEvent: (txHash, eventType, data) => window.metaUpdateLogs?.logBlockchainEvent(txHash, eventType, data),
  logSolverImprint: (solverId, imprint) => window.metaUpdateLogs?.logSolverImprint(solverId, imprint),
  logEvolutionStep: (step, relicId) => window.metaUpdateLogs?.logEvolutionStep(step, relicId),
  logError: (source, message, error) => window.metaUpdateLogs?.logError(source, message, error)
};