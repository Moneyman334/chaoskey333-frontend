/**
 * Omni-Singularity Countdown Board JavaScript
 * Permanent Edition for ChaosKey333 Vault
 */

class OmniSingularityCountdown {
  constructor() {
    this.events = new Map();
    this.timers = new Map();
    this.audioEnabled = true;
    this.currentTimezone = 'auto';
    this.glyphSequences = {
      primary: ['⚡', '🔥', '🌀', '💫', '⚛', '🗲', '🔮', '✨'],
      secondary: ['🌌', '📡', '🔄', '💎', '⏳', '🎯']
    };
    this.whisperMessages = {
      primary: [
        "ChaosKey whispers: \"The sequence begins with shadow...\"",
        "ChaosKey whispers: \"Energy patterns shifting...\"",
        "ChaosKey whispers: \"The vault remembers all...\"",
        "ChaosKey whispers: \"Temporal locks disengaging...\"",
        "ChaosKey whispers: \"Reality bends to our will...\""
      ],
      secondary: [
        "ChaosKey whispers: \"Time itself bends to the archive...\"",
        "ChaosKey whispers: \"Past and future converge...\"",
        "ChaosKey whispers: \"The replay holds infinite wisdom...\"",
        "ChaosKey whispers: \"Memories crystallize into truth...\"",
        "ChaosKey whispers: \"Archive protocols activating...\""
      ]
    };
    this.replayArchive = [];
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.initializeEvents();
    this.startCountdowns();
    this.initTimezoneSync();
    this.initAudioSystem();
    this.loadReplayArchive();
    this.initGlyphAnimations();
    this.hideTerminalOverlay();
  }

  hideTerminalOverlay() {
    setTimeout(() => {
      const overlay = document.getElementById('terminalOverlay');
      if (overlay) {
        overlay.style.display = 'none';
      }
    }, 4000);
  }

  setupEventListeners() {
    // Audio controls
    document.getElementById('audioToggle')?.addEventListener('click', () => this.toggleAudio());
    document.getElementById('volumeSlider')?.addEventListener('input', (e) => this.setVolume(e.target.value));
    
    // Board controls
    document.getElementById('fullscreenToggle')?.addEventListener('click', () => this.toggleFullscreen());
    document.getElementById('dataExport')?.addEventListener('click', () => this.exportData());
    
    // Timezone selector
    document.getElementById('timezoneSelect')?.addEventListener('change', (e) => this.changeTimezone(e.target.value));
  }

  initializeEvents() {
    // Primary Event: PR #23 → PR #24 Chain Ignition
    const primaryEvent = {
      id: 'primary',
      title: 'PR #23 → PR #24 Chain Ignition',
      description: 'Lore Glyph Execution Sequence Activation',
      targetDate: new Date('2025-01-15T18:33:00Z').getTime(),
      type: 'chain-ignition',
      glyphs: this.glyphSequences.primary,
      soundscape: 'cosmic-deep',
      whispers: this.whisperMessages.primary
    };

    // Secondary Event: Cosmic Replay Terminal v2.0
    const secondaryEvent = {
      id: 'secondary',
      title: 'Cosmic Replay Terminal v2.0',
      description: 'Enhanced Archive Experience Drop',
      targetDate: new Date('2025-01-22T15:00:00Z').getTime(),
      type: 'archive-drop',
      glyphs: this.glyphSequences.secondary,
      soundscape: 'archive-hum',
      whispers: this.whisperMessages.secondary
    };

    this.events.set('primary', primaryEvent);
    this.events.set('secondary', secondaryEvent);
  }

  startCountdowns() {
    // Clear existing timers
    this.timers.forEach(timer => clearInterval(timer));
    this.timers.clear();

    // Start timers for each event
    this.events.forEach((event, id) => {
      const timer = setInterval(() => this.updateCountdown(id), 1000);
      this.timers.set(id, timer);
      this.updateCountdown(id); // Initial update
    });
  }

