'use client';

/**
 * Watchtower Client Component
 * Real-time SSE client with glyph toasts and neon banner pulses
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { WatchtowerConfig, ClientEvent, WatchtowerEventType } from '../../../lib/watchtower';

interface WatchtowerClientProps {
  className?: string;
  showToasts?: boolean;
  showBanner?: boolean;
  autoScroll?: boolean;
  maxVisibleEvents?: number;
}

interface EventNotification extends ClientEvent {
  isHeartbeat?: boolean;
  source?: string;
  receivedAt?: number;
  visible?: boolean;
}

export default function WatchtowerClient({
  className = '',
  showToasts = true,
  showBanner = true,
  autoScroll = false,
  maxVisibleEvents = 5
}: WatchtowerClientProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState<EventNotification[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [currentBanner, setCurrentBanner] = useState<EventNotification | null>(null);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const bannerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Event priority styling
  const getPriorityStyles = (priority?: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500/20 border-red-500 text-red-100';
      case 'high':
        return 'bg-yellow-500/20 border-yellow-500 text-yellow-100';
      case 'medium':
        return 'bg-blue-500/20 border-blue-500 text-blue-100';
      case 'low':
      default:
        return 'bg-gray-500/20 border-gray-500 text-gray-100';
    }
  };

  // Event type emoji mapping
  const getEventEmoji = (type: WatchtowerEventType): string => {
    switch (type) {
      case 'glyph.alert': return '🔮';
      case 'vault.pulse': return '⚡';
      case 'relic.minted': return '🧿';
      case 'payment.success': return '💰';
      case 'leaderboard.update': return '🏆';
      case 'system.heartbeat': return '💚';
      default: return '🌟';
    }
  };

  // Connect to SSE stream
  const connect = useCallback(() => {
    if (!WatchtowerConfig.enabled) {
      console.log('Watchtower is disabled');
      return;
    }

    if (eventSourceRef.current?.readyState === EventSource.OPEN) {
      return; // Already connected
    }

    setConnectionStatus('connecting');
    console.log('Connecting to Watchtower stream...');

    const eventSource = new EventSource(WatchtowerConfig.streamEndpoint);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('✅ Watchtower stream connected');
      setIsConnected(true);
      setConnectionStatus('connected');
      setReconnectAttempts(0);
    };

    eventSource.onmessage = (event) => {
      try {
        const eventData: EventNotification = JSON.parse(event.data);
        
        // Skip heartbeat events for display (but use for connection health)
        if (eventData.isHeartbeat) {
          return;
        }

        console.log('📡 Watchtower event received:', eventData);
        
        // Add to events list
        setEvents(prev => {
          const newEvents = [{ ...eventData, visible: true }, ...prev];
          return newEvents.slice(0, maxVisibleEvents * 2); // Keep more in memory than visible
        });

        // Show banner for high/critical priority events
        if (showBanner && (eventData.metadata?.priority === 'high' || eventData.metadata?.priority === 'critical')) {
          setCurrentBanner(eventData);
          
          // Clear banner after 5 seconds
          if (bannerTimeoutRef.current) {
            clearTimeout(bannerTimeoutRef.current);
          }
          bannerTimeoutRef.current = setTimeout(() => {
            setCurrentBanner(null);
          }, 5000);
        }

        // Auto-scroll for relic events
        if (autoScroll && eventData.type === 'relic.minted') {
          // This would trigger a scroll to a cosmic replay section
          console.log('🎬 Auto-scrolling to cosmic replay for relic:', eventData.data.tokenId);
        }

      } catch (error) {
        console.error('Error parsing Watchtower event:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('❌ Watchtower stream error:', error);
      setIsConnected(false);
      setConnectionStatus('error');
      
      // Attempt reconnection with exponential backoff
      if (reconnectAttempts < WatchtowerConfig.maxReconnectAttempts) {
        const delay = WatchtowerConfig.reconnectDelay * Math.pow(2, reconnectAttempts);
        console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1}/${WatchtowerConfig.maxReconnectAttempts})`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          setReconnectAttempts(prev => prev + 1);
          connect();
        }, delay);
      } else {
        console.error('💀 Max reconnection attempts reached');
        setConnectionStatus('error');
      }
    };
  }, [reconnectAttempts, showBanner, autoScroll, maxVisibleEvents]);

  // Disconnect from stream
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (bannerTimeoutRef.current) {
      clearTimeout(bannerTimeoutRef.current);
      bannerTimeoutRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
    setReconnectAttempts(0);
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Hide toast after delay
  const hideToast = useCallback((eventId: string) => {
    setEvents(prev => 
      prev.map(event => 
        event.id === eventId ? { ...event, visible: false } : event
      )
    );
  }, []);

  // Connection status indicator
  const ConnectionIndicator = () => (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 bg-black/80 backdrop-blur-sm rounded-lg border border-gray-600">
      <div className={`w-2 h-2 rounded-full ${
        connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' :
        connectionStatus === 'connecting' ? 'bg-yellow-500 animate-spin' :
        connectionStatus === 'error' ? 'bg-red-500' :
        'bg-gray-500'
      }`} />
      <span className="text-xs text-gray-300">
        {connectionStatus === 'connected' ? 'Watchtower Active' :
         connectionStatus === 'connecting' ? 'Connecting...' :
         connectionStatus === 'error' ? 'Connection Error' :
         'Disconnected'}
      </span>
      {reconnectAttempts > 0 && (
        <span className="text-xs text-yellow-400">
          (Retry {reconnectAttempts}/{WatchtowerConfig.maxReconnectAttempts})
        </span>
      )}
    </div>
  );

  // Banner notification
  const Banner = () => {
    if (!currentBanner || !showBanner) return null;

    return (
      <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-purple-900/90 to-blue-900/90 backdrop-blur-sm border-b border-purple-500 animate-pulse">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getEventEmoji(currentBanner.type)}</span>
              <div>
                <p className="text-white font-semibold">{currentBanner.data.message}</p>
                <p className="text-purple-200 text-sm">
                  {new Date(currentBanner.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => setCurrentBanner(null)}
              className="text-white/70 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Toast notifications
  const Toasts = () => {
    if (!showToasts) return null;

    const visibleEvents = events.filter(event => event.visible).slice(0, maxVisibleEvents);

    return (
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {visibleEvents.map((event, index) => (
          <div
            key={event.id}
            className={`transform transition-all duration-500 ${
              event.visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div className={`
              max-w-sm p-4 rounded-lg border backdrop-blur-sm
              ${getPriorityStyles(event.metadata?.priority)}
              shadow-lg hover:shadow-xl transition-shadow
            `}>
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">
                  {getEventEmoji(event.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">
                    {event.data.message}
                  </p>
                  <p className="text-xs opacity-75 mt-1">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <button
                  onClick={() => hideToast(event.id)}
                  className="text-white/70 hover:text-white flex-shrink-0"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Auto-hide toasts after 7 seconds
  useEffect(() => {
    events.forEach(event => {
      if (event.visible) {
        const timer = setTimeout(() => {
          hideToast(event.id);
        }, 7000);
        
        return () => clearTimeout(timer);
      }
    });
  }, [events, hideToast]);

  if (!WatchtowerConfig.enabled) {
    return null;
  }

  return (
    <div className={className}>
      <ConnectionIndicator />
      <Banner />
      <Toasts />
    </div>
  );
}