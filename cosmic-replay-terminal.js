/**
 * Cosmic Replay Terminal v2.0 - Ascension Edition
 * Advanced replay system with load-adaptive frame pacing, time-dilation, 
 * multi-perspective viewing, event tagging, AI summaries, and persistent state management
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
    
    // Load-Adaptive Frame Pacing System
    this.frameMetrics = {
      targetFPS: 60,
      currentFPS: 60,
      frameTime: 16.67, // 1000/60
      averageFrameTime: 16.67,
      frameTimeHistory: [],
      droppedFrames: 0,
      lastFrameTime: performance.now(),
      adaptiveThreshold: 20, // ms
      stressTestActive: false,
      lastAudioSync: 0,
      audioDriftThreshold: 50, // ms
      performanceMode: 'auto' // auto, high-performance, battery-saver
    };
    
    this.frameScheduler = {
      rafId: null,
      timeAccumulator: 0,
      lastUpdateTime: performance.now(),
      adaptiveInterval: 16.67,
      minInterval: 8.33, // 120fps max
      maxInterval: 33.33 // 30fps min
    };
    
    this.stressTestConfig = {
      particleCount: 0,
      baseParticleCount: 20,
      maxParticleCount: 200,
      complexityMultiplier: 1,
      memoryBallast: []
    };
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupAudioContext();
    this.loadUserProfile();
    this.initPerformanceMonitor();
    this.startAdaptiveReplayLoop();
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
    
    // Simple pitch correction algorithm with adaptive quality
    const pitchRatio = 1.0 / this.currentSpeed;
    const quality = this.frameMetrics.currentFPS > 45 ? 1.0 : 0.5; // Reduce quality under load
    
    for (let i = 0; i < outputData.length; i++) {
      const sourceIndex = Math.floor(i * pitchRatio * quality);
      if (sourceIndex < inputData.length) {
        outputData[i] = inputData[sourceIndex];
      }
    }
  }

  // Load-Adaptive Frame Pacing System
  initPerformanceMonitor() {
    // Add performance monitor to the UI
    const performanceMonitor = document.createElement('div');
    performanceMonitor.className = 'performance-monitor';
    performanceMonitor.innerHTML = `
      <div class="perf-metric">
        <span>FPS:</span>
        <span id="perfFPS" class="perf-value">60</span>
      </div>
      <div class="perf-metric">
        <span>Frame:</span>
        <span id="perfFrameTime" class="perf-value">16ms</span>
      </div>
      <div class="perf-metric">
        <span>Sync:</span>
        <span id="perfAudioSync" class="perf-value">0ms</span>
      </div>
      <div class="perf-metric">
        <span>Load:</span>
        <span id="perfLoad" class="perf-value">Normal</span>
      </div>
    `;
    
    document.getElementById('replayCanvas').appendChild(performanceMonitor);

    // Add load-adaptive controls to the controls panel
    this.addFramePacingControls();
  }

  addFramePacingControls() {
    const framePacingControls = document.createElement('div');
    framePacingControls.className = 'frame-pacing-controls';
    framePacingControls.innerHTML = `
      <h4>⚡ LOAD-ADAPTIVE FRAME PACING</h4>
      <div class="frame-pacing-option">
        <label>Auto Frame Sync</label>
        <input type="checkbox" id="autoFrameSync" checked />
      </div>
      <div class="frame-pacing-option">
        <label>Audio Drift Correction</label>
        <input type="checkbox" id="audioDriftCorrection" checked />
      </div>
      <div class="frame-pacing-option">
        <label>Performance Mode</label>
        <select id="performanceMode">
          <option value="auto">Auto</option>
          <option value="high-performance">High Performance</option>
          <option value="battery-saver">Battery Saver</option>
        </select>
      </div>
      <button id="stressTestBtn" class="stress-test-btn">🔥 STRESS TEST MODE</button>
    `;

    // Insert after the speed controls
    const speedControls = document.querySelector('.speed-controls');
    speedControls.parentNode.insertBefore(framePacingControls, speedControls.nextSibling);

    // Add event listeners for frame pacing controls
    document.getElementById('autoFrameSync').addEventListener('change', (e) => {
      this.frameMetrics.autoSync = e.target.checked;
      this.showNotification(`Auto Frame Sync: ${e.target.checked ? 'ON' : 'OFF'}`);
    });

    document.getElementById('audioDriftCorrection').addEventListener('change', (e) => {
      this.frameMetrics.audioDriftCorrection = e.target.checked;
      this.showNotification(`Audio Drift Correction: ${e.target.checked ? 'ON' : 'OFF'}`);
    });

    document.getElementById('performanceMode').addEventListener('change', (e) => {
      this.frameMetrics.performanceMode = e.target.value;
      this.adjustPerformanceMode(e.target.value);
      this.showNotification(`Performance Mode: ${e.target.value}`);
    });

    document.getElementById('stressTestBtn').addEventListener('click', () => this.toggleStressTest());
  }

  adjustPerformanceMode(mode) {
    switch (mode) {
      case 'high-performance':
        this.frameMetrics.targetFPS = 60;
        this.frameScheduler.minInterval = 8.33; // 120fps max
        this.frameScheduler.maxInterval = 16.67; // 60fps min
        break;
      case 'battery-saver':
        this.frameMetrics.targetFPS = 30;
        this.frameScheduler.minInterval = 33.33; // 30fps max
        this.frameScheduler.maxInterval = 66.67; // 15fps min
        break;
      case 'auto':
      default:
        this.frameMetrics.targetFPS = 60;
        this.frameScheduler.minInterval = 8.33; // 120fps max
        this.frameScheduler.maxInterval = 33.33; // 30fps min
        break;
    }
  }

  startAdaptiveReplayLoop() {
    const updateLoop = (currentTime) => {
      if (!this.frameScheduler.rafId) return; // Loop was stopped
      
      const deltaTime = currentTime - this.frameScheduler.lastUpdateTime;
      this.frameScheduler.timeAccumulator += deltaTime;
      
      // Calculate current frame rate and performance metrics
      this.updateFrameMetrics(deltaTime);
      
      // Adaptive frame pacing - only update when accumulated time meets adaptive interval
      if (this.frameScheduler.timeAccumulator >= this.frameScheduler.adaptiveInterval) {
        if (this.isPlaying) {
          const effectiveSpeed = this.currentSpeed;
          const frameAdvancement = (this.frameScheduler.timeAccumulator / 1000) * effectiveSpeed;
          
          this.currentTime += frameAdvancement;
          
          if (this.currentTime >= this.duration) {
            this.currentTime = this.duration;
            this.stop();
            this.generateCompletionSummary();
          } else {
            // Update all visual elements in sync
            this.updateAllVisualElements();
            
            // Check and correct audio drift if enabled
            if (document.getElementById('audioDriftCorrection')?.checked) {
              this.checkAndCorrectAudioDrift();
            }
          }
        }
        
        // Update performance metrics display
        this.updatePerformanceDisplay();
        
        // Adjust adaptive interval based on performance
        this.adjustAdaptiveInterval();
        
        // Reset accumulator
        this.frameScheduler.timeAccumulator = 0;
      }
      
      this.frameScheduler.lastUpdateTime = currentTime;
      this.frameScheduler.rafId = requestAnimationFrame(updateLoop);
    };
    
    this.frameScheduler.rafId = requestAnimationFrame(updateLoop);
  }

  updateFrameMetrics(deltaTime) {
    // Calculate FPS and frame time
    if (deltaTime > 0) {
      const currentFPS = 1000 / deltaTime;
      this.frameMetrics.currentFPS = currentFPS;
      this.frameMetrics.frameTime = deltaTime;
      
      // Maintain history for smoothing
      this.frameMetrics.frameTimeHistory.push(deltaTime);
      if (this.frameMetrics.frameTimeHistory.length > 10) {
        this.frameMetrics.frameTimeHistory.shift();
      }
      
      // Calculate average frame time
      this.frameMetrics.averageFrameTime = this.frameMetrics.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameMetrics.frameTimeHistory.length;
      
      // Detect dropped frames
      if (deltaTime > this.frameMetrics.adaptiveThreshold * 2) {
        this.frameMetrics.droppedFrames++;
      }
    }
  }

  adjustAdaptiveInterval() {
    const autoSync = document.getElementById('autoFrameSync')?.checked ?? true;
    if (!autoSync) return;
    
    const targetFrameTime = 1000 / this.frameMetrics.targetFPS;
    const performanceRatio = this.frameMetrics.averageFrameTime / targetFrameTime;
    
    if (performanceRatio > 1.5) {
      // Performance is struggling, reduce frame rate
      this.frameScheduler.adaptiveInterval = Math.min(
        this.frameScheduler.adaptiveInterval * 1.1,
        this.frameScheduler.maxInterval
      );
    } else if (performanceRatio < 0.8) {
      // Performance is good, can increase frame rate
      this.frameScheduler.adaptiveInterval = Math.max(
        this.frameScheduler.adaptiveInterval * 0.95,
        this.frameScheduler.minInterval
      );
    }
    
    // Stress test adjustments
    if (this.frameMetrics.stressTestActive) {
      this.updateStressTestLoad();
    }
  }

  checkAndCorrectAudioDrift() {
    const audio = document.getElementById('replayAudio');
    if (!audio || audio.paused) return;
    
    const expectedAudioTime = (this.currentTime / this.duration) * audio.duration;
    const actualAudioTime = audio.currentTime;
    const audioDrift = Math.abs(expectedAudioTime - actualAudioTime) * 1000; // ms
    
    this.frameMetrics.lastAudioSync = audioDrift;
    
    // Correct significant drift
    if (audioDrift > this.frameMetrics.audioDriftThreshold) {
      audio.currentTime = expectedAudioTime;
      this.showNotification(`Audio sync corrected: ${audioDrift.toFixed(1)}ms drift`, 1000);
    }
  }

  updateAllVisualElements() {
    // Batch all visual updates to prevent frame drops
    this.updateTimestamp();
    this.updatePlayhead();
    this.updateGlyphSequence();
    
    // Reduce particle updates under load
    if (this.frameMetrics.averageFrameTime < 25) { // Good performance
      this.updateParticleEffects();
    } else if (Math.random() < 0.5) { // Reduce frequency under load
      this.updateParticleEffects();
    }
  }

  updateParticleEffects() {
    // Update cosmic particles with performance-aware complexity
    const particles = document.querySelectorAll('.cosmic-particles > div');
    const complexityFactor = Math.max(0.2, 1 - (this.frameMetrics.averageFrameTime - 16.67) / 20);
    
    particles.forEach((particle, index) => {
      if (Math.random() < complexityFactor) {
        const newTop = (Math.sin(Date.now() * 0.001 + index) * 10 + 50) + '%';
        const newLeft = (Math.cos(Date.now() * 0.0015 + index) * 15 + 50) + '%';
        particle.style.top = newTop;
        particle.style.left = newLeft;
      }
    });
  }

  updatePerformanceDisplay() {
    const fpsElement = document.getElementById('perfFPS');
    const frameTimeElement = document.getElementById('perfFrameTime');
    const audioSyncElement = document.getElementById('perfAudioSync');
    const loadElement = document.getElementById('perfLoad');
    
    if (fpsElement) {
      const fps = Math.round(this.frameMetrics.currentFPS);
      fpsElement.textContent = fps;
      fpsElement.className = fps < 30 ? 'perf-value critical' : fps < 45 ? 'perf-value warning' : 'perf-value';
    }
    
    if (frameTimeElement) {
      const frameTime = Math.round(this.frameMetrics.averageFrameTime);
      frameTimeElement.textContent = frameTime + 'ms';
      frameTimeElement.className = frameTime > 25 ? 'perf-value critical' : frameTime > 20 ? 'perf-value warning' : 'perf-value';
    }
    
    if (audioSyncElement) {
      const syncTime = Math.round(this.frameMetrics.lastAudioSync);
      audioSyncElement.textContent = syncTime + 'ms';
      audioSyncElement.className = syncTime > 100 ? 'perf-value critical' : syncTime > 50 ? 'perf-value warning' : 'perf-value';
    }
    
    if (loadElement) {
      let loadStatus = 'Normal';
      if (this.frameMetrics.stressTestActive) {
        loadStatus = 'Stress Test';
      } else if (this.frameMetrics.averageFrameTime > 25) {
        loadStatus = 'High';
      } else if (this.frameMetrics.averageFrameTime > 20) {
        loadStatus = 'Medium';
      }
      loadElement.textContent = loadStatus;
      loadElement.className = loadStatus === 'High' || loadStatus === 'Stress Test' ? 'perf-value critical' : 
                              loadStatus === 'Medium' ? 'perf-value warning' : 'perf-value';
    }
  }

  toggleStressTest() {
    const btn = document.getElementById('stressTestBtn');
    this.frameMetrics.stressTestActive = !this.frameMetrics.stressTestActive;
    
    if (this.frameMetrics.stressTestActive) {
      btn.textContent = '🔥 STOP STRESS TEST';
      btn.classList.add('active');
      this.initializeStressTest();
      this.showNotification('🔥 Stress test activated - simulating broadcast surge', 3000);
    } else {
      btn.textContent = '🔥 STRESS TEST MODE';
      btn.classList.remove('active');
      this.cleanupStressTest();
      this.showNotification('Stress test deactivated', 2000);
    }
  }

  initializeStressTest() {
    // Create memory ballast to simulate heavy load
    this.stressTestConfig.memoryBallast = [];
    for (let i = 0; i < 1000; i++) {
      this.stressTestConfig.memoryBallast.push(new Array(1000).fill(Math.random()));
    }
    
    // Increase particle count dramatically
    this.stressTestConfig.particleCount = this.stressTestConfig.maxParticleCount;
    this.addStressTestParticles();
    
    // Reduce adaptive threshold to be more sensitive
    this.frameMetrics.adaptiveThreshold = 15;
  }

  updateStressTestLoad() {
    // Gradually increase complexity during stress test
    if (this.frameMetrics.stressTestActive) {
      this.stressTestConfig.complexityMultiplier += 0.01;
      
      // Add random computational load
      for (let i = 0; i < 100 * this.stressTestConfig.complexityMultiplier; i++) {
        Math.sin(Math.random() * 1000) * Math.cos(Math.random() * 1000);
      }
    }
  }

  addStressTestParticles() {
    const cosmicParticles = document.querySelector('.cosmic-particles');
    if (!cosmicParticles) return;
    
    // Clear existing particles
    cosmicParticles.innerHTML = '';
    
    // Add many more particles for stress testing
    for (let i = 0; i < this.stressTestConfig.particleCount; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: absolute;
        width: ${1 + Math.random() * 3}px;
        height: ${1 + Math.random() * 3}px;
        background: hsl(${120 + Math.random() * 60}, 100%, 50%);
        border-radius: 50%;
        top: ${Math.random() * 100}%;
        left: ${Math.random() * 100}%;
        animation: particle-float ${1 + Math.random() * 3}s ease-in-out infinite;
        animation-delay: ${Math.random() * 2}s;
        opacity: ${0.3 + Math.random() * 0.7};
      `;
      cosmicParticles.appendChild(particle);
    }
  }

  cleanupStressTest() {
    // Clean up stress test resources
    this.stressTestConfig.memoryBallast = [];
    this.stressTestConfig.complexityMultiplier = 1;
    this.stressTestConfig.particleCount = this.stressTestConfig.baseParticleCount;
    
    // Reset adaptive threshold
    this.frameMetrics.adaptiveThreshold = 20;
    
    // Reset particles to normal
    this.addParticleStorm(); // Use the original particle storm method
  }

  stopAdaptiveReplayLoop() {
    if (this.frameScheduler.rafId) {
      cancelAnimationFrame(this.frameScheduler.rafId);
      this.frameScheduler.rafId = null;
    }
  }

  // Original methods with minimal modifications for compatibility

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
    
    const particleCount = this.frameMetrics.stressTestActive ? 
      this.stressTestConfig.particleCount : this.stressTestConfig.baseParticleCount;
    
    for (let i = 0; i < particleCount; i++) {
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
      glyphSequence: this.glyphSequences[this.currentGlyphIndex],
      performanceMetrics: {
        fps: this.frameMetrics.currentFPS,
        frameTime: this.frameMetrics.averageFrameTime,
        audioDrift: this.frameMetrics.lastAudioSync
      }
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
    
    // Show performance metrics if available
    if (snapshot.performanceMetrics) {
      const perfInfo = `FPS: ${snapshot.performanceMetrics.fps.toFixed(1)}, Frame: ${snapshot.performanceMetrics.frameTime.toFixed(1)}ms`;
      this.showNotification(`Viewing snapshot from ${snapshot.timestamp} (${perfInfo})`);
    } else {
      this.showNotification(`Viewing snapshot from ${snapshot.timestamp}`);
    }
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
      performanceDelta: snapshot2.performanceMetrics && snapshot1.performanceMetrics ? 
        snapshot2.performanceMetrics.fps - snapshot1.performanceMetrics.fps : null,
      summary: `Comparison between ${snapshot1.timestamp} and ${snapshot2.timestamp}`
    };
  }

  displaySnapshotComparison(comparison) {
    let message = `Snapshot Comparison:\n`;
    message += `Time difference: ${this.formatTime(comparison.timeDifference)}\n`;
    message += `Perspective changed: ${comparison.perspectiveChanged ? 'Yes' : 'No'}\n`;
    message += `Glyph sequence changed: ${comparison.glyphChanged ? 'Yes' : 'No'}\n`;
    message += `Energy delta: ${comparison.energyDelta.toFixed(2)}\n`;
    if (comparison.performanceDelta !== null) {
      message += `Performance delta: ${comparison.performanceDelta.toFixed(1)} FPS`;
    }
    
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
      'Load-adaptive frame pacing initialized',
      'Cosmic resonance detected',
      'Glyph sequence alignment',
      'Energy field stabilization',
      'Temporal flux initiated'
    ]);
    
    this.updateKeyMoments([
      'Advanced frame pacing system activated',
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
    const performanceInfo = `Current FPS: ${this.frameMetrics.currentFPS.toFixed(1)}`;
    const summaryText = `Perspective changed to ${perspective.name}. Enhanced viewing angle reveals new dimensional layers and energy patterns. ${performanceInfo}`;
    
    this.showNotification(summaryText);
    this.updateHighlightReel([`Perspective: ${perspective.name}`, 'Enhanced dimensional viewing', 'Energy pattern analysis', 'Performance optimized']);
  }

  generateCompletionSummary() {
    this.showNotification('Replay completed! Generating comprehensive analysis...');
    
    setTimeout(() => {
      this.updateHighlightReel([
        'Complete replay analysis',
        'Final energy state captured',
        'All perspective nodes analyzed',
        'Cosmic pattern recognition complete',
        `Performance: ${this.frameMetrics.droppedFrames} dropped frames`
      ]);
      
      this.updateKeyMoments([
        'Replay session completed successfully',
        `Total tags created: ${this.tags.length}`,
        `Snapshots captured: ${this.snapshots.length}`,
        'Relic evolution pattern documented',
        'Cosmic signature analysis finalized',
        `Average FPS: ${this.frameMetrics.currentFPS.toFixed(1)}`,
        `Frame drops: ${this.frameMetrics.droppedFrames}`
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
      'The Load-Adaptive Frame Pacing system ensures crystal-clear playback even during the most intense cosmic surges.',
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
        performanceStats: {
          averageFPS: this.frameMetrics.currentFPS,
          droppedFrames: this.frameMetrics.droppedFrames,
          lastSession: new Date().toISOString()
        },
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

  // Cleanup method for when the terminal is closed
  destroy() {
    this.stopAdaptiveReplayLoop();
    this.cleanupStressTest();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// Initialize the Cosmic Replay Terminal when the page loads
document.addEventListener('DOMContentLoaded', () => {
  window.cosmicReplayTerminal = new CosmicReplayTerminal();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.cosmicReplayTerminal) {
    window.cosmicReplayTerminal.destroy();
  }
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CosmicReplayTerminal;
}