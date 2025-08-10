'use client';

import { Suspense } from 'react';
import SuccessContent from './SuccessContent';

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen vip-grid flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading success page...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
