/**
 * Cosmic Replay Terminal v2.0 - Ascension Edition
 * Advanced replay system with time-dilation, multi-perspective viewing,
 * event tagging, AI summaries, and persistent state management
 */

class CosmicReplayTerminal {
  constructor() {
    this.isPlaying = false;
    this.currentSpeed = 1.0;
    this.currentTime = 0;
    this.duration = 300; // 5 minutes default
    this.tags = [];
    this.snapshots = [];
    this.perspectives = {
      'central': { name: 'Central Nexus', effect: 'default' },
      'sector-alpha': { name: 'Sector Alpha', effect: 'rotation-fast' },
      'sector-beta': { name: 'Sector Beta', effect: 'glow-intense' },
      'sector-gamma': { name: 'Sector Gamma', effect: 'particle-storm' },
      'omni-singularity': { name: 'Omni-Singularity Core', effect: 'cosmic-fusion' }
    };
    this.glyphSequences = [
      '∴ ◊ ∞ ◊ ∴',
      '⧬ ⟐ ⧭ ⟐ ⧬',
      '◈ ⬟ ◉ ⬟ ◈',
      '⬢ ⬡ ⬢ ⬡ ⬢',
      '◊ ∞ ◊ ∞ ◊'
    ];
    this.currentGlyphIndex = 0;
    
    this.audioContext = null;
    this.pitchShiftNode = null;
    this.audioSource = null;
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupAudioContext();
    this.loadUserProfile();
    this.startReplayLoop();
    this.generateInitialSummary();
  }

