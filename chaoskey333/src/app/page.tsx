"use client";

import { useEffect, useState } from "react";
import { trackPageView, trackWalletConnect } from "@/lib/telemetry";
import { usePremiereFlag } from "@/lib/usePremiereFlag";

export default function Home() {
  const { status, isLoading, error } = usePremiereFlag();
  const [relics, setRelics] = useState<any[]>([]);

  useEffect(() => {
    // Track page view when component mounts
    trackPageView('/');
    
    // Fetch relics data
    fetchRelics();
  }, []);

  const fetchRelics = async () => {
    try {
      const response = await fetch('/api/nft-update');
      const data = await response.json();
      if (data.success) {
        setRelics(data.relics || []);
      }
    } catch (err) {
      console.error('Failed to fetch relics:', err);
    }
  };

  const handleWalletConnect = () => {
    // This would be called when wallet connects successfully
    trackWalletConnect('thirdweb', 'example-address');
  };

  const formatEvolutionState = (state: string) => {
    return state.charAt(0).toUpperCase() + state.slice(1);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "5rem", padding: "0 1rem" }}>
      <h1>⚡️ ChaosKey333 Vault</h1>
      
      {/* Premiere Status Display */}
      <div style={{ 
        margin: "2rem 0", 
        padding: "1rem", 
        border: "1px solid #333", 
        borderRadius: "8px", 
        backgroundColor: "#1a1a1a", 
        color: "white",
        minWidth: "300px",
        textAlign: "center"
      }}>
        <h3>Vault Status</h3>
        {isLoading ? (
          <p>Loading...</p>
        ) : status ? (
          <div>
            <p><strong>Phase:</strong> {status.phase}</p>
            <p><strong>Active:</strong> {status.active ? 'Yes' : 'No'}</p>
            <p><strong>Message:</strong> {status.message}</p>
            {status.countdown && (
              <p><strong>Countdown:</strong> {Math.ceil(status.countdown / 1000)}s</p>
            )}
          </div>
        ) : (
          <p>Unable to load status</p>
        )}
        {error && <p style={{ color: '#ff6b6b' }}>Error: {error}</p>}
      </div>

      {/* Relics Display */}
      <div style={{ margin: "2rem 0", width: "100%", maxWidth: "800px" }}>
        <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>Vault Relics</h3>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
          gap: "1rem" 
        }}>
          {relics.map((relic) => (
            <div key={relic.id} style={{
              border: "1px solid #333",
              borderRadius: "8px",
              padding: "1rem",
              backgroundColor: "#1a1a1a",
              color: "white"
            }}>
              <h4>{relic.metadata.name}</h4>
              <p style={{ fontSize: "0.9em", color: "#ccc" }}>{relic.metadata.description}</p>
              <div style={{ marginTop: "0.5rem" }}>
                <strong>Evolution State:</strong> 
                <span style={{ 
                  marginLeft: "0.5rem",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  backgroundColor: relic.evolutionState === 'evolved' ? '#4ade80' : 
                                   relic.evolutionState === 'awakening' ? '#fbbf24' : '#6b7280',
                  color: "white",
                  fontSize: "0.8em"
                }}>
                  {formatEvolutionState(relic.evolutionState)}
                </span>
              </div>
              {relic.glyphHalo && (
                <div style={{ marginTop: "0.5rem", fontSize: "0.8em" }}>
                  <strong>Glyph Halo:</strong> {relic.glyphHalo.pattern} ({relic.glyphHalo.color})
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
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
        <button 
          onClick={fetchRelics}
          style={{ padding: "8px 16px", backgroundColor: "#9d4edd", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          Refresh Relics
        </button>
      </div>
      
      <div style={{ marginTop: "2rem", textAlign: "center" }}>
        <p style={{ fontSize: "14px", color: "#666" }}>
          🔍 <a href="/admin/telemetry" style={{ color: "#007bff", textDecoration: "none" }}>
            View Telemetry Dashboard
          </a>
        </p>
        <p style={{ fontSize: "12px", color: "#999", marginTop: "1rem" }}>
          Admin controls are available in the bottom-right corner.<br/>
          Premiere will auto-trigger when PR #24 is merged into main branch.
        </p>
      </div>
    </div>
  );
}