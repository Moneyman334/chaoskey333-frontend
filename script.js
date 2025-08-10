
// Global variables
let userWalletAddress = null;
let isWalletConnected = false;
let connectedWalletType = null;
let STRIPE_PUBLISHABLE_KEY = null;
let stripe = null;
let signer = null;
let userAddress = null;

// Adaptive Multilingual Resonance Layer
let currentLanguage = 'en';
let languageMemory = null;
let audioContext = null;
let isResonanceActive = false;

// Language translations
const translations = {
  en: {
    title: "⚡ Frankenstein Vault Resurrection 333 ⚡",
    bassIncoming: "Bass Surge Incoming...",
    igniteVault: "⚡ Ignite Vault ⚡",
    connectWallet: "🔌 Connect Wallet",
    coinbaseWallet: "🔵 Coinbase Wallet",
    payAndMint: "💳 Pay $33.33 & Mint Relic",
    testStripe: "🧪 Test Stripe Connection",
    testAll: "🔄 Test All Connections",
    mintRelic: "⚙️ Mint Relic",
    awaitingConnection: "🔒 Awaiting connection & payment...",
    connectAndPay: "🔒 Connect wallet, then complete Stripe payment to mint vault relic",
    instructions: "💡 Connect Wallet (MetaMask/Coinbase) → Complete Stripe Payment → Relic Mints to Vault",
    glyphText: "◊ VAULT ◊"
  },
  es: {
    title: "⚡ Resurrección de la Bóveda Frankenstein 333 ⚡",
    bassIncoming: "Oleada de Bajos Entrante...",
    igniteVault: "⚡ Encender Bóveda ⚡",
    connectWallet: "🔌 Conectar Cartera",
    coinbaseWallet: "🔵 Cartera Coinbase",
    payAndMint: "💳 Pagar $33.33 y Acuñar Reliquia",
    testStripe: "🧪 Probar Conexión Stripe",
    testAll: "🔄 Probar Todas las Conexiones",
    mintRelic: "⚙️ Acuñar Reliquia",
    awaitingConnection: "🔒 Esperando conexión y pago...",
    connectAndPay: "🔒 Conecta cartera, luego completa el pago Stripe para acuñar reliquia",
    instructions: "💡 Conectar Cartera (MetaMask/Coinbase) → Completar Pago Stripe → Reliquia se Acuña en Bóveda",
    glyphText: "◊ BÓVEDA ◊"
  },
  fr: {
    title: "⚡ Résurrection du Coffre Frankenstein 333 ⚡",
    bassIncoming: "Vague de Basses Arrivante...",
    igniteVault: "⚡ Allumer le Coffre ⚡",
    connectWallet: "🔌 Connecter Portefeuille",
    coinbaseWallet: "🔵 Portefeuille Coinbase",
    payAndMint: "💳 Payer $33.33 et Créer Relique",
    testStripe: "🧪 Tester Connexion Stripe",
    testAll: "🔄 Tester Toutes les Connexions",
    mintRelic: "⚙️ Créer Relique",
    awaitingConnection: "🔒 En attente de connexion et paiement...",
    connectAndPay: "🔒 Connectez portefeuille, puis terminez le paiement Stripe pour créer relique",
    instructions: "💡 Connecter Portefeuille (MetaMask/Coinbase) → Terminer Paiement Stripe → Relique Créée dans Coffre",
    glyphText: "◊ COFFRE ◊"
  },
  jp: {
    title: "⚡ フランケンシュタイン金庫復活 333 ⚡",
    bassIncoming: "ベース波動接近中...",
    igniteVault: "⚡ 金庫点火 ⚡",
    connectWallet: "🔌 ウォレット接続",
    coinbaseWallet: "🔵 Coinbaseウォレット",
    payAndMint: "💳 $33.33支払い&レリック鋳造",
    testStripe: "🧪 Stripe接続テスト",
    testAll: "🔄 全接続テスト",
    mintRelic: "⚙️ レリック鋳造",
    awaitingConnection: "🔒 接続と支払いを待機中...",
    connectAndPay: "🔒 ウォレットを接続し、Stripe支払いを完了してレリックを鋳造",
    instructions: "💡 ウォレット接続 (MetaMask/Coinbase) → Stripe支払い完了 → レリックが金庫に鋳造",
    glyphText: "◊ 金庫 ◊"
  },
  de: {
    title: "⚡ Frankenstein Tresor Auferstehung 333 ⚡",
    bassIncoming: "Bass-Welle Ankommend...",
    igniteVault: "⚡ Tresor Entzünden ⚡",
    connectWallet: "🔌 Wallet Verbinden",
    coinbaseWallet: "🔵 Coinbase Wallet",
    payAndMint: "💳 $33.33 Zahlen & Relikt Prägen",
    testStripe: "🧪 Stripe Verbindung Testen",
    testAll: "🔄 Alle Verbindungen Testen",
    mintRelic: "⚙️ Relikt Prägen",
    awaitingConnection: "🔒 Warte auf Verbindung & Zahlung...",
    connectAndPay: "🔒 Wallet verbinden, dann Stripe-Zahlung abschließen um Relikt zu prägen",
    instructions: "💡 Wallet Verbinden (MetaMask/Coinbase) → Stripe-Zahlung Abschließen → Relikt wird in Tresor Geprägt",
    glyphText: "◊ TRESOR ◊"
  }
};

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

// ===== ADAPTIVE MULTILINGUAL RESONANCE LAYER =====

