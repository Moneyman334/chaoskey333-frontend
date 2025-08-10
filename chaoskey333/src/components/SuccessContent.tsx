'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');
  const [orderData, setOrderData] = useState<any>(null);
  const [claimLink, setClaimLink] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      // Simulate order lookup and claim link generation
      // In production, this would fetch real order data
      setTimeout(() => {
        setOrderData({
          id: orderId,
          amount: '99',
          currency: 'USD',
          product: 'ChaosKey333 Vault - Basic'
        });
        setClaimLink(`${window.location.origin}/mint?claim=mock_claim_token_${orderId}`);
        setIsLoading(false);
      }, 1000);
    } else {
      setIsLoading(false);
    }
  }, [orderId]);

  const copyClaimLink = () => {
    navigator.clipboard.writeText(claimLink);
    alert('Claim link copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-xl">Processing your order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-2xl mx-auto text-center">
        {/* Cinematic Success Animation */}
        <div className="mb-8">
          <div className="relative">
            <div className="text-8xl mb-4 animate-bounce">✅</div>
            <div className="absolute inset-0 bg-green-400/20 rounded-full blur-3xl animate-pulse"></div>
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-5xl font-bold text-white mb-4">
          🎉 Purchase Successful!
        </h1>
        
        <p className="text-xl text-gray-300 mb-8">
          Congratulations! Your ChaosKey333 Vault purchase has been confirmed.
        </p>

        {/* Order Summary */}
        {orderData && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Order Summary</h2>
            <div className="space-y-2 text-gray-300">
              <div className="flex justify-between">
                <span>Order ID:</span>
                <span className="font-mono">{orderData.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Product:</span>
                <span>{orderData.product}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span>${orderData.amount} {orderData.currency}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            href={`/mint?claim=mock_claim_token_${orderId}`}
            className="block w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg text-xl"
          >
            🔓 Mint Now
          </Link>

          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-2">Mint Later</h3>
            <p className="text-gray-400 text-sm mb-4">
              Save this link to mint your vault anytime within the next 7 days:
            </p>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={claimLink}
                readOnly
                className="flex-1 bg-white/10 text-white text-sm rounded-lg px-3 py-2 border border-white/20"
              />
              <button
                onClick={copyClaimLink}
                className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
        </div>

        {/* Continue Shopping */}
        <div className="mt-8">
          <Link
            href="/store"
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            ← Continue Shopping
          </Link>
        </div>
      </div>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
      </div>
    </div>
  );
}