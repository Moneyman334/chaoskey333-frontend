
require("dotenv").config(); // Load environment variables
const { ethers } = require("ethers");
const fs = require("fs");

// ✅ STEP 1: Set up provider
const provider = new ethers.JsonRpcProvider(process.env.INFURA_URL); // OR use Alchemy/Ankr/etc

// ✅ STEP 2: Load wallet from PRIVATE_KEY (make sure it's in .env)
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey || privateKey.length < 64) {
  throw new Error("🚨 Invalid PRIVATE_KEY in .env. Make sure it's present and doesn't include '0x'");
}

const wallet = new ethers.Wallet(privateKey, provider);

// ✅ STEP 3: Load compiled contract ABI and bytecode
const abi = JSON.parse(fs.readFileSync("./artifacts/YourContract.sol/YourContract.json")).abi;
const bytecode = JSON.parse(fs.readFileSync("./artifacts/YourContract.sol/YourContract.json")).bytecode;

// ✅ STEP 4: Deploy
async function deploy() {
  console.log("🚀 Starting contract deployment...");

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy(); // You can pass constructor args here if needed

  console.log("⏳ Waiting for deployment confirmation...");
  await contract.deployed();

  console.log("✅ Contract deployed at:", contract.address);
}

deploy().catch((err) => {
  console.error("❌ Deployment failed:", err);
});
