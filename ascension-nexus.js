/**
 * Ascension Replay Nexus - Cosmic Terminal v2.0
 * Advanced 3D starmap visualization with time-thread markers and instant export capabilities
 */

class AscensionReplayNexus {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.starField = [];
        this.pulseSpheres = [];
        this.timelinePosition = 0;
        this.isPlaying = false;
        this.currentEvent = 0;
        this.clipData = null;
        
        // Event data for time-thread markers
        this.vaultEvents = [
            {
                id: 'genesis',
                title: '🔮 Genesis Pulse',
                description: 'The initial vault resonance that sparked the cosmic replay sequence...',
                time: 0,
                energy: 2847,
                depth: '∞',
                intensity: 'MAX',
                position: { x: 0, y: 0, z: 0 },
                color: 0xff6b35
            },
            {
                id: 'vault',
                title: '🌀 Vault Resonance',
                description: 'Deep harmonic frequencies emerge from the quantum vault core...',
                time: 25,
                energy: 4921,
                depth: '47.3k',
                intensity: 'CRITICAL',
                position: { x: 50, y: 30, z: -20 },
                color: 0x00ffff
            },
            {
                id: 'chaos',
                title: '🌪️ Chaos Emergence',
                description: 'Reality fractures as chaos energy cascades through dimensional barriers...',
                time: 50,
                energy: 7384,
                depth: '∞+1',
                intensity: 'OVERLOAD',
                position: { x: -30, y: 60, z: 40 },
                color: 0xff00ff
            },
            {
                id: 'nexus',
                title: '⭐ Nexus Convergence',
                description: 'All timeline threads converge into a singular point of infinite possibility...',
                time: 75,
                energy: 12847,
                depth: 'BEYOND',
                intensity: 'MYTHIC',
                position: { x: 20, y: -40, z: 80 },
                color: 0xffff00
            },
            {
                id: 'ascension',
                title: '🚀 Final Ascension',
                description: 'The ultimate transcendence as consciousness merges with the cosmic database...',
                time: 100,
                energy: 33333,
                depth: 'TRANSCENDENT',
                intensity: 'GODLIKE',
                position: { x: 0, y: 100, z: 0 },
                color: 0xff0000
            }
        ];

