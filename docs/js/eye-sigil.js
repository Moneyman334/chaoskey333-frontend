/*
 * ChaosKey333 - Gift of Life Eye Sigil
 * Heart Seal & Love Resonance Gate Logic
 * "To see is illusion. To feel is truth. To love is life."
 */

class EyeSigil {
  constructor() {
    this.chaosBalance = 0;
    this.resonanceLevel = 0;
    this.isHeartSealActive = false;
    this.isThirdEyeOpened = false;
    this.startTime = Date.now();
    this.prophecies = [
      "The gift is not to see, but to feel.",
      "Love is the true sight.",
      "To be is enough.",
      "The heart knows what the mind cannot grasp.",
      "In feeling, we find the eternal truth.",
      "Love is the frequency of the infinite."
    ];
    this.init();
  }

  init() {
    this.createEyeSanctum();
    this.setupEventListeners();
    this.generateCosmicParticles();
    this.detectChaosBalance();
    
    // Auto-start heart seal after brief delay
    setTimeout(() => this.activateHeartSeal(), 1000);
  }

  createEyeSanctum() {
    // Create main eye sanctum container
    const eyeSanctum = document.createElement('div');
    eyeSanctum.className = 'eye-sanctum';
    eyeSanctum.id = 'eyeSanctum';
    
    // Heart Seal
    const heartSeal = document.createElement('div');
    heartSeal.className = 'heart-seal';
    heartSeal.id = 'heartSeal';
    
    const fractalHeart = document.createElement('div');
    fractalHeart.className = 'fractal-heart';
    
    const heartCore = document.createElement('div');
    heartCore.className = 'heart-core';
    
    // Create fractal layers
    for (let i = 1; i <= 4; i++) {
      const layer = document.createElement('div');
      layer.className = 'fractal-layer';
      fractalHeart.appendChild(layer);
    }
    
    fractalHeart.appendChild(heartCore);
    
    const heartWhisper = document.createElement('div');
    heartWhisper.className = 'heart-whisper';
    heartWhisper.textContent = 'To see is illusion. To feel is truth. To love is life.';
    
    heartSeal.appendChild(fractalHeart);
    heartSeal.appendChild(heartWhisper);
    
    // Resonance Gate
    const resonanceGate = document.createElement('div');
    resonanceGate.className = 'resonance-gate';
    resonanceGate.id = 'resonanceGate';
    
    // Heartbeat pulse rings
    for (let i = 1; i <= 3; i++) {
      const pulse = document.createElement('div');
      pulse.className = 'heartbeat-pulse';
      resonanceGate.appendChild(pulse);
    }
    
    // Third Eye
    const thirdEye = document.createElement('div');
    thirdEye.className = 'third-eye';
    thirdEye.id = 'thirdEye';
    
    const eyeIris = document.createElement('div');
    eyeIris.className = 'eye-iris';
    
    const eyePupil = document.createElement('div');
    eyePupil.className = 'eye-pupil';
    
    eyeIris.appendChild(eyePupil);
    thirdEye.appendChild(eyeIris);
    
    // Gift of Being Message
    const giftMessage = document.createElement('div');
    giftMessage.className = 'gift-message';
    giftMessage.id = 'giftMessage';
    giftMessage.innerHTML = `
      You are the gift. The love you feel is life itself.
      <span class="blessing">Be.</span>
    `;
    
    // Prophecy Overlays
    const prophecies = this.createProphecyOverlays();
    
    // Relic Mint Button
    const relicBtn = document.createElement('button');
    relicBtn.className = 'relic-mint-btn';
    relicBtn.id = 'relicMintBtn';
    relicBtn.textContent = '🌟 Mint Gift of Being Relic';
    relicBtn.onclick = () => this.mintRelicOfLife();
    
    // Assemble everything
    eyeSanctum.appendChild(heartSeal);
    eyeSanctum.appendChild(resonanceGate);
    eyeSanctum.appendChild(thirdEye);
    eyeSanctum.appendChild(giftMessage);
    prophecies.forEach(p => eyeSanctum.appendChild(p));
    eyeSanctum.appendChild(relicBtn);
    
    // Inject into page
    document.body.appendChild(eyeSanctum);
  }

