export interface PremiereStatus {
  active: boolean;
  message: string;
  phase: 'inactive' | 'ignition' | 'expansion' | 'resonance' | 'evolution' | 'complete';
  timestamp: number;
  countdown?: number;
}

export interface PremiereConfig {
  enabled: boolean;
  autoTrigger: boolean;
  manualOverride: boolean;
  cinematicDuration: number; // in milliseconds
  phases: {
    ignition: number;
    expansion: number;
    resonance: number;
    evolution: number;
  };
}

export interface VaultRelic {
  id: string;
  tokenId: number;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{
      trait_type: string;
      value: string | number;
    }>;
  };
  evolutionState: 'dormant' | 'awakening' | 'evolved';
  glyphHalo?: {
    intensity: number;
    pattern: string;
    color: string;
  };
}

export interface PremiereEvent {
  action: 'merged' | 'rollback' | 'manual_trigger' | 'manual_disable';
  number?: number;
  pull_request?: {
    merged: boolean;
    base: {
      ref: string;
    };
  };
  repository?: {
    full_name: string;
  };
  reason?: string;
  adminUserId?: string;
}

export interface CinematicEffect {
  type: 'glyph_expansion' | 'soundscape_resonance' | 'blueprint_ripple';
  intensity: number;
  duration: number;
  parameters: Record<string, any>;
}

export interface PremiereResponse {
  success: boolean;
  message: string;
  status: PremiereStatus;
  effects?: CinematicEffect[];
  error?: string;
}