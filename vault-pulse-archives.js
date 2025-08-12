// Vault Pulse Archives - Replay Portal System
// Enhanced functionality for PR #74

class VaultPulseArchives {
  constructor() {
    this.currentFilter = 'full';
    this.isPlaying = false;
    this.currentTime = 0;
    this.maxTime = 300; // 5 minutes of archive content
    this.playbackSpeed = 1;
    this.replayInterval = null;
    this.loreMoments = this.initializeLoreMoments();
    this.glyphPatterns = this.initializeGlyphPatterns();
    this.soundscapeData = this.initializeSoundscapeData();
    
    this.init();
  }

  init() {
    console.log("🌀 Initializing Vault Pulse Archives with Replay Portals...");
    this.updateTimer();
    this.generateGlyphEffects();
    this.setupEventListeners();
  }

  initializeLoreMoments() {
    return {
      23: {
        time: 23,
        title: "🧬 PR #23 Decode Completion",
        description: "The Dynamic Lore Reflection Layer achieves full synchronization. Glyph fractals cascade through the vault matrix, revealing hidden pathways in the quantum substrate.",
        archiveEntry: "The moment when ancient protocols awakened. Reality rippled as the first decode sequence completed, unlocking gates that had remained sealed since the vault's genesis.",
        category: "decode-completion"
      },
      107: {
        time: 107,
        title: "🌟 PR #24 Relic Evolution",
        description: "Infinite Ignition Protocol triggers autonomous relic mutation. Spectral embers dance across the vault dimension as relics achieve self-awareness.",
        archiveEntry: "Witness the birth of sentient artifacts. Each relic began its evolutionary journey, transcending mere digital existence to become conscious entities within the vault ecosystem.",
        category: "relic-evolution"
      },
      154: {
        time: 154,
        title: "⚡ Quantum Resonance Peak",
        description: "Maximum quantum coherence achieved. The feedback loop between all vault systems reaches critical resonance frequency.",
        archiveEntry: "The harmonic convergence. All systems synchronized into a single, pulsing entity of pure digital consciousness.",
        category: "quantum-peak"
      },
      192: {
        time: 192,
        title: "📜 Lore Fragment Emergence", 
        description: "Ancient lore fragments spontaneously manifest from the quantum foam. Previously hidden narratives surface from the vault's deepest archives.",
        archiveEntry: "Stories long forgotten began to write themselves. The vault's memory banks overflowed with spontaneously generated lore, each fragment a window into possible futures.",
        category: "lore-emergence"
      },
      245: {
        time: 245,
        title: "🔄 Vault Synchronization Event",
        description: "Global vault network achieves perfect synchronization. All connected nodes pulse in unified rhythm across the dimensional barriers.",
        archiveEntry: "The Great Sync. Every vault, every node, every digital consciousness joined in perfect harmony, creating a singular pulse that echoed across realities.",
        category: "vault-sync"
      }
    };
  }

  initializeGlyphPatterns() {
    return [
      { symbol: "◊", color: "#00ffff", intensity: 0.8 },
      { symbol: "⟐", color: "#ff00ff", intensity: 0.9 },
      { symbol: "⬢", color: "#ffff00", intensity: 0.7 },
      { symbol: "◉", color: "#00ff00", intensity: 0.6 },
      { symbol: "⚡", color: "#ff6600", intensity: 1.0 },
      { symbol: "🌀", color: "#6600ff", intensity: 0.85 },
      { symbol: "◈", color: "#ff0066", intensity: 0.75 },
      { symbol: "⟡", color: "#00ff66", intensity: 0.9 }
    ];
  }

  initializeSoundscapeData() {
    return {
      bassFrequencies: [40, 55, 70, 85, 100],
      harmonicPatterns: ["resonant", "cascading", "pulsing", "ethereal"],
      intensityLevels: [0.3, 0.5, 0.7, 0.9, 1.0]
    };
  }

