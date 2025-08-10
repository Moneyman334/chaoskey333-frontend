import { Metadata } from 'next';
import { Suspense } from 'react';
import SuccessContent from '@/components/SuccessContent';

export const metadata: Metadata = {
  title: 'Purchase Successful - ChaosKey333 Vault',
  description: 'Your ChaosKey333 Vault purchase was successful. Mint your vault now or save the link for later.',
  openGraph: {
    title: 'Purchase Successful - ChaosKey333 Vault',
    description: 'Your vault purchase was successful! Time to mint your digital asset.',
    images: ['/images/og-success.png'],
  },
};

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-purple-900 to-black">
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-white">Loading...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}