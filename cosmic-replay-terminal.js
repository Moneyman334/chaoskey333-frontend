/**
 * ChaosKey333 Cosmic Replay Terminal v2.0 - Sentinel Event Forge
 * Enhanced with glyph event integration and permanent evolution triggers
 */

class CosmicReplayTerminal {
  constructor() {
    this.replayData = new Map();
    this.activeReplay = null;
    this.playbackState = {
      playing: false,
      speed: 1.0,
      currentTime: 0,
      duration: 0,
      perspective: 'default'
    };
    this.eventTags = new Map();
    this.replayCallbacks = new Set();
    this.storageKey = 'chaoskey333_replay_data';
    
    // Integration with glyph decoder and evolution trigger
    this.initializeIntegrations();
    this.loadReplayData();
  }

  /**
   * Initialize integrations with other systems
   */
  initializeIntegrations() {
    // Connect to glyph decoder
    if (window.glyphDecoder) {
      window.glyphDecoder.onGlyphDecoded((glyphEvent) => {
        this.embedGlyphEvent(glyphEvent);
      });
    }

    // Connect to evolution trigger
    if (window.permanentEvolutionTrigger) {
      window.permanentEvolutionTrigger.onEvolutionTriggered((evolution) => {
        this.logEvolutionEvent(evolution);
      });
    }
  }

  /**
   * Record a new vault broadcast pulse event
   */
  recordBroadcastPulse(pulseData) {
    const pulse = {
      id: this.generatePulseId(),
      timestamp: Date.now(),
      type: 'broadcast_pulse',
      data: pulseData,
      glyphEvents: [],
      evolutionEvents: [],
      snapshots: {
        start: this.captureRelicSnapshot(),
        end: null
      },
      metadata: {
        walletAddress: pulseData.walletAddress,
        transactionHash: pulseData.transactionHash,
        blockNumber: pulseData.blockNumber
      }
    };

    this.replayData.set(pulse.id, pulse);
    this.saveReplayData();
    
    return pulse;
  }

  /**
   * Embed a decoded glyph event into the replay timeline
   */
  embedGlyphEvent(glyphEvent) {
    if (this.activeReplay) {
      // Add to current replay session
      this.activeReplay.glyphEvents.push({
        ...glyphEvent,
        replayTime: this.playbackState.currentTime
      });

      // Trigger instant relic evolution if conditions are met
      if (glyphEvent.evolutionTrigger && glyphEvent.evolutionTrigger.length > 0) {
        this.triggerInstantEvolution(glyphEvent);
      }
    }

    // Add to all recent replay sessions
    const recentSessions = this.getRecentSessions(5);
    recentSessions.forEach(session => {
      session.glyphEvents.push(glyphEvent);
    });

    this.saveReplayData();
  }

  /**
   * Log an evolution event to replay logs
   */
  logEvolutionEvent(evolution) {
    if (this.activeReplay) {
      this.activeReplay.evolutionEvents.push({
        ...evolution,
        replayTime: this.playbackState.currentTime
      });
    }

    // Create living historical moment
    const livingMoment = this.createLivingMoment(evolution);
    this.replayData.set(livingMoment.id, livingMoment);
    
    this.saveReplayData();
  }

  /**
   * Start replay session
   */
  startReplay(pulseId, options = {}) {
    const pulse = this.replayData.get(pulseId);
    if (!pulse) {
      throw new Error(`Pulse ${pulseId} not found`);
    }

    this.activeReplay = { ...pulse };
    this.playbackState = {
      playing: true,
      speed: options.speed || 1.0,
      currentTime: 0,
      duration: this.calculateReplayDuration(pulse),
      perspective: options.perspective || 'default'
    };

    // Capture start snapshot
    this.activeReplay.snapshots.start = this.captureRelicSnapshot();
    
    this.notifyCallbacks('replay_started', this.activeReplay);
    return this.activeReplay;
  }

  /**
   * Control playback speed (0.25x to 3x with audio pitch correction)
   */
  setPlaybackSpeed(speed) {
    const clampedSpeed = Math.max(0.25, Math.min(3.0, speed));
    this.playbackState.speed = clampedSpeed;
    
    // Apply audio pitch correction
    this.applyAudioPitchCorrection(clampedSpeed);
    
    this.notifyCallbacks('speed_changed', { speed: clampedSpeed });
  }

  /**
   * Change replay perspective (observer node)
   */
  setPerspective(perspective) {
    const perspectives = ['default', 'vault_core', 'singularity_map', 'glyph_matrix', 'evolution_chamber'];
    
    if (perspectives.includes(perspective)) {
      this.playbackState.perspective = perspective;
      this.notifyCallbacks('perspective_changed', { perspective });
    }
  }

