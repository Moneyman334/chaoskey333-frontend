'use client';

import { useState, useEffect } from 'react';
import SeedVisualizer from './components/SeedVisualizer';
import EvolutionHistory from './components/EvolutionHistory';
import DryRunMode from './components/DryRunMode';

interface CosmicEvent {
  id: string;
  timestamp: string;
  type: string;
  data: {
    action: string;
    entityId: string;
    previousState: string;
    newState: string;
    cosmicSignature: string;
  };
}

interface MutationSeed {
  id: string;
  eventId: string;
  audio: {
    frequency: number;
    harmonics: number[];
    duration: number;
  };
  visual: {
    color: string;
    pattern: string;
    intensity: number;
  };
  glyph: {
    symbols: string;
    complexity: number;
    resonance: number;
  };
  timestamp: string;
  confidenceScore: number;
  status?: string;
}

interface OmniConfig {
  omniLinkageEnabled: boolean;
  omniAutoEvolve: boolean;
  omniRequireSignedApproval: boolean;
  omniDebounceMs: number;
  omniRateLimitPerMinute: number;
}

export default function AdminLinkagePage() {
  const [config, setConfig] = useState<OmniConfig | null>(null);
  const [events, setEvents] = useState<CosmicEvent[]>([]);
  const [pendingSeeds, setPendingSeeds] = useState<MutationSeed[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CosmicEvent | null>(null);
  const [generatedSeed, setGeneratedSeed] = useState<MutationSeed | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dryRunMode, setDryRunMode] = useState(false);

  useEffect(() => {
    fetchConfig();
    fetchEvents();
    fetchPendingSeeds();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/omni-config');
      const data = await response.json();
      setConfig(data);
    } catch (err) {
      setError('Failed to fetch configuration');
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/cosmic-replay');
      const data = await response.json();
      if (data.success) {
        setEvents(data.events);
      }
    } catch (err) {
      setError('Failed to fetch cosmic replay events');
    }
  };

  const fetchPendingSeeds = async () => {
    try {
      const response = await fetch('/api/seed-evolution');
      const data = await response.json();
      if (data.success) {
        setPendingSeeds(data.seeds);
      }
    } catch (err) {
      setError('Failed to fetch pending seeds');
    }
  };

  const generateSeed = async (eventId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/cosmic-replay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, action: 'generate_seed' }),
      });
      
      const data = await response.json();
      if (data.success) {
        setGeneratedSeed(data.seed);
        
        // Also create the seed in the evolution system
        await fetch('/api/seed-evolution', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'create', eventId, ...data.seed }),
        });
        
        fetchPendingSeeds(); // Refresh pending seeds
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to generate seed');
    } finally {
      setLoading(false);
    }
  };

  const approveSeed = async (seedId: string, signedApproval?: string) => {
    try {
      const response = await fetch('/api/seed-evolution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          seedId,
          approvalData: {
            approver: 'admin',
            timestamp: new Date().toISOString(),
            method: 'manual_approval',
          },
          signedApproval,
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        fetchPendingSeeds();
        setError(null);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to approve seed');
    }
  };

  const rejectSeed = async (seedId: string) => {
    try {
      const response = await fetch('/api/seed-evolution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', seedId }),
      });
      
      const data = await response.json();
      if (data.success) {
        fetchPendingSeeds();
        setError(null);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to reject seed');
    }
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">Loading Omni-Singularity Linkage Protocol...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-center">
            ⚡ Omni-Singularity Linkage Protocol ⚡
          </h1>
          <div className="text-center text-gray-400">
            <p>Cosmic Replay Terminal → Relic Evolution Queue Integration</p>
          </div>
          
          {/* Configuration Status */}
          <div className="mt-6 p-4 bg-gray-900 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Configuration Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className={`p-2 rounded ${config.omniLinkageEnabled ? 'bg-green-900' : 'bg-red-900'}`}>
                Linkage: {config.omniLinkageEnabled ? '✅ Enabled' : '❌ Disabled'}
              </div>
              <div className={`p-2 rounded ${config.omniAutoEvolve ? 'bg-yellow-900' : 'bg-blue-900'}`}>
                Auto-Evolve: {config.omniAutoEvolve ? '🤖 Enabled' : '👤 Manual'}
              </div>
              <div className={`p-2 rounded ${config.omniRequireSignedApproval ? 'bg-purple-900' : 'bg-gray-700'}`}>
                Signatures: {config.omniRequireSignedApproval ? '🔐 Required' : '📝 Optional'}
              </div>
            </div>
          </div>

          {/* Dry Run Mode Toggle */}
          <div className="mt-4 text-center">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={dryRunMode}
                onChange={(e) => setDryRunMode(e.target.checked)}
                className="mr-2"
              />
              <span className="text-yellow-400">🔍 Dry-Run Mode (Preview Only)</span>
            </label>
          </div>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-900 text-red-100 rounded-lg">
            <strong>Error:</strong> {error}
          </div>
        )}

        {dryRunMode && (
          <DryRunMode 
            events={events} 
            onPreview={(eventId) => generateSeed(eventId)}
            generatedSeed={generatedSeed}
          />
        )}

        {!dryRunMode && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cosmic Replay Events */}
            <div className="space-y-6">
              <section className="bg-gray-900 p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4">🌌 Cosmic Replay Events</h2>
                <div className="space-y-3">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className={`p-4 rounded border-l-4 cursor-pointer transition-colors ${
                        selectedEvent?.id === event.id
                          ? 'bg-blue-900 border-blue-400'
                          : 'bg-gray-800 border-gray-600 hover:bg-gray-700'
                      }`}
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-mono text-sm text-gray-400">{event.id}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm">
                        <div><strong>Entity:</strong> {event.data.entityId}</div>
                        <div><strong>Action:</strong> {event.data.action}</div>
                        <div><strong>State:</strong> {event.data.previousState} → {event.data.newState}</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {selectedEvent && (
                  <div className="mt-4 p-4 bg-black rounded">
                    <h3 className="font-semibold mb-2">Generate Mutation Seed</h3>
                    <button
                      onClick={() => generateSeed(selectedEvent.id)}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded transition-colors"
                    >
                      {loading ? '⏳ Generating...' : '🔮 Generate Seed'}
                    </button>
                  </div>
                )}
              </section>

              {/* Generated Seed Preview */}
              {generatedSeed && (
                <SeedVisualizer 
                  seed={generatedSeed} 
                  onApprove={() => approveSeed(generatedSeed.id)}
                  onReject={() => rejectSeed(generatedSeed.id)}
                  requiresSignature={config.omniRequireSignedApproval}
                />
              )}
            </div>

            {/* Pending Seeds & Evolution History */}
            <div className="space-y-6">
              <section className="bg-gray-900 p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4">⏳ Pending Approvals</h2>
                {pendingSeeds.length === 0 ? (
                  <p className="text-gray-400">No pending seeds for approval</p>
                ) : (
                  <div className="space-y-3">
                    {pendingSeeds.map((seed) => (
                      <div key={seed.id} className="p-4 bg-gray-800 rounded">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-mono text-sm text-gray-400">{seed.id}</span>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => approveSeed(seed.id)}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
                            >
                              ✅ Approve
                            </button>
                            <button
                              onClick={() => rejectSeed(seed.id)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
                            >
                              ❌ Reject
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          Confidence: {(seed.confidenceScore * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">
                          Event: {seed.eventId}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <EvolutionHistory />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}