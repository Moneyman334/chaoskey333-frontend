"use client";

import { useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';

interface BuyButtonProps {
  amount?: string;
  currency?: string;
  productName?: string;
  description?: string;
  className?: string;
  onSuccess?: (charge: any) => void;
  onError?: (error: any) => void;
}

export default function BuyButton({
  amount = '19.99',
  currency = 'USD',
  productName = 'Superman Relic',
  description = 'Exclusive Superman Relic NFT with special powers',
  className = '',
  onSuccess,
  onError
}: BuyButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeAccount = useActiveAccount();

  const handlePurchase = async () => {
    if (!activeAccount?.address) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🛒 Starting purchase process for wallet:', activeAccount.address);

      // Create Coinbase Commerce charge
      const response = await fetch('/api/commerce/create-charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: activeAccount.address,
          amount,
          currency,
          productName,
          description
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create charge');
      }

      const data = await response.json();
      console.log('✅ Charge created:', data.charge.id);

      // Redirect to Coinbase Commerce checkout
      window.location.href = data.hostedUrl;

      if (onSuccess) {
        onSuccess(data.charge);
      }

    } catch (err: any) {
      console.error('❌ Purchase error:', err);
      const errorMessage = err.message || 'Failed to process purchase';
      setError(errorMessage);
      
      if (onError) {
        onError(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = () => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(parseFloat(amount));
  };

  return (
    <div className="w-full max-w-sm">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        onClick={handlePurchase}
        disabled={isLoading || !activeAccount?.address}
        className={`
          w-full bg-gradient-to-r from-blue-600 to-purple-600 
          text-white font-bold py-4 px-6 rounded-xl 
          hover:from-blue-700 hover:to-purple-700 
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200 transform hover:scale-105
          flex items-center justify-center space-x-2
          ${className}
        `}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Processing...</span>
          </>
        ) : !activeAccount?.address ? (
          <span>Connect Wallet to Buy</span>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Buy {productName} - {formatPrice()}</span>
          </>
        )}
      </button>

      {!activeAccount?.address && (
        <p className="mt-2 text-xs text-gray-500 text-center">
          Connect your wallet to purchase with crypto
        </p>
      )}
    </div>
  );
}