  /**
   * Add time-coded tag during replay
   */
  addEventTag(tag, description = '') {
    const eventTag = {
      id: this.generateTagId(),
      timestamp: Date.now(),
      replayTime: this.playbackState.currentTime,
      tag: tag,
      description: description,
      pulseId: this.activeReplay?.id,
      walletAddress: this.getCurrentWalletAddress()
    };

    this.eventTags.set(eventTag.id, eventTag);
    this.saveReplayData();
    
    return eventTag;
  }

  /**
   * Jump to specific time or tag
   */
  jumpToTime(time) {
    if (this.activeReplay) {
      this.playbackState.currentTime = Math.max(0, Math.min(time, this.playbackState.duration));
      this.notifyCallbacks('time_jump', { time: this.playbackState.currentTime });
    }
  }

  jumpToTag(tagId) {
    const tag = this.eventTags.get(tagId);
    if (tag && tag.pulseId === this.activeReplay?.id) {
      this.jumpToTime(tag.replayTime);
    }
  }

  /**
   * Generate AI replay summary
   */
  generateReplaySummary(pulseId) {
    const pulse = this.replayData.get(pulseId);
    if (!pulse) return null;

    const summary = {
      id: this.generateSummaryId(),
      pulseId: pulseId,
      timestamp: Date.now(),
      keyMoments: this.extractKeyMoments(pulse),
      glyphSequences: this.analyzeGlyphSequences(pulse.glyphEvents),
      loreFragments: this.extractLoreFragments(pulse),
      evolutionChanges: this.summarizeEvolutions(pulse.evolutionEvents),
      duration: this.calculateReplayDuration(pulse),
      perspectives: this.getAvailablePerspectives(pulse)
    };

    return summary;
  }

  /**
   * Transform into Sentinel Event Forge mode
   */
  transformToSentinelForge() {
    const forge = {
      mode: 'sentinel_forge',
      capabilities: {
        glyphDecoding: true,
        evolutionTriggers: true,
        livingMoments: true,
        realTimeMutation: true,
        historicalPreservation: true
      },
      activeIntegrations: {
        glyphDecoder: !!window.glyphDecoder,
        evolutionTrigger: !!window.permanentEvolutionTrigger
      },
      forgeMetrics: {
        totalReplays: this.replayData.size,
        glyphEventsProcessed: this.getTotalGlyphEvents(),
        evolutionsTriggered: this.getTotalEvolutions(),
        livingMoments: this.getLivingMoments().length
      }
    };

    this.notifyCallbacks('forge_transformed', forge);
    return forge;
  }

