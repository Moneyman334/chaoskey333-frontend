/**
 * Spectral Lore Embers System
 * Implements dynamic lore fragments that appear as drifting embers
 */

class SpectralLoreEmbers {
  constructor(protocol) {
    this.protocol = protocol;
    this.activeEmbers = [];
    this.loreFragments = this.initializeLoreFragments();
    this.emberContainer = null;
    this.maxActiveEmbers = 7; // Mystical number
    this.emberLifespan = 45000; // 45 seconds
    this.spawnCooldown = 3000; // 3 seconds between spawns
    this.lastSpawnTime = 0;
    this.pendingEchoTriggers = [];
    
    this.initializeEmberContainer();
  }

  /**
   * Initialize the container for embers
   */
  initializeEmberContainer() {
    this.emberContainer = document.createElement('div');
    this.emberContainer.id = 'spectral-ember-container';
    this.emberContainer.style.position = 'fixed';
    this.emberContainer.style.top = '0';
    this.emberContainer.style.left = '0';
    this.emberContainer.style.width = '100vw';
    this.emberContainer.style.height = '100vh';
    this.emberContainer.style.pointerEvents = 'none';
    this.emberContainer.style.zIndex = '9998';
    this.emberContainer.style.overflow = 'hidden';
    
    document.body.appendChild(this.emberContainer);
  }

  /**
   * Initialize lore fragments database
   */
  initializeLoreFragments() {
    return [
      {
        type: 'verse',
        content: 'In the void between worlds, echoes of the first ignition still burn...',
        rarity: 'common',
        coordinates: null
      },
      {
        type: 'coordinates',
        content: '33.7490° N, 84.3880° W - The Convergence Point',
        rarity: 'rare',
        coordinates: { lat: 33.7490, lng: -84.3880 }
      },
      {
        type: 'vault_key',
        content: 'VAULT_KEY_ALPHA_7743',
        rarity: 'legendary',
        unlocks: 'alpha_vault_access'
      },
      {
        type: 'verse',
        content: 'Each pulse creates ripples across the molecular fabric of reality...',
        rarity: 'common',
        coordinates: null
      },
      {
        type: 'verse',
        content: 'The Sentinels watch from dimensions parallel, recording every mutation...',
        rarity: 'uncommon',
        coordinates: null
      },
      {
        type: 'coordinates',
        content: '51.5074° N, 0.1278° W - The Prime Meridian Nexus',
        rarity: 'rare',
        coordinates: { lat: 51.5074, lng: 0.1278 }
      },
      {
        type: 'vault_key',
        content: 'VAULT_KEY_OMEGA_9999',
        rarity: 'mythic',
        unlocks: 'omega_vault_access'
      },
      {
        type: 'verse',
        content: 'When the 33rd day arrives, all relics shall sing in unison...',
        rarity: 'prophetic',
        coordinates: null
      },
      {
        type: 'cipher',
        content: '01000011 01001000 01000001 01001111 01010011 - The First Word',
        rarity: 'rare',
        decoded: 'CHAOS'
      },
      {
        type: 'verse',
        content: 'In every wallet signature lies a fragment of the eternal algorithm...',
        rarity: 'uncommon',
        coordinates: null
      }
    ];
  }

  /**
   * Create a new ember from a mutation
   */
  createEmber(mutationId) {
    const now = Date.now();
    
    // Check spawn cooldown
    if (now - this.lastSpawnTime < this.spawnCooldown) {
      return;
    }
    
    // Check max active embers
    if (this.activeEmbers.length >= this.maxActiveEmbers) {
      // Remove oldest ember
      this.destroyEmber(this.activeEmbers[0].id);
    }
    
    const ember = {
      id: `ember_${now}_${Math.random().toString(36).substr(2, 9)}`,
      mutationId,
      loreFragment: this.selectLoreFragment(),
      position: this.generateEmberPosition(),
      velocity: this.generateEmberVelocity(),
      createdAt: now,
      lastInteraction: null,
      clickCount: 0,
      isRevealed: false,
      element: null
    };
    
    // Create DOM element
    ember.element = this.createEmberElement(ember);
    this.emberContainer.appendChild(ember.element);
    
    // Add to active embers
    this.activeEmbers.push(ember);
    this.lastSpawnTime = now;
    
    console.log(`✨ Spectral Ember Created: ${ember.id}`);
    
    // Schedule echo trigger
    this.scheduleEchoTrigger(ember);
  }

