/**
 * Temporal Echo Layer - ChaosKey333 Frontend
 * 
 * Implements the Temporal Echo Layer with Echo Resonance Drift,
 * Chrono-Tint Shift, and Decode Signature Trails.
 * 
 * Features:
 * - Echo Resonance Drift: Base particle system for drift effects
 * - Chrono-Tint Shift: Age-based color transitions (gold → violet-black)
 * - Decode Signature Trails: Glyph-shaped trails for decoded events
 */

class TemporalEchoLayer {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    // Configuration
    this.options = {
      particleCount: options.particleCount || 150,
      driftSpeed: options.driftSpeed || 0.5,
      echoLifetime: options.echoLifetime || 10000, // 10 seconds
      spectralMode: options.spectralMode || false,
      ...options
    };
    
    // Echo particles
    this.echoes = [];
    this.decodeEvents = [];
    this.solverImprints = new Map(); // Store unique solver signatures
    
    // Animation state
    this.isRunning = false;
    this.lastFrame = 0;
    this.currentTime = 0;
    
    // Color configurations for Chrono-Tint Shift
    this.colorStages = {
      fresh: { r: 255, g: 215, b: 0 },    // Vibrant gold
      aged: { r: 138, g: 43, b: 226 },    // Purple transition
      ancient: { r: 25, g: 0, b: 51 }     // Deep violet-black
    };
    
