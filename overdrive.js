// ⚡ ChaosKey333 Overdrive Public Broadcast Edition ⚡
// Galaxy-wide synchronized spectacle system

class OverdriveSystem {
  constructor() {
    this.isActive = false;
    this.currentPulse = 0;
    this.expansionProgress = 0;
    this.emberFragments = [];
    this.leaderboard = [];
    this.syncInterval = null;
    this.pulseInterval = 30000; // 30 seconds between pulses
    this.milestoneThresholds = [25, 50, 75, 100]; // Expansion percentages
    this.cinematicReplays = [];
    
    // Initialize system
    this.initializeOverdrive();
  }

  // Initialize the Overdrive system
  async initializeOverdrive() {
    console.log("🌌 Initializing Overdrive Public Broadcast System...");
    
    // Load existing progress from localStorage
    this.loadPersistedData();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initialize UI components
    this.initializeUI();
    
    console.log("✨ Overdrive System Ready for Galaxy-Wide Broadcast");
  }

  // Load persisted data
  loadPersistedData() {
    const saved = localStorage.getItem('chaoskey333_overdrive');
    if (saved) {
      const data = JSON.parse(saved);
      this.expansionProgress = data.expansionProgress || 0;
      this.emberFragments = data.emberFragments || [];
      this.leaderboard = data.leaderboard || [];
      this.currentPulse = data.currentPulse || 0;
    }
  }

  // Save data to localStorage
  persistData() {
    const data = {
      expansionProgress: this.expansionProgress,
      emberFragments: this.emberFragments,
      leaderboard: this.leaderboard,
      currentPulse: this.currentPulse,
      lastUpdate: Date.now()
    };
    localStorage.setItem('chaoskey333_overdrive', JSON.stringify(data));
  }

  // Start synchronized pulse system
  startVaultWideSyncPulse() {
    if (this.isActive) return;
    
    this.isActive = true;
    console.log("🔥 Activating Vault-Wide Echo Drop Sync...");
    
    // Immediate first pulse
    this.triggerSynchronizedPulse();
    
    // Set up recurring pulses
    this.syncInterval = setInterval(() => {
      this.triggerSynchronizedPulse();
    }, this.pulseInterval);
    
    this.updateUIStatus("🌟 OVERDRIVE ACTIVE - Galaxy-Wide Sync Engaged");
  }

  // Stop pulse system
  stopVaultWideSyncPulse() {
    if (!this.isActive) return;
    
    this.isActive = false;
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    console.log("⏸️ Overdrive Pulse System Deactivated");
    this.updateUIStatus("⚡ Overdrive Standby - Ready to Ignite");
  }

  // Trigger a synchronized pulse event
  triggerSynchronizedPulse() {
    this.currentPulse++;
    
    console.log(`🔮 Pulse ${this.currentPulse} - Galaxy-Wide Echo Drop`);
    
    // Visual pulse effect
    this.activateVisualPulse();
    
    // Generate spectral lore ember
    this.cascadeSpectralEmber();
    
    // Update expansion progress
    this.updateExpansionProgress();
    
    // Create cinematic moment
    this.captureEpicMoment();
    
    // Update leaderboard if user contributed
    if (window.userWalletAddress) {
      this.updateLeaderboard(window.userWalletAddress, 'pulse_trigger');
    }
    
    // Persist state
    this.persistData();
    
    // Broadcast to other vault holders (simulated)
    this.broadcastToNetwork();
  }

  // Activate visual pulse effect
  activateVisualPulse() {
    const pulseElement = document.getElementById('overdrive-pulse');
    if (pulseElement) {
      pulseElement.classList.add('galaxy-pulse-active');
      setTimeout(() => {
        pulseElement.classList.remove('galaxy-pulse-active');
      }, 3000);
    }
    
    // Add screen-wide pulse effect
    document.body.classList.add('overdrive-flash');
    setTimeout(() => {
      document.body.classList.remove('overdrive-flash');
    }, 1000);
  }

  // Generate spectral lore ember cascade
  cascadeSpectralEmber() {
    const loreFragments = [
      "🌠 Ancient protocols awakening...",
      "⚡ Vault energy signatures harmonizing...",
      "🔮 Relic evolution pathways emerging...",
      "🌌 Cosmic bass frequencies detected...",
      "✨ Temporal ripples synchronizing...",
      "🌊 Chaos energy cascading through dimensions...",
      "🔥 Origin flare signatures intensifying...",
      "🎭 Spectral masks revealing hidden truths..."
    ];
    
    const ember = {
      id: `ember_${this.currentPulse}_${Date.now()}`,
      fragment: loreFragments[Math.floor(Math.random() * loreFragments.length)],
      timestamp: Date.now(),
      pulseNumber: this.currentPulse,
      discovered: false
    };
    
    this.emberFragments.push(ember);
    
    // Display ember in UI
    this.displayEmberFragment(ember);
    
    // Check for ember combinations
    this.checkEmberCombinations();
  }

