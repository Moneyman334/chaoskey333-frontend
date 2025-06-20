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
}window.onload = async function () {
  const connectWalletBtn = document.getElementById("connectWallet");
  const mintStatus = document.getElementById("mintStatus");
  let userAddress;

  // Connect Wallet
  connectWalletBtn.onclick = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        userAddress = accounts[0];
        console.log("🟢 Wallet connected:", userAddress);
        connectWalletBtn.innerText = "✅ " + userAddress.slice(0, 6) + "..." + userAddress.slice(-4);
        mintStatus.innerText = "🧿 Wallet Ready – Awaiting Stripe confirmation...";
        checkStripeAndMint(userAddress);
      } catch (err) {
        console.error("❌ Wallet connection error:", err);
      }
    } else {
      alert("🚨 MetaMask not detected.");
    }
  };
};

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

// Mint Relic Function (Plug in your contract info)
async function mintRelic(walletAddress) {
  const CONTRACT_ADDRESS = "0xYourContractAddressHere";
  const CONTRACT_ABI = [
    "function mint(address to, string memory tokenURI) public"
  ];

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

  try {
    const tokenURI = "https://gateway.pinata.cloud/ipfs/QmYourRelicMetadataHash";
    const tx = await contract.mint(walletAddress, tokenURI);
    console.log("🚀 Mint TX sent:", tx.hash);
    document.getElementById("mintStatus").innerText = "🌀 Minting in progress...";

    await tx.wait();
    document.getElementById("mintStatus").innerText = `✅ Relic Minted to ${walletAddress}`;
  } catch (err) {
    console.error("❌ Minting failed:", err);
    document.getElementById("mintStatus").innerText = "⚠️ Mint failed: " + err.message;
  }
}
