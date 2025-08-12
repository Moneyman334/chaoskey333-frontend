/**
 * 🌐 Global Push Logic System
 * Ensures all triggered mutations are broadcast across the lore ecosystem in real-time
 */

class GlobalPushLogic {
  constructor() {
    this.pushChannels = new Map();
    this.realTimeConnections = new Set();
    this.broadcastQueue = [];
    this.isProcessingQueue = false;
    this.websocketConnection = null;
    this.eventSource = null;
    this.retryAttempts = 0;
    this.maxRetries = 3;
  }

  /**
   * Initialize the global push system
   */
  initialize() {
    console.log('🌐 Initializing Global Push Logic System...');
    this.setupEventListeners();
    this.initializeRealTimeConnections();
    this.startBroadcastProcessor();
  }

  /**
   * Setup event listeners for global broadcasting
   */
  setupEventListeners() {
    // Listen for mutation broadcasts
    document.addEventListener('globalMutationBroadcast', (event) => {
      this.handleMutationBroadcast(event.detail);
    });

    // Listen for lore ecosystem broadcasts
    document.addEventListener('loreEcosystemBroadcast', (event) => {
      this.handleLoreEcosystemBroadcast(event.detail);
    });

    // Listen for vault pulse events
    document.addEventListener('vaultBroadcastPulse', (event) => {
      this.handleVaultPulseBroadcast(event.detail);
    });

    // Listen for real-time connection status
    document.addEventListener('realTimeConnectionStatus', (event) => {
      this.handleConnectionStatus(event.detail);
    });
  }

  /**
   * Initialize real-time connections (WebSocket, SSE)
   */
  initializeRealTimeConnections() {
    console.log('🔌 Initializing real-time connections...');
    
    // Try WebSocket first
    this.initializeWebSocket();
    
    // Fallback to Server-Sent Events
    setTimeout(() => {
      if (!this.websocketConnection || this.websocketConnection.readyState !== WebSocket.OPEN) {
        this.initializeServerSentEvents();
      }
    }, 5000);
  }

