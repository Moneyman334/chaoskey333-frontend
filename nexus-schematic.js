// Ascension Replay Nexus - Interactive Schematic Logic

document.addEventListener('DOMContentLoaded', function() {
    initializeNexusSchematic();
});

function initializeNexusSchematic() {
    console.log('🌌 Initializing Ascension Replay Nexus Schematic...');
    
    // Initialize interactive elements
    setupPRNodeInteractions();
    setupFlowAnimations();
    setupDocumentationTooltips();
    setupAudioFeedback();
    
    // Start the ecosystem simulation
    startEcosystemSimulation();
    
    console.log('⚡ Nexus Schematic fully initialized');
}

// PR Node Interactions
function setupPRNodeInteractions() {
    const prNodes = document.querySelectorAll('.pr-node');
    
    prNodes.forEach(node => {
        // Mouse hover effects
        node.addEventListener('mouseenter', function() {
            this.style.filter = 'url(#glow) brightness(1.5)';
            this.style.transform = 'scale(1.1)';
            
            // Show PR details
            showPRDetails(this);
        });
        
        node.addEventListener('mouseleave', function() {
            this.style.filter = 'url(#pulse)';
            this.style.transform = 'scale(1)';
            
            // Hide PR details
            hidePRDetails();
        });
        
        // Click interactions
        node.addEventListener('click', function() {
            triggerPRActivation(this);
        });
    });
}

// Show PR details on hover
function showPRDetails(node) {
    const className = node.getAttribute('class');
    let details = '';
    
    if (className.includes('pr-8')) {
        details = 'PR #8: Enhanced Playback Engine Foundation';
    } else if (className.includes('pr-9')) {
        details = 'PR #9: Advanced Audio Processing Pipeline';
    } else if (className.includes('pr-10')) {
        details = 'PR #10: Real-time Synchronization System';
    } else if (className.includes('pr-23')) {
        details = 'PR #23: Live Spectral Decode HUD Implementation';
    } else if (className.includes('pr-24')) {
        details = 'PR #24: Permanent Relic Evolution Trigger';
    }
    
    // Create or update tooltip
    let tooltip = document.getElementById('pr-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'pr-tooltip';
        tooltip.style.cssText = `
            position: fixed;
            background: linear-gradient(135deg, rgba(0,255,255,0.9) 0%, rgba(0,100,255,0.9) 100%);
            color: #000;
            padding: 8px 12px;
            border-radius: 5px;
            font-family: 'Orbitron', sans-serif;
            font-size: 12px;
            font-weight: 600;
            z-index: 1000;
            pointer-events: none;
            box-shadow: 0 0 15px rgba(0,255,255,0.5);
            transform: translateY(-5px);
        `;
        document.body.appendChild(tooltip);
    }
    
    tooltip.textContent = details;
    tooltip.style.display = 'block';
    
    // Position tooltip
    document.addEventListener('mousemove', updateTooltipPosition);
}

function hidePRDetails() {
    const tooltip = document.getElementById('pr-tooltip');
    if (tooltip) {
        tooltip.style.display = 'none';
    }
    document.removeEventListener('mousemove', updateTooltipPosition);
}

function updateTooltipPosition(e) {
    const tooltip = document.getElementById('pr-tooltip');
    if (tooltip) {
        tooltip.style.left = (e.clientX + 10) + 'px';
        tooltip.style.top = (e.clientY - 30) + 'px';
    }
}

// Trigger PR activation animation
function triggerPRActivation(node) {
    // Create ripple effect
    const ripple = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    const nodeRect = node.getBBox();
    
    ripple.setAttribute('cx', nodeRect.x + nodeRect.width / 2);
    ripple.setAttribute('cy', nodeRect.y + nodeRect.height / 2);
    ripple.setAttribute('r', '0');
    ripple.setAttribute('fill', 'none');
    ripple.setAttribute('stroke', '#ffffff');
    ripple.setAttribute('stroke-width', '2');
    ripple.setAttribute('opacity', '0.8');
    
    // Add to SVG
    const svg = document.querySelector('.cosmic-circuit');
    svg.appendChild(ripple);
    
    // Animate ripple
    const animation = ripple.animate([
        { r: '0', opacity: '0.8' },
        { r: '60', opacity: '0' }
    ], {
        duration: 1000,
        easing: 'ease-out'
    });
    
    animation.onfinish = () => {
        svg.removeChild(ripple);
    };
    
    // Trigger ecosystem pulse
    triggerEcosystemPulse();
    
    console.log(`🔥 PR Node activated:`, node.getAttribute('class'));
}

// Flow Animation System
function setupFlowAnimations() {
    const flows = document.querySelectorAll('.major-flow, .loop-flow');
    
    flows.forEach(flow => {
        // Create animated particles along the path
        if (flow.classList.contains('loop-flow')) {
            createLoopParticles(flow);
        } else {
            createFlowParticles(flow);
        }
    });
}

function createFlowParticles(flow) {
    const pathLength = flow.getTotalLength();
    const particleCount = 3;
    
    for (let i = 0; i < particleCount; i++) {
        setTimeout(() => {
            createParticle(flow, pathLength);
        }, i * 1000);
    }
    
    // Repeat particles
    setInterval(() => {
        for (let i = 0; i < particleCount; i++) {
            setTimeout(() => {
                createParticle(flow, pathLength);
            }, i * 1000);
        }
    }, 4000);
}

