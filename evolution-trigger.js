/**
 * ChaosKey333 Permanent Evolution Trigger System (PR #24 Functionality)
 * 
 * This module manages permanent relic evolution triggers that persist
 * across sessions and can mutate artifacts in real-time.
 */

class PermanentEvolutionTrigger {
  constructor() {
    this.evolutionRules = new Map();
    this.activeEvolutions = new Map();
    this.permanentMutations = [];
    this.triggerCallbacks = new Set();
    this.storageKey = 'chaoskey333_permanent_evolutions';
    
    // Load permanent state from localStorage
    this.loadPermanentState();
  }

  /**
   * Register a callback for when evolution triggers activate
   */
  onEvolutionTriggered(callback) {
    this.triggerCallbacks.add(callback);
  }

  /**
   * Remove an evolution trigger callback
   */
  offEvolutionTriggered(callback) {
    this.triggerCallbacks.delete(callback);
  }

  /**
   * Add a permanent evolution rule
   */
  addEvolutionRule(ruleId, rule) {
    const evolutionRule = {
      id: ruleId,
      condition: rule.condition,
      mutation: rule.mutation,
      permanent: true,
      created: Date.now(),
      triggered: 0,
      active: true
    };

    this.evolutionRules.set(ruleId, evolutionRule);
    this.savePermanentState();
    
    return evolutionRule;
  }

  /**
   * Process a glyph event against all evolution rules
   */
  processGlyphEvent(glyphEvent) {
    const triggeredEvolutions = [];

    for (const [ruleId, rule] of this.evolutionRules) {
      if (!rule.active) continue;

      if (this.evaluateCondition(rule.condition, glyphEvent)) {
        const evolution = this.triggerEvolution(ruleId, rule, glyphEvent);
        triggeredEvolutions.push(evolution);
      }
    }

    return triggeredEvolutions;
  }

  /**
   * Trigger a specific evolution
   */
  triggerEvolution(ruleId, rule, triggerEvent) {
    const evolution = {
      id: this.generateEvolutionId(),
      ruleId: ruleId,
      timestamp: Date.now(),
      triggerEvent: triggerEvent,
      mutation: this.applyMutation(rule.mutation, triggerEvent),
      permanent: rule.permanent,
      status: 'active'
    };

    // Store active evolution
    this.activeEvolutions.set(evolution.id, evolution);
    
    // If permanent, add to permanent mutations
    if (rule.permanent) {
      this.permanentMutations.push({
        evolutionId: evolution.id,
        mutation: evolution.mutation,
        timestamp: evolution.timestamp,
        triggerEvent: {
          id: triggerEvent.id,
          type: triggerEvent.type,
          intensity: triggerEvent.intensity
        }
      });
    }

    // Update rule trigger count
    rule.triggered++;
    
    // Save state
    this.savePermanentState();

    // Notify callbacks
    this.triggerCallbacks.forEach(callback => {
      try {
        callback(evolution);
      } catch (error) {
        console.error('Error in evolution trigger callback:', error);
      }
    });

    return evolution;
  }

  /**
   * Get all active evolutions
   */
  getActiveEvolutions() {
    return Array.from(this.activeEvolutions.values());
  }

  /**
   * Get all permanent mutations
   */
  getPermanentMutations() {
    return [...this.permanentMutations];
  }

