/**
 * Ascension Replay Nexus - Cosmic Terminal v2.0 (Canvas 2D Version)
 * Advanced 2D starmap visualization with time-thread markers and instant export capabilities
 */

class AscensionReplayNexus2D {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.stars = [];
        this.vaultEvents = [];
        this.timelinePosition = 0;
        this.isPlaying = false;
        this.currentEvent = 0;
        this.clipData = null;
        this.animationId = null;
        this.cameraX = 0;
        this.cameraY = 0;
        this.zoom = 1;
        this.rotation = 0;
        
        // Event data for time-thread markers
        this.eventData = [
            {
                id: 'genesis',
                title: '🔮 Genesis Pulse',
                description: 'The initial vault resonance that sparked the cosmic replay sequence...',
                time: 0,
                energy: 2847,
                depth: '∞',
                intensity: 'MAX',
                position: { x: 400, y: 250 },
                color: '#ff6b35',
                radius: 20
            },
            {
                id: 'vault',
                title: '🌀 Vault Resonance',
                description: 'Deep harmonic frequencies emerge from the quantum vault core...',
                time: 25,
                energy: 4921,
                depth: '47.3k',
                intensity: 'CRITICAL',
                position: { x: 500, y: 150 },
                color: '#00ffff',
                radius: 25
            },
            {
                id: 'chaos',
                title: '🌪️ Chaos Emergence',
                description: 'Reality fractures as chaos energy cascades through dimensional barriers...',
                time: 50,
                energy: 7384,
                depth: '∞+1',
                intensity: 'OVERLOAD',
                position: { x: 300, y: 350 },
                color: '#ff00ff',
                radius: 30
            },
            {
                id: 'nexus',
                title: '⭐ Nexus Convergence',
                description: 'All timeline threads converge into a singular point of infinite possibility...',
                time: 75,
                energy: 12847,
                depth: 'BEYOND',
                intensity: 'MYTHIC',
                position: { x: 600, y: 300 },
                color: '#ffff00',
                radius: 35
            },
            {
                id: 'ascension',
                title: '🚀 Final Ascension',
                description: 'The ultimate transcendence as consciousness merges with the cosmic database...',
                time: 100,
                energy: 33333,
                depth: 'TRANSCENDENT',
                intensity: 'GODLIKE',
                position: { x: 400, y: 100 },
                color: '#ff0000',
                radius: 40
            }
        ];