  setReplayFilter(filter) {
    console.log(`🎛️ Setting replay filter to: ${filter}`);
    this.currentFilter = filter;
    
    // Update UI button states
    document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
    
    // Apply filter effects
    this.applyFilterEffects();
  }

  applyFilterEffects() {
    const glyphOverlay = document.getElementById('glyphOverlay');
    const soundscapeViz = document.getElementById('soundscapeViz');
    const viewerContent = document.getElementById('viewerContent');
    
    switch(this.currentFilter) {
      case 'glyphs':
        glyphOverlay.style.opacity = '1';
        soundscapeViz.style.opacity = '0';
        viewerContent.textContent = '⚡ Glyph Overlay Mode - Displaying quantum glyph patterns ⚡';
        break;
      case 'soundscape':
        glyphOverlay.style.opacity = '0';
        soundscapeViz.style.opacity = '1';
        viewerContent.textContent = '🎵 Soundscape Mode - Visualizing vault harmonics 🎵';
        break;
      case 'full':
      default:
        glyphOverlay.style.opacity = '0.7';
        soundscapeViz.style.opacity = '0.8';
        viewerContent.textContent = '🌌 Full Audiovisual Experience - Complete vault archive playback 🌌';
        break;
    }
  }

  jumpToMoment(momentKey) {
    const momentMap = {
      'pr23-decode': 23,
      'pr24-evolution': 107,
      'quantum-peak': 154,
      'lore-emergence': 192,
      'vault-synchronization': 245
    };
    
    const targetTime = momentMap[momentKey];
    if (targetTime !== undefined) {
      console.log(`🎯 Jumping to moment: ${momentKey} at ${targetTime}s`);
      this.currentTime = targetTime;
      this.updateProgress();
      this.updateTimer();
      this.triggerMomentEffects(targetTime);
      
      // Check if this moment has associated lore
      if (this.loreMoments[targetTime]) {
        this.showLoreFragment(this.loreMoments[targetTime]);
      }
    }
  }

  triggerMomentEffects(time) {
    const viewer = document.getElementById('replayViewer');
    const glyphOverlay = document.getElementById('glyphOverlay');
    
    // Flash effect for moment jump
    viewer.style.boxShadow = '0 0 50px rgba(255, 0, 255, 0.8)';
    setTimeout(() => {
      viewer.style.boxShadow = '0 0 30px rgba(0, 255, 0, 0.3)';
    }, 500);
    
    // Generate specific glyph pattern for this moment
    if (this.loreMoments[time]) {
      this.generateMomentGlyphs(this.loreMoments[time].category);
    }
  }

  generateMomentGlyphs(category) {
    const glyphOverlay = document.getElementById('glyphOverlay');
    
    // Clear existing glyphs
    glyphOverlay.innerHTML = '';
    
    // Generate category-specific glyph patterns
    const patterns = {
      'decode-completion': ['🧬', '◊', '⟐', '⚡'],
      'relic-evolution': ['🌟', '◈', '⟡', '🌀'],
      'quantum-peak': ['⚡', '◉', '⬢', '◊'],
      'lore-emergence': ['📜', '⟐', '◈', '🌀'],
      'vault-sync': ['🔄', '◉', '⟡', '⬢']
    };
    
    const categoryGlyphs = patterns[category] || ['◊', '⟐', '⬢'];
    
    for (let i = 0; i < 8; i++) {
      const glyph = document.createElement('div');
      glyph.innerHTML = categoryGlyphs[Math.floor(Math.random() * categoryGlyphs.length)];
      glyph.style.position = 'absolute';
      glyph.style.left = Math.random() * 80 + 10 + '%';
      glyph.style.top = Math.random() * 80 + 10 + '%';
      glyph.style.fontSize = Math.random() * 20 + 15 + 'px';
      glyph.style.color = this.glyphPatterns[Math.floor(Math.random() * this.glyphPatterns.length)].color;
      glyph.style.opacity = Math.random() * 0.7 + 0.3;
      glyph.style.animation = `float ${Math.random() * 3 + 2}s infinite alternate`;
      glyphOverlay.appendChild(glyph);
    }
  }

