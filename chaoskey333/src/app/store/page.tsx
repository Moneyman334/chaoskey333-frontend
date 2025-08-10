"use client";

import BuyButton from "../components/BuyButton";
import Link from "next/link";

export default function StorePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ChaosKey333 Store
          </h1>
          <p className="text-xl text-gray-600">
            Secure multi-provider checkout with Stripe, Coinbase Commerce, and PayPal
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Current Payment Provider: <span className="font-semibold">
              {process.env.NEXT_PUBLIC_PAYMENTS_PROVIDER || "Stripe"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Product 1 - Fixed Amount */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-600"></div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Digital Asset
              </h3>
              <p className="text-gray-600 mb-4">
                Premium digital collectible with unique properties
              </p>
              <div className="text-2xl font-bold text-gray-900 mb-4">$25.00</div>
              <BuyButton 
                amount={25} 
                description="Digital Asset Purchase"
                className="w-full"
              />
            </div>
          </div>

          {/* Product 2 - Different Amount */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-green-400 to-teal-600"></div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Rare Relic
              </h3>
              <p className="text-gray-600 mb-4">
                Exclusive rare relic with special abilities
              </p>
              <div className="text-2xl font-bold text-gray-900 mb-4">$50.00</div>
              <BuyButton 
                amount={50} 
                description="Rare Relic Purchase"
                className="w-full"
              />
            </div>
          </div>

          {/* Product 3 - Using Price ID if available */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-orange-400 to-red-600"></div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Legendary Item
              </h3>
              <p className="text-gray-600 mb-4">
                The most powerful item in the vault
              </p>
              <div className="text-2xl font-bold text-gray-900 mb-4">$100.00</div>
              <BuyButton 
                priceId={process.env.NEXT_PUBLIC_STRIPE_PRICE_ID}
                amount={100} 
                description="Legendary Item Purchase"
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Multi-Provider Checkout
            </h2>
            <p className="text-gray-600 mb-4">
              This store supports seamless switching between payment providers:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-center p-3 bg-blue-50 rounded-lg">
                <div className="text-center">
                  <div className="font-semibold text-blue-900">Stripe</div>
                  <div className="text-blue-600">Credit/Debit Cards</div>
                </div>
              </div>
              <div className="flex items-center justify-center p-3 bg-orange-50 rounded-lg">
                <div className="text-center">
                  <div className="font-semibold text-orange-900">Coinbase</div>
                  <div className="text-orange-600">Cryptocurrency</div>
                </div>
              </div>
              <div className="flex items-center justify-center p-3 bg-purple-50 rounded-lg">
                <div className="text-center">
                  <div className="font-semibold text-purple-900">PayPal</div>
                  <div className="text-purple-600">PayPal Payments</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}