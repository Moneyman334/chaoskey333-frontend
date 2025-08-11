/**
 * Temporal Echo Layer with Chrono-Tint Shift and Decode Signature Trails
 * Integration with Permanent Relic Evolution System
 */

class TemporalEchoSystem {
  constructor() {
    this.currentEvolutionStage = 0;
    this.maxEvolutionStages = 5;
    this.glyphTrails = [];
    this.solverHistory = new Map();
    this.chronoTintPhase = 0;
    this.isInitialized = false;
    
    // Evolution stage names corresponding to chrono-tint phases
    this.evolutionStages = [
      'Origin Spark',
      'Golden Resonance', 
      'Violet Transformation',
      'Shadow Convergence',
      'Eternal Synthesis'
    ];
    
    this.init();
  }
  
  init() {
    if (this.isInitialized) return;
    
    this.createTemporalEchoLayer();
    this.createEvolutionTimeline();
    this.createGlyphSignatureLock();
    this.startChronoTintCycle();
    this.bindEventListeners();
    
    this.isInitialized = true;
    console.log('🌀 Temporal Echo System initialized');
  }
  
  createTemporalEchoLayer() {
    const echoLayer = document.createElement('div');
    echoLayer.className = 'temporal-echo-layer';
    echoLayer.id = 'temporal-echo-layer';
    document.body.appendChild(echoLayer);
  }
  
  createEvolutionTimeline() {
    const timeline = document.createElement('div');
    timeline.className = 'relic-evolution-timeline';
    timeline.id = 'relic-evolution-timeline';
    
    for (let i = 0; i < this.maxEvolutionStages; i++) {
      const stage = document.createElement('div');
      stage.className = 'evolution-stage';
      stage.dataset.stage = i;
      stage.title = this.evolutionStages[i];
      
      if (i < this.currentEvolutionStage) {
        stage.classList.add('completed');
      } else if (i === this.currentEvolutionStage) {
        stage.classList.add('active');
      }
      
      timeline.appendChild(stage);
    }
    
    document.body.appendChild(timeline);
  }
  
