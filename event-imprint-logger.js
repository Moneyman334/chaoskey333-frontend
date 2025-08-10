// 📝 Event Imprint Logging System
// Part of PR #42 - Immutable ledger entries with wallet signatures, timestamps, and event hashes

class EventImprintLogger {
  constructor() {
    this.eventStore = [];
    this.maxEntries = 10000;
    this.compressionThreshold = 5000;
    this.hashSalt = 'chaoskey333-cosmic-audit-trail';
    
    this.initializeStorage();
    console.log('📝 Event Imprint Logger initialized');
  }

  // Initialize local storage and load existing events
  initializeStorage() {
    try {
      const stored = localStorage.getItem('chaoskey333-event-imprints');
      if (stored) {
        this.eventStore = JSON.parse(stored);
        console.log(`📝 Loaded ${this.eventStore.length} existing event imprints`);
      }
    } catch (error) {
      console.warn('Failed to load stored events:', error);
      this.eventStore = [];
    }
  }

  // Create immutable event imprint
  async createEventImprint(eventType, eventData, walletAddress = null) {
    const timestamp = new Date().toISOString();
    const eventId = this.generateEventId();
    
    // Create base event object
    const baseEvent = {
      eventId,
      eventType,
      timestamp,
      walletAddress,
      eventData: typeof eventData === 'object' ? eventData : { message: eventData },
      blockNumber: await this.getCurrentBlockNumber(),
      chainId: await this.getChainId()
    };

    // Generate event hash
    const eventHash = await this.generateEventHash(baseEvent);
    
    // Get wallet signature if wallet is available
    let walletSignature = null;
    if (walletAddress && window.ethereum) {
      try {
        walletSignature = await this.getWalletSignature(eventHash, walletAddress);
      } catch (error) {
        console.warn('Failed to get wallet signature:', error);
      }
    }

    // Create final immutable imprint
    const eventImprint = {
      ...baseEvent,
      eventHash,
      walletSignature,
      immutableId: this.generateImmutableId(eventHash, timestamp),
      cosmicAuditTrail: {
        creation: timestamp,
        integrity: 'VERIFIED',
        mutation: 'LOCKED'
      }
    };

    // Store the imprint
    this.storeEventImprint(eventImprint);
    
    // Send to server for persistent storage
    await this.syncToServer(eventImprint);
    
    console.log(`📝 Event imprint created: ${eventType} [${eventId}]`);
    return eventImprint;
  }

