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
mintNFT({
  wallet: "your_metamask_address",
  tokenURI: "ipfs://.../test-relic.json",
  tag: "FrankensteinVault333-TestRelic01"
});
window.onload = async function () {
  // Connect MetaMask
  const connectWalletBtn = document.getElementById("connectWallet");
  let userAddress;

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

  // Stripe payment success simulation
  const urlParams = new URLSearchParams(window.location.search);
  const paymentSuccess = urlParams.get("payment") === "success";

  if (paymentSuccess && userAddress) {
    console.log("✅ Stripe payment success detected!");
    mintRelic(userAddress);
  }
};

// Simulated mint function (upgrade to real smart contract)
async function mintRelic(walletAddress) {
  console.log("⚙️ Initiating relic mint for:", walletAddress);

  // Example: Fake mint success
  setTimeout(() => {
    console.log("🧬 Relic Minted for", walletAddress);
    document.getElementById("mintStatus").innerText = `🧿 Relic Minted to: ${walletAddress}`;
  }, 2000);
}
async function mintRelic(walletAddress) {
  console.log("⚙️ Connecting to smart contract...");

  // Replace with YOUR actual contract info
  const CONTRACT_ADDRESS = "0xYourContractAddress";
  const CONTRACT_ABI = [ 
    // 🔐 Minimal ABI required for mint
    "function mint(address to) public"
  ];

  if (!window.ethereum) return alert("MetaMask is required!");

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

  try {
    const tx = await contract.mint(walletAddress);
    console.log("🚀 Mint transaction sent:", tx.hash);

    document.getElementById("mintStatus").innerText = "🌀 Minting in progress...";
    await tx.wait();

    console.log("✅ Mint confirmed:", tx.hash);
    document.getElementById("mintStatus").innerText = `🧿 Relic Minted to: ${walletAddress}`;
  } catch (err) {
    console.error("❌ Minting failed:", err);
    alert("Mint failed: " + err.message);
  }
}
d



 