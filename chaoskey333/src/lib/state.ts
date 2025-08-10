import { kv } from '@vercel/kv';

export interface AppState {
  replay: {
    active: boolean;
    startedAt?: number;
    stoppedAt?: number;
    startedBy?: string;
    stoppedBy?: string;
  };
  hud: {
    decodeEnabled: boolean;
    enabledAt?: number;
    disabledAt?: number;
    enabledBy?: string;
    disabledBy?: string;
  };
  relic: {
    evolving: boolean;
    evolutionTriggeredAt?: number;
    evolutionTriggeredBy?: string;
    evolutionPayload?: any;
    lastEvolutionAt?: number;
  };
  broadcast: {
    lastPulse?: number;
    pulsedBy?: string;
    pulseCount: number;
  };
  mint: {
    gateOpen: boolean;
    openedAt?: number;
    closedAt?: number;
    openedBy?: string;
    closedBy?: string;
  };
  system: {
    lastUpdated: number;
    version: string;
  };
}

const STATE_KEY = 'ascension:state';
const STATE_VERSION = '1.0.0';

// Default state
const DEFAULT_STATE: AppState = {
  replay: {
    active: false
  },
  hud: {
    decodeEnabled: false
  },
  relic: {
    evolving: false
  },
  broadcast: {
    pulseCount: 0
  },
  mint: {
    gateOpen: false
  },
  system: {
    lastUpdated: Date.now(),
    version: STATE_VERSION
  }
};

export async function getState(): Promise<AppState> {
  try {
    const state = await kv.get(STATE_KEY) as AppState;
    
    if (!state) {
      // Initialize with default state
      await kv.set(STATE_KEY, DEFAULT_STATE);
      return DEFAULT_STATE;
    }

    // Ensure all required fields exist (migration-friendly)
    const mergedState: AppState = {
      replay: { ...DEFAULT_STATE.replay, ...state.replay },
      hud: { ...DEFAULT_STATE.hud, ...state.hud },
      relic: { ...DEFAULT_STATE.relic, ...state.relic },
      broadcast: { ...DEFAULT_STATE.broadcast, ...state.broadcast },
      mint: { ...DEFAULT_STATE.mint, ...state.mint },
      system: { 
        ...DEFAULT_STATE.system, 
        ...state.system,
        lastUpdated: state.system?.lastUpdated || Date.now()
      }
    };

    return mergedState;
  } catch (error) {
    console.error('Failed to get state:', error);
    return DEFAULT_STATE;
  }
}

export async function updateState(updates: Partial<AppState>): Promise<AppState> {
  try {
    const currentState = await getState();
    
    // Deep merge updates
    const newState: AppState = {
      replay: { ...currentState.replay, ...updates.replay },
      hud: { ...currentState.hud, ...updates.hud },
      relic: { ...currentState.relic, ...updates.relic },
      broadcast: { ...currentState.broadcast, ...updates.broadcast },
      mint: { ...currentState.mint, ...updates.mint },
      system: {
        ...currentState.system,
        ...updates.system,
        lastUpdated: Date.now(),
        version: STATE_VERSION
      }
    };

    await kv.set(STATE_KEY, newState);
    
    console.log('State updated:', updates);
    return newState;
    
  } catch (error) {
    console.error('Failed to update state:', error);
    throw error;
  }
}

export async function resetState(): Promise<AppState> {
  try {
    const freshState = {
      ...DEFAULT_STATE,
      system: {
        ...DEFAULT_STATE.system,
        lastUpdated: Date.now()
      }
    };
    
    await kv.set(STATE_KEY, freshState);
    console.log('State reset to default');
    return freshState;
    
  } catch (error) {
    console.error('Failed to reset state:', error);
    throw error;
  }
}

export async function getStateSnapshot(): Promise<{ state: AppState; timestamp: number }> {
  const state = await getState();
  return {
    state,
    timestamp: Date.now()
  };
}

// Utility functions for specific state checks
export async function isReplayActive(): Promise<boolean> {
  const state = await getState();
  return state.replay.active;
}

export async function isHudDecodeEnabled(): Promise<boolean> {
  const state = await getState();
  return state.hud.decodeEnabled;
}

export async function isRelicEvolving(): Promise<boolean> {
  const state = await getState();
  return state.relic.evolving;
}

export async function isMintGateOpen(): Promise<boolean> {
  const state = await getState();
  return state.mint.gateOpen;
}

export async function getPulseCount(): Promise<number> {
  const state = await getState();
  return state.broadcast.pulseCount;
}

// State validation
export function validateState(state: any): state is AppState {
  return (
    typeof state === 'object' &&
    state !== null &&
    typeof state.replay === 'object' &&
    typeof state.hud === 'object' &&
    typeof state.relic === 'object' &&
    typeof state.broadcast === 'object' &&
    typeof state.mint === 'object' &&
    typeof state.system === 'object' &&
    typeof state.replay.active === 'boolean' &&
    typeof state.hud.decodeEnabled === 'boolean' &&
    typeof state.relic.evolving === 'boolean' &&
    typeof state.mint.gateOpen === 'boolean' &&
    typeof state.broadcast.pulseCount === 'number' &&
    typeof state.system.lastUpdated === 'number' &&
    typeof state.system.version === 'string'
  );
}