```javascript
const { ethers } = require('ethers');

async function mintNFT(walletAddress, tokenURI) {
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const contractAddress = process.env.CONTRACT_ADDRESS;
  const abi = [
    "function mint(address to, string memory tokenURI) public"
  ];

  const contract = new ethers.Contract(contractAddress, abi, wallet);

  const tx = await contract.mint(walletAddress, tokenURI);
  await tx.wait();
  return tx;
}

module.exports = { mintNFT };
```