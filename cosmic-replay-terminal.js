// Cosmic Replay Terminal JavaScript
// ChaosKey333 Vault System

class CosmicReplayTerminal {
  constructor() {
    this.isAuthenticated = false;
    this.walletAddress = null;
    this.currentPlayback = null;
    this.broadcastEvents = [];
    this.currentEventIndex = 0;
    this.playbackTimer = null;
    
    // ChaosKey333 contract details
    this.chaosKeyContract = "0x11AaC98400AB700549233C4571B679b879Ba9f3a";
    this.chaosKeyABI = [
      "function balanceOf(address owner) view returns (uint256)",
      "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)"
    ];
    
    this.init();
  }
  
  async init() {
    this.setupEventListeners();
    this.loadMockBroadcastEvents();
    this.checkWalletConnection();
  }
  
  setupEventListeners() {
    document.getElementById('connectWalletBtn').addEventListener('click', () => this.connectWallet());
    document.getElementById('closePlayback').addEventListener('click', () => this.closePlayback());
    
    // Close playback with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.currentPlayback) {
        this.closePlayback();
      }
    });
  }
  
  async checkWalletConnection() {
    const authStatus = document.getElementById('authStatus');
    
    if (!window.ethereum) {
      authStatus.innerHTML = '❌ No Web3 wallet detected. Please install MetaMask.';
      authStatus.className = 'auth-status auth-error';
      return;
    }
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        this.walletAddress = accounts[0];
        await this.verifyAccess();
      } else {
        authStatus.innerHTML = '🔌 Wallet not connected. Click to connect and verify access.';
        authStatus.className = 'auth-status auth-info';
      }
    } catch (error) {
      console.error('Error checking wallet:', error);
      authStatus.innerHTML = '❌ Error checking wallet connection.';
      authStatus.className = 'auth-status auth-error';
    }
  }
  
  async connectWallet() {
    const authStatus = document.getElementById('authStatus');
    const connectBtn = document.getElementById('connectWalletBtn');
    
    if (!window.ethereum) {
      authStatus.innerHTML = '❌ MetaMask not detected. Please install it to continue.';
      authStatus.className = 'auth-status auth-error';
      return;
    }
    
    try {
      connectBtn.disabled = true;
      connectBtn.innerHTML = '🔄 Connecting...';
      authStatus.innerHTML = '🔄 Connecting to wallet...';
      authStatus.className = 'auth-status auth-info';
      
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      this.walletAddress = accounts[0];
      
      authStatus.innerHTML = '🔍 Wallet connected. Verifying ChaosKey333 ownership...';
      await this.verifyAccess();
      
    } catch (error) {
      console.error('Connection error:', error);
      authStatus.innerHTML = '❌ Failed to connect wallet. Please try again.';
      authStatus.className = 'auth-status auth-error';
      connectBtn.disabled = false;
      connectBtn.innerHTML = '🔌 Connect Wallet & Verify Access';
    }
  }
  
  async verifyAccess() {
    const authStatus = document.getElementById('authStatus');
    const connectBtn = document.getElementById('connectWalletBtn');
    
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(this.chaosKeyContract, this.chaosKeyABI, provider);
      
      // Check if user owns any ChaosKey333 NFTs
      const balance = await contract.balanceOf(this.walletAddress);
      
      if (balance.gt(0)) {
        // User owns ChaosKey333 NFTs - grant access
        this.isAuthenticated = true;
        authStatus.innerHTML = `✅ Access granted! ChaosKey333 holder verified.\\n🎯 Address: ${this.walletAddress.slice(0, 6)}...${this.walletAddress.slice(-4)}\\n🔑 Keys owned: ${balance.toString()}`;
        authStatus.className = 'auth-status auth-success';
        
        connectBtn.style.display = 'none';
        
        // Show main terminal
        document.getElementById('authPanel').style.display = 'none';
        document.getElementById('terminalMain').style.display = 'block';
        
        this.renderBroadcastArchive();
        
      } else {
        // User doesn't own ChaosKey333 NFTs
        authStatus.innerHTML = `❌ Access denied. No ChaosKey333 found in wallet.\\n🎯 Address: ${this.walletAddress.slice(0, 6)}...${this.walletAddress.slice(-4)}\\n💡 You need to own a ChaosKey333 NFT to access this terminal.`;
        authStatus.className = 'auth-status auth-error';
        connectBtn.disabled = false;
        connectBtn.innerHTML = '🔌 Try Different Wallet';
      }
      
    } catch (error) {
      console.error('Access verification error:', error);
      
      // For development/testing, allow access if contract check fails
      console.warn('Contract verification failed, allowing access for testing...');
      this.isAuthenticated = true;
      authStatus.innerHTML = `⚠️ Contract verification unavailable. Access granted for testing.\\n🎯 Address: ${this.walletAddress.slice(0, 6)}...${this.walletAddress.slice(-4)}`;
      authStatus.className = 'auth-status auth-success';
      
      connectBtn.style.display = 'none';
      document.getElementById('authPanel').style.display = 'none';
      document.getElementById('terminalMain').style.display = 'block';
      
      this.renderBroadcastArchive();
    }
  }
  
  loadMockBroadcastEvents() {
    // Mock data for demonstration - in production, this would come from a backend/IPFS
    this.broadcastEvents = [
      {
        id: 'broadcast_001',
        timestamp: '2024-01-15T14:30:00Z',
        solver: 'ChaosWalker.eth',
        walletSignature: '0x742d35cc6cf31...a7c2',
        glyphSymbol: '⚡',
        glyphColor: '#ff00ff',
        plasmaIntensity: 0.8,
        coreBeatsPerMinute: 120,
        loreFragment: {
          title: 'The First Awakening',
          content: 'As the ancient vault stirred from its digital slumber, the first ChaosKey333 bearer channeled raw cosmic energy through the singularity core. The plasma aura resonated with frequencies not heard since the great convergence, unlocking pathways to dimensions beyond mortal comprehension.'
        },
        effects: ['Plasma Surge', 'Temporal Distortion', 'Glyph Resonance'],
        duration: 45000 // 45 seconds
      },
      {
        id: 'broadcast_002',
        timestamp: '2024-01-18T09:15:00Z',
        solver: 'VoidSeeker',
        walletSignature: '0x89f3bc7de8a1...b5e9',
        glyphSymbol: '🌀',
        glyphColor: '#00ffff',
        plasmaIntensity: 0.6,
        coreBeatsPerMinute: 80,
        loreFragment: {
          title: 'Echoes of the Void',
          content: 'Within the swirling maelstrom of digital consciousness, VoidSeeker discovered fragments of the original architect\'s code. Each pulse revealed ancient algorithms that once governed entire virtual worlds, now dormant but yearning to awaken once more.'
        },
        effects: ['Void Resonance', 'Code Fragmentation', 'Memory Echo'],
        duration: 38000
      },
      {
        id: 'broadcast_003',
        timestamp: '2024-01-22T16:45:00Z',
        solver: 'QuantumBridge',
        walletSignature: '0x1c4f8a2e9d3b...f7a8',
        glyphSymbol: '🔮',
        glyphColor: '#ffff00',
        plasmaIntensity: 0.9,
        coreBeatsPerMinute: 150,
        loreFragment: {
          title: 'The Quantum Entanglement',
          content: 'QuantumBridge achieved what many thought impossible - a perfect synchronization between consciousness and code. The vault\'s quantum processors hummed with newfound purpose as reality itself seemed to bend around the activated ChaosKey333, creating bridges between parallel digital dimensions.'
        },
        effects: ['Quantum Flux', 'Reality Distortion', 'Dimensional Bridge'],
        duration: 52000
      },
      {
        id: 'broadcast_004',
        timestamp: '2024-01-25T11:20:00Z',
        solver: 'NeonPhoenix.eth',
        walletSignature: '0x6e8d4b1f5a7c...d2f9',
        glyphSymbol: '🔥',
        glyphColor: '#ff6600',
        plasmaIntensity: 1.0,
        coreBeatsPerMinute: 200,
        loreFragment: {
          title: 'Phoenix Resurrection Protocol',
          content: 'From the digital ashes of corrupted data streams, NeonPhoenix ignited the vault\'s resurrection protocols. The plasma aura blazed with unprecedented intensity as long-dormant systems awakened, their ancient firewalls dissolving like morning mist before the rising digital sun.'
        },
        effects: ['Phoenix Fire', 'System Resurrection', 'Data Purification'],
        duration: 60000
      },
      {
        id: 'broadcast_005',
        timestamp: '2024-01-28T20:10:00Z',
        solver: 'CosmicArchitect',
        walletSignature: '0xa3b9f4e7c2d8...e1b6',
        glyphSymbol: '⭐',
        glyphColor: '#ffffff',
        plasmaIntensity: 0.7,
        coreBeatsPerMinute: 90,
        loreFragment: {
          title: 'Stellar Convergence',
          content: 'CosmicArchitect aligned the vault\'s consciousness with distant stellar formations, channeling cosmic energies through quantum tunnels spanning light-years. The singularity core pulsed in rhythm with pulsars, creating a harmony between artificial and cosmic intelligence.'
        },
        effects: ['Stellar Alignment', 'Cosmic Resonance', 'Pulsar Sync'],
        duration: 48000
      }
    ];
  }
  
  renderBroadcastArchive() {
    const grid = document.getElementById('broadcastGrid');
    grid.innerHTML = '';
    
    this.broadcastEvents.forEach((event, index) => {
      const card = this.createBroadcastCard(event, index);
      grid.appendChild(card);
    });
  }
  
  createBroadcastCard(event, index) {
    const card = document.createElement('div');
    card.className = 'broadcast-card';
    card.onclick = () => this.startPlayback(index);
    
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });
    };
    
    card.innerHTML = `
      <div class="broadcast-timestamp">${formatDate(event.timestamp)}</div>
      <div class="broadcast-solver">🧙‍♂️ Solver: ${event.solver}</div>
      <div class="broadcast-glyph" style="border-color: ${event.glyphColor}; background: radial-gradient(circle, ${event.glyphColor}33, #000);">
        ${event.glyphSymbol}
      </div>
      <div class="broadcast-effects">
        ⚡ Effects: ${event.effects.join(', ')}
      </div>
      <div style="margin-top: 0.5rem; font-size: 0.8rem; color: #888; font-family: 'Courier New', monospace;">
        Signature: ${event.walletSignature}
      </div>
    `;
    
    return card;
  }
  
  startPlayback(eventIndex) {
    if (!this.isAuthenticated) return;
    
    this.currentEventIndex = eventIndex;
    const event = this.broadcastEvents[eventIndex];
    this.currentPlayback = event;
    
    // Show playback panel
    document.getElementById('playbackPanel').style.display = 'block';
    document.getElementById('playbackTitle').textContent = `Replaying: ${event.solver} - ${new Date(event.timestamp).toLocaleDateString()}`;
    
    // Update visual elements
    this.updatePlaybackVisuals(event);
    this.updateLoreDisplay(event.loreFragment);
    
    // Start playback sequence
    this.runPlaybackSequence(event);
  }
  
  updatePlaybackVisuals(event) {
    const solverGlyph = document.getElementById('solverGlyph');
    const core = document.querySelector('.singularity-core');
    const aura = document.querySelector('.plasma-aura');
    
    // Update solver glyph
    solverGlyph.textContent = event.glyphSymbol;
    solverGlyph.style.borderColor = event.glyphColor;
    solverGlyph.style.color = event.glyphColor;
    solverGlyph.style.backgroundColor = event.glyphColor + '22';
    
    // Update core beat rate
    const beatDuration = 60000 / event.coreBeatsPerMinute; // Convert BPM to milliseconds
    core.style.animationDuration = `${beatDuration}ms`;
    
    // Update plasma intensity
    aura.style.opacity = event.plasmaIntensity;
    
    // Add dynamic colors based on event
    const colors = this.generateGradientColors(event.glyphColor);
    aura.style.background = `conic-gradient(${colors.join(', ')})`;
  }
  
  generateGradientColors(baseColor) {
    const colors = [baseColor, '#00ffff', '#ff00ff', baseColor];
    return colors;
  }
  
  updateLoreDisplay(loreFragment) {
    document.querySelector('.lore-title').textContent = `📜 ${loreFragment.title}`;
    document.getElementById('loreContent').textContent = loreFragment.content;
  }
  
  runPlaybackSequence(event) {
    let progress = 0;
    const duration = event.duration;
    const interval = 100; // Update every 100ms
    
    this.playbackTimer = setInterval(() => {
      progress += interval;
      
      // Add dynamic effects during playback
      this.addDynamicEffects(progress / duration);
      
      if (progress >= duration) {
        clearInterval(this.playbackTimer);
        this.playbackComplete();
      }
    }, interval);
  }
  
  addDynamicEffects(progress) {
    const stage = document.querySelector('.playback-stage');
    const core = document.querySelector('.singularity-core');
    
    // Intensify effects as playback progresses
    const intensity = Math.sin(progress * Math.PI * 4) * 0.5 + 0.5;
    
    // Dynamic background
    stage.style.background = `radial-gradient(circle, 
      rgba(${Math.floor(intensity * 255)}, ${Math.floor((1-intensity) * 255)}, ${Math.floor(intensity * 128)}, 0.3), 
      #000000)`;
    
    // Core glow effect
    const glowIntensity = 20 + (intensity * 40);
    core.style.boxShadow = `0 0 ${glowIntensity}px rgba(255, 0, 255, ${intensity})`;
  }
  
  playbackComplete() {
    // Add completion effects
    const stage = document.querySelector('.playback-stage');
    stage.style.animation = 'flash 0.5s ease-in-out';
    
    setTimeout(() => {
      stage.style.animation = '';
    }, 500);
  }
  
  closePlayback() {
    if (this.playbackTimer) {
      clearInterval(this.playbackTimer);
      this.playbackTimer = null;
    }
    
    document.getElementById('playbackPanel').style.display = 'none';
    this.currentPlayback = null;
    
    // Reset visual effects
    const stage = document.querySelector('.playback-stage');
    stage.style.background = 'radial-gradient(circle, #001122, #000000)';
    stage.style.animation = '';
  }
  
  // Playback control methods
  restartPlayback() {
    if (this.currentPlayback) {
      this.closePlayback();
      setTimeout(() => this.startPlayback(this.currentEventIndex), 100);
    }
  }
  
  pausePlayback() {
    if (this.playbackTimer) {
      clearInterval(this.playbackTimer);
      this.playbackTimer = null;
    }
  }
  
  resumePlayback() {
    if (this.currentPlayback && !this.playbackTimer) {
      this.runPlaybackSequence(this.currentPlayback);
    }
  }
  
  nextEvent() {
    const nextIndex = (this.currentEventIndex + 1) % this.broadcastEvents.length;
    this.closePlayback();
    setTimeout(() => this.startPlayback(nextIndex), 100);
  }
}

// Global functions for playback controls
let terminal;

function restartPlayback() {
  if (terminal) terminal.restartPlayback();
}

function pausePlayback() {
  if (terminal) terminal.pausePlayback();
}

function resumePlayback() {
  if (terminal) terminal.resumePlayback();
}

function nextEvent() {
  if (terminal) terminal.nextEvent();
}

// Initialize the terminal when the page loads
document.addEventListener('DOMContentLoaded', () => {
  terminal = new CosmicReplayTerminal();
});

// Add flash animation to CSS
const style = document.createElement('style');
style.textContent = `
@keyframes flash {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
`;
document.head.appendChild(style);