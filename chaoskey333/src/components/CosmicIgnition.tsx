'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { IgnitionStep, IgnitionSequenceData, STEP_CONFIG, CANONICAL_SEQUENCE } from '@/types/ignition';

interface CosmicIgnitionProps {
  sequence?: IgnitionStep[];
  autoStart?: boolean;
  onStepStart?: (step: IgnitionStep) => void;
  onStepComplete?: (step: IgnitionStep) => void;
  onSequenceComplete?: () => void;
  className?: string;
}

export default function CosmicIgnition({
  sequence = CANONICAL_SEQUENCE,
  autoStart = false,
  onStepStart,
  onStepComplete,
  onSequenceComplete,
  className = ''
}: CosmicIgnitionProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState<IgnitionStep | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<IgnitionStep>>(new Set());
  const [progress, setProgress] = useState(0);

  const startSequence = useCallback(() => {
    if (isActive) return;
    
    setIsActive(true);
    setCurrentStep(null);
    setCompletedSteps(new Set());
    setProgress(0);
    
    let stepIndex = 0;
    let totalProgress = 0;
    
    const executeStep = (step: IgnitionStep) => {
      setCurrentStep(step);
      onStepStart?.(step);
      
      const config = STEP_CONFIG[step];
      
      // Simulate step progress
      const stepProgressInterval = setInterval(() => {
        totalProgress += 2; // Increase progress
        setProgress(Math.min(totalProgress, 100));
      }, config.duration / 50);
      
      setTimeout(() => {
        clearInterval(stepProgressInterval);
        setCompletedSteps(prev => new Set([...prev, step]));
        onStepComplete?.(step);
        
        stepIndex++;
        if (stepIndex < sequence.length) {
          setTimeout(() => executeStep(sequence[stepIndex]), config.delay);
        } else {
          // Sequence complete
          setTimeout(() => {
            setIsActive(false);
            setCurrentStep(null);
            setProgress(100);
            onSequenceComplete?.();
          }, 500);
        }
      }, config.duration);
    };
    
    // Start with first step after a brief delay
    setTimeout(() => executeStep(sequence[0]), 300);
  }, [isActive, sequence, onStepStart, onStepComplete, onSequenceComplete]);

  useEffect(() => {
    if (autoStart) {
      startSequence();
    }
  }, [autoStart, startSequence]);

  const getStepAnimationClass = (step: IgnitionStep) => {
    if (completedSteps.has(step)) return 'completed';
    if (currentStep === step) return 'active';
    return 'pending';
  };

  return (
    <div className={`cosmic-ignition ${className}`}>
      <style jsx>{`
        .cosmic-ignition {
          position: relative;
          width: 100%;
          height: 500px;
          background: radial-gradient(circle at center, #1a1a2e, #16213e, #0f0f23);
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .ignition-container {
          position: relative;
          width: 400px;
          height: 400px;
        }
        
        .cosmic-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 60px;
          height: 60px;
          background: radial-gradient(circle, #ffd700, #ffaa00);
          border-radius: 50%;
          box-shadow: 0 0 30px #ffd700;
        }
        
        .cosmic-center.active {
          animation: pulse 2s infinite;
        }
        
        .step-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border: 2px solid transparent;
          border-radius: 50%;
          transition: all 0.3s ease;
        }
        
        .step-ring.pending {
          border-color: rgba(255, 255, 255, 0.2);
        }
        
        .step-ring.active {
          border-color: #00ffff;
          box-shadow: 0 0 20px #00ffff;
          animation: ringPulse 1s infinite;
        }
        
        .step-ring.completed {
          border-color: #00ff00;
          box-shadow: 0 0 15px #00ff00;
        }
        
        .opening-pulse {
          width: 100px;
          height: 100px;
        }
        
        .ring-sweep {
          width: 150px;
          height: 150px;
        }
        
        .relic-evolution {
          width: 200px;
          height: 200px;
        }
        
        .ascension-spiral {
          width: 250px;
          height: 250px;
        }
        
        .final-flash {
          width: 300px;
          height: 300px;
        }
        
        .step-indicator {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 24px;
          pointer-events: none;
        }
        
        .opening-pulse .step-indicator { margin-top: -60px; }
        .ring-sweep .step-indicator { margin-top: -85px; }
        .relic-evolution .step-indicator { margin-top: -110px; }
        .ascension-spiral .step-indicator { margin-top: -135px; }
        .final-flash .step-indicator { margin-top: -160px; }
        
        .step-indicator.active {
          animation: bounce 1s infinite;
        }
        
        .progress-bar {
          position: absolute;
          bottom: 20px;
          left: 20px;
          right: 20px;
          height: 4px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #00ffff, #ffd700, #ff6600);
          border-radius: 2px;
          transition: width 0.3s ease;
        }
        
        .controls {
          position: absolute;
          top: 20px;
          left: 20px;
          right: 20px;
          display: flex;
          justify-content: center;
        }
        
        .start-button {
          background: linear-gradient(45deg, #ff6600, #ffd700);
          border: none;
          color: white;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
          transition: transform 0.2s;
        }
        
        .start-button:hover {
          transform: scale(1.05);
        }
        
        .start-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
        
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.2); }
        }
        
        @keyframes ringPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.8; }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translate(-50%, -50%) translateY(0); }
          50% { transform: translate(-50%, -50%) translateY(-10px); }
        }
        
        .glyph-conduits {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 180px;
          height: 180px;
          opacity: 0;
        }
        
        .glyph-conduits.active {
          opacity: 1;
          animation: rotate 4s linear infinite;
        }
        
        .glyph {
          position: absolute;
          width: 20px;
          height: 20px;
          background: #ff6600;
          border-radius: 50%;
          box-shadow: 0 0 10px #ff6600;
        }
        
        .glyph:nth-child(1) { top: 0; left: 50%; transform: translateX(-50%); }
        .glyph:nth-child(2) { top: 50%; right: 0; transform: translateY(-50%); }
        .glyph:nth-child(3) { bottom: 0; left: 50%; transform: translateX(-50%); }
        .glyph:nth-child(4) { top: 50%; left: 0; transform: translateY(-50%); }
        
        @keyframes rotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        
        .ascension-spiral-effect {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 220px;
          height: 220px;
          opacity: 0;
        }
        
        .ascension-spiral-effect.active {
          opacity: 1;
          animation: spiral 3.5s ease-in-out infinite;
        }
        
        .spiral-trail {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 2px solid transparent;
          border-top: 2px solid #00ffff;
          border-radius: 50%;
          animation: spiralRotate 2s linear infinite;
        }
        
        @keyframes spiral {
          0% { transform: translate(-50%, -50%) scale(0.5); }
          50% { transform: translate(-50%, -50%) scale(1.2); }
          100% { transform: translate(-50%, -50%) scale(1); }
        }
        
        @keyframes spiralRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .final-flash-effect {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at center, transparent, rgba(255, 255, 255, 0.9));
          opacity: 0;
          pointer-events: none;
        }
        
        .final-flash-effect.active {
          animation: flash 2.5s ease-out;
        }
        
        @keyframes flash {
          0% { opacity: 0; }
          10% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
      
      <div className="ignition-container">
        {/* Central Singularity */}
        <div className={`cosmic-center ${isActive ? 'active' : ''}`} />
        
        {/* Step Rings */}
        {sequence.map((step, index) => (
          <div
            key={step}
            className={`step-ring ${step.toLowerCase().replace('_', '-')} ${getStepAnimationClass(step)}`}
          >
            <div className={`step-indicator ${currentStep === step ? 'active' : ''}`}>
              {STEP_CONFIG[step].emoji}
            </div>
          </div>
        ))}
        
        {/* Glyph Conduits for RELIC_EVOLUTION */}
        <div className={`glyph-conduits ${currentStep === 'RELIC_EVOLUTION' ? 'active' : ''}`}>
          <div className="glyph" />
          <div className="glyph" />
          <div className="glyph" />
          <div className="glyph" />
        </div>
        
        {/* Ascension Spiral Effect */}
        <div className={`ascension-spiral-effect ${currentStep === 'ASCENSION_SPIRAL' ? 'active' : ''}`}>
          <div className="spiral-trail" />
        </div>
        
        {/* Final Flash Effect */}
        <div className={`final-flash-effect ${currentStep === 'FINAL_FLASH' ? 'active' : ''}`} />
        
        {/* Progress Bar */}
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Controls */}
        {!autoStart && (
          <div className="controls">
            <button
              className="start-button"
              onClick={startSequence}
              disabled={isActive}
            >
              {isActive ? 'Ignition Active...' : 'Trigger Cosmic Ignition'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}