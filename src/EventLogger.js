/**
 * Event Logger - Failsafe & Continuity System
 * Handles immutable logging with timestamps and transaction hashes for the Apex Node Ignition Protocol
 */

class EventLogger {
  constructor() {
    this.isActive = false;
    this.logStorage = new Map();
    this.replayBuffer = [];
    this.maxLogEntries = 10000;
    this.currentSession = null;
    this.sessionId = null;
    this.immutableLogs = [];
    this.blockchainLogs = [];
  }

  /**
   * Initialize the Event Logger
   */
  async initialize() {
    try {
      console.log("📝 Initializing Event Logger...");
      
      this.sessionId = this.generateSessionId();
      this.currentSession = {
        id: this.sessionId,
        startTime: Date.now(),
        events: [],
        status: 'ACTIVE'
      };

      // Load existing logs from localStorage
      await this.loadExistingLogs();
      
      // Initialize immutable logging
      this.initializeImmutableLogging();
      
      this.isActive = true;
      
      // Log the initialization
      this.log('EVENT_LOGGER_INITIALIZED', {
        sessionId: this.sessionId,
        timestamp: Date.now(),
        version: '1.0'
      });

      console.log("✅ Event Logger initialized");
      return true;
    } catch (error) {
      console.error("❌ Event Logger initialization failed:", error);
      return false;
    }
  }

  /**
   * Log an event with immutable timestamp and optional transaction hash
   */
  log(eventType, eventData = {}) {
    if (!this.isActive) {
      console.warn("⚠️ Event Logger not active, dropping event:", eventType);
      return null;
    }

    try {
      const logEntry = this.createLogEntry(eventType, eventData);
      
      // Add to current session
      this.currentSession.events.push(logEntry);
      
      // Add to main log storage
      this.logStorage.set(logEntry.id, logEntry);
      
      // Add to replay buffer
      this.replayBuffer.push(logEntry);
      
      // Add to immutable logs
      this.immutableLogs.push(logEntry);
      
      // Persist to localStorage
      this.persistLogs();
      
      // Maintain log size limits
      this.maintainLogLimits();
      
      console.log(`📝 Logged: ${eventType}`, logEntry);
      return logEntry;
      
    } catch (error) {
      console.error("❌ Failed to log event:", error);
      return null;
    }
  }

  /**
   * Create a structured log entry
   */
  createLogEntry(eventType, eventData) {
    const timestamp = Date.now();
    const logEntry = {
      id: this.generateLogId(),
      sessionId: this.sessionId,
      eventType,
      timestamp,
      immutableTimestamp: this.createImmutableTimestamp(timestamp),
      data: this.sanitizeEventData(eventData),
      hash: null,
      transactionHash: eventData.transactionHash || null,
      blockNumber: eventData.blockNumber || null,
      confirmations: eventData.confirmations || 0,
      status: 'LOGGED',
      replayable: true
    };

    // Generate hash for integrity
    logEntry.hash = this.generateEventHash(logEntry);
    
    return logEntry;
  }

  /**
   * Create immutable timestamp with multiple verification sources
   */
  createImmutableTimestamp(timestamp) {
    return {
      local: timestamp,
      iso: new Date(timestamp).toISOString(),
      unix: Math.floor(timestamp / 1000),
      block: Date.now(), // In real implementation, would get from blockchain
      signature: this.signTimestamp(timestamp)
    };
  }

  /**
   * Sign timestamp for immutability verification
   */
  async signTimestamp(timestamp) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(timestamp.toString() + this.sessionId + "IMMUTABLE_SEAL");
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error("Failed to sign timestamp:", error);
      return `FALLBACK_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  /**
   * Sanitize event data to prevent circular references and ensure serializability
   */
  sanitizeEventData(data) {
    try {
      // Create a deep copy and sanitize
      const sanitized = JSON.parse(JSON.stringify(data, (key, value) => {
        // Skip functions and DOM elements
        if (typeof value === 'function' || 
            (value && typeof value === 'object' && value.nodeType)) {
          return '[EXCLUDED]';
        }
        return value;
      }));
      
      return sanitized;
    } catch (error) {
      console.error("Failed to sanitize event data:", error);
      return { error: 'DATA_SANITIZATION_FAILED', original: String(data) };
    }
  }

  /**
   * Generate event hash for integrity verification
   */
  async generateEventHash(logEntry) {
    try {
      const hashData = {
        id: logEntry.id,
        sessionId: logEntry.sessionId,
        eventType: logEntry.eventType,
        timestamp: logEntry.timestamp,
        data: logEntry.data
      };
      
      const encoder = new TextEncoder();
      const data = encoder.encode(JSON.stringify(hashData));
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error("Failed to generate event hash:", error);
      return `HASH_FAIL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  /**
   * Log blockchain transaction with full details
   */
  async logTransaction(transactionHash, eventType, additionalData = {}) {
    try {
      const transactionLog = {
        transactionHash,
        eventType,
        timestamp: Date.now(),
        blockNumber: additionalData.blockNumber || 'PENDING',
        confirmations: additionalData.confirmations || 0,
        gasUsed: additionalData.gasUsed || null,
        gasPrice: additionalData.gasPrice || null,
        status: additionalData.status || 'PENDING',
        ...additionalData
      };

      this.blockchainLogs.push(transactionLog);
      
      // Also log as regular event
      this.log(eventType, {
        ...transactionLog,
        category: 'BLOCKCHAIN_TRANSACTION'
      });

      console.log("⛓️ Blockchain transaction logged:", transactionHash);
      return transactionLog;
      
    } catch (error) {
      console.error("❌ Failed to log blockchain transaction:", error);
      return null;
    }
  }

