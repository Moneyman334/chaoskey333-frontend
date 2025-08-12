/**
 * Real-Time Replay Buffer System
 * Provides 90-second rolling capture in RAM with live/replay hybrid functionality
 */

class ReplayBuffer {
  constructor(duration = 90) {
    this.maxDuration = duration; // 90 seconds default
    this.buffer = [];
    this.isRecording = true;
    this.isLive = true;
    this.currentTime = 0;
    this.liveTime = 0;
    this.frameRate = 60; // 60 FPS capture
    this.frameInterval = 1000 / this.frameRate;
    
    // Buffer management
    this.maxFrames = this.maxDuration * this.frameRate;
    this.writeIndex = 0;
    this.readIndex = 0;
    
    // Event tracking
    this.hotspots = [];
    this.lastHotspotCheck = 0;
    
    // Callbacks
    this.onHotspotDetected = null;
    this.onBufferUpdate = null;
    
    this.startContinuousCapture();
  }

  startContinuousCapture() {
    // Simulate continuous data capture
    this.captureInterval = setInterval(() => {
      if (this.isRecording) {
        const frame = this.captureCurrentFrame();
        this.addFrameToBuffer(frame);
        this.detectHotspots(frame);
        
        if (this.isLive) {
          this.liveTime += this.frameInterval / 1000;
          this.currentTime = this.liveTime;
        }
        
        if (this.onBufferUpdate) {
          this.onBufferUpdate(this.getBufferStatus());
        }
      }
    }, this.frameInterval);
  }

  captureCurrentFrame() {
    // Simulate capturing current frame data
    return {
      timestamp: Date.now(),
      relativeTime: this.liveTime,
      relicState: this.getCurrentRelicState(),
      glyphSequence: this.getCurrentGlyphSequence(),
      energyLevel: this.getEnergyLevel(),
      particleCount: this.getParticleCount(),
      perspective: this.getCurrentPerspective()
    };
  }

  addFrameToBuffer(frame) {
    // Add frame to circular buffer
    this.buffer[this.writeIndex] = frame;
    this.writeIndex = (this.writeIndex + 1) % this.maxFrames;
    
    // If buffer is full, adjust read index
    if (this.buffer.length >= this.maxFrames) {
      this.readIndex = this.writeIndex;
    }
  }

  detectHotspots(frame) {
    const now = frame.relativeTime;
    
    // Check for hotspot conditions every 100ms
    if (now - this.lastHotspotCheck < 0.1) return;
    this.lastHotspotCheck = now;
    
    let hotspotType = null;
    let intensity = 0;
    
    // Core pulse detection
    if (frame.energyLevel > 80) {
      hotspotType = 'core-pulse';
      intensity = frame.energyLevel;
    }
    
    // Glyph burst detection
    if (this.isGlyphBurst(frame)) {
      hotspotType = 'glyph-burst';
      intensity = 75;
    }
    
    // Relic evolution detection
    if (this.isRelicEvolution(frame)) {
      hotspotType = 'relic-evolution';
      intensity = 90;
    }
    
    if (hotspotType && intensity > 70) {
      const hotspot = {
        id: Date.now(),
        type: hotspotType,
        time: now,
        intensity: intensity,
        frame: frame,
        timestamp: new Date().toISOString()
      };
      
      this.hotspots.push(hotspot);
      
      // Keep only recent hotspots (within buffer duration)
      this.hotspots = this.hotspots.filter(h => now - h.time < this.maxDuration);
      
      if (this.onHotspotDetected) {
        this.onHotspotDetected(hotspot);
      }
    }
  }

  isGlyphBurst(frame) {
    // Detect rapid glyph sequence changes
    const recentFrames = this.getRecentFrames(10);
    if (recentFrames.length < 5) return false;
    
    const glyphChanges = recentFrames.reduce((changes, f, i) => {
      if (i > 0 && f.glyphSequence !== recentFrames[i-1].glyphSequence) {
        changes++;
      }
      return changes;
    }, 0);
    
    return glyphChanges >= 3; // 3+ glyph changes in 10 frames
  }

  isRelicEvolution(frame) {
    // Detect significant relic state changes
    const recentFrames = this.getRecentFrames(30);
    if (recentFrames.length < 20) return false;
    
    const oldFrame = recentFrames[0];
    const energyDelta = Math.abs(frame.energyLevel - oldFrame.energyLevel);
    const perspectiveChanged = frame.perspective !== oldFrame.perspective;
    
    return energyDelta > 30 || perspectiveChanged;
  }

  enterScrubMode() {
    if (!this.isLive) return false;
    
    this.isLive = false;
    this.scrubStartTime = this.liveTime;
    this.scrubStartLiveTime = this.liveTime;
    
    // Continue recording in background while allowing scrubbing
    return true;
  }

  exitScrubMode() {
    if (this.isLive) return false;
    
    this.isLive = true;
    
    // Calculate catch-up boost
    const timeBehind = this.liveTime - this.currentTime;
    if (timeBehind > 0) {
      this.startCatchUpBoost(timeBehind);
    }
    
    return true;
  }

