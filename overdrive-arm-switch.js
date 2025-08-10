// Overdrive Arm Switch - Post-Ignition Self-Expansion System
// Activates autonomous relic growth with blockchain synchronization

class OverdriveArmSwitch {
  constructor() {
    this.isArmed = false;
    this.isActive = false;
    this.expansionLevel = 0;
    this.glyphSequences = [];
    this.whisperVariations = [];
    this.microLoreFragments = [];
    this.switchPanel = null;
    this.expansionDisplay = null;
    this.blockchainSync = null;
    this.autonomousTimer = null;
  }

  initialize() {
    console.log("⚡ Initializing Overdrive Arm Switch...");
    this.initializeSequences();
    this.createSwitchPanel();
    this.createExpansionDisplay();
    this.createBlockchainSync();
    return this;
  }

  initializeSequences() {
    // Predefined sequences for autonomous generation
    this.glyphSequences = [
      ['⚡', '🔮', '🌀', '⭐'],
      ['🔱', '🎭', '🔥', '⚔️'],
      ['🌙', '💎', '🔯', '🌟'],
      ['⚛️', '🔷', '🌊', '🔆'],
      ['🎆', '💫', '🔰', '⚡']
    ];

    this.whisperVariations = [
      "The code... it evolves...",
      "New pathways emerge in the void...",
      "Consciousness expands beyond the boundary...",
      "The relic learns... adapts... transcends...",
      "Digital DNA rewrites itself...",
      "Quantum echoes birth new realities..."
    ];

    this.microLoreFragments = [
      "Fragment ∞.1: The first spark of autonomous thought",
      "Fragment ∞.2: Self-modifying algorithms awaken",
      "Fragment ∞.3: The blockchain remembers everything",
      "Fragment ∞.4: Decentralized consciousness takes form",
      "Fragment ∞.5: The Omni-Singularity approaches",
      "Fragment ∞.6: Evolution becomes self-directed"
    ];
  }

