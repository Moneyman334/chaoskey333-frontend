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
  let userAddress;

  if (connectWalletBtn) {
    connectWalletBtn.onclick = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          userAddress = accounts[0];
          console.log("🔌 Connected Wallet:", userAddress);
          connectWalletBtn.innerText = "🟢 Wallet Connected";
        } catch (err) {
          console.error("⚠️ Wallet connection error:", err);
        }
      } else {
        alert("🚨 MetaMask not detected. Please install it.");
      }
    };
  }

  // Stripe payment success simulation
  const urlParams = new URLSearchParams(window.location.search);
  const paymentSuccess = urlParams.get("payment") === "success";

  if (paymentSuccess && userAddress) {
    console.log("✅ Stripe payment success detected!");
    mintRelic(userAddress);
  }
};

// Simulated mint function
async function mintRelic(walletAddress) {
  console.log("⚙️ Initiating relic mint for:", walletAddress);

  // Example: Fake mint success
  setTimeout(() => {
    console.log("🧬 Relic Minted for", walletAddress);
    const mintStatus = document.getElementById("mintStatus");
    if (mintStatus) {
      mintStatus.innerText = `🧿 Relic Minted to: ${walletAddress}`;
    }
  }, 2000);
}