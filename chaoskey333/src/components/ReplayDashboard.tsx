'use client';

import { useState, useEffect } from 'react';
import { ReplayManifest } from '@/lib/types/replay';

interface ReplayDashboardProps {
  adminToken: string;
}

export function ReplayDashboard({ adminToken }: ReplayDashboardProps) {
  const [latestReplay, setLatestReplay] = useState<ReplayManifest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Load latest replay on component mount
  useEffect(() => {
    loadLatestReplay();
  }, []);

  const loadLatestReplay = async () => {
    try {
      const response = await fetch('/api/replay/latest');
      if (response.ok) {
        const data = await response.json();
        setLatestReplay(data.replay);
      } else if (response.status === 404) {
        setLatestReplay(null);
      }
    } catch (err) {
      console.error('Failed to load latest replay:', err);
    }
  };

  const createRollup = async () => {
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/replay/rollup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminToken,
          forced: true
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ Replay created successfully! ID: ${data.replayId}`);
        await loadLatestReplay(); // Refresh latest replay
      } else {
        setError(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      setError('❌ Failed to create rollup');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const pinReplay = async (replayId: string, archiveAssets: boolean = false) => {
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/replay/pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminToken,
          replayId,
          archiveAssets
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ ${data.message}`);
      } else {
        setError(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      setError('❌ Failed to pin replay');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatEth = (value: string) => {
    return `${parseFloat(value).toFixed(4)} ETH`;
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="border border-green-400 p-6 rounded-lg mb-6 bg-black/80">
          <h1 className="text-3xl font-bold mb-2">⚡ Cosmic Replay Terminal v2.0</h1>
          <p className="text-green-300">Ascension Edition - Immutable Vault Management</p>
        </div>

        {/* Action Buttons */}
        <div className="border border-green-400 p-6 rounded-lg mb-6 bg-black/80">
          <h2 className="text-xl font-bold mb-4">🚀 Actions</h2>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={createRollup}
              disabled={isLoading}
              className="px-6 py-3 bg-green-400 text-black rounded hover:bg-green-300 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : '📦 Replay Now'}
            </button>
            
            {latestReplay && (
              <>
                <button
                  onClick={() => pinReplay(latestReplay.id, false)}
                  disabled={isLoading}
                  className="px-6 py-3 bg-yellow-400 text-black rounded hover:bg-yellow-300 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  📌 Pin Latest
                </button>
                
                <button
                  onClick={() => pinReplay(latestReplay.id, true)}
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-400 text-black rounded hover:bg-blue-300 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🗄️ Archive Latest
                </button>
              </>
            )}
          </div>
          
          {/* Status Messages */}
          {message && (
            <div className="mt-4 p-3 border border-green-400 rounded bg-green-900/20 text-green-300">
              {message}
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-3 border border-red-400 rounded bg-red-900/20 text-red-300">
              {error}
            </div>
          )}
        </div>

        {/* Latest Replay Display */}
        {latestReplay ? (
          <div className="border border-green-400 p-6 rounded-lg mb-6 bg-black/80">
            <h2 className="text-xl font-bold mb-4">📋 Latest Replay Vault</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Basic Info */}
              <div className="border border-green-300 p-4 rounded">
                <h3 className="font-bold text-green-300 mb-2">📄 Basic Info</h3>
                <div className="space-y-1 text-sm">
                  <div><span className="text-green-200">ID:</span> {latestReplay.id}</div>
                  <div><span className="text-green-200">Version:</span> {latestReplay.version}</div>
                  <div><span className="text-green-200">Created:</span> {formatDate(latestReplay.timestamp)}</div>
                  <div><span className="text-green-200">Chain:</span> {latestReplay.metadata.chainId}</div>
                </div>
              </div>

              {/* Metrics */}
              <div className="border border-green-300 p-4 rounded">
                <h3 className="font-bold text-green-300 mb-2">📊 Metrics</h3>
                <div className="space-y-1 text-sm">
                  <div><span className="text-green-200">Total Mints:</span> {latestReplay.metrics.totalMints}</div>
                  <div><span className="text-green-200">Volume:</span> {formatEth(latestReplay.metrics.totalVolume)}</div>
                  <div><span className="text-green-200">Holders:</span> {latestReplay.metrics.uniqueHolders}</div>
                  <div><span className="text-green-200">Avg Price:</span> {formatEth(latestReplay.metrics.averagePrice)}</div>
                </div>
              </div>

              {/* Pricing */}
              <div className="border border-green-300 p-4 rounded">
                <h3 className="font-bold text-green-300 mb-2">💰 Pricing</h3>
                <div className="space-y-1 text-sm">
                  <div><span className="text-green-200">Floor:</span> {formatEth(latestReplay.pricing.currentFloor)}</div>
                  <div><span className="text-green-200">High Sale:</span> {formatEth(latestReplay.pricing.highestSale)}</div>
                  <div><span className="text-green-200">Royalties:</span> {formatEth(latestReplay.pricing.totalRoyalties)}</div>
                  <div><span className="text-green-200">Events:</span> {latestReplay.events.length}</div>
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="mt-6">
              <h3 className="font-bold text-green-300 mb-3">🏆 Top Minters</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {latestReplay.leaderboard.topMinters.slice(0, 3).map((minter, index) => (
                  <div key={minter.address} className="border border-green-300/50 p-3 rounded bg-green-900/10">
                    <div className="text-sm">
                      <div className="font-bold">#{index + 1} {minter.address.slice(0, 8)}...{minter.address.slice(-6)}</div>
                      <div><span className="text-green-200">Mints:</span> {minter.mintCount}</div>
                      <div><span className="text-green-200">Spent:</span> {formatEth(minter.totalSpent)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assets Status */}
            <div className="mt-6">
              <h3 className="font-bold text-green-300 mb-3">🗂️ Assets</h3>
              <div className="text-sm">
                <div><span className="text-green-200">Thumbnails:</span> {latestReplay.assets.thumbnails.length}</div>
                <div><span className="text-green-200">Videos:</span> {latestReplay.assets.videos.length}</div>
                <div><span className="text-green-200">Metadata:</span> {latestReplay.assets.metadata.length}</div>
                <div><span className="text-green-200">Archived:</span> {latestReplay.assets.archived ? '✅ Yes' : '❌ No'}</div>
                {latestReplay.assets.archiveUrl && (
                  <div><span className="text-green-200">Archive URL:</span> {latestReplay.assets.archiveUrl}</div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-green-400 p-6 rounded-lg mb-6 bg-black/80 text-center">
            <h2 className="text-xl font-bold mb-2">📭 No Replays Found</h2>
            <p className="text-green-300">Create your first replay vault using the &quot;Replay Now&quot; button above.</p>
          </div>
        )}

        {/* System Info */}
        <div className="border border-green-400 p-6 rounded-lg bg-black/80">
          <h2 className="text-xl font-bold mb-4">⚙️ System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div><span className="text-green-200">Automated Rollups:</span> Every 3 hours</div>
              <div><span className="text-green-200">Activity Trigger:</span> 25 mints in 10 minutes</div>
              <div><span className="text-green-200">Storage:</span> Vercel KV</div>
            </div>
            <div>
              <div><span className="text-green-200">App Version:</span> v2.0.0</div>
              <div><span className="text-green-200">Manifest Version:</span> 2.0</div>
              <div><span className="text-green-200">Status:</span> 🟢 Online</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}