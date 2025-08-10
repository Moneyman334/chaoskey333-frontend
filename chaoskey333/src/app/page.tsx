"use client";

import { ConnectButton } from "thirdweb/react";
import { client } from "./client";
import Link from "next/link";

export default function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "5rem" }}>
      <h1>⚡️ ChaosKey333 Vault</h1>
      <ConnectButton client={client} />
      
      <div style={{ marginTop: "3rem", textAlign: "center" }}>
        <h2 style={{ marginBottom: "1rem" }}>Multi-Provider Checkout System</h2>
        <p style={{ marginBottom: "2rem", color: "#666" }}>
          Experience seamless payments with Stripe, Coinbase Commerce, and PayPal
        </p>
        
        <Link 
          href="/store"
          style={{
            display: "inline-block",
            padding: "12px 24px",
            backgroundColor: "#0070f3",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: "500",
            transition: "background-color 0.2s"
          }}
        >
          Visit Store →
        </Link>
      </div>
    </div>
  );
}