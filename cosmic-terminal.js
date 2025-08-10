class CosmicReplayTerminal {
    constructor() {
        this.deploymentQueue = [
            { id: 10, name: 'Ascension Edition Core', status: 'pending', description: 'Base terminal interface & vault sync' },
            { id: 11, name: 'Mood Sync Integration', status: 'pending', description: 'Real-time emotional resonance tracking' },
            { id: 23, name: 'Spectral Decode HUD', status: 'pending', description: 'Enhanced visualization overlays' },
            { id: 24, name: 'Relic Evolution Trigger', status: 'pending', description: 'Dynamic NFT transformation system' }
        ];
        
        this.isDeploying = false;
        this.deploymentStep = 0;
        this.vaultIntegrity = 100;
        this.failSafeActive = true;
        this.rollbackAvailable = false;
        this.deploymentHistory = [];
        
        this.initializeTerminal();
        this.startMoodSync();
        this.initializeWebSocket();
    }
    
    initializeTerminal() {
        document.getElementById('startDeployment').addEventListener('click', () => this.startDeploymentSequence());
        document.getElementById('emergencyRollback').addEventListener('click', () => this.initiateRollback());
        document.getElementById('diagnostics').addEventListener('click', () => this.runDiagnostics());
        
        this.log('info', '[SYSTEM] Cosmic Replay Terminal v2.0 fully operational');
        this.log('info', '[VAULT] All sentinels reporting nominal status');
        this.log('success', '[READY] Ascension sequence ready for initiation');
    }
    
    initializeWebSocket() {
        // Initialize WebSocket connection for live vault broadcast
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}`;
        
        this.log('info', '[WS] Connecting to vault broadcast...');
        
        try {
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onopen = () => {
                this.log('success', '[WS] Vault broadcast synchronized - Live feed active');
                this.updateVaultStatus('Broadcast synchronized', 'SYNCED', '4/4 ACTIVE');
            };
            
            this.ws.onmessage = (event) => {
                this.handleWebSocketMessage(JSON.parse(event.data));
            };
            
            this.ws.onclose = () => {
                this.log('warning', '[WS] Vault broadcast disconnected - Attempting reconnection...');
                setTimeout(() => this.initializeWebSocket(), 5000);
            };
            
            this.ws.onerror = (error) => {
                this.log('error', '[WS] Broadcast connection error - Using fallback mode');
                // Fall back to simulated updates
                this.simulateWebSocketUpdates();
            };
            
        } catch (error) {
            this.log('error', '[WS] WebSocket initialization failed - Using simulation mode');
            this.simulateWebSocketUpdates();
        }
        
        // Periodic vault integrity checks
        setInterval(() => {
            this.performVaultIntegrityCheck();
        }, 10000);
    }
    
    handleWebSocketMessage(message) {
        switch (message.type) {
            case 'vault_status':
                this.updateVaultStatusFromServer(message.data);
                break;
            case 'deployment_started':
                this.log('info', '[WS] Deployment sequence started');
                break;
            case 'deployment_completed':
                this.log('success', '[WS] Deployment sequence completed successfully');
                this.completeDeployment();
                break;
            case 'deployment_failed':
                this.log('error', `[WS] Deployment failed: ${message.data.error}`);
                this.resetDeploymentState();
                break;
            case 'pr_deployment_started':
                this.log('info', `[WS] Starting deployment of PR #${message.data.pr}`);
                this.updatePRStatus(message.data.pr, 'deploying');
                break;
            case 'pr_deployment_completed':
                this.log('success', `[WS] PR #${message.data.pr} deployed successfully`);
                this.updatePRStatus(message.data.pr, 'success');
                break;
            case 'rollback_started':
                this.log('warning', '[WS] Emergency rollback initiated');
                break;
            case 'rollback_completed':
                this.log('success', '[WS] Emergency rollback completed');
                this.resetDeploymentState();
                break;
            case 'log':
                this.log(message.data.level, `[SERVER] ${message.data.message}`);
                break;
            case 'diagnostics_completed':
                this.handleDiagnosticsResult(message.data);
                break;
        }
    }
    
    simulateWebSocketUpdates() {
        // Fallback simulation when WebSocket is not available
        setTimeout(() => {
            this.log('success', '[SIM] Vault broadcast synchronized - Simulation mode active');
            this.updateVaultStatus('Simulation Mode', 'SIMULATED', '4/4 VIRTUAL');
        }, 2000);
    }
    
    startMoodSync() {
        const moodStates = ['Harmonized', 'Resonating', 'Calibrated', 'Synchronized', 'Amplified'];
        let moodIndex = 0;
        
        setInterval(() => {
            document.getElementById('moodStatus').textContent = moodStates[moodIndex];
            moodIndex = (moodIndex + 1) % moodStates.length;
        }, 3000);
    }
    
    async startDeploymentSequence() {
        if (this.isDeploying) return;
        
        this.isDeploying = true;
        this.rollbackAvailable = true;
        document.getElementById('startDeployment').disabled = true;
        document.getElementById('emergencyRollback').disabled = false;
        
        this.log('success', '🚀 [DEPLOY] Initiating Ascension sequence...');
        this.log('info', '[DEPLOY] Contacting deployment orchestrator...');
        
        try {
            // Call the backend API to start deployment
            const response = await fetch('/api/deploy/ascension', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.log('success', '[API] Deployment sequence initiated successfully');
                // The WebSocket will handle real-time updates
            } else {
                this.log('error', `[API] Deployment failed: ${result.error}`);
                this.resetDeploymentState();
            }
            
        } catch (error) {
            this.log('error', `[API] Connection failed: ${error.message}`);
            this.resetDeploymentState();
            // Fall back to simulated deployment
            await this.simulateDeploymentSequence();
        }
    }
    
    async simulateDeploymentSequence() {
        this.log('warning', '[SIMULATE] Running local simulation mode...');
        this.log('info', '[DEPLOY] Cascading PR merge protocol activated');
        
        for (let i = 0; i < this.deploymentQueue.length; i++) {
            const pr = this.deploymentQueue[i];
            
            // Check vault integrity before each deployment
            if (this.vaultIntegrity < 85) {
                this.log('error', `[FAIL-SAFE] Vault integrity below threshold (${this.vaultIntegrity}%)`);
                this.log('warning', '[FAIL-SAFE] Deployment halted for stability');
                await this.initiateRollback();
                return;
            }
            
            await this.deployPR(pr);
            
            // Simulate potential deployment issues
            if (Math.random() < 0.1) { // 10% chance of failure for demo
                this.log('error', `[DEPLOY] Critical error in PR #${pr.id} deployment`);
                this.log('warning', '[FAIL-SAFE] Initiating emergency protocols...');
                await this.initiateRollback();
                return;
            }
            
            this.deploymentStep++;
        }
        
        this.completeDeployment();
    }
    
    async deployPR(pr) {
        this.log('info', `[DEPLOY] Starting PR #${pr.id} - ${pr.name}`);
        this.updatePRStatus(pr.id, 'deploying');
        
        // Simulate deployment time
        await this.delay(2000 + Math.random() * 3000);
        
        // Simulate deployment steps
        const steps = this.getDeploymentSteps(pr.id);
        for (const step of steps) {
            this.log('info', `[PR-${pr.id}] ${step}`);
            await this.delay(500 + Math.random() * 1000);
            
            // Simulate vault integrity fluctuation during deployment
            this.vaultIntegrity -= Math.random() * 5;
            this.updateVaultStatus(null, null, null, this.vaultIntegrity);
        }
        
        // Apply specific PR effects
        this.applyPREffects(pr.id);
        
        this.updatePRStatus(pr.id, 'success');
        this.log('success', `[DEPLOY] PR #${pr.id} deployed successfully`);
        this.deploymentHistory.push({ pr: pr.id, timestamp: new Date(), status: 'success' });
        
        // Restore some vault integrity after successful deployment
        this.vaultIntegrity += Math.random() * 3;
        this.vaultIntegrity = Math.min(100, this.vaultIntegrity);
        this.updateVaultStatus(null, null, null, this.vaultIntegrity);
    }
    
    getDeploymentSteps(prId) {
        const steps = {
            10: [
                'Initializing Ascension Edition core modules',
                'Establishing quantum entanglement protocols',
                'Calibrating Sentinel consciousness matrices',
                'Synchronizing with cosmic frequency 333.33 Hz'
            ],
            11: [
                'Deploying emotional resonance sensors',
                'Activating neural pathway synchronization',
                'Establishing mood harmonics baseline',
                'Integrating with Ascension consciousness grid'
            ],
            23: [
                'Installing spectral decode algorithms',
                'Activating holographic overlay systems',
                'Calibrating dimensional visualization matrices',
                'Syncing with reality distortion fields'
            ],
            24: [
                'Initializing relic evolution protocols',
                'Activating NFT metamorphosis engines',
                'Establishing transformation trigger mechanisms',
                'Linking to cosmic evolution sequences'
            ]
        };
        return steps[prId] || ['Deploying component...'];
    }
    
    applyPREffects(prId) {
        switch (prId) {
            case 10:
                // Ascension Edition - Enable advanced features
                document.body.style.background = 'linear-gradient(135deg, #0a0a0a 0%, #2e0a1a 50%, #3e162e 100%)';
                this.log('success', '[ASCENSION] Reality matrix upgraded to v2.0');
                break;
                
            case 11:
                // Mood Sync - Update mood indicator more dynamically
                this.log('success', '[MOOD-SYNC] Emotional resonance tracking online');
                break;
                
            case 23:
                // Spectral Decode HUD - Enhanced visual effects
                const overlay = document.querySelector('.spectral-overlay');
                overlay.style.background = 'linear-gradient(45deg, transparent 20%, rgba(0, 255, 136, 0.2) 50%, rgba(136, 0, 255, 0.1) 80%)';
                this.log('success', '[SPECTRAL-HUD] Enhanced visualization protocols active');
                break;
                
            case 24:
                // Relic Evolution - Add evolution indicators
                this.log('success', '[RELIC-EVO] NFT transformation matrix initialized');
                break;
        }
    }
    
    async completeDeployment() {
        this.log('success', '🌟 [COMPLETE] Ascension sequence fully deployed!');
        this.log('info', '[VAULT] All systems operating at optimal parameters');
        this.log('info', '[SYNC] Cosmic Replay Terminal v2.0 fully synchronized');
        
        // Final vault integrity boost
        this.vaultIntegrity = Math.min(100, this.vaultIntegrity + 10);
        this.updateVaultStatus('Ascension Complete', 'OPTIMAL', '4/4 ASCENDED');
        
        this.isDeploying = false;
        document.getElementById('startDeployment').textContent = '✨ Ascension Complete';
        document.getElementById('emergencyRollback').disabled = true;
        
        // Add completion effects
        this.addAscensionEffects();
    }
    
    async initiateRollback() {
        if (!this.rollbackAvailable) return;
        
        this.log('warning', '🛡️ [ROLLBACK] Emergency rollback initiated');
        
        try {
            // Call the backend API for rollback
            const response = await fetch('/api/deploy/rollback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.log('success', '[API] Emergency rollback initiated successfully');
                // WebSocket will handle real-time updates
            } else {
                this.log('error', `[API] Rollback failed: ${result.error}`);
                // Fall back to local rollback simulation
                await this.simulateRollback();
            }
            
        } catch (error) {
            this.log('error', `[API] Rollback connection failed: ${error.message}`);
            // Fall back to local rollback simulation
            await this.simulateRollback();
        }
    }
    
    async simulateRollback() {
        this.log('warning', '[SIMULATE] Running local rollback simulation...');
        this.log('info', '[ROLLBACK] Engaging vault stability protocols');
        
        // Mark failed PRs
        for (let i = this.deploymentStep; i >= 0; i--) {
            const pr = this.deploymentQueue[i];
            if (pr.status === 'deploying' || pr.status === 'success') {
                this.updatePRStatus(pr.id, 'failed');
                this.log('warning', `[ROLLBACK] Rolling back PR #${pr.id}`);
                await this.delay(1000);
            }
        }
        
        // Reset vault to stable state
        this.vaultIntegrity = 95;
        this.updateVaultStatus('Rollback Complete', 'STABLE', '4/4 SECURED');
        
        this.resetDeploymentState();
        this.log('success', '[ROLLBACK] Vault stability restored - Ready for retry');
        
        // Reset PR statuses for retry
        setTimeout(() => {
            this.resetDeploymentQueue();
        }, 5000);
    }
    
    resetDeploymentState() {
        this.isDeploying = false;
        this.rollbackAvailable = false;
        document.getElementById('startDeployment').disabled = false;
        document.getElementById('startDeployment').textContent = '🔄 Retry Ascension';
        document.getElementById('emergencyRollback').disabled = true;
    }
    
    resetDeploymentQueue() {
        this.deploymentQueue.forEach(pr => {
            this.updatePRStatus(pr.id, 'pending');
        });
        this.deploymentStep = 0;
        this.log('info', '[SYSTEM] Deployment queue reset - Ready for new sequence');
    }
    
    runDiagnostics() {
        this.log('info', '🔍 [DIAG] Running comprehensive system diagnostics...');
        
        // Call backend diagnostics API
        fetch('/api/vault/diagnostics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                this.log('success', '[API] Diagnostics initiated successfully');
            } else {
                this.log('error', `[API] Diagnostics failed: ${result.error}`);
                this.simulateDiagnostics();
            }
        })
        .catch(error => {
            this.log('error', `[API] Diagnostics connection failed: ${error.message}`);
            this.simulateDiagnostics();
        });
    }
    
    simulateDiagnostics() {
        setTimeout(() => {
            this.log('success', '[DIAG] Vault integrity: ✓ OPTIMAL');
            this.log('success', '[DIAG] Sentinel network: ✓ SYNCHRONIZED');
            this.log('success', '[DIAG] Cosmic resonance: ✓ HARMONIZED');
            this.log('success', '[DIAG] Reality matrix: ✓ STABLE');
            this.log('success', '[DIAG] All systems nominal - Ready for operation');
        }, 2000);
    }
    
    handleDiagnosticsResult(diagnostics) {
        this.log('success', `[DIAG] Vault integrity: ✓ ${diagnostics.vaultIntegrity}%`);
        this.log('success', `[DIAG] Sentinel network: ✓ ${diagnostics.sentinelNetwork}`);
        this.log('success', `[DIAG] Cosmic resonance: ✓ ${diagnostics.cosmicResonance}`);
        this.log('success', `[DIAG] Reality matrix: ✓ ${diagnostics.realityMatrix}`);
        this.log('success', `[DIAG] Broadcast status: ✓ ${diagnostics.broadcastStatus}`);
        this.log('success', '[DIAG] All systems nominal - Ready for operation');
    }
    
    updateVaultStatusFromServer(vaultStatus) {
        this.vaultIntegrity = vaultStatus.integrity;
        this.updateVaultStatus(
            `${vaultStatus.integrity}%`,
            vaultStatus.syncStatus,
            vaultStatus.sentinels
        );
        
        if (vaultStatus.deployedFeatures && vaultStatus.deployedFeatures.length > 0) {
            this.log('info', `[VAULT] Active features: ${vaultStatus.deployedFeatures.join(', ')}`);
        }
    }
    
    performVaultIntegrityCheck() {
        // Simulate periodic integrity fluctuations
        const variation = (Math.random() - 0.5) * 2;
        this.vaultIntegrity += variation;
        this.vaultIntegrity = Math.max(85, Math.min(100, this.vaultIntegrity));
        
        this.updateVaultStatus(null, null, null, this.vaultIntegrity);
        
        if (this.vaultIntegrity < 90) {
            this.log('warning', `[VAULT] Integrity fluctuation detected: ${this.vaultIntegrity.toFixed(1)}%`);
        }
    }
    
    updatePRStatus(prId, status) {
        const prElement = document.querySelector(`[data-pr="${prId}"]`);
        if (prElement) {
            prElement.className = `pr-item ${status}`;
            const statusElement = prElement.querySelector('.pr-status');
            statusElement.textContent = status.toUpperCase();
        }
        
        // Update internal status
        const pr = this.deploymentQueue.find(p => p.id === prId);
        if (pr) pr.status = status;
    }
    
    updateVaultStatus(integrity, sync, sentinels, integrityValue = null) {
        if (integrity) document.getElementById('vaultIntegrity').textContent = integrity;
        if (sync) document.getElementById('syncStatus').textContent = sync;
        if (sentinels) document.getElementById('sentinelCount').textContent = sentinels;
        if (integrityValue !== null) {
            document.getElementById('vaultIntegrity').textContent = `${integrityValue.toFixed(1)}%`;
        }
    }
    
    addAscensionEffects() {
        // Add visual celebration effects
        const title = document.querySelector('.terminal-title');
        title.style.animation = 'pulse 1s infinite, none';
        title.style.textShadow = '0 0 30px #00ff88, 0 0 60px #00ff88';
        
        // Add particle effects (simplified)
        this.createParticleEffect();
    }
    
    createParticleEffect() {
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: fixed;
                    width: 4px;
                    height: 4px;
                    background: #00ff88;
                    border-radius: 50%;
                    left: ${Math.random() * 100}%;
                    top: ${Math.random() * 100}%;
                    animation: particle 3s ease-out forwards;
                    pointer-events: none;
                    z-index: 1000;
                `;
                
                document.body.appendChild(particle);
                
                // Remove particle after animation
                setTimeout(() => {
                    particle.remove();
                }, 3000);
            }, i * 100);
        }
        
        // Add particle animation keyframes
        if (!document.getElementById('particleStyles')) {
            const style = document.createElement('style');
            style.id = 'particleStyles';
            style.textContent = `
                @keyframes particle {
                    0% { opacity: 1; transform: scale(1) translateY(0); }
                    100% { opacity: 0; transform: scale(0) translateY(-100px); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    log(level, message) {
        const output = document.getElementById('terminalOutput');
        const entry = document.createElement('div');
        entry.className = `log-entry log-${level}`;
        entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        
        output.appendChild(entry);
        output.scrollTop = output.scrollHeight;
        
        // Keep only last 50 entries to prevent memory issues
        while (output.children.length > 50) {
            output.removeChild(output.firstChild);
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the terminal when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.cosmicTerminal = new CosmicReplayTerminal();
});

// Add some cosmic ambiance
function createCosmicAmbiance() {
    // Add subtle background animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeIn 0.5s ease-in';
            }
        });
    });
    
    document.querySelectorAll('.pr-item').forEach(item => {
        observer.observe(item);
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                document.getElementById('startDeployment').click();
                break;
            case 'r':
                e.preventDefault();
                document.getElementById('emergencyRollback').click();
                break;
            case 'd':
                e.preventDefault();
                document.getElementById('diagnostics').click();
                break;
        }
    }
});

// Initialize cosmic ambiance
createCosmicAmbiance();