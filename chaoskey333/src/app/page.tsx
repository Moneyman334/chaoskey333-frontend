"use client";

import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">⚡️ ChaosKey333 Vault</h1>
      <div className="w-full max-w-md">
        <p className="text-center text-gray-400 mb-4">Welcome to the Chaos-Themed Storefront</p>
        {/* Placeholder for future BuyButton component */}
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-400">Checkout system will be implemented here</p>
        </div>
      </div>
    </div>
  );
}