  /**
   * Initialize WebSocket connection
   */
  initializeWebSocket() {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/mutations`;
      
      this.websocketConnection = new WebSocket(wsUrl);
      
      this.websocketConnection.onopen = () => {
        console.log('🔌 WebSocket connection established');
        this.realTimeConnections.add('websocket');
        this.retryAttempts = 0;
        this.sendConnectionHandshake();
      };
      
      this.websocketConnection.onmessage = (event) => {
        this.handleIncomingMessage('websocket', event.data);
      };
      
      this.websocketConnection.onclose = () => {
        console.log('🔌 WebSocket connection closed');
        this.realTimeConnections.delete('websocket');
        this.handleConnectionLoss('websocket');
      };
      
      this.websocketConnection.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.handleConnectionError('websocket', error);
      };
      
    } catch (error) {
      console.error('❌ Failed to initialize WebSocket:', error);
    }
  }

  /**
   * Initialize Server-Sent Events
   */
  initializeServerSentEvents() {
    try {
      this.eventSource = new EventSource('/sse/mutations');
      
      this.eventSource.onopen = () => {
        console.log('📡 Server-Sent Events connection established');
        this.realTimeConnections.add('sse');
      };
      
      this.eventSource.onmessage = (event) => {
        this.handleIncomingMessage('sse', event.data);
      };
      
      this.eventSource.onerror = (error) => {
        console.error('❌ SSE error:', error);
        this.handleConnectionError('sse', error);
      };
      
    } catch (error) {
      console.error('❌ Failed to initialize SSE:', error);
    }
  }

  /**
   * Send connection handshake
   */
  sendConnectionHandshake() {
    const handshake = {
      type: 'handshake',
      clientId: this.generateClientId(),
      timestamp: Date.now(),
      capabilities: ['mutations', 'lore_ecosystem', 'vault_pulses'],
      version: '1.0.0'
    };
    
    this.sendRealTimeMessage(handshake);
  }

  /**
   * Generate unique client ID
   */
  generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Handle mutation broadcast
   */
  handleMutationBroadcast(mutationData) {
    console.log('🧬 Processing mutation broadcast:', mutationData);
    
    const broadcastPayload = {
      type: 'mutation_broadcast',
      data: mutationData,
      timestamp: Date.now(),
      priority: 'high',
      targets: ['lore_ecosystem', 'vault_network', 'external_systems']
    };
    
    this.queueBroadcast(broadcastPayload);
  }

  /**
   * Handle lore ecosystem broadcast
   */
  handleLoreEcosystemBroadcast(loreData) {
    console.log('🌌 Processing lore ecosystem broadcast:', loreData);
    
    const broadcastPayload = {
      type: 'lore_broadcast',
      data: loreData,
      timestamp: Date.now(),
      priority: 'medium',
      targets: ['lore_network', 'narrative_systems', 'cosmic_registry']
    };
    
    this.queueBroadcast(broadcastPayload);
  }

  /**
   * Handle vault pulse broadcast
   */
  handleVaultPulseBroadcast(pulseData) {
    console.log('💫 Processing vault pulse broadcast:', pulseData);
    
    const broadcastPayload = {
      type: 'vault_pulse',
      data: pulseData,
      timestamp: Date.now(),
      priority: 'medium',
      targets: ['vault_network', 'pulse_monitors', 'energy_grid']
    };
    
    this.queueBroadcast(broadcastPayload);
  }

  /**
   * Queue broadcast for processing
   */
  queueBroadcast(payload) {
    this.broadcastQueue.push({
      ...payload,
      id: this.generateBroadcastId(),
      queuedAt: Date.now(),
      attempts: 0
    });
    
    console.log(`📤 Broadcast queued: ${payload.type} (queue size: ${this.broadcastQueue.length})`);
    
    // Process queue if not already processing
    if (!this.isProcessingQueue) {
      this.processBroadcastQueue();
    }
  }

  /**
   * Generate unique broadcast ID
   */
  generateBroadcastId() {
    return `broadcast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Start broadcast queue processor
   */
  startBroadcastProcessor() {
    // Process queue every 2 seconds
    setInterval(() => {
      if (!this.isProcessingQueue && this.broadcastQueue.length > 0) {
        this.processBroadcastQueue();
      }
    }, 2000);
  }

  /**
   * Process broadcast queue
   */
  async processBroadcastQueue() {
    if (this.isProcessingQueue || this.broadcastQueue.length === 0) {
      return;
    }
    
    this.isProcessingQueue = true;
    console.log(`🔄 Processing broadcast queue (${this.broadcastQueue.length} items)`);
    
    while (this.broadcastQueue.length > 0) {
      const broadcast = this.broadcastQueue.shift();
      
      try {
        await this.executeBroadcast(broadcast);
        console.log(`✅ Broadcast executed: ${broadcast.id}`);
      } catch (error) {
        console.error(`❌ Broadcast failed: ${broadcast.id}`, error);
        this.handleBroadcastFailure(broadcast, error);
      }
      
      // Small delay between broadcasts to prevent overwhelming
      await this.delay(100);
    }
    
    this.isProcessingQueue = false;
    console.log('✅ Broadcast queue processing complete');
  }

  /**
   * Execute a single broadcast
   */
  async executeBroadcast(broadcast) {
    broadcast.attempts++;
    
    // Send via real-time connections
    await this.sendRealTimeBroadcast(broadcast);
    
    // Send via HTTP POST for reliability
    await this.sendHttpBroadcast(broadcast);
    
    // Send via external webhook if configured
    await this.sendWebhookBroadcast(broadcast);
    
    // Dispatch local event for other systems
    this.dispatchLocalBroadcast(broadcast);
  }

  /**
   * Send broadcast via real-time connections
   */
  async sendRealTimeBroadcast(broadcast) {
    const message = {
      action: 'broadcast',
      payload: broadcast,
      timestamp: Date.now()
    };
    
    this.sendRealTimeMessage(message);
  }

  /**
   * Send message via real-time connections
   */
  sendRealTimeMessage(message) {
    const messageStr = JSON.stringify(message);
    
    // Send via WebSocket if available
    if (this.websocketConnection && this.websocketConnection.readyState === WebSocket.OPEN) {
      this.websocketConnection.send(messageStr);
      console.log('📤 Message sent via WebSocket');
    }
    
    // Note: SSE is receive-only, so we can't send via SSE
  }

  /**
   * Send broadcast via HTTP POST
   */
  async sendHttpBroadcast(broadcast) {
    try {
      const response = await fetch('/api/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(broadcast)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      console.log('📤 Broadcast sent via HTTP');
    } catch (error) {
      console.warn('⚠️ HTTP broadcast failed:', error);
      throw error;
    }
  }

  /**
   * Send broadcast via webhook
   */
  async sendWebhookBroadcast(broadcast) {
    const webhookUrl = localStorage.getItem('globalPushWebhook');
    if (!webhookUrl) return;
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'relic_evolution_broadcast',
          data: broadcast
        })
      });
      
      if (!response.ok) {
        throw new Error(`Webhook ${response.status}: ${response.statusText}`);
      }
      
      console.log('📤 Broadcast sent via webhook');
    } catch (error) {
      console.warn('⚠️ Webhook broadcast failed:', error);
      // Don't throw - webhook is optional
    }
  }

  /**
   * Dispatch local broadcast event
   */
  dispatchLocalBroadcast(broadcast) {
    const localEvent = new CustomEvent('globalBroadcastExecuted', {
      detail: broadcast
    });
    document.dispatchEvent(localEvent);
  }

  /**
   * Handle broadcast failure
   */
  handleBroadcastFailure(broadcast, error) {
    if (broadcast.attempts < this.maxRetries) {
      // Re-queue for retry
      setTimeout(() => {
        this.broadcastQueue.unshift(broadcast);
        console.log(`🔄 Broadcast re-queued for retry: ${broadcast.id}`);
      }, broadcast.attempts * 1000); // Exponential backoff
    } else {
      console.error(`❌ Broadcast failed permanently: ${broadcast.id}`, error);
      
      // Dispatch failure event
      const failureEvent = new CustomEvent('globalBroadcastFailed', {
        detail: { broadcast, error: error.message }
      });
      document.dispatchEvent(failureEvent);
    }
  }

  /**
   * Handle incoming real-time message
   */
  handleIncomingMessage(connectionType, messageData) {
    try {
      const message = JSON.parse(messageData);
      console.log(`📥 Received message via ${connectionType}:`, message);
      
      // Dispatch received message event
      const messageEvent = new CustomEvent('globalPushMessageReceived', {
        detail: { connectionType, message }
      });
      document.dispatchEvent(messageEvent);
      
    } catch (error) {
      console.error('❌ Failed to parse incoming message:', error);
    }
  }

  /**
   * Handle connection status changes
   */
  handleConnectionStatus(statusData) {
    console.log('🔌 Connection status update:', statusData);
    
    if (statusData.connected) {
      this.realTimeConnections.add(statusData.type);
    } else {
      this.realTimeConnections.delete(statusData.type);
    }
  }

  /**
   * Handle connection loss
   */
  handleConnectionLoss(connectionType) {
    console.log(`🔌 Connection lost: ${connectionType}`);
    
    if (this.retryAttempts < this.maxRetries) {
      this.retryAttempts++;
      const delay = this.retryAttempts * 2000; // Exponential backoff
      
      setTimeout(() => {
        console.log(`🔄 Retrying ${connectionType} connection (attempt ${this.retryAttempts})`);
        if (connectionType === 'websocket') {
          this.initializeWebSocket();
        } else if (connectionType === 'sse') {
          this.initializeServerSentEvents();
        }
      }, delay);
    }
  }

  /**
   * Handle connection error
   */
  handleConnectionError(connectionType, error) {
    console.error(`❌ Connection error (${connectionType}):`, error);
    this.realTimeConnections.delete(connectionType);
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current push system status
   */
  getStatus() {
    return {
      realTimeConnections: Array.from(this.realTimeConnections),
      queueSize: this.broadcastQueue.length,
      isProcessingQueue: this.isProcessingQueue,
      retryAttempts: this.retryAttempts,
      websocketReady: this.websocketConnection?.readyState === WebSocket.OPEN,
      sseReady: this.eventSource?.readyState === EventSource.OPEN
    };
  }

  /**
   * Cleanup and stop the push system
   */
  stop() {
    if (this.websocketConnection) {
      this.websocketConnection.close();
      this.websocketConnection = null;
    }
    
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    
    this.realTimeConnections.clear();
    console.log('🌐 Global push system stopped');
  }
}

// Export singleton instance
const globalPushLogic = new GlobalPushLogic();

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    globalPushLogic.initialize();
  });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = globalPushLogic;
}

// Export for ES6 modules
if (typeof window !== 'undefined') {
  window.globalPushLogic = globalPushLogic;
}