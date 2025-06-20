
function resurrect() {
  const audio = document.getElementById("bassDrop");
  const vault = document.querySelector(".resurrection-container");

  audio.volume = 1;
  audio.currentTime = 0;
  audio.play();

  vault.classList.add("pulse");

  setTimeout(() => {
    vault.classList.remove("pulse");
  }, 1000);

  alert("⚡️ Vault Ignited – Let There Be Bass! ⚡️");
}

// Global variables
let userWalletAddress = null;
let isWalletConnected = false;
let connectedWalletType = null;

// Stripe configuration
const STRIPE_PUBLISHABLE_KEY = 'pk_test_your_stripe_key_here'; // Replace with your actual Stripe publishable key
let stripe = null;

// Initialize Stripe
async function initializeStripe() {
  try {
    const stripeModule = await import('https://js.stripe.com/v3/');
    stripe = stripeModule.Stripe(STRIPE_PUBLISHABLE_KEY);
    console.log("🔑 Stripe initialized successfully");
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
      
      console.log("🦊 MetaMask Connected:", userWalletAddress);
      connectWalletBtn.innerText = "🦊 " + userWalletAddress.slice(0, 6) + "..." + userWalletAddress.slice(-4);
      mintStatus.innerText = "🧿 MetaMask Connected – Ready for Stripe payment";
      
      // Check if we have a successful Stripe payment
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
  const connectWalletBtn = document.getElementById("connectWallet");
  const mintStatus = document.getElementById("mintStatus");

  if (window.ethereum && window.ethereum.isCoinbaseWallet) {
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      userWalletAddress = accounts[0];
      isWalletConnected = true;
      connectedWalletType = "Coinbase";
      
      console.log("🔵 Coinbase Wallet Connected:", userWalletAddress);
      connectWalletBtn.innerText = "🔵 " + userWalletAddress.slice(0, 6) + "..." + userWalletAddress.slice(-4);
      mintStatus.innerText = "🧿 Coinbase Wallet Connected – Ready for Stripe payment";
      
      // Check if we have a successful Stripe payment
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
  if (window.ethereum) {
    if (window.ethereum.isMetaMask) {
      await connectMetaMask();
    } else if (window.ethereum.isCoinbaseWallet) {
      await connectCoinbaseWallet();
    } else {
      // Generic wallet connection
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        userWalletAddress = accounts[0];
        isWalletConnected = true;
        connectedWalletType = "Generic";
        
        console.log("🔌 Wallet Connected:", userWalletAddress);
        document.getElementById("connectWallet").innerText = "✅ " + userWalletAddress.slice(0, 6) + "..." + userWalletAddress.slice(-4);
        document.getElementById("mintStatus").innerText = "🧿 Wallet Connected – Ready for Stripe payment";
        
        checkStripeAndMint();
      } catch (err) {
        console.error("⚠️ Wallet connection error:", err);
        document.getElementById("mintStatus").innerText = "❌ Wallet connection failed";
      }
    }
  } else {
    alert("🚨 No Web3 wallet detected. Please install MetaMask or Coinbase Wallet.");
    document.getElementById("mintStatus").innerText = "🚨 Web3 wallet required for vault access";
  }
}

// Mint Relic Function
async function mintRelic() {
  if (!userWalletAddress) {
    alert("🚨 Please connect your wallet first!");
    return;
  }

  console.log("⚙️ Initiating relic mint for:", userWalletAddress);
  const mintStatus = document.getElementById("mintStatus");

  if (mintStatus) {
    mintStatus.innerText = "🌀 Minting relic to vault...";
  }

  // Simulate vault minting process (replace with actual contract interaction)
  setTimeout(() => {
    console.log("🧬 Relic Successfully Minted to Vault for", userWalletAddress);
    if (mintStatus) {
      mintStatus.innerText = `🧿 Vault Relic Minted to: ${userWalletAddress.slice(0, 6)}...${userWalletAddress.slice(-4)}`;
    }
    
    // Add visual feedback to vault
    const vault = document.querySelector(".resurrection-container");
    vault.style.boxShadow = "0 0 50px #00ff00";
    
    alert("🎉 Relic successfully minted to your vault! 🧿");
  }, 2000);
}

// Create Stripe Payment Session
async function createStripePayment() {
  if (!userWalletAddress) {
    alert("🚨 Please connect your wallet first!");
    return;
  }

  if (!stripe) {
    alert("🚨 Stripe not initialized. Please refresh the page.");
    return;
  }

  try {
    console.log("💳 Creating Stripe payment session...");
    document.getElementById("mintStatus").innerText = "💳 Creating payment session...";

    // Create checkout session on your backend
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

    if (session.error) {
      throw new Error(session.error);
    }

    // Redirect to Stripe Checkout
    const result = await stripe.redirectToCheckout({
      sessionId: session.sessionId,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

  } catch (error) {
    console.error("❌ Stripe payment error:", error);
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

// Initialize on page load
window.onload = async function () {
  // Initialize Stripe
  await initializeStripe();

  // Hide terminal overlay after 3 seconds
  setTimeout(() => {
    const overlay = document.getElementById("terminalOverlay");
    if (overlay) {
      overlay.style.display = "none";
    }
  }, 3000);

  // Set up wallet connection buttons
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

  // Check for existing Stripe payment on page load
  checkStripeAndMint();

  // Listen for account changes in any connected wallet
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', function (accounts) {
      if (accounts.length === 0) {
        // User disconnected wallet
        userWalletAddress = null;
        isWalletConnected = false;
        connectedWalletType = null;
        document.getElementById("connectWallet").innerText = "🔌 Connect Wallet";
        document.getElementById("mintStatus").innerText = "🔒 Wallet disconnected";
      } else {
        // User switched accounts
        userWalletAddress = accounts[0];
        const walletIcon = connectedWalletType === "MetaMask" ? "🦊" : 
                          connectedWalletType === "Coinbase" ? "🔵" : "✅";
        document.getElementById("connectWallet").innerText = walletIcon + " " + userWalletAddress.slice(0, 6) + "..." + userWalletAddress.slice(-4);
      }
    });
  }
};