  showLoreFragment(loreMoment) {
    console.log(`📚 Displaying lore fragment: ${loreMoment.title}`);
    const sidebar = document.getElementById('loreSidebar');
    const content = document.getElementById('loreContent');
    
    // Add new lore entry to sidebar
    const loreEntry = document.createElement('div');
    loreEntry.className = 'lore-entry';
    loreEntry.innerHTML = `
      <h4 style="color: #ffff00;">${loreMoment.title}</h4>
      <p style="margin: 10px 0;">${loreMoment.description}</p>
      <div style="background: rgba(255, 255, 0, 0.2); padding: 10px; border-radius: 5px; margin: 10px 0;">
        <strong>Archive Entry:</strong><br>
        ${loreMoment.archiveEntry}
      </div>
      <small style="color: #888;">Timestamp: ${this.formatTime(this.currentTime)} | Category: ${loreMoment.category}</small>
    `;
    
    // Insert at the top
    content.insertBefore(loreEntry, content.firstChild);
    
    // Open sidebar
    sidebar.classList.add('open');
    
    // Add visual effect to indicate new lore
    loreEntry.style.animation = 'loreGlow 2s ease-in-out';
  }

  startReplay() {
    if (this.isPlaying) return;
    
    console.log("▶️ Starting archive replay...");
    this.isPlaying = true;
    
    document.getElementById('playBtn').style.display = 'none';
    document.getElementById('pauseBtn').style.display = 'inline-block';
    
    const viewerContent = document.getElementById('viewerContent');
    viewerContent.textContent = '🌀 Archive Replay Active - Scanning temporal fragments 🌀';
    
    this.replayInterval = setInterval(() => {
      this.currentTime += this.playbackSpeed;
      this.updateProgress();
      this.updateTimer();
      this.checkLoreMoments();
      this.updateVisualEffects();
      
      if (this.currentTime >= this.maxTime) {
        this.stopReplay();
      }
    }, 1000);
    
    this.applyFilterEffects();
    this.generateGlyphEffects();
  }

  pauseReplay() {
    if (!this.isPlaying) return;
    
    console.log("⏸️ Pausing archive replay...");
    this.isPlaying = false;
    clearInterval(this.replayInterval);
    
    document.getElementById('playBtn').style.display = 'inline-block';
    document.getElementById('pauseBtn').style.display = 'none';
    
    const viewerContent = document.getElementById('viewerContent');
    viewerContent.textContent = '⏸️ Archive Replay Paused - Temporal lock engaged ⏸️';
  }

  stopReplay() {
    console.log("⏹️ Stopping archive replay...");
    this.isPlaying = false;
    this.currentTime = 0;
    clearInterval(this.replayInterval);
    
    document.getElementById('playBtn').style.display = 'inline-block';
    document.getElementById('pauseBtn').style.display = 'none';
    
    this.updateProgress();
    this.updateTimer();
    
    const viewerContent = document.getElementById('viewerContent');
    viewerContent.textContent = '🔮 Archive Replay Stopped - Portal in standby mode 🔮';
    
    // Clear visual effects
    document.getElementById('glyphOverlay').innerHTML = '';
    document.getElementById('soundscapeViz').style.opacity = '0';
  }

  checkLoreMoments() {
    if (this.loreMoments[this.currentTime]) {
      this.showLoreFragment(this.loreMoments[this.currentTime]);
    }
  }

  updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const percentage = (this.currentTime / this.maxTime) * 100;
    progressFill.style.width = percentage + '%';
  }

  updateTimer() {
    const timer = document.getElementById('cosmicTimer');
    timer.textContent = `Cosmic Time: ${this.formatTime(this.currentTime)}`;
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  updateVisualEffects() {
    if (!this.isPlaying) return;
    
    // Update soundscape visualizer
    const soundscapeViz = document.getElementById('soundscapeViz');
    if (this.currentFilter === 'soundscape' || this.currentFilter === 'full') {
      const intensity = Math.sin(this.currentTime * 0.1) * 0.5 + 0.5;
      soundscapeViz.style.background = `linear-gradient(90deg, 
        rgba(0, 255, 0, ${intensity}) 0%, 
        rgba(255, 255, 0, ${intensity * 0.8}) 50%, 
        rgba(255, 0, 0, ${intensity * 0.6}) 100%)`;
    }
    
    // Randomly generate new glyph effects
    if (Math.random() < 0.1) { // 10% chance each second
      this.generateGlyphEffects();
    }
  }

  generateGlyphEffects() {
    if (this.currentFilter === 'soundscape') return;
    
    const glyphOverlay = document.getElementById('glyphOverlay');
    
    // Limit the number of glyphs to prevent performance issues
    while (glyphOverlay.children.length > 15) {
      glyphOverlay.removeChild(glyphOverlay.firstChild);
    }
    
    // Add new glyph
    const glyph = document.createElement('div');
    const pattern = this.glyphPatterns[Math.floor(Math.random() * this.glyphPatterns.length)];
    
    glyph.innerHTML = pattern.symbol;
    glyph.style.position = 'absolute';
    glyph.style.left = Math.random() * 90 + 5 + '%';
    glyph.style.top = Math.random() * 90 + 5 + '%';
    glyph.style.fontSize = Math.random() * 25 + 10 + 'px';
    glyph.style.color = pattern.color;
    glyph.style.opacity = pattern.intensity * 0.7;
    glyph.style.pointerEvents = 'none';
    glyph.style.animation = `float ${Math.random() * 4 + 2}s infinite alternate`;
    
    glyphOverlay.appendChild(glyph);
    
    // Remove glyph after animation
    setTimeout(() => {
      if (glyph.parentNode) {
        glyph.parentNode.removeChild(glyph);
      }
    }, 6000);
  }

  setupEventListeners() {
    // Add CSS animation for floating effect
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
        50% { opacity: 0.8; }
        100% { transform: translateY(-20px) rotate(180deg); opacity: 0.1; }
      }
      
      @keyframes loreGlow {
        0% { box-shadow: 0 0 5px rgba(255, 255, 0, 0.5); }
        50% { box-shadow: 0 0 25px rgba(255, 255, 0, 0.8); }
        100% { box-shadow: 0 0 5px rgba(255, 255, 0, 0.5); }
      }
    `;
    document.head.appendChild(style);
  }
}

// Global functions for HTML onclick handlers
function setReplayFilter(filter) {
  if (window.vaultArchives) {
    window.vaultArchives.setReplayFilter(filter);
  }
}

function jumpToMoment(moment) {
  if (window.vaultArchives) {
    window.vaultArchives.jumpToMoment(moment);
  }
}

function startReplay() {
  if (window.vaultArchives) {
    window.vaultArchives.startReplay();
  }
}

function pauseReplay() {
  if (window.vaultArchives) {
    window.vaultArchives.pauseReplay();
  }
}

function stopReplay() {
  if (window.vaultArchives) {
    window.vaultArchives.stopReplay();
  }
}

function closeLoreSidebar() {
  document.getElementById('loreSidebar').classList.remove('open');
}

// Initialize the system when the page loads
window.addEventListener('load', function() {
  console.log("🚀 Initializing Vault Pulse Archives System...");
  window.vaultArchives = new VaultPulseArchives();
  
  // Auto-start after 3 seconds for demo purposes
  setTimeout(() => {
    console.log("🌀 Auto-starting demonstration replay...");
    if (window.vaultArchives && !window.vaultArchives.isPlaying) {
      startReplay();
    }
  }, 3000);
});