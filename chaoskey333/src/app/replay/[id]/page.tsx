'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ReplayCapsule from '../../components/ReplayCapsule';
import Link from 'next/link';

interface Replay {
  id: string;
  pr: number;
  title: string;
  duration: number;
  tags: string[];
  locales: string[];
  status: 'LIVE' | 'MUTATING' | 'ARCHIVED';
}

export default function ReplayPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const replayId = params.id as string;
  
  const [replay, setReplay] = useState<Replay | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Parse URL parameters
    const timestamp = searchParams.get('ts');
    const spectralMode = searchParams.get('spectral');
    
    if (timestamp) {
      setCurrentTime(parseInt(timestamp));
    }

    // Fetch replay data
    fetch('/api/replay')
      .then(res => res.json())
      .then(data => {
        const foundReplay = data.replays?.find((r: Replay) => r.id === replayId);
        if (foundReplay) {
          setReplay(foundReplay);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load replay:', err);
        setLoading(false);
      });
  }, [replayId, searchParams]);

  const handleTimeChange = (time: number) => {
    setCurrentTime(time);
    
    // Update URL with current timestamp
    const url = new URL(window.location.href);
    url.searchParams.set('ts', time.toString());
    window.history.replaceState({}, '', url.toString());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚡</div>
          <div>Loading Replay Capsule...</div>
        </div>
      </div>
    );
  }

  if (!replay) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold mb-4">Replay Not Found</h1>
          <p className="text-gray-400 mb-6">
            The replay capsule &quot;{replayId}&quot; could not be located in the cosmic archive.
          </p>
          <Link 
            href="/map"
            className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-black px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            🗺 Return to Omni-Singularity Map
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-cyan-400">
                Cosmic Replay Terminal
              </h1>
              <p className="text-sm text-gray-400">
                Deep link: /replay/{replayId}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  const url = `/replay/${replayId}?ts=${currentTime}&spectral=1`;
                  navigator.clipboard.writeText(window.location.origin + url);
                  alert('Shareable link copied to clipboard!');
                }}
                className="text-sm bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded"
              >
                📋 Share Link
              </button>
              <Link 
                href="/map"
                className="text-sm bg-cyan-500 hover:bg-cyan-600 text-black px-4 py-2 rounded font-semibold"
              >
                🗺 Map View
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Replay Content */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <ReplayCapsule
            replay={replay}
            currentTime={currentTime}
            onTimeChange={handleTimeChange}
          />
        </div>

        {/* Additional Info */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-cyan-400 mb-2">Metadata</h3>
            <div className="space-y-2 text-sm">
              <div><span className="text-gray-400">PR:</span> #{replay.pr}</div>
              <div><span className="text-gray-400">Duration:</span> {Math.floor(replay.duration / 60)}:{(replay.duration % 60).toString().padStart(2, '0')}</div>
              <div><span className="text-gray-400">Status:</span> {replay.status}</div>
              <div><span className="text-gray-400">Locales:</span> {replay.locales.join(', ')}</div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-cyan-400 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {replay.tags.map(tag => (
                <span 
                  key={tag}
                  className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-cyan-400 mb-2">Navigation</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-400">Current Time:</span>{' '}
                {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}
              </div>
              <div>
                <span className="text-gray-400">Progress:</span>{' '}
                {((currentTime / replay.duration) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}