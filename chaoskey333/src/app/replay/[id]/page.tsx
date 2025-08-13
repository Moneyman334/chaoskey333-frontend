'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import CosmicIgnition from '@/components/CosmicIgnition';
import { IgnitionEvent, IgnitionStep, STEP_CONFIG } from '@/types/ignition';

export default function ReplayDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [ignition, setIgnition] = useState<IgnitionEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReplaying, setIsReplaying] = useState(false);
  const [currentStep, setCurrentStep] = useState<IgnitionStep | null>(null);
  const [replayLogs, setReplayLogs] = useState<string[]>([]);

  const loadIgnition = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/ignitions/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Ignition event not found');
        }
        throw new Error('Failed to fetch ignition event');
      }
      
      const data: IgnitionEvent = await response.json();
      setIgnition(data);
    } catch (error) {
      console.error('Error loading ignition:', error);
      setError(error instanceof Error ? error.message : 'Failed to load ignition event');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadIgnition();
    }
  }, [id, loadIgnition]);

  const addReplayLog = (message: string) => {
    setReplayLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const startReplay = () => {
    if (isReplaying || !ignition) return;
    
    setIsReplaying(true);
    setReplayLogs([]);
    addReplayLog(`🎬 Starting replay of ignition ${ignition.id}`);
    addReplayLog(`📊 Sequence: ${ignition.sequence.join(' → ')}`);
    addReplayLog(`⏱️ Original duration: ${formatDuration(ignition.metadata?.duration)}`);
  };

  const onStepStart = (step: IgnitionStep) => {
    setCurrentStep(step);
    addReplayLog(`🔥 Step started: ${STEP_CONFIG[step].description} ${STEP_CONFIG[step].emoji}`);
  };

  const onStepComplete = (step: IgnitionStep) => {
    addReplayLog(`✅ Step completed: ${STEP_CONFIG[step].description}`);
  };

  const onSequenceComplete = () => {
    setIsReplaying(false);
    setCurrentStep(null);
    addReplayLog(`🎉 Replay completed successfully!`);
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return 'Unknown';
    return `${(duration / 1000).toFixed(1)}s`;
  };

  const getSequenceDisplay = (sequence: string[]) => {
    return sequence.map(step => STEP_CONFIG[step as keyof typeof STEP_CONFIG]?.emoji || '❓').join(' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mb-4"></div>
          <p>Loading ignition event...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link 
            href="/replay" 
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            ← Back to Replay Terminal
          </Link>
        </div>
      </div>
    );
  }

  if (!ignition) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white max-w-md">
          <div className="text-6xl mb-4">🌌</div>
          <h1 className="text-2xl font-bold mb-4">No Ignition Found</h1>
          <Link 
            href="/replay" 
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            ← Back to Replay Terminal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">🎬 Ignition Replay</h1>
                <p className="text-gray-400 mt-1">
                  Event ID: <span className="font-mono text-blue-400">{ignition.id}</span>
                </p>
              </div>
              <div className="flex gap-4">
                <Link 
                  href="/replay" 
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  ← Replay Terminal
                </Link>
                <Link 
                  href="/ignite" 
                  className="text-orange-400 hover:text-orange-300 underline"
                >
                  🔥 Ignition Control
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Event Details */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-orange-400">
                📊 Event Details
              </h2>
              
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-400">ID:</span>
                    <div className="font-mono text-blue-400 break-all">{ignition.id}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Timestamp:</span>
                    <div>{new Date(ignition.timestamp).toLocaleString()}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-400">Triggered By:</span>
                    <div>{ignition.metadata?.triggeredBy || 'Unknown'}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Duration:</span>
                    <div>{formatDuration(ignition.metadata?.duration)}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-400">Intensity:</span>
                    <div>{ignition.metadata?.intensity || 1.0}x</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Steps:</span>
                    <div>{ignition.sequence.length}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sequence Details */}
            <div className="bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-orange-400">
                ⚡ Sequence Breakdown
              </h2>
              
              <div className="space-y-3">
                {ignition.sequence.map((step, index) => (
                  <div 
                    key={`${step}-${index}`}
                    className={`flex items-center p-3 rounded-lg transition-colors ${
                      currentStep === step 
                        ? 'bg-orange-900 border border-orange-600' 
                        : 'bg-gray-700'
                    }`}
                  >
                    <span className="text-2xl mr-3">{STEP_CONFIG[step].emoji}</span>
                    <div className="flex-1">
                      <div className="font-medium">{STEP_CONFIG[step].description}</div>
                      <div className="text-xs text-gray-400">
                        Duration: {STEP_CONFIG[step].duration}ms, Delay: {STEP_CONFIG[step].delay}ms
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      Step {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-orange-400">
                🎮 Replay Controls
              </h2>
              
              <div className="space-y-3">
                <button
                  onClick={startReplay}
                  disabled={isReplaying}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-md hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                >
                  {isReplaying ? '🎬 Replaying...' : '▶️ Start Replay'}
                </button>
                
                <div className="text-xs text-gray-400 text-center">
                  {isReplaying 
                    ? `Currently at: ${currentStep ? STEP_CONFIG[currentStep].description : 'Starting...'}`
                    : 'Click to replay the ignition sequence'
                  }
                </div>
              </div>
            </div>

            {/* Replay Logs */}
            {replayLogs.length > 0 && (
              <div className="bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 text-green-400">
                  📝 Replay Logs
                </h2>
                
                <div className="bg-gray-900 rounded p-4 max-h-60 overflow-y-auto">
                  <div className="space-y-1 text-sm font-mono">
                    {replayLogs.map((log, index) => (
                      <div key={index} className="text-green-400">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Replay Visualization */}
          <div className="bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-orange-400">
              🎭 Replay Visualization
            </h2>
            
            <CosmicIgnition
              sequence={ignition.sequence as IgnitionStep[]}
              autoStart={isReplaying}
              onStepStart={onStepStart}
              onStepComplete={onStepComplete}
              onSequenceComplete={onSequenceComplete}
              className="w-full"
            />
            
            <div className="mt-4 text-center text-sm text-gray-400">
              Original sequence: {getSequenceDisplay(ignition.sequence)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}