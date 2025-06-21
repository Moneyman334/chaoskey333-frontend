
```javascript
const { ethers } = require('ethers');

async function mintNFT(walletAddress, tokenURI) {
  if (!window.ethereum) {
    alert("⚠️ MetaMask not detected.");
    return;
  }

  try {
    // 🔌 Connect to Ethereum via MetaMask
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // 🧱 Replace with your actual contract address and ABI
    const contractAddress = "0xYourDeployedContractAddress"; // Replace this
    const contractABI = [
      "function mint(address to, string memory tokenURI) public"
    ];

    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    // 🚀 Mint the NFT
    console.log("🔥 Sending mint transaction...");
    const tx = await contract.mint(walletAddress, tokenURI);
    await tx.wait();

    console.log(`✅ NFT minted! Tx Hash: ${tx.hash}`);
    alert(`Relic minted! 🧬 TX: ${tx.hash}`);
  } catch (error) {
    console.error("❌ Minting failed:", error);
    alert("Mint failed. Check console for details.");
  }
}

// Example method invocation
// Ensure to call this function with appropriate parameters:
// mintNFT('0xWalletAddressHere', 'ipfs://QmMetaCID123...');
```
