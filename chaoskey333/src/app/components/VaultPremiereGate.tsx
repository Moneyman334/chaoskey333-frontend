'use client';

import React, { useEffect, useState } from 'react';
import { usePremiereFlag } from '@/lib/usePremiereFlag';
import { PremiereStatus, CinematicEffect } from '@/types/premiere';

interface VaultPremiereGateProps {
  children: React.ReactNode;
  adminMode?: boolean;
  className?: string;
}

interface GlyphHaloProps {
  intensity: number;
  pattern: string;
  color: string;
  size: number;
}

const GlyphHalo: React.FC<GlyphHaloProps> = ({ intensity, pattern, color, size }) => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 2) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const haloStyle = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
    opacity: intensity,
    border: `2px solid ${color}`,
    boxShadow: `0 0 ${20 * intensity}px ${color}, inset 0 0 ${10 * intensity}px ${color}`,
    animation: `pulse-${pattern} 2s ease-in-out infinite`,
  };

  return (
    <div style={haloStyle}>
      <style jsx>{`
        @keyframes pulse-spiral {
          0%, 100% { transform: translate(-50%, -50%) rotate(${rotation}deg) scale(1); }
          50% { transform: translate(-50%, -50%) rotate(${rotation + 180}deg) scale(1.2); }
        }
        @keyframes pulse-radial {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.3); }
        }
        @keyframes pulse-matrix {
          0%, 100% { opacity: ${intensity}; }
          25% { opacity: ${intensity * 0.3}; }
          50% { opacity: ${intensity}; }
          75% { opacity: ${intensity * 0.7}; }
        }
        @keyframes pulse-waves {
          0% { transform: translate(-50%, -50%) scale(0.8); }
          33% { transform: translate(-50%, -50%) scale(1.1); }
          66% { transform: translate(-50%, -50%) scale(0.9); }
          100% { transform: translate(-50%, -50%) scale(1.2); }
        }
      `}</style>
    </div>
  );
};

interface SoundscapeVisualizerProps {
  frequency: number;
  harmonics: number;
  amplitude: number;
}

const SoundscapeVisualizer: React.FC<SoundscapeVisualizerProps> = ({ frequency, harmonics, amplitude }) => {
  const [waves, setWaves] = useState<number[]>([]);

  useEffect(() => {
    const generateWaves = () => {
      const newWaves = Array.from({ length: harmonics }, (_, i) => {
        return Math.sin(Date.now() * 0.001 * frequency * (i + 1)) * amplitude;
      });
      setWaves(newWaves);
    };

    const interval = setInterval(generateWaves, 50);
    return () => clearInterval(interval);
  }, [frequency, harmonics, amplitude]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg width="100%" height="100%" className="opacity-60">
        {waves.map((wave, index) => (
          <circle
            key={index}
            cx="50%"
            cy="50%"
            r={50 + index * 20 + Math.abs(wave) * 30}
            fill="none"
            stroke={`hsl(${280 + index * 20}, 70%, 60%)`}
            strokeWidth="1"
            opacity={0.3 + Math.abs(wave) * 0.4}
          />
        ))}
      </svg>
    </div>
  );
};

interface BlueprintRippleProps {
  rippleCount: number;
  waveSpeed: number;
  centerPoint: { x: number; y: number };
  color: string;
}

const BlueprintRipple: React.FC<BlueprintRippleProps> = ({ rippleCount, waveSpeed, centerPoint, color }) => {
  const [ripples, setRipples] = useState<number[]>([]);

  useEffect(() => {
    const updateRipples = () => {
      const time = Date.now() * 0.001 * waveSpeed;
      const newRipples = Array.from({ length: rippleCount }, (_, i) => {
        return (time + i * 0.5) % 3; // Ripple cycles every 3 seconds
      });
      setRipples(newRipples);
    };

    const interval = setInterval(updateRipples, 50);
    return () => clearInterval(interval);
  }, [rippleCount, waveSpeed]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <svg width="100%" height="100%">
        {ripples.map((ripple, index) => (
          <circle
            key={index}
            cx={`${centerPoint.x * 100}%`}
            cy={`${centerPoint.y * 100}%`}
            r={ripple * 200}
            fill="none"
            stroke={color}
            strokeWidth="2"
            opacity={Math.max(0, 1 - ripple / 3)}
            strokeDasharray="5,5"
          />
        ))}
      </svg>
    </div>
  );
};

