'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import { useI18n } from '../hooks/useI18n';
import { useThrottledCallback } from '../hooks/useThrottledCallback';

interface SpectralDecodeHUDProps {
  currentTime: number;
  duration: number;
  replayData?: any;
  onClose: () => void;
}

interface GlyphData {
  id: string;
  position: { x: number; y: number };
  decoded: boolean;
  symbolType: string;
  timestamp: number;
}

interface WhisperEvent {
  id: string;
  timestamp: number;
  message: string;
  decoded: boolean;
}

export const SpectralDecodeHUD: React.FC<SpectralDecodeHUDProps> = ({
  currentTime,
  duration,
  replayData,
  onClose
}) => {
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [decodingProgress, setDecodingProgress] = useState(0);
  const [activeGlyphs, setActiveGlyphs] = useState<GlyphData[]>([]);
  const [whisperEvents, setWhisperEvents] = useState<WhisperEvent[]>([]);
  const [decodeStep, setDecodeStep] = useState(0);
  
  const hudRef = useRef<HTMLDivElement>(null);
  const { trackEvent } = useAnalytics();
  const { t } = useI18n();

  // Performance optimization: Throttled analyzer updates
  const throttledAnalyzer = useThrottledCallback((time: number) => {
    // Simulate spectral analysis based on timeline
    const newProgress = Math.min((time / duration) * 100, 100);
    setDecodingProgress(newProgress);

    // Simulate glyph detection at specific time intervals
    if (Math.floor(time) % 10 === 0 && time > 0) {
      const newGlyph: GlyphData = {
        id: `glyph-${time}`,
        position: { 
          x: Math.random() * 80 + 10, 
          y: Math.random() * 60 + 20 
        },
        decoded: false,
        symbolType: ['rune', 'cipher', 'sigil'][Math.floor(Math.random() * 3)],
        timestamp: time
      };
      
      setActiveGlyphs(prev => [...prev.slice(-4), newGlyph]); // Keep last 5 glyphs
    }

    // Simulate whisper events
    if (Math.floor(time) % 15 === 0 && time > 0) {
      const whisper: WhisperEvent = {
        id: `whisper-${time}`,
        timestamp: time,
        message: `Spectral frequency detected at ${time}s`,
        decoded: Math.random() > 0.5
      };
      
      setWhisperEvents(prev => [...prev.slice(-2), whisper]); // Keep last 3 whispers
    }
  }, 250); // Throttle to 4fps to optimize performance

  // Track HUD open event
  useEffect(() => {
    trackEvent('replay.hud_open', { timestamp: currentTime });
    
    return () => {
      // Cleanup when component unmounts
    };
  }, []);

  // Update analysis based on current time
  useEffect(() => {
    throttledAnalyzer(currentTime);
  }, [currentTime, throttledAnalyzer]);

  // Lazy load HUD assets (simulated)
  useEffect(() => {
    const loadHUDAssets = async () => {
      // Simulate lazy loading of HUD assets
      await new Promise(resolve => setTimeout(resolve, 100));
    };
    
    loadHUDAssets();
  }, []);

  // Handle glyph decode
  const handleGlyphDecode = (glyphId: string) => {
    setActiveGlyphs(prev => 
      prev.map(glyph => 
        glyph.id === glyphId ? { ...glyph, decoded: true } : glyph
      )
    );
    
    setDecodeStep(prev => prev + 1);
    trackEvent('hud.decode_step', { 
      glyphId, 
      step: decodeStep + 1,
      timestamp: currentTime 
    });

    // Check if all glyphs are decoded
    const allDecoded = activeGlyphs.every(glyph => glyph.decoded || glyph.id === glyphId);
    if (allDecoded && activeGlyphs.length > 0) {
      trackEvent('hud.decode_complete', { 
        totalSteps: decodeStep + 1,
        completionTime: currentTime 
      });
    }
  };

  // Animation frame optimization
  const animationFrame = useRef<number>();
  
  useEffect(() => {
    const animate = () => {
      // Minimal animation updates using requestAnimationFrame
      if (hudRef.current) {
        // Update any smooth animations here
      }
      animationFrame.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  const hudContainerClass = `
    absolute inset-0 z-50 pointer-events-auto
    ${highContrastMode 
      ? 'bg-black bg-opacity-90 text-yellow-400' 
      : 'bg-gray-900 bg-opacity-80 text-white'
    }
    backdrop-blur-sm rounded-lg
  `;

  return (
    <div ref={hudRef} className={hudContainerClass} role="region" aria-label={t('spectralHUD.label', 'Spectral Decode HUD')}>
      {/* HUD Header */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-bold">⚡ {t('spectralHUD.title', 'Spectral Decode')}</h3>
          <div className="text-sm opacity-75">
            {t('spectralHUD.progress', 'Progress')}: {decodingProgress.toFixed(1)}%
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* High Contrast Toggle */}
          <button
            onClick={() => setHighContrastMode(!highContrastMode)}
            className={`px-2 py-1 rounded text-xs ${
              highContrastMode 
                ? 'bg-yellow-600 text-black' 
                : 'bg-gray-700 text-white'
            }`}
            aria-label={t('spectralHUD.highContrast', 'Toggle High Contrast')}
          >
            {highContrastMode ? '🔆' : '🌙'} {t('spectralHUD.contrast', 'Contrast')}
          </button>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
            aria-label={t('spectralHUD.close', 'Close HUD')}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Decoding Progress Bar */}
      <div className="absolute top-16 left-4 right-4">
        <div className={`w-full h-2 rounded-full ${highContrastMode ? 'bg-gray-800' : 'bg-gray-700'}`}>
          <div 
            className={`h-full rounded-full transition-all duration-300 ${
              highContrastMode ? 'bg-yellow-400' : 'bg-purple-500'
            }`}
            style={{ width: `${decodingProgress}%` }}
          />
        </div>
      </div>

      {/* Active Glyphs Overlay */}
      <div className="absolute inset-0">
        {activeGlyphs.map(glyph => (
          <button
            key={glyph.id}
            onClick={() => handleGlyphDecode(glyph.id)}
            className={`absolute w-8 h-8 rounded-full border-2 transition-all duration-300 ${
              glyph.decoded 
                ? (highContrastMode ? 'bg-yellow-400 border-yellow-400 text-black' : 'bg-green-500 border-green-500 text-white')
                : (highContrastMode ? 'bg-gray-800 border-yellow-400 text-yellow-400' : 'bg-purple-600 border-purple-400 text-white')
            } hover:scale-110 cursor-pointer flex items-center justify-center text-xs font-bold`}
            style={{ 
              left: `${glyph.position.x}%`, 
              top: `${glyph.position.y}%` 
            }}
            aria-label={t('spectralHUD.glyph', `${glyph.symbolType} glyph ${glyph.decoded ? 'decoded' : 'undecoded'}`)}
          >
            {glyph.decoded ? '✓' : '⚡'}
          </button>
        ))}
      </div>

      {/* Whisper Events Panel */}
      <div className="absolute bottom-4 left-4 right-4 max-h-32 overflow-y-auto">
        <h4 className="text-sm font-bold mb-2">{t('spectralHUD.whispers', 'Spectral Whispers')}</h4>
        <div className="space-y-1">
          {whisperEvents.map(whisper => (
            <div 
              key={whisper.id}
              className={`text-xs p-2 rounded ${
                highContrastMode 
                  ? 'bg-gray-800 text-yellow-400' 
                  : 'bg-gray-800 bg-opacity-60'
              }`}
              role="alert"
              aria-live="polite"
            >
              <span className="font-mono">[{whisper.timestamp}s]</span>
              <span className="ml-2">
                {whisper.decoded ? '🔓' : '🔒'} {whisper.message}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Captions for Accessibility */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {t('spectralHUD.screenReader', `Spectral decode progress at ${decodingProgress.toFixed(1)}%. ${activeGlyphs.length} active glyphs, ${whisperEvents.length} recent whispers.`)}
      </div>
    </div>
  );
};