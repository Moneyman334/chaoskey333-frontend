"use client";

import React from 'react';
import ProductCard from '@/components/ProductCard';

// Mock product data - in a real app, this would come from an API or database
const products = [
  {
    id: process.env.NEXT_PUBLIC_PRODUCT_ID || 'chaos_relic_001',
    name: process.env.NEXT_PUBLIC_PRODUCT_NAME || 'Legendary Family Relic',
    price: process.env.NEXT_PUBLIC_PRODUCT_PRICE_USD || '50',
    image: '/api/placeholder/400/300', // Placeholder image
    description: 'An ancient relic imbued with chaotic energy, passed down through generations of the most powerful families.'
  },
  {
    id: 'chaos_relic_002',
    name: 'Mystic Chaos Orb',
    price: '75',
    image: '/api/placeholder/400/300',
    description: 'A swirling orb of pure chaos energy that grants its wielder unpredictable but powerful abilities.'
  },
  {
    id: 'chaos_relic_003',
    name: 'Voidwalker\'s Pendant',
    price: '100',
    image: '/api/placeholder/400/300',
    description: 'A pendant that allows its wearer to step between dimensions and harness the power of the void.'
  },
  {
    id: 'chaos_relic_004',
    name: 'Stormbreaker\'s Ring',
    price: '60',
    image: '/api/placeholder/400/300',
    description: 'A ring forged in the heart of a cosmic storm, granting control over lightning and thunder.'
  },
  {
    id: 'chaos_relic_005',
    name: 'Shadowmancer\'s Tome',
    price: '125',
    image: '/api/placeholder/400/300',
    description: 'An ancient book containing forbidden knowledge of shadow magic and dark arts.'
  },
  {
    id: 'chaos_relic_006',
    name: 'Phoenix Feather Amulet',
    price: '90',
    image: '/api/placeholder/400/300',
    description: 'An amulet containing the essence of a phoenix, providing protection and rebirth powers.'
  }
];

export default function StorePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative py-20 px-4 text-center">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-full h-full bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20" />
          
          {/* Floating particles */}
          <div className="absolute w-2 h-2 bg-cyan-400 rounded-full animate-ping" style={{ top: '10%', left: '10%', animationDelay: '0s' }} />
          <div className="absolute w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{ top: '20%', right: '20%', animationDelay: '1s' }} />
          <div className="absolute w-1.5 h-1.5 bg-pink-400 rounded-full animate-ping" style={{ top: '30%', left: '80%', animationDelay: '2s' }} />
          <div className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-ping" style={{ bottom: '30%', left: '15%', animationDelay: '1.5s' }} />
          <div className="absolute w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ bottom: '20%', right: '10%', animationDelay: '0.5s' }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            ⚡ CHAOS STORE ⚡
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            Discover legendary relics and artifacts imbued with chaotic energy. 
            Each piece holds ancient power waiting to be unleashed.
          </p>
          
          {/* Neon border divider */}
          <div className="w-32 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 mx-auto rounded-full shadow-lg shadow-cyan-400/50" />
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                image={product.image}
                description={product.description}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="border-t border-gray-800 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Need Help?</h2>
          <p className="text-gray-300 mb-6">
            Our chaos specialists are here to guide you through your relic selection.
          </p>
          <a 
            href="mailto:support@chaoskey333.com" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 border-2 border-transparent hover:border-cyan-400 shadow-[0_0_20px_rgba(139,69,255,0.3)] hover:shadow-[0_0_30px_rgba(139,69,255,0.5)]"
          >
            📧 Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}