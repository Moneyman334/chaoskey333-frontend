import { createThirdwebClient, getContract, prepareContractCall, sendTransaction } from 'thirdweb';
import { sepolia } from 'thirdweb/chains';
import { createWallet } from 'thirdweb/wallets';

// Superman Relic metadata
export const SUPERMAN_RELIC_METADATA = {
  name: "Superman Relic",
  description: "A legendary relic from the House of El, imbued with the power of Kryptonian heritage.",
  image: "ipfs://QmSupermanRelicImageHash", // Replace with actual IPFS hash
  attributes: [
    {
      trait_type: "Rarity",
      value: "Legendary"
    },
    {
      trait_type: "Origin",
      value: "Krypton"
    },
    {
      trait_type: "Power Level",
      value: "Divine"
    },
    {
      trait_type: "Collection",
      value: "ChaosKey333 Vault"
    }
  ]
};

/**
 * Mint Superman Relic using client wallet
 */
export async function mintSupermanRelic(
  clientWallet: any,
  recipientAddress: string
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    if (!contractAddress) {
      throw new Error('Contract address not configured');
    }

    const clientId = process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID;
    if (!clientId) {
      throw new Error('Thirdweb client ID not configured');
    }

    const client = createThirdwebClient({ clientId });
    
    const contract = getContract({
      client,
      chain: sepolia,
      address: contractAddress,
    });

    // Prepare the mint transaction
    const transaction = prepareContractCall({
      contract,
      method: 'function mint(address to, string memory tokenURI)',
      params: [
        recipientAddress,
        `data:application/json;base64,${Buffer.from(JSON.stringify(SUPERMAN_RELIC_METADATA)).toString('base64')}`
      ],
    });

    // Send transaction using the connected wallet
    const result = await sendTransaction({
      transaction,
      account: clientWallet,
    });

    return {
      success: true,
      txHash: result.transactionHash
    };
  } catch (error) {
    console.error('Minting error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown minting error'
    };
  }
}

/**
 * Generate metadata URI for Superman Relic
 */
export function generateSupermanRelicMetadataURI(): string {
  return `data:application/json;base64,${Buffer.from(JSON.stringify(SUPERMAN_RELIC_METADATA)).toString('base64')}`;
}

/**
 * Validate wallet address
 */
export function isValidWalletAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}