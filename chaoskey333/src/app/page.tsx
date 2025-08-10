"use client";

import Link from "next/link";
import { ConnectButton } from "thirdweb/react";
import { client } from "./client";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center min-h-screen px-6">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo/Icon */}
          <div className="text-8xl mb-8">⚡️</div>
          
          {/* Title */}
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6">
            ChaosKey333
            <span className="block text-4xl md:text-6xl text-purple-400 mt-2">
              Vault
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            Secure your digital assets with advanced vault technology.
            <br />
            Your chaos, contained. Your keys, protected.
          </p>

          {/* Call to Action */}
          <div className="space-y-6">
            <Link
              href="/store"
              className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg text-xl"
            >
              🛒 Explore Vault Store
            </Link>

            {/* Wallet Connection */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-white mb-4">Connect Your Wallet</h3>
              <ConnectButton client={client} />
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Why Choose ChaosKey333 Vault?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
              <div className="text-5xl mb-4">🔐</div>
              <h3 className="text-2xl font-bold text-white mb-4">Secure Storage</h3>
              <p className="text-gray-300">
                Military-grade encryption protects your digital assets with advanced security protocols.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold text-white mb-4">Lightning Fast</h3>
              <p className="text-gray-300">
                Instant access to your vaults with optimized blockchain integration and smart contracts.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
              <div className="text-5xl mb-4">🌐</div>
              <h3 className="text-2xl font-bold text-white mb-4">Decentralized</h3>
              <p className="text-gray-300">
                True ownership through NFT technology. Your vault, your rules, your control.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 left-3/4 w-32 h-32 bg-green-500/20 rounded-full blur-2xl animate-pulse"></div>
      </div>
    </div>
  );
}