"use client";

import { useEffect } from "react";
import { trackPageView, trackWalletConnect } from "@/lib/telemetry";

export default function Home() {
  useEffect(() => {
    // Track page view when component mounts
    trackPageView('/');
  }, []);

  const handleWalletConnect = () => {
    // This would be called when wallet connects successfully
    trackWalletConnect('thirdweb', 'example-address');
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "5rem" }}>
      <h1>⚡️ ChaosKey333 Vault</h1>
      
      {/* Placeholder for wallet connection - thirdweb dependency causes build issues */}
      <div style={{ 
        padding: "12px 24px", 
        backgroundColor: "#007bff", 
        color: "white", 
        borderRadius: "8px", 
        cursor: "pointer",
        marginTop: "1rem"
      }}
      onClick={handleWalletConnect}
      >
        Connect Wallet (Demo)
      </div>
      
      {/* Demo telemetry buttons for testing */}
      <div style={{ marginTop: "2rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <button 
          onClick={() => trackPageView('/demo')}
          style={{ padding: "8px 16px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          Track Page View
        </button>
        <button 
          onClick={handleWalletConnect}
          style={{ padding: "8px 16px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          Track Wallet Connect
        </button>
        <button 
          onClick={() => {
            const { trackMintSuccess, trackCheckoutStart, trackCustom } = require("@/lib/telemetry");
            trackMintSuccess("123", "0x123");
            trackCheckoutStart(10000, "usd");
            trackCustom("demo_event", { source: "demo_button" });
          }}
          style={{ padding: "8px 16px", backgroundColor: "#ffc107", color: "black", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          Track Demo Events
        </button>
      </div>
      
      <div style={{ marginTop: "2rem", textAlign: "center" }}>
        <p style={{ fontSize: "14px", color: "#666" }}>
          🔍 <a href="/admin/telemetry" style={{ color: "#007bff", textDecoration: "none" }}>
            View Telemetry Dashboard
          </a>
        </p>
      </div>
    </div>
  );
}