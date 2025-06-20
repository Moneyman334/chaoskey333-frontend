
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

// Mint Relic Function
async function mintRelic(walletAddress) {
  console.log("⚙️ Initiating relic mint for:", walletAddress);
  const mintStatus = document.getElementById("mintStatus");

  if (mintStatus) {
    mintStatus.innerText = "🌀 Minting in progress...";
  }

  // Simulated mint process (replace with actual contract interaction)
  setTimeout(() => {
    console.log("🧬 Relic Minted for", walletAddress);
    if (mintStatus) {
      mintStatus.innerText = `🧿 Relic Minted to: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
    }
  }, 2000);
}

// Stripe + Mint Trigger
async function checkStripeAndMint(walletAddress) {
  const urlParams = new URLSearchParams(window.location.search);
  const paymentSuccess = urlParams.get("payment") === "success";

  if (paymentSuccess && walletAddress) {
    console.log("✅ Stripe payment detected – minting now...");
    await mintRelic(walletAddress);
  } else {
    console.log("⏳ Awaiting Stripe success flag...");
  }
}

window.onload = async function () {
  // Hide terminal overlay after 3 seconds
  setTimeout(() => {
    const overlay = document.getElementById("terminalOverlay");
    if (overlay) {
      overlay.style.display = "none";
    }
  }, 3000);

  // Connect MetaMask
  const connectWalletBtn = document.getElementById("connectWallet");
  const mintStatus = document.getElementById("mintStatus");
  let userAddress;

  if (connectWalletBtn) {
    connectWalletBtn.onclick = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          userAddress = accounts[0];
          console.log("🔌 Connected Wallet:", userAddress);
          connectWalletBtn.innerText = "✅ " + userAddress.slice(0, 6) + "..." + userAddress.slice(-4);
          mintStatus.innerText = "🧿 Wallet Ready – Awaiting Stripe confirmation...";
          checkStripeAndMint(userAddress);
        } catch (err) {
          console.error("⚠️ Wallet connection error:", err);
          mintStatus.innerText = "❌ Wallet connection failed";
        }
      } else {
        alert("🚨 MetaMask not detected. Please install it.");
        mintStatus.innerText = "🚨 MetaMask not detected";
      }
    };
  }

  // Check for Stripe success on page load
  const urlParams = new URLSearchParams(window.location.search);
  const paymentSuccess = urlParams.get("payment") === "success";

  if (paymentSuccess && userAddress) {
    console.log("✅ Stripe payment success detected!");
    mintRelic(userAddress);
  }
};
