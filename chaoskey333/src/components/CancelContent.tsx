'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function CancelContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-2xl mx-auto text-center">
        {/* Cancel Icon */}
        <div className="mb-8">
          <div className="text-8xl mb-4">❌</div>
        </div>

        {/* Cancel Message */}
        <h1 className="text-5xl font-bold text-white mb-4">
          Payment Cancelled
        </h1>
        
        <p className="text-xl text-gray-300 mb-8">
          No worries! Your payment was cancelled and no charges have been made to your account.
        </p>

        {/* Order Info */}
        {orderId && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
            <h2 className="text-xl font-bold text-white mb-2">Order Information</h2>
            <p className="text-gray-300">
              Order ID: <span className="font-mono">{orderId}</span>
            </p>
          </div>
        )}

        {/* Retry Actions */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white mb-4">What would you like to do?</h2>
          
          <Link
            href="/store"
            className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg text-xl"
          >
            🛒 Try Again
          </Link>

          <Link
            href="/"
            className="block w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 border border-white/20"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-2">Need Help?</h3>
          <p className="text-gray-400 text-sm">
            If you&apos;re experiencing issues with payment, please contact our support team.
            We&apos;re here to help you secure your ChaosKey333 Vault.
          </p>
        </div>
      </div>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}