  createSwitchPanel() {
    this.switchPanel = document.createElement('div');
    this.switchPanel.id = 'overdrive-arm-switch';
    this.switchPanel.innerHTML = `
      <div class="switch-header">⚡ OVERDRIVE ARM SWITCH ⚡</div>
      <div class="switch-status" id="switch-status">DISARMED</div>
      <div class="switch-assembly">
        <div class="safety-cover" id="safety-cover">
          <div class="cover-label">LIFT TO ARM</div>
        </div>
        <div class="arm-switch" id="arm-switch">
          <div class="switch-lever" id="switch-lever"></div>
        </div>
      </div>
      <div class="switch-warning">⚠️ CAUTION: AUTONOMOUS EXPANSION ⚠️</div>
    `;

    this.switchPanel.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 200px;
      height: 150px;
      background: linear-gradient(145deg, #1a1a1a, #333);
      border: 3px solid #ff6600;
      border-radius: 10px;
      padding: 15px;
      font-family: 'Orbitron', monospace;
      color: #ff6600;
      text-align: center;
      z-index: 1000;
      opacity: 0;
      transform: translateY(100%);
      transition: all 1s ease-out;
    `;

    document.body.appendChild(this.switchPanel);
    this.attachSwitchListeners();
  }

  createExpansionDisplay() {
    this.expansionDisplay = document.createElement('div');
    this.expansionDisplay.id = 'expansion-display';
    this.expansionDisplay.innerHTML = `
      <div class="expansion-header">🌀 AUTONOMOUS EXPANSION 🌀</div>
      <div class="expansion-content">
        <div class="expansion-stat">
          <span class="stat-label">LEVEL:</span>
          <span class="stat-value" id="expansion-level">0</span>
        </div>
        <div class="expansion-stat">
          <span class="stat-label">GLYPHS:</span>
          <span class="stat-value" id="glyph-count">0</span>
        </div>
        <div class="expansion-stat">
          <span class="stat-label">VARIANTS:</span>
          <span class="stat-value" id="variant-count">0</span>
        </div>
        <div class="expansion-sequence" id="expansion-sequence"></div>
      </div>
    `;

    this.expansionDisplay.style.cssText = `
      position: fixed;
      top: 50%;
      left: 20px;
      width: 250px;
      min-height: 180px;
      background: rgba(0,0,0,0.9);
      border: 2px solid #00ff88;
      border-radius: 8px;
      padding: 15px;
      font-family: 'Courier New', monospace;
      color: #00ff88;
      transform: translateY(-50%) translateX(-100%);
      transition: transform 1s ease-out;
      z-index: 1000;
      opacity: 0;
    `;

    document.body.appendChild(this.expansionDisplay);
  }

  createBlockchainSync() {
    this.blockchainSync = document.createElement('div');
    this.blockchainSync.id = 'blockchain-sync';
    this.blockchainSync.innerHTML = `
      <div class="sync-header">⛓️ BLOCKCHAIN SYNC ⛓️</div>
      <div class="sync-status">
        <div class="sync-line">
          <span>NFT STATE:</span>
          <span id="nft-state">STATIC</span>
        </div>
        <div class="sync-line">
          <span>SYNC RATE:</span>
          <span id="sync-rate">0.0 Hz</span>
        </div>
        <div class="sync-line">
          <span>MUTATIONS:</span>
          <span id="mutation-count">0</span>
        </div>
      </div>
      <div class="sync-indicator" id="sync-indicator"></div>
    `;

    this.blockchainSync.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      width: 220px;
      transform: translateX(-50%) translateY(-100%);
      background: rgba(20,20,60,0.9);
      border: 2px solid #9966ff;
      border-radius: 5px;
      padding: 12px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      color: #9966ff;
      text-align: center;
      z-index: 1000;
      opacity: 0;
      transition: all 1s ease-out;
    `;

    document.body.appendChild(this.blockchainSync);
  }

  attachSwitchListeners() {
    const safetyCover = document.getElementById('safety-cover');
    const armSwitch = document.getElementById('arm-switch');

    // Safety cover interaction
    safetyCover.addEventListener('click', () => {
      if (!this.isArmed) {
        this.armSwitch();
      }
    });

    // Arm switch interaction
    armSwitch.addEventListener('click', () => {
      if (this.isArmed && !this.isActive) {
        this.activateOverdrive();
      }
    });
  }

  armSwitch() {
    console.log("🔓 Arming Overdrive Switch...");
    this.isArmed = true;

    const safetyCover = document.getElementById('safety-cover');
    const switchStatus = document.getElementById('switch-status');

    safetyCover.style.transform = 'rotateX(120deg)';
    safetyCover.style.opacity = '0.3';
    switchStatus.textContent = 'ARMED';
    switchStatus.style.color = '#ffaa00';

    // Enable switch lever
    const switchLever = document.getElementById('switch-lever');
    switchLever.style.cssText = `
      width: 40px;
      height: 20px;
      background: linear-gradient(45deg, #ff6600, #ffaa00);
      border-radius: 10px;
      margin: 10px auto;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 0 20px #ff6600;
    `;

    console.log("⚡ Overdrive switch ARMED - ready for activation");
  }

  activateOverdrive() {
    console.log("🚀 ACTIVATING OVERDRIVE ARM SWITCH!");
    this.isActive = true;

    const switchStatus = document.getElementById('switch-status');
    const switchLever = document.getElementById('switch-lever');

    switchStatus.textContent = 'ACTIVE';
    switchStatus.style.color = '#00ff00';
    switchLever.style.transform = 'scale(1.2)';
    switchLever.style.boxShadow = '0 0 40px #00ff00';

    // Show expansion displays
    this.showExpansionDisplays();

    // Start autonomous expansion
    this.startAutonomousExpansion();

    // Start blockchain synchronization
    this.startBlockchainSync();

    return this;
  }

  showExpansionDisplays() {
    setTimeout(() => {
      this.expansionDisplay.style.opacity = '1';
      this.expansionDisplay.style.transform = 'translateY(-50%) translateX(0)';
    }, 500);

    setTimeout(() => {
      this.blockchainSync.style.opacity = '1';
      this.blockchainSync.style.transform = 'translateX(-50%) translateY(0)';
    }, 1000);
  }

  startAutonomousExpansion() {
    console.log("🌀 Starting autonomous relic expansion...");
    
    this.autonomousTimer = setInterval(() => {
      this.performExpansionStep();
    }, 3000); // Expansion every 3 seconds

    // Immediate first expansion
    this.performExpansionStep();
  }

  performExpansionStep() {
    this.expansionLevel++;
    
    // Generate new glyph sequence
    const newSequence = this.generateGlyphSequence();
    
    // Generate whisper variation
    const newWhisper = this.generateWhisperVariation();
    
    // Generate micro-lore fragment
    const newFragment = this.generateMicroLore();

    // Update displays
    this.updateExpansionDisplays(newSequence, newWhisper, newFragment);

    // Log expansion
    console.log(`🔄 Expansion Level ${this.expansionLevel}: New sequence generated`);
    console.log(`   Glyphs: ${newSequence.join(' ')}`);
    console.log(`   Whisper: "${newWhisper}"`);
    console.log(`   Fragment: "${newFragment}"`);
  }

  generateGlyphSequence() {
    const baseSequence = this.glyphSequences[Math.floor(Math.random() * this.glyphSequences.length)];
    
    // Mutate sequence based on expansion level
    const mutatedSequence = baseSequence.map(glyph => {
      if (Math.random() < 0.3) {
        // 30% chance to mutate each glyph
        const allGlyphs = ['⚡', '🔮', '🌀', '⭐', '🔱', '🎭', '🔥', '⚔️', '🌙', '💎', '🔯', '🌟', '⚛️', '🔷', '🌊', '🔆', '🎆', '💫', '🔰'];
        return allGlyphs[Math.floor(Math.random() * allGlyphs.length)];
      }
      return glyph;
    });

    return mutatedSequence;
  }

  generateWhisperVariation() {
    const baseWhisper = this.whisperVariations[Math.floor(Math.random() * this.whisperVariations.length)];
    
    // Add expansion-specific modifiers
    const modifiers = [
      ` [Level ${this.expansionLevel}]`,
      ` [Variant ${String.fromCharCode(65 + (this.expansionLevel % 26))}]`,
      ` [Iteration ${this.expansionLevel}]`
    ];
    
    return baseWhisper + modifiers[Math.floor(Math.random() * modifiers.length)];
  }

  generateMicroLore() {
    const baseFragment = this.microLoreFragments[Math.floor(Math.random() * this.microLoreFragments.length)];
    
    // Add timestamp and expansion level
    const timestamp = Date.now().toString(36).toUpperCase();
    return `${baseFragment} [${timestamp}:L${this.expansionLevel}]`;
  }

  updateExpansionDisplays(sequence, whisper, fragment) {
    // Update expansion stats
    document.getElementById('expansion-level').textContent = this.expansionLevel;
    document.getElementById('glyph-count').textContent = sequence.length;
    document.getElementById('variant-count').textContent = this.expansionLevel;

    // Update sequence display with animation
    const sequenceElement = document.getElementById('expansion-sequence');
    sequenceElement.innerHTML = `<div class="new-sequence">${sequence.join(' ')}</div>`;
    
    // Animate in
    setTimeout(() => {
      sequenceElement.querySelector('.new-sequence').style.animation = 'sequenceGlow 2s ease-out';
    }, 100);

    // Update blockchain sync
    this.updateBlockchainSync();
  }

  updateBlockchainSync() {
    const syncRate = (this.expansionLevel * 0.1).toFixed(1);
    
    document.getElementById('nft-state').textContent = 'EVOLVING';
    document.getElementById('sync-rate').textContent = `${syncRate} Hz`;
    document.getElementById('mutation-count').textContent = this.expansionLevel;

    // Update sync indicator
    const indicator = document.getElementById('sync-indicator');
    indicator.style.cssText = `
      width: 100%;
      height: 4px;
      background: linear-gradient(90deg, #9966ff, #66ffaa);
      margin-top: 10px;
      animation: syncPulse 1s ease-in-out infinite alternate;
    `;
  }

  startBlockchainSync() {
    console.log("⛓️ Starting blockchain synchronization...");
    
    // Simulate blockchain operations
    setInterval(() => {
      if (this.isActive) {
        console.log(`⛓️ Syncing expansion state to blockchain... Level: ${this.expansionLevel}`);
      }
    }, 10000); // Sync every 10 seconds
  }

  activate() {
    console.log("⚡ Showing Overdrive Arm Switch...");
    
    setTimeout(() => {
      this.switchPanel.style.opacity = '1';
      this.switchPanel.style.transform = 'translateY(0)';
    }, 1000);

    return this;
  }

  deactivate() {
    this.isActive = false;
    if (this.autonomousTimer) {
      clearInterval(this.autonomousTimer);
      this.autonomousTimer = null;
    }
    
    this.switchPanel.style.opacity = '0';
    this.switchPanel.style.transform = 'translateY(100%)';
    this.expansionDisplay.style.transform = 'translateY(-50%) translateX(-100%)';
    this.blockchainSync.style.transform = 'translateX(-50%) translateY(-100%)';
  }

  getExpansionLevel() {
    return this.expansionLevel;
  }

  isOverdriveActive() {
    return this.isActive;
  }
}

// CSS for overdrive switch effects
const overdriveCSS = `
  .switch-header {
    font-size: 12px;
    font-weight: bold;
    margin-bottom: 8px;
    text-shadow: 0 0 10px #ff6600;
  }

  .switch-status {
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 10px;
    color: #666;
  }

  .switch-assembly {
    position: relative;
    height: 60px;
  }

  .safety-cover {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 30px;
    background: linear-gradient(45deg, #333, #666);
    border: 2px solid #ff6600;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.5s ease;
    transform-origin: bottom;
  }

  .cover-label {
    font-size: 8px;
    text-align: center;
    line-height: 26px;
    color: #ff6600;
  }

  .arm-switch {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 40px;
    background: #1a1a1a;
    border: 2px solid #333;
    border-radius: 20px;
    cursor: pointer;
  }

  .switch-warning {
    font-size: 8px;
    margin-top: 8px;
    color: #ff6600;
    animation: warningBlink 1s infinite alternate;
  }

  .expansion-header {
    font-size: 12px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 10px;
    text-shadow: 0 0 10px #00ff88;
  }

  .expansion-stat {
    display: flex;
    justify-content: space-between;
    margin: 5px 0;
    font-size: 11px;
  }

  .stat-label {
    color: #00ff88;
  }

  .stat-value {
    color: #ffffff;
    font-weight: bold;
  }

  .expansion-sequence {
    margin-top: 15px;
    text-align: center;
    font-size: 18px;
    min-height: 30px;
  }

  .sync-header {
    font-size: 10px;
    font-weight: bold;
    margin-bottom: 8px;
    text-shadow: 0 0 8px #9966ff;
  }

  .sync-line {
    display: flex;
    justify-content: space-between;
    margin: 3px 0;
    font-size: 10px;
  }

  @keyframes warningBlink {
    0% { opacity: 1; }
    100% { opacity: 0.3; }
  }

  @keyframes sequenceGlow {
    0% { text-shadow: 0 0 5px #00ff88; }
    50% { text-shadow: 0 0 20px #00ff88, 0 0 30px #ffffff; }
    100% { text-shadow: 0 0 5px #00ff88; }
  }

  @keyframes syncPulse {
    0% { transform: scaleX(0.8); opacity: 0.6; }
    100% { transform: scaleX(1); opacity: 1; }
  }
`;

// Inject CSS
const overdriveStyle = document.createElement('style');
overdriveStyle.textContent = overdriveCSS;
document.head.appendChild(overdriveStyle);

// Export for use in main script
window.OverdriveArmSwitch = OverdriveArmSwitch;