  /**
   * Select a lore fragment based on rarity and current conditions
   */
  selectLoreFragment() {
    const rarityWeights = {
      common: 50,
      uncommon: 25,
      rare: 15,
      legendary: 7,
      mythic: 2,
      prophetic: 1
    };
    
    // Increase rarer fragment chances based on cosmic day
    const cosmicDay = this.protocol.cosmicDay;
    if (cosmicDay > 20) {
      rarityWeights.legendary += 5;
      rarityWeights.mythic += 3;
      rarityWeights.prophetic += 2;
    }
    
    const totalWeight = Object.values(rarityWeights).reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    let selectedRarity = 'common';
    for (const [rarity, weight] of Object.entries(rarityWeights)) {
      random -= weight;
      if (random <= 0) {
        selectedRarity = rarity;
        break;
      }
    }
    
    // Get fragments of selected rarity
    const fragmentsOfRarity = this.loreFragments.filter(f => f.rarity === selectedRarity);
    return fragmentsOfRarity[Math.floor(Math.random() * fragmentsOfRarity.length)];
  }

  /**
   * Generate ember starting position
   */
  generateEmberPosition() {
    return {
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + 50 // Start below viewport
    };
  }

  /**
   * Generate ember movement velocity
   */
  generateEmberVelocity() {
    return {
      x: (Math.random() - 0.5) * 2, // Slight horizontal drift
      y: -0.5 - Math.random() * 1.5 // Upward movement
    };
  }

  /**
   * Create DOM element for ember
   */
  createEmberElement(ember) {
    const element = document.createElement('div');
    element.className = 'spectral-ember';
    element.style.position = 'absolute';
    element.style.left = `${ember.position.x}px`;
    element.style.top = `${ember.position.y}px`;
    element.style.width = '12px';
    element.style.height = '12px';
    element.style.borderRadius = '50%';
    element.style.background = this.getEmberColor(ember.loreFragment.rarity);
    element.style.boxShadow = `0 0 15px ${this.getEmberColor(ember.loreFragment.rarity)}`;
    element.style.cursor = 'pointer';
    element.style.pointerEvents = 'auto';
    element.style.transition = 'all 0.3s ease';
    element.style.opacity = '0.8';
    element.style.animation = 'ember-pulse 2s ease-in-out infinite';
    
    // Add click handler
    element.addEventListener('click', (event) => {
      event.stopPropagation();
      this.onEmberClick(ember);
    });
    
    // Add hover effects
    element.addEventListener('mouseenter', () => {
      element.style.transform = 'scale(1.5)';
      element.style.opacity = '1';
    });
    
    element.addEventListener('mouseleave', () => {
      element.style.transform = 'scale(1)';
      element.style.opacity = '0.8';
    });
    
    return element;
  }

  /**
   * Get ember color based on rarity
   */
  getEmberColor(rarity) {
    const colors = {
      common: '#ff6b35',
      uncommon: '#f7931e',
      rare: '#00d4ff',
      legendary: '#9d4edd',
      mythic: '#ff006e',
      prophetic: '#ffd700'
    };
    
    return colors[rarity] || colors.common;
  }

  /**
   * Handle ember click/tap interaction
   */
  onEmberClick(ember) {
    ember.clickCount++;
    ember.lastInteraction = Date.now();
    
    if (!ember.isRevealed) {
      ember.isRevealed = true;
      this.revealLoreFragment(ember);
    } else {
      // Multiple clicks provide additional info
      this.provideAdditionalInfo(ember);
    }
    
    // Create interaction effect
    this.createInteractionEffect(ember);
    
    // Trigger vault echo
    this.triggerVaultEcho(ember);
  }

