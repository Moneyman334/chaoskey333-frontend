"use client";

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  [probe: string]: {
    p50: number;
    p90: number;
    p99: number;
    target_p99: number;
    description: string;
    latest_sample: {
      timestamp: number;
      probe: string;
      latency: number;
      status: string;
    };
    breach: boolean;
  };
}

interface StreamData {
  type: string;
  timestamp: number;
  metrics?: PerformanceMetrics;
  message?: string;
}

interface RecentSample {
  timestamp: number;
  probe: string;
  latency: number;
  status: string;
}

export default function ARMStressConsole() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [recentSamples, setRecentSamples] = useState<RecentSample[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [lastUpdate, setLastUpdate] = useState<number>(0);

  useEffect(() => {
    const eventSource = new EventSource('/api/arm/stream');

    eventSource.onopen = () => {
      setConnectionStatus('connected');
    };

    eventSource.onmessage = (event) => {
      try {
        const data: StreamData = JSON.parse(event.data);
        
        if (data.type === 'connected') {
          setConnectionStatus('connected');
        } else if (data.type === 'metrics' && data.metrics) {
          setMetrics(data.metrics);
          setLastUpdate(data.timestamp);
          
          // Add new samples to recent samples list
          const newSamples: RecentSample[] = [];
          Object.values(data.metrics).forEach(metric => {
            if (metric.latest_sample) {
              newSamples.push(metric.latest_sample);
            }
          });
          
          setRecentSamples(prev => {
            const combined = [...newSamples, ...prev];
            return combined.slice(0, 20); // Keep only last 20 samples
          });
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    eventSource.onerror = () => {
      setConnectionStatus('disconnected');
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const formatLatency = (latency: number) => `${latency.toFixed(0)}ms`;
  const formatTimestamp = (timestamp: number) => new Date(timestamp).toLocaleTimeString();

  const getStatusColor = (breach: boolean, status: string) => {
    if (status === 'error') return 'text-red-600';
    if (breach) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getCardColor = (breach: boolean) => {
    if (breach) return 'border-yellow-500 bg-yellow-50';
    return 'border-green-500 bg-green-50';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-2">
            ⚡️ ARM Stress Console
          </h1>
          <p className="text-center text-gray-400 mb-4">
            Live monitoring of Cosmic Replay Terminal performance metrics during stress-test ignition
          </p>
          
          {/* Connection Status */}
          <div className="flex justify-center items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' : 
              connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm text-gray-400">
              {connectionStatus === 'connected' ? 'Connected' : 
               connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
            </span>
            {lastUpdate > 0 && (
              <span className="text-xs text-gray-500 ml-2">
                Last update: {formatTimestamp(lastUpdate)}
              </span>
            )}
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Object.entries(metrics).map(([probe, metric]) => (
            <div key={probe} className={`border-2 rounded-lg p-6 ${getCardColor(metric.breach)}`}>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{probe}</h3>
              <p className="text-sm text-gray-600 mb-4">{metric.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">p50:</span>
                  <span className="font-mono text-gray-900">{formatLatency(metric.p50)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">p90:</span>
                  <span className="font-mono text-gray-900">{formatLatency(metric.p90)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">p99:</span>
                  <span className={`font-mono font-bold ${metric.breach ? 'text-red-600' : 'text-green-600'}`}>
                    {formatLatency(metric.p99)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-700">Target p99:</span>
                  <span className="font-mono text-gray-900">{formatLatency(metric.target_p99)}</span>
                </div>
              </div>
              
              {metric.breach && (
                <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
                  ⚠️ P99 breach detected!
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Recent Samples Table */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Recent Samples</h2>
          
          {recentSamples.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              Waiting for performance data...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 px-3">Timestamp</th>
                    <th className="text-left py-2 px-3">Probe</th>
                    <th className="text-left py-2 px-3">Latency</th>
                    <th className="text-left py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSamples.map((sample, index) => (
                    <tr key={`${sample.probe}-${sample.timestamp}-${index}`} className="border-b border-gray-700">
                      <td className="py-2 px-3 font-mono text-gray-300">
                        {formatTimestamp(sample.timestamp)}
                      </td>
                      <td className="py-2 px-3">{sample.probe}</td>
                      <td className="py-2 px-3 font-mono">{formatLatency(sample.latency)}</td>
                      <td className={`py-2 px-3 ${getStatusColor(false, sample.status)}`}>
                        {sample.status === 'success' ? '✓' : '✗'} {sample.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Neutron-star pulse monitoring • Phase 1 stress-test ignition</p>
          <p className="mt-1">
            Targets: kv_set_get &lt; 250ms • overlay_sync &lt; 350ms • autosave_roundtrip &lt; 2000ms
          </p>
        </div>
      </div>
    </div>
  );
}