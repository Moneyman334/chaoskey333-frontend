"use client";

import Image from "next/image";

export default function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "5rem" }}>
      <h1>⚡️ ChaosKey333 Vault</h1>
      <p>Cosmic Replay Terminal</p>
      <div style={{ marginTop: "2rem" }}>
        <a 
          href="/omni-map" 
          style={{
            display: "inline-block",
            padding: "12px 24px",
            backgroundColor: "#00FFFF",
            color: "#000",
            textDecoration: "none",
            borderRadius: "6px",
            fontWeight: "bold"
          }}
        >
          🌌 View Omni-Singularity Architecture Map
        </a>
      </div>
    </div>
  );
}