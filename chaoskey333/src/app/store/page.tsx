"use client";

import { useState } from "react";
import Link from "next/link";
import { useActiveAccount } from "thirdweb/react";
import { ConnectButton } from "thirdweb/react";
import { client } from "../client";

export default function Store() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeAccount = useActiveAccount();

  const handlePurchase = async (paymentProvider: 'coinbase' | 'stripe' = 'coinbase') => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: activeAccount?.address,
          paymentProvider
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to payment URL
        window.location.href = data.paymentUrl;
      } else {
        setError(data.error || 'Failed to create order');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Purchase error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      padding: "2rem",
      backgroundColor: "#f8f9fa"
    }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/" style={{ color: "#0070f3", textDecoration: "none" }}>
          ← Back to Vault
        </Link>
      </div>

      <div style={{
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "2rem",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        maxWidth: "500px",
        width: "100%"
      }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1>🦸 Superman Relic</h1>
          <p style={{ color: "#666", marginBottom: "1rem" }}>
            A legendary relic from the House of El, imbued with the power of Kryptonian heritage.
          </p>
          <div style={{ 
            fontSize: "2rem", 
            fontWeight: "bold", 
            color: "#0070f3",
            marginBottom: "1rem"
          }}>
            $50 USD
          </div>
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ marginBottom: "1rem" }}>Relic Properties:</h3>
          <ul style={{ color: "#666", lineHeight: "1.6" }}>
            <li>🌟 Rarity: Legendary</li>
            <li>🪐 Origin: Krypton</li>
            <li>⚡ Power Level: Divine</li>
            <li>🏛️ Collection: ChaosKey333 Vault</li>
          </ul>
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ marginBottom: "1rem" }}>Wallet Connection:</h3>
          {activeAccount ? (
            <div style={{ 
              padding: "1rem", 
              backgroundColor: "#e7f5e7", 
              borderRadius: "8px",
              marginBottom: "1rem"
            }}>
              ✅ Connected: {activeAccount.address.slice(0, 6)}...{activeAccount.address.slice(-4)}
              <p style={{ fontSize: "0.9rem", color: "#666", margin: "0.5rem 0 0 0" }}>
                Your NFT will be minted directly to this wallet
              </p>
            </div>
          ) : (
            <div style={{ 
              padding: "1rem", 
              backgroundColor: "#fff3cd", 
              borderRadius: "8px",
              marginBottom: "1rem"
            }}>
              ⚠️ No wallet connected
              <p style={{ fontSize: "0.9rem", color: "#666", margin: "0.5rem 0 0 0" }}>
                You can still purchase! We&apos;ll provide a magic link to claim your NFT later.
              </p>
            </div>
          )}
          
          <ConnectButton client={client} />
        </div>

        {error && (
          <div style={{ 
            padding: "1rem", 
            backgroundColor: "#f8d7da", 
            borderRadius: "8px",
            marginBottom: "1rem",
            color: "#721c24"
          }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <button
            onClick={() => handlePurchase('coinbase')}
            disabled={isLoading}
            style={{
              padding: "12px 24px",
              backgroundColor: "#1652f0",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.6 : 1
            }}
          >
            {isLoading ? "Creating Order..." : "🚀 Pay with Coinbase Commerce (Crypto)"}
          </button>

          <button
            onClick={() => handlePurchase('stripe')}
            disabled={isLoading}
            style={{
              padding: "12px 24px",
              backgroundColor: "#635bff",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.6 : 1
            }}
          >
            {isLoading ? "Creating Order..." : "💳 Pay with Card (Stripe)"}
          </button>
        </div>

        <p style={{ 
          fontSize: "0.9rem", 
          color: "#666", 
          textAlign: "center", 
          marginTop: "1rem" 
        }}>
          🔒 Secure payment processing • Test mode enabled
        </p>
      </div>
    </div>
  );
}