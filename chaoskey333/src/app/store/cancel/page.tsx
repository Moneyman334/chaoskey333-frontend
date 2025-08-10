import { Metadata } from 'next';
import { Suspense } from 'react';
import CancelContent from '@/components/CancelContent';

export const metadata: Metadata = {
  title: 'Payment Cancelled - ChaosKey333 Vault',
  description: 'Your payment was cancelled. No charges have been made to your account.',
  openGraph: {
    title: 'Payment Cancelled - ChaosKey333 Vault',
    description: 'Payment was cancelled. Try again to secure your vault.',
    images: ['/images/og-store.png'],
  },
};

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-black">
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-white">Loading...</div>}>
        <CancelContent />
      </Suspense>
    </div>
  );
}