"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const [chargeInfo, setChargeInfo] = useState<any>(null);

  useEffect(() => {
    // Get charge ID from URL params if available
    const chargeId = searchParams.get('charge_id');
    if (chargeId) {
      setChargeInfo({ id: chargeId });
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          🎉 Payment Successful!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Your Superman Relic purchase has been confirmed! The NFT will be minted to your wallet shortly.
        </p>

        {chargeInfo && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500">Charge ID:</p>
            <p className="font-mono text-sm text-gray-800">{chargeInfo.id}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">What&apos;s Next?</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Your transaction is being processed</li>
              <li>• NFT will be minted to your wallet</li>
              <li>• Check your wallet in 5-10 minutes</li>
            </ul>
          </div>
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Return to Store
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}