  /**
   * Initialize immutable logging system
   */
  initializeImmutableLogging() {
    // Start periodic integrity checks
    setInterval(() => {
      this.verifyLogIntegrity();
    }, 30000); // Check every 30 seconds

    // Start automatic backup
    setInterval(() => {
      this.backupLogs();
    }, 300000); // Backup every 5 minutes
  }

  /**
   * Verify log integrity
   */
  async verifyLogIntegrity() {
    try {
      let corruptedLogs = 0;
      
      for (const [id, logEntry] of this.logStorage) {
        const recalculatedHash = await this.generateEventHash(logEntry);
        if (recalculatedHash !== logEntry.hash) {
          console.warn("⚠️ Log integrity violation detected:", id);
          corruptedLogs++;
        }
      }

      if (corruptedLogs === 0) {
        console.log("✅ Log integrity verification passed");
      } else {
        console.error(`❌ ${corruptedLogs} corrupted logs detected`);
        this.log('LOG_INTEGRITY_VIOLATION', { corruptedCount: corruptedLogs });
      }
      
    } catch (error) {
      console.error("❌ Log integrity verification failed:", error);
    }
  }

  /**
   * Backup logs to multiple storage locations
   */
  backupLogs() {
    try {
      const backup = {
        sessionId: this.sessionId,
        timestamp: Date.now(),
        totalLogs: this.logStorage.size,
        logs: Array.from(this.logStorage.values()),
        blockchainLogs: this.blockchainLogs,
        immutableLogs: this.immutableLogs.slice(-1000) // Last 1000 entries
      };

      // Backup to localStorage
      localStorage.setItem(`eventLogger_backup_${this.sessionId}`, JSON.stringify(backup));
      
      // Backup to sessionStorage
      sessionStorage.setItem('eventLogger_currentSession', JSON.stringify(backup));
      
      console.log("💾 Logs backed up successfully");
      
    } catch (error) {
      console.error("❌ Log backup failed:", error);
    }
  }

  /**
   * Load existing logs from storage
   */
  async loadExistingLogs() {
    try {
      // Load from localStorage
      const backupKeys = Object.keys(localStorage).filter(key => key.startsWith('eventLogger_backup_'));
      
      for (const key of backupKeys) {
        const backup = JSON.parse(localStorage.getItem(key));
        if (backup && backup.logs) {
          backup.logs.forEach(log => {
            this.logStorage.set(log.id, log);
          });
        }
      }

      console.log(`📚 Loaded ${this.logStorage.size} existing log entries`);
      
    } catch (error) {
      console.error("❌ Failed to load existing logs:", error);
    }
  }

  /**
   * Maintain log size limits
   */
  maintainLogLimits() {
    // Keep replay buffer to reasonable size
    if (this.replayBuffer.length > 1000) {
      this.replayBuffer = this.replayBuffer.slice(-1000);
    }

    // Archive old logs if storage gets too large
    if (this.logStorage.size > this.maxLogEntries) {
      this.archiveOldLogs();
    }
  }

  /**
   * Archive old logs
   */
  archiveOldLogs() {
    try {
      const sortedLogs = Array.from(this.logStorage.values()).sort((a, b) => a.timestamp - b.timestamp);
      const logsToArchive = sortedLogs.slice(0, 1000); // Archive oldest 1000
      
      // Create archive
      const archive = {
        archiveId: `ARCHIVE_${Date.now()}`,
        timestamp: Date.now(),
        logs: logsToArchive
      };

      localStorage.setItem(`eventLogger_archive_${archive.archiveId}`, JSON.stringify(archive));
      
      // Remove from active storage
      logsToArchive.forEach(log => {
        this.logStorage.delete(log.id);
      });

      console.log(`📦 Archived ${logsToArchive.length} old logs`);
      
    } catch (error) {
      console.error("❌ Failed to archive logs:", error);
    }
  }

