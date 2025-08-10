
// Global variables
let userWalletAddress = null;
let isWalletConnected = false;
let connectedWalletType = null;
let STRIPE_PUBLISHABLE_KEY = null;
let stripe = null;
let signer = null;
let userAddress = null;

// Ripple-Cascade Multilingual Overlay System
let solverImprint = null;
let evolutionSequenceActive = false;
let cosmicReplayMode = false;

// Solver Imprint Generation (based on wallet address for personalization)
function generateSolverImprint(walletAddress) {
  if (!walletAddress) return { resonanceTone: 1000, cascadeDelay: 500 };
  
  // Create personalized resonance tone from wallet address
  const addressSum = walletAddress.slice(2).split('').reduce((sum, char) => {
    return sum + parseInt(char, 16) || 0;
  }, 0);
  
  const resonanceTone = 800 + (addressSum % 400); // Range: 800-1200ms
  const cascadeDelay = 300 + (addressSum % 600); // Range: 300-900ms
  
  return { resonanceTone, cascadeDelay };
}

// Sub-bass water drop sound system
function playRippleDropSound() {
  try {
    // Create synthetic sub-bass water drop sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Sub-bass frequency (40-80 Hz)
    oscillator.frequency.setValueAtTime(60, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(30, audioContext.currentTime + 0.3);
    
    // Water drop envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.log("Audio context not available, skipping sound effect");
  }
}

// Micro-particle burst effect at ripple edges
function createParticleBurst(x, y, color = 'gold') {
  const container = document.getElementById('particleBurstContainer');
  if (!container) return;
  
  const particleCount = 12;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = `particle ${color === 'violet' ? 'violet' : ''}`;
    
    const angle = (i / particleCount) * Math.PI * 2;
    const distance = 50 + Math.random() * 100;
    const burstX = Math.cos(angle) * distance;
    const burstY = Math.sin(angle) * distance;
    
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.setProperty('--burst-x', burstX + 'px');
    particle.style.setProperty('--burst-y', burstY + 'px');
    
    container.appendChild(particle);
    
    // Clean up particle after animation
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, 2000);
  }
}

// Ripple-cascade effect trigger
function triggerRippleCascade(layerElement, imprint) {
  const glyphContainer = layerElement.querySelector('.glyph-container');
  const ripples = layerElement.querySelectorAll('.ripple');
  const isPrimary = layerElement.classList.contains('primary-layer');
  
  if (!glyphContainer || !ripples.length) return;
  
  // Get glyph center position for particle bursts
  const rect = glyphContainer.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  // Trigger ripples with personalized timing
  ripples.forEach((ripple, index) => {
    const delay = index * imprint.cascadeDelay / ripples.length;
    
    setTimeout(() => {
      // Play water drop sound
      playRippleDropSound();
      
      // Restart ripple animation
      ripple.style.animation = 'none';
      ripple.offsetHeight; // Trigger reflow
      ripple.style.animation = `rippleCascade ${imprint.resonanceTone}ms infinite ease-out`;
      
      // Create particle burst at ripple edge (delayed)
      setTimeout(() => {
        createParticleBurst(centerX, centerY, isPrimary ? 'gold' : 'violet');
      }, imprint.resonanceTone * 0.7);
      
    }, delay);
  });
}

// Permanent Relic Evolution Trigger (PR #24 integration)
function triggerPermanentRelicEvolution() {
  if (evolutionSequenceActive) return;
  
  evolutionSequenceActive = true;
  const overlay = document.getElementById('multilingualOverlay');
  const layers = document.querySelectorAll('.overlay-layer');
  
  if (!overlay || !layers.length) {
    evolutionSequenceActive = false;
    return;
  }
  
  console.log("🧬 Triggering Permanent Relic Evolution with Ripple-Cascade Sync");
  
  // Generate or use existing solver imprint
  if (!solverImprint && userWalletAddress) {
    solverImprint = generateSolverImprint(userWalletAddress);
    console.log("🔮 Generated Solver Imprint:", solverImprint);
  }
  
  const imprint = solverImprint || { resonanceTone: 1000, cascadeDelay: 500 };
  
  // Show multilingual overlay
  overlay.classList.add('active');
  
  // Activate layers with staggered timing
  layers.forEach((layer, index) => {
    const isPrimary = layer.classList.contains('primary-layer');
    const activationDelay = isPrimary ? 0 : (index * 300);
    
    setTimeout(() => {
      layer.classList.add('active');
      
      // Trigger ripple cascade for this layer
      setTimeout(() => {
        triggerRippleCascade(layer, imprint);
      }, 500);
      
    }, activationDelay);
  });
  
  // Complete evolution sequence after full cascade
  const totalDuration = (layers.length * 300) + (imprint.resonanceTone * 3) + 2000;
  setTimeout(() => {
    completeEvolutionSequence();
  }, totalDuration);
}

