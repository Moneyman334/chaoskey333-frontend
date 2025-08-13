'use client';

import { useState, useEffect } from 'react';
import CosmicIgnition from '@/components/CosmicIgnition';
import { 
  IgnitionStep, 
  IgnitionTriggerResponse, 
  CANONICAL_SEQUENCE, 
  STEP_CONFIG 
} from '@/types/ignition';

export default function IgnitePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminToken, setAdminToken] = useState('');
  const [selectedSequence, setSelectedSequence] = useState<IgnitionStep[]>(CANONICAL_SEQUENCE);
  const [customSequence, setCustomSequence] = useState('');
  const [triggeredBy, setTriggeredBy] = useState('');
  const [intensity, setIntensity] = useState(1.0);
  const [isTriggering, setIsTriggering] = useState(false);
  const [lastIgnition, setLastIgnition] = useState<IgnitionTriggerResponse | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const authenticate = () => {
    // Simple authentication check - in production, this should be more secure
    if (adminToken === 'admin' || adminToken.length > 8) {
      setIsAuthenticated(true);
    } else {
      alert('Invalid admin token');
    }
  };

  const parseCustomSequence = (sequenceStr: string): IgnitionStep[] => {
    return sequenceStr
      .split(',')
      .map(s => s.trim().toUpperCase() as IgnitionStep)
      .filter(s => Object.keys(STEP_CONFIG).includes(s));
  };

  const triggerIgnition = async () => {
    if (isTriggering) return;
    
    setIsTriggering(true);
    
    try {
      const sequence = customSequence 
        ? parseCustomSequence(customSequence)
        : selectedSequence;
      
      const response = await fetch('/api/ignite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sequence,
          metadata: {
            triggeredBy: triggeredBy || 'admin',
            intensity,
            source: 'admin_panel'
          }
        })
      });
      
      const result: IgnitionTriggerResponse = await response.json();
      
      if (result.success) {
        setLastIgnition(result);
        alert(`✨ ${result.message}`);
      } else {
        alert(`❌ Failed to trigger ignition: ${result.message}`);
      }
    } catch (error) {
      console.error('Error triggering ignition:', error);
      alert('❌ Failed to trigger ignition: Network error');
    } finally {
      setIsTriggering(false);
    }
  };

  const onStepStart = (step: IgnitionStep) => {
    console.log(`🔥 Step started: ${STEP_CONFIG[step].description}`);
  };

  const onStepComplete = (step: IgnitionStep) => {
    console.log(`✅ Step completed: ${STEP_CONFIG[step].description}`);
  };

  const onSequenceComplete = () => {
    console.log('🎉 Cosmic Ignition Sequence completed!');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center text-white">
            🔥 Cosmic Ignition Control
          </h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Admin Token
              </label>
              <input
                type="password"
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter admin token"
                onKeyPress={(e) => e.key === 'Enter' && authenticate()}
              />
            </div>
            <button
              onClick={authenticate}
              className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              Access Ignition Controls
            </button>
          </div>
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
              <h1 className="text-3xl font-bold">🔥 Cosmic Ignition Control Panel</h1>
              <div className="flex gap-4">
                <a 
                  href="/replay" 
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  📼 Replay Terminal
                </a>
                <button
                  onClick={() => setIsAuthenticated(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls Panel */}
          <div className="space-y-6">
            {/* Sequence Configuration */}
            <div className="bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-orange-400">
                ⚡ Sequence Configuration
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sequence Type
                  </label>
                  <select
                    value={customSequence ? 'custom' : 'canonical'}
                    onChange={(e) => {
                      if (e.target.value === 'canonical') {
                        setCustomSequence('');
                        setSelectedSequence(CANONICAL_SEQUENCE);
                      }
                    }}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="canonical">Canonical Sequence</option>
                    <option value="custom">Custom Sequence</option>
                  </select>
                </div>

                {customSequence === '' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Canonical Steps
                    </label>
                    <div className="space-y-2">
                      {CANONICAL_SEQUENCE.map((step, index) => (
                        <div key={step} className="flex items-center">
                          <span className="text-2xl mr-3">{STEP_CONFIG[step].emoji}</span>
                          <span>{STEP_CONFIG[step].description}</span>
                          <span className="ml-auto text-gray-400 text-sm">
                            {STEP_CONFIG[step].duration}ms
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {customSequence !== '' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Custom Sequence (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={customSequence}
                      onChange={(e) => setCustomSequence(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g., OPENING_PULSE, FINAL_FLASH"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Available: {Object.keys(STEP_CONFIG).join(', ')}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Triggered By
                    </label>
                    <input
                      type="text"
                      value={triggeredBy}
                      onChange={(e) => setTriggeredBy(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="admin"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Intensity
                    </label>
                    <input
                      type="number"
                      min="0.1"
                      max="2.0"
                      step="0.1"
                      value={intensity}
                      onChange={(e) => setIntensity(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-orange-400">
                🎮 Actions
              </h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {previewMode ? '🔄 Stop Preview' : '👁️ Preview Mode'}
                </button>
                
                <button
                  onClick={triggerIgnition}
                  disabled={isTriggering}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-4 rounded-md hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                >
                  {isTriggering ? '🔥 Triggering...' : '🚀 TRIGGER COSMIC IGNITION'}
                </button>
              </div>
            </div>

            {/* Last Ignition Info */}
            {lastIgnition && (
              <div className="bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 text-green-400">
                  ✅ Last Ignition
                </h2>
                <div className="space-y-2 text-sm">
                  <div><strong>ID:</strong> {lastIgnition.ignition.id}</div>
                  <div><strong>Timestamp:</strong> {new Date(lastIgnition.ignition.timestamp).toLocaleString()}</div>
                  <div><strong>Sequence:</strong> {lastIgnition.ignition.sequence.join(' → ')}</div>
                  <div><strong>Duration:</strong> {lastIgnition.ignition.metadata?.duration}ms</div>
                </div>
              </div>
            )}
          </div>

          {/* Live Preview */}
          <div className="bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-orange-400">
              🎭 Live Preview
            </h2>
            
            <CosmicIgnition
              sequence={customSequence ? parseCustomSequence(customSequence) : selectedSequence}
              autoStart={previewMode}
              onStepStart={onStepStart}
              onStepComplete={onStepComplete}
              onSequenceComplete={onSequenceComplete}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}