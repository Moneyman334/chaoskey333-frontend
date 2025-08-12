import React, { useState } from 'react';
import { ethers } from 'ethers';

// Superman Relic Contract ABI (only the functions we need)
const SUPERMAN_RELIC_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "to", "type": "address"}],
    "name": "publicMintRelic",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maxSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

interface MintRelicButtonProps {
  contractAddress?: string;
  chainId?: number;
}

const MintRelicButton: React.FC<MintRelicButtonProps> = ({ 
  contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '',
  chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 11155111 // Sepolia by default
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string>('');
  const [isMinting, setIsMinting] = useState(false);
  const [mintStatus, setMintStatus] = useState<string>('');
  const [totalSupply, setTotalSupply] = useState<number>(0);
  const [maxSupply, setMaxSupply] = useState<number>(0);

  // Check if wallet is connected
  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          await getSupplyInfo();
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  // Connect to MetaMask
  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Check if we're on the correct network (Sepolia)
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
        const targetChainId = `0x${chainId.toString(16)}`;
        
        if (currentChainId !== targetChainId) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: targetChainId }],
            });
          } catch (switchError: any) {
            // If the chain hasn't been added to MetaMask
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: targetChainId,
                  chainName: 'Sepolia',
                  rpcUrls: ['https://sepolia.infura.io/v3/'],
                  nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  blockExplorerUrls: ['https://sepolia.etherscan.io/'],
                }],
              });
            }
          }
        }

        setAccount(accounts[0]);
        setIsConnected(true);
        setMintStatus('Wallet connected successfully!');
        await getSupplyInfo();
      } catch (error) {
        console.error('Error connecting wallet:', error);
        setMintStatus('Failed to connect wallet');
      }
    } else {
      setMintStatus('MetaMask is not installed. Please install MetaMask and try again.');
    }
  };

  // Get supply information
  const getSupplyInfo = async () => {
    if (!contractAddress || typeof window === 'undefined' || !window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, SUPERMAN_RELIC_ABI, provider);
      
      const currentSupply = await contract.totalSupply();
      const maxSupplyValue = await contract.maxSupply();
      
      setTotalSupply(Number(currentSupply));
      setMaxSupply(Number(maxSupplyValue));
    } catch (error) {
      console.error('Error getting supply info:', error);
    }
  };

  // Mint a Superman Relic
  const mintRelic = async () => {
    if (!contractAddress) {
      setMintStatus('Contract address not configured');
      return;
    }

    if (!isConnected) {
      setMintStatus('Please connect your wallet first');
      return;
    }

    setIsMinting(true);
    setMintStatus('Minting your Superman Relic...');

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, SUPERMAN_RELIC_ABI, signer);

      // Call the mint function
      const tx = await contract.publicMintRelic(account);
      setMintStatus('Transaction submitted. Waiting for confirmation...');
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        setMintStatus('🎉 Successfully minted your Superman Relic!');
        await getSupplyInfo(); // Update supply info
      } else {
        setMintStatus('Transaction failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Error minting relic:', error);
      if (error.code === 4001) {
        setMintStatus('Transaction cancelled by user');
      } else if (error.message.includes('Maximum supply reached')) {
        setMintStatus('Sorry, all Superman Relics have been minted!');
      } else {
        setMintStatus('Minting failed. Please try again.');
      }
    } finally {
      setIsMinting(false);
    }
  };

  // Initialize wallet connection check
  React.useEffect(() => {
    checkWalletConnection();
  }, []);

  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '0 auto', 
      padding: '20px', 
      border: '1px solid #ddd', 
      borderRadius: '10px',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2 style={{ color: '#1f2937', marginBottom: '20px' }}>
        🦸‍♂️ Superman Relic Mint
      </h2>
      
      {maxSupply > 0 && (
        <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
          <p>Supply: {totalSupply} / {maxSupply}</p>
          <div style={{ 
            width: '100%', 
            backgroundColor: '#e5e7eb', 
            borderRadius: '10px', 
            height: '8px' 
          }}>
            <div 
              style={{ 
                width: `${(totalSupply / maxSupply) * 100}%`, 
                backgroundColor: '#3b82f6', 
                height: '100%', 
                borderRadius: '10px' 
              }}
            />
          </div>
        </div>
      )}

      {!isConnected ? (
        <button
          onClick={connectWallet}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            width: '100%',
            marginBottom: '15px'
          }}
        >
          Connect MetaMask
        </button>
      ) : (
        <div>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
            Connected: {account.slice(0, 6)}...{account.slice(-4)}
          </p>
          <button
            onClick={mintRelic}
            disabled={isMinting || totalSupply >= maxSupply}
            style={{
              backgroundColor: isMinting || totalSupply >= maxSupply ? '#9ca3af' : '#dc2626',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: isMinting || totalSupply >= maxSupply ? 'not-allowed' : 'pointer',
              width: '100%',
              marginBottom: '15px'
            }}
          >
            {isMinting ? 'Minting...' : totalSupply >= maxSupply ? 'Sold Out' : 'Mint Superman Relic'}
          </button>
        </div>
      )}

      {mintStatus && (
        <p style={{ 
          fontSize: '14px', 
          color: mintStatus.includes('Successfully') ? '#16a34a' : 
                  mintStatus.includes('Failed') || mintStatus.includes('Error') ? '#dc2626' : '#666',
          marginTop: '10px',
          wordWrap: 'break-word'
        }}>
          {mintStatus}
        </p>
      )}

      <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '15px' }}>
        <p>Network: Sepolia Testnet</p>
        {contractAddress && (
          <p>Contract: {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}</p>
        )}
      </div>
    </div>
  );
};

export default MintRelicButton;