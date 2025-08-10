'use client';

import { useState, useEffect } from 'react';
import { PRODUCTS } from '@/lib/payments';

export default function StickyBuyNowDock() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0]);

  useEffect(() => {
    const handleScroll = () => {
      // Show dock when user scrolls down 200px
      setIsVisible(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleQuickBuy = async () => {
    try {
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          paymentProvider: 'coinbase'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const data = await response.json();
      
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    } catch (error) {
      console.error('Quick buy failed:', error);
      alert('Purchase failed. Please try again.');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-black/90 backdrop-blur-lg border-t border-white/20 p-4">
        <div className="flex items-center justify-between max-w-sm mx-auto">
          {/* Product Selector */}
          <div className="flex-1 mr-4">
            <select
              value={selectedProduct.id}
              onChange={(e) => {
                const product = PRODUCTS.find(p => p.id === e.target.value);
                if (product) setSelectedProduct(product);
              }}
              className="w-full bg-white/10 text-white text-sm rounded-lg px-3 py-2 border border-white/20"
            >
              {PRODUCTS.map((product) => (
                <option key={product.id} value={product.id} className="text-black">
                  {product.name} - ${product.price}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Buy Button */}
          <button
            onClick={handleQuickBuy}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 whitespace-nowrap"
          >
            Quick Buy
          </button>
        </div>
      </div>
    </div>
  );
}