  createGlyphSignatureLock() {
    const signatureLock = document.createElement('div');
    signatureLock.className = 'glyph-signature-lock';
    signatureLock.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 5px;">Solver DNA Log</div>
      <div class="signature-trail-history" id="signature-trail-history">
        <div style="color: #888;">Awaiting solver interactions...</div>
      </div>
    `;
    document.body.appendChild(signatureLock);
  }
  
  startChronoTintCycle() {
    // Sync chrono-tint with evolution stages
    setInterval(() => {
      this.chronoTintPhase = (this.chronoTintPhase + 1) % 4;
      this.updateChronoTintAlignment();
    }, 8000); // 8 seconds per full cycle
  }
  
  updateChronoTintAlignment() {
    const echoLayer = document.getElementById('temporal-echo-layer');
    if (!echoLayer) return;
    
    // Align tint phase with evolution stage
    const alignedPhase = Math.floor((this.currentEvolutionStage / this.maxEvolutionStages) * 4);
    echoLayer.style.animationDelay = `-${alignedPhase * 2}s`;
  }
  
  triggerRelicMutation() {
    if (this.currentEvolutionStage >= this.maxEvolutionStages - 1) {
      console.log('🔮 Relic has reached maximum evolution');
      return;
    }
    
    // Create mutation event overlay
    const mutationOverlay = document.createElement('div');
    mutationOverlay.className = 'mutation-event-overlay';
    document.body.appendChild(mutationOverlay);
    
    // Advance evolution stage
    this.currentEvolutionStage++;
    this.updateEvolutionTimeline();
    this.lockCurrentGlyphTrails();
    
    // Remove overlay after animation
    setTimeout(() => {
      mutationOverlay.remove();
    }, 1000);
    
    // Update chrono-tint alignment
    this.updateChronoTintAlignment();
    
    console.log(`🧬 Relic evolved to stage: ${this.evolutionStages[this.currentEvolutionStage]}`);
    
    // Trigger visual effects
    this.createMutationGlyphBurst();
  }
  
  updateEvolutionTimeline() {
    const stages = document.querySelectorAll('.evolution-stage');
    stages.forEach((stage, index) => {
      stage.classList.remove('active', 'completed');
      
      if (index < this.currentEvolutionStage) {
        stage.classList.add('completed');
      } else if (index === this.currentEvolutionStage) {
        stage.classList.add('active');
      }
    });
  }
  
  createGlyphTrail(x, y, solverAddress = null) {
    const glyphs = ['⧫', '◊', '◈', '◇', '⬟', '⬢', '⬡', '⬠', '◦', '●'];
    const glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
    
    const glyphElement = document.createElement('div');
    glyphElement.className = 'glyph-trail';
    glyphElement.textContent = glyph;
    glyphElement.style.left = x + 'px';
    glyphElement.style.top = y + 'px';
    
    // Assign color based on solver or random
    const colors = ['#00ffff', '#ff00ff', '#ffff00', '#00ff00', '#ff6600'];
    const color = solverAddress ? 
      colors[this.getColorIndexForSolver(solverAddress)] : 
      colors[Math.floor(Math.random() * colors.length)];
    
    glyphElement.style.color = color;
    glyphElement.style.textShadow = `0 0 10px ${color}`;
    
    document.body.appendChild(glyphElement);
    
    // Store trail data
    const trailData = {
      glyph,
      x,
      y,
      color,
      timestamp: Date.now(),
      solverAddress,
      evolutionStage: this.currentEvolutionStage,
      locked: false
    };
    
    this.glyphTrails.push(trailData);
    
    // Record in solver history
    if (solverAddress) {
      this.recordSolverInteraction(solverAddress, trailData);
    }
    
    // Remove after animation
    setTimeout(() => {
      glyphElement.remove();
    }, 3000);
  }
  
  getColorIndexForSolver(solverAddress) {
    // Generate consistent color index for solver address
    let hash = 0;
    for (let i = 0; i < solverAddress.length; i++) {
      const char = solverAddress.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash) % 5;
  }
  
  recordSolverInteraction(solverAddress, trailData) {
    if (!this.solverHistory.has(solverAddress)) {
      this.solverHistory.set(solverAddress, []);
    }
    
    this.solverHistory.get(solverAddress).push(trailData);
    this.updateSignatureDisplay();
  }
  
  updateSignatureDisplay() {
    const historyElement = document.getElementById('signature-trail-history');
    if (!historyElement) return;
    
    let displayHtml = '';
    let entryCount = 0;
    const maxEntries = 5;
    
    // Show recent solver interactions
    for (const [address, trails] of this.solverHistory) {
      if (entryCount >= maxEntries) break;
      
      const recent = trails.slice(-1)[0];
      const shortAddress = address.substring(0, 6) + '...';
      const lockIcon = recent.locked ? '🔒' : '🔓';
      
      displayHtml += `
        <div style="margin: 2px 0; font-size: 10px;">
          ${lockIcon} ${shortAddress}: ${recent.glyph}
          <span style="color: #888;">S${recent.evolutionStage}</span>
        </div>
      `;
      entryCount++;
    }
    
    if (displayHtml === '') {
      displayHtml = '<div style="color: #888;">Awaiting solver interactions...</div>';
    }
    
    historyElement.innerHTML = displayHtml;
  }
  
  lockCurrentGlyphTrails() {
    // Lock all current glyph trails to the timeline
    this.glyphTrails.forEach(trail => {
      if (trail.evolutionStage === this.currentEvolutionStage - 1) {
        trail.locked = true;
      }
    });
    
    this.updateSignatureDisplay();
    console.log(`🔒 Locked ${this.glyphTrails.filter(t => t.locked).length} glyph trails to timeline`);
  }
  
  createMutationGlyphBurst() {
    // Create burst of glyphs during mutation event
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 100 + Math.random() * 200;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        this.createGlyphTrail(x, y);
      }, i * 100);
    }
  }
  
  bindEventListeners() {
    // Trigger glyph trails on mouse movement
    document.addEventListener('mousemove', (e) => {
      if (Math.random() < 0.1) { // 10% chance per mouse move
        this.createGlyphTrail(e.clientX, e.clientY, userWalletAddress);
      }
    });
    
    // Trigger mutation on specific events
    document.addEventListener('relicMinted', () => {
      setTimeout(() => this.triggerRelicMutation(), 1000);
    });
    
    // Manual mutation trigger for testing
    document.addEventListener('keydown', (e) => {
      if (e.code === 'KeyM' && e.ctrlKey) {
        e.preventDefault();
        this.triggerRelicMutation();
      }
    });
  }
  
  // Public API methods
  getEvolutionStage() {
    return {
      current: this.currentEvolutionStage,
      name: this.evolutionStages[this.currentEvolutionStage],
      progress: (this.currentEvolutionStage / (this.maxEvolutionStages - 1)) * 100
    };
  }
  
  getSolverHistory() {
    return Array.from(this.solverHistory.entries()).map(([address, trails]) => ({
      address,
      trailCount: trails.length,
      lockedTrails: trails.filter(t => t.locked).length,
      lastInteraction: trails[trails.length - 1]?.timestamp
    }));
  }
  
  exportTimelineState() {
    return {
      evolutionStage: this.currentEvolutionStage,
      chronoTintPhase: this.chronoTintPhase,
      glyphTrails: this.glyphTrails.filter(t => t.locked),
      solverHistory: Object.fromEntries(this.solverHistory)
    };
  }
}

// Initialize system when page loads
let temporalEchoSystem;

document.addEventListener('DOMContentLoaded', () => {
  temporalEchoSystem = new TemporalEchoSystem();
});

// Make system globally accessible
window.TemporalEchoSystem = TemporalEchoSystem;
window.temporalEchoSystem = temporalEchoSystem;