'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/lib/payments';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  const handlePurchase = async () => {
    try {
      // Show loading state
      const button = document.getElementById(`buy-${product.id}`) as HTMLButtonElement;
      if (button) {
        button.disabled = true;
        button.textContent = 'Processing...';
      }

      // Create order
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          paymentProvider: 'coinbase' // Default to Coinbase
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const data = await response.json();
      
      // Redirect to payment
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again.');
      
      // Reset button state
      const button = document.getElementById(`buy-${product.id}`) as HTMLButtonElement;
      if (button) {
        button.disabled = false;
        button.textContent = 'Buy Now';
      }
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-purple-400/50 transition-all duration-300 group">
      {/* Product Image */}
      <div className="relative h-48 mb-6 rounded-xl overflow-hidden bg-gray-800">
        {!imageError ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
            <div className="text-white text-center">
              <div className="text-6xl mb-2">🔐</div>
              <div className="text-sm opacity-80">Vault Image</div>
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">
          {product.name}
        </h3>
        
        <p className="text-gray-300 text-sm leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold text-white">
            ${product.price}
            <span className="text-sm text-gray-400 ml-1">{product.currency}</span>
          </div>
        </div>

        {/* Purchase Buttons */}
        <div className="space-y-3 pt-4">
          <button
            id={`buy-${product.id}`}
            onClick={handlePurchase}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
          >
            Buy Now with Crypto
          </button>
          
          <button
            onClick={() => handlePurchase()}
            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
          >
            Buy with PayPal
          </button>
        </div>
      </div>
    </div>
  );
}