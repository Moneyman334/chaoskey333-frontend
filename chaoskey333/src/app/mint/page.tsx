import { Metadata } from 'next';
import { Suspense } from 'react';
import MintContent from '@/components/MintContent';

export const metadata: Metadata = {
  title: 'Mint Your Vault - ChaosKey333',
  description: 'Mint your ChaosKey333 Vault NFT and secure your digital assets',
  openGraph: {
    title: 'Mint Your Vault - ChaosKey333',
    description: 'Complete your vault minting process',
    images: ['/images/og-mint.png'],
  },
};

export default function MintPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black">
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-white">Loading...</div>}>
        <MintContent />
      </Suspense>
    </div>
  );
}