// Complete evolution sequence and transition to normal state
function completeEvolutionSequence() {
  console.log("✨ Evolution sequence complete - Eternal Fusion Core activated");
  
  const overlay = document.getElementById('multilingualOverlay');
  const layers = document.querySelectorAll('.overlay-layer');
  
  // Fade out layers
  layers.forEach((layer, index) => {
    setTimeout(() => {
      layer.classList.remove('active');
    }, index * 200);
  });
  
  // Hide overlay after all layers fade
  setTimeout(() => {
    overlay.classList.remove('active');
    evolutionSequenceActive = false;
    
    // Trigger cosmic replay terminal sync if in replay mode
    if (cosmicReplayMode) {
      console.log("🌌 Syncing evolution sequence with Cosmic Replay Terminal");
    }
  }, layers.length * 200 + 1000);
}

// Enhanced mint relic function with evolution trigger integration
async function mintRelicWithEvolution() {
  if (!userWalletAddress || !isWalletConnected) {
    console.log("⚠️ No wallet connected for evolution minting");
    return;
  }

  console.log("⚙️ Initiating enhanced relic mint with evolution trigger for wallet:", userWalletAddress);
  const mintStatus = document.getElementById("mintStatus");

  if (mintStatus) {
    mintStatus.innerText = "🌀 Preparing Eternal Fusion Core evolution...";
  }

  // Generate solver imprint if not exists
  if (!solverImprint) {
    solverImprint = generateSolverImprint(userWalletAddress);
  }

  // Trigger the Permanent Relic Evolution (PR #24 + PR #25 integration)
  triggerPermanentRelicEvolution();

  // Continue with original minting logic
  setTimeout(() => {
    if (mintStatus) {
      mintStatus.innerText = "🧬 Evolution cascade complete - Minting vault relic...";
    }
    
    // Simulate minting process
    setTimeout(() => {
      console.log("🧬 Vault Relic Minted for", userWalletAddress);
      if (mintStatus) {
        mintStatus.innerText = `🧿 Eternal Fusion Core Relic Minted to: ${userWalletAddress.slice(0, 6)}...${userWalletAddress.slice(-4)}`;
      }
    }, 2000);
  }, 1000);
}

// Cosmic Replay Terminal Integration (PR #8-#10 compatibility)
function enableCosmicReplayMode() {
  cosmicReplayMode = true;
  console.log("🌌 Cosmic Replay Terminal mode enabled - Evolution sequences will sync for vault cycles");
}

function disableCosmicReplayMode() {
  cosmicReplayMode = false;
  console.log("🌌 Cosmic Replay Terminal mode disabled");
}

// Test function for the ripple-cascade system
function testRippleCascadeSystem() {
  console.log("🧪 Testing Ripple-Cascade Multilingual Overlay System");
  
  if (!userWalletAddress) {
    // Use test address for demonstration
    userWalletAddress = "0x742d35Cc6661C0532c26916F8B3A4c1c0f50cA1f";
    isWalletConnected = true;
  }
  
  triggerPermanentRelicEvolution();
}

// Initialize Stripe
async function initializeStripe() {
  try {
    // Fetch public key from server
    const response = await fetch('/config');
    const config = await response.json();
    STRIPE_PUBLISHABLE_KEY = config.publicKey;
    
    if (!STRIPE_PUBLISHABLE_KEY) {
      throw new Error("No Stripe public key received from server");
    }
    
    if (typeof Stripe !== 'undefined') {
      stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
      console.log("🔑 Stripe initialized successfully");
    } else {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = () => {
        stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
        console.log("🔑 Stripe initialized successfully");
      };
      document.head.appendChild(script);
    }
  } catch (error) {
    console.error("❌ Failed to initialize Stripe:", error);
  }
}

// Connect MetaMask Wallet
async function connectMetaMask() {
  const connectWalletBtn = document.getElementById("connectWallet");
  const mintStatus = document.getElementById("mintStatus");

  if (window.ethereum && window.ethereum.isMetaMask) {
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      userWalletAddress = accounts[0];
      isWalletConnected = true;
      connectedWalletType = "MetaMask";
      
      // Initialize ethers signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      userAddress = accounts[0];
      
      console.log("🦊 MetaMask Connected:", userWalletAddress);
      connectWalletBtn.innerText = "🦊 " + userWalletAddress.slice(0, 6) + "..." + userWalletAddress.slice(-4);
      mintStatus.innerText = "🧿 MetaMask Connected – Ready for Stripe payment";
      
      checkStripeAndMint();
      
    } catch (err) {
      console.error("⚠️ MetaMask connection error:", err);
      mintStatus.innerText = "❌ MetaMask connection failed";
    }
  } else {
    alert("🚨 MetaMask not detected. Please install MetaMask extension.");
    mintStatus.innerText = "🚨 MetaMask required for vault access";
  }
}

