# ChaosKey333 Frontend - Superman Relic Launch Kit

A complete launch kit for the "Superman Relic" ERC-721 NFT deployment with integrated frontend minting capabilities. This project includes smart contracts, metadata hosting, and a MetaMask-enabled minting interface ready for Sepolia testnet deployment.

## 🚀 Features

- **ERC-721 Smart Contract**: Fully featured Superman Relic contract with minting, supply management, and metadata URI functions
- **Metadata Hosting**: Pre-configured JSON metadata files with IPFS-ready structure
- **Frontend Integration**: React components with MetaMask connectivity for seamless minting
- **Sepolia Ready**: Configured for Sepolia testnet deployment and testing
- **Extensible**: Ready for future ERC-1155 verifier and Stripe-gated mint functionality

## 📁 Project Structure

```
├── contracts/
│   └── SupermanRelic.sol          # ERC-721 contract implementation
├── metadata/
│   └── superman/                  # NFT metadata JSON files
│       ├── 1.json
│       ├── 2.json
│       └── ...
├── components/
│   └── MintRelicButton.tsx        # MetaMask mint component
├── pages/
│   └── mint.tsx                   # Minting page interface
├── .env.example                   # Environment configuration template
└── README.md                      # This file
```

## 🛠️ Setup Instructions

### 1. Environment Configuration

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Update the `.env` file with your contract details after deployment:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddressHere
NEXT_PUBLIC_CHAIN_ID=11155111
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Host Metadata Files

#### Option A: Using Firebase Hosting (Recommended)
1. Upload the `metadata/superman/` directory to your Firebase hosting
2. Ensure files are accessible at: `https://your-firebase-app.web.app/metadata/superman/`

#### Option B: Using IPFS
1. Upload the `metadata/superman/` directory to IPFS
2. Update the base URI in your contract deployment to point to your IPFS hash

#### Option C: Using GitHub Pages
1. Push metadata files to a public GitHub repository
2. Enable GitHub Pages
3. Use the resulting URL as your base URI

### 4. Deploy Smart Contract on Sepolia

#### Using Remix IDE (Recommended for beginners)

1. **Open Remix**: Go to [remix.ethereum.org](https://remix.ethereum.org)

2. **Import Contract**: 
   - Create a new file `SupermanRelic.sol`
   - Copy the contents from `contracts/SupermanRelic.sol`

3. **Install Dependencies**:
   - In the File Explorer, add these imports:
   ```solidity
   import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
   import "@openzeppelin/contracts/access/Ownable.sol";
   import "@openzeppelin/contracts/utils/Counters.sol";
   ```

4. **Compile Contract**:
   - Go to the "Solidity Compiler" tab
   - Select compiler version `0.8.0` or higher
   - Click "Compile SupermanRelic.sol"

5. **Deploy Contract**:
   - Go to "Deploy & Run Transactions" tab
   - Select "Injected Provider - MetaMask" as environment
   - Ensure MetaMask is connected to Sepolia testnet
   - Select "SupermanRelic" contract
   - Fill in constructor parameters:
     - `name`: "Superman Relic"
     - `symbol`: "SRELIC"
     - `baseTokenURI`: "https://your-domain.com/metadata/superman/"
     - `_maxSupply`: 1000 (or your desired max supply)
   - Click "Deploy"

6. **Get Contract Address**:
   - Copy the deployed contract address
   - Update your `.env` file with this address

#### Using Hardhat (Advanced)

1. **Setup Hardhat**:
```bash
npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers
npx hardhat init
```

2. **Configure Hardhat** (`hardhat.config.js`):
```javascript
require('@nomiclabs/hardhat-ethers');

module.exports = {
  solidity: "0.8.0",
  networks: {
    sepolia: {
      url: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
      accounts: ["YOUR_PRIVATE_KEY"]
    }
  }
};
```

3. **Deploy Script** (`scripts/deploy.js`):
```javascript
async function main() {
  const SupermanRelic = await ethers.getContractFactory("SupermanRelic");
  const relic = await SupermanRelic.deploy(
    "Superman Relic",
    "SRELIC", 
    "https://your-domain.com/metadata/superman/",
    1000
  );
  console.log("Contract deployed to:", relic.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

4. **Deploy**:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### 5. Frontend Deployment

#### Option A: Vite Development Server
```bash
npm run dev
```
Then visit `/mint.html` or integrate the component into your existing pages.

#### Option B: Build for Production
```bash
npm run build
npm run preview
```

#### Option C: Deploy to Firebase Hosting
```bash
npm run build
firebase deploy
```

## 🎯 Usage

### Accessing the Mint Page

1. Navigate to `/mint` in your deployed application
2. Connect MetaMask wallet
3. Ensure you're on Sepolia testnet (the interface will auto-switch)
4. Click "Mint Superman Relic" to mint your NFT
5. Confirm transaction in MetaMask

### Contract Functions

The deployed contract includes these key functions:

- `mintRelic(address to)`: Owner-only minting function
- `publicMintRelic(address to)`: Public minting function
- `setBaseURI(string baseTokenURI)`: Update metadata base URI
- `setMaxSupply(uint256 _maxSupply)`: Update maximum supply
- `totalSupply()`: Get current total minted
- `maxSupply()`: Get maximum possible supply

## 🔧 Development

### Running Tests
```bash
npm run build  # Test the build process
```

### Adding New Features

#### Future ERC-1155 Support
The contract structure is designed to be extended for ERC-1155 compatibility. Create a new contract that inherits from both ERC-721 and ERC-1155 standards.

#### Stripe Integration
Add payment gating by integrating the existing Stripe configuration in `.env`:
```typescript
// Add to MintRelicButton component
const processPayment = async () => {
  // Stripe payment logic here
  // Then call mint function after successful payment
};
```

### Troubleshooting

#### Common Issues:

1. **MetaMask not detecting**: Ensure MetaMask is installed and unlocked
2. **Wrong network**: Component auto-switches to Sepolia, but manual switching may be needed
3. **Transaction fails**: Check Sepolia ETH balance and gas settings
4. **Metadata not loading**: Verify base URI is correctly set and accessible

#### Getting Sepolia ETH:
- Visit [Sepolia Faucet](https://sepoliafaucet.com/)
- Use [Alchemy Faucet](https://sepoliafaucet.com/)
- Join [Chainlink Faucet](https://faucets.chain.link/)

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify your environment configuration
3. Ensure all dependencies are properly installed
4. Check console logs for detailed error messages

## 🚀 Next Steps

After successful deployment:

1. **Test the full flow**: Connect wallet → Switch to Sepolia → Mint NFT
2. **Verify metadata**: Check that NFTs display correctly in OpenSea (testnet)
3. **Monitor supply**: Track minting progress through the interface
4. **Plan mainnet**: Prepare for mainnet deployment when ready

## 📄 License

This project is part of the ChaosKey333 ecosystem. Please refer to the main project license for usage terms.