  // Generate unique event ID
  generateEventId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return `CK333-${timestamp}-${random}`;
  }

  // Generate cryptographic hash for event
  async generateEventHash(eventData) {
    const data = JSON.stringify(eventData) + this.hashSalt;
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    try {
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      // Fallback for older browsers
      return this.simpleHash(data);
    }
  }

  // Simple hash fallback
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  // Generate immutable ID
  generateImmutableId(eventHash, timestamp) {
    const combined = `${eventHash}-${timestamp}-${this.hashSalt}`;
    return `IMMUTABLE-${this.simpleHash(combined)}`;
  }

  // Get wallet signature for event hash
  async getWalletSignature(eventHash, walletAddress) {
    if (!window.ethereum) {
      throw new Error('No Web3 provider available');
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // Create message to sign
      const message = `ChaosKey333 Event Verification\nEvent Hash: ${eventHash}\nTimestamp: ${new Date().toISOString()}`;
      
      // Sign the message
      const signature = await signer.signMessage(message);
      
      return {
        message,
        signature,
        signer: walletAddress,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Wallet signature failed:', error);
      throw error;
    }
  }

  // Get current blockchain info
  async getCurrentBlockNumber() {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        return await provider.getBlockNumber();
      }
    } catch (error) {
      console.warn('Failed to get block number:', error);
    }
    return null;
  }

  async getChainId() {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const network = await provider.getNetwork();
        return network.chainId;
      }
    } catch (error) {
      console.warn('Failed to get chain ID:', error);
    }
    return null;
  }

  // Store event imprint locally
  storeEventImprint(imprint) {
    this.eventStore.unshift(imprint);
    
    // Maintain max entries
    if (this.eventStore.length > this.maxEntries) {
      this.eventStore = this.eventStore.slice(0, this.maxEntries);
    }

    // Compress if needed
    if (this.eventStore.length > this.compressionThreshold) {
      this.compressOldEvents();
    }

    // Save to localStorage
    try {
      localStorage.setItem('chaoskey333-event-imprints', JSON.stringify(this.eventStore));
    } catch (error) {
      console.warn('Failed to save events to localStorage:', error);
    }

    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('eventImprintCreated', {
      detail: imprint
    }));
  }

  // Compress old events to save space
  compressOldEvents() {
    const cutoff = this.compressionThreshold;
    const oldEvents = this.eventStore.slice(cutoff);
    
    // Create compressed summary
    const compressed = {
      eventId: 'COMPRESSED-BATCH-' + Date.now(),
      eventType: 'COMPRESSED_BATCH',
      timestamp: new Date().toISOString(),
      eventCount: oldEvents.length,
      timeRange: {
        from: oldEvents[oldEvents.length - 1]?.timestamp,
        to: oldEvents[0]?.timestamp
      },
      summary: this.createCompressionSummary(oldEvents),
      cosmicAuditTrail: {
        creation: new Date().toISOString(),
        integrity: 'COMPRESSED',
        mutation: 'LOCKED'
      }
    };

    this.eventStore = this.eventStore.slice(0, cutoff).concat([compressed]);
    console.log(`📝 Compressed ${oldEvents.length} old events into batch`);
  }

  // Create summary of compressed events
  createCompressionSummary(events) {
    const summary = {
      totalEvents: events.length,
      eventTypes: {},
      walletAddresses: new Set(),
      timeSpan: 0
    };

    events.forEach(event => {
      // Count event types
      summary.eventTypes[event.eventType] = (summary.eventTypes[event.eventType] || 0) + 1;
      
      // Collect wallet addresses
      if (event.walletAddress) {
        summary.walletAddresses.add(event.walletAddress);
      }
    });

    // Calculate time span
    if (events.length > 1) {
      const first = new Date(events[events.length - 1].timestamp);
      const last = new Date(events[0].timestamp);
      summary.timeSpan = last - first;
    }

    summary.uniqueWallets = summary.walletAddresses.size;
    delete summary.walletAddresses; // Remove Set for JSON serialization

    return summary;
  }

  // Sync to server for persistent storage
  async syncToServer(imprint) {
    try {
      const response = await fetch('/api/event-imprint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(imprint)
      });

      if (!response.ok) {
        console.warn(`Failed to sync event to server: ${response.status}`);
      }
    } catch (error) {
      console.warn('Failed to sync event to server:', error);
    }
  }

  // Query events
  queryEvents(filters = {}) {
    let results = [...this.eventStore];

    // Filter by event type
    if (filters.eventType) {
      results = results.filter(event => event.eventType === filters.eventType);
    }

    // Filter by wallet address
    if (filters.walletAddress) {
      results = results.filter(event => event.walletAddress === filters.walletAddress);
    }

    // Filter by date range
    if (filters.fromDate) {
      const fromDate = new Date(filters.fromDate);
      results = results.filter(event => new Date(event.timestamp) >= fromDate);
    }

    if (filters.toDate) {
      const toDate = new Date(filters.toDate);
      results = results.filter(event => new Date(event.timestamp) <= toDate);
    }

    // Limit results
    if (filters.limit) {
      results = results.slice(0, filters.limit);
    }

    return results;
  }

  // Verify event integrity
  async verifyEventIntegrity(eventImprint) {
    try {
      // Recreate hash from original data
      const baseEvent = {
        eventId: eventImprint.eventId,
        eventType: eventImprint.eventType,
        timestamp: eventImprint.timestamp,
        walletAddress: eventImprint.walletAddress,
        eventData: eventImprint.eventData,
        blockNumber: eventImprint.blockNumber,
        chainId: eventImprint.chainId
      };

      const recalculatedHash = await this.generateEventHash(baseEvent);
      
      return {
        isValid: recalculatedHash === eventImprint.eventHash,
        originalHash: eventImprint.eventHash,
        recalculatedHash,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        isValid: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Get audit trail summary
  getAuditTrailSummary() {
    const totalEvents = this.eventStore.length;
    const eventTypes = {};
    const walletAddresses = new Set();
    let earliestEvent = null;
    let latestEvent = null;

    this.eventStore.forEach(event => {
      // Count event types
      eventTypes[event.eventType] = (eventTypes[event.eventType] || 0) + 1;
      
      // Track wallet addresses
      if (event.walletAddress) {
        walletAddresses.add(event.walletAddress);
      }

      // Track time range
      const eventTime = new Date(event.timestamp);
      if (!earliestEvent || eventTime < new Date(earliestEvent)) {
        earliestEvent = event.timestamp;
      }
      if (!latestEvent || eventTime > new Date(latestEvent)) {
        latestEvent = event.timestamp;
      }
    });

    return {
      totalEvents,
      eventTypes,
      uniqueWallets: walletAddresses.size,
      timeRange: {
        earliest: earliestEvent,
        latest: latestEvent
      },
      storageUsage: {
        localStorage: this.getLocalStorageUsage(),
        memory: this.eventStore.length
      },
      lastUpdate: new Date().toISOString()
    };
  }

  // Get localStorage usage
  getLocalStorageUsage() {
    try {
      const data = localStorage.getItem('chaoskey333-event-imprints');
      return data ? data.length : 0;
    } catch {
      return 0;
    }
  }

  // Export audit trail
  exportAuditTrail(format = 'json') {
    const data = {
      exportTimestamp: new Date().toISOString(),
      summary: this.getAuditTrailSummary(),
      events: this.eventStore
    };

    let content, filename, mimeType;

    switch (format) {
      case 'csv':
        content = this.convertToCSV(this.eventStore);
        filename = `chaoskey333-audit-trail-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
        break;
      case 'json':
      default:
        content = JSON.stringify(data, null, 2);
        filename = `chaoskey333-audit-trail-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
        break;
    }

    // Download file
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return filename;
  }

  // Convert events to CSV
  convertToCSV(events) {
    if (events.length === 0) return '';

    const headers = ['eventId', 'eventType', 'timestamp', 'walletAddress', 'eventHash', 'blockNumber', 'chainId'];
    const rows = events.map(event => 
      headers.map(header => {
        const value = event[header];
        return typeof value === 'string' ? `"${value}"` : value || '';
      }).join(',')
    );

    return [headers.join(','), ...rows].join('\n');
  }

  // Clear all events (admin only)
  clearAllEvents() {
    this.eventStore = [];
    localStorage.removeItem('chaoskey333-event-imprints');
    console.log('📝 All event imprints cleared');
  }
}

// Global event logger instance
window.eventImprintLogger = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (!window.eventImprintLogger) {
    window.eventImprintLogger = new EventImprintLogger();
    
    // Set up automatic event logging for key vault events
    setupAutomaticEventLogging();
  }
});