  // Display ember fragment in UI
  displayEmberFragment(ember) {
    const emberContainer = document.getElementById('ember-cascade');
    if (!emberContainer) return;
    
    const emberElement = document.createElement('div');
    emberElement.className = 'ember-fragment';
    emberElement.innerHTML = `
      <div class="ember-glow">${ember.fragment}</div>
      <div class="ember-meta">Pulse ${ember.pulseNumber} • ${new Date(ember.timestamp).toLocaleTimeString()}</div>
    `;
    
    emberContainer.prepend(emberElement);
    
    // Remove old fragments (keep last 10)
    const fragments = emberContainer.querySelectorAll('.ember-fragment');
    if (fragments.length > 10) {
      fragments[fragments.length - 1].remove();
    }
  }

  // Check for ember combinations
  checkEmberCombinations() {
    const recentEmbers = this.emberFragments.slice(-3);
    if (recentEmbers.length >= 3) {
      const combination = recentEmbers.map(e => e.fragment).join(" + ");
      console.log("🌟 Ember Combination Discovered:", combination);
      
      // Trigger special event for combination
      this.triggerEmberCombinationEvent(combination);
    }
  }

  // Trigger special ember combination event
  triggerEmberCombinationEvent(combination) {
    const combinationElement = document.getElementById('ember-combinations');
    if (combinationElement) {
      const combDiv = document.createElement('div');
      combDiv.className = 'ember-combination-reveal';
      combDiv.innerHTML = `🌟 COMBINATION REVEALED: ${combination}`;
      combinationElement.appendChild(combDiv);
    }
    
    // Add expansion progress bonus
    this.expansionProgress += 5;
    this.updateMilestoneTracker();
  }

  // Update expansion progress
  updateExpansionProgress() {
    this.expansionProgress += Math.random() * 2 + 0.5; // 0.5-2.5% per pulse
    
    if (this.expansionProgress > 100) {
      this.expansionProgress = 100;
      this.triggerFullExpansionEvent();
    }
    
    this.updateMilestoneTracker();
  }

  // Update milestone tracker UI
  updateMilestoneTracker() {
    const tracker = document.getElementById('milestone-tracker');
    const progressBar = document.getElementById('expansion-progress-bar');
    const progressText = document.getElementById('expansion-progress-text');
    
    if (progressBar) {
      progressBar.style.width = `${this.expansionProgress}%`;
    }
    
    if (progressText) {
      progressText.textContent = `${Math.floor(this.expansionProgress)}%`;
    }
    
    // Check milestone achievements
    this.checkMilestoneAchievements();
  }

  // Check milestone achievements
  checkMilestoneAchievements() {
    this.milestoneThresholds.forEach(threshold => {
      if (this.expansionProgress >= threshold) {
        const achieved = localStorage.getItem(`milestone_${threshold}`);
        if (!achieved) {
          this.triggerMilestoneAchievement(threshold);
          localStorage.setItem(`milestone_${threshold}`, 'true');
        }
      }
    });
  }

  // Trigger milestone achievement
  triggerMilestoneAchievement(threshold) {
    console.log(`🏆 Milestone Achieved: ${threshold}% Expansion`);
    
    const achievementElement = document.getElementById('milestone-achievements');
    if (achievementElement) {
      const achievement = document.createElement('div');
      achievement.className = 'milestone-achievement';
      achievement.innerHTML = `🏆 ${threshold}% EXPANSION ACHIEVED!`;
      achievementElement.appendChild(achievement);
    }
    
    // Trigger special visual effect
    this.activateMilestoneEffect(threshold);
  }

  // Activate milestone visual effect
  activateMilestoneEffect(threshold) {
    document.body.classList.add('milestone-flash');
    setTimeout(() => {
      document.body.classList.remove('milestone-flash');
    }, 2000);
  }

  // Capture epic moment for cinematic replay
  captureEpicMoment() {
    const moment = {
      id: `moment_${Date.now()}`,
      pulse: this.currentPulse,
      timestamp: Date.now(),
      expansionLevel: this.expansionProgress,
      emberCount: this.emberFragments.length,
      description: `Pulse ${this.currentPulse} - ${Math.floor(this.expansionProgress)}% Expansion`
    };
    
    this.cinematicReplays.push(moment);
    
    // Keep only last 20 moments
    if (this.cinematicReplays.length > 20) {
      this.cinematicReplays.shift();
    }
    
    console.log("🎬 Epic Moment Captured:", moment.description);
  }

