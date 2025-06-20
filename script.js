
// Global variables
let userWalletAddress = null;
let isWalletConnected = false;
let connectedWalletType = null;
let STRIPE_PUBLISHABLE_KEY = null;
let stripe = null;

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
  if (window.ethereum) {
    if (window.ethereum.isMetaMask) {
      await connectMetaMask();
    } else if (window.ethereum.isCoinbaseWallet) {
      await connectCoinbaseWallet();
    } else {
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
        document.getElementById("connectWallet").innerText = "🔌 Connect Wallet";
        document.getElementById("mintStatus").innerText = "🔒 Wallet disconnected";
      } else {
        userWalletAddress = accounts[0];
        const walletIcon = connectedWalletType === "MetaMask" ? "🦊" : 
                          connectedWalletType === "Coinbase" ? "🔵" : "✅";
        document.getElementById("connectWallet").innerText = walletIcon + " " + userWalletAddress.slice(0, 6) + "..." + userWalletAddress.slice(-4);
        checkStripeAndMint();
      }
    });
  }
};
let signer;
let userAddress;

document.getElementById("connectWalletBtn").onclick = async function () {
  if (typeof window.ethereum === "undefined") {
    alert("MetaMask not found! Please install MetaMask.");
    return;
  }

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();
    document.getElementById("walletStatus").innerText = `✅ Connected: ${userAddress}`;
  } catch (err) {
    console.error("Wallet connection failed:", err);
    document.getElementById("walletStatus").innerText = "❌ Failed to connect wallet";
  }
};
