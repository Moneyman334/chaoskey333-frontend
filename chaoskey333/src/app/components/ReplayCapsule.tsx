'use client';

import { useState, useEffect } from 'react';
import PulseBadge from './PulseBadge';
import SpectralHUD from './SpectralHUD';

interface Replay {
  id: string;
  pr: number;
  title: string;
  duration: number;
  tags: string[];
  locales: string[];
  status: 'LIVE' | 'MUTATING' | 'ARCHIVED';
}

interface ReplayCapsuleProps {
  replay: Replay;
  currentTime: number;
  onTimeChange: (time: number) => void;
}

// Mock glyph data for demonstration
const mockGlyphs = [
  { time: 30, symbol: '⚡', text: 'Cosmic activation sequence', x: 50, y: 30 },
  { time: 60, symbol: '🔮', text: 'Reality anchor established', x: 70, y: 50 },
  { time: 90, symbol: '∞', text: 'Infinite loop detected', x: 30, y: 70 },
  { time: 120, symbol: '🌀', text: 'Dimensional breach opening', x: 80, y: 20 }
];

export default function ReplayCapsule({ replay, currentTime, onTimeChange }: ReplayCapsuleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [spectralHUDEnabled, setSpectralHUDEnabled] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState(replay.locales[0] || 'en');
  const [notes, setNotes] = useState('');
  const [playbackTime, setPlaybackTime] = useState(currentTime);

  useEffect(() => {
    setPlaybackTime(currentTime);
  }, [currentTime]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && playbackTime < replay.duration) {
      interval = setInterval(() => {
        setPlaybackTime(prev => {
          const newTime = prev + 1;
          onTimeChange(newTime);
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, playbackTime, replay.duration, onTimeChange]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (time: number) => {
    setPlaybackTime(time);
    onTimeChange(time);
  };

  const activeGlyphs = mockGlyphs.filter(glyph => 
    playbackTime >= glyph.time && playbackTime < glyph.time + 10
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <PulseBadge status={replay.status} />
          <div className="text-xs text-gray-400">PR #{replay.pr}</div>
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">{replay.title}</h3>
        <div className="text-sm text-gray-400">
          {replay.tags.map(tag => `#${tag}`).join(' ')}
        </div>
      </div>

      {/* Video/Media Area */}
      <div className="relative flex-1 bg-black">
        {/* Mock video placeholder */}
        <div className="w-full h-64 bg-gray-900 flex items-center justify-center border border-gray-700">
          <div className="text-center">
            <div className="text-4xl mb-2">📺</div>
            <div className="text-gray-400">Mock Video Player</div>
            <div className="text-sm text-gray-500 mt-1">
              {replay.id} • {Math.floor(playbackTime / 60)}:{(playbackTime % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Glyph Overlays */}
        {activeGlyphs.map((glyph, index) => (
          <div
            key={index}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              left: `${glyph.x}%`,
              top: `${glyph.y}%`
            }}
          >
            <div className="bg-cyan-500 bg-opacity-80 text-black px-2 py-1 rounded text-sm font-bold animate-pulse">
              {glyph.symbol}
            </div>
            <div className="bg-black bg-opacity-80 text-cyan-400 px-2 py-1 rounded text-xs mt-1 max-w-32">
              {glyph.text}
            </div>
          </div>
        ))}

        {/* Spectral HUD Overlay */}
        {spectralHUDEnabled && (
          <div className="absolute inset-0 pointer-events-none">
            <SpectralHUD replay={replay} currentTime={playbackTime} />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-gray-800">
        {/* Playback controls */}
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={handlePlayPause}
            className="w-10 h-10 bg-cyan-500 hover:bg-cyan-600 rounded-full flex items-center justify-center text-black font-bold"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          
          <div className="flex-1">
            <input
              type="range"
              min="0"
              max={replay.duration}
              value={playbackTime}
              onChange={(e) => handleSeek(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{Math.floor(playbackTime / 60)}:{(playbackTime % 60).toString().padStart(2, '0')}</span>
              <span>{Math.floor(replay.duration / 60)}:{(replay.duration % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>
        </div>

        {/* Feature toggles */}
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => setSpectralHUDEnabled(!spectralHUDEnabled)}
            className={`px-3 py-1 rounded text-sm ${
              spectralHUDEnabled 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            👁 Spectral HUD
          </button>

          <select
            value={selectedLocale}
            onChange={(e) => setSelectedLocale(e.target.value)}
            className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
          >
            {replay.locales.map(locale => (
              <option key={locale} value={locale}>
                {locale.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Notes section */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Session Notes:</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add your observations..."
            className="w-full h-16 bg-gray-800 text-white px-3 py-2 rounded text-sm resize-none"
          />
        </div>
      </div>
    </div>
  );
}