function createLoopParticles(flow) {
    const pathLength = flow.getTotalLength();
    const particleCount = 5;
    
    for (let i = 0; i < particleCount; i++) {
        setTimeout(() => {
            createLoopParticle(flow, pathLength);
        }, i * 600);
    }
    
    // Repeat loop particles
    setInterval(() => {
        for (let i = 0; i < particleCount; i++) {
            setTimeout(() => {
                createLoopParticle(flow, pathLength);
            }, i * 600);
        }
    }, 5000);
}

function createParticle(path, pathLength) {
    const particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    particle.setAttribute('r', '3');
    particle.setAttribute('fill', '#ffffff');
    particle.setAttribute('opacity', '0.8');
    
    const svg = document.querySelector('.cosmic-circuit');
    svg.appendChild(particle);
    
    let distance = 0;
    const speed = pathLength / 2000; // 2 seconds to travel
    
    function animateParticle() {
        const point = path.getPointAtLength(distance);
        particle.setAttribute('cx', point.x);
        particle.setAttribute('cy', point.y);
        
        distance += speed * 16; // ~60fps
        
        if (distance <= pathLength) {
            requestAnimationFrame(animateParticle);
        } else {
            svg.removeChild(particle);
        }
    }
    
    animateParticle();
}

function createLoopParticle(path, pathLength) {
    const particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    particle.setAttribute('r', '4');
    particle.setAttribute('fill', '#ffff00');
    particle.setAttribute('opacity', '0.9');
    
    const svg = document.querySelector('.cosmic-circuit');
    svg.appendChild(particle);
    
    let distance = 0;
    const speed = pathLength / 3000; // 3 seconds to travel
    
    function animateLoopParticle() {
        const point = path.getPointAtLength(distance);
        particle.setAttribute('cx', point.x);
        particle.setAttribute('cy', point.y);
        
        // Add glow effect
        particle.style.filter = 'url(#glow)';
        
        distance += speed * 16;
        
        if (distance <= pathLength) {
            requestAnimationFrame(animateLoopParticle);
        } else {
            svg.removeChild(particle);
        }
    }
    
    animateLoopParticle();
}

// Documentation Tooltips
function setupDocumentationTooltips() {
    const docCards = document.querySelectorAll('.doc-card');
    
    docCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
            this.style.boxShadow = '0 15px 40px rgba(0,255,255,0.4)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 10px 30px rgba(0,255,255,0.3)';
        });
    });
}

// Audio Feedback System
function setupAudioFeedback() {
    // Create audio context for sound effects
    let audioContext;
    
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.log('Audio context not supported');
        return;
    }
    
    // Sound effects for interactions
    window.playNodeSound = function() {
        if (!audioContext) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    };
    
    // Add sound to PR nodes
    const prNodes = document.querySelectorAll('.pr-node');
    prNodes.forEach(node => {
        node.addEventListener('click', window.playNodeSound);
    });
}

// Ecosystem Simulation
function startEcosystemSimulation() {
    // Simulate ecosystem activity
    setInterval(() => {
        simulateReplayActivity();
    }, 8000);
    
    setInterval(() => {
        simulateDecodeActivity();
    }, 12000);
    
    setInterval(() => {
        simulateEvolutionActivity();
    }, 15000);
    
    console.log('🔄 Ecosystem simulation started');
}

function simulateReplayActivity() {
    const replaySection = document.querySelector('.replay-section');
    if (replaySection) {
        replaySection.style.filter = 'brightness(1.3)';
        setTimeout(() => {
            replaySection.style.filter = 'brightness(1)';
        }, 1000);
    }
}

function simulateDecodeActivity() {
    const spectralLines = document.querySelectorAll('.spectral-line');
    spectralLines.forEach((line, index) => {
        setTimeout(() => {
            line.style.strokeWidth = '3';
            line.style.opacity = '1';
            setTimeout(() => {
                line.style.strokeWidth = '1';
                line.style.opacity = '0.6';
            }, 800);
        }, index * 200);
    });
}

function simulateEvolutionActivity() {
    const evolutionParticles = document.querySelectorAll('.evolution-particle');
    evolutionParticles.forEach(particle => {
        particle.style.animationDuration = '0.5s';
        setTimeout(() => {
            particle.style.animationDuration = '2s';
        }, 2000);
    });
}

function triggerEcosystemPulse() {
    const nexusCore = document.querySelector('.nexus-core');
    if (nexusCore) {
        nexusCore.style.filter = 'brightness(1.5) url(#glow)';
        setTimeout(() => {
            nexusCore.style.filter = 'brightness(1)';
        }, 1500);
    }
    
    // Pulse all flows
    const flows = document.querySelectorAll('.major-flow, .loop-flow');
    flows.forEach(flow => {
        flow.style.animationDuration = '0.5s';
        setTimeout(() => {
            flow.style.animationDuration = '3s';
        }, 1000);
    });
}

// Utility Functions
function logEcosystemEvent(event, details) {
    console.log(`🌌 Nexus Event: ${event}`, details);
}

// Export functions for external use
window.NexusSchematic = {
    triggerPRActivation,
    triggerEcosystemPulse,
    simulateReplayActivity,
    simulateDecodeActivity,
    simulateEvolutionActivity
};

console.log('📡 Nexus Schematic JavaScript loaded successfully');