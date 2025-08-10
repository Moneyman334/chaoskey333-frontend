'use client';

interface Replay {
  id: string;
  pr: number;
  title: string;
  duration: number;
  tags: string[];
  locales: string[];
  status: 'LIVE' | 'MUTATING' | 'ARCHIVED';
}

interface SpectralHUDProps {
  replay: Replay;
  currentTime: number;
}

// Mock spectral data for demonstration
const mockSpectralData = {
  'PR-18': {
    energy_levels: [0.8, 0.6, 0.9, 0.7, 0.5],
    dimensional_frequency: 432.7,
    chaos_entropy: 0.23,
    temporal_stability: 'STABLE'
  },
  'PR-23': {
    energy_levels: [0.9, 0.8, 0.95, 0.85, 0.7],
    dimensional_frequency: 528.3,
    chaos_entropy: 0.67,
    temporal_stability: 'FLUCTUATING'
  },
  'PR-24': {
    energy_levels: [0.7, 0.9, 0.6, 0.8, 0.85],
    dimensional_frequency: 396.1,
    chaos_entropy: 0.45,
    temporal_stability: 'UNSTABLE'
  }
};

export default function SpectralHUD({ replay, currentTime }: SpectralHUDProps) {
  const data = mockSpectralData[replay.id as keyof typeof mockSpectralData] || mockSpectralData['PR-18'];
  
  // Simulate time-based variations
  const timeOffset = Math.sin(currentTime * 0.1) * 0.1;
  const adjustedEnergy = data.energy_levels.map(level => 
    Math.max(0, Math.min(1, level + timeOffset))
  );

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Grid overlay */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(cyan 1px, transparent 1px),
            linear-gradient(90deg, cyan 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />

      {/* Top HUD */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-80 border border-cyan-500 rounded p-3">
        <div className="text-cyan-400 text-sm font-mono">
          <div className="text-xs text-cyan-300 mb-1">SPECTRAL ANALYSIS</div>
          <div>ID: {replay.id}</div>
          <div>TIME: {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}</div>
          <div>FREQ: {data.dimensional_frequency.toFixed(1)} Hz</div>
          <div className={`${
            data.temporal_stability === 'STABLE' ? 'text-green-400' :
            data.temporal_stability === 'FLUCTUATING' ? 'text-yellow-400' :
            'text-red-400'
          }`}>
            STATUS: {data.temporal_stability}
          </div>
        </div>
      </div>

      {/* Energy Level Bars */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-80 border border-cyan-500 rounded p-3">
        <div className="text-cyan-400 text-xs font-mono mb-2">ENERGY MATRIX</div>
        <div className="flex gap-1">
          {adjustedEnergy.map((level, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="w-3 h-16 bg-gray-800 border border-cyan-500 relative">
                <div 
                  className="absolute bottom-0 w-full bg-gradient-to-t from-cyan-500 to-cyan-300"
                  style={{ height: `${level * 100}%` }}
                />
              </div>
              <div className="text-xs text-cyan-400 mt-1">{index + 1}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Chaos Entropy Meter */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-80 border border-cyan-500 rounded p-3">
        <div className="text-cyan-400 text-xs font-mono mb-2">CHAOS ENTROPY</div>
        <div className="w-32 h-3 bg-gray-800 border border-cyan-500 relative">
          <div 
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
            style={{ width: `${(data.chaos_entropy + timeOffset * 0.5) * 100}%` }}
          />
        </div>
        <div className="text-cyan-400 text-xs mt-1">
          {((data.chaos_entropy + timeOffset * 0.5) * 100).toFixed(1)}%
        </div>
      </div>

      {/* Temporal Flux Indicator */}
      <div className="absolute bottom-4 right-4 bg-black bg-opacity-80 border border-cyan-500 rounded p-3">
        <div className="text-cyan-400 text-xs font-mono mb-2">TEMPORAL FLUX</div>
        <div className="w-16 h-16 border border-cyan-500 rounded-full relative flex items-center justify-center">
          <div 
            className="w-12 h-12 border-2 border-cyan-400 rounded-full animate-spin"
            style={{ 
              animationDuration: `${2 + data.chaos_entropy * 3}s`,
              borderTopColor: 'transparent'
            }}
          />
          <div className="absolute text-xs text-cyan-400">
            {(currentTime % 360).toFixed(0)}°
          </div>
        </div>
      </div>

      {/* Dimensional Particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
            style={{
              left: `${20 + (i * 10) + Math.sin(currentTime * 0.05 + i) * 10}%`,
              top: `${30 + (i * 5) + Math.cos(currentTime * 0.03 + i) * 20}%`,
              animationDelay: `${i * 0.2}s`
            }}
          />
        ))}
      </div>

      {/* Glyph Scanner Lines */}
      <div className="absolute inset-0">
        <div 
          className="absolute w-full h-0.5 bg-cyan-400 opacity-60 animate-pulse"
          style={{
            top: `${30 + Math.sin(currentTime * 0.02) * 40}%`,
            animationDuration: '2s'
          }}
        />
        <div 
          className="absolute h-full w-0.5 bg-cyan-400 opacity-60 animate-pulse"
          style={{
            left: `${40 + Math.cos(currentTime * 0.03) * 20}%`,
            animationDuration: '3s'
          }}
        />
      </div>
    </div>
  );
}