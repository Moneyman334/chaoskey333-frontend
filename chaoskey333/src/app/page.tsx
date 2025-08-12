"use client";

import Image from "next/image";
import Link from "next/link";
import { ConnectButton } from "thirdweb/react";
import { client } from "./client";

export default function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "5rem" }}>
      <h1>⚡️ ChaosKey333 Vault</h1>
      <p style={{ textAlign: "center", marginBottom: "2rem", color: "#666" }}>
        Discover legendary relics and mint them to your wallet
      </p>
      
      <ConnectButton client={client} />
      
      <div style={{ marginTop: "3rem", display: "flex", gap: "1rem" }}>
        <Link 
          href="/store" 
          style={{
            padding: "12px 24px",
            backgroundColor: "#0070f3",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: "bold"
          }}
        >
          🦸 Buy Superman Relic
        </Link>
      </div>
    </div>
  );
}