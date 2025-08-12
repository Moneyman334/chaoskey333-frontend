# Superman Relic ERC-721 Deployment Checklist

## Pre-Deployment Checklist

### 1. Metadata Hosting
- [ ] Upload metadata files to hosting service
  - [ ] Upload `metadata/superman/*.json` files
  - [ ] Ensure files are accessible via HTTPS
  - [ ] Note the base URL (e.g., `https://your-domain.com/metadata/superman/`)

### 2. Contract Deployment Preparation
- [ ] Have Sepolia ETH in deployment wallet
- [ ] Prepare constructor parameters:
  - [ ] Name: "Superman Relic"
  - [ ] Symbol: "SRELIC" 
  - [ ] Base URI: Your metadata hosting URL
  - [ ] Max Supply: 1000 (or desired amount)

### 3. Environment Setup
- [ ] Copy `.env.example` to `.env`
- [ ] Update environment variables (will be done post-deployment)

## Deployment Steps

### Step 1: Deploy Contract via Remix
1. [ ] Open [Remix IDE](https://remix.ethereum.org)
2. [ ] Create new file and paste `contracts/SupermanRelic.sol`
3. [ ] Install OpenZeppelin contracts
4. [ ] Compile with Solidity 0.8.0+
5. [ ] Connect MetaMask to Sepolia
6. [ ] Deploy with constructor parameters
7. [ ] **Save contract address**: `________________`

### Step 2: Update Environment
1. [ ] Update `.env` with deployed contract address:
   ```
   NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddressHere
   NEXT_PUBLIC_CHAIN_ID=11155111
   ```

### Step 3: Frontend Deployment
1. [ ] Build the project: `npm run build`
2. [ ] Copy `mint.html` to dist folder
3. [ ] Deploy to hosting service (Firebase, Vercel, etc.)
4. [ ] **Save deployment URL**: `________________`

## Post-Deployment Verification

### Contract Verification
- [ ] Contract deployed successfully on Sepolia
- [ ] Contract verified on [Sepolia Etherscan](https://sepolia.etherscan.io)
- [ ] Base URI set correctly
- [ ] Max supply configured correctly
- [ ] Owner functions accessible

### Frontend Verification
- [ ] Website loads without errors
- [ ] `/mint.html` page accessible
- [ ] MetaMask connection prompt works
- [ ] Network switching to Sepolia works
- [ ] Contract address displayed correctly
- [ ] Supply information loads (when contract configured)

### Integration Testing
- [ ] Connect MetaMask wallet
- [ ] Switch to Sepolia network
- [ ] Attempt mint transaction (test with small amount of Sepolia ETH)
- [ ] Verify NFT appears in wallet
- [ ] Check metadata displays correctly

## Production Checklist (Future Mainnet Deployment)

### Security
- [ ] Smart contract audit completed
- [ ] Testnet thoroughly tested
- [ ] Private keys secured
- [ ] Multi-sig wallet for contract ownership

### Metadata
- [ ] Metadata hosted on decentralized storage (IPFS)
- [ ] Images uploaded to permanent storage
- [ ] Backup of all metadata files

### Frontend
- [ ] Environment configured for mainnet
- [ ] Gas fee estimation implemented
- [ ] Error handling comprehensive
- [ ] Mobile responsiveness tested

## Emergency Contacts & Resources

- **Sepolia Faucets**:
  - [SepoliaFaucet.com](https://sepoliafaucet.com/)
  - [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
  - [Chainlink Faucet](https://faucets.chain.link/)

- **Block Explorers**:
  - [Sepolia Etherscan](https://sepolia.etherscan.io)

- **Development Tools**:
  - [Remix IDE](https://remix.ethereum.org)
  - [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)

## Notes
- Keep this checklist updated with actual values during deployment
- Save all contract addresses and transaction hashes for reference
- Document any issues encountered during deployment
- Test thoroughly on testnet before mainnet deployment