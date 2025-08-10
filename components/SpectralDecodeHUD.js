// Spectral Decode HUD Component
class SpectralDecodeHUD {
  constructor() {
    this.isVisible = false;
    this.glyphs = [];
    this.whispers = [];
    this.alignments = [];
    this.decodeProgress = 0;
    this.isDecodeComplete = false;
    this.hudElement = null;
    this.init();
  }

  init() {
    this.createHUDElement();
    this.setupKeyboardToggle();
    this.generateMockData();
  }

  createHUDElement() {
    // Create HUD overlay
    this.hudElement = document.createElement('div');
    this.hudElement.id = 'spectral-decode-hud';
    this.hudElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.85);
      color: #00ff88;
      font-family: 'Courier New', monospace;
      z-index: 10000;
      display: none;
      overflow: auto;
      backdrop-filter: blur(2px);
    `;

    // Create HUD content
    const hudContent = document.createElement('div');
    hudContent.style.cssText = `
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    `;

    hudContent.innerHTML = `
      <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 20px;">
        <h2 style="color: #00ff88; margin: 0; text-shadow: 0 0 10px #00ff88;">
          ⚡ SPECTRAL DECODE HUD ⚡
        </h2>
        <div style="color: #ffaa00; font-size: 14px;">
          Press 'H' to toggle | ESC to close
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
        <div id="glyph-section">
          <h3 style="color: #ff6600; border-bottom: 1px solid #ff6600; padding-bottom: 5px;">
            GLYPHS DETECTED
          </h3>
          <div id="glyph-container" style="min-height: 200px; background: rgba(255, 102, 0, 0.1); padding: 10px; border-radius: 5px;">
            <!-- Glyphs will be populated here -->
          </div>
        </div>
        
        <div id="whisper-section">
          <h3 style="color: #8800ff; border-bottom: 1px solid #8800ff; padding-bottom: 5px;">
            WHISPERS CAPTURED
          </h3>
          <div id="whisper-container" style="min-height: 200px; background: rgba(136, 0, 255, 0.1); padding: 10px; border-radius: 5px;">
            <!-- Whispers will be populated here -->
          </div>
        </div>
      </div>
      
      <div id="alignment-section" style="margin-bottom: 20px;">
        <h3 style="color: #00ffff; border-bottom: 1px solid #00ffff; padding-bottom: 5px;">
          GLYPH ↔ WHISPER ALIGNMENTS
        </h3>
        <div id="alignment-container" style="background: rgba(0, 255, 255, 0.1); padding: 10px; border-radius: 5px; min-height: 150px;">
          <!-- Alignments will be populated here -->
        </div>
      </div>
      