  /**
   * Get evolution history for replay logs
   */
  getEvolutionHistory(limit = 100) {
    return this.permanentMutations
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Apply permanent mutations to current artifact state
   */
  applyPermanentMutations(artifactState) {
    let mutatedState = { ...artifactState };

    for (const mutation of this.permanentMutations) {
      mutatedState = this.applyMutationToState(mutatedState, mutation.mutation);
    }

    return mutatedState;
  }

  /**
   * Create a living historical moment from replay logs
   */
  createLivingMoment(replayData) {
    const livingMoment = {
      id: this.generateMomentId(),
      timestamp: Date.now(),
      replayData: replayData,
      mutations: [],
      active: true
    };

    // Process any glyph events in the replay data
    if (replayData.glyphEvents) {
      for (const glyphEvent of replayData.glyphEvents) {
        const evolutions = this.processGlyphEvent(glyphEvent);
        livingMoment.mutations.push(...evolutions);
      }
    }

    return livingMoment;
  }

  // Private helper methods
  generateEvolutionId() {
    return `evo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateMomentId() {
    return `moment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  evaluateCondition(condition, glyphEvent) {
    try {
      // Simple condition evaluation
      if (typeof condition === 'function') {
        return condition(glyphEvent);
      }

      if (typeof condition === 'object') {
        return this.evaluateObjectCondition(condition, glyphEvent);
      }

      return false;
    } catch (error) {
      console.error('Error evaluating evolution condition:', error);
      return false;
    }
  }

  evaluateObjectCondition(condition, glyphEvent) {
    for (const [key, value] of Object.entries(condition)) {
      const eventValue = glyphEvent[key];
      
      if (typeof value === 'object' && value.operator) {
        if (!this.evaluateOperator(eventValue, value.operator, value.value)) {
          return false;
        }
      } else if (eventValue !== value) {
        return false;
      }
    }
    return true;
  }

  evaluateOperator(eventValue, operator, conditionValue) {
    switch (operator) {
      case '>': return eventValue > conditionValue;
      case '<': return eventValue < conditionValue;
      case '>=': return eventValue >= conditionValue;
      case '<=': return eventValue <= conditionValue;
      case '==': return eventValue == conditionValue;
      case '===': return eventValue === conditionValue;
      case 'includes': return eventValue.includes && eventValue.includes(conditionValue);
      default: return false;
    }
  }

  applyMutation(mutation, triggerEvent) {
    return {
      type: mutation.type || 'enhancement',
      intensity: mutation.intensity || triggerEvent.intensity,
      attributes: mutation.attributes || {},
      visual: mutation.visual || {},
      metadata: {
        triggeredBy: triggerEvent.id,
        triggerType: triggerEvent.type,
        mutationTime: Date.now()
      }
    };
  }

  applyMutationToState(state, mutation) {
    const mutatedState = { ...state };

    // Apply attribute changes
    if (mutation.attributes) {
      mutatedState.attributes = { ...mutatedState.attributes, ...mutation.attributes };
    }

    // Apply visual changes
    if (mutation.visual) {
      mutatedState.visual = { ...mutatedState.visual, ...mutation.visual };
    }

    // Increase evolution level
    mutatedState.evolutionLevel = (mutatedState.evolutionLevel || 0) + 1;
    
    // Add mutation timestamp
    mutatedState.lastMutation = Date.now();

    return mutatedState;
  }

  savePermanentState() {
    const state = {
      evolutionRules: Array.from(this.evolutionRules.entries()),
      permanentMutations: this.permanentMutations,
      lastSaved: Date.now()
    };

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save permanent evolution state:', error);
    }
  }

  loadPermanentState() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const state = JSON.parse(saved);
        
        // Restore evolution rules
        if (state.evolutionRules) {
          this.evolutionRules = new Map(state.evolutionRules);
        }
        
        // Restore permanent mutations
        if (state.permanentMutations) {
          this.permanentMutations = state.permanentMutations;
        }
      }
    } catch (error) {
      console.error('Failed to load permanent evolution state:', error);
    }
  }
}

// Singleton instance
const permanentEvolutionTrigger = new PermanentEvolutionTrigger();

// Add some default evolution rules
permanentEvolutionTrigger.addEvolutionRule('high_intensity_amplification', {
  condition: { intensity: { operator: '>', value: 0.8 } },
  mutation: {
    type: 'amplification',
    attributes: { power: 1.2, resonance: 'enhanced' },
    visual: { glow: 'increased', aura: 'expanded' }
  }
});

permanentEvolutionTrigger.addEvolutionRule('perfect_resonance_evolution', {
  condition: (glyphEvent) => glyphEvent.type === 'resonance' && glyphEvent.intensity > 0.9,
  mutation: {
    type: 'transcendence',
    attributes: { harmonic: 'perfect', stability: 'crystalline' },
    visual: { effect: 'prismatic', intensity: 'maximum' }
  }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PermanentEvolutionTrigger;
} else {
  window.PermanentEvolutionTrigger = PermanentEvolutionTrigger;
  window.permanentEvolutionTrigger = permanentEvolutionTrigger;
}