// Connect Coinbase Wallet
async function connectCoinbaseWallet() {
  const connectCoinbaseBtn = document.getElementById("connectCoinbase");
  const mintStatus = document.getElementById("mintStatus");

  if (window.ethereum && window.ethereum.isCoinbaseWallet) {
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      userWalletAddress = accounts[0];
      isWalletConnected = true;
      connectedWalletType = "Coinbase";
      
      // Initialize ethers signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      userAddress = accounts[0];
      
      console.log("🔵 Coinbase Wallet Connected:", userWalletAddress);
      connectCoinbaseBtn.innerText = "🔵 " + userWalletAddress.slice(0, 6) + "..." + userWalletAddress.slice(-4);
      mintStatus.innerText = "🧿 Coinbase Wallet Connected – Ready for Stripe payment";
      
      checkStripeAndMint();
      
    } catch (err) {
      console.error("⚠️ Coinbase Wallet connection error:", err);
      mintStatus.innerText = "❌ Coinbase Wallet connection failed";
    }
  } else {
    alert("🚨 Coinbase Wallet not detected. Please install Coinbase Wallet extension.");
    mintStatus.innerText = "🚨 Coinbase Wallet required for vault access";
  }
}

// Auto-detect and connect available wallet
async function connectWallet() {
  console.log("🔍 Checking for Web3 wallets...");
  
  // Wait longer for wallet extensions to load (they can take time)
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  console.log("window.ethereum exists:", !!window.ethereum);
  
  if (typeof window.ethereum !== 'undefined') {
    console.log("✅ Ethereum provider detected");
    
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      userWalletAddress = accounts[0];
      isWalletConnected = true;
      
      // Initialize ethers signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      userAddress = accounts[0];
      
      // Detect wallet type
      if (window.ethereum.isMetaMask && window.ethereum.isCoinbaseWallet) {
        connectedWalletType = "Coinbase via MetaMask";
        console.log("🔵🦊 Coinbase Wallet connected via MetaMask");
        document.getElementById("connectWallet").innerText = "🔵 " + userWalletAddress.slice(0, 6) + "..." + userWalletAddress.slice(-4);
        document.getElementById("mintStatus").innerText = "🧿 Coinbase Wallet Connected – Ready for Stripe payment";
      } else if (window.ethereum.isMetaMask) {
        connectedWalletType = "MetaMask";
        console.log("🦊 MetaMask detected and connected");
        document.getElementById("connectWallet").innerText = "🦊 " + userWalletAddress.slice(0, 6) + "..." + userWalletAddress.slice(-4);
        document.getElementById("mintStatus").innerText = "🧿 MetaMask Connected – Ready for Stripe payment";
      } else if (window.ethereum.isCoinbaseWallet) {
        connectedWalletType = "Coinbase";
        console.log("🔵 Coinbase Wallet detected and connected");
        document.getElementById("connectWallet").innerText = "🔵 " + userWalletAddress.slice(0, 6) + "..." + userWalletAddress.slice(-4);
        document.getElementById("mintStatus").innerText = "🧿 Coinbase Wallet Connected – Ready for Stripe payment";
      } else {
        connectedWalletType = "Generic";
        console.log("🔌 Generic Web3 provider connected");
        document.getElementById("connectWallet").innerText = "✅ " + userWalletAddress.slice(0, 6) + "..." + userWalletAddress.slice(-4);
        document.getElementById("mintStatus").innerText = "🧿 Wallet Connected – Ready for Stripe payment";
      }
      
      checkStripeAndMint();
      
    } catch (err) {
      console.error("⚠️ Wallet connection error:", err);
      document.getElementById("mintStatus").innerText = "❌ Wallet connection failed: " + err.message;
      alert("❌ Wallet connection failed: " + err.message);
    }
  } else {
    console.error("❌ No Web3 provider found");
    const errorMsg = "🚨 No Web3 wallet detected!\n\nTo use this app, please install one of these browser extensions:\n\n• MetaMask: Visit chrome://extensions or firefox addons\n• Coinbase Wallet: Visit chrome://extensions or firefox addons\n\nAfter installation, refresh this page and click 'Connect Wallet'";
    alert(errorMsg);
    document.getElementById("mintStatus").innerText = "🚨 Install MetaMask or Coinbase Wallet browser extension first";
  }
}

