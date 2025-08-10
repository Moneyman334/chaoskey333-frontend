'use client';

import React, { useState, useEffect, useRef } from 'react';

interface PulseEvent {
  id: string;
  timestamp: number;
  depth: number;
  source: string;
  broadcastOn: boolean;
  recursionDepth: number;
  pulseCount: number;
  pps: number;
  topic: string;
}

interface RecursionStatus {
  broadcastOn: boolean;
  recursionDepth: number;
  pulseCount: number;
  lastPulseTime: number;
  pps: number;
  connections: number;
  limits: {
    maxDepth: number;
    qpsLimit: number;
  };
  topic: string;
}

interface RippleEffect {
  id: string;
  x: number;
  y: number;
  timestamp: number;
  depth: number;
  source: string;
}

export default function RecursionMonitor() {
  const [status, setStatus] = useState<RecursionStatus | null>(null);
  const [events, setEvents] = useState<PulseEvent[]>([]);
  const [ripples, setRipples] = useState<RippleEffect[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Connect to SSE stream
  useEffect(() => {
    const connectSSE = () => {
      try {
        const eventSource = new EventSource('/api/stream');
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          setIsConnected(true);
          setError(null);
          console.log('🌀 Connected to recursion monitor stream');
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'connection') {
              setStatus(data.status);
            } else if (data.type === 'heartbeat') {
              setStatus(data.status);
            } else if (data.type === 'broadcast_toggle') {
              setStatus(prev => prev ? { ...prev, broadcastOn: data.broadcastOn } : null);
            } else {
              // Regular pulse event
              const pulseEvent = data as PulseEvent;
              setEvents(prev => [pulseEvent, ...prev.slice(0, 49)]); // Keep last 50 events
              setStatus(prev => prev ? {
                ...prev,
                pulseCount: pulseEvent.pulseCount,
                pps: pulseEvent.pps,
                lastPulseTime: pulseEvent.timestamp,
                broadcastOn: pulseEvent.broadcastOn
              } : null);

              // Add ripple effect
              addRipple(pulseEvent);
            }
          } catch (error) {
            console.error('Error parsing SSE data:', error);
          }
        };

        eventSource.onerror = (error) => {
          console.error('SSE connection error:', error);
          setIsConnected(false);
          setError('Connection lost. Retrying...');
          eventSource.close();
          
          // Retry connection after 2 seconds
          setTimeout(connectSSE, 2000);
        };

      } catch (error) {
        console.error('Failed to connect to SSE:', error);
        setError('Failed to connect to monitor stream');
        setTimeout(connectSSE, 2000);
      }
    };

    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Add ripple effect for visualization
  const addRipple = (event: PulseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Create ripple at random position around center, influenced by recursion depth
    const angle = Math.random() * 2 * Math.PI;
    const radius = event.depth * 20 + Math.random() * 50;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    const ripple: RippleEffect = {
      id: event.id,
      x,
      y,
      timestamp: event.timestamp,
      depth: event.depth,
      source: event.source
    };

    setRipples(prev => [...prev, ripple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== ripple.id));
    }, 2000);
  };

  // Trigger pulse manually
  const triggerPulse = async () => {
    try {
      const response = await fetch('/api/pulse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depth: 0, source: 'manual' })
      });
      
      if (!response.ok) {
        const error = await response.json();
        setError(error.error || 'Failed to trigger pulse');
      }
    } catch (error) {
      setError('Failed to trigger pulse');
      console.error('Pulse trigger error:', error);
    }
  };

  // Toggle broadcast state
  const toggleBroadcast = async () => {
    if (!adminToken) {
      setShowTokenInput(true);
      return;
    }

    try {
      const response = await fetch('/api/toggle-broadcast', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        setError(error.error || 'Failed to toggle broadcast');
        if (response.status === 401) {
          setShowTokenInput(true);
        }
      } else {
        const result = await response.json();
        setError(null);
        console.log('Broadcast toggled:', result.message);
      }
    } catch (error) {
      setError('Failed to toggle broadcast');
      console.error('Broadcast toggle error:', error);
    }
  };

  // Format timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // Get status color
  const getStatusColor = () => {
    if (!isConnected) return 'text-red-500';
    if (!status) return 'text-gray-500';
    if (status.broadcastOn) return 'text-orange-500';
    return 'text-green-500';
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🌀 Recursion Monitor</h1>
        <p className="text-gray-600">Real-time Vault Recursion Monitoring & Control</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Status Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">System Status</h3>
          <div className={`text-lg font-mono ${getStatusColor()}`}>
            {!isConnected ? 'DISCONNECTED' : 
             !status ? 'INITIALIZING' :
             status.broadcastOn ? 'ARMED' : 'DISARMED'}
          </div>
          <div className="text-sm text-gray-500">
            {status && `${status.connections} active connections`}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Pulse Metrics</h3>
          <div className="text-2xl font-mono text-blue-600">
            {status?.pps || 0} PPS
          </div>
          <div className="text-sm text-gray-500">
            Total: {status?.pulseCount || 0} pulses
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Safety Limits</h3>
          <div className="text-sm">
            <div>Max Depth: {status?.limits.maxDepth || 'N/A'}</div>
            <div>QPS Limit: {status?.limits.qpsLimit || 'N/A'}</div>
            <div>Topic: {status?.topic || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="font-semibold mb-4">Control Panel</h3>
        <div className="flex gap-4 items-center">
          <button
            onClick={triggerPulse}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={!isConnected}
          >
            🚀 Trigger Pulse
          </button>
          
          <button
            onClick={toggleBroadcast}
            className={`px-4 py-2 text-white rounded hover:opacity-90 disabled:opacity-50 ${
              status?.broadcastOn ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'
            }`}
            disabled={!isConnected}
          >
            {status?.broadcastOn ? '🛑 DISARM Recursion' : '⚡ ARM Recursion'}
          </button>

          {showTokenInput && (
            <div className="flex gap-2">
              <input
                type="password"
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
                placeholder="Admin Token"
                className="px-3 py-2 border rounded"
              />
              <button
                onClick={() => setShowTokenInput(false)}
                className="px-3 py-2 bg-gray-500 text-white rounded"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Visualization Canvas */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="font-semibold mb-4">Real-time Ripple Visualization</h3>
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            className="border border-gray-200 rounded bg-black"
            style={{ width: '100%', height: '200px' }}
          />
          {ripples.map((ripple) => (
            <div
              key={ripple.id}
              className={`absolute border-2 rounded-full pointer-events-none animate-ping ${
                ripple.source === 'manual' ? 'border-blue-400' :
                ripple.source === 'recursive' ? 'border-orange-400' : 'border-green-400'
              }`}
              style={{
                left: `${(ripple.x / 800) * 100}%`,
                top: `${(ripple.y / 400) * 100}%`,
                width: `${20 + ripple.depth * 10}px`,
                height: `${20 + ripple.depth * 10}px`,
                transform: 'translate(-50%, -50%)',
                animationDuration: '2s'
              }}
            />
          ))}
        </div>
      </div>

      {/* Event Log */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-4">Event Log</h3>
        <div className="max-h-64 overflow-y-auto">
          {events.length === 0 ? (
            <div className="text-gray-500 text-center py-4">No events yet</div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="border-b py-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-gray-600">
                    {formatTime(event.timestamp)}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    event.source === 'manual' ? 'bg-blue-100 text-blue-800' :
                    event.source === 'recursive' ? 'bg-orange-100 text-orange-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {event.source}
                  </span>
                </div>
                <div className="text-gray-700">
                  Depth: {event.depth} | PPS: {event.pps} | Total: {event.pulseCount}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}