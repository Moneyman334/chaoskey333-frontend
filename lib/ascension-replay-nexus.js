/**
 * Ascension Replay Nexus - Core System
 * Fuses Vault Broadcast Pulse Replay, Spectral Decode HUD, and Evolution Trigger
 */

class AscensionReplayNexus {
    constructor() {
        this.replayEngine = new VaultBroadcastReplayEngine();
        this.spectralDecodeHUD = new SpectralDecodeHUD();
        this.evolutionTrigger = new EvolutionTrigger();
        this.cosmicReplayTerminal = new CosmicReplayTerminal();
        
        this.isActive = false;
        this.currentReplay = null;
        this.archivedPulses = [];
        
        this.init();
    }

    async init() {
        console.log('🌌 Initializing Ascension Replay Nexus...');
        
        // Initialize all subsystems
        await this.replayEngine.init();
        await this.spectralDecodeHUD.init();
        await this.evolutionTrigger.init();
        await this.cosmicReplayTerminal.init();
        
        // Load archived pulses
        await this.loadArchivedPulses();
        
        console.log('✨ Ascension Replay Nexus ready');
    }

    async loadArchivedPulses() {
        // Simulate loading archived vault broadcast pulses
        this.archivedPulses = [
            {
                id: 'pulse_001',
                timestamp: Date.now() - 86400000, // 1 day ago
                title: 'Origin Flare Manifestation',
                glyphs: ['◇', '◊', '◈', '◉'],
                whispers: ['The beginning echoes through time...', 'Chaos and order unite'],
                evolutionPotential: 0.85,
                cinematicQuality: 'ultra'
            },
            {
                id: 'pulse_002',
                timestamp: Date.now() - 172800000, // 2 days ago
                title: 'Spectral Convergence',
                glyphs: ['⟡', '⟢', '⟣', '⟤'],
                whispers: ['Dimensional barriers weaken', 'The vault remembers all'],
                evolutionPotential: 0.92,
                cinematicQuality: 'ultra'
            },
            {
                id: 'pulse_003',
                timestamp: Date.now() - 259200000, // 3 days ago
                title: 'Chaos Key Resonance',
                glyphs: ['⬟', '⬠', '⬡', '⬢'],
                whispers: ['Keys unlock infinite possibility', 'Time bends to will'],
                evolutionPotential: 0.78,
                cinematicQuality: 'premium'
            }
        ];
        
        console.log(`📚 Loaded ${this.archivedPulses.length} archived vault pulses`);
    }

    async startReplay(pulseId) {
        const pulse = this.archivedPulses.find(p => p.id === pulseId);
        if (!pulse) {
            throw new Error(`Pulse ${pulseId} not found in archives`);
        }

        console.log(`🎬 Starting cinematic replay of: ${pulse.title}`);
        
        this.currentReplay = pulse;
        this.isActive = true;

        // Start replay engine
        await this.replayEngine.startReplay(pulse);
        
        // Activate spectral decode HUD
        await this.spectralDecodeHUD.activate(pulse);
        
        // Enable evolution trigger for this pulse
        await this.evolutionTrigger.enableForPulse(pulse);
        
        // Update cosmic replay terminal
        this.cosmicReplayTerminal.setActiveReplay(pulse);

        return pulse;
    }

    async stopReplay() {
        if (!this.isActive) return;

        console.log('⏹️ Stopping replay...');
        
        await this.replayEngine.stop();
        await this.spectralDecodeHUD.deactivate();
        await this.evolutionTrigger.disable();
        this.cosmicReplayTerminal.clearActiveReplay();

        this.currentReplay = null;
        this.isActive = false;
    }

    getArchivedPulses() {
        return this.archivedPulses.map(pulse => ({
            id: pulse.id,
            timestamp: pulse.timestamp,
            title: pulse.title,
            evolutionPotential: pulse.evolutionPotential,
            cinematicQuality: pulse.cinematicQuality
        }));
    }

    getCurrentReplay() {
        return this.currentReplay;
    }

    isReplayActive() {
        return this.isActive;
    }
}

class VaultBroadcastReplayEngine {
    constructor() {
        this.currentPulse = null;
        this.replayState = 'stopped'; // stopped, playing, paused
        this.currentFrame = 0;
        this.totalFrames = 0;
        this.frameRate = 60; // cinematic quality
    }