// Mint Relic Function (handles post-payment minting) - Enhanced with Evolution System
async function mintRelic() {
  // Use the enhanced evolution mint function
  return mintRelicWithEvolution();
}

// Test Stripe Connection
async function testStripeConnection() {
  try {
    const response = await fetch('/api/test-stripe');
    const result = await response.json();
    
    if (result.success) {
      alert("✅ Stripe Connection Test Successful!\n\nAccount ID: " + result.accountId + "\nCurrency: " + result.currency);
      console.log("✅ Stripe test successful:", result);
    } else {
      alert("❌ Stripe Connection Test Failed: " + result.error);
      console.error("❌ Stripe test failed:", result.error);
    }
  } catch (error) {
    alert("❌ Stripe Connection Test Error: " + error.message);
    console.error("❌ Stripe test error:", error);
  }
}

// Test All Connections
async function testAllConnections() {
  try {
    console.log("🔄 Testing all system connections...");
    
    const response = await fetch('/api/test-all');
    const results = await response.json();
    
    let statusMessage = "🔄 SYSTEM CONNECTION TEST RESULTS:\n\n";
    
    // Server status
    statusMessage += `🖥️ SERVER: ${results.server.status.toUpperCase()}\n`;
    statusMessage += `⏰ Timestamp: ${results.server.timestamp}\n\n`;
    
    // Environment variables
    statusMessage += `🔑 ENVIRONMENT:\n`;
    statusMessage += `• Public Key: ${results.environment.publicKey ? '✅ Set' : '❌ Missing'}\n`;
    statusMessage += `• Secret Key: ${results.environment.secretKey ? '✅ Set' : '❌ Missing'}\n`;
    statusMessage += `• Port: ${results.environment.port}\n\n`;
    
    // Stripe connection
    statusMessage += `💳 STRIPE CONNECTION:\n`;
    if (results.stripe.connected) {
      statusMessage += `• Status: ✅ Connected\n`;
      statusMessage += `• Account ID: ${results.stripe.accountId}\n`;
      statusMessage += `• Currency: ${results.stripe.currency}\n`;
    } else {
      statusMessage += `• Status: ❌ Failed\n`;
      statusMessage += `• Error: ${results.stripe.error}\n`;
    }
    
    // Wallet status
    statusMessage += `\n🔌 WALLET CONNECTION:\n`;
    statusMessage += `• Status: ${isWalletConnected ? '✅ Connected' : '❌ Not Connected'}\n`;
    if (isWalletConnected) {
      statusMessage += `• Type: ${connectedWalletType}\n`;
      statusMessage += `• Address: ${userWalletAddress}\n`;
    }
    
    // Frontend Stripe status
    statusMessage += `\n🌐 FRONTEND STRIPE:\n`;
    statusMessage += `• Initialized: ${stripe ? '✅ Yes' : '❌ No'}\n`;
    statusMessage += `• Public Key: ${STRIPE_PUBLISHABLE_KEY ? '✅ Loaded' : '❌ Missing'}\n`;
    
    alert(statusMessage);
    console.log("📊 Full test results:", results);
    
  } catch (error) {
    alert("❌ Connection Test Error: " + error.message);
    console.error("❌ Full test error:", error);
  }
}

// Create Stripe Payment
async function createStripePayment() {
  if (!isWalletConnected || !userWalletAddress) {
    alert("🔌 Please connect your wallet first!");
    return;
  }

  if (!stripe) {
    alert("❌ Stripe not initialized. Please refresh and try again.");
    return;
  }

  try {
    console.log("💳 Creating Stripe checkout session...");
    
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress: userWalletAddress,
        connectedWalletType: connectedWalletType,
        amount: 3333, // $33.33 in cents
        currency: 'usd',
        productName: 'Frankenstein Vault Relic 333'
      }),
    });

    const session = await response.json();
    
    if (session.sessionId) {
      console.log("🔄 Redirecting to Stripe checkout...");
      const result = await stripe.redirectToCheckout({
        sessionId: session.sessionId,
      });

      if (result.error) {
        console.error("❌ Stripe checkout error:", result.error);
        alert("Payment error: " + result.error.message);
      }
    } else {
      throw new Error("No session ID received");
    }

  } catch (error) {
    console.error("❌ Payment creation failed:", error);
    document.getElementById("mintStatus").innerText = "❌ Payment failed: " + error.message;
    alert("Payment failed: " + error.message);
  }
}

