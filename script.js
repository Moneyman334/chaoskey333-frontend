
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

    // 🧬 Activate Mythic Mode for mutation system
    const mythicActivationEvent = new CustomEvent('mythicModeActivated', {
      detail: {
        timestamp: Date.now(),
        activatedBy: 'mythic_mint',
        contractAddress: contractAddress,
        userAddress: userWalletAddress
      }
    });
    document.dispatchEvent(mythicActivationEvent);

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    console.log("⏳ Sending mint transaction...");
    const tx = await contract.mintMythic();
    await tx.wait();

    // 🧬 Trigger mutation replay event after successful mint
    const replayEvent = new CustomEvent('relicReplayEvent', {
      detail: {
        type: 'mythic_mint_success',
        transactionHash: tx.hash,
        timestamp: Date.now(),
        userAddress: userWalletAddress,
        intensity: 2.0
      }
    });
    document.dispatchEvent(replayEvent);

    alert("✅ Mythic Relic minted successfully!");
    window.location.href = "/claim/mythic/claim_mythic_verification.html";
  } catch (err) {
    console.error("❌ Minting error:", err);
    alert("Mint failed. Please check your wallet connection and try again.");
  }
}

// 🧬 Permanent Relic Evolution Trigger - Integration Functions

/**
 * Initialize the mutation system integration
 */
function initializeMutationSystem() {
  console.log('🧬 Initializing Permanent Relic Evolution Trigger integration...');
  
  // Connect wallet address as a vault when wallet is connected
  if (userWalletAddress) {
    const vaultConnectionEvent = new CustomEvent('vaultConnected', {
      detail: {
        id: userWalletAddress,
        address: userWalletAddress,
        type: 'wallet_vault',
        connectedAt: Date.now()
      }
    });
    document.dispatchEvent(vaultConnectionEvent);
  }
  
  // Set up mutation event listeners
  setupMutationEventListeners();
}

/**
 * Setup event listeners for mutation events
 */
function setupMutationEventListeners() {
  // Listen for mutation triggers
  document.addEventListener('relicMutationTriggered', (event) => {
    const mutation = event.detail;
    console.log('🧬 Relic mutation detected:', mutation);
    
    // Update UI with mutation feedback
    showMutationFeedback(mutation);
  });
  
  // Listen for vault broadcast pulses
  document.addEventListener('vaultBroadcastPulse', (event) => {
    const pulse = event.detail;
    console.log('💫 Vault pulse detected:', pulse);
    
    // Show pulse effect in UI
    showPulseEffect(pulse);
  });
  
  // Listen for global broadcasts
  document.addEventListener('globalBroadcastExecuted', (event) => {
    const broadcast = event.detail;
    console.log('📤 Global broadcast executed:', broadcast);
    
    // Update broadcast status in UI
    updateBroadcastStatus(broadcast);
  });
}

/**
 * Show mutation feedback in the UI
 */
function showMutationFeedback(mutation) {
  const statusDiv = document.getElementById("mintStatus");
  if (statusDiv) {
    const originalText = statusDiv.innerText;
    statusDiv.innerText = `🧬 Relic Evolution: ${mutation.evolutionStage?.stage || 'UNKNOWN'} (${mutation.evolutionStage?.level || 0}%)`;
    statusDiv.style.color = '#00ff88';
    statusDiv.style.fontWeight = 'bold';
    
    // Restore original text after 3 seconds
    setTimeout(() => {
      statusDiv.innerText = originalText;
      statusDiv.style.color = '';
      statusDiv.style.fontWeight = '';
    }, 3000);
  }
}

/**
 * Show pulse effect in the UI
 */
function showPulseEffect(pulse) {
  // Create pulse indicator
  const pulseIndicator = document.createElement('div');
  pulseIndicator.className = 'pulse-indicator';
  pulseIndicator.innerText = '💫';
  pulseIndicator.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    font-size: 24px;
    animation: pulse 2s ease-in-out;
    z-index: 1000;
  `;
  
  // Add pulse animation CSS if not exists
  if (!document.querySelector('#pulseStyle')) {
    const style = document.createElement('style');
    style.id = 'pulseStyle';
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.5); opacity: 0.7; }
        100% { transform: scale(1); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(pulseIndicator);
  
  // Remove indicator after animation
  setTimeout(() => {
    if (pulseIndicator.parentNode) {
      pulseIndicator.parentNode.removeChild(pulseIndicator);
    }
  }, 2000);
}

/**
 * Update broadcast status in UI
 */
function updateBroadcastStatus(broadcast) {
  console.log(`📤 Broadcast status: ${broadcast.type} - ${broadcast.id}`);
  
  // Could add a small status indicator in the UI
  const indicator = document.createElement('div');
  indicator.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(0, 255, 136, 0.8);
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 1000;
  `;
  indicator.textContent = `📤 ${broadcast.type}`;
  
  document.body.appendChild(indicator);
  
  setTimeout(() => {
    if (indicator.parentNode) {
      indicator.parentNode.removeChild(indicator);
    }
  }, 2000);
}

/**
 * Enhanced relic minting with mutation triggers
 */
async function mintRelicWithMutation() {
  console.log("⚙️ Initiating enhanced relic mint with mutation support for wallet:", userWalletAddress);
  
  const mintStatus = document.getElementById("mintStatus");
  
  try {
    if (!userWalletAddress) {
      throw new Error("Wallet not connected");
    }
    
    mintStatus.innerText = "🌀 Minting vault relic with evolution trigger...";
    
    // Trigger vault connection if not already connected
    const vaultConnectionEvent = new CustomEvent('vaultConnected', {
      detail: {
        id: userWalletAddress,
        address: userWalletAddress,
        type: 'mint_vault',
        connectedAt: Date.now()
      }
    });
    document.dispatchEvent(vaultConnectionEvent);
    
    // Simulate minting process (replace with actual contract call)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Trigger replay event for successful mint
    const replayEvent = new CustomEvent('relicReplayEvent', {
      detail: {
        type: 'relic_mint_success',
        timestamp: Date.now(),
        userAddress: userWalletAddress,
        intensity: 1.5,
        relicType: 'vault_relic'
      }
    });
    document.dispatchEvent(replayEvent);
    
    mintStatus.innerText = "✅ Vault relic minted with evolution capabilities!";
    mintStatus.style.color = '#00ff88';
    
  } catch (error) {
    console.error("❌ Enhanced mint error:", error);
    mintStatus.innerText = "❌ Enhanced mint failed. Please try again.";
    mintStatus.style.color = '#ff4444';
  }
}

// Initialize mutation system when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Small delay to ensure other systems are initialized
  setTimeout(initializeMutationSystem, 1000);
});