  /**
   * Get logs for replay functionality
   */
  getReplayData(startTime = null, endTime = null) {
    let replayLogs = Array.from(this.replayBuffer);
    
    if (startTime) {
      replayLogs = replayLogs.filter(log => log.timestamp >= startTime);
    }
    
    if (endTime) {
      replayLogs = replayLogs.filter(log => log.timestamp <= endTime);
    }
    
    return replayLogs.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Advanced scrubbing functionality
   */
  scrubToTimestamp(targetTimestamp) {
    const replayData = this.getReplayData();
    const targetIndex = replayData.findIndex(log => log.timestamp >= targetTimestamp);
    
    if (targetIndex >= 0) {
      const scrubData = replayData.slice(0, targetIndex + 1);
      console.log(`🎬 Scrubbed to timestamp ${targetTimestamp}, ${scrubData.length} events`);
      return scrubData;
    }
    
    return replayData;
  }

  /**
   * Export logs for external analysis
   */
  exportLogs(format = 'json') {
    try {
      const exportData = {
        sessionId: this.sessionId,
        exportTimestamp: Date.now(),
        totalLogs: this.logStorage.size,
        logs: Array.from(this.logStorage.values()),
        blockchainLogs: this.blockchainLogs,
        metadata: {
          version: '1.0',
          format: format
        }
      };

      if (format === 'json') {
        return JSON.stringify(exportData, null, 2);
      } else if (format === 'csv') {
        return this.convertToCSV(exportData.logs);
      }
      
      return exportData;
      
    } catch (error) {
      console.error("❌ Failed to export logs:", error);
      return null;
    }
  }

  /**
   * Convert logs to CSV format
   */
  convertToCSV(logs) {
    if (logs.length === 0) return '';
    
    const headers = ['id', 'sessionId', 'eventType', 'timestamp', 'hash', 'transactionHash'];
    const csvRows = [headers.join(',')];
    
    logs.forEach(log => {
      const row = headers.map(header => {
        const value = log[header] || '';
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  }

  /**
   * Search logs by criteria
   */
  searchLogs(criteria) {
    const results = [];
    
    for (const [id, log] of this.logStorage) {
      let matches = true;
      
      if (criteria.eventType && log.eventType !== criteria.eventType) {
        matches = false;
      }
      
      if (criteria.startTime && log.timestamp < criteria.startTime) {
        matches = false;
      }
      
      if (criteria.endTime && log.timestamp > criteria.endTime) {
        matches = false;
      }
      
      if (criteria.transactionHash && log.transactionHash !== criteria.transactionHash) {
        matches = false;
      }
      
      if (matches) {
        results.push(log);
      }
    }
    
    return results.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Generate session ID
   */
  generateSessionId() {
    return 'SESSION_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Generate log ID
   */
  generateLogId() {
    return 'LOG_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Persist logs to storage
   */
  persistLogs() {
    try {
      // Store current session
      localStorage.setItem('eventLogger_currentSession', JSON.stringify(this.currentSession));
      
      // Store recent logs (last 100)
      const recentLogs = Array.from(this.logStorage.values()).slice(-100);
      localStorage.setItem('eventLogger_recentLogs', JSON.stringify(recentLogs));
      
    } catch (error) {
      console.error("❌ Failed to persist logs:", error);
    }
  }

  /**
   * Get logger statistics
   */
  getStatistics() {
    return {
      sessionId: this.sessionId,
      isActive: this.isActive,
      totalLogs: this.logStorage.size,
      replayBufferSize: this.replayBuffer.length,
      blockchainLogs: this.blockchainLogs.length,
      immutableLogs: this.immutableLogs.length,
      sessionStartTime: this.currentSession?.startTime,
      sessionDuration: Date.now() - (this.currentSession?.startTime || Date.now())
    };
  }

  /**
   * Close logging session
   */
  closeSession() {
    if (this.currentSession) {
      this.currentSession.endTime = Date.now();
      this.currentSession.status = 'CLOSED';
      
      this.log('SESSION_CLOSED', {
        sessionId: this.sessionId,
        duration: this.currentSession.endTime - this.currentSession.startTime,
        totalEvents: this.currentSession.events.length
      });
    }
    
    this.isActive = false;
    console.log("📝 Event Logger session closed");
  }
}

// Export for use in other modules
window.EventLogger = EventLogger;