    async init() {
        console.log('🎮 Initializing Vault Broadcast Replay Engine...');
    }

    async startReplay(pulse) {
        this.currentPulse = pulse;
        this.replayState = 'playing';
        this.currentFrame = 0;
        this.totalFrames = pulse.glyphs.length * 60; // 1 second per glyph at 60fps
        
        console.log(`▶️ Starting replay: ${pulse.title} (${this.totalFrames} frames)`);
        
        // Start the replay loop
        this.replayLoop();
    }

    async stop() {
        this.replayState = 'stopped';
        this.currentFrame = 0;
        this.currentPulse = null;
    }

    async pause() {
        this.replayState = 'paused';
    }

    async resume() {
        if (this.replayState === 'paused') {
            this.replayState = 'playing';
            this.replayLoop();
        }
    }

    replayLoop() {
        if (this.replayState !== 'playing') return;

        // Simulate frame-by-frame replay
        this.currentFrame++;
        
        // Calculate current glyph and whisper based on frame
        const glyphIndex = Math.floor(this.currentFrame / 60);
        const pulse = this.currentPulse;
        
        if (glyphIndex < pulse.glyphs.length) {
            // Emit current glyph and whisper for spectral decode HUD
            this.emitDecodingFrame({
                frame: this.currentFrame,
                glyph: pulse.glyphs[glyphIndex],
                whisper: pulse.whispers[glyphIndex] || '',
                timestamp: pulse.timestamp + (glyphIndex * 1000)
            });
        }

        // Continue loop if not finished
        if (this.currentFrame < this.totalFrames) {
            setTimeout(() => this.replayLoop(), 1000 / this.frameRate);
        } else {
            console.log('🏁 Replay completed');
            this.replayState = 'stopped';
        }
    }

    emitDecodingFrame(frameData) {
        // Emit event for spectral decode HUD to process
        const event = new CustomEvent('vault-replay-frame', { detail: frameData });
        document.dispatchEvent(event);
    }

    getProgress() {
        return {
            currentFrame: this.currentFrame,
            totalFrames: this.totalFrames,
            percentage: (this.currentFrame / this.totalFrames) * 100,
            state: this.replayState
        };
    }
}

class SpectralDecodeHUD {
    constructor() {
        this.hudElement = null;
        this.isActive = false;
        this.currentGlyphs = [];
        this.decodedWhispers = [];
    }

    async init() {
        console.log('👁️ Initializing Spectral Decode HUD...');
        this.createHUDElement();
        this.bindEvents();
    }