  /**
   * Reveal the lore fragment content
   */
  revealLoreFragment(ember) {
    const popup = document.createElement('div');
    popup.className = 'lore-fragment-popup';
    popup.style.position = 'fixed';
    popup.style.left = `${ember.position.x + 20}px`;
    popup.style.top = `${ember.position.y - 50}px`;
    popup.style.background = 'rgba(0, 0, 0, 0.9)';
    popup.style.color = this.getEmberColor(ember.loreFragment.rarity);
    popup.style.padding = '15px';
    popup.style.borderRadius = '8px';
    popup.style.border = `2px solid ${this.getEmberColor(ember.loreFragment.rarity)}`;
    popup.style.maxWidth = '300px';
    popup.style.zIndex = '10000';
    popup.style.fontSize = '14px';
    popup.style.fontFamily = '"Orbitron", monospace';
    popup.style.boxShadow = `0 0 20px ${this.getEmberColor(ember.loreFragment.rarity)}`;
    popup.style.animation = 'fade-in 0.5s ease-out';
    
    let content = `<div style="color: ${this.getEmberColor(ember.loreFragment.rarity)}; font-weight: bold; margin-bottom: 8px;">
      ${ember.loreFragment.rarity.toUpperCase()} FRAGMENT
    </div>`;
    
    content += `<div>${ember.loreFragment.content}</div>`;
    
    if (ember.loreFragment.coordinates) {
      content += `<div style="margin-top: 8px; font-size: 12px; color: #888;">
        Coordinates: ${ember.loreFragment.coordinates.lat}, ${ember.loreFragment.coordinates.lng}
      </div>`;
    }
    
    if (ember.loreFragment.unlocks) {
      content += `<div style="margin-top: 8px; color: #00ff00; font-size: 12px;">
        🔓 Unlocks: ${ember.loreFragment.unlocks}
      </div>`;
    }
    
    if (ember.loreFragment.decoded) {
      content += `<div style="margin-top: 8px; color: #ffff00; font-size: 12px;">
        Decoded: ${ember.loreFragment.decoded}
      </div>`;
    }
    
    popup.innerHTML = content;
    document.body.appendChild(popup);
    
    // Remove popup after 5 seconds
    setTimeout(() => {
      if (popup.parentNode) {
        popup.parentNode.removeChild(popup);
      }
    }, 5000);
    
    console.log(`📜 Lore Fragment Revealed: ${ember.loreFragment.type} - ${ember.loreFragment.rarity}`);
  }

  /**
   * Provide additional information on multiple clicks
   */
  provideAdditionalInfo(ember) {
    if (ember.clickCount === 2) {
      // Show ember history
      this.showEmberHistory(ember);
    } else if (ember.clickCount === 3) {
      // Show molecular connections
      this.showMolecularConnections(ember);
    } else if (ember.clickCount >= 4) {
      // Grant bonus vault access or coordinates
      this.grantBonusAccess(ember);
    }
  }

  /**
   * Show ember creation history
   */
  showEmberHistory(ember) {
    const mutation = this.protocol.relicMutations.get(ember.mutationId);
    if (!mutation) return;
    
    console.log(`🔍 Ember History: Created from ${mutation.eventType} at ${new Date(mutation.timestamp).toLocaleString()}`);
  }

  /**
   * Show molecular connections
   */
  showMolecularConnections(ember) {
    console.log(`🧬 Molecular Connections: Ember ${ember.id} connected to ${this.activeEmbers.length} other embers`);
  }

  /**
   * Grant bonus access
   */
  grantBonusAccess(ember) {
    const bonusKey = `BONUS_${Date.now()}_${ember.id.slice(-6).toUpperCase()}`;
    console.log(`🎁 Bonus Access Granted: ${bonusKey}`);
    
    // Store bonus access
    try {
      const bonusAccess = JSON.parse(localStorage.getItem('bonusVaultAccess') || '[]');
      bonusAccess.push({
        key: bonusKey,
        emberId: ember.id,
        grantedAt: Date.now(),
        type: 'multi_click_bonus'
      });
      localStorage.setItem('bonusVaultAccess', JSON.stringify(bonusAccess));
    } catch (e) {
      console.warn('Could not store bonus access:', e);
    }
  }