  // Private helper methods
  generatePulseId() {
    return `pulse_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateTagId() {
    return `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateSummaryId() {
    return `summary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  captureRelicSnapshot() {
    return {
      timestamp: Date.now(),
      walletAddress: this.getCurrentWalletAddress(),
      relicState: this.getCurrentRelicState(),
      visualState: this.getCurrentVisualState(),
      evolutionLevel: this.getCurrentEvolutionLevel()
    };
  }

  triggerInstantEvolution(glyphEvent) {
    if (window.permanentEvolutionTrigger) {
      const evolutions = window.permanentEvolutionTrigger.processGlyphEvent(glyphEvent);
      evolutions.forEach(evolution => {
        this.logEvolutionEvent(evolution);
        this.applyInstantMutation(evolution);
      });
    }
  }

  createLivingMoment(evolution) {
    return {
      id: this.generatePulseId(),
      timestamp: Date.now(),
      type: 'living_moment',
      evolution: evolution,
      glyphEvents: [],
      evolutionEvents: [evolution],
      snapshots: {
        start: this.captureRelicSnapshot(),
        end: null
      },
      livingProperties: {
        canMutate: true,
        realTime: true,
        persistent: true
      }
    };
  }

  calculateReplayDuration(pulse) {
    // Calculate based on events and content
    const baseTime = 30000; // 30 seconds base
    const glyphTime = pulse.glyphEvents.length * 2000; // 2 seconds per glyph
    const evolutionTime = pulse.evolutionEvents.length * 5000; // 5 seconds per evolution
    
    return baseTime + glyphTime + evolutionTime;
  }

  applyAudioPitchCorrection(speed) {
    // Implement audio pitch correction for different playback speeds
    if (typeof AudioContext !== 'undefined') {
      // Web Audio API implementation would go here
      console.log(`Applying audio pitch correction for ${speed}x speed`);
    }
  }

  extractKeyMoments(pulse) {
    const moments = [];
    
    // Add glyph events as key moments
    pulse.glyphEvents.forEach(glyph => {
      if (glyph.intensity > 0.7) {
        moments.push({
          time: glyph.timestamp,
          type: 'glyph_event',
          description: `${glyph.type} glyph with intensity ${glyph.intensity.toFixed(2)}`
        });
      }
    });

    // Add evolution events
    pulse.evolutionEvents.forEach(evolution => {
      moments.push({
        time: evolution.timestamp,
        type: 'evolution',
        description: `${evolution.mutation.type} evolution triggered`
      });
    });

    return moments.sort((a, b) => a.time - b.time);
  }

  analyzeGlyphSequences(glyphEvents) {
    // Analyze patterns in glyph events
    const sequences = [];
    let currentSequence = [];
    
    glyphEvents.forEach(glyph => {
      if (currentSequence.length === 0 || glyph.timestamp - currentSequence[currentSequence.length - 1].timestamp < 5000) {
        currentSequence.push(glyph);
      } else {
        if (currentSequence.length > 1) {
          sequences.push([...currentSequence]);
        }
        currentSequence = [glyph];
      }
    });

    if (currentSequence.length > 1) {
      sequences.push(currentSequence);
    }

    return sequences;
  }

  extractLoreFragments(pulse) {
    // Extract meaningful lore from the pulse data
    const fragments = [];
    
    if (pulse.metadata.transactionHash) {
      fragments.push(`Transaction ${pulse.metadata.transactionHash.substr(0, 10)}... inscribed in block ${pulse.metadata.blockNumber}`);
    }

    if (pulse.glyphEvents.length > 0) {
      fragments.push(`${pulse.glyphEvents.length} cosmic glyphs manifested during this pulse`);
    }

    if (pulse.evolutionEvents.length > 0) {
      fragments.push(`Relic underwent ${pulse.evolutionEvents.length} evolutionary transformations`);
    }

    return fragments;
  }

  summarizeEvolutions(evolutionEvents) {
    return evolutionEvents.map(evolution => ({
      type: evolution.mutation.type,
      intensity: evolution.mutation.intensity,
      timestamp: evolution.timestamp,
      triggered_by: evolution.triggerEvent?.type
    }));
  }

  getAvailablePerspectives(pulse) {
    const perspectives = ['default'];
    
    if (pulse.glyphEvents.length > 0) perspectives.push('glyph_matrix');
    if (pulse.evolutionEvents.length > 0) perspectives.push('evolution_chamber');
    if (pulse.metadata.transactionHash) perspectives.push('vault_core');
    
    perspectives.push('singularity_map');
    
    return perspectives;
  }

  getCurrentWalletAddress() {
    return window.userWalletAddress || window.walletAddress || null;
  }

  getCurrentRelicState() {
    // Mock implementation - would interface with actual relic contract
    return {
      tokenId: 1,
      level: 1,
      attributes: {},
      metadata: {}
    };
  }

  getCurrentVisualState() {
    return {
      glow: 'normal',
      aura: 'stable',
      effects: []
    };
  }

  getCurrentEvolutionLevel() {
    return 1;
  }

  applyInstantMutation(evolution) {
    // Apply visual/state changes immediately
    console.log('Applying instant mutation:', evolution);
    this.notifyCallbacks('instant_mutation', evolution);
  }

  getTotalGlyphEvents() {
    let total = 0;
    for (const pulse of this.replayData.values()) {
      total += pulse.glyphEvents?.length || 0;
    }
    return total;
  }

  getTotalEvolutions() {
    let total = 0;
    for (const pulse of this.replayData.values()) {
      total += pulse.evolutionEvents?.length || 0;
    }
    return total;
  }

  getLivingMoments() {
    return Array.from(this.replayData.values()).filter(pulse => pulse.type === 'living_moment');
  }

  getRecentSessions(limit) {
    return Array.from(this.replayData.values())
      .filter(pulse => pulse.type === 'broadcast_pulse')
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  notifyCallbacks(event, data) {
    this.replayCallbacks.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Error in replay callback:', error);
      }
    });
  }

  saveReplayData() {
    try {
      const dataToSave = {
        replayData: Array.from(this.replayData.entries()),
        eventTags: Array.from(this.eventTags.entries()),
        lastSaved: Date.now()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Failed to save replay data:', error);
    }
  }

  loadReplayData() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        
        if (data.replayData) {
          this.replayData = new Map(data.replayData);
        }
        
        if (data.eventTags) {
          this.eventTags = new Map(data.eventTags);
        }
      }
    } catch (error) {
      console.error('Failed to load replay data:', error);
    }
  }

  /**
   * Public API methods
   */
  onReplayEvent(callback) {
    this.replayCallbacks.add(callback);
  }

  offReplayEvent(callback) {
    this.replayCallbacks.delete(callback);
  }

  getReplayHistory() {
    return Array.from(this.replayData.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  getEventTags(pulseId = null) {
    const tags = Array.from(this.eventTags.values());
    return pulseId ? tags.filter(tag => tag.pulseId === pulseId) : tags;
  }

  getPlaybackState() {
    return { ...this.playbackState };
  }

  getActiveReplay() {
    return this.activeReplay;
  }
}

// Singleton instance
const cosmicReplayTerminal = new CosmicReplayTerminal();

// Auto-transform to Sentinel Event Forge after initialization
setTimeout(() => {
  cosmicReplayTerminal.transformToSentinelForge();
}, 1000);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CosmicReplayTerminal;
} else {
  window.CosmicReplayTerminal = CosmicReplayTerminal;
  window.cosmicReplayTerminal = cosmicReplayTerminal;
}