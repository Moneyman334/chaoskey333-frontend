"use client";

import Image from "next/image";
import Link from "next/link";
import { ConnectButton } from "thirdweb/react";
import { client } from "./client";

export default function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "5rem" }}>
      <h1>⚡️ ChaosKey333 Vault</h1>
      <ConnectButton client={client} />
      
      <div style={{ marginTop: "2rem", textAlign: "center" }}>
        <h2>🌌 Omni-Singularity Linkage Protocol</h2>
        <p style={{ color: "#888", marginBottom: "1rem" }}>
          Access the admin interface to manage Cosmic Replay Terminal events and Relic Evolution.
        </p>
        <Link 
          href="/admin/linkage"
          style={{
            display: "inline-block",
            padding: "12px 24px",
            background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 8px 25px rgba(99, 102, 241, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          🔮 Enter Admin Linkage Interface
        </Link>
        
        <div style={{ 
          marginTop: "2rem", 
          padding: "1rem", 
          background: "#1a1a1a", 
          borderRadius: "8px",
          maxWidth: "600px",
          margin: "2rem auto",
          textAlign: "left"
        }}>
          <h3 style={{ color: "#f1f5f9", marginBottom: "1rem" }}>🔧 Protocol Features:</h3>
          <ul style={{ color: "#94a3b8", lineHeight: "1.6" }}>
            <li>• <strong>Linkage Engine:</strong> Automatic event binding</li>
            <li>• <strong>Dry-Run Mode:</strong> Preview changes before commit</li>
            <li>• <strong>Seed Visualizer:</strong> Audio, visual, and glyph preview</li>
            <li>• <strong>Safety Rails:</strong> Versioned artifacts with rollback</li>
            <li>• <strong>Webhooks:</strong> Real-time synchronization</li>
          </ul>
        </div>
      </div>
    </div>
  );
}