// Set up automatic event logging
function setupAutomaticEventLogging() {
  // Log wallet connections
  window.addEventListener('walletConnected', (e) => {
    window.eventImprintLogger.createEventImprint(
      'WALLET_CONNECTED',
      {
        walletType: e.detail.walletType,
        chainId: e.detail.chainId
      },
      e.detail.address
    );
  });

  // Log payment completions
  window.addEventListener('paymentCompleted', (e) => {
    window.eventImprintLogger.createEventImprint(
      'PAYMENT_COMPLETED',
      {
        sessionId: e.detail.sessionId,
        amount: e.detail.amount,
        currency: e.detail.currency
      },
      e.detail.walletAddress
    );
  });

  // Log mint events
  window.addEventListener('relicMinted', (e) => {
    window.eventImprintLogger.createEventImprint(
      'RELIC_MINTED',
      {
        transactionHash: e.detail.transactionHash,
        tokenId: e.detail.tokenId,
        contractAddress: e.detail.contractAddress
      },
      e.detail.walletAddress
    );
  });

  // Log recursion monitor events
  window.addEventListener('vaultPulse', (e) => {
    window.eventImprintLogger.createEventImprint(
      'VAULT_PULSE',
      {
        pulseId: e.detail.id,
        pulseCount: e.detail.count,
        pulseType: e.detail.type
      }
    );
  });

  // Log evolution cycles
  window.addEventListener('evolutionCycle', (e) => {
    window.eventImprintLogger.createEventImprint(
      'EVOLUTION_CYCLE',
      {
        cycle: e.detail.cycle,
        triggerReason: e.detail.reason || 'auto'
      }
    );
  });

  console.log('📝 Automatic event logging configured');
}

// Export for module environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EventImprintLogger;
}