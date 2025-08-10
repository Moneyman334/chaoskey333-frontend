'use client';

import { useState } from 'react';

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
}

interface DryRunModeProps {
  events: CosmicEvent[];
  onPreview: (eventId: string) => void;
  generatedSeed: MutationSeed | null;
}

interface DryRunDiff {
  type: 'addition' | 'modification' | 'deletion';
  target: string;
  before?: any;
  after?: any;
  description: string;
}

export default function DryRunMode({ events, onPreview, generatedSeed }: DryRunModeProps) {
  const [selectedEvent, setSelectedEvent] = useState<CosmicEvent | null>(null);
  const [showDiff, setShowDiff] = useState(false);
  const [diffs, setDiffs] = useState<DryRunDiff[]>([]);

  const generateDryRunDiff = (seed: MutationSeed) => {
    // Simulate what changes would be made
    const mockDiffs: DryRunDiff[] = [
      {
        type: 'modification',
        target: 'vault/relics/relic_333_alpha',
        before: { state: 'dormant', energy: 0.3, resonance: 0.1 },
        after: { state: 'awakening', energy: 0.7, resonance: seed.glyph.resonance },
        description: 'Relic state evolution triggered by cosmic replay event',
      },
      {
        type: 'addition',
        target: 'metadata/nft/evolution_log',
        after: {
          seedId: seed.id,
          timestamp: seed.timestamp,
          audioSignature: `${seed.audio.frequency}Hz`,
          visualPattern: seed.visual.pattern,
          glyphSymbols: seed.glyph.symbols,
        },
        description: 'New evolution entry added to NFT metadata',
      },
      {
        type: 'modification',
        target: 'public/loops/cosmic_frequency',
        before: { frequency: 432, amplitude: 0.5 },
        after: { frequency: Math.round(seed.audio.frequency), amplitude: seed.audio.harmonics[0] || 0.5 },
        description: 'Public frequency loop updated to match seed resonance',
      },
      {
        type: 'addition',
        target: 'webhooks/synchronization_queue',
        after: {
          eventType: 'relic_evolution',
          targets: ['terminal', 'hud', 'vault'],
          payload: { seedId: seed.id, evolutionLevel: seed.glyph.complexity },
        },
        description: 'Webhook events queued for cross-system synchronization',
      },
    ];

    setDiffs(mockDiffs);
    setShowDiff(true);
  };

  const handlePreview = (eventId: string) => {
    onPreview(eventId);
    if (generatedSeed) {
      setTimeout(() => generateDryRunDiff(generatedSeed), 500);
    }
  };

  const getDiffColor = (type: string) => {
    switch (type) {
      case 'addition': return 'text-green-400 bg-green-900';
      case 'modification': return 'text-yellow-400 bg-yellow-900';
      case 'deletion': return 'text-red-400 bg-red-900';
      default: return 'text-gray-400 bg-gray-800';
    }
  };

  const getDiffIcon = (type: string) => {
    switch (type) {
      case 'addition': return '+';
      case 'modification': return '~';
      case 'deletion': return '-';
      default: return '?';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-yellow-900 p-4 rounded-lg border-l-4 border-yellow-400">
        <h2 className="text-xl font-semibold mb-2 text-yellow-100">🔍 Dry-Run Mode Active</h2>
        <p className="text-yellow-200 text-sm">
          Preview mode enabled. All operations will show projected changes without committing to the evolution queue.
          Review the impact before switching to live mode.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Selection for Preview */}
        <div className="bg-gray-900 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Select Event for Preview</h3>
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className={`p-3 rounded border cursor-pointer transition-colors ${
                  selectedEvent?.id === event.id
                    ? 'bg-blue-900 border-blue-400'
                    : 'bg-gray-800 border-gray-600 hover:bg-gray-700'
                }`}
                onClick={() => setSelectedEvent(event)}
              >
                <div className="flex justify-between items-start text-sm">
                  <span className="font-mono text-gray-400">{event.id}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-sm mt-1">
                  <div><strong>Entity:</strong> {event.data.entityId}</div>
                  <div><strong>Action:</strong> {event.data.action}</div>
                </div>
              </div>
            ))}
          </div>
          
          {selectedEvent && (
            <div className="mt-4">
              <button
                onClick={() => handlePreview(selectedEvent.id)}
                className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded transition-colors"
              >
                🔍 Generate Preview
              </button>
            </div>
          )}
        </div>

        {/* Seed Preview (if generated) */}
        {generatedSeed && (
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Generated Seed Preview</h3>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-gray-800 rounded">
                <div className="font-semibold text-blue-400">Audio Component</div>
                <div>Frequency: {generatedSeed.audio.frequency.toFixed(1)} Hz</div>
                <div>Duration: {generatedSeed.audio.duration.toFixed(1)}s</div>
              </div>
              
              <div className="p-3 bg-gray-800 rounded">
                <div className="font-semibold text-purple-400">Visual Component</div>
                <div>Pattern: {generatedSeed.visual.pattern}</div>
                <div className="flex items-center">
                  Color: 
                  <div 
                    className="w-4 h-4 rounded ml-2 border border-gray-600"
                    style={{ backgroundColor: generatedSeed.visual.color }}
                  ></div>
                </div>
              </div>
              
              <div className="p-3 bg-gray-800 rounded">
                <div className="font-semibold text-orange-400">Glyph Component</div>
                <div>Symbols: {generatedSeed.glyph.symbols}</div>
                <div>Complexity: {generatedSeed.glyph.complexity}/5</div>
              </div>
              
              <div className="p-3 bg-gray-800 rounded">
                <div className="font-semibold text-green-400">Metadata</div>
                <div>Confidence: {(generatedSeed.confidenceScore * 100).toFixed(1)}%</div>
                <div className="text-xs text-gray-400 font-mono">{generatedSeed.id}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Projected Changes Diff */}
      {showDiff && diffs.length > 0 && (
        <div className="bg-gray-900 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">📋 Projected Changes (Diff Preview)</h3>
          <div className="space-y-4">
            {diffs.map((diff, index) => (
              <div key={index} className="border-l-4 border-gray-600 pl-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-mono ${getDiffColor(diff.type)}`}>
                    {getDiffIcon(diff.type)} {diff.type.toUpperCase()}
                  </span>
                  <span className="font-mono text-sm text-gray-300">{diff.target}</span>
                </div>
                
                <div className="text-sm text-gray-400 mb-2">{diff.description}</div>
                
                {diff.before && (
                  <div className="bg-red-900 bg-opacity-30 p-2 rounded text-xs">
                    <div className="text-red-300 font-semibold mb-1">- Before:</div>
                    <pre className="text-red-100 whitespace-pre-wrap">
                      {JSON.stringify(diff.before, null, 2)}
                    </pre>
                  </div>
                )}
                
                {diff.after && (
                  <div className="bg-green-900 bg-opacity-30 p-2 rounded text-xs mt-1">
                    <div className="text-green-300 font-semibold mb-1">+ After:</div>
                    <pre className="text-green-100 whitespace-pre-wrap">
                      {JSON.stringify(diff.after, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-900 bg-opacity-30 rounded border border-blue-500">
            <h4 className="font-semibold text-blue-300 mb-2">Impact Summary</h4>
            <div className="text-sm text-blue-100">
              <div>• {diffs.filter(d => d.type === 'addition').length} new entries will be created</div>
              <div>• {diffs.filter(d => d.type === 'modification').length} existing entries will be modified</div>
              <div>• {diffs.filter(d => d.type === 'deletion').length} entries will be removed</div>
              <div className="mt-2 text-xs text-blue-200">
                Switch to live mode to commit these changes to the Relic Evolution queue.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}