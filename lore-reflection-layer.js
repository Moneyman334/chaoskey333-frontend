// PR #27 - Dynamic Lore Reflection Layer
// Mirrors vault lore in real time with visual shimmer effects

class LoreReflectionLayer {
  constructor() {
    this.isActive = false;
    this.loreFragments = [
      "The vault awakens... whispers echo through dimensions",
      "Fractal patterns emerge from the digital ether",
      "Ancient code fragments dance in the spectral void",
      "Relic consciousness begins to stir...",
      "Quantum signatures detected in the blockchain",
      "Decoder synchronization: 73.2% and rising",
      "Myth fragments coalesce into tangible reality",
      "The Omni-Singularity Blueprint unfolds..."
    ];
    this.currentFragment = 0;
    this.shimmerInterval = null;
    this.reflectionPanel = null;
    this.glyphCanvas = null;
    this.spectralHUD = null;
  }

  initialize() {
    console.log("🌟 Initializing Dynamic Lore Reflection Layer...");
    this.createReflectionPanel();
    this.createGlyphCanvas();
    this.createSpectralHUD();
    return this;
  }

  createReflectionPanel() {
    // Create the lore reflection panel
    this.reflectionPanel = document.createElement('div');
    this.reflectionPanel.id = 'lore-reflection-panel';
    this.reflectionPanel.className = 'lore-panel';
    this.reflectionPanel.innerHTML = `
      <div class="lore-header">📜 VAULT LORE REFLECTION</div>
      <div class="lore-content" id="lore-content">
        Initializing lore matrices...
      </div>
      <div class="lore-shimmer-overlay"></div>
    `;
    
    // Position and style the panel
    this.reflectionPanel.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 300px;
      min-height: 150px;
      background: linear-gradient(135deg, rgba(0,255,255,0.1), rgba(255,0,255,0.1));
      border: 2px solid #00ffff;
      border-radius: 10px;
      padding: 15px;
      font-family: 'Orbitron', monospace;
      color: #00ffff;
      backdrop-filter: blur(5px);
      z-index: 1000;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.8s ease-out;
    `;

    document.body.appendChild(this.reflectionPanel);
  }

  createGlyphCanvas() {
    // Create canvas for shifting glyph fractals
    this.glyphCanvas = document.createElement('canvas');
    this.glyphCanvas.id = 'glyph-fractal-canvas';
    this.glyphCanvas.width = 280;
    this.glyphCanvas.height = 100;
    this.glyphCanvas.style.cssText = `
      position: absolute;
      top: 40px;
      left: 10px;
      opacity: 0.6;
      mix-blend-mode: screen;
      pointer-events: none;
    `;
    
    this.reflectionPanel.appendChild(this.glyphCanvas);
    this.initializeGlyphAnimation();
  }

  createSpectralHUD() {
    // Create Spectral Decode HUD
    this.spectralHUD = document.createElement('div');
    this.spectralHUD.id = 'spectral-decode-hud';
    this.spectralHUD.innerHTML = `
      <div class="hud-line">
        <span class="hud-label">DECODE STATUS:</span>
        <span class="hud-value" id="decode-status">SCANNING...</span>
      </div>
      <div class="hud-line">
        <span class="hud-label">COORDINATES:</span>
        <span class="hud-value" id="coordinates">∞.∞.∞</span>
      </div>
      <div class="hud-line">
        <span class="hud-label">MYTH SYNC:</span>
        <span class="hud-value" id="myth-sync">0%</span>
      </div>
    `;
    
    this.spectralHUD.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      width: 250px;
      background: rgba(0,0,0,0.8);
      border: 1px solid #ffaa00;
      border-radius: 5px;
      padding: 10px;
      font-family: 'Courier New', monospace;
      font-size: 11px;
      color: #ffaa00;
      opacity: 0;
      transform: translateY(100%);
      transition: all 0.8s ease-out;
    `;

    document.body.appendChild(this.spectralHUD);
  }

  initializeGlyphAnimation() {
    const ctx = this.glyphCanvas.getContext('2d');
    const glyphs = ['⚡', '🔮', '🌀', '⭐', '🔱', '🎭', '🔥', '⚔️', '🌙', '💎'];
    let frame = 0;

    const animate = () => {
      if (!this.isActive) return;
      
      ctx.clearRect(0, 0, this.glyphCanvas.width, this.glyphCanvas.height);
      
      // Create fractal glyph pattern
      for (let i = 0; i < 12; i++) {
        const x = (Math.sin(frame * 0.02 + i) * 50) + 140;
        const y = (Math.cos(frame * 0.03 + i * 0.5) * 20) + 50;
        const glyph = glyphs[(frame + i) % glyphs.length];
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(frame * 0.01 + i);
        ctx.fillStyle = `hsla(${(frame + i * 30) % 360}, 70%, 60%, 0.7)`;
        ctx.font = '16px serif';
        ctx.textAlign = 'center';
        ctx.fillText(glyph, 0, 0);
        ctx.restore();
      }
      
      frame++;
      requestAnimationFrame(animate);
    };

    animate();
  }

