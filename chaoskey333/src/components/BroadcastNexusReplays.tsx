'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SpectralDecodeHUD } from './SpectralDecodeHUD';
import { ReplayControls } from './ReplayControls';
import { AnalyticsProvider } from '../providers/AnalyticsProvider';

interface BroadcastNexusReplaysProps {
  replayData?: any;
  isVaultMode?: boolean;
}

export const BroadcastNexusReplays: React.FC<BroadcastNexusReplaysProps> = ({
  replayData,
  isVaultMode = true
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(100); // Default duration
  const [hudVisible, setHudVisible] = useState(false);

  // Feature flag check
  const spectralHudEnabled = useMemo(() => {
    const envFlag = process.env.NEXT_PUBLIC_ENABLE_SPECTRAL_HUD;
    // Default ON for Vault mode as per requirements
    return envFlag === 'true' || (isVaultMode && envFlag !== 'false');
  }, [isVaultMode]);

  // Timeline management
  const progress = useMemo(() => (currentTime / duration) * 100, [currentTime, duration]);

  // Keyboard event handler for HUD toggle (H key)
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'h' && spectralHudEnabled) {
        setHudVisible(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [spectralHudEnabled]);

  // Replay controls
  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleSeek = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  // Simulation of replay timeline progression
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        if (prev >= duration) {
          setIsPlaying(false);
          return duration;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  if (!spectralHudEnabled) {
    return (
      <div className="broadcast-nexus-replays">
        <h2>🎬 Broadcast Nexus Replays</h2>
        <p>Spectral HUD is currently disabled.</p>
        <ReplayControls
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          onPlay={handlePlay}
          onPause={handlePause}
          onSeek={handleSeek}
        />
      </div>
    );
  }

  return (
    <AnalyticsProvider>
      <div className="broadcast-nexus-replays relative">
        <h2>🎬 Broadcast Nexus Replays</h2>
        
        {/* Main replay viewer */}
        <div className="replay-container relative bg-gray-900 rounded-lg overflow-hidden">
          <div className="replay-content aspect-video bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-4xl mb-4">⚡</div>
              <p>Broadcast Nexus Replay Active</p>
              <p className="text-sm opacity-75">Progress: {progress.toFixed(1)}%</p>
            </div>
          </div>

          {/* Spectral Decode HUD Overlay */}
          {hudVisible && (
            <SpectralDecodeHUD
              currentTime={currentTime}
              duration={duration}
              replayData={replayData}
              onClose={() => setHudVisible(false)}
            />
          )}
        </div>

        {/* Replay Controls */}
        <ReplayControls
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          onPlay={handlePlay}
          onPause={handlePause}
          onSeek={handleSeek}
        />

        {/* HUD Toggle Button */}
        <div className="mt-4">
          <button
            onClick={() => setHudVisible(!hudVisible)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
            aria-label="Toggle Spectral Decode HUD (Press H)"
          >
            {hudVisible ? 'Hide' : 'Show'} Spectral HUD (H)
          </button>
        </div>

        {/* Accessibility info */}
        <div className="mt-2 text-sm text-gray-600">
          Press <kbd className="px-1 py-0.5 bg-gray-200 rounded">H</kbd> to toggle HUD visibility
        </div>
      </div>
    </AnalyticsProvider>
  );
};