"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { WatchtowerEvent } from '@/lib/watchtower';

interface WatchtowerClientProps {
  maxToasts?: number;
  toastDuration?: number;
}

interface Toast {
  id: string;
  event: WatchtowerEvent;
  timestamp: number;
}

export default function WatchtowerClient({ 
  maxToasts = 5, 
  toastDuration = 8000 
}: WatchtowerClientProps) {
  const [connected, setConnected] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [bannerEvent, setBannerEvent] = useState<WatchtowerEvent | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const addToast = useCallback((event: WatchtowerEvent) => {
    const toast: Toast = {
      id: `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      event,
      timestamp: Date.now()
    };

    setToasts(prev => {
      const newToasts = [toast, ...prev].slice(0, maxToasts);
      return newToasts;
    });

    // Auto-remove toast after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toast.id));
    }, toastDuration);
  }, [maxToasts, toastDuration]);

  const handleWatchtowerEvent = useCallback((event: WatchtowerEvent) => {
    console.log('[WatchtowerClient] Received event:', event);

    // Skip heartbeat and connection events for UI
    if (event.type === 'heartbeat' || event.type === 'connection') {
      return;
    }

    // Show banner for high-priority events
    if (event.type === 'glyph_detection' || event.type === 'chaos_alert') {
      setBannerEvent(event);
      // Auto-hide banner after 10 seconds
      setTimeout(() => setBannerEvent(null), 10000);
    }

    // Add toast notification
    addToast(event);
  }, [addToast]);

  const connectToWatchtower = useCallback(() => {
    try {
      const subscriberId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const eventSource = new EventSource(`/api/watchtower/stream?id=${subscriberId}`);
      
      eventSource.onopen = () => {
        console.log('[WatchtowerClient] Connected to stream');
        setConnected(true);
        // Clear any reconnection timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      eventSource.onmessage = (event) => {
        try {
          const watchtowerEvent: WatchtowerEvent = JSON.parse(event.data);
          handleWatchtowerEvent(watchtowerEvent);
        } catch (error) {
          console.error('[WatchtowerClient] Error parsing event:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('[WatchtowerClient] EventSource error:', error);
        setConnected(false);
        
        // Attempt to reconnect after 5 seconds
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('[WatchtowerClient] Attempting to reconnect...');
            eventSource.close();
            connectToWatchtower();
          }, 5000);
        }
      };

      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error('[WatchtowerClient] Failed to connect:', error);
      setConnected(false);
    }
  }, [handleWatchtowerEvent]);

  const disconnectFromWatchtower = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setConnected(false);
  }, []);

  useEffect(() => {
    connectToWatchtower();
    
    return () => {
      disconnectFromWatchtower();
    };
  }, [connectToWatchtower, disconnectFromWatchtower]);

  const removeToast = (toastId: string) => {
    setToasts(prev => prev.filter(t => t.id !== toastId));
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'glyph_detection': return '🔮';
      case 'vault_event': return '🏛️';
      case 'relic_mint': return '🎯';
      case 'chaos_alert': return '⚡';
      default: return '📡';
    }
  };

  const getEventTitle = (event: WatchtowerEvent) => {
    switch (event.type) {
      case 'glyph_detection': 
        return `Glyph Detected: ${event.data.glyphId}`;
      case 'vault_event': 
        return `Vault Event: ${event.data.eventCode}`;
      case 'relic_mint': 
        return `Relic Minted: ${event.data.glyphId}`;
      case 'chaos_alert': 
        return `Chaos Alert: ${event.data.eventCode}`;
      default: 
        return `Event: ${event.data.eventCode}`;
    }
  };

  const formatVaultUrl = (eventId: string) => {
    return `/vault?event=${eventId}`;
  };

  return (
    <>
      {/* Connection Status */}
      <div className={`fixed top-4 right-4 z-50 px-3 py-1 rounded-full text-sm font-mono ${
        connected 
          ? 'bg-green-900 text-green-300 border border-green-500' 
          : 'bg-red-900 text-red-300 border border-red-500'
      }`}>
        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
          connected ? 'bg-green-400' : 'bg-red-400'
        }`} />
        Watchtower {connected ? 'ONLINE' : 'OFFLINE'}
      </div>

      {/* Banner for High-Priority Events */}
      {bannerEvent && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-orange-600 to-red-600 text-white p-4 shadow-lg animate-pulse">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getEventIcon(bannerEvent.type)}</span>
              <div>
                <div className="font-bold text-lg">{getEventTitle(bannerEvent)}</div>
                <div className="text-sm opacity-90">
                  Event Code: {bannerEvent.data.eventCode} | 
                  Time: {new Date(bannerEvent.data.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <a 
                href={formatVaultUrl(bannerEvent.id)} 
                className="bg-white text-orange-600 px-4 py-2 rounded font-bold hover:bg-gray-100 transition-colors"
              >
                ENTER VAULT
              </a>
              <button 
                onClick={() => setBannerEvent(null)}
                className="text-white hover:text-gray-300 text-xl"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-30 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-black text-green-300 border border-green-500 rounded-lg p-4 max-w-sm shadow-lg transform transition-all duration-300 hover:scale-105"
            style={{
              fontFamily: 'monospace',
              boxShadow: '0 0 20px rgba(0, 255, 0, 0.3)'
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-2">
                <span className="text-lg">{getEventIcon(toast.event.type)}</span>
                <div>
                  <div className="font-bold text-sm text-orange-400">
                    {getEventTitle(toast.event)}
                  </div>
                  <div className="text-xs text-green-500 mt-1">
                    {new Date(toast.event.data.timestamp).toLocaleTimeString()}
                  </div>
                  {toast.event.data.vaultUrl && (
                    <a 
                      href={formatVaultUrl(toast.event.id)}
                      className="text-blue-400 hover:text-blue-300 text-xs underline mt-1 block"
                    >
                      → Enter Vault
                    </a>
                  )}
                </div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-white text-sm ml-2"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Neon Glow Effects */}
      <style jsx>{`
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 0, 0.3); }
          50% { box-shadow: 0 0 30px rgba(0, 255, 0, 0.6); }
        }
        
        .glyph-detected {
          animation: glow 2s infinite;
        }
      `}</style>
    </>
  );
}