    this.init();
  }
  
  init() {
    this.resizeCanvas();
    this.setupEventListeners();
    this.generateInitialEchoes();
  }
  
  resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
  }
  
  setupEventListeners() {
    window.addEventListener('resize', () => this.resizeCanvas());
    
    // Listen for decode events (can be triggered externally)
    document.addEventListener('chaoskey-decode-event', (event) => {
      this.addDecodeEvent(event.detail);
    });
  }
  
  generateInitialEchoes() {
    for (let i = 0; i < this.options.particleCount; i++) {
      this.echoes.push(this.createEcho());
    }
  }
  
  createEcho(x, y, age) {
    const width = this.canvas.width / window.devicePixelRatio;
    const height = this.canvas.height / window.devicePixelRatio;
    
    return {
      x: x || Math.random() * width,
      y: y || Math.random() * height,
      vx: (Math.random() - 0.5) * this.options.driftSpeed,
      vy: (Math.random() - 0.5) * this.options.driftSpeed,
      age: age || 0,
      maxAge: this.options.echoLifetime + Math.random() * 5000,
      size: 1 + Math.random() * 3,
      opacity: 0.1 + Math.random() * 0.3,
      pulseOffset: Math.random() * Math.PI * 2,
      type: 'echo'
    };
  }
  
  createDecodeTrail(x, y, solverSignature, glyphData) {
    const glyphShape = this.generateGlyphShape(glyphData);
    
    return {
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * this.options.driftSpeed * 0.3,
      vy: (Math.random() - 0.5) * this.options.driftSpeed * 0.3,
      age: 0,
      maxAge: this.options.echoLifetime * 2, // Trails last longer
      size: 2 + Math.random() * 2,
      opacity: this.options.spectralMode ? 0.8 : 0.1,
      solverSignature: solverSignature,
      glyphShape: glyphShape,
      trail: [],
      trailLength: 20,
      type: 'decode-trail'
    };
  }
  
  generateGlyphShape(glyphData) {
    // Generate unique glyph shape based on decode data
    const shapes = ['circle', 'triangle', 'diamond', 'cross', 'star', 'hexagon'];
    const hash = this.hashString(glyphData || 'default');
    return shapes[hash % shapes.length];
  }
  
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
  
  // Chrono-Tint Shift: Calculate color based on age
  getChronoTintColor(age, maxAge) {
    const ageRatio = Math.min(age / maxAge, 1);
    
    let color;
    if (ageRatio < 0.3) {
      // Fresh to aged transition
      const t = ageRatio / 0.3;
      color = this.interpolateColor(this.colorStages.fresh, this.colorStages.aged, t);
    } else {
      // Aged to ancient transition
      const t = (ageRatio - 0.3) / 0.7;
      color = this.interpolateColor(this.colorStages.aged, this.colorStages.ancient, t);
    }
    
    return color;
  }
  
  interpolateColor(color1, color2, t) {
    return {
      r: Math.round(color1.r + (color2.r - color1.r) * t),
      g: Math.round(color1.g + (color2.g - color1.g) * t),
      b: Math.round(color1.b + (color2.b - color1.b) * t)
    };
  }
  
  // Add decode event and create signature trail
  addDecodeEvent(eventData) {
    const { x, y, solverAddress, decodeData } = eventData;
    const width = this.canvas.width / window.devicePixelRatio;
    const height = this.canvas.height / window.devicePixelRatio;
    
    const eventX = x || Math.random() * width;
    const eventY = y || Math.random() * height;
    
    // Store solver imprint
    if (!this.solverImprints.has(solverAddress)) {
      this.solverImprints.set(solverAddress, {
        color: this.generateSolverColor(solverAddress),
        eventCount: 0
      });
    }
    this.solverImprints.get(solverAddress).eventCount++;
    
    // Create decode trail particles
    for (let i = 0; i < 5; i++) {
      const trail = this.createDecodeTrail(
        eventX + (Math.random() - 0.5) * 50,
        eventY + (Math.random() - 0.5) * 50,
        solverAddress,
        decodeData
      );
      this.echoes.push(trail);
    }
    
    // Create resonance echoes from the decode event
    for (let i = 0; i < 10; i++) {
      const echo = this.createEcho(
        eventX + (Math.random() - 0.5) * 100,
        eventY + (Math.random() - 0.5) * 100,
        0
      );
      this.echoes.push(echo);
    }
  }
  
  generateSolverColor(solverAddress) {
    const hash = this.hashString(solverAddress);
    const hue = (hash % 360);
    return `hsl(${hue}, 70%, 60%)`;
  }
  
  updateParticles(deltaTime) {
    const width = this.canvas.width / window.devicePixelRatio;
    const height = this.canvas.height / window.devicePixelRatio;
    
    this.echoes = this.echoes.filter(echo => {
      // Update age
      echo.age += deltaTime;
      
      // Remove expired echoes
      if (echo.age > echo.maxAge) {
        return false;
      }
      
      // Update position with Echo Resonance Drift
      echo.x += echo.vx;
      echo.y += echo.vy;
      
      // Boundary wrapping
      if (echo.x < 0) echo.x = width;
      if (echo.x > width) echo.x = 0;
      if (echo.y < 0) echo.y = height;
      if (echo.y > height) echo.y = 0;
      
      // Update trail for decode trails
      if (echo.type === 'decode-trail') {
        echo.trail.push({ x: echo.x, y: echo.y });
        if (echo.trail.length > echo.trailLength) {
          echo.trail.shift();
        }
      }
      
      return true;
    });
    
    // Maintain minimum particle count
    while (this.echoes.length < this.options.particleCount) {
      this.echoes.push(this.createEcho());
    }
  }
  
  render() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Render echoes
    this.echoes.forEach(echo => {
      this.renderEcho(echo);
    });
    
    // Render solver imprint overlay (if in spectral mode)
    if (this.options.spectralMode) {
      this.renderSolverImprints();
    }
  }
  
  renderEcho(echo) {
    const ageRatio = echo.age / echo.maxAge;
    const pulseValue = Math.sin(this.currentTime * 0.003 + echo.pulseOffset) * 0.3 + 0.7;
    
    this.ctx.save();
    
    if (echo.type === 'decode-trail') {
      this.renderDecodeTrail(echo, ageRatio, pulseValue);
    } else {
      this.renderStandardEcho(echo, ageRatio, pulseValue);
    }
    
    this.ctx.restore();
  }
  
  renderStandardEcho(echo, ageRatio, pulseValue) {
    // Chrono-Tint Shift color calculation
    const color = this.getChronoTintColor(echo.age, echo.maxAge);
    const opacity = echo.opacity * (1 - ageRatio) * pulseValue;
    
    this.ctx.globalAlpha = opacity;
    this.ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 1)`;
    
    // Render echo particle
    this.ctx.beginPath();
    this.ctx.arc(echo.x, echo.y, echo.size * pulseValue, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Add glow effect
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
    this.ctx.fill();
  }
  
  renderDecodeTrail(echo, ageRatio, pulseValue) {
    const solverData = this.solverImprints.get(echo.solverSignature);
    const baseOpacity = echo.opacity * (1 - ageRatio) * pulseValue;
    
    // Render trail
    if (echo.trail.length > 1) {
      this.ctx.globalAlpha = baseOpacity * 0.5;
      this.ctx.strokeStyle = solverData?.color || '#ffffff';
      this.ctx.lineWidth = 1;
      this.ctx.lineCap = 'round';
      
      this.ctx.beginPath();
      echo.trail.forEach((point, index) => {
        const trailOpacity = (index / echo.trail.length) * baseOpacity;
        this.ctx.globalAlpha = trailOpacity;
        
        if (index === 0) {
          this.ctx.moveTo(point.x, point.y);
        } else {
          this.ctx.lineTo(point.x, point.y);
        }
      });
      this.ctx.stroke();
    }
    
    // Render glyph shape
    this.ctx.globalAlpha = baseOpacity;
    this.ctx.fillStyle = solverData?.color || '#ffffff';
    this.renderGlyphShape(echo.x, echo.y, echo.glyphShape, echo.size * pulseValue);
  }
  
  renderGlyphShape(x, y, shape, size) {
    this.ctx.save();
    this.ctx.translate(x, y);
    
    switch (shape) {
      case 'circle':
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size, 0, Math.PI * 2);
        this.ctx.fill();
        break;
        
      case 'triangle':
        this.ctx.beginPath();
        this.ctx.moveTo(0, -size);
        this.ctx.lineTo(-size * 0.866, size * 0.5);
        this.ctx.lineTo(size * 0.866, size * 0.5);
        this.ctx.closePath();
        this.ctx.fill();
        break;
        
      case 'diamond':
        this.ctx.beginPath();
        this.ctx.moveTo(0, -size);
        this.ctx.lineTo(size, 0);
        this.ctx.lineTo(0, size);
        this.ctx.lineTo(-size, 0);
        this.ctx.closePath();
        this.ctx.fill();
        break;
        
      case 'cross':
        this.ctx.lineWidth = size * 0.3;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(-size, 0);
        this.ctx.lineTo(size, 0);
        this.ctx.moveTo(0, -size);
        this.ctx.lineTo(0, size);
        this.ctx.stroke();
        break;
        
      case 'star':
        this.ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
          const outerRadius = size;
          const innerRadius = size * 0.4;
          
          const outerX = Math.cos(angle) * outerRadius;
          const outerY = Math.sin(angle) * outerRadius;
          const innerAngle = angle + Math.PI / 5;
          const innerX = Math.cos(innerAngle) * innerRadius;
          const innerY = Math.sin(innerAngle) * innerRadius;
          
          if (i === 0) {
            this.ctx.moveTo(outerX, outerY);
          } else {
            this.ctx.lineTo(outerX, outerY);
          }
          this.ctx.lineTo(innerX, innerY);
        }
        this.ctx.closePath();
        this.ctx.fill();
        break;
        
      case 'hexagon':
        this.ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI * 2) / 6;
          const x = Math.cos(angle) * size;
          const y = Math.sin(angle) * size;
          if (i === 0) {
            this.ctx.moveTo(x, y);
          } else {
            this.ctx.lineTo(x, y);
          }
        }
        this.ctx.closePath();
        this.ctx.fill();
        break;
    }
    
    this.ctx.restore();
  }
  
  renderSolverImprints() {
    this.ctx.save();
    this.ctx.globalAlpha = 0.8;
    this.ctx.font = '12px monospace';
    
    let y = 20;
    this.solverImprints.forEach((data, address) => {
      this.ctx.fillStyle = data.color;
      this.ctx.fillText(`${address.substring(0, 8)}... (${data.eventCount} events)`, 10, y);
      y += 20;
    });
    
    this.ctx.restore();
  }
  
  animate(timestamp) {
    if (!this.isRunning) return;
    
    const deltaTime = timestamp - this.lastFrame;
    this.currentTime = timestamp;
    this.lastFrame = timestamp;
    
    this.updateParticles(deltaTime);
    this.render();
    
    requestAnimationFrame((t) => this.animate(t));
  }
  
  start() {
    this.isRunning = true;
    this.lastFrame = performance.now();
    requestAnimationFrame((t) => this.animate(t));
  }
  
  stop() {
    this.isRunning = false;
  }
  
  toggleSpectralMode() {
    this.options.spectralMode = !this.options.spectralMode;
    
    // Update decode trail visibility
    this.echoes.forEach(echo => {
      if (echo.type === 'decode-trail') {
        echo.opacity = this.options.spectralMode ? 0.8 : 0.1;
      }
    });
  }
  
  // Public API for triggering decode events
  triggerDecodeEvent(x, y, solverAddress, decodeData) {
    const event = new CustomEvent('chaoskey-decode-event', {
      detail: { x, y, solverAddress, decodeData }
    });
    document.dispatchEvent(event);
  }
  
  // Simulate historical decode events (for demonstration)
  simulateHistoricalEvents() {
    const sampleAddresses = [
      '0x1234567890abcdef1234567890abcdef12345678',
      '0xabcdef1234567890abcdef1234567890abcdef12',
      '0x567890abcdef1234567890abcdef1234567890ab'
    ];
    
    const sampleDecodes = [
      'QUANTUM_KEY_ALPHA',
      'TEMPORAL_SIGNATURE_BETA',
      'CHAOS_RESONANCE_GAMMA'
    ];
    
    // Add some historical events with different ages
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        this.addDecodeEvent({
          x: Math.random() * (this.canvas.width / window.devicePixelRatio),
          y: Math.random() * (this.canvas.height / window.devicePixelRatio),
          solverAddress: sampleAddresses[Math.floor(Math.random() * sampleAddresses.length)],
          decodeData: sampleDecodes[Math.floor(Math.random() * sampleDecodes.length)]
        });
      }, i * 1000);
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TemporalEchoLayer;
} else {
  window.TemporalEchoLayer = TemporalEchoLayer;
}