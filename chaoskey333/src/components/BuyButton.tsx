"use client";

import React, { useState } from 'react';

interface BuyButtonProps {
  productId: string;
  productName: string;
  priceUSD: string;
  className?: string;
  children?: React.ReactNode;
}

export default function BuyButton({ 
  productId, 
  productName, 
  priceUSD, 
  className = "",
  children = "Buy Now"
}: BuyButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const provider = process.env.NEXT_PUBLIC_PAYMENTS_PROVIDER || 'coinbase';
      
      if (provider === 'coinbase') {
        // Placeholder for Coinbase Commerce integration
        console.log('Initiating Coinbase Commerce payment for:', { productId, productName, priceUSD });
        
        // For now, simulate checkout process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        alert(`Payment initiated for ${productName} - $${priceUSD}`);
      } else if (provider === 'paypal') {
        // Placeholder for PayPal integration
        console.log('Initiating PayPal payment for:', { productId, productName, priceUSD });
        
        // For now, simulate checkout process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        alert(`PayPal payment initiated for ${productName} - $${priceUSD}`);
      } else {
        throw new Error('Invalid payment provider');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handlePayment}
        disabled={isLoading}
        className={`
          relative overflow-hidden
          bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600
          hover:from-purple-700 hover:via-pink-700 hover:to-blue-700
          text-white font-bold py-3 px-6 rounded-lg
          transform transition-all duration-200
          hover:scale-105 hover:shadow-lg
          disabled:opacity-50 disabled:cursor-not-allowed
          border-2 border-transparent
          hover:border-cyan-400
          shadow-[0_0_20px_rgba(139,69,255,0.3)]
          hover:shadow-[0_0_30px_rgba(139,69,255,0.5)]
          ${className}
        `}
      >
        {/* Neon glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 opacity-0 hover:opacity-20 transition-opacity duration-300 rounded-lg" />
        
        {/* Button content */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isLoading ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Processing...
            </>
          ) : (
            children
          )}
        </span>
      </button>
      
      {error && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-red-500 text-white text-sm p-2 rounded border-2 border-red-400">
          {error}
        </div>
      )}
    </div>
  );
}