    createHUDElement() {
        // Create HUD overlay
        this.hudElement = document.createElement('div');
        this.hudElement.id = 'spectral-decode-hud';
        this.hudElement.className = 'spectral-hud';
        this.hudElement.innerHTML = `
            <div class="hud-header">
                <h3>🔮 Spectral Decode HUD</h3>
                <div class="decode-status">INACTIVE</div>
            </div>
            <div class="glyph-decoder">
                <h4>Active Glyphs</h4>
                <div id="active-glyphs"></div>
            </div>
            <div class="whisper-decoder">
                <h4>Decoded Whispers</h4>
                <div id="decoded-whispers"></div>
            </div>
            <div class="evolution-readiness">
                <h4>Evolution Potential</h4>
                <div id="evolution-meter"></div>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .spectral-hud {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 350px;
                background: rgba(0, 0, 0, 0.9);
                border: 2px solid #00ff00;
                border-radius: 10px;
                padding: 20px;
                color: #00ff00;
                font-family: 'Courier New', monospace;
                z-index: 10000;
                display: none;
            }
            .spectral-hud.active { display: block; }
            .hud-header { display: flex; justify-content: space-between; margin-bottom: 15px; }
            .decode-status { color: #ffff00; font-weight: bold; }
            .decode-status.active { color: #00ff00; }
            .glyph-decoder, .whisper-decoder, .evolution-readiness { margin-bottom: 15px; }
            .glyph-decoder h4, .whisper-decoder h4, .evolution-readiness h4 { 
                margin: 0 0 10px 0; color: #00ffff; 
            }
            #active-glyphs { font-size: 24px; letter-spacing: 5px; }
            #decoded-whispers { max-height: 100px; overflow-y: auto; font-size: 12px; }
            #evolution-meter { 
                background: #333; 
                height: 20px; 
                border-radius: 10px; 
                overflow: hidden;
                position: relative;
            }
            .evolution-bar { 
                height: 100%; 
                background: linear-gradient(90deg, #ff0000, #ffff00, #00ff00);
                transition: width 0.3s ease;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(this.hudElement);
    }

    bindEvents() {
        // Listen for replay frames
        document.addEventListener('vault-replay-frame', (event) => {
            if (this.isActive) {
                this.processFrame(event.detail);
            }
        });
    }

    async activate(pulse) {
        this.isActive = true;
        this.currentGlyphs = [];
        this.decodedWhispers = [];
        
        this.hudElement.classList.add('active');
        this.hudElement.querySelector('.decode-status').textContent = 'ACTIVE';
        this.hudElement.querySelector('.decode-status').classList.add('active');
        
        console.log('🔮 Spectral Decode HUD activated');
    }

    async deactivate() {
        this.isActive = false;
        this.hudElement.classList.remove('active');
        this.hudElement.querySelector('.decode-status').textContent = 'INACTIVE';
        this.hudElement.querySelector('.decode-status').classList.remove('active');
        
        console.log('🔮 Spectral Decode HUD deactivated');
    }

    processFrame(frameData) {
        // Update active glyphs
        if (frameData.glyph && !this.currentGlyphs.includes(frameData.glyph)) {
            this.currentGlyphs.push(frameData.glyph);
            this.updateGlyphDisplay();
        }

        // Decode whispers
        if (frameData.whisper) {
            this.decodedWhispers.push({
                text: frameData.whisper,
                timestamp: frameData.timestamp
            });
            this.updateWhisperDisplay();
        }

        // Update evolution potential
        this.updateEvolutionMeter(frameData);
    }

    updateGlyphDisplay() {
        const glyphsElement = document.getElementById('active-glyphs');
        glyphsElement.textContent = this.currentGlyphs.join(' ');
    }

    updateWhisperDisplay() {
        const whispersElement = document.getElementById('decoded-whispers');
        whispersElement.innerHTML = this.decodedWhispers
            .slice(-5) // Show last 5 whispers
            .map(w => `<div>${w.text}</div>`)
            .join('');
    }

    updateEvolutionMeter(frameData) {
        const meterElement = document.getElementById('evolution-meter');
        if (!meterElement.querySelector('.evolution-bar')) {
            meterElement.innerHTML = '<div class="evolution-bar"></div>';
        }
        
        const potential = Math.min(100, (this.currentGlyphs.length / 4) * 100);
        const bar = meterElement.querySelector('.evolution-bar');
        bar.style.width = potential + '%';
    }
}

class EvolutionTrigger {
    constructor() {
        this.isEnabled = false;
        this.currentPulse = null;
        this.evolutionThreshold = 0.8;
    }

    async init() {
        console.log('⚡ Initializing Evolution Trigger...');
        this.createTriggerButton();
    }

    createTriggerButton() {
        const button = document.createElement('button');
        button.id = 'evolution-trigger-btn';
        button.className = 'evolution-trigger';
        button.textContent = '⚡ TRIGGER EVOLUTION';
        button.disabled = true;
        button.onclick = () => this.triggerEvolution();

        const style = document.createElement('style');
        style.textContent = `
            .evolution-trigger {
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 15px 30px;
                background: linear-gradient(45deg, #ff0000, #ff6600);
                color: white;
                border: none;
                border-radius: 25px;
                font-family: 'Courier New', monospace;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                z-index: 10001;
                display: none;
            }
            .evolution-trigger:enabled {
                background: linear-gradient(45deg, #00ff00, #ffff00);
                color: #000;
                animation: pulse 2s infinite;
                display: block;
            }
            .evolution-trigger:hover:enabled {
                transform: scale(1.1);
                box-shadow: 0 0 20px rgba(255, 255, 0, 0.8);
            }
            @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(255, 255, 0, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(255, 255, 0, 0); }
                100% { box-shadow: 0 0 0 0 rgba(255, 255, 0, 0); }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(button);

        this.triggerButton = button;
    }

    async enableForPulse(pulse) {
        this.isEnabled = true;
        this.currentPulse = pulse;
        
        // Check if evolution is possible
        if (pulse.evolutionPotential >= this.evolutionThreshold) {
            this.triggerButton.disabled = false;
            this.triggerButton.style.display = 'block';
            console.log('⚡ Evolution trigger enabled for pulse:', pulse.title);
        }
    }

    async disable() {
        this.isEnabled = false;
        this.currentPulse = null;
        this.triggerButton.disabled = true;
        this.triggerButton.style.display = 'none';
    }

    async triggerEvolution() {
        if (!this.isEnabled || !this.currentPulse) return;

        console.log('🌟 TRIGGERING EVOLUTION from archived pulse:', this.currentPulse.title);
        
        // Simulate evolution process
        const evolutionEvent = new CustomEvent('chaos-evolution-triggered', {
            detail: {
                source: 'archived-pulse',
                pulseId: this.currentPulse.id,
                evolutionPotential: this.currentPulse.evolutionPotential,
                timestamp: Date.now()
            }
        });
        
        document.dispatchEvent(evolutionEvent);
        
        // Visual feedback
        this.showEvolutionEffect();
    }

    showEvolutionEffect() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, transparent 0%, rgba(255, 255, 0, 0.3) 50%, rgba(255, 0, 0, 0.3) 100%);
            z-index: 9999;
            pointer-events: none;
            animation: evolutionFlash 2s ease-out forwards;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes evolutionFlash {
                0% { opacity: 0; }
                50% { opacity: 1; }
                100% { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            document.body.removeChild(overlay);
            document.head.removeChild(style);
        }, 2000);
    }
}