  updateCountdown(eventId) {
    const event = this.events.get(eventId);
    if (!event) return;

    const now = new Date().getTime();
    const distance = event.targetDate - now;

    if (distance <= 0) {
      this.triggerIgnition(eventId);
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Update display
    document.getElementById(`${eventId}-days`).textContent = String(days).padStart(2, '0');
    document.getElementById(`${eventId}-hours`).textContent = String(hours).padStart(2, '0');
    document.getElementById(`${eventId}-minutes`).textContent = String(minutes).padStart(2, '0');
    document.getElementById(`${eventId}-seconds`).textContent = String(seconds).padStart(2, '0');

    // Update glyph animations based on proximity
    this.updateGlyphAnimation(eventId, distance);
    
    // Update whisper teasers
    this.updateWhispers(eventId, distance);
    
    // Update pulse intensity
    this.updatePulseIndicator(eventId, distance);
  }

  updateGlyphAnimation(eventId, distance) {
    const glyphRing = document.querySelector(`#${eventId}Event .glyph-ring`);
    if (!glyphRing) return;

    const glyphs = glyphRing.querySelectorAll('.glyph');
    const totalGlyphs = glyphs.length;
    
    // Calculate which glyph should be active based on seconds
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    const activeIndex = Math.floor((60 - seconds) / (60 / totalGlyphs)) % totalGlyphs;
    
    glyphs.forEach((glyph, index) => {
      glyph.classList.toggle('active', index === activeIndex);
    });

    // Increase rotation speed as we get closer
    const hoursLeft = Math.floor(distance / (1000 * 60 * 60));
    const speedMultiplier = Math.max(1, 25 - hoursLeft);
    glyphRing.style.animationDuration = `${8 / speedMultiplier}s`;
  }

  updateWhispers(eventId, distance) {
    const whispersContainer = document.getElementById(`${eventId}Whispers`);
    if (!whispersContainer) return;

    const event = this.events.get(eventId);
    const whispers = event.whispers;
    
    // Change whisper message every 30 seconds
    const whisperIndex = Math.floor(Date.now() / 30000) % whispers.length;
    const whisperElement = whispersContainer.querySelector('.whisper');
    
    if (whisperElement && whisperElement.textContent !== whispers[whisperIndex]) {
      whisperElement.style.opacity = '0';
      setTimeout(() => {
        whisperElement.textContent = whispers[whisperIndex];
        whisperElement.style.opacity = '1';
      }, 500);
    }
  }

  updatePulseIndicator(eventId, distance) {
    const pulseIndicator = document.getElementById(`${eventId}Pulse`);
    if (!pulseIndicator) return;

    const daysLeft = Math.floor(distance / (1000 * 60 * 60 * 24));
    
    // Pulse faster as we get closer
    let pulseSpeed = 2; // Default 2 seconds
    if (daysLeft < 1) pulseSpeed = 0.5; // 0.5 seconds when less than 1 day
    else if (daysLeft < 7) pulseSpeed = 1; // 1 second when less than 1 week
    else if (daysLeft < 30) pulseSpeed = 1.5; // 1.5 seconds when less than 1 month
    
    pulseIndicator.style.animationDuration = `${pulseSpeed}s`;
    
    // Change color based on urgency
    if (daysLeft < 1) {
      pulseIndicator.style.background = '#ff0000';
    } else if (daysLeft < 7) {
      pulseIndicator.style.background = '#ff6600';
    } else {
      pulseIndicator.style.background = '#ffaa00';
    }
  }

  triggerIgnition(eventId) {
    const event = this.events.get(eventId);
    if (!event) return;

    // Clear the timer
    clearInterval(this.timers.get(eventId));
    this.timers.delete(eventId);

    // Show live ignite overlay
    this.showLiveIgnition(event);
    
    // Play ignition audio
    this.playIgnitionAudio();
    
    // Archive the event
    this.archiveEvent(event);
    
    // Update countdown display to show completion
    document.getElementById(`${eventId}-days`).textContent = '00';
    document.getElementById(`${eventId}-hours`).textContent = '00';
    document.getElementById(`${eventId}-minutes`).textContent = '00';
    document.getElementById(`${eventId}-seconds`).textContent = '00';
  }

  showLiveIgnition(event) {
    const overlay = document.getElementById('liveIgniteOverlay');
    const message = document.getElementById('ignitionMessage');
    
    if (overlay && message) {
      message.textContent = `${event.title} - SEQUENCE ACTIVATED!`;
      overlay.classList.remove('hidden');
    }
  }

  dismissIgnition() {
    const overlay = document.getElementById('liveIgniteOverlay');
    if (overlay) {
      overlay.classList.add('hidden');
    }
  }

  initTimezoneSync() {
    const timezoneSelect = document.getElementById('timezoneSelect');
    const currentTimeDisplay = document.getElementById('currentTime');
    
    // Detect user's timezone
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    if (timezoneSelect) {
      // Add user's timezone if not in list
      const userOption = Array.from(timezoneSelect.options).find(option => option.value === userTimezone);
      if (!userOption && userTimezone !== 'auto') {
        const option = document.createElement('option');
        option.value = userTimezone;
        option.textContent = `${userTimezone} (Detected)`;
        timezoneSelect.insertBefore(option, timezoneSelect.children[1]);
      }
    }
    
    // Update current time display
    setInterval(() => {
      if (currentTimeDisplay) {
        const now = new Date();
        const timezone = this.currentTimezone === 'auto' ? userTimezone : this.currentTimezone;
        
        const timeString = now.toLocaleString('en-US', {
          timeZone: timezone,
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
        
        currentTimeDisplay.textContent = `${timeString} (${timezone})`;
      }
    }, 1000);
  }

  changeTimezone(timezone) {
    this.currentTimezone = timezone;
    // Restart countdowns to reflect timezone change if needed
    // (Note: Our countdowns use UTC timestamps, so they're timezone-independent)
    console.log(`Timezone changed to: ${timezone}`);
  }

  initAudioSystem() {
    const ambientAudio = document.getElementById('ambientSoundscape');
    const volumeSlider = document.getElementById('volumeSlider');
    
    if (ambientAudio && this.audioEnabled) {
      ambientAudio.volume = 0.5;
      ambientAudio.play().catch(e => console.log('Audio autoplay prevented'));
    }
    
    if (volumeSlider) {
      volumeSlider.addEventListener('input', (e) => {
        const volume = e.target.value / 100;
        if (ambientAudio) ambientAudio.volume = volume;
      });
    }
  }

  toggleAudio() {
    this.audioEnabled = !this.audioEnabled;
    const ambientAudio = document.getElementById('ambientSoundscape');
    const audioToggle = document.getElementById('audioToggle');
    
    if (ambientAudio) {
      if (this.audioEnabled) {
        ambientAudio.play().catch(e => console.log('Audio play failed'));
      } else {
        ambientAudio.pause();
      }
    }
    
    if (audioToggle) {
      const icon = audioToggle.querySelector('.btn-icon');
      if (icon) {
        icon.textContent = this.audioEnabled ? '🔊' : '🔇';
      }
    }
  }

  setVolume(volume) {
    const ambientAudio = document.getElementById('ambientSoundscape');
    if (ambientAudio) {
      ambientAudio.volume = volume / 100;
    }
  }

  playIgnitionAudio() {
    if (!this.audioEnabled) return;
    
    const ignitionAudio = document.getElementById('ignitionAudio');
    if (ignitionAudio) {
      ignitionAudio.play().catch(e => console.log('Ignition audio failed'));
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(e => {
        console.log('Fullscreen request failed:', e);
      });
    } else {
      document.exitFullscreen();
    }
  }

  exportData() {
    const data = {
      events: Array.from(this.events.entries()),
      replayArchive: this.replayArchive,
      settings: {
        audioEnabled: this.audioEnabled,
        timezone: this.currentTimezone
      },
      exported: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omni-singularity-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  loadReplayArchive() {
    // Initialize with genesis event
    this.replayArchive = [
      {
        id: 'genesis',
        title: 'Origin Flare Genesis',
        date: '2024-12-15',
        description: 'First vault ignition sequence',
        type: 'genesis'
      }
    ];
    
    this.updateReplayGrid();
  }

  archiveEvent(event) {
    const archivedEvent = {
      id: event.id,
      title: event.title,
      date: new Date().toISOString().split('T')[0],
      description: event.description,
      type: event.type,
      completedAt: new Date().toISOString()
    };
    
    this.replayArchive.push(archivedEvent);
    this.updateReplayGrid();
  }

  updateReplayGrid() {
    const replayGrid = document.getElementById('replayGrid');
    if (!replayGrid) return;
    
    // Clear existing items except placeholder
    const items = replayGrid.querySelectorAll('.replay-item:not(.placeholder)');
    items.forEach(item => item.remove());
    
    // Add archived events
    this.replayArchive.forEach(event => {
      const item = this.createReplayItem(event);
      replayGrid.insertBefore(item, replayGrid.querySelector('.placeholder'));
    });
  }

  createReplayItem(event) {
    const item = document.createElement('div');
    item.className = 'replay-item';
    item.innerHTML = `
      <div class="replay-header">
        <h4>${event.title}</h4>
        <span class="replay-date">${event.date}</span>
      </div>
      <div class="replay-preview">${event.description}</div>
      <button class="replay-btn" onclick="omniCountdown.playReplay('${event.id}')">
        <span class="btn-icon">▶</span>
        REPLAY
      </button>
    `;
    return item;
  }

  playReplay(eventId) {
    const event = this.replayArchive.find(e => e.id === eventId);
    if (!event) return;
    
    // Show replay visualization
    this.showReplayVisualization(event);
    
    // Play special audio for replay
    if (this.audioEnabled) {
      this.playReplayAudio();
    }
  }

  showReplayVisualization(event) {
    // Create and show replay overlay
    const overlay = document.createElement('div');
    overlay.className = 'replay-overlay';
    overlay.innerHTML = `
      <div class="replay-content">
        <h2>🌌 COSMIC REPLAY 🌌</h2>
        <h3>${event.title}</h3>
        <p>Date: ${event.date}</p>
        <p>${event.description}</p>
        <div class="replay-animation">
          <div class="cosmic-swirl">🌀</div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()">CLOSE REPLAY</button>
      </div>
    `;
    
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      z-index: 3000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    overlay.querySelector('.replay-content').style.cssText = `
      background: linear-gradient(45deg, rgba(0, 100, 200, 0.3), rgba(100, 0, 200, 0.3));
      border: 2px solid #00aaff;
      border-radius: 20px;
      padding: 40px;
      text-align: center;
      color: #00ffff;
    `;
    
    document.body.appendChild(overlay);
    
    // Remove overlay after 5 seconds if not manually closed
    setTimeout(() => {
      if (overlay.parentElement) {
        overlay.remove();
      }
    }, 5000);
  }

  playReplayAudio() {
    // Play a different audio cue for replays
    console.log('Playing replay audio...');
  }

  initGlyphAnimations() {
    // Add additional glyph animation behaviors
    const glyphRings = document.querySelectorAll('.glyph-ring');
    
    glyphRings.forEach(ring => {
      ring.addEventListener('mouseenter', () => {
        ring.style.animationPlayState = 'paused';
      });
      
      ring.addEventListener('mouseleave', () => {
        ring.style.animationPlayState = 'running';
      });
    });
  }

  // Method to add new events (for future use)
  addEvent(eventData) {
    const event = {
      id: eventData.id || `event-${Date.now()}`,
      title: eventData.title || 'New Event',
      description: eventData.description || '',
      targetDate: new Date(eventData.targetDate).getTime(),
      type: eventData.type || 'custom',
      glyphs: eventData.glyphs || this.glyphSequences.primary,
      soundscape: eventData.soundscape || 'default',
      whispers: eventData.whispers || ['ChaosKey whispers: "Something approaches..."']
    };
    
    this.events.set(event.id, event);
    
    // Restart countdown if this is a new active event
    if (event.targetDate > Date.now()) {
      const timer = setInterval(() => this.updateCountdown(event.id), 1000);
      this.timers.set(event.id, timer);
    }
    
    return event.id;
  }

  // Method to update existing events
  updateEvent(eventId, updates) {
    const event = this.events.get(eventId);
    if (!event) return false;
    
    Object.assign(event, updates);
    this.events.set(eventId, event);
    
    return true;
  }
}

// Global functions for HTML onclick handlers
function dismissIgnition() {
  if (window.omniCountdown) {
    window.omniCountdown.dismissIgnition();
  }
}

function playReplay(eventId) {
  if (window.omniCountdown) {
    window.omniCountdown.playReplay(eventId);
  }
}

// Initialize the countdown board when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.omniCountdown = new OmniSingularityCountdown();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OmniSingularityCountdown;
}