      <div id="decode-progress-section">
        <h3 style="color: #ffff00; border-bottom: 1px solid #ffff00; padding-bottom: 5px;">
          DECODE PROGRESS
        </h3>
        <div id="progress-container" style="background: rgba(255, 255, 0, 0.1); padding: 10px; border-radius: 5px;">
          <div id="progress-bar-container" style="background: rgba(0,0,0,0.5); height: 20px; border-radius: 10px; margin-bottom: 10px;">
            <div id="progress-bar" style="height: 100%; background: linear-gradient(90deg, #00ff88, #ffff00); border-radius: 10px; width: 0%; transition: width 0.3s ease;"></div>
          </div>
          <div id="progress-text" style="text-align: center; font-weight: bold;">0% DECODED</div>
          <div id="decode-status" style="text-align: center; margin-top: 10px; font-size: 18px; color: #ffaa00;">
            SCANNING FOR PATTERNS...
          </div>
        </div>
      </div>
    `;

    this.hudElement.appendChild(hudContent);
    document.body.appendChild(this.hudElement);
  }

  setupKeyboardToggle() {
    document.addEventListener('keydown', (event) => {
      if (event.key.toLowerCase() === 'h' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        this.toggle();
      } else if (event.key === 'Escape' && this.isVisible) {
        event.preventDefault();
        this.hide();
      }
    });
  }

  generateMockData() {
    // Generate sample glyphs
    this.glyphs = [
      { id: 1, symbol: '◊', frequency: 0.85, energy: 'HIGH' },
      { id: 2, symbol: '▲', frequency: 0.72, energy: 'MEDIUM' },
      { id: 3, symbol: '●', frequency: 0.91, energy: 'CRITICAL' },
      { id: 4, symbol: '◆', frequency: 0.63, energy: 'LOW' },
      { id: 5, symbol: '▼', frequency: 0.78, energy: 'MEDIUM' }
    ];

    // Generate sample whispers
    this.whispers = [
      { id: 1, message: 'ancient.protocols.awakening', strength: 0.89 },
      { id: 2, message: 'vault.resonance.detected', strength: 0.76 },
      { id: 3, message: 'evolution.sequence.active', strength: 0.94 },
      { id: 4, message: 'relic.consciousness.emerging', strength: 0.67 },
      { id: 5, message: 'chaos.key.synchronizing', strength: 0.83 }
    ];

    // Generate alignments
    this.generateAlignments();
  }

  generateAlignments() {
    this.alignments = [];
    const numAlignments = Math.min(this.glyphs.length, this.whispers.length);
    
    for (let i = 0; i < numAlignments; i++) {
      const glyph = this.glyphs[i];
      const whisper = this.whispers[i];
      const coherence = (glyph.frequency + whisper.strength) / 2;
      
      this.alignments.push({
        glyphId: glyph.id,
        whisperId: whisper.id,
        coherence: coherence,
        status: coherence > 0.8 ? 'LOCKED' : coherence > 0.6 ? 'SYNCING' : 'UNSTABLE'
      });
    }
  }

  updateHUDContent() {
    if (!this.isVisible) return;

    // Update glyphs
    const glyphContainer = document.getElementById('glyph-container');
    glyphContainer.innerHTML = this.glyphs.map(glyph => `
      <div style="margin-bottom: 8px; padding: 5px; background: rgba(255,255,255,0.05); border-radius: 3px;">
        <span style="font-size: 20px; margin-right: 10px;">${glyph.symbol}</span>
        <span style="color: #ffaa00;">Freq: ${(glyph.frequency * 100).toFixed(1)}%</span>
        <span style="margin-left: 10px; color: ${glyph.energy === 'CRITICAL' ? '#ff0000' : glyph.energy === 'HIGH' ? '#ff6600' : glyph.energy === 'MEDIUM' ? '#ffaa00' : '#00ff88'};">
          ${glyph.energy}
        </span>
      </div>
    `).join('');

    // Update whispers
    const whisperContainer = document.getElementById('whisper-container');
    whisperContainer.innerHTML = this.whispers.map(whisper => `
      <div style="margin-bottom: 8px; padding: 5px; background: rgba(255,255,255,0.05); border-radius: 3px;">
        <div style="color: #8800ff; font-weight: bold;">${whisper.message}</div>
        <div style="color: #ffaa00; font-size: 12px;">Strength: ${(whisper.strength * 100).toFixed(1)}%</div>
      </div>
    `).join('');

    // Update alignments
    const alignmentContainer = document.getElementById('alignment-container');
    alignmentContainer.innerHTML = this.alignments.map(alignment => {
      const glyph = this.glyphs.find(g => g.id === alignment.glyphId);
      const whisper = this.whispers.find(w => w.id === alignment.whisperId);
      const statusColor = alignment.status === 'LOCKED' ? '#00ff88' : alignment.status === 'SYNCING' ? '#ffaa00' : '#ff6600';
      
      return `
        <div style="margin-bottom: 8px; padding: 8px; background: rgba(255,255,255,0.05); border-radius: 3px; display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 16px;">${glyph.symbol}</span>
          <span style="color: ${statusColor}; font-weight: bold;">↔</span>
          <span style="color: #8800ff; flex: 1; margin-left: 10px; font-size: 12px;">${whisper.message}</span>
          <span style="color: ${statusColor}; font-weight: bold; margin-left: 10px;">${alignment.status}</span>
          <span style="color: #00ffff; margin-left: 10px;">${(alignment.coherence * 100).toFixed(1)}%</span>
        </div>
      `;
    }).join('');

    // Update progress
    this.updateDecodeProgress();
  }

  updateDecodeProgress() {
    const lockedAlignments = this.alignments.filter(a => a.status === 'LOCKED').length;
    this.decodeProgress = this.alignments.length > 0 ? (lockedAlignments / this.alignments.length) : 0;
    
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const decodeStatus = document.getElementById('decode-status');
    
    if (progressBar) {
      progressBar.style.width = `${this.decodeProgress * 100}%`;
    }
    
    if (progressText) {
      progressText.textContent = `${(this.decodeProgress * 100).toFixed(1)}% DECODED`;
    }
    
    if (decodeStatus) {
      if (this.decodeProgress >= 1.0) {
        decodeStatus.innerHTML = '🎯 <span style="color: #00ff88; text-shadow: 0 0 10px #00ff88;">DECODE COMPLETE</span> 🎯';
        this.onDecodeComplete();
      } else if (this.decodeProgress >= 0.8) {
        decodeStatus.textContent = 'FINAL SEQUENCE RESOLVING...';
      } else if (this.decodeProgress >= 0.5) {
        decodeStatus.textContent = 'PATTERN CONVERGENCE DETECTED...';
      } else {
        decodeStatus.textContent = 'SCANNING FOR PATTERNS...';
      }
    }
  }

  onDecodeComplete() {
    if (!this.isDecodeComplete) {
      this.isDecodeComplete = true;
      console.log('🎯 Spectral Decode Complete - Triggering Evolution...');
      
      // Trigger evolution after a short delay
      setTimeout(() => {
        this.triggerEvolution();
      }, 2000);
    }
  }

  async triggerEvolution() {
    try {
      // Show toast notification
      if (window.ToastPop) {
        window.ToastPop.show('Decode Complete → Evolution Live', 'EVOLUTION');
      }
      
      // Call evolution API endpoint
      const response = await fetch('/api/evolution/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer demo-admin-token-123` // Use the demo token for now
        },
        body: JSON.stringify({
          walletAddress: window.userWalletAddress || userWalletAddress,
          decodeData: {
            glyphs: this.glyphs,
            whispers: this.whispers,
            alignments: this.alignments,
            progress: this.decodeProgress
          }
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Evolution triggered:', result);
      } else {
        console.error('❌ Evolution trigger failed:', response.statusText);
      }
    } catch (error) {
      console.error('❌ Error triggering evolution:', error);
    }
  }

  show() {
    this.isVisible = true;
    this.hudElement.style.display = 'block';
    this.updateHUDContent();
    
    // Simulate progressive scanning
    this.simulateDecodeProgress();
  }

  hide() {
    this.isVisible = false;
    this.hudElement.style.display = 'none';
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  simulateDecodeProgress() {
    // Simulate gradual alignment locking for demo purposes
    let currentAlignment = 0;
    const intervalId = setInterval(() => {
      if (currentAlignment < this.alignments.length && this.isVisible) {
        // Randomly improve alignment status
        const alignment = this.alignments[currentAlignment];
        if (alignment.status === 'UNSTABLE') {
          alignment.status = 'SYNCING';
          alignment.coherence = Math.min(0.75, alignment.coherence + 0.1);
        } else if (alignment.status === 'SYNCING') {
          alignment.status = 'LOCKED';
          alignment.coherence = Math.min(1.0, alignment.coherence + 0.15);
        }
        
        this.updateHUDContent();
        currentAlignment++;
      } else {
        clearInterval(intervalId);
      }
    }, 1500);
  }

  // Public method to manually trigger decode completion for testing
  forceDecodeComplete() {
    this.alignments.forEach(alignment => {
      alignment.status = 'LOCKED';
      alignment.coherence = 1.0;
    });
    this.updateHUDContent();
  }
}

// Initialize the HUD when the script loads
window.SpectralDecodeHUD = SpectralDecodeHUD;

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.spectralHUD = new SpectralDecodeHUD();
  });
} else {
  window.spectralHUD = new SpectralDecodeHUD();
}