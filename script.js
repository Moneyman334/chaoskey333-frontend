
// Global variables
let userWalletAddress = null;
let isWalletConnected = false;
let connectedWalletType = null;
let STRIPE_PUBLISHABLE_KEY = null;
let stripe = null;
let signer = null;
let userAddress = null;

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

// Mint Relic Function (handles post-payment minting)
async function mintRelic() {
  if (!userWalletAddress || !isWalletConnected) {
    console.log("⚠️ No wallet connected for minting");
    return;
  }

  console.log("⚙️ Initiating relic mint for wallet:", userWalletAddress);
  const mintStatus = document.getElementById("mintStatus");

  if (mintStatus) {
    mintStatus.innerText = "🌀 Minting vault relic...";
  }

  // Simulate minting process
  setTimeout(() => {
    console.log("🧬 Vault Relic Minted for", userWalletAddress);
    if (mintStatus) {
      mintStatus.innerText = `🧿 Vault Relic Minted to: ${userWalletAddress.slice(0, 6)}...${userWalletAddress.slice(-4)}`;
    }
  }, 2000);
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

// Cosmic Replay Terminal System
let evolutionHistory = [];
let currentReplayData = null;
let isReplayMode = false;
let replayTimeoutId = null;

// Glyph patterns for different evolution stages
const GLYPH_PATTERNS = {
  dormant: ['◊', '∇', '⧫', '⟐', '◈', '⬟'],
  evolving: ['⚡', '⟲', '⬢', '◊', '※', '⟡'],
  evolved: ['★', '◈', '⬢', '◊', '※', '⟐', '∴', '⬟']
};

// Evolution trigger function
function triggerEvolution(capsuleId) {
  const capsule = document.querySelector(`[data-capsule-id="${capsuleId}"]`);
  if (!capsule) return;

  const evolutionEvent = {
    capsuleId: capsuleId,
    timestamp: Date.now(),
    stage: 'evolving',
    glyphSequence: generateGlyphSequence(),
    startTime: Date.now()
  };

  // Record the evolution event
  evolutionHistory.push(evolutionEvent);
  
  // Update capsule visual state
  capsule.setAttribute('data-evolution-stage', 'evolving');
  capsule.querySelector('.evolution-stage').textContent = 'EVOLVING';
  capsule.querySelector('.timestamp-display').textContent = `Evolution Started: ${formatTimestamp(evolutionEvent.timestamp)}`;
  
  // Animate glyph evolution
  animateGlyphEvolution(capsule, evolutionEvent);
  
  // Complete evolution after 3 seconds
  setTimeout(() => {
    completeEvolution(capsuleId, evolutionEvent);
  }, 3000);
  
  console.log(`🧬 Evolution triggered for Capsule-${capsuleId}`, evolutionEvent);
}

// Generate random glyph sequence for evolution
function generateGlyphSequence() {
  const sequence = [];
  const stages = ['dormant', 'evolving', 'evolved'];
  
  stages.forEach(stage => {
    const glyphs = GLYPH_PATTERNS[stage];
    const randomGlyph = glyphs[Math.floor(Math.random() * glyphs.length)];
    sequence.push({
      stage: stage,
      glyph: randomGlyph,
      timestamp: Date.now() + (sequence.length * 1000)
    });
  });
  
  return sequence;
}

// Animate glyph evolution
function animateGlyphEvolution(capsule, evolutionEvent) {
  const glyphDisplay = capsule.querySelector('.glyph-display');
  let sequenceIndex = 0;
  
  const animateSequence = () => {
    if (sequenceIndex < evolutionEvent.glyphSequence.length) {
      const glyphData = evolutionEvent.glyphSequence[sequenceIndex];
      glyphDisplay.textContent = glyphData.glyph.repeat(3);
      glyphDisplay.style.color = getStageColor(glyphData.stage);
      sequenceIndex++;
      setTimeout(animateSequence, 1000);
    }
  };
  
  animateSequence();
}

// Complete evolution process
function completeEvolution(capsuleId, evolutionEvent) {
  const capsule = document.querySelector(`[data-capsule-id="${capsuleId}"]`);
  if (!capsule) return;

  // Update evolution event
  evolutionEvent.stage = 'evolved';
  evolutionEvent.completedAt = Date.now();
  evolutionEvent.duration = evolutionEvent.completedAt - evolutionEvent.startTime;
  
  // Update capsule state
  capsule.setAttribute('data-evolution-stage', 'evolved');
  capsule.querySelector('.evolution-stage').textContent = 'EVOLVED';
  capsule.querySelector('.timestamp-display').textContent = `Evolution Completed: ${formatTimestamp(evolutionEvent.completedAt)}`;
  
  // Final glyph pattern
  const glyphDisplay = capsule.querySelector('.glyph-display');
  const finalGlyphs = GLYPH_PATTERNS.evolved;
  const finalPattern = finalGlyphs.slice(0, 3).join(' ');
  glyphDisplay.textContent = finalPattern;
  glyphDisplay.style.color = '#ff00ff';
  
  // Add replay button to capsule
  const evolutionBtn = capsule.querySelector('.evolution-trigger-btn');
  evolutionBtn.textContent = '⟲ REPLAY';
  evolutionBtn.onclick = () => openReplayTerminal(evolutionEvent);
  
  console.log(`✨ Evolution completed for Capsule-${capsuleId}`, evolutionEvent);
}

// Open Cosmic Replay Terminal
function openReplayTerminal(evolutionEvent = null) {
  const terminal = document.getElementById('cosmicReplayTerminal');
  const replayInfo = document.getElementById('replayInfo');
  
  if (evolutionEvent) {
    currentReplayData = evolutionEvent;
    replayInfo.innerHTML = `
      ◊ COSMIC REPLAY TERMINAL ACTIVATED ◊<br>
      Capsule ID: ${evolutionEvent.capsuleId}<br>
      Evolution Time: ${formatTimestamp(evolutionEvent.timestamp)}<br>
      Duration: ${(evolutionEvent.duration / 1000).toFixed(2)}s<br>
      Glyph Sequence: ${evolutionEvent.glyphSequence.length} frames recorded
    `;
  } else {
    // Show latest evolution if no specific event provided
    const latestEvolution = evolutionHistory[evolutionHistory.length - 1];
    if (latestEvolution) {
      currentReplayData = latestEvolution;
      replayInfo.innerHTML = `
        ◊ SHOWING LATEST EVOLUTION ◊<br>
        Capsule ID: ${latestEvolution.capsuleId}<br>
        Evolution Time: ${formatTimestamp(latestEvolution.timestamp)}
      `;
    } else {
      replayInfo.innerHTML = 'No evolution events recorded yet. Trigger an evolution first.';
    }
  }
  
  terminal.classList.remove('hidden');
  isReplayMode = true;
  updateTimeline();
}

// Close Cosmic Replay Terminal
function closeReplayTerminal() {
  const terminal = document.getElementById('cosmicReplayTerminal');
  terminal.classList.add('hidden');
  isReplayMode = false;
  currentReplayData = null;
  
  if (replayTimeoutId) {
    clearTimeout(replayTimeoutId);
    replayTimeoutId = null;
  }
}

// Replay evolution sequence
function replayEvolution() {
  if (!currentReplayData) {
    alert('No evolution data to replay!');
    return;
  }
  
  const playbackStage = document.querySelector('.playback-stage');
  const scrubber = document.getElementById('timelineScrubber');
  
  playbackStage.innerHTML = `
    <div style="font-size: 1.5rem; margin-bottom: 10px;">
      ⟲ REPLAYING CAPSULE-${currentReplayData.capsuleId} EVOLUTION
    </div>
    <div id="replayGlyphs" style="font-size: 2rem; color: #00ff00;">
      Initializing replay...
    </div>
  `;
  
  // Animate timeline scrubber
  scrubber.style.left = '0%';
  
  // Replay glyph sequence
  let replayIndex = 0;
  const replayGlyphsDiv = document.getElementById('replayGlyphs');
  
  const playSequence = () => {
    if (replayIndex < currentReplayData.glyphSequence.length) {
      const glyphData = currentReplayData.glyphSequence[replayIndex];
      const progress = (replayIndex / currentReplayData.glyphSequence.length) * 100;
      
      replayGlyphsDiv.textContent = glyphData.glyph.repeat(5);
      replayGlyphsDiv.style.color = getStageColor(glyphData.stage);
      
      scrubber.style.left = `${progress}%`;
      
      replayIndex++;
      replayTimeoutId = setTimeout(playSequence, 800);
    } else {
      // Replay complete
      replayGlyphsDiv.textContent = '✨ REPLAY COMPLETE ✨';
      replayGlyphsDiv.style.color = '#ff00ff';
      scrubber.style.left = '100%';
    }
  };
  
  playSequence();
}

// Rewind to specific moment
function rewindToMoment() {
  if (!currentReplayData) {
    alert('No evolution data to rewind!');
    return;
  }
  
  const playbackStage = document.querySelector('.playback-stage');
  const scrubber = document.getElementById('timelineScrubber');
  
  // Rewind to 50% point in evolution
  const rewindIndex = Math.floor(currentReplayData.glyphSequence.length / 2);
  const glyphData = currentReplayData.glyphSequence[rewindIndex];
  const progress = (rewindIndex / currentReplayData.glyphSequence.length) * 100;
  
  playbackStage.innerHTML = `
    <div style="font-size: 1.5rem; margin-bottom: 10px;">
      ⟪ REWOUND TO EVOLUTION MOMENT
    </div>
    <div style="font-size: 2rem; color: ${getStageColor(glyphData.stage)};">
      ${glyphData.glyph.repeat(5)}
    </div>
    <div style="font-size: 0.9rem; margin-top: 10px; color: #ffff00;">
      Timestamp: ${formatTimestamp(glyphData.timestamp)}
    </div>
  `;
  
  scrubber.style.left = `${progress}%`;
}

// Return to live view
function returnToLive() {
  const playbackStage = document.querySelector('.playback-stage');
  const scrubber = document.getElementById('timelineScrubber');
  
  playbackStage.innerHTML = `
    <div style="font-size: 1.5rem; margin-bottom: 10px;">
      ● LIVE VIEW ACTIVATED
    </div>
    <div style="font-size: 1.2rem; color: #00ff00;">
      Current Status: ${evolutionHistory.length} evolution(s) recorded
    </div>
    <div style="font-size: 0.9rem; margin-top: 10px; color: #ffff00;">
      System Time: ${formatTimestamp(Date.now())}
    </div>
  `;
  
  scrubber.style.left = '100%';
  
  if (replayTimeoutId) {
    clearTimeout(replayTimeoutId);
    replayTimeoutId = null;
  }
}

// Update timeline visualization
function updateTimeline() {
  const timeline = document.getElementById('glyphTimeline');
  if (!currentReplayData) return;
  
  // Create visual timeline markers for glyph timestamps
  timeline.innerHTML = '';
  
  currentReplayData.glyphSequence.forEach((glyphData, index) => {
    const marker = document.createElement('div');
    marker.style.position = 'absolute';
    marker.style.left = `${(index / currentReplayData.glyphSequence.length) * 100}%`;
    marker.style.top = '50%';
    marker.style.transform = 'translateY(-50%)';
    marker.style.width = '3px';
    marker.style.height = '60%';
    marker.style.background = getStageColor(glyphData.stage);
    marker.style.opacity = '0.7';
    marker.title = `${glyphData.glyph} - ${glyphData.stage}`;
    timeline.appendChild(marker);
  });
}

// Helper functions
function getStageColor(stage) {
  const colors = {
    dormant: '#00ffcc',
    evolving: '#ff6600', 
    evolved: '#ff00ff'
  };
  return colors[stage] || '#ffffff';
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString() + '.' + date.getMilliseconds().toString().padStart(3, '0');
}

