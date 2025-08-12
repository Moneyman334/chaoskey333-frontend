"use client";

import Image from "next/image";
import Link from "next/link";
import { ConnectButton } from "thirdweb/react";

export default function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "5rem" }}>
      <h1>⚡️ ChaosKey333 Vault</h1>
      {/* Temporarily commented out for build - will fix after API implementation */}
      {/* <ConnectButton /> */}
      
      <div style={{ marginTop: "2rem" }}>
        <Link 
          href="/admin" 
          className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 transition-colors font-bold"
        >
          🎛️ Access Cosmic Replay Terminal
        </Link>
      </div>
    </div>
  );
}