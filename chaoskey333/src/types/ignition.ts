export type IgnitionStep = 
  | 'OPENING_PULSE'
  | 'RING_SWEEP'
  | 'RELIC_EVOLUTION'
  | 'ASCENSION_SPIRAL'
  | 'FINAL_FLASH';

export interface IgnitionEvent {
  id: string;
  timestamp: number;
  sequence: IgnitionStep[];
  metadata?: {
    triggeredBy?: string;
    duration?: number;
    intensity?: number;
    [key: string]: any;
  };
}

export interface IgnitionStepData {
  step: IgnitionStep;
  timestamp: number;
  duration: number;
  completed: boolean;
}

export interface IgnitionSequenceData {
  id: string;
  event: IgnitionEvent;
  steps: IgnitionStepData[];
  totalDuration: number;
  startTime: number;
  endTime?: number;
  status: 'pending' | 'active' | 'completed' | 'failed';
}

export interface IgnitionListResponse {
  ignitions: IgnitionEvent[];
  total: number;
  page: number;
  pageSize: number;
}

export interface IgnitionTriggerRequest {
  sequence?: IgnitionStep[];
  metadata?: Record<string, any>;
}

export interface IgnitionTriggerResponse {
  success: boolean;
  ignition: IgnitionEvent;
  message: string;
}

// Default canonical sequence
export const CANONICAL_SEQUENCE: IgnitionStep[] = [
  'OPENING_PULSE',
  'RING_SWEEP',
  'RELIC_EVOLUTION',
  'ASCENSION_SPIRAL',
  'FINAL_FLASH'
];

// Step configurations for animations
export const STEP_CONFIG: Record<IgnitionStep, { 
  duration: number; 
  delay: number; 
  emoji: string;
  description: string;
}> = {
  OPENING_PULSE: {
    duration: 2000,
    delay: 0,
    emoji: '⚡',
    description: 'Opening Pulse'
  },
  RING_SWEEP: {
    duration: 3000,
    delay: 500,
    emoji: '🌌',
    description: 'Expansion Rings'
  },
  RELIC_EVOLUTION: {
    duration: 4000,
    delay: 800,
    emoji: '♾',
    description: 'Relic Evolution Glyph Conduits'
  },
  ASCENSION_SPIRAL: {
    duration: 3500,
    delay: 1000,
    emoji: '🌠',
    description: 'Ascension Spiral'
  },
  FINAL_FLASH: {
    duration: 2500,
    delay: 1200,
    emoji: '✨',
    description: 'Final Flash'
  }
};