  startCatchUpBoost(timeBehind) {
    const boostSpeed = Math.min(timeBehind / 2, 5); // Max 5x speed
    const boostDuration = timeBehind / boostSpeed * 1000; // Convert to ms
    
    this.isCatchingUp = true;
    this.catchUpSpeed = boostSpeed;
    
    const catchUpInterval = setInterval(() => {
      if (!this.isCatchingUp || this.currentTime >= this.liveTime) {
        clearInterval(catchUpInterval);
        this.isCatchingUp = false;
        this.catchUpSpeed = 1;
        this.currentTime = this.liveTime;
        return;
      }
      
      this.currentTime += (this.frameInterval / 1000) * this.catchUpSpeed;
    }, this.frameInterval);
    
    // Auto-stop catch-up after calculated duration
    setTimeout(() => {
      if (this.isCatchingUp) {
        clearInterval(catchUpInterval);
        this.isCatchingUp = false;
        this.catchUpSpeed = 1;
        this.currentTime = this.liveTime;
      }
    }, boostDuration);
  }

  seekToTime(targetTime) {
    const minTime = Math.max(0, this.liveTime - this.maxDuration);
    const maxTime = this.liveTime;
    
    this.currentTime = Math.max(minTime, Math.min(maxTime, targetTime));
    
    // Exit live mode if seeking backwards
    if (this.currentTime < this.liveTime - 1) {
      this.isLive = false;
    }
  }

  getFrameAtTime(time) {
    const frameIndex = Math.floor(time * this.frameRate);
    const bufferIndex = frameIndex % this.maxFrames;
    
    if (bufferIndex < this.buffer.length) {
      return this.buffer[bufferIndex];
    }
    
    return null;
  }

  getRecentFrames(count) {
    const frames = [];
    let index = (this.writeIndex - 1 + this.maxFrames) % this.maxFrames;
    
    for (let i = 0; i < count && i < this.buffer.length; i++) {
      if (this.buffer[index]) {
        frames.unshift(this.buffer[index]);
      }
      index = (index - 1 + this.maxFrames) % this.maxFrames;
    }
    
    return frames;
  }

  getCurrentFrame() {
    if (this.isLive) {
      // Return most recent frame
      const index = (this.writeIndex - 1 + this.maxFrames) % this.maxFrames;
      return this.buffer[index];
    } else {
      // Return frame at current scrub time
      return this.getFrameAtTime(this.currentTime);
    }
  }

  createReplayRelic(startTime, endTime, metadata = {}) {
    const frames = this.getFramesInRange(startTime, endTime);
    
    const relic = {
      id: Date.now(),
      type: 'replay-relic',
      startTime: startTime,
      endTime: endTime,
      duration: endTime - startTime,
      frameCount: frames.length,
      frames: frames,
      hotspots: this.hotspots.filter(h => h.time >= startTime && h.time <= endTime),
      metadata: {
        ...metadata,
        createdAt: new Date().toISOString(),
        bufferVersion: '1.0',
        captureQuality: this.frameRate
      }
    };
    
    return relic;
  }

  getFramesInRange(startTime, endTime) {
    const frames = [];
    const startFrame = Math.floor(startTime * this.frameRate);
    const endFrame = Math.floor(endTime * this.frameRate);
    
    for (let i = startFrame; i <= endFrame; i++) {
      const bufferIndex = i % this.maxFrames;
      if (this.buffer[bufferIndex] && 
          this.buffer[bufferIndex].relativeTime >= startTime &&
          this.buffer[bufferIndex].relativeTime <= endTime) {
        frames.push(this.buffer[bufferIndex]);
      }
    }
    
    return frames;
  }

  getBufferStatus() {
    return {
      isRecording: this.isRecording,
      isLive: this.isLive,
      isCatchingUp: this.isCatchingUp || false,
      catchUpSpeed: this.catchUpSpeed || 1,
      currentTime: this.currentTime,
      liveTime: this.liveTime,
      bufferDuration: this.maxDuration,
      frameCount: this.buffer.length,
      hotspotCount: this.hotspots.length,
      timeBehind: this.isLive ? 0 : this.liveTime - this.currentTime
    };
  }

  // Simulation methods for demo purposes
  getCurrentRelicState() {
    return {
      id: Math.floor(Math.random() * 1000),
      energy: this.getEnergyLevel(),
      stability: Math.random() * 100
    };
  }

  getCurrentGlyphSequence() {
    const sequences = [
      '∴ ◊ ∞ ◊ ∴',
      '⧬ ⟐ ⧭ ⟐ ⧬',
      '◈ ⬟ ◉ ⬟ ◈',
      '⬢ ⬡ ⬢ ⬡ ⬢',
      '◊ ∞ ◊ ∞ ◊'
    ];
    return sequences[Math.floor(this.liveTime / 5) % sequences.length];
  }

  getEnergyLevel() {
    // Simulate varying energy levels with some spikes
    const base = 50 + 30 * Math.sin(this.liveTime * 0.1);
    const spike = Math.random() < 0.05 ? Math.random() * 40 : 0;
    return Math.max(0, Math.min(100, base + spike));
  }

  getParticleCount() {
    return Math.floor(10 + Math.random() * 20);
  }

  getCurrentPerspective() {
    const perspectives = ['central', 'sector-alpha', 'sector-beta', 'sector-gamma', 'omni-singularity'];
    return perspectives[Math.floor(this.liveTime / 10) % perspectives.length];
  }

  destroy() {
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
    }
    this.buffer = [];
    this.hotspots = [];
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ReplayBuffer;
}