// Check Stripe Payment and Trigger Mint
function checkStripeAndMint() {
  const urlParams = new URLSearchParams(window.location.search);
  const paymentSuccess = urlParams.get("payment") === "success";
  const sessionId = urlParams.get("session_id");

  if (paymentSuccess && isWalletConnected && userWalletAddress) {
    console.log("✅ Stripe payment success + Wallet connected - minting to vault...");
    mintRelic();
  } else if (paymentSuccess && !isWalletConnected) {
    console.log("⚠️ Stripe payment success but wallet not connected");
    document.getElementById("mintStatus").innerText = "🔌 Payment confirmed - Please connect wallet to mint";
  } else {
    console.log("⏳ Awaiting Stripe payment confirmation...");
  }
}

// Resurrection function
function resurrect() {
  const audio = document.getElementById("bassDrop");
  if (audio) {
    audio.play();
  }

  setTimeout(() => {
    document.body.style.animation = "none";
    document.body.style.filter = "brightness(3) contrast(2)";
  }, 1000);

  alert("⚡️ Vault Ignited – Let There Be Bass! ⚡️");
}

// Initialize on page load
window.onload = async function () {
  console.log("🚀 Initializing Frankenstein Vault...");
  
  // Check for Web3 wallets with multiple attempts (extensions take time to load)
  let checkAttempts = 0;
  const maxAttempts = 5;
  
  const checkWalletAvailability = () => {
    checkAttempts++;
    console.log(`🔍 Checking wallet availability... (attempt ${checkAttempts}/${maxAttempts})`);
    
    if (typeof window.ethereum !== 'undefined') {
      console.log("✅ Web3 wallet detected!");
      document.getElementById("mintStatus").innerText = "🔌 Web3 wallet detected - Click 'Connect Wallet' to begin";
      return;
    }
    
    if (checkAttempts < maxAttempts) {
      setTimeout(checkWalletAvailability, 1000); // Check again in 1 second
    } else {
      console.warn("⚠️ No Web3 wallet detected after multiple attempts");
      document.getElementById("mintStatus").innerText = "🚨 No wallet extension found - Install MetaMask or Coinbase Wallet";
    }
  };
  
  setTimeout(checkWalletAvailability, 500);
  
  await initializeStripe();

  setTimeout(() => {
    const overlay = document.getElementById("terminalOverlay");
    if (overlay) {
      overlay.style.display = "none";
    }
  }, 3000);

  const connectWalletBtn = document.getElementById("connectWallet");
  const connectCoinbaseBtn = document.getElementById("connectCoinbase");
  const paymentBtn = document.getElementById("paymentBtn");
  
  if (connectWalletBtn) {
    connectWalletBtn.onclick = connectWallet;
  }
  
  if (connectCoinbaseBtn) {
    connectCoinbaseBtn.onclick = connectCoinbaseWallet;
  }

  if (paymentBtn) {
    paymentBtn.onclick = createStripePayment;
  }

  checkStripeAndMint();

  if (window.ethereum) {
    window.ethereum.on('accountsChanged', function (accounts) {
      if (accounts.length === 0) {
        userWalletAddress = null;
        isWalletConnected = false;
        connectedWalletType = null;
        signer = null;
        userAddress = null;
        document.getElementById("connectWallet").innerText = "🔌 Connect Wallet";
        document.getElementById("mintStatus").innerText = "🔒 Wallet disconnected";
      } else {
        userWalletAddress = accounts[0];
        userAddress = accounts[0];
        const walletIcon = connectedWalletType === "MetaMask" ? "🦊" : 
                          connectedWalletType === "Coinbase" ? "🔵" : "✅";
        document.getElementById("connectWallet").innerText = walletIcon + " " + userWalletAddress.slice(0, 6) + "..." + userWalletAddress.slice(-4);
        checkStripeAndMint();
      }
    });
  }
};

async function mintMythic() {
  const contractAddress = "0x11AaC98400AB700549233C4571B679b879Ba9f3a";
  const abi = [
    {
      "inputs": [],
      "name": "mintMythic",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

  if (!window.ethereum) {
    alert("⚠️ MetaMask not detected. Please install it to mint.");
    return;
  }

  try {
    await ethereum.request({ method: 'eth_requestAccounts' });

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    console.log("⏳ Sending mint transaction...");
    const tx = await contract.mintMythic();
    await tx.wait();

    alert("✅ Mythic Relic minted successfully!");
    window.location.href = "/claim/mythic/claim_mythic_verification.html";
  } catch (err) {
    console.error("❌ Minting error:", err);
    alert("Mint failed. Please check your wallet connection and try again.");
  }
}

