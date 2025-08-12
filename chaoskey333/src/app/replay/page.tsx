'use client';

import { useState } from 'react';
import { EvolutionBadge } from '@/components/EvolutionBadge';

export default function ReplayTerminal() {
  const [broadcastId, setBroadcastId] = useState('');
  const [relicId, setRelicId] = useState('');
  const [rollupData, setRollupData] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload = {
        broadcastId,
        relicId,
        rollupData: JSON.parse(rollupData || '{}'),
        timestamp: Date.now()
      };

      const response = await fetch('/api/replay/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process rollup');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const generateSampleData = () => {
    setBroadcastId(`broadcast_${Date.now()}`);
    setRelicId(`relic_${Math.floor(Math.random() * 1000)}`);
    setRollupData(JSON.stringify({
      events: [
        { type: 'energy_surge', intensity: Math.random() * 100 },
        { type: 'resonance_shift', frequency: Math.random() * 50 },
        { type: 'chaos_injection', volume: Math.random() * 75 }
      ],
      metadata: {
        source: 'cosmic_replay',
        quality: 'high',
        duration: Math.floor(Math.random() * 3600)
      }
    }, null, 2));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-purple-400 mb-2">
            Cosmic Replay Terminal
          </h1>
          <p className="text-gray-300 mb-4">
            Submit replay rollups to trigger relic evolution
          </p>
          <EvolutionBadge className="bg-purple-900 text-purple-200 border-purple-700" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-300">
              Submit Replay Rollup
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Broadcast ID
                </label>
                <input
                  type="text"
                  value={broadcastId}
                  onChange={(e) => setBroadcastId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="broadcast_12345"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Relic ID
                </label>
                <input
                  type="text"
                  value={relicId}
                  onChange={(e) => setRelicId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="relic_789"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rollup Data (JSON)
                </label>
                <textarea
                  value={rollupData}
                  onChange={(e) => setRollupData(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                  placeholder='{"events": [], "metadata": {}}'
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Submit Rollup'}
                </button>
                
                <button
                  type="button"
                  onClick={generateSampleData}
                  className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Generate Sample
                </button>
              </div>
            </form>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-300">
              Response
            </h2>
            
            {error && (
              <div className="bg-red-900 border border-red-700 rounded-md p-4 mb-4">
                <h3 className="text-red-300 font-medium mb-2">Error</h3>
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {result && (
              <div className="bg-green-900 border border-green-700 rounded-md p-4">
                <h3 className="text-green-300 font-medium mb-2">Success</h3>
                <pre className="text-green-200 text-sm whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}

            {!error && !result && (
              <div className="text-gray-400 text-center py-8">
                Submit a rollup to see the response
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-purple-300">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-700 rounded-md p-4">
              <h3 className="font-medium text-purple-300 mb-2">1. Rollup Ingestion</h3>
              <p className="text-gray-300">
                Replay data is validated, stored, and checked against rate limits and cooldowns.
              </p>
            </div>
            <div className="bg-gray-700 rounded-md p-4">
              <h3 className="font-medium text-purple-300 mb-2">2. Evolution Queueing</h3>
              <p className="text-gray-300">
                When minimum signals are reached, a mutation job is queued with a deterministic seed.
              </p>
            </div>
            <div className="bg-gray-700 rounded-md p-4">
              <h3 className="font-medium text-purple-300 mb-2">3. Trait Application</h3>
              <p className="text-gray-300">
                Cron job processes the queue and applies new traits to relics based on the mutation seed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}