'use client';

import { useState, useEffect } from 'react';

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
  status?: string;
}

interface SeedVisualizerProps {
  seed: MutationSeed;
  onApprove: (signedApproval?: string) => void;
  onReject: () => void;
  requiresSignature: boolean;
}

export default function SeedVisualizer({ seed, onApprove, onReject, requiresSignature }: SeedVisualizerProps) {
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [signedApproval, setSignedApproval] = useState('');
  const [showSignature, setShowSignature] = useState(false);

  useEffect(() => {
    // Simulate audio playback
    if (audioPlaying) {
      const timer = setTimeout(() => {
        setAudioPlaying(false);
      }, seed.audio.duration * 1000);
      
      return () => clearTimeout(timer);
    }
  }, [audioPlaying, seed.audio.duration]);

  const playAudio = () => {
    setAudioPlaying(true);
    // In a real implementation, this would trigger Web Audio API synthesis
    console.log(`Playing audio: ${seed.audio.frequency}Hz for ${seed.audio.duration}s`);
  };

  const handleApprove = () => {
    if (requiresSignature && !signedApproval.trim()) {
      setShowSignature(true);
      return;
    }
    onApprove(signedApproval || undefined);
    setShowSignature(false);
    setSignedApproval('');
  };

  return (
    <section className="bg-gray-900 p-6 rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">🔮 Seed Visualizer</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Audio Preview */}
        <div className="bg-gray-800 p-4 rounded">
          <h3 className="font-semibold mb-3 text-blue-400">🎵 Audio Signature</h3>
          <div className="space-y-2 text-sm">
            <div>Frequency: <span className="text-green-400">{seed.audio.frequency.toFixed(1)} Hz</span></div>
            <div>Duration: <span className="text-green-400">{seed.audio.duration.toFixed(1)}s</span></div>
            <div>Harmonics: 
              {seed.audio.harmonics.map((harmonic, i) => (
                <span key={i} className="text-yellow-400 ml-1">{(harmonic * 100).toFixed(0)}%</span>
              ))}
            </div>
          </div>
          <button
            onClick={playAudio}
            disabled={audioPlaying}
            className={`mt-3 px-3 py-1 rounded text-sm transition-colors ${
              audioPlaying 
                ? 'bg-yellow-600 text-yellow-100' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {audioPlaying ? '🔊 Playing...' : '▶️ Preview Audio'}
          </button>
        </div>

        {/* Visual Preview */}
        <div className="bg-gray-800 p-4 rounded">
          <h3 className="font-semibold mb-3 text-purple-400">🎨 Visual Manifestation</h3>
          <div className="space-y-2 text-sm mb-3">
            <div>Pattern: <span className="text-green-400 capitalize">{seed.visual.pattern}</span></div>
            <div>Intensity: <span className="text-green-400">{(seed.visual.intensity * 100).toFixed(0)}%</span></div>
          </div>
          <div 
            className="w-full h-20 rounded border-2 border-gray-600 flex items-center justify-center text-2xl"
            style={{ 
              backgroundColor: seed.visual.color,
              opacity: seed.visual.intensity,
              animation: audioPlaying ? 'pulse 1s infinite' : 'none'
            }}
          >
            {seed.visual.pattern}
          </div>
        </div>

        {/* Glyph Preview */}
        <div className="bg-gray-800 p-4 rounded">
          <h3 className="font-semibold mb-3 text-orange-400">✨ Cosmic Glyph</h3>
          <div className="space-y-2 text-sm mb-3">
            <div>Complexity: <span className="text-green-400">{seed.glyph.complexity}/5</span></div>
            <div>Resonance: <span className="text-green-400">{(seed.glyph.resonance * 100).toFixed(0)}%</span></div>
          </div>
          <div className="text-center">
            <div 
              className="text-4xl mb-2"
              style={{
                textShadow: `0 0 ${seed.glyph.resonance * 20}px ${seed.visual.color}`,
                transform: `scale(${1 + seed.glyph.complexity * 0.1})`,
                transition: 'all 0.3s ease'
              }}
            >
              {seed.glyph.symbols}
            </div>
          </div>
        </div>
      </div>

      {/* Seed Metadata */}
      <div className="bg-gray-800 p-4 rounded mb-4">
        <h3 className="font-semibold mb-2">📊 Seed Metadata</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">ID:</span> 
            <span className="ml-2 font-mono text-green-400">{seed.id}</span>
          </div>
          <div>
            <span className="text-gray-400">Event ID:</span> 
            <span className="ml-2 font-mono text-blue-400">{seed.eventId}</span>
          </div>
          <div>
            <span className="text-gray-400">Timestamp:</span> 
            <span className="ml-2 text-yellow-400">{new Date(seed.timestamp).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-400">Confidence:</span> 
            <span className={`ml-2 font-semibold ${
              seed.confidenceScore > 0.8 ? 'text-green-400' : 
              seed.confidenceScore > 0.6 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {(seed.confidenceScore * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Signature Section */}
      {(requiresSignature || showSignature) && (
        <div className="bg-purple-900 p-4 rounded mb-4">
          <h3 className="font-semibold mb-2 text-purple-200">🔐 Digital Signature Required</h3>
          <textarea
            value={signedApproval}
            onChange={(e) => setSignedApproval(e.target.value)}
            placeholder="Enter your cryptographic signature or approval message..."
            className="w-full p-2 bg-gray-800 text-white rounded border border-purple-500 h-20 text-sm"
          />
          <p className="text-xs text-purple-300 mt-1">
            In production, this would integrate with wallet signing or PKI infrastructure
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={handleApprove}
          className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors font-semibold"
        >
          ✅ Approve Evolution
        </button>
        <button
          onClick={onReject}
          className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors font-semibold"
        >
          ❌ Reject Seed
        </button>
      </div>

      {requiresSignature && !signedApproval.trim() && (
        <p className="text-yellow-400 text-sm mt-2 text-center">
          ⚠️ Digital signature required for approval
        </p>
      )}
    </section>
  );
}