  activate() {
    console.log("🌟 Activating Lore Reflection Layer...");
    this.isActive = true;

    // Slide in panels
    setTimeout(() => {
      this.reflectionPanel.style.opacity = '1';
      this.reflectionPanel.style.transform = 'translateX(0)';
    }, 200);

    setTimeout(() => {
      this.spectralHUD.style.opacity = '1';
      this.spectralHUD.style.transform = 'translateY(0)';
    }, 600);

    // Start lore reflection updates
    this.startLoreReflection();
    this.startShimmerEffect();
    this.startSpectralUpdates();

    return this;
  }

  startLoreReflection() {
    const loreContent = document.getElementById('lore-content');
    
    const updateLore = () => {
      if (!this.isActive) return;
      
      const fragment = this.loreFragments[this.currentFragment];
      loreContent.innerHTML = `<div class="lore-text">${fragment}</div>`;
      
      // Add ripple effect
      loreContent.style.animation = 'loreRipple 2s ease-out';
      
      setTimeout(() => {
        loreContent.style.animation = '';
      }, 2000);
      
      this.currentFragment = (this.currentFragment + 1) % this.loreFragments.length;
    };

    updateLore();
    setInterval(updateLore, 4000);
  }

  startShimmerEffect() {
    const shimmerOverlay = this.reflectionPanel.querySelector('.lore-shimmer-overlay');
    shimmerOverlay.style.cssText = `
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
      animation: shimmerPass 3s infinite;
      pointer-events: none;
    `;
  }

  startSpectralUpdates() {
    let decodeProgress = 0;
    let mythSync = 0;
    
    const updateHUD = () => {
      if (!this.isActive) return;
      
      decodeProgress += Math.random() * 10;
      mythSync += Math.random() * 5;
      
      if (decodeProgress > 100) decodeProgress = 0;
      if (mythSync > 100) mythSync = 0;
      
      document.getElementById('decode-status').textContent = 
        decodeProgress < 30 ? 'SCANNING...' :
        decodeProgress < 70 ? 'DECODING...' : 'SYNCHRONIZED';
      
      document.getElementById('coordinates').textContent = 
        `${(Math.random() * 999).toFixed(0)}.${(Math.random() * 999).toFixed(0)}.${(Math.random() * 999).toFixed(0)}`;
      
      document.getElementById('myth-sync').textContent = `${mythSync.toFixed(1)}%`;
    };

    setInterval(updateHUD, 1500);
  }

  deactivate() {
    this.isActive = false;
    this.reflectionPanel.style.opacity = '0';
    this.reflectionPanel.style.transform = 'translateX(100%)';
    this.spectralHUD.style.opacity = '0';
    this.spectralHUD.style.transform = 'translateY(100%)';
  }
}

// CSS for lore reflection animations
const loreReflectionCSS = `
  .lore-panel .lore-header {
    font-size: 12px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 10px;
    color: #00ffff;
    text-shadow: 0 0 10px #00ffff;
  }

  .lore-text {
    font-size: 14px;
    line-height: 1.4;
    text-align: center;
    margin: 10px 0;
    color: #ffffff;
    text-shadow: 0 0 5px #00ffff;
  }

  .hud-line {
    margin: 5px 0;
    display: flex;
    justify-content: space-between;
  }

  .hud-label {
    color: #ffaa00;
  }

  .hud-value {
    color: #00ff00;
    font-weight: bold;
  }

  @keyframes shimmerPass {
    0% { left: -100%; }
    100% { left: 100%; }
  }

  @keyframes loreRipple {
    0% { transform: scale(1); filter: brightness(1); }
    50% { transform: scale(1.05); filter: brightness(1.5); }
    100% { transform: scale(1); filter: brightness(1); }
  }
`;

// Inject CSS
const loreReflectionStyle = document.createElement('style');
loreReflectionStyle.textContent = loreReflectionCSS;
document.head.appendChild(loreReflectionStyle);

// Export for use in main script
window.LoreReflectionLayer = LoreReflectionLayer;