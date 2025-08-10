"use client";

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import for client-side only rendering
const ForceGraphComponent = dynamic(() => import('./ForceGraphComponent'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-96">Loading Omni-Singularity Architecture Map...</div>
});

interface Node {
  id: string;
  type: string;
  title: string;
  number: number;
  status: 'open' | 'merged' | 'closed';
  author: string;
  createdAt: string;
  mergedAt?: string;
  isBroadcastPulse: boolean;
  x?: number;
  y?: number;
}

interface Edge {
  source: string;
  target: string;
  type: string;
}

interface OmniMapData {
  metadata: {
    lastUpdated: string;
    totalNodes: number;
    totalEdges: number;
    broadcastPulseCount: number;
  };
  nodes: Node[];
  edges: Edge[];
  broadcastPulseLineage: string[];
}

export default function OmniMapPage() {
  const [mapData, setMapData] = useState<OmniMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  useEffect(() => {
    fetchMapData();
  }, []);

  const fetchMapData = async () => {
    try {
      const response = await fetch('/omni_map.json');
      if (!response.ok) {
        throw new Error('Failed to fetch map data');
      }
      const data = await response.json();
      setMapData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const downloadJSON = () => {
    if (!mapData) return;
    
    const dataStr = JSON.stringify(mapData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'omni_map.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="text-cyan-400 mt-4 text-lg">Loading Omni-Singularity Architecture Map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-red-500 text-2xl mb-4">Error Loading Map</h1>
          <p className="text-gray-400">{error}</p>
          <button 
            onClick={fetchMapData}
            className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!mapData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400">No map data available</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkTheme ? 'bg-black' : 'bg-white'}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkTheme ? 'text-cyan-400' : 'text-blue-600'}`}>
              ⚡ Omni-Singularity Architecture Map
            </h1>
            <p className={`text-sm mt-2 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
              Cosmic Replay Terminal - PR Evolution & Broadcast Pulse Lineage
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setIsDarkTheme(!isDarkTheme)}
              className={`px-4 py-2 rounded transition-colors ${
                isDarkTheme 
                  ? 'bg-gray-800 text-cyan-400 hover:bg-gray-700' 
                  : 'bg-gray-200 text-blue-600 hover:bg-gray-300'
              }`}
            >
              {isDarkTheme ? '☀️ Light' : '🌙 Dark'}
            </button>
            <button
              onClick={downloadJSON}
              className={`px-4 py-2 rounded transition-colors ${
                isDarkTheme 
                  ? 'bg-cyan-600 text-white hover:bg-cyan-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              📥 Download JSON
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-6 border-b border-gray-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`text-center ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
            <div className={`text-2xl font-bold ${isDarkTheme ? 'text-cyan-400' : 'text-blue-600'}`}>
              {mapData.metadata.totalNodes}
            </div>
            <div className="text-sm">Total Nodes</div>
          </div>
          <div className={`text-center ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
            <div className={`text-2xl font-bold ${isDarkTheme ? 'text-cyan-400' : 'text-blue-600'}`}>
              {mapData.metadata.totalEdges}
            </div>
            <div className="text-sm">Connections</div>
          </div>
          <div className={`text-center ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
            <div className="text-2xl font-bold text-cyan-400">
              {mapData.metadata.broadcastPulseCount}
            </div>
            <div className="text-sm">Broadcast Pulse</div>
          </div>
          <div className={`text-center ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
            <div className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
              Last Updated
            </div>
            <div className="text-xs">
              {new Date(mapData.metadata.lastUpdated).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="p-6 border-b border-gray-800">
        <h3 className={`text-lg font-semibold mb-3 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
          Legend
        </h3>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>Open PRs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-purple-500"></div>
            <span className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>Merged PRs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>Closed PRs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-cyan-400"></div>
            <span className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>Broadcast Pulse Lineage</span>
          </div>
        </div>
      </div>

      {/* Force Graph */}
      <div className="relative">
        {mapData && (
          <ForceGraphComponent 
            data={mapData} 
            isDarkTheme={isDarkTheme}
            onNodeClick={(node: Node) => {
              if (node.number > 0) {
                window.open(`https://github.com/Moneyman334/chaoskey333-frontend/pull/${node.number}`, '_blank');
              }
            }}
          />
        )}
      </div>
    </div>
  );
}