import { Metadata } from 'next';
import { PRODUCTS } from '@/lib/payments';
import ProductCard from '@/components/ProductCard';
import StickyBuyNowDock from '@/components/StickyBuyNowDock';

export const metadata: Metadata = {
  title: 'ChaosKey333 Vault Store - Secure Digital Asset Storage',
  description: 'Choose your ChaosKey333 Vault plan for secure digital asset storage and management',
  openGraph: {
    title: 'ChaosKey333 Vault Store',
    description: 'Secure your digital assets with ChaosKey333 Vault',
    images: ['/images/og-store.png'],
  },
};

export default function StorePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
      {/* Header */}
      <header className="relative z-10 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-bold text-white mb-4 text-center">
            ⚡️ ChaosKey333 Vault Store
          </h1>
          <p className="text-xl text-gray-300 text-center max-w-3xl mx-auto">
            Secure your digital assets with our advanced vault technology. 
            Choose the plan that best fits your security needs.
          </p>
        </div>
      </header>

      {/* Products Grid */}
      <main className="px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </main>

      {/* Sticky Buy Now Dock for Mobile */}
      <StickyBuyNowDock />

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}