  setupEventListeners() {
    // Playback controls
    document.getElementById('playPauseBtn').addEventListener('click', () => this.togglePlayPause());
    document.getElementById('stopBtn').addEventListener('click', () => this.stop());
    document.getElementById('rewindBtn').addEventListener('click', () => this.rewind());
    document.getElementById('fastForwardBtn').addEventListener('click', () => this.fastForward());

    // Speed controls
    document.getElementById('speedSlider').addEventListener('input', (e) => this.setSpeed(parseFloat(e.target.value)));
    
    document.querySelectorAll('.speed-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const speed = parseFloat(e.target.dataset.speed);
        this.setSpeed(speed);
        this.updateSpeedButtons(speed);
      });
    });

    // Perspective selector
    document.getElementById('perspectiveSelect').addEventListener('change', (e) => this.changePerspective(e.target.value));

    // Event tagging
    document.getElementById('addTagBtn').addEventListener('click', () => this.addTag());
    document.getElementById('tagName').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addTag();
    });

    // Snapshot controls
    document.getElementById('captureSnapshotBtn').addEventListener('click', () => this.captureSnapshot());
    document.getElementById('compareSnapshotsBtn').addEventListener('click', () => this.compareSnapshots());

    // Timeline controls
    document.getElementById('zoomInBtn').addEventListener('click', () => this.zoomTimeline(1.2));
    document.getElementById('zoomOutBtn').addEventListener('click', () => this.zoomTimeline(0.8));
    document.getElementById('timeline').addEventListener('click', (e) => this.seekToTime(e));

    // Summary panel toggle
    document.getElementById('toggleSummaryBtn').addEventListener('click', () => this.toggleSummaryPanel());

    // Pitch correction toggle
    document.getElementById('pitchCorrection').addEventListener('change', (e) => this.togglePitchCorrection(e.target.checked));
  }

  setupAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audio = document.getElementById('replayAudio');
      
      if (audio) {
        this.audioSource = this.audioContext.createMediaElementSource(audio);
        
        // Create pitch shift node for time-dilation
        this.pitchShiftNode = this.audioContext.createScriptProcessor(4096, 1, 1);
        this.pitchShiftNode.onaudioprocess = (e) => this.processPitchShift(e);
        
        // Connect audio graph
        this.audioSource.connect(this.pitchShiftNode);
        this.pitchShiftNode.connect(this.audioContext.destination);
        
        // Set initial volume
        audio.volume = 0.6;
      }
    } catch (error) {
      console.warn('Audio context setup failed:', error);
    }
  }

  processPitchShift(event) {
    if (!document.getElementById('pitchCorrection').checked) return;
    
    const inputBuffer = event.inputBuffer;
    const outputBuffer = event.outputBuffer;
    const inputData = inputBuffer.getChannelData(0);
    const outputData = outputBuffer.getChannelData(0);
    
    // Simple pitch correction algorithm
    const pitchRatio = 1.0 / this.currentSpeed;
    
    for (let i = 0; i < outputData.length; i++) {
      const sourceIndex = Math.floor(i * pitchRatio);
      if (sourceIndex < inputData.length) {
        outputData[i] = inputData[sourceIndex];
      }
    }
  }

  togglePlayPause() {
    this.isPlaying = !this.isPlaying;
    const btn = document.getElementById('playPauseBtn');
    const status = document.getElementById('replayStatus');
    const audio = document.getElementById('replayAudio');
    
    if (this.isPlaying) {
      btn.textContent = '⏸️ PAUSE';
      status.textContent = '▶️ PLAYING';
      if (audio) audio.play();
    } else {
      btn.textContent = '▶️ PLAY';
      status.textContent = '⏸️ PAUSED';
      if (audio) audio.pause();
    }
  }

  stop() {
    this.isPlaying = false;
    this.currentTime = 0;
    
    const btn = document.getElementById('playPauseBtn');
    const status = document.getElementById('replayStatus');
    const audio = document.getElementById('replayAudio');
    
    btn.textContent = '▶️ PLAY';
    status.textContent = '⏹️ STOPPED';
    
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    
    this.updateTimestamp();
    this.updatePlayhead();
  }

  rewind() {
    this.currentTime = Math.max(0, this.currentTime - 10);
    this.updateTimestamp();
    this.updatePlayhead();
    this.syncAudioTime();
  }

  fastForward() {
    this.currentTime = Math.min(this.duration, this.currentTime + 10);
    this.updateTimestamp();
    this.updatePlayhead();
    this.syncAudioTime();
  }

  setSpeed(speed) {
    this.currentSpeed = speed;
    document.getElementById('speedSlider').value = speed;
    document.getElementById('speedDisplay').textContent = `${speed}x`;
    
    // Adjust audio playback rate
    const audio = document.getElementById('replayAudio');
    if (audio) {
      audio.playbackRate = speed;
    }
  }

  updateSpeedButtons(selectedSpeed) {
    document.querySelectorAll('.speed-btn').forEach(btn => {
      btn.classList.remove('selected');
      if (parseFloat(btn.dataset.speed) === selectedSpeed) {
        btn.classList.add('selected');
      }
    });
  }

  changePerspective(perspectiveKey) {
    const perspective = this.perspectives[perspectiveKey];
    if (!perspective) return;
    
    const relicDisplay = document.getElementById('relicDisplay');
    const energyField = relicDisplay.querySelector('.energy-field');
    
    // Remove existing perspective effects
    relicDisplay.className = 'relic-display';
    energyField.className = 'energy-field rotating';
    
    // Apply new perspective effect
    switch (perspective.effect) {
      case 'rotation-fast':
        energyField.style.animationDuration = '2s';
        relicDisplay.classList.add('perspective-alpha');
        break;
      case 'glow-intense':
        energyField.style.boxShadow = '0 0 40px #00ff88, inset 0 0 40px rgba(0, 255, 136, 0.5)';
        relicDisplay.classList.add('perspective-beta');
        break;
      case 'particle-storm':
        this.addParticleStorm();
        relicDisplay.classList.add('perspective-gamma');
        break;
      case 'cosmic-fusion':
        this.addCosmicFusion();
        relicDisplay.classList.add('perspective-singularity');
        break;
      default:
        energyField.style.animationDuration = '8s';
        energyField.style.boxShadow = '0 0 20px #00ff88, inset 0 0 20px rgba(0, 255, 136, 0.3)';
        break;
    }
    
    this.generatePerspectiveSummary(perspectiveKey);
  }

  addParticleStorm() {
    const cosmicParticles = document.querySelector('.cosmic-particles');
    cosmicParticles.innerHTML = '';
    
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: absolute;
        width: 2px;
        height: 2px;
        background: #00ff88;
        border-radius: 50%;
        top: ${Math.random() * 100}%;
        left: ${Math.random() * 100}%;
        animation: particle-float ${2 + Math.random() * 4}s ease-in-out infinite;
        animation-delay: ${Math.random() * 2}s;
      `;
      cosmicParticles.appendChild(particle);
    }
  }

  addCosmicFusion() {
    const relicState = document.getElementById('relicState');
    const fusion = document.createElement('div');
    fusion.className = 'cosmic-fusion-effect';
    fusion.style.cssText = `
      position: absolute;
      width: 400px;
      height: 400px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: radial-gradient(circle, rgba(255, 107, 0, 0.3) 0%, transparent 70%);
      border-radius: 50%;
      animation: cosmic-pulse 3s ease-in-out infinite;
      pointer-events: none;
    `;
    relicState.appendChild(fusion);
    
    // Add CSS animation if not exists
    if (!document.querySelector('#cosmic-fusion-styles')) {
      const style = document.createElement('style');
      style.id = 'cosmic-fusion-styles';
      style.textContent = `
        @keyframes cosmic-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.3; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.7; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  addTag() {
    const tagNameInput = document.getElementById('tagName');
    const tagName = tagNameInput.value.trim();
    
    if (!tagName) return;
    
    const tag = {
      id: Date.now(),
      name: tagName,
      time: this.currentTime,
      timestamp: this.formatTime(this.currentTime)
    };
    
    this.tags.push(tag);
    this.renderTags();
    this.addTimelineMarker(tag);
    this.saveUserProfile();
    
    tagNameInput.value = '';
    
    // Visual feedback
    this.showNotification(`Tag "${tagName}" added at ${tag.timestamp}`);
  }

  renderTags() {
    const container = document.getElementById('savedTags');
    container.innerHTML = '';
    
    this.tags.forEach(tag => {
      const tagElement = document.createElement('div');
      tagElement.className = 'tag-item';
      tagElement.innerHTML = `
        <span class="tag-name">${tag.name}</span>
        <span class="tag-time">${tag.timestamp}</span>
      `;
      
      tagElement.addEventListener('click', () => this.jumpToTag(tag));
      container.appendChild(tagElement);
    });
  }

  jumpToTag(tag) {
    this.currentTime = tag.time;
    this.updateTimestamp();
    this.updatePlayhead();
    this.syncAudioTime();
    this.showNotification(`Jumped to "${tag.name}"`);
  }

  addTimelineMarker(tag) {
    const timeline = document.getElementById('timelineEvents');
    const marker = document.createElement('div');
    marker.className = 'event-marker';
    marker.style.left = `${(tag.time / this.duration) * 100}%`;
    marker.title = `${tag.name} - ${tag.timestamp}`;
    
    marker.addEventListener('click', (e) => {
      e.stopPropagation();
      this.jumpToTag(tag);
    });
    
    timeline.appendChild(marker);
  }

  captureSnapshot() {
    const snapshot = {
      id: Date.now(),
      time: this.currentTime,
      timestamp: this.formatTime(this.currentTime),
      relicState: this.getCurrentRelicState(),
      perspective: document.getElementById('perspectiveSelect').value,
      glyphSequence: this.glyphSequences[this.currentGlyphIndex]
    };
    
    this.snapshots.push(snapshot);
    this.renderSnapshots();
    this.saveUserProfile();
    
    this.showNotification(`Snapshot captured at ${snapshot.timestamp}`);
  }

  getCurrentRelicState() {
    const relicDisplay = document.getElementById('relicDisplay');
    const computedStyle = window.getComputedStyle(relicDisplay);
    
    return {
      glyphSequence: document.getElementById('glyphSequence').textContent,
      perspective: document.getElementById('perspectiveSelect').value,
      energyLevel: Math.random() * 100, // Simulated energy reading
      particleCount: document.querySelectorAll('.cosmic-particles > div').length,
      timestamp: new Date().toISOString()
    };
  }

  renderSnapshots() {
    const container = document.getElementById('snapshotGallery');
    container.innerHTML = '';
    
    this.snapshots.forEach((snapshot, index) => {
      const snapshotElement = document.createElement('div');
      snapshotElement.className = 'snapshot-item';
      snapshotElement.innerHTML = `
        <div class="snapshot-preview">📸</div>
        <div class="snapshot-info">${snapshot.timestamp}</div>
      `;
      
      snapshotElement.addEventListener('click', () => this.viewSnapshot(snapshot));
      container.appendChild(snapshotElement);
    });
  }

  viewSnapshot(snapshot) {
    // Jump to snapshot time
    this.currentTime = snapshot.time;
    this.updateTimestamp();
    this.updatePlayhead();
    
    // Apply snapshot state
    document.getElementById('perspectiveSelect').value = snapshot.perspective;
    this.changePerspective(snapshot.perspective);
    
    // Update glyph sequence
    document.getElementById('glyphSequence').textContent = snapshot.glyphSequence;
    
    this.showNotification(`Viewing snapshot from ${snapshot.timestamp}`);
  }

  compareSnapshots() {
    if (this.snapshots.length < 2) {
      this.showNotification('Need at least 2 snapshots to compare');
      return;
    }
    
    const latest = this.snapshots[this.snapshots.length - 1];
    const previous = this.snapshots[this.snapshots.length - 2];
    
    const comparison = this.generateSnapshotComparison(previous, latest);
    this.displaySnapshotComparison(comparison);
  }

  generateSnapshotComparison(snapshot1, snapshot2) {
    return {
      timeDifference: snapshot2.time - snapshot1.time,
      perspectiveChanged: snapshot1.perspective !== snapshot2.perspective,
      glyphChanged: snapshot1.glyphSequence !== snapshot2.glyphSequence,
      energyDelta: snapshot2.relicState.energyLevel - snapshot1.relicState.energyLevel,
      summary: `Comparison between ${snapshot1.timestamp} and ${snapshot2.timestamp}`
    };
  }

  displaySnapshotComparison(comparison) {
    let message = `Snapshot Comparison:\n`;
    message += `Time difference: ${this.formatTime(comparison.timeDifference)}\n`;
    message += `Perspective changed: ${comparison.perspectiveChanged ? 'Yes' : 'No'}\n`;
    message += `Glyph sequence changed: ${comparison.glyphChanged ? 'Yes' : 'No'}\n`;
    message += `Energy delta: ${comparison.energyDelta.toFixed(2)}`;
    
    this.showNotification(message, 5000);
  }

  seekToTime(event) {
    const timeline = document.getElementById('timeline');
    const rect = timeline.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = x / rect.width;
    
    this.currentTime = percentage * this.duration;
    this.updateTimestamp();
    this.updatePlayhead();
    this.syncAudioTime();
  }

  zoomTimeline(factor) {
    // Implement timeline zoom functionality
    this.showNotification(`Timeline zoom: ${factor > 1 ? 'In' : 'Out'}`);
  }

  toggleSummaryPanel() {
    const panel = document.getElementById('summaryPanel');
    const isHidden = panel.style.display === 'none';
    panel.style.display = isHidden ? 'block' : 'none';
  }

  togglePitchCorrection(enabled) {
    // Pitch correction is handled in the audio processing
    this.showNotification(`Pitch correction: ${enabled ? 'ON' : 'OFF'}`);
  }

  startReplayLoop() {
    setInterval(() => {
      if (this.isPlaying) {
        this.currentTime += this.currentSpeed * 0.1;
        
        if (this.currentTime >= this.duration) {
          this.currentTime = this.duration;
          this.stop();
          this.generateCompletionSummary();
        }
        
        this.updateTimestamp();
        this.updatePlayhead();
        this.updateGlyphSequence();
      }
    }, 100);
  }

  updateTimestamp() {
    document.getElementById('timeStamp').textContent = this.formatTime(this.currentTime);
  }

  updatePlayhead() {
    const percentage = (this.currentTime / this.duration) * 100;
    document.getElementById('playhead').style.left = `${percentage}%`;
  }

  updateGlyphSequence() {
    if (Math.random() < 0.1) { // 10% chance to change glyph
      this.currentGlyphIndex = (this.currentGlyphIndex + 1) % this.glyphSequences.length;
      document.getElementById('glyphSequence').textContent = this.glyphSequences[this.currentGlyphIndex];
    }
  }

  syncAudioTime() {
    const audio = document.getElementById('replayAudio');
    if (audio && !audio.paused) {
      audio.currentTime = (this.currentTime / this.duration) * audio.duration;
    }
  }

  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  }

  generateInitialSummary() {
    this.updateHighlightReel([
      'Cosmic resonance detected',
      'Glyph sequence alignment',
      'Energy field stabilization',
      'Temporal flux initiated'
    ]);
    
    this.updateKeyMoments([
      'Initial vault breach detected at temporal coordinates',
      'Relic energy signature amplification commenced',
      'Observer node synchronization established',
      'Cosmic data stream integrity verified'
    ]);
    
    this.updateGlyphSequenceAnalysis();
    this.updateLoreFragments();
  }

  generatePerspectiveSummary(perspectiveKey) {
    const perspective = this.perspectives[perspectiveKey];
    const summaryText = `Perspective changed to ${perspective.name}. Enhanced viewing angle reveals new dimensional layers and energy patterns.`;
    
    this.showNotification(summaryText);
    this.updateHighlightReel([`Perspective: ${perspective.name}`, 'Enhanced dimensional viewing', 'Energy pattern analysis']);
  }

  generateCompletionSummary() {
    this.showNotification('Replay completed! Generating comprehensive analysis...');
    
    setTimeout(() => {
      this.updateHighlightReel([
        'Complete replay analysis',
        'Final energy state captured',
        'All perspective nodes analyzed',
        'Cosmic pattern recognition complete'
      ]);
      
      this.updateKeyMoments([
        'Replay session completed successfully',
        `Total tags created: ${this.tags.length}`,
        `Snapshots captured: ${this.snapshots.length}`,
        'Relic evolution pattern documented',
        'Cosmic signature analysis finalized'
      ]);
    }, 2000);
  }

  updateHighlightReel(highlights) {
    const container = document.getElementById('highlightReel');
    container.innerHTML = '';
    
    highlights.forEach(highlight => {
      const item = document.createElement('div');
      item.className = 'highlight-item';
      item.textContent = highlight;
      item.addEventListener('click', () => this.showNotification(`Highlight: ${highlight}`));
      container.appendChild(item);
    });
  }

  updateKeyMoments(moments) {
    const container = document.getElementById('keyMoments');
    container.innerHTML = '';
    
    moments.forEach(moment => {
      const item = document.createElement('li');
      item.textContent = moment;
      container.appendChild(item);
    });
  }

  updateGlyphSequenceAnalysis() {
    const container = document.getElementById('glyphSequences');
    container.innerHTML = '';
    
    this.glyphSequences.forEach((sequence, index) => {
      const item = document.createElement('div');
      item.className = 'glyph-item';
      item.innerHTML = `
        <div class="glyph-symbols">${sequence}</div>
        <div class="glyph-analysis">Pattern ${index + 1}: ${this.getGlyphMeaning(sequence)}</div>
      `;
      container.appendChild(item);
    });
  }

  getGlyphMeaning(sequence) {
    const meanings = {
      '∴ ◊ ∞ ◊ ∴': 'Infinite cosmic convergence pattern',
      '⧬ ⟐ ⧭ ⟐ ⧬': 'Dimensional gateway resonance',
      '◈ ⬟ ◉ ⬟ ◈': 'Central nexus amplification',
      '⬢ ⬡ ⬢ ⬡ ⬢': 'Hexagonal stability matrix',
      '◊ ∞ ◊ ∞ ◊': 'Eternal loop configuration'
    };
    return meanings[sequence] || 'Unknown cosmic pattern';
  }

  updateLoreFragments() {
    const container = document.getElementById('loreFragments');
    const fragments = [
      'The Cosmic Replay Terminal stands as a testament to the advanced temporal viewing capabilities of the ChaosKey Syndicate.',
      'Through the Omni-Singularity Map, observers can witness the birth and evolution of cosmic relics across multiple dimensional planes.',
      'Each glyph sequence holds the memory of cosmic events, encoding the wisdom of ancient civilizations into pure energy patterns.',
      'The Ascension Edition represents the pinnacle of Sentinel-grade technology, allowing unprecedented insight into relic consciousness.'
    ];
    
    container.innerHTML = '';
    fragments.forEach(fragment => {
      const item = document.createElement('div');
      item.className = 'lore-item';
      item.textContent = fragment;
      container.appendChild(item);
    });
  }

  loadUserProfile() {
    try {
      const saved = localStorage.getItem('cosmicReplayTerminal');
      if (saved) {
        const data = JSON.parse(saved);
        this.tags = data.tags || [];
        this.snapshots = data.snapshots || [];
        this.renderTags();
        this.renderSnapshots();
        
        // Restore timeline markers
        this.tags.forEach(tag => this.addTimelineMarker(tag));
      }
    } catch (error) {
      console.warn('Failed to load user profile:', error);
    }
  }

  saveUserProfile() {
    try {
      const data = {
        tags: this.tags,
        snapshots: this.snapshots,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem('cosmicReplayTerminal', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save user profile:', error);
    }
  }

  showNotification(message, duration = 3000) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 255, 136, 0.9);
      color: #000;
      padding: 15px 20px;
      border-radius: 5px;
      z-index: 10000;
      font-family: 'Share Tech Mono', monospace;
      max-width: 300px;
      word-wrap: break-word;
      box-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, duration);
  }
}

// Initialize the Cosmic Replay Terminal when the page loads
document.addEventListener('DOMContentLoaded', () => {
  window.cosmicReplayTerminal = new CosmicReplayTerminal();
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CosmicReplayTerminal;
}