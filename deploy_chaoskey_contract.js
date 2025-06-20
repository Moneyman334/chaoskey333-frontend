// deploy_chaoskey_contract.js
const { ethers } = require("ethers");
require("dotenv").config();

const CONTRACT_ABI = [/* Paste ABI here */];
const CONTRACT_BYTECODE = "0x..."; // Your compiled bytecode here

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

async function deploy() {
  console.log("⛓ Deploying ChaosKey333 contract...");

  const factory = new ethers.ContractFactory(CONTRACT_ABI, CONTRACT_BYTECODE, wallet);
  const contract = await factory.deploy();

  console.log("✅ Contract deployed at:", contract.target);
}

deploy().catch(err => {
  console.error("❌ Deployment failed:", err);
});
