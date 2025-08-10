"use client";

import Image from "next/image";
import { ConnectButton } from "thirdweb/react";
import { client } from "./client";
import BuyButton from "./components/BuyButton";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            ⚡️ ChaosKey333 Vault
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Unlock the power of the Superman Relic
          </p>
          <ConnectButton client={client} />
        </div>

        {/* Product Showcase */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Product Image Placeholder */}
              <div className="aspect-square bg-gradient-to-br from-red-500 to-blue-500 rounded-2xl flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-6xl mb-4">🦸‍♂️</div>
                  <h3 className="text-2xl font-bold">Superman Relic</h3>
                  <p className="text-lg opacity-80">Legendary NFT</p>
                </div>
              </div>

              {/* Product Details */}
              <div className="text-white">
                <h2 className="text-3xl font-bold mb-6">Superman Relic</h2>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">💎</span>
                    <span>Exclusive legendary relic with special powers</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">⚡</span>
                    <span>Minted directly to your wallet</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🔐</span>
                    <span>Secure payment with Coinbase Commerce</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🚀</span>
                    <span>Instant delivery after payment confirmation</span>
                  </div>
                </div>

                <div className="bg-white/20 rounded-xl p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg">Price:</span>
                    <span className="text-2xl font-bold">$19.99 USD</span>
                  </div>
                </div>

                <BuyButton 
                  amount="19.99"
                  currency="USD"
                  productName="Superman Relic"
                  onSuccess={(charge) => {
                    console.log('Purchase successful:', charge);
                  }}
                  onError={(error) => {
                    console.error('Purchase failed:', error);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-6 text-white">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
              <div className="text-3xl mb-4">💳</div>
              <h3 className="text-xl font-bold mb-2">Crypto Payments</h3>
              <p className="text-gray-300">Pay with Bitcoin, Ethereum, and other cryptocurrencies</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2">Instant Minting</h3>
              <p className="text-gray-300">NFT minted to your wallet within minutes</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
              <div className="text-3xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold mb-2">Secure & Safe</h3>
              <p className="text-gray-300">Protected by Coinbase Commerce security</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}