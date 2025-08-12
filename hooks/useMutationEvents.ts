/**
 * 🧬 React Hook for Mutation Events
 * Frontend integration for the Permanent Relic Evolution Trigger system
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// Define mutation event types
export const MutationEventTypes = {
  MYTHIC_MODE_ACTIVATED: 'mythicModeActivated',
  VAULT_BROADCAST_PULSE: 'vaultBroadcastPulse',
  RELIC_REPLAY_EVENT: 'relicReplayEvent',
  RELIC_MUTATION_TRIGGERED: 'relicMutationTriggered',
  GLOBAL_MUTATION_BROADCAST: 'globalMutationBroadcast',
  LORE_ECOSYSTEM_BROADCAST: 'loreEcosystemBroadcast',
  GLOBAL_BROADCAST_EXECUTED: 'globalBroadcastExecuted',
  GLOBAL_BROADCAST_FAILED: 'globalBroadcastFailed',
  VAULT_CONNECTION: 'vaultConnected',
  REAL_TIME_CONNECTION_STATUS: 'realTimeConnectionStatus'
};

// Define mutation stages
export const MutationStages = {
  PULSE_EVOLUTION: 'PULSE_EVOLUTION',
  REPLAY_EVOLUTION: 'REPLAY_EVOLUTION',
  MYTHIC_TRANSFORMATION: 'MYTHIC_TRANSFORMATION',
  COSMIC_ASCENSION: 'COSMIC_ASCENSION'
};

/**
 * Hook for managing mutation events and system status
 */
export function useMutationEvents() {
  const [mutationEvents, setMutationEvents] = useState([]);
  const [systemStatus, setSystemStatus] = useState({
    mythicModeActive: false,
    vaultBroadcastActive: false,
    realTimeConnected: false,
    queuedEvents: 0,
    lastMutation: null
  });
  const [isListening, setIsListening] = useState(false);
  const eventListenersRef = useRef(new Map());

  // Initialize mutation event listeners
  useEffect(() => {
    startListening();
    
    return () => {
      stopListening();
    };
  }, []);

  /**
   * Start listening to mutation events
   */
  const startListening = useCallback(() => {
    if (isListening) return;
    
    console.log('🧬 Starting mutation event listeners...');
    
    // Add event listeners for all mutation events
    Object.values(MutationEventTypes).forEach(eventType => {
      const listener = (event) => handleMutationEvent(eventType, event.detail);
      document.addEventListener(eventType, listener);
      eventListenersRef.current.set(eventType, listener);
    });
    
    setIsListening(true);
    updateSystemStatus();
  }, [isListening]);

  /**
   * Stop listening to mutation events
   */
  const stopListening = useCallback(() => {
    if (!isListening) return;
    
    console.log('🧬 Stopping mutation event listeners...');
    
    // Remove all event listeners
    eventListenersRef.current.forEach((listener, eventType) => {
      document.removeEventListener(eventType, listener);
    });
    eventListenersRef.current.clear();
    
    setIsListening(false);
  }, [isListening]);

  /**
   * Handle incoming mutation events
   */
  const handleMutationEvent = useCallback((eventType, eventData) => {
    const mutationEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: eventType,
      data: eventData,
      timestamp: Date.now(),
      processed: false
    };
    
    console.log(`🧬 Mutation event received: ${eventType}`, eventData);
    
    // Add to events list (keep last 100 events)
    setMutationEvents(prev => {
      const updated = [mutationEvent, ...prev].slice(0, 100);
      return updated;
    });
    
    // Update system status based on event type
    updateSystemStatusFromEvent(eventType, eventData);
    
    // Process specific event types
    switch (eventType) {
      case MutationEventTypes.RELIC_MUTATION_TRIGGERED:
        setSystemStatus(prev => ({ ...prev, lastMutation: mutationEvent }));
        break;
      case MutationEventTypes.MYTHIC_MODE_ACTIVATED:
        setSystemStatus(prev => ({ ...prev, mythicModeActive: true }));
        break;
      case MutationEventTypes.VAULT_BROADCAST_PULSE:
        setSystemStatus(prev => ({ ...prev, vaultBroadcastActive: true }));
        break;
      case MutationEventTypes.REAL_TIME_CONNECTION_STATUS:
        setSystemStatus(prev => ({ 
          ...prev, 
          realTimeConnected: eventData?.connected || false 
        }));
        break;
    }
  }, []);

  /**
   * Update system status from global objects
   */
  const updateSystemStatus = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const status = {
      mythicModeActive: false,
      vaultBroadcastActive: false,
      realTimeConnected: false,
      queuedEvents: 0,
      lastMutation: null
    };
    
    // Get status from mutation hooks
    if (window.mutationHooks) {
      const hookStatus = window.mutationHooks.getStatus();
      status.mythicModeActive = hookStatus.mythicModeActive;
      status.queuedEvents = hookStatus.queuedEvents;
    }
    
    // Get status from vault broadcast
    if (window.vaultBroadcast) {
      const broadcastStatus = window.vaultBroadcast.getStatus();
      status.vaultBroadcastActive = broadcastStatus.broadcastActive;
    }
    
    // Get status from global push
    if (window.globalPushLogic) {
      const pushStatus = window.globalPushLogic.getStatus();
      status.realTimeConnected = pushStatus.realTimeConnections.length > 0;
    }
    
    setSystemStatus(prev => ({ ...prev, ...status }));
  }, []);

  /**
   * Update system status from specific event
   */
  const updateSystemStatusFromEvent = useCallback((eventType, eventData) => {
    // This is handled in the main handleMutationEvent function
    // but can be extended for more complex status updates
  }, []);

  /**
   * Trigger a mythic mode activation
   */
  const activateMythicMode = useCallback(() => {
    const event = new CustomEvent(MutationEventTypes.MYTHIC_MODE_ACTIVATED, {
      detail: {
        timestamp: Date.now(),
        activatedBy: 'user_trigger',
        mode: 'full_evolution'
      }
    });
    document.dispatchEvent(event);
  }, []);

  /**
   * Connect to a vault
   */
  const connectVault = useCallback((vaultData) => {
    const event = new CustomEvent(MutationEventTypes.VAULT_CONNECTION, {
      detail: {
        ...vaultData,
        timestamp: Date.now(),
        connectionType: 'manual'
      }
    });
    document.dispatchEvent(event);
  }, []);

  /**
   * Trigger a replay event
   */
  const triggerReplayEvent = useCallback((replayData) => {
    const event = new CustomEvent(MutationEventTypes.RELIC_REPLAY_EVENT, {
      detail: {
        ...replayData,
        timestamp: Date.now(),
        source: 'user_trigger'
      }
    });
    document.dispatchEvent(event);
  }, []);

  /**
   * Get filtered events by type
   */
  const getEventsByType = useCallback((eventType) => {
    return mutationEvents.filter(event => event.type === eventType);
  }, [mutationEvents]);

  /**
   * Get recent mutations
   */
  const getRecentMutations = useCallback((limit = 10) => {
    return mutationEvents
      .filter(event => event.type === MutationEventTypes.RELIC_MUTATION_TRIGGERED)
      .slice(0, limit);
  }, [mutationEvents]);

  /**
   * Clear all events
   */
  const clearEvents = useCallback(() => {
    setMutationEvents([]);
  }, []);

  /**
   * Get system diagnostics
   */
  const getSystemDiagnostics = useCallback(() => {
    const diagnostics = {
      ...systemStatus,
      totalEvents: mutationEvents.length,
      eventsByType: {},
      isListening,
      lastEventTime: mutationEvents[0]?.timestamp || null
    };
    
    // Count events by type
    Object.values(MutationEventTypes).forEach(eventType => {
      diagnostics.eventsByType[eventType] = getEventsByType(eventType).length;
    });
    
    return diagnostics;
  }, [systemStatus, mutationEvents, isListening, getEventsByType]);

  return {
    // State
    mutationEvents,
    systemStatus,
    isListening,
    
    // Actions
    startListening,
    stopListening,
    activateMythicMode,
    connectVault,
    triggerReplayEvent,
    
    // Queries
    getEventsByType,
    getRecentMutations,
    getSystemDiagnostics,
    
    // Utilities
    clearEvents,
    updateSystemStatus
  };
}

