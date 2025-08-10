"use client";

import dynamic from "next/dynamic";

// Dynamically import the component to avoid SSR issues with gamepad API
const CosmicReplayTerminal = dynamic(
  () => import("../components/CosmicReplayTerminal"),
  { ssr: false }
);

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">⚡️ ChaosKey333 Vault</h1>
          <p className="text-lg text-gray-600">Navigate the Omni-Singularity Map with keyboard and gamepad controls</p>
        </div>
        
        <CosmicReplayTerminal />
      </div>
    </div>
  );
}