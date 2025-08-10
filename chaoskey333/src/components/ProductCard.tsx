"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import BuyButton from './BuyButton';

interface ProductCardProps {
  id: string;
  name: string;
  price: string;
  image: string;
  description?: string;
  detailsUrl?: string;
}

export default function ProductCard({ 
  id, 
  name, 
  price, 
  image, 
  description,
  detailsUrl = `/product/${id}`
}: ProductCardProps) {
  return (
    <div className="group relative bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-xl overflow-hidden border-2 border-gray-700 hover:border-cyan-400 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
      {/* Neon glow border effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-30 transition-opacity duration-300 rounded-xl blur-sm" />
      
      {/* Card content */}
      <div className="relative z-10 p-6">
        {/* Product Image */}
        <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-800">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Price overlay */}
          <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            ${price}
          </div>
        </div>

        {/* Product Name */}
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors duration-300">
          {name}
        </h3>

        {/* Product Description */}
        {description && (
          <p className="text-gray-300 text-sm mb-4 line-clamp-2">
            {description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <BuyButton
            productId={id}
            productName={name}
            priceUSD={price}
            className="w-full"
          >
            ⚡ Buy Relic Now
          </BuyButton>
          
          <Link
            href={detailsUrl}
            className="w-full text-center py-2 px-4 bg-transparent border-2 border-cyan-400 text-cyan-400 rounded-lg hover:bg-cyan-400 hover:text-black transition-all duration-200 font-medium"
          >
            View Details
          </Link>
        </div>
      </div>

      {/* Animated background particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-2 h-2 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-ping" style={{ top: '20%', left: '10%', animationDelay: '0s' }} />
        <div className="absolute w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-ping" style={{ top: '60%', right: '15%', animationDelay: '0.5s' }} />
        <div className="absolute w-1.5 h-1.5 bg-pink-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-ping" style={{ bottom: '30%', left: '20%', animationDelay: '1s' }} />
      </div>
    </div>
  );
}