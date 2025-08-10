
// Global variables
let userWalletAddress = null;
let isWalletConnected = false;
let connectedWalletType = null;
let STRIPE_PUBLISHABLE_KEY = null;
let stripe = null;
let signer = null;
let userAddress = null;
let paypalInitialized = false;

// Initialize PayPal Smart Button
async function initializePayPal() {
  try {
    // Get PayPal client ID from config
    const response = await fetch('/config');
    const config = await response.json();
    const paypalClientId = config.paypalClientId;
    
    if (!paypalClientId || paypalClientId === 'YOUR_PAYPAL_CLIENT_ID') {
      console.log("⚠️ PayPal Client ID not configured, skipping PayPal initialization");
      document.getElementById('paypal-button-container').innerHTML = 
        '<div style="color: #ffaa00; text-align: center; padding: 20px; border: 1px solid #ffaa00; border-radius: 10px;">PayPal not configured</div>';
      return;
    }
    
    // Dynamically load PayPal SDK
    if (typeof paypal === 'undefined') {
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=USD`;
      script.onload = () => {
        console.log("✅ PayPal SDK loaded");
        renderPayPalButton();
      };
      script.onerror = () => {
        console.error("❌ Failed to load PayPal SDK");
        document.getElementById('paypal-button-container').innerHTML = 
          '<div style="color: #ff6666; text-align: center; padding: 20px;">PayPal SDK failed to load</div>';
      };
      document.head.appendChild(script);
    } else {
      renderPayPalButton();
    }
    
  } catch (error) {
    console.error("❌ Failed to initialize PayPal:", error);
    document.getElementById('paypal-button-container').innerHTML = 
      '<div style="color: #ff6666; text-align: center; padding: 20px;">PayPal initialization failed</div>';
  }
}

// Render PayPal Smart Button
function renderPayPalButton() {
  if (paypalInitialized) {
    console.log("✅ PayPal already initialized");
    return;
  }

  console.log("🔑 Rendering PayPal Smart Button...");
  
  paypal.Buttons({
    style: {
      layout: 'vertical',
      color: 'gold',
      shape: 'rect',
      label: 'paypal',
      height: 55
    },
    createOrder: function(data, actions) {
      if (!isWalletConnected || !userWalletAddress) {
        alert("🔌 Please connect your wallet first!");
        throw new Error("Wallet not connected");
      }

      console.log("💰 Creating PayPal order...");
      return actions.order.create({
        purchase_units: [{
          amount: {
            value: '33.33'
          },
          description: `ChaosKey333 Vault Relic for wallet: ${userWalletAddress}`,
          custom_id: userWalletAddress
        }]
      });
    },
    onApprove: function(data, actions) {
      console.log("✅ PayPal payment approved, capturing...");
      document.getElementById("mintStatus").innerText = "💰 PayPal payment approved, processing...";
      
      return actions.order.capture().then(function(details) {
        console.log("🎉 PayPal payment captured:", details);
        
        // Call our server to handle the payment and create claim token
        return fetch('/api/paypal-capture', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderID: data.orderID,
            walletAddress: userWalletAddress,
            connectedWalletType: connectedWalletType,
            paymentDetails: details
          }),
        }).then(response => response.json())
          .then(result => {
            if (result.success) {
              document.getElementById("mintStatus").innerText = "✅ PayPal payment confirmed! Redirecting to claim...";
              // Redirect to store/success with claim token
              window.location.href = `/store/success?token=${result.claimToken}`;
            } else {
              throw new Error(result.error || 'Payment processing failed');
            }
          });
      });
    },
    onError: function(err) {
      console.error("❌ PayPal error:", err);
      document.getElementById("mintStatus").innerText = "❌ PayPal payment failed";
      alert("PayPal payment failed. Please try again.");
    },
    onCancel: function(data) {
      console.log("⚠️ PayPal payment cancelled");
      document.getElementById("mintStatus").innerText = "⚠️ PayPal payment cancelled";
    }
  }).render('#paypal-button-container').then(() => {
    console.log("✅ PayPal Smart Button rendered successfully");
    paypalInitialized = true;
    
    // Add cosmic styling to PayPal button
    setTimeout(() => {
      const paypalContainer = document.getElementById('paypal-button-container');
      if (paypalContainer) {
        paypalContainer.style.boxShadow = '0 0 20px #ffc439';
        paypalContainer.style.borderRadius = '10px';
        paypalContainer.style.overflow = 'hidden';
        paypalContainer.style.border = '1px solid #ffc439';
      }
    }, 500);
  }).catch(err => {
    console.error("❌ PayPal button render failed:", err);
    document.getElementById('paypal-button-container').innerHTML = 
      '<div style="color: #ff6666; text-align: center; padding: 20px;">PayPal temporarily unavailable</div>';
  });
}
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
  await initializePayPal();

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

