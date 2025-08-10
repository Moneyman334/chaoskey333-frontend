"use client";

import React, { useState } from 'react';

interface BroadcastBannerProps {
  message?: string;
  dismissible?: boolean;
  className?: string;
}

export function BroadcastBanner({ 
  message = "🌌 Welcome to the Cosmic Replay Terminal - Your gateway to the blockchain universe", 
  dismissible = true,
  className = ""
}: BroadcastBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className={`bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white px-4 py-3 text-center relative shadow-lg ${className}`}>
      <div className="flex items-center justify-center space-x-2">
        <span className="animate-pulse">⚡</span>
        <span className="font-medium">{message}</span>
        <span className="animate-pulse">⚡</span>
      </div>
      {dismissible && (
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-200 text-xl font-bold"
          aria-label="Dismiss banner"
        >
          ×
        </button>
      )}
    </div>
  );
}