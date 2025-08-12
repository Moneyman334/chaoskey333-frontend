"use client";

import Link from 'next/link';
import { EvolutionBadge } from '@/components/EvolutionBadge';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            ⚡️ ChaosKey333 Vault
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Connected to the Chaos Network
          </p>
          <EvolutionBadge className="bg-purple-800 text-purple-200 border-purple-600" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Link href="/replay" className="group">
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300 group-hover:transform group-hover:scale-105">
              <h2 className="text-2xl font-semibold mb-3 text-purple-400">
                🎮 Replay Terminal
              </h2>
              <p className="text-gray-300 mb-4">
                Submit cosmic replay rollups to trigger automatic relic evolution. 
                Each rollup feeds into the permanent evolution system.
              </p>
              <div className="text-purple-300 text-sm font-medium">
                Enter Replay Terminal →
              </div>
            </div>
          </Link>

          <Link href="/admin" className="group">
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-all duration-300 group-hover:transform group-hover:scale-105">
              <h2 className="text-2xl font-semibold mb-3 text-blue-400">
                ⚙️ Admin Dashboard
              </h2>
              <p className="text-gray-300 mb-4">
                Monitor evolution processes, view audit trails, and manage 
                the automatic rollup-to-evolution pipeline.
              </p>
              <div className="text-blue-300 text-sm font-medium">
                Access Dashboard →
              </div>
            </div>
          </Link>
        </div>

        <div className="bg-gray-800 bg-opacity-30 backdrop-blur-sm rounded-lg p-8 border border-gray-700">
          <h2 className="text-2xl font-semibold mb-6 text-center text-gray-100">
            🔮 Evolution System Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🔄</div>
              <h3 className="font-semibold text-purple-300 mb-2">Auto-Feed</h3>
              <p className="text-sm text-gray-400">
                Replay rollups automatically queue evolution jobs
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">🔒</div>
              <h3 className="font-semibold text-purple-300 mb-2">Security</h3>
              <p className="text-sm text-gray-400">
                HMAC signatures and rate limiting protect the system
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">🧬</div>
              <h3 className="font-semibold text-purple-300 mb-2">Mutations</h3>
              <p className="text-sm text-gray-400">
                Deterministic trait generation from rollup data
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-semibold text-purple-300 mb-2">Audit Trail</h3>
              <p className="text-sm text-gray-400">
                Complete history of all evolution events
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}