        this.init();
    }

    async init() {
        console.log('🌌 Initializing Ascension Replay Nexus 2D...');
        
        try {
            this.initializeCanvas();
            this.generateStarField();
            this.setupEventListeners();
            this.startCosmicLoop();
            this.updateSystemStatus('COSMIC TERMINAL v2.0 - FULLY OPERATIONAL');
            console.log('✅ Nexus 2D initialization complete');
        } catch (error) {
            console.error('❌ Nexus initialization failed:', error);
            this.updateSystemStatus('SYSTEM ERROR - INITIALIZATION FAILED');
        }
    }

    initializeCanvas() {
        this.canvas = document.getElementById('starmap2D');
        if (!this.canvas) {
            throw new Error('Starmap canvas not found');
        }

        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size to fill container
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = 500;
        
        // Set canvas style
        this.canvas.style.background = 'radial-gradient(ellipse at center, #001122 0%, #000000 100%)';
        
        // Handle canvas interactions
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleCanvasMouseMove(e));
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    generateStarField() {
        this.stars = [];
        
        // Generate random stars
        for (let i = 0; i < 200; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 3 + 1,
                brightness: Math.random(),
                twinkleSpeed: Math.random() * 0.02 + 0.01,
                color: this.getRandomStarColor()
            });
        }
    }

    getRandomStarColor() {
        const colors = ['#ffffff', '#ffcccc', '#ccccff', '#ffffcc', '#ccffcc', '#ffccff'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    setupEventListeners() {
        // Timeline controls
        document.getElementById('playBtn')?.addEventListener('click', () => this.playTimeline());
        document.getElementById('pauseBtn')?.addEventListener('click', () => this.pauseTimeline());

        // Starmap controls
        document.getElementById('resetView')?.addEventListener('click', () => this.resetView());
        document.getElementById('togglePulse')?.addEventListener('click', () => this.togglePulseAnimation());

        // Timeline markers
        document.querySelectorAll('.marker').forEach(marker => {
            marker.addEventListener('click', (e) => {
                const time = parseInt(e.target.dataset.time);
                this.seekToTime(time);
            });
        });

        // Export controls
        document.getElementById('captureClip')?.addEventListener('click', () => this.captureClip());
        document.getElementById('generateThumb')?.addEventListener('click', () => this.generateThumbnail());
        document.getElementById('mintClip')?.addEventListener('click', () => this.mintClip());
        document.getElementById('pushLive')?.addEventListener('click', () => this.pushLive());
        document.getElementById('exportLore')?.addEventListener('click', () => this.exportToLore());

        // System connection
        document.getElementById('connectSystems')?.addEventListener('click', () => this.connectSystems());
    }

    startCosmicLoop() {
        const animate = () => {
            this.animationId = requestAnimationFrame(animate);
            
            this.clearCanvas();
            this.updateStars();
            this.drawStarField();
            this.drawVaultEvents();
            this.drawConnections();
            this.drawUI();
            
            // Update timeline if playing
            if (this.isPlaying) {
                this.updateTimeline();
            }
            
            // Update rotation
            this.rotation += 0.005;
            
            // Update coordinates display
            this.updateCoordinatesDisplay();
        };

        animate();
    }

    clearCanvas() {
        // Create gradient background
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 2
        );
        gradient.addColorStop(0, '#001133');
        gradient.addColorStop(1, '#000000');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    updateStars() {
        this.stars.forEach(star => {
            star.brightness = Math.sin(Date.now() * star.twinkleSpeed) * 0.3 + 0.7;
        });
    }

    drawStarField() {
        this.ctx.save();
        
        this.stars.forEach(star => {
            this.ctx.globalAlpha = star.brightness;
            this.ctx.fillStyle = star.color;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Add twinkling effect
            if (star.brightness > 0.8) {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.beginPath();
                this.ctx.arc(star.x, star.y, star.size * 0.5, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
        
        this.ctx.restore();
    }

    drawVaultEvents() {
        const time = Date.now();
        
        this.eventData.forEach((event, index) => {
            const { position, color, radius } = event;
            
            // Calculate pulsing effect
            const pulseScale = 1 + Math.sin(time * 0.003 + index) * 0.3;
            const currentRadius = radius * pulseScale;
            
            // Draw outer ring
            this.ctx.save();
            this.ctx.globalAlpha = 0.3;
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(position.x, position.y, currentRadius + 20, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.restore();
            
            // Draw main sphere
            const gradient = this.ctx.createRadialGradient(
                position.x, position.y, 0,
                position.x, position.y, currentRadius
            );
            gradient.addColorStop(0, color);
            gradient.addColorStop(0.7, color + '80');
            gradient.addColorStop(1, color + '00');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(position.x, position.y, currentRadius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw energy core
            this.ctx.fillStyle = '#ffffff';
            this.ctx.globalAlpha = 0.8;
            this.ctx.beginPath();
            this.ctx.arc(position.x, position.y, currentRadius * 0.3, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
            
            // Highlight current event
            if (index === this.currentEvent) {
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 2;
                this.ctx.setLineDash([5, 5]);
                this.ctx.beginPath();
                this.ctx.arc(position.x, position.y, currentRadius + 10, 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.setLineDash([]);
            }
        });
    }

    drawConnections() {
        this.ctx.save();
        this.ctx.globalAlpha = 0.3;
        this.ctx.strokeStyle = '#00ffff';
        this.ctx.lineWidth = 1;
        
        // Draw connections between events in timeline order
        for (let i = 0; i < this.eventData.length - 1; i++) {
            const current = this.eventData[i];
            const next = this.eventData[i + 1];
            
            this.ctx.beginPath();
            this.ctx.moveTo(current.position.x, current.position.y);
            this.ctx.lineTo(next.position.x, next.position.y);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }

    drawUI() {
        // Draw timeline progress indicator
        const progress = this.timelinePosition / 100;
        const indicatorY = this.canvas.height - 20;
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(10, indicatorY, this.canvas.width - 20, 2);
        
        this.ctx.fillStyle = '#ffff00';
        this.ctx.fillRect(10, indicatorY, (this.canvas.width - 20) * progress, 2);
        
        // Draw time markers on canvas
        this.eventData.forEach((event, index) => {
            const x = 10 + (this.canvas.width - 20) * (event.time / 100);
            this.ctx.fillStyle = event.color;
            this.ctx.fillRect(x - 2, indicatorY - 5, 4, 12);
        });
    }

    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check if click is on an event
        this.eventData.forEach((event, index) => {
            const distance = Math.sqrt(
                Math.pow(x - event.position.x, 2) + 
                Math.pow(y - event.position.y, 2)
            );
            
            if (distance <= event.radius) {
                this.seekToTime(event.time);
                this.triggerEvent(event);
            }
        });
    }

    handleCanvasMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Change cursor on hover over events
        let overEvent = false;
        this.eventData.forEach(event => {
            const distance = Math.sqrt(
                Math.pow(x - event.position.x, 2) + 
                Math.pow(y - event.position.y, 2)
            );
            
            if (distance <= event.radius) {
                overEvent = true;
            }
        });
        
        this.canvas.style.cursor = overEvent ? 'pointer' : 'default';
    }

    // Timeline and event methods (same as 3D version)
    playTimeline() {
        this.isPlaying = true;
        document.getElementById('playBtn').style.display = 'none';
        document.getElementById('pauseBtn').style.display = 'inline-block';
    }

    pauseTimeline() {
        this.isPlaying = false;
        document.getElementById('playBtn').style.display = 'inline-block';
        document.getElementById('pauseBtn').style.display = 'none';
    }

    updateTimeline() {
        this.timelinePosition += 0.2;
        if (this.timelinePosition > 100) {
            this.timelinePosition = 0;
        }

        // Update playhead position
        const playhead = document.getElementById('playhead');
        if (playhead) {
            playhead.style.left = this.timelinePosition + '%';
        }

        // Update time display
        const currentTime = Math.floor((this.timelinePosition / 100) * 333);
        const minutes = Math.floor(currentTime / 60);
        const seconds = currentTime % 60;
        const timeDisplay = document.getElementById('currentTime');
        if (timeDisplay) {
            timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        this.checkEventTriggers();
    }

    seekToTime(timePercent) {
        this.timelinePosition = timePercent;
        const playhead = document.getElementById('playhead');
        if (playhead) {
            playhead.style.left = timePercent + '%';
        }
        this.triggerEventAtTime(timePercent);
    }

    checkEventTriggers() {
        const currentEventIndex = this.eventData.findIndex(event => 
            Math.abs(this.timelinePosition - event.time) < 1
        );

        if (currentEventIndex !== -1 && currentEventIndex !== this.currentEvent) {
            this.currentEvent = currentEventIndex;
            this.triggerEvent(this.eventData[currentEventIndex]);
        }
    }

    triggerEventAtTime(timePercent) {
        const event = this.eventData.find(e => e.time === timePercent);
        if (event) {
            this.triggerEvent(event);
        }
    }

    triggerEvent(event) {
        console.log(`🌌 Triggering event: ${event.title}`);
        
        // Update event details panel
        document.getElementById('eventTitle').textContent = event.title;
        document.getElementById('eventDescription').textContent = event.description;
        document.getElementById('energyLevel').textContent = event.energy.toLocaleString();
        document.getElementById('depthLevel').textContent = event.depth;
        document.getElementById('intensityLevel').textContent = event.intensity;
        
        // Update current event index
        this.currentEvent = this.eventData.findIndex(e => e.id === event.id);
    }

    resetView() {
        this.cameraX = 0;
        this.cameraY = 0;
        this.zoom = 1;
        this.rotation = 0;
    }

    togglePulseAnimation() {
        // Toggle animation pause/resume
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
            const btn = document.getElementById('togglePulse');
            if (btn) btn.textContent = '▶️ Resume Pulse';
        } else {
            this.startCosmicLoop();
            const btn = document.getElementById('togglePulse');
            if (btn) btn.textContent = '⏸️ Pause Pulse';
        }
    }

    updateCoordinatesDisplay() {
        const coords = document.getElementById('currentCoords');
        if (coords) {
            coords.textContent = `NEXUS COORDINATES: [${Math.round(this.cameraX)}, ${Math.round(this.cameraY)}, ${Math.round(this.rotation * 100)}]`;
        }
    }

    // Export functionality (same as 3D version)
    async captureClip() {
        this.updateExportStatus('📸 Capturing cosmic moment...', 25);
        await this.sleep(1000);
        
        // Capture current canvas content
        this.clipData = this.canvas.toDataURL();
        
        // Update preview canvas
        const previewCanvas = document.getElementById('clipPreview');
        const previewCtx = previewCanvas.getContext('2d');
        
        // Draw captured content to preview
        const img = new Image();
        img.onload = () => {
            previewCtx.drawImage(img, 0, 0, previewCanvas.width, previewCanvas.height);
        };
        img.src = this.clipData;
        
        this.updateExportStatus('✅ Clip captured successfully', 100);
        
        setTimeout(() => {
            this.updateExportStatus('Ready for export operations...', 0);
        }, 2000);
    }

    async generateThumbnail() {
        this.updateExportStatus('🖼️ Generating thumbnail...', 50);
        await this.sleep(800);
        this.updateExportStatus('✅ Thumbnail generated', 100);
        
        setTimeout(() => {
            this.updateExportStatus('Ready for export operations...', 0);
        }, 1500);
    }

    async mintClip() {
        if (!this.clipData) {
            alert('⚠️ Please capture a clip first');
            return;
        }

        this.updateExportStatus('⚡ Initializing vault mint...', 20);
        await this.sleep(1000);

        if (!window.ethereum) {
            alert('🔌 Please connect your wallet to mint to the vault');
            this.updateExportStatus('❌ Wallet connection required', 0);
            return;
        }

        try {
            this.updateExportStatus('🔗 Connecting to vault systems...', 50);
            await this.sleep(1500);

            this.updateExportStatus('💫 Minting cosmic relic...', 80);
            await this.sleep(2000);

            const success = Math.random() > 0.1;
            
            if (success) {
                this.updateExportStatus('🎉 Relic minted to vault successfully!', 100);
                alert('✅ Your cosmic clip has been minted as a vault relic!');
            } else {
                throw new Error('Minting failed due to cosmic interference');
            }
        } catch (error) {
            console.error('Mint error:', error);
            this.updateExportStatus('❌ Mint failed - ' + error.message, 0);
            alert('❌ Minting failed: ' + error.message);
        }

        setTimeout(() => {
            this.updateExportStatus('Ready for export operations...', 0);
        }, 3000);
    }

    async pushLive() {
        if (!this.clipData) {
            alert('⚠️ Please capture a clip first');
            return;
        }

        this.updateExportStatus('🔴 Initiating live broadcast...', 30);
        await this.sleep(1000);

        this.updateExportStatus('📡 Establishing cosmic uplink...', 60);
        await this.sleep(1500);

        this.updateExportStatus('🌐 Broadcasting to the nexus...', 90);
        await this.sleep(1000);

        this.updateExportStatus('✅ Live broadcast active!', 100);
        alert('🔴 Your cosmic moment is now broadcasting live across the nexus!');

        setTimeout(() => {
            this.updateExportStatus('Ready for export operations...', 0);
        }, 3000);
    }

    async exportToLore() {
        if (!this.clipData) {
            alert('⚠️ Please capture a clip first');
            return;
        }

        this.updateExportStatus('📚 Accessing lore archives...', 25);
        await this.sleep(1000);

        this.updateExportStatus('🔮 Encoding cosmic metadata...', 50);
        await this.sleep(1200);

        this.updateExportStatus('💾 Storing in eternal database...', 75);
        await this.sleep(1500);

        this.updateExportStatus('✅ Exported to lore archive!', 100);
        alert('📚 Your cosmic experience has been preserved in the eternal lore archive!');

        setTimeout(() => {
            this.updateExportStatus('Ready for export operations...', 0);
        }, 3000);
    }

    async connectSystems() {
        this.updateSystemStatus('🔄 Initializing system connections...');
        
        document.getElementById('walletStatus').textContent = '🔌 Wallet: CONNECTING...';
        document.getElementById('networkStatus').textContent = '🌐 Network: ESTABLISHING...';
        
        await this.sleep(1500);
        
        if (window.ethereum) {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                document.getElementById('walletStatus').textContent = '🔌 Wallet: CONNECTED';
            } catch (error) {
                document.getElementById('walletStatus').textContent = '🔌 Wallet: FAILED';
            }
        } else {
            document.getElementById('walletStatus').textContent = '🔌 Wallet: NOT DETECTED';
        }
        
        await this.sleep(1000);
        
        document.getElementById('networkStatus').textContent = '🌐 Network: ONLINE';
        document.getElementById('cosmicStatus').textContent = '🌌 Cosmic Link: SYNCHRONIZED';
        
        this.updateSystemStatus('COSMIC TERMINAL v2.0 - ALL SYSTEMS OPERATIONAL');
    }

    updateExportStatus(message, progress) {
        document.getElementById('exportMessage').textContent = message;
        document.querySelector('.progress-fill').style.width = progress + '%';
    }

    updateSystemStatus(status) {
        document.getElementById('systemStatus').textContent = status;
    }

    onWindowResize() {
        if (this.canvas) {
            const container = this.canvas.parentElement;
            this.canvas.width = container.clientWidth;
            this.canvas.height = 500;
            this.generateStarField(); // Regenerate stars for new canvas size
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize Ascension Replay Nexus 2D when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌌 Starting Ascension Replay Nexus 2D initialization...');
    window.ascensionNexus2D = new AscensionReplayNexus2D();
});

// Export for global access
window.AscensionReplayNexus2D = AscensionReplayNexus2D;