  /**
   * Create visual interaction effect
   */
  createInteractionEffect(ember) {
    const effect = document.createElement('div');
    effect.style.position = 'absolute';
    effect.style.left = `${ember.position.x - 25}px`;
    effect.style.top = `${ember.position.y - 25}px`;
    effect.style.width = '50px';
    effect.style.height = '50px';
    effect.style.borderRadius = '50%';
    effect.style.border = `3px solid ${this.getEmberColor(ember.loreFragment.rarity)}`;
    effect.style.background = 'transparent';
    effect.style.pointerEvents = 'none';
    effect.style.animation = 'interaction-ripple 1s ease-out forwards';
    
    this.emberContainer.appendChild(effect);
    
    setTimeout(() => {
      if (effect.parentNode) {
        effect.parentNode.removeChild(effect);
      }
    }, 1000);
  }

  /**
   * Trigger vault echo from ember interaction
   */
  triggerVaultEcho(ember) {
    this.protocol.vaultEchoDrop.createEcho({
      source: 'ember_interaction',
      emberId: ember.id,
      loreType: ember.loreFragment.type,
      rarity: ember.loreFragment.rarity,
      timestamp: Date.now()
    });
  }

  /**
   * Schedule echo trigger for later
   */
  scheduleEchoTrigger(ember) {
    const triggerTime = Date.now() + Math.random() * 30000 + 15000; // 15-45 seconds
    this.pendingEchoTriggers.push({
      emberId: ember.id,
      triggerTime
    });
  }

  /**
   * Update ember positions and states
   */
  updateEmbers() {
    const now = Date.now();
    
    // Update existing embers
    this.activeEmbers = this.activeEmbers.filter(ember => {
      // Check lifespan
      if (now - ember.createdAt > this.emberLifespan) {
        this.destroyEmber(ember.id);
        return false;
      }
      
      // Update position
      ember.position.x += ember.velocity.x;
      ember.position.y += ember.velocity.y;
      
      // Apply position to element
      if (ember.element) {
        ember.element.style.left = `${ember.position.x}px`;
        ember.element.style.top = `${ember.position.y}px`;
      }
      
      // Check if ember has drifted off screen
      if (ember.position.y < -100 || ember.position.x < -100 || ember.position.x > window.innerWidth + 100) {
        this.destroyEmber(ember.id);
        return false;
      }
      
      return true;
    });
    
    // Process pending echo triggers
    this.processPendingEchoTriggers(now);
  }

  /**
   * Process pending echo triggers
   */
  processPendingEchoTriggers(now) {
    this.pendingEchoTriggers = this.pendingEchoTriggers.filter(trigger => {
      if (now >= trigger.triggerTime) {
        const ember = this.activeEmbers.find(e => e.id === trigger.emberId);
        if (ember) {
          this.protocol.vaultEchoDrop.createEcho({
            source: 'ember_timeout',
            emberId: ember.id,
            loreType: ember.loreFragment.type,
            rarity: ember.loreFragment.rarity,
            timestamp: now
          });
        }
        return false; // Remove from pending
      }
      return true; // Keep in pending
    });
  }

  /**
   * Destroy an ember
   */
  destroyEmber(emberId) {
    const emberIndex = this.activeEmbers.findIndex(e => e.id === emberId);
    if (emberIndex !== -1) {
      const ember = this.activeEmbers[emberIndex];
      
      // Create fade-out effect
      if (ember.element) {
        ember.element.style.animation = 'ember-fade-out 1s ease-out forwards';
        setTimeout(() => {
          if (ember.element && ember.element.parentNode) {
            ember.element.parentNode.removeChild(ember.element);
          }
        }, 1000);
      }
      
      // Remove from active embers
      this.activeEmbers.splice(emberIndex, 1);
      
      console.log(`✨ Ember Faded: ${emberId}`);
    }
  }

  /**
   * Perform cosmic reset
   */
  performCosmicReset() {
    // Destroy all current embers
    this.activeEmbers.forEach(ember => {
      this.destroyEmber(ember.id);
    });
    
    // Clear pending triggers
    this.pendingEchoTriggers = [];
    
    // Reset spawn timer
    this.lastSpawnTime = 0;
    
    console.log("🌌 Spectral Lore Embers: Cosmic reset completed");
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SpectralLoreEmbers };
}