class CosmicReplayTerminal {
    constructor() {
        this.terminalElement = null;
        this.activeReplay = null;
    }

    async init() {
        console.log('🌌 Initializing Cosmic Replay Terminal...');
        this.createTerminalInterface();
    }

    createTerminalInterface() {
        const terminal = document.createElement('div');
        terminal.id = 'cosmic-replay-terminal';
        terminal.className = 'cosmic-terminal';
        terminal.innerHTML = `
            <div class="terminal-header">
                <h3>🌌 COSMIC REPLAY TERMINAL</h3>
                <div class="terminal-status">Time-Bending Relic Forge</div>
            </div>
            <div class="terminal-content">
                <div class="active-replay-info">
                    <h4>Active Replay</h4>
                    <div id="replay-info">No replay active</div>
                </div>
                <div class="forge-controls">
                    <h4>Relic Forge Controls</h4>
                    <div id="forge-status">Forge ready for temporal manipulation</div>
                </div>
            </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            .cosmic-terminal {
                position: fixed;
                bottom: 20px;
                left: 20px;
                width: 400px;
                background: rgba(0, 0, 0, 0.95);
                border: 2px solid #6600ff;
                border-radius: 10px;
                padding: 20px;
                color: #6600ff;
                font-family: 'Courier New', monospace;
                z-index: 10000;
            }
            .terminal-header {
                border-bottom: 1px solid #6600ff;
                padding-bottom: 10px;
                margin-bottom: 15px;
            }
            .terminal-status {
                font-size: 12px;
                color: #9966ff;
                margin-top: 5px;
            }
            .active-replay-info, .forge-controls {
                margin-bottom: 15px;
            }
            .active-replay-info h4, .forge-controls h4 {
                margin: 0 0 10px 0;
                color: #00ffff;
            }
            #replay-info, #forge-status {
                font-size: 12px;
                color: #cccccc;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(terminal);

        this.terminalElement = terminal;
    }

    setActiveReplay(pulse) {
        this.activeReplay = pulse;
        const replayInfo = document.getElementById('replay-info');
        replayInfo.innerHTML = `
            <strong>${pulse.title}</strong><br>
            Evolution Potential: ${(pulse.evolutionPotential * 100).toFixed(1)}%<br>
            Quality: ${pulse.cinematicQuality.toUpperCase()}
        `;

        const forgeStatus = document.getElementById('forge-status');
        forgeStatus.textContent = 'Forge active - temporal energy flowing';
    }

    clearActiveReplay() {
        this.activeReplay = null;
        document.getElementById('replay-info').textContent = 'No replay active';
        document.getElementById('forge-status').textContent = 'Forge ready for temporal manipulation';
    }
}

// Global instance
window.ascensionReplayNexus = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    window.ascensionReplayNexus = new AscensionReplayNexus();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AscensionReplayNexus, VaultBroadcastReplayEngine, SpectralDecodeHUD, EvolutionTrigger, CosmicReplayTerminal };
}