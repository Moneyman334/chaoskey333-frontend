'use client';

import { useState, useEffect } from 'react';

interface EvolutionHistoryEntry {
  timestamp: string;
  action: string;
  details: any;
  signature?: string;
}

interface HistorySeed {
  id: string;
  status: string;
  timestamp: string;
  confidenceScore: number;
  eventId: string;
}

export default function EvolutionHistory() {
  const [history, setHistory] = useState<{ [seedId: string]: EvolutionHistoryEntry[] }>({});
  const [completedSeeds, setCompletedSeeds] = useState<HistorySeed[]>([]);
  const [selectedSeed, setSelectedSeed] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEvolutionHistory();
  }, []);

  const fetchEvolutionHistory = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from an actual endpoint
      // For now, we'll simulate some completed seeds
      const mockCompletedSeeds: HistorySeed[] = [
        {
          id: 'seed_1704896400000',
          status: 'completed',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          confidenceScore: 0.87,
          eventId: 'evt_001',
        },
        {
          id: 'seed_1704892800000',
          status: 'rolled_back',
          timestamp: new Date(Date.now() - 14400000).toISOString(),
          confidenceScore: 0.72,
          eventId: 'evt_002',
        },
      ];

      const mockHistory = {
        'seed_1704896400000': [
          {
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            action: 'seed_created',
            details: { source: 'cosmic_replay_terminal' },
          },
          {
            timestamp: new Date(Date.now() - 7180000).toISOString(),
            action: 'approved',
            details: { approver: 'admin', method: 'manual_approval' },
            signature: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
          },
          {
            timestamp: new Date(Date.now() - 7170000).toISOString(),
            action: 'evolution_started',
            details: { phase: 'vault_update' },
          },
          {
            timestamp: new Date(Date.now() - 7160000).toISOString(),
            action: 'evolution_completed',
            details: {
              vaultUpdated: true,
              nftMetadataUpdated: true,
              publicLoopsUpdated: true,
            },
          },
        ],
        'seed_1704892800000': [
          {
            timestamp: new Date(Date.now() - 14400000).toISOString(),
            action: 'seed_created',
            details: { source: 'cosmic_replay_terminal' },
          },
          {
            timestamp: new Date(Date.now() - 14380000).toISOString(),
            action: 'approved',
            details: { approver: 'admin', method: 'manual_approval' },
          },
          {
            timestamp: new Date(Date.now() - 14370000).toISOString(),
            action: 'evolution_started',
            details: { phase: 'vault_update' },
          },
          {
            timestamp: new Date(Date.now() - 14360000).toISOString(),
            action: 'rolled_back',
            details: { reason: 'Unexpected side effects detected' },
          },
        ],
      };

      setCompletedSeeds(mockCompletedSeeds);
      setHistory(mockHistory);
    } catch (error) {
      console.error('Failed to fetch evolution history:', error);
    } finally {
      setLoading(false);
    }
  };

  const rollbackSeed = async (seedId: string) => {
    try {
      const response = await fetch('/api/seed-evolution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rollback', seedId }),
      });
      
      const data = await response.json();
      if (data.success) {
        fetchEvolutionHistory(); // Refresh history
      }
    } catch (error) {
      console.error('Failed to rollback seed:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'evolving': return 'text-yellow-400';
      case 'rolled_back': return 'text-red-400';
      case 'rejected': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'evolving': return '⏳';
      case 'rolled_back': return '↩️';
      case 'rejected': return '❌';
      default: return '❓';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'seed_created': return '🌱';
      case 'approved': return '✅';
      case 'evolution_started': return '🚀';
      case 'evolution_completed': return '🎉';
      case 'rolled_back': return '↩️';
      case 'rejected': return '❌';
      default: return '📝';
    }
  };

  if (loading) {
    return (
      <section className="bg-gray-900 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">📚 Evolution History</h2>
        <div className="text-center text-gray-400">Loading history...</div>
      </section>
    );
  }

  return (
    <section className="bg-gray-900 p-6 rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">📚 Evolution History</h2>
      
      {completedSeeds.length === 0 ? (
        <p className="text-gray-400">No evolution history available</p>
      ) : (
        <div className="space-y-4">
          {completedSeeds.map((seed) => (
            <div key={seed.id} className="bg-gray-800 rounded-lg overflow-hidden">
              <div 
                className="p-4 cursor-pointer hover:bg-gray-700 transition-colors"
                onClick={() => setSelectedSeed(selectedSeed === seed.id ? null : seed.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-mono text-sm text-gray-400">{seed.id}</div>
                    <div className={`font-semibold ${getStatusColor(seed.status)}`}>
                      {getStatusIcon(seed.status)} {seed.status.toUpperCase()}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-gray-400">
                      {new Date(seed.timestamp).toLocaleDateString()}
                    </div>
                    <div className="text-gray-500">
                      Confidence: {(seed.confidenceScore * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
                
                {seed.status === 'completed' && (
                  <div className="mt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        rollbackSeed(seed.id);
                      }}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
                    >
                      ↩️ Rollback
                    </button>
                  </div>
                )}
              </div>
              
              {selectedSeed === seed.id && history[seed.id] && (
                <div className="border-t border-gray-700 p-4 bg-gray-850">
                  <h4 className="font-semibold mb-3 text-blue-400">Evolution Timeline</h4>
                  <div className="space-y-3">
                    {history[seed.id].map((entry, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="text-lg">{getActionIcon(entry.action)}</div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm capitalize">
                            {entry.action.replace(/_/g, ' ')}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(entry.timestamp).toLocaleString()}
                          </div>
                          {entry.details && (
                            <div className="text-xs text-gray-500 mt-1">
                              {typeof entry.details === 'object' 
                                ? Object.entries(entry.details).map(([key, value]) => (
                                    <div key={key}>
                                      {key}: {typeof value === 'boolean' ? (value ? '✅' : '❌') : String(value)}
                                    </div>
                                  ))
                                : String(entry.details)
                              }
                            </div>
                          )}
                          {entry.signature && (
                            <div className="text-xs text-purple-400 mt-1 font-mono">
                              🔐 {entry.signature.substring(0, 20)}...
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}