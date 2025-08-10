'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ConnectButton } from 'thirdweb/react';
import { client } from '@/app/client';
import Link from 'next/link';

interface ClaimData {
  valid: boolean;
  orderId: string;
  amount: string;
  currency: string;
  expiresAt: string;
}

export default function MintContent() {
  const searchParams = useSearchParams();
  const claimToken = searchParams.get('claim');
  const [claimData, setClaimData] = useState<ClaimData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isMinting, setIsMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);

  useEffect(() => {
    const validateClaim = async () => {
      try {
        const response = await fetch('/api/claims/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: claimToken }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to validate claim');
        }

        const data = await response.json();
        setClaimData(data);
      } catch (error) {
        console.error('Claim validation failed:', error);
        setError(error instanceof Error ? error.message : 'Failed to validate claim');
      } finally {
        setIsLoading(false);
      }
    };

    if (claimToken) {
      validateClaim();
    } else {
      setError('No claim token provided');
      setIsLoading(false);
    }
  }, [claimToken]);

  const handleMint = async () => {
    if (!claimToken) return;

    setIsMinting(true);
    try {
      // Consume the claim and get mint signature
      const response = await fetch('/api/claims/consume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: claimToken }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to consume claim');
      }

      const data = await response.json();
      
      // In a real implementation, you would use the mint signature
      // to interact with the smart contract here
      console.log('Mint signature received:', data.mintSignature);
      
      // Simulate minting process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMintSuccess(true);

      // Trigger data layer event for tracking
      console.log('Vault minted:', {
        orderId: data.orderId,
        amount: data.amount,
        currency: data.currency
      });
      
    } catch (error) {
      console.error('Minting failed:', error);
      alert(error instanceof Error ? error.message : 'Minting failed');
    } finally {
      setIsMinting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-xl">Validating your claim...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-8xl mb-4">⚠️</div>
          <h1 className="text-4xl font-bold text-white mb-4">Invalid Claim</h1>
          <p className="text-xl text-gray-300 mb-8">{error}</p>
          
          <div className="space-y-4">
            <Link
              href="/store"
              className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg text-xl"
            >
              🛒 Shop for Vaults
            </Link>
            
            <Link
              href="/"
              className="block w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 border border-white/20"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (mintSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="text-8xl mb-4 animate-bounce">🎉</div>
            <div className="absolute inset-0 bg-green-400/20 rounded-full blur-3xl animate-pulse"></div>
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-4">
            Vault Minted Successfully!
          </h1>
          
          <p className="text-xl text-gray-300 mb-8">
            Your ChaosKey333 Vault has been minted and is now secured on the blockchain.
          </p>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Your Vault</h2>
            <div className="space-y-2 text-gray-300">
              <div className="flex justify-between">
                <span>Order ID:</span>
                <span className="font-mono">{claimData?.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span>${claimData?.amount} {claimData?.currency}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="text-green-400">Minted ✅</span>
              </div>
            </div>
          </div>

          <Link
            href="/"
            className="block w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg text-xl"
          >
            🏠 Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-2xl mx-auto text-center">
        {/* Vault Icon */}
        <div className="mb-8">
          <div className="text-8xl mb-4">🔐</div>
        </div>

        {/* Title */}
        <h1 className="text-5xl font-bold text-white mb-4">
          Mint Your Vault
        </h1>
        
        <p className="text-xl text-gray-300 mb-8">
          You&apos;re ready to mint your ChaosKey333 Vault NFT. Connect your wallet and complete the minting process.
        </p>

        {/* Claim Details */}
        {claimData && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Claim Details</h2>
            <div className="space-y-2 text-gray-300">
              <div className="flex justify-between">
                <span>Order ID:</span>
                <span className="font-mono">{claimData.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span>${claimData.amount} {claimData.currency}</span>
              </div>
              <div className="flex justify-between">
                <span>Expires:</span>
                <span>{new Date(claimData.expiresAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Wallet Connection */}
        <div className="space-y-6">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Connect Your Wallet</h3>
            <ConnectButton client={client} />
          </div>

          {/* Mint Button */}
          <button
            onClick={handleMint}
            disabled={isMinting}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg text-xl"
          >
            {isMinting ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                Minting...
              </span>
            ) : (
              '🪙 Mint Vault NFT'
            )}
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-8 bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-2">What happens next?</h3>
          <p className="text-gray-400 text-sm">
            After minting, your vault NFT will be transferred to your connected wallet. 
            This proves ownership of your ChaosKey333 Vault and provides access to all vault features.
          </p>
        </div>
      </div>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
      </div>
    </div>
  );
}