  // Update leaderboard
  updateLeaderboard(address, action) {
    let entry = this.leaderboard.find(e => e.address === address);
    
    if (!entry) {
      entry = {
        address: address,
        score: 0,
        actions: {},
        lastActive: Date.now()
      };
      this.leaderboard.push(entry);
    }
    
    // Update score based on action
    const actionScores = {
      pulse_trigger: 10,
      ember_discover: 15,
      milestone_achieve: 25,
      combination_create: 20
    };
    
    entry.score += actionScores[action] || 5;
    entry.actions[action] = (entry.actions[action] || 0) + 1;
    entry.lastActive = Date.now();
    
    // Sort leaderboard
    this.leaderboard.sort((a, b) => b.score - a.score);
    
    // Update leaderboard UI
    this.updateLeaderboardUI();
  }

  // Update leaderboard UI
  updateLeaderboardUI() {
    const leaderboardElement = document.getElementById('ignition-leaderboard');
    if (!leaderboardElement) return;
    
    const topEntries = this.leaderboard.slice(0, 10);
    
    leaderboardElement.innerHTML = `
      <h3>🔥 Infinite Ignition Leaderboard</h3>
      ${topEntries.map((entry, index) => `
        <div class="leaderboard-entry ${index === 0 ? 'leader-gold' : ''}">
          <span class="rank">#${index + 1}</span>
          <span class="address">${entry.address.slice(0, 8)}...${entry.address.slice(-4)}</span>
          <span class="score">${entry.score} ⚡</span>
        </div>
      `).join('')}
    `;
  }

  // Broadcast to network (simulated)
  broadcastToNetwork() {
    // Simulate network broadcast
    console.log("📡 Broadcasting pulse to galaxy-wide network...");
    
    // In a real implementation, this would:
    // - Send WebSocket messages to other connected users
    // - Update on-chain state if applicable
    // - Trigger social media sharing
    // - Update NFT metadata
  }

  // Initialize UI components
  initializeUI() {
    // This method will be called after UI elements are created
    this.updateMilestoneTracker();
    this.updateLeaderboardUI();
    this.updateUIStatus("⚡ Overdrive Standby - Ready to Ignite");
  }

  // Update UI status
  updateUIStatus(status) {
    const statusElement = document.getElementById('overdrive-status');
    if (statusElement) {
      statusElement.textContent = status;
    }
  }

  // Setup event listeners
  setupEventListeners() {
    // Listen for wallet events
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          this.updateLeaderboard(accounts[0], 'wallet_connect');
        }
      });
    }
  }

  // Trigger full expansion event
  triggerFullExpansionEvent() {
    console.log("🌟 FULL EXPANSION ACHIEVED - OVERDRIVE MAXIMUM!");
    
    // Special full expansion effects
    document.body.classList.add('full-expansion');
    
    this.updateUIStatus("🌟 MAXIMUM OVERDRIVE - GALAXY SYNCHRONIZED!");
    
    // Reset for next cycle
    setTimeout(() => {
      this.expansionProgress = 0;
      this.currentPulse = 0;
      document.body.classList.remove('full-expansion');
      this.updateUIStatus("🔄 New Overdrive Cycle Initiated");
    }, 10000);
  }

  // Export cinematic replay
  exportCinematicReplay() {
    const replay = {
      metadata: {
        title: `ChaosKey333 Overdrive Replay - Pulse ${this.currentPulse}`,
        description: `Epic moments from Overdrive expansion at ${Math.floor(this.expansionProgress)}%`,
        timestamp: Date.now(),
        pulseCount: this.currentPulse,
        emberCount: this.emberFragments.length
      },
      moments: this.cinematicReplays,
      emberFragments: this.emberFragments.slice(-10),
      leaderboard: this.leaderboard.slice(0, 5)
    };
    
    // Create downloadable JSON
    const blob = new Blob([JSON.stringify(replay, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `chaoskey333-overdrive-replay-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    
    console.log("🎬 Cinematic Replay Exported");
  }
}

// Initialize global Overdrive system
window.OverdriveSystem = OverdriveSystem;
window.overdrive = new OverdriveSystem();

// Auto-start if conditions are met
document.addEventListener('DOMContentLoaded', () => {
  console.log("🚀 Overdrive System Loaded and Ready");
});