/**
 * Hook for specific mutation event type
 */
export function useMutationEventType(eventType, callback) {
  const [events, setEvents] = useState([]);
  const callbackRef = useRef(callback);
  
  // Update callback ref
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  useEffect(() => {
    const listener = (event) => {
      const eventData = {
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: eventType,
        data: event.detail,
        timestamp: Date.now()
      };
      
      setEvents(prev => [eventData, ...prev].slice(0, 50));
      
      if (callbackRef.current) {
        callbackRef.current(eventData);
      }
    };
    
    document.addEventListener(eventType, listener);
    
    return () => {
      document.removeEventListener(eventType, listener);
    };
  }, [eventType]);
  
  return events;
}

/**
 * Hook for vault broadcast pulse events
 */
export function useVaultPulse() {
  const [pulseData, setPulseData] = useState(null);
  const [pulseHistory, setPulseHistory] = useState([]);
  
  useEffect(() => {
    const listener = (event) => {
      const pulse = event.detail;
      setPulseData(pulse);
      setPulseHistory(prev => [pulse, ...prev].slice(0, 20));
    };
    
    document.addEventListener(MutationEventTypes.VAULT_BROADCAST_PULSE, listener);
    
    return () => {
      document.removeEventListener(MutationEventTypes.VAULT_BROADCAST_PULSE, listener);
    };
  }, []);
  
  return { pulseData, pulseHistory };
}

/**
 * Hook for real-time connection status
 */
export function useRealTimeConnection() {
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    type: null,
    lastUpdate: null
  });
  
  useEffect(() => {
    const listener = (event) => {
      setConnectionStatus({
        connected: event.detail.connected,
        type: event.detail.type,
        lastUpdate: Date.now()
      });
    };
    
    document.addEventListener(MutationEventTypes.REAL_TIME_CONNECTION_STATUS, listener);
    
    // Initial status check
    if (window.globalPushLogic) {
      const status = window.globalPushLogic.getStatus();
      setConnectionStatus({
        connected: status.realTimeConnections.length > 0,
        type: status.realTimeConnections[0] || null,
        lastUpdate: Date.now()
      });
    }
    
    return () => {
      document.removeEventListener(MutationEventTypes.REAL_TIME_CONNECTION_STATUS, listener);
    };
  }, []);
  
  return connectionStatus;
}