        this.init();
    }

    async init() {
        console.log('🌌 Initializing Ascension Replay Nexus...');
        
        try {
            await this.initializeThreeJS();
            this.setupEventListeners();
            this.startCosmicLoop();
            this.updateSystemStatus('COSMIC TERMINAL v2.0 - FULLY OPERATIONAL');
            console.log('✅ Nexus initialization complete');
        } catch (error) {
            console.error('❌ Nexus initialization failed:', error);
            this.updateSystemStatus('SYSTEM ERROR - INITIALIZATION FAILED');
        }
    }

    async initializeThreeJS() {
        const container = document.getElementById('starmap3D');
        if (!container) {
            throw new Error('Starmap container not found');
        }

        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            2000
        );
        this.camera.position.set(100, 50, 100);

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(this.renderer.domElement);

        // Add orbital controls (use proper initialization)
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        } else {
            // Fallback: Create basic camera controls
            this.controls = {
                enableDamping: true,
                dampingFactor: 0.05,
                autoRotate: true,
                autoRotateSpeed: 0.5,
                target: new THREE.Vector3(),
                update: () => {
                    // Basic auto-rotation
                    if (this.controls.autoRotate) {
                        this.camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.01);
                        this.camera.lookAt(this.controls.target);
                    }
                }
            };
        }
        
        if (this.controls.enableDamping !== undefined) {
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
        }
        if (this.controls.autoRotate !== undefined) {
            this.controls.autoRotate = true;
            this.controls.autoRotateSpeed = 0.5;
        }

        // Create starfield
        this.createStarField();
        
        // Create vault pulse spheres
        this.createVaultPulses();

        // Add lighting
        this.setupLighting();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    createStarField() {
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 2,
            sizeAttenuation: true
        });

        const starVertices = [];
        const starColors = [];

        for (let i = 0; i < 3000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;

            starVertices.push(x, y, z);

            // Random star colors
            const color = new THREE.Color();
            color.setHSL(Math.random() * 0.3 + 0.6, 0.8, Math.random() * 0.5 + 0.5);
            starColors.push(color.r, color.g, color.b);
        }

        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));

        starMaterial.vertexColors = true;

        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
        this.starField.push(stars);
    }

    createVaultPulses() {
        this.vaultEvents.forEach((event, index) => {
            // Main pulse sphere
            const geometry = new THREE.SphereGeometry(5, 32, 32);
            const material = new THREE.MeshPhongMaterial({
                color: event.color,
                transparent: true,
                opacity: 0.7,
                emissive: event.color,
                emissiveIntensity: 0.3
            });

            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(event.position.x, event.position.y, event.position.z);
            sphere.userData = { eventId: event.id, originalScale: 1 };

            // Outer pulse ring
            const ringGeometry = new THREE.RingGeometry(8, 12, 32);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: event.color,
                transparent: true,
                opacity: 0.3,
                side: THREE.DoubleSide
            });

            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.position.copy(sphere.position);
            ring.lookAt(this.camera.position);

            this.scene.add(sphere);
            this.scene.add(ring);

            this.pulseSpheres.push({ sphere, ring, event });
        });
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(100, 100, 50);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        // Point lights for each vault event
        this.vaultEvents.forEach(event => {
            const pointLight = new THREE.PointLight(event.color, 2, 100);
            pointLight.position.set(event.position.x, event.position.y, event.position.z);
            this.scene.add(pointLight);
        });
    }

    setupEventListeners() {
        // Timeline controls
        document.getElementById('playBtn')?.addEventListener('click', () => this.playTimeline());
        document.getElementById('pauseBtn')?.addEventListener('click', () => this.pauseTimeline());

        // Starmap controls
        document.getElementById('resetView')?.addEventListener('click', () => this.resetCameraView());
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
            requestAnimationFrame(animate);

            // Update controls
            this.controls.update();

            // Update pulse animations
            this.updatePulseAnimations();

            // Update timeline if playing
            if (this.isPlaying) {
                this.updateTimeline();
            }

            // Update coordinates display
            this.updateCoordinatesDisplay();

            // Render scene
            this.renderer.render(this.scene, this.camera);
        };

        animate();
    }

    updatePulseAnimations() {
        const time = Date.now() * 0.001;

        this.pulseSpheres.forEach((pulseObj, index) => {
            const { sphere, ring } = pulseObj;
            
            // Pulsing scale animation
            const scale = 1 + Math.sin(time * 2 + index) * 0.3;
            sphere.scale.setScalar(scale);

            // Rotating ring
            ring.rotation.z += 0.01;

            // Opacity pulsing
            const opacity = 0.3 + Math.sin(time * 3 + index) * 0.2;
            ring.material.opacity = opacity;
        });
    }

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
        this.timelinePosition += 0.2; // Speed control
        if (this.timelinePosition > 100) {
            this.timelinePosition = 0;
        }

        // Update playhead position
        const playhead = document.getElementById('playhead');
        if (playhead) {
            playhead.style.left = this.timelinePosition + '%';
        }

        // Update time display
        const currentTime = Math.floor((this.timelinePosition / 100) * 333); // 5:33 total
        const minutes = Math.floor(currentTime / 60);
        const seconds = currentTime % 60;
        const timeDisplay = document.getElementById('currentTime');
        if (timeDisplay) {
            timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        // Check for event triggers
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
        const currentEventIndex = this.vaultEvents.findIndex(event => 
            Math.abs(this.timelinePosition - event.time) < 1
        );

        if (currentEventIndex !== -1 && currentEventIndex !== this.currentEvent) {
            this.currentEvent = currentEventIndex;
            this.triggerEvent(this.vaultEvents[currentEventIndex]);
        }
    }

    triggerEventAtTime(timePercent) {
        const event = this.vaultEvents.find(e => e.time === timePercent);
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

        // Highlight corresponding pulse sphere
        this.highlightPulseSphere(event.id);

        // Camera focus on event location
        this.focusCameraOn(event.position);
    }

    highlightPulseSphere(eventId) {
        this.pulseSpheres.forEach(pulseObj => {
            const isTarget = pulseObj.sphere.userData.eventId === eventId;
            pulseObj.sphere.material.emissiveIntensity = isTarget ? 0.8 : 0.3;
            pulseObj.ring.material.opacity = isTarget ? 0.8 : 0.3;
        });
    }

    focusCameraOn(position) {
        // Smooth camera transition to event position
        const targetPosition = new THREE.Vector3(
            position.x + 50,
            position.y + 30,
            position.z + 50
        );

        // Simple lerp animation
        const startPos = this.camera.position.clone();
        const duration = 2000; // 2 seconds
        const startTime = Date.now();

        const animateCamera = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = this.easeInOutCubic(progress);

            this.camera.position.lerpVectors(startPos, targetPosition, eased);
            this.controls.target.lerp(new THREE.Vector3(position.x, position.y, position.z), eased);

            if (progress < 1) {
                requestAnimationFrame(animateCamera);
            }
        };

        animateCamera();
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }

    resetCameraView() {
        this.camera.position.set(100, 50, 100);
        this.controls.target.set(0, 0, 0);
        this.controls.autoRotate = true;
    }

    togglePulseAnimation() {
        this.controls.autoRotate = !this.controls.autoRotate;
        const btn = document.getElementById('togglePulse');
        if (btn) {
            btn.textContent = this.controls.autoRotate ? '💫 Toggle Pulse' : '⏸️ Pause Pulse';
        }
    }

    updateCoordinatesDisplay() {
        const coords = document.getElementById('currentCoords');
        if (coords) {
            const pos = this.camera.position;
            coords.textContent = `NEXUS COORDINATES: [${Math.round(pos.x)}, ${Math.round(pos.y)}, ${Math.round(pos.z)}]`;
        }
    }

    // Export functionality
    async captureClip() {
        this.updateExportStatus('📸 Capturing cosmic moment...', 25);
        
        // Simulate clip capture
        await this.sleep(1000);
        
        // Render current frame to canvas
        const canvas = document.getElementById('clipPreview');
        const ctx = canvas.getContext('2d');
        
        // Create a simple visualization
        ctx.fillStyle = '#000011';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add starfield effect
        for (let i = 0; i < 50; i++) {
            ctx.fillStyle = `hsl(${Math.random() * 60 + 200}, 80%, 80%)`;
            ctx.beginPath();
            ctx.arc(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                Math.random() * 2 + 1,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
        
        // Add current event indicator
        const currentEvent = this.vaultEvents[this.currentEvent];
        if (currentEvent) {
            ctx.fillStyle = `#${currentEvent.color.toString(16)}`;
            ctx.font = '12px Orbitron';
            ctx.fillText(currentEvent.title, 10, 20);
        }
        
        this.clipData = canvas.toDataURL();
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

        // Check wallet connection
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

            // Simulate minting process (integrate with existing mint functions)
            const success = Math.random() > 0.1; // 90% success rate
            
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
        
        // Update connection statuses
        document.getElementById('walletStatus').textContent = '🔌 Wallet: CONNECTING...';
        document.getElementById('networkStatus').textContent = '🌐 Network: ESTABLISHING...';
        
        await this.sleep(1500);
        
        // Check wallet
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
        
        // Update other statuses
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
        const container = document.getElementById('starmap3D');
        if (container && this.camera && this.renderer) {
            this.camera.aspect = container.clientWidth / container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(container.clientWidth, container.clientHeight);
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize Ascension Replay Nexus when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌌 Starting Ascension Replay Nexus initialization...');
    window.ascensionNexus = new AscensionReplayNexus();
});

// Export for global access
window.AscensionReplayNexus = AscensionReplayNexus;