// Load saved language from memory
function loadLanguageMemory() {
  try {
    languageMemory = localStorage.getItem('vaultLanguageMemory');
    if (languageMemory && translations[languageMemory]) {
      currentLanguage = languageMemory;
      console.log(`🧠 Language memory restored: ${currentLanguage}`);
      return true;
    }
  } catch (error) {
    console.error("❌ Failed to load language memory:", error);
  }
  return false;
}

// Save language to memory
function saveLanguageMemory(lang) {
  try {
    localStorage.setItem('vaultLanguageMemory', lang);
    languageMemory = lang;
    console.log(`💾 Language memory saved: ${lang}`);
  } catch (error) {
    console.error("❌ Failed to save language memory:", error);
  }
}

// Update UI text based on current language
function updateLanguageDisplay() {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (translations[currentLanguage] && translations[currentLanguage][key]) {
      element.textContent = translations[currentLanguage][key];
    }
  });
  
  // Update glyph overlay
  const glyphOverlay = document.getElementById('glyphOverlay');
  if (glyphOverlay && translations[currentLanguage]) {
    glyphOverlay.textContent = translations[currentLanguage].glyphText;
    glyphOverlay.style.opacity = '1';
  }
}

// Language Switch with Ripple Effect
function switchLanguage(newLang) {
  if (newLang === currentLanguage) return;
  
  console.log(`🌐 Switching language from ${currentLanguage} to ${newLang}`);
  
  // Remove active class from all buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Add active class to selected button
  const selectedBtn = document.querySelector(`[data-lang="${newLang}"]`);
  if (selectedBtn) {
    selectedBtn.classList.add('active');
    
    // Language Switch Ripple Effect
    selectedBtn.classList.add('ripple');
    setTimeout(() => {
      selectedBtn.classList.remove('ripple');
    }, 800);
  }
  
  // Trigger Glyph Halo Ripple Effect
  const glyphHalo = document.querySelector('.glyph-halo');
  if (glyphHalo) {
    glyphHalo.classList.add('ripple-effect');
    setTimeout(() => {
      glyphHalo.classList.remove('ripple-effect');
    }, 1200);
  }
  
  // Fade out current glyph, switch language, fade in new glyph
  const glyphOverlay = document.getElementById('glyphOverlay');
  if (glyphOverlay) {
    glyphOverlay.style.opacity = '0';
    
    setTimeout(() => {
      currentLanguage = newLang;
      updateLanguageDisplay();
      saveLanguageMemory(newLang);
      
      // Glyph Fade Resonance - fade back in
      glyphOverlay.style.opacity = '1';
      
      // Trigger resonance pulse
      if (isResonanceActive) {
        triggerResonancePulse();
      }
    }, 400);
  } else {
    currentLanguage = newLang;
    updateLanguageDisplay();
    saveLanguageMemory(newLang);
  }
}

// Trigger resonance pulse synchronized with audio
function triggerResonancePulse() {
  const spectralHUD = document.getElementById('spectralHUD');
  const glyphOverlay = document.getElementById('glyphOverlay');
  
  if (spectralHUD) {
    spectralHUD.classList.add('synchronized-pulse');
    setTimeout(() => {
      spectralHUD.classList.remove('synchronized-pulse');
    }, 2000);
  }
  
  if (glyphOverlay) {
    glyphOverlay.classList.add('fade-resonance');
  }
}

// Initialize audio context for resonance synchronization
function initializeAudioResonance() {
  try {
    const audio = document.getElementById('bassDrop');
    if (audio) {
      // Listen for audio events to sync resonance
      audio.addEventListener('play', () => {
        isResonanceActive = true;
        triggerResonancePulse();
        console.log("🎵 Audio resonance activated");
      });
      
      audio.addEventListener('pause', () => {
        isResonanceActive = false;
        console.log("🎵 Audio resonance deactivated");
      });
      
      // Sync with audio time updates for continuous resonance
      audio.addEventListener('timeupdate', () => {
        if (isResonanceActive && Math.floor(audio.currentTime) % 3 === 0) {
          // Trigger resonance every 3 seconds when audio is playing
          const currentSecond = Math.floor(audio.currentTime);
          if (currentSecond > 0 && currentSecond % 3 === 0) {
            setTimeout(() => triggerResonancePulse(), 100);
          }
        }
      });
    }
  } catch (error) {
    console.error("❌ Failed to initialize audio resonance:", error);
  }
}

// Initialize multilingual system
function initializeMultilingualSystem() {
  console.log("🌐 Initializing Adaptive Multilingual Resonance Layer...");
  
  // Load saved language preference
  const hasMemory = loadLanguageMemory();
  
  // Set up language button event listeners
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const lang = e.target.getAttribute('data-lang');
      if (lang) {
        switchLanguage(lang);
      }
    });
  });
  
  // Set initial active language button
  const initialBtn = document.querySelector(`[data-lang="${currentLanguage}"]`);
  if (initialBtn) {
    initialBtn.classList.add('active');
  }
  
  // Update initial display
  updateLanguageDisplay();
  
  // Initialize audio resonance
  initializeAudioResonance();
  
  // Start glyph resonance animation
  setTimeout(() => {
    const glyphOverlay = document.getElementById('glyphOverlay');
    if (glyphOverlay) {
      glyphOverlay.classList.add('fade-resonance');
    }
  }, 1000);
  
  console.log(`✅ Multilingual system initialized. Current language: ${currentLanguage}${hasMemory ? ' (from memory)' : ''}`);
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
  
  // Initialize the Adaptive Multilingual Resonance Layer first
  initializeMultilingualSystem();
  
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