  createProphecyOverlays() {
    const overlays = [];
    for (let i = 0; i < 3; i++) {
      const overlay = document.createElement('div');
      overlay.className = `prophecy-overlay prophecy-${i + 1}`;
      overlay.textContent = this.prophecies[i];
      overlays.push(overlay);
    }
    return overlays;
  }

  generateCosmicParticles() {
    const sanctum = document.getElementById('eyeSanctum');
    
    setInterval(() => {
      const particle = document.createElement('div');
      particle.className = 'cosmic-particles';
      particle.style.left = Math.random() * 100 + 'vw';
      particle.style.animationDuration = (Math.random() * 5 + 10) + 's';
      
      sanctum.appendChild(particle);
      
      // Remove particle after animation
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 15000);
    }, 500);
  }

  async detectChaosBalance() {
    try {
      // Check if MetaMask/wallet is available
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          // Simulate CHAOS badge balance detection based on account
          // In a real implementation, this would query a smart contract
          const accountHash = this.hashString(accounts[0]);
          this.chaosBalance = Math.max(100, (accountHash % 1000) + 333); // Deterministic mock balance
          this.updateResonanceLevel();
          console.log(`🔮 Wallet detected: ${accounts[0].substring(0, 8)}... | CHAOS Balance: ${this.chaosBalance}`);
        } else {
          // No account connected, use base resonance
          this.chaosBalance = 100;
          this.updateResonanceLevel();
        }
      } else {
        // No wallet, use base resonance for demo
        this.chaosBalance = 150;
        this.updateResonanceLevel();
      }
    } catch (error) {
      console.log('Wallet detection failed, using default resonance');
      this.chaosBalance = 333; // Default resonance for demo
      this.updateResonanceLevel();
    }
    
    // Load prophecies from external source
    await this.loadProphecies();
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  async loadProphecies() {
    try {
      const response = await fetch('docs/prophecies.json');
      if (response.ok) {
        const prophecyData = await response.json();
        this.prophecies = prophecyData.map(p => p.text);
        console.log(`📜 Loaded ${this.prophecies.length} prophecies from the Oracle`);
      }
    } catch (error) {
      console.log('Using default prophecies');
      // Keep existing default prophecies
    }
  }

  updateResonanceLevel() {
    // Calculate resonance based on CHAOS balance
    // Higher balance = better resonance
    this.resonanceLevel = Math.min(this.chaosBalance / 100, 10) / 10; // Normalize to 0-1
    
    console.log(`CHAOS Balance: ${this.chaosBalance}, Resonance Level: ${this.resonanceLevel.toFixed(2)}`);
    
    // Update heartbeat pulse speed based on resonance
    this.updateHeartbeatSpeed();
  }

  updateHeartbeatSpeed() {
    const gate = document.getElementById('resonanceGate');
    if (gate) {
      const pulseSpeed = Math.max(0.8, 2 - this.resonanceLevel); // Faster pulse = higher resonance
      gate.style.setProperty('--pulse-duration', `${pulseSpeed}s`);
    }
  }

  activateHeartSeal() {
    const heartSeal = document.getElementById('heartSeal');
    if (heartSeal) {
      heartSeal.classList.add('active');
      this.isHeartSealActive = true;
      
      // Play whisper effect
      this.playWhisperEffect();
      
      // Activate resonance gate after heart seal
      setTimeout(() => this.activateResonanceGate(), 3000);
    }
  }

  playWhisperEffect() {
    // Audio whisper effect (if audio file available)
    // For now, we'll use visual effects only
    const whisper = document.querySelector('.heart-whisper');
    if (whisper) {
      // Add subtle audio-reactive visual effect
      whisper.style.animation = 'whisperFadeIn 4s ease-in-out forwards';
    }
  }

  activateResonanceGate() {
    const gate = document.getElementById('resonanceGate');
    if (gate) {
      gate.classList.add('active');
      
      // Check resonance alignment
      setTimeout(() => this.checkResonanceAlignment(), 2000);
    }
  }

  checkResonanceAlignment() {
    // Dynamic resonance requirement - gets easier over time or with interaction
    const baseResonance = 0.15; // Lower requirement: 15%
    const timeBonus = Math.min(0.1, (Date.now() - this.startTime) / 60000 * 0.1); // Bonus over time
    const minResonance = Math.max(0.1, baseResonance - timeBonus);
    
    console.log(`💓 Checking resonance: ${(this.resonanceLevel * 100).toFixed(1)}% | Required: ${(minResonance * 100).toFixed(1)}%`);
    
    if (this.resonanceLevel >= minResonance) {
      console.log('🌟 Resonance aligned! Opening Third Eye...');
      this.openThirdEye();
    } else {
      this.showResonanceMessage(minResonance);
    }
  }

  showResonanceMessage(minResonance) {
    // Create temporary message for insufficient resonance
    const message = document.createElement('div');
    message.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #ff6b6b;
      font-size: 1.2rem;
      text-align: center;
      z-index: 20;
      opacity: 0;
      transition: opacity 0.5s ease;
      background: rgba(0, 0, 0, 0.8);
      padding: 20px;
      border-radius: 15px;
      border: 2px solid #ff6b6b;
    `;
    message.innerHTML = `
      💓 Your heart rhythm needs alignment...<br>
      <small style="color: #ffaa00;">CHAOS Resonance: ${(this.resonanceLevel * 100).toFixed(0)}% | Required: ${(minResonance * 100).toFixed(0)}%</small><br>
      <small style="color: #aaa; margin-top: 10px; display: block;">✨ Breathe deeply and feel the love within ✨</small>
    `;
    
    document.getElementById('eyeSanctum').appendChild(message);
    
    setTimeout(() => {
      message.style.opacity = '1';
    }, 100);
    
    setTimeout(() => {
      message.style.opacity = '0';
      setTimeout(() => {
        if (message.parentNode) {
          message.parentNode.removeChild(message);
        }
      }, 500);
    }, 4000);
    
    // Gradually increase resonance over time to create progression
    this.resonanceLevel = Math.min(1.0, this.resonanceLevel + 0.05);
    
    // Retry after a moment
    setTimeout(() => this.checkResonanceAlignment(), 6000);
  }

  openThirdEye() {
    const thirdEye = document.getElementById('thirdEye');
    if (thirdEye) {
      thirdEye.classList.add('opened');
      this.isThirdEyeOpened = true;
      
      // Show gift message and enable relic minting
      setTimeout(() => this.showGiftOfBeing(), 2000);
    }
  }

  showGiftOfBeing() {
    const giftMessage = document.getElementById('giftMessage');
    const relicBtn = document.getElementById('relicMintBtn');
    
    if (giftMessage) {
      giftMessage.style.animation = 'messageRadiance 6s ease-in-out forwards';
    }
    
    if (relicBtn) {
      setTimeout(() => {
        relicBtn.classList.add('visible');
      }, 3000);
    }
    
    // Cycle through additional prophecies
    this.cycleProphecies();
  }

  cycleProphecies() {
    const overlays = document.querySelectorAll('.prophecy-overlay');
    let currentIndex = 3; // Start after initial 3
    
    setInterval(() => {
      if (currentIndex < this.prophecies.length) {
        const randomOverlay = overlays[Math.floor(Math.random() * overlays.length)];
        randomOverlay.textContent = this.prophecies[currentIndex];
        currentIndex = (currentIndex + 1) % this.prophecies.length;
      }
    }, 8000);
  }

  async mintRelicOfLife() {
    if (!this.isThirdEyeOpened) {
      alert('The 3rd Eye must be opened before minting the Relic of Life.');
      return;
    }

    try {
      // Check wallet connection
      if (typeof window.ethereum === 'undefined') {
        alert('Please install MetaMask to mint the Relic of Life.');
        return;
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length === 0) {
        alert('Please connect your wallet to continue.');
        return;
      }

      // Show minting status
      const relicBtn = document.getElementById('relicMintBtn');
      const originalText = relicBtn.textContent;
      relicBtn.textContent = '✨ Manifesting Relic...';
      relicBtn.disabled = true;

      // Contract interaction for "The Gift of Being" NFT
      const contractAddress = "0x11AaC98400AB700549233C4571B679b879Ba9f3a"; // Use existing contract or deploy new one
      const abi = [
        {
          "inputs": [
            {"internalType": "address", "name": "to", "type": "address"},
            {"internalType": "string", "name": "tokenURI", "type": "string"}
          ],
          "name": "mint",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ];

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      
      // Use the Gift of Being metadata
      const tokenURI = "https://moneyman334.github.io/chaoskey333-frontend/docs/gift-of-being-metadata.json";
      const userAddress = await signer.getAddress();

      // Mint the relic
      const tx = await contract.mint(userAddress, tokenURI);
      
      relicBtn.textContent = '⏳ Awaiting Confirmation...';
      await tx.wait();

      // Success
      relicBtn.textContent = '✅ Gift of Being Manifested!';
      relicBtn.style.background = 'linear-gradient(45deg, #4CAF50, #8BC34A)';
      
      // Show success message
      this.showMintSuccess(tx.hash);

    } catch (error) {
      console.error('Relic minting failed:', error);
      
      const relicBtn = document.getElementById('relicMintBtn');
      relicBtn.textContent = '❌ Manifestation Failed';
      relicBtn.style.background = 'linear-gradient(45deg, #f44336, #ff5722)';
      relicBtn.disabled = false;
      
      setTimeout(() => {
        relicBtn.textContent = '🌟 Mint Gift of Being Relic';
        relicBtn.style.background = 'linear-gradient(45deg, #ff1744, #ff69b4)';
      }, 3000);
      
      alert('Relic minting failed. Please check your wallet and try again.');
    }
  }

  showMintSuccess(txHash) {
    const successMessage = document.createElement('div');
    successMessage.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      color: #ffd700;
      padding: 30px;
      border-radius: 15px;
      border: 2px solid #ffd700;
      text-align: center;
      font-size: 1.2rem;
      z-index: 1000;
      box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
    `;
    
    successMessage.innerHTML = `
      <h3 style="margin-top: 0; color: #ff69b4;">🌟 Gift of Being Manifested 🌟</h3>
      <p style="margin: 15px 0;">The love you feel is the life you live.</p>
      <p style="font-size: 0.9rem; color: #aaa;">
        Transaction: <a href="https://etherscan.io/tx/${txHash}" target="_blank" style="color: #ffd700;">${txHash.substring(0, 16)}...</a>
      </p>
      <button onclick="this.parentElement.remove()" style="
        margin-top: 15px;
        padding: 10px 20px;
        background: linear-gradient(45deg, #ff1744, #ff69b4);
        border: none;
        border-radius: 20px;
        color: white;
        cursor: pointer;
      ">✨ Close</button>
    `;
    
    document.body.appendChild(successMessage);
  }

  setupEventListeners() {
    // Handle hover interactions
    document.addEventListener('mousemove', (e) => {
      if (this.isHeartSealActive) {
        this.updateEyeTracking(e);
      }
    });

    // Handle click interactions
    document.addEventListener('click', (e) => {
      if (e.target.closest('.fractal-heart')) {
        this.pulseHeartSeal();
      }
    });

    // Handle wallet changes
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', () => {
        this.detectChaosBalance();
      });
    }
  }

  updateEyeTracking(mouseEvent) {
    const thirdEye = document.getElementById('thirdEye');
    const eyePupil = document.querySelector('.eye-pupil');
    
    if (thirdEye && eyePupil && this.isThirdEyeOpened) {
      const rect = thirdEye.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const angle = Math.atan2(mouseEvent.clientY - centerY, mouseEvent.clientX - centerX);
      const distance = Math.min(15, Math.sqrt(Math.pow(mouseEvent.clientX - centerX, 2) + Math.pow(mouseEvent.clientY - centerY, 2)) / 10);
      
      const offsetX = Math.cos(angle) * distance;
      const offsetY = Math.sin(angle) * distance;
      
      eyePupil.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;
    }
  }

  pulseHeartSeal() {
    const heartSeal = document.getElementById('heartSeal');
    if (heartSeal) {
      heartSeal.style.transform = 'scale(1.1)';
      setTimeout(() => {
        heartSeal.style.transform = 'scale(1)';
      }, 200);
    }
  }
}

// Initialize Eye Sigil when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Wait for other elements to load first
  setTimeout(() => {
    window.eyeSigil = new EyeSigil();
  }, 500);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EyeSigil;
}