const CinematicOverlay: React.FC<{ status: PremiereStatus }> = ({ status }) => {
  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'ignition': return '#FFD700';
      case 'expansion': return '#FF6B35';
      case 'resonance': return '#9D4EDD';
      case 'evolution': return '#06FFA5';
      default: return '#FFFFFF';
    }
  };

  const formatCountdown = (countdown: number) => {
    const seconds = Math.ceil(countdown / 1000);
    return `${seconds}s`;
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Background overlay */}
      <div 
        className="absolute inset-0 bg-black transition-opacity duration-1000"
        style={{ opacity: status.active ? 0.7 : 0 }}
      />
      
      {/* Cinematic effects */}
      {status.active && (
        <>
          {status.phase === 'ignition' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <GlyphHalo intensity={0.8} pattern="spiral" color="#FFD700" size={150} />
              <GlyphHalo intensity={0.6} pattern="radial" color="#FFD700" size={200} />
            </div>
          )}
          
          {status.phase === 'expansion' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <GlyphHalo intensity={1.0} pattern="radial" color="#FF6B35" size={300} />
              <GlyphHalo intensity={0.7} pattern="spiral" color="#FFD700" size={200} />
            </div>
          )}
          
          {status.phase === 'resonance' && (
            <SoundscapeVisualizer frequency={432} harmonics={7} amplitude={0.8} />
          )}
          
          {status.phase === 'evolution' && (
            <BlueprintRipple 
              rippleCount={3} 
              waveSpeed={2.5} 
              centerPoint={{x: 0.5, y: 0.5}} 
              color="#9D4EDD" 
            />
          )}
        </>
      )}
      
      {/* HUD Notifications */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <div className={`
          px-6 py-3 rounded-lg border-2 transition-all duration-500 backdrop-blur-sm
          ${status.active 
            ? 'bg-black/80 text-white border-current shadow-lg' 
            : 'bg-gray-900/50 text-gray-300 border-gray-600'
          }
        `}
        style={{ 
          borderColor: status.active ? getPhaseColor(status.phase) : undefined,
          boxShadow: status.active ? `0 0 20px ${getPhaseColor(status.phase)}40` : undefined
        }}>
          <div className="text-center">
            <div className="text-sm font-mono uppercase tracking-wider mb-1">
              {status.active ? `Phase: ${status.phase}` : 'Vault Status'}
            </div>
            <div className="text-lg font-bold">
              {status.message}
            </div>
            {status.countdown && (
              <div className="text-2xl font-mono mt-2" style={{ color: getPhaseColor(status.phase) }}>
                {formatCountdown(status.countdown)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminControls: React.FC<{ 
  onManualCountdown: () => void;
  onManualIgnition: () => void;
  onEmergencyStop: () => void;
  status: PremiereStatus | null;
  isLoading: boolean;
}> = ({ onManualCountdown, onManualIgnition, onEmergencyStop, status, isLoading }) => {
  return (
    <div className="fixed bottom-8 right-8 z-50 p-4 bg-black/80 backdrop-blur-sm rounded-lg border border-gray-600">
      <h3 className="text-white text-sm font-mono uppercase tracking-wider mb-3">Admin Controls</h3>
      <div className="space-y-2">
        <button
          onClick={onManualCountdown}
          disabled={isLoading || status?.active}
          className="block w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Manual Countdown
        </button>
        <button
          onClick={onManualIgnition}
          disabled={isLoading || status?.active}
          className="block w-full px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Ignition
        </button>
        <button
          onClick={onEmergencyStop}
          disabled={isLoading || !status?.active}
          className="block w-full px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Emergency Stop
        </button>
      </div>
    </div>
  );
};

export const VaultPremiereGate: React.FC<VaultPremiereGateProps> = ({ 
  children, 
  adminMode = false, 
  className = '' 
}) => {
  const { 
    status, 
    isLoading, 
    error, 
    manualCountdown, 
    manualIgnition, 
    emergencyStop 
  } = usePremiereFlag(2000, adminMode);

  const handleManualCountdown = async () => {
    try {
      await manualCountdown();
    } catch (err) {
      console.error('Manual countdown failed:', err);
    }
  };

  const handleManualIgnition = async () => {
    try {
      await manualIgnition();
    } catch (err) {
      console.error('Manual ignition failed:', err);
    }
  };

  const handleEmergencyStop = async () => {
    try {
      await emergencyStop();
    } catch (err) {
      console.error('Emergency stop failed:', err);
    }
  };

  if (error) {
    console.error('Premiere gate error:', error);
  }

  return (
    <div className={`relative ${className}`}>
      {children}
      
      {status && <CinematicOverlay status={status} />}
      
      {adminMode && (
        <AdminControls
          onManualCountdown={handleManualCountdown}
          onManualIgnition={handleManualIgnition}
          onEmergencyStop={handleEmergencyStop}
          status={status}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};