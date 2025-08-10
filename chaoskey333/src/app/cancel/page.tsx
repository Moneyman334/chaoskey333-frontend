'use client';

import { Suspense } from 'react';
import CancelContent from './CancelContent';

export default function CancelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen vip-grid flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-red-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading cancel page...</p>
        </div>
      </div>
    }>
      <CancelContent />
    </Suspense>
  );
}
