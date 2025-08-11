/**
 * Temporal Echo Layer System for ChaosKey333
 * Handles echo resonance drift and temporal history visualization
 */

class TemporalEchoLayer {
  constructor(containerElement) {
    this.container = containerElement;
    this.echoes = [];
    this.echoCount = 0;
    this.maxEchoes = 8;
    this.driftSpeed = 0.5; // pixels per frame
    this.driftTrajectory = 'radial'; // 'radial', 'spiral', 'linear'
    this.animationFrameId = null;
    this.isActive = true;
    
    this.init();
  }

  init() {
    // Create echo container
    this.echoContainer = document.createElement('div');
    this.echoContainer.className = 'temporal-echo-container';
    this.container.appendChild(this.echoContainer);
    
    // Start animation loop
    this.animate();
  }

  createEcho(relicData) {
    if (this.echoes.length >= this.maxEchoes) {
      // Remove oldest echo
      const oldestEcho = this.echoes.shift();
      if (oldestEcho.element.parentNode) {
        oldestEcho.element.parentNode.removeChild(oldestEcho.element);
      }
    }

    const echo = {
      id: this.echoCount++,
      element: this.createEchoElement(relicData),
      x: 0,
      y: 0,
      distance: 0,
      angle: Math.random() * 2 * Math.PI,
      opacity: 1.0,
      scale: 1.0,
      hue: 280, // Start with violet
      created: Date.now(),
      relicData: relicData
    };

    this.echoes.push(echo);
    this.echoContainer.appendChild(echo.element);
    
    return echo;
  }

  createEchoElement(relicData) {
    const echoEl = document.createElement('div');
    echoEl.className = 'temporal-echo';
    
    // Create inner content
    echoEl.innerHTML = `
      <div class="echo-core">
        <div class="echo-relic-symbol">⚡</div>
        <div class="echo-timestamp">${new Date().toLocaleTimeString()}</div>
      </div>
      <div class="echo-resonance-ring"></div>
    `;
    
    return echoEl;
  }

  updateEcho(echo) {
    const age = Date.now() - echo.created;
    const maxAge = 30000; // 30 seconds max lifetime
    
    if (age > maxAge) {
      this.removeEcho(echo);
      return;
    }

    // Update position based on trajectory
    this.updateEchoPosition(echo, age);
    
    // Update visual properties
    this.updateEchoVisuals(echo, age, maxAge);
    
    // Apply to DOM
    this.applyEchoTransform(echo);
  }

  updateEchoPosition(echo, age) {
    const progress = age / 30000; // 0 to 1 over 30 seconds
    
    switch (this.driftTrajectory) {
      case 'radial':
        echo.distance = progress * 200 * this.driftSpeed;
        echo.x = Math.cos(echo.angle) * echo.distance;
        echo.y = Math.sin(echo.angle) * echo.distance;
        break;
        
      case 'spiral':
        echo.distance = progress * 150 * this.driftSpeed;
        echo.angle += 0.02; // Spiral motion
        echo.x = Math.cos(echo.angle) * echo.distance;
        echo.y = Math.sin(echo.angle) * echo.distance;
        break;
        
      case 'linear':
        echo.x += Math.cos(echo.angle) * this.driftSpeed;
        echo.y += Math.sin(echo.angle) * this.driftSpeed;
        break;
    }
  }

  updateEchoVisuals(echo, age, maxAge) {
    const progress = age / maxAge;
    
    // Fade out over time with breathing effect
    const breathingPhase = Math.sin(age * 0.003) * 0.3 + 0.7; // Breathing between 0.4 and 1.0
    echo.opacity = (1 - progress * 0.7) * breathingPhase;
    
    // Scale down slightly over time
    echo.scale = 1.0 - progress * 0.3;
    
    // Spectral shift from violet (280) to gold (45)
    echo.hue = 280 + (progress * (45 - 280));
  }

  applyEchoTransform(echo) {
    const transform = `translate(${echo.x}px, ${echo.y}px) scale(${echo.scale})`;
    const filter = `hue-rotate(${echo.hue - 280}deg)`;
    
    echo.element.style.transform = transform;
    echo.element.style.filter = filter;
    echo.element.style.opacity = echo.opacity;
  }

  removeEcho(echo) {
    const index = this.echoes.indexOf(echo);
    if (index > -1) {
      this.echoes.splice(index, 1);
      if (echo.element.parentNode) {
        echo.element.parentNode.removeChild(echo.element);
      }
    }
  }

  animate() {
    if (!this.isActive) return;
    
    // Update all echoes
    this.echoes.forEach(echo => this.updateEcho(echo));
    
    // Continue animation
    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  // Event handler for new decode events
  onDecodeEvent(relicData) {
    this.createEcho(relicData);
  }

  // Configuration methods
  setDriftSpeed(speed) {
    this.driftSpeed = Math.max(0.1, Math.min(3.0, speed));
  }

  setDriftTrajectory(trajectory) {
    if (['radial', 'spiral', 'linear'].includes(trajectory)) {
      this.driftTrajectory = trajectory;
    }
  }

  setMaxEchoes(count) {
    this.maxEchoes = Math.max(1, Math.min(20, count));
  }

  // Control methods
  pause() {
    this.isActive = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  resume() {
    if (!this.isActive) {
      this.isActive = true;
      this.animate();
    }
  }

  clear() {
    this.echoes.forEach(echo => {
      if (echo.element.parentNode) {
        echo.element.parentNode.removeChild(echo.element);
      }
    });
    this.echoes = [];
  }

  destroy() {
    this.pause();
    this.clear();
    if (this.echoContainer.parentNode) {
      this.echoContainer.parentNode.removeChild(this.echoContainer);
    }
  }
}

// Export for module systems or global access
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TemporalEchoLayer;
} else {
  window.TemporalEchoLayer = TemporalEchoLayer;
}