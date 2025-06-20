
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

// Connect MetaMask Wallet
async function connectWallet() {
  const connectWalletBtn = document.getElementById("connectWallet");
  const mintStatus = document.getElementById("mintStatus");

  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      userWalletAddress = accounts[0];
      isWalletConnected = true;
      
      console.log("🔌 Connected Wallet:", userWalletAddress);
      connectWalletBtn.innerText = "✅ " + userWalletAddress.slice(0, 6) + "..." + userWalletAddress.slice(-4);
      mintStatus.innerText = "🧿 Wallet Connected – Ready for Stripe payment";
      
      // Check if we have a successful Stripe payment
      checkStripeAndMint();
      
    } catch (err) {
      console.error("⚠️ Wallet connection error:", err);
      mintStatus.innerText = "❌ Wallet connection failed";
    }
  } else {
    alert("🚨 MetaMask not detected. Please install MetaMask extension.");
    mintStatus.innerText = "🚨 MetaMask required for vault access";
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

// Check Stripe Payment and Trigger Mint
function checkStripeAndMint() {
  const urlParams = new URLSearchParams(window.location.search);
  const paymentSuccess = urlParams.get("payment") === "success";
  const sessionId = urlParams.get("session_id");

  if (paymentSuccess && isWalletConnected && userWalletAddress) {
    console.log("✅ Stripe payment success + MetaMask connected - minting to vault...");
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
  // Hide terminal overlay after 3 seconds
  setTimeout(() => {
    const overlay = document.getElementById("terminalOverlay");
    if (overlay) {
      overlay.style.display = "none";
    }
  }, 3000);

  // Set up wallet connection button
  const connectWalletBtn = document.getElementById("connectWallet");
  if (connectWalletBtn) {
    connectWalletBtn.onclick = connectWallet;
  }

  // Check for existing Stripe payment on page load
  checkStripeAndMint();

  // Listen for account changes in MetaMask
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', function (accounts) {
      if (accounts.length === 0) {
        // User disconnected wallet
        userWalletAddress = null;
        isWalletConnected = false;
        document.getElementById("connectWallet").innerText = "🔌 Connect Wallet";
        document.getElementById("mintStatus").innerText = "🔒 Wallet disconnected";
      } else {
        // User switched accounts
        userWalletAddress = accounts[0];
        document.getElementById("connectWallet").innerText = "✅ " + userWalletAddress.slice(0, 6) + "..." + userWalletAddress.slice(-4);
      }
    });
  }
};
