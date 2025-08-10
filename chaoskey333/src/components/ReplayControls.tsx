'use client';

import React from 'react';

interface ReplayControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
}

export const ReplayControls: React.FC<ReplayControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  onPlay,
  onPause,
  onSeek
}) => {
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeekbarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseInt(event.target.value);
    onSeek(time);
  };

  return (
    <div className="replay-controls bg-gray-800 text-white p-4 rounded-lg mt-4">
      <div className="flex items-center space-x-4">
        {/* Play/Pause Button */}
        <button
          onClick={isPlaying ? onPause : onPlay}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
          aria-label={isPlaying ? 'Pause replay' : 'Play replay'}
        >
          <span>{isPlaying ? '⏸️' : '▶️'}</span>
          <span>{isPlaying ? 'Pause' : 'Play'}</span>
        </button>

        {/* Time Display */}
        <div className="text-sm">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        {/* Progress Bar */}
        <div className="flex-1">
          <input
            type="range"
            min={0}
            max={duration}
            value={currentTime}
            onChange={handleSeekbarChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            aria-label="Replay timeline scrubber"
          />
        </div>

        {/* Additional Controls */}
        <div className="flex space-x-2">
          <button
            onClick={() => onSeek(Math.max(0, currentTime - 10))}
            className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-sm"
            aria-label="Rewind 10 seconds"
          >
            ⏪ 10s
          </button>
          <button
            onClick={() => onSeek(Math.min(duration, currentTime + 10))}
            className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-sm"
            aria-label="Fast forward 10 seconds"
          >
            10s ⏩
          </button>
        </div>
      </div>
    </div>
  );
};