'use client';

import { useEffect, useState } from 'react';
import OmniMap from '../components/OmniMap';
import ReplayCapsule from '../components/ReplayCapsule';

interface Replay {
  id: string;
  pr: number;
  title: string;
  duration: number;
  tags: string[];
  locales: string[];
  status: 'LIVE' | 'MUTATING' | 'ARCHIVED';
}

export default function MapPage() {
  const [replays, setReplays] = useState<Replay[]>([]);
  const [selectedReplay, setSelectedReplay] = useState<Replay | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch replay data
    fetch('/api/replay')
      .then(res => res.json())
      .then(data => {
        setReplays(data.replays || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load replays:', err);
        setLoading(false);
      });
  }, []);

  const handleNodeClick = (replay: Replay) => {
    setSelectedReplay(replay);
    setCurrentTime(0);
  };

  const handleTimeChange = (time: number) => {
    setCurrentTime(time);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚡</div>
          <div>Loading Omni-Singularity Map...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex h-screen">
        {/* Map Section */}
        <div className="flex-1 relative">
          <div className="absolute top-4 left-4 z-10">
            <h1 className="text-2xl font-bold text-cyan-400">
              Omni-Singularity Map
            </h1>
            <p className="text-sm text-gray-400">
              Click any PR constellation to open Replay Capsule
            </p>
          </div>
          
          <OmniMap
            replays={replays}
            onNodeClick={handleNodeClick}
            selectedReplay={selectedReplay}
            currentTime={currentTime}
          />
        </div>

        {/* Replay Section */}
        {selectedReplay && (
          <div className="w-96 border-l border-gray-800 bg-gray-900">
            <div className="p-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-cyan-400">
                Cosmic Replay Terminal
              </h2>
              <button 
                onClick={() => setSelectedReplay(null)}
                className="text-gray-400 hover:text-white text-sm mt-1"
              >
                ✕ Close
              </button>
            </div>
            
            <ReplayCapsule
              replay={selectedReplay}
              currentTime={currentTime}
              onTimeChange={handleTimeChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}