"use client";

import Image from "next/image";
import { ConnectButton } from "thirdweb/react";
import { client } from "./client";
import Link from "next/link";

export default function Home() {
  const mapEnabled = process.env.NEXT_PUBLIC_MAP_ENABLE === '1';

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            ⚡️ ChaosKey333 Vault
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Interactive Command Board - Omni-Singularity Map & Cosmic Replay Terminal
          </p>
          <ConnectButton client={client} />
        </div>

        {mapEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            <Link href="/map" className="group">
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 hover:border-cyan-500 transition-colors">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🗺</div>
                <h2 className="text-2xl font-bold text-cyan-400 mb-2">Omni-Singularity Map</h2>
                <p className="text-gray-400">
                  Interactive 3D constellation of PR nodes. Click any node to open its Replay Capsule with synchronized timeline.
                </p>
                <div className="mt-4 flex items-center text-cyan-400 group-hover:text-cyan-300">
                  <span>Explore Map</span>
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>

            <Link href="/replay/PR-18" className="group">
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 hover:border-purple-500 transition-colors">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📺</div>
                <h2 className="text-2xl font-bold text-purple-400 mb-2">Cosmic Replay Terminal</h2>
                <p className="text-gray-400">
                  Watch PR-18 golden sample with glyph overlays, spectral HUD, and multi-language support.
                </p>
                <div className="mt-4 flex items-center text-purple-400 group-hover:text-purple-300">
                  <span>View Sample</span>
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>
          </div>
        )}

        <div className="mt-16 p-6 bg-gray-900 border border-gray-700 rounded-lg">
          <h3 className="text-xl font-bold text-cyan-400 mb-4">Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Clickable PR Constellations</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Synchronized A/V Timeline</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Live Pulse Layer (LIVE/MUTATING/ARCHIVED)</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Spectral Decode HUD</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Deep Link Sharing</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Multi-language Support</span>
              </div>
            </div>
          </div>
        </div>

        {!mapEnabled && (
          <div className="mt-8 p-4 bg-yellow-900 border border-yellow-600 rounded-lg">
            <p className="text-yellow-200">
              <strong>Note:</strong> Interactive Command Board is currently disabled. 
              Set <code>NEXT_PUBLIC_MAP_ENABLE=1</code> in environment variables to enable.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}