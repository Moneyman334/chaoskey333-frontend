"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useActiveAccount } from "thirdweb/react";
import { ConnectButton } from "thirdweb/react";
import { client } from "../client";
import { mintSupermanRelic } from "@/lib/mint";

interface Order {
  id: string;
  status: string;
  amount: number;
  currency: string;
  createdAt: number;
  mintTxHash?: string;
}

export default function Claim() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState<{ success: boolean; txHash?: string; error?: string } | null>(null);
  
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const activeAccount = useActiveAccount();

  const verifyToken = useCallback(async () => {
    try {
      const response = await fetch(`/api/claim?token=${token}`);
      const data = await response.json();
      
      if (data.success) {
        setOrder(data.order);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to verify claim token');
      console.error('Token verification error:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setError('No claim token provided');
      setLoading(false);
    }
  }, [token, verifyToken]);

  const handleClaim = async () => {
    if (!activeAccount || !order || !token) return;

    setClaiming(true);
    setClaimResult(null);

    try {
      // First, mint the NFT
      const mintResult = await mintSupermanRelic(activeAccount, activeAccount.address);
      
      if (mintResult.success && mintResult.txHash) {
        // Then, consume the claim token
        const claimResponse = await fetch('/api/claim', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            walletAddress: activeAccount.address,
            txHash: mintResult.txHash
          }),
        });

        const claimData = await claimResponse.json();
        
        if (claimData.success) {
          // Finally, confirm the mint
          const confirmResponse = await fetch('/api/mint', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId: order.id,
              walletAddress: activeAccount.address,
              txHash: mintResult.txHash
            }),
          });

          const confirmData = await confirmResponse.json();
          
          if (confirmData.success) {
            setClaimResult({ success: true, txHash: mintResult.txHash });
          } else {
            setClaimResult({ success: false, error: confirmData.error });
          }
        } else {
          setClaimResult({ success: false, error: claimData.error });
        }
      } else {
        setClaimResult({ success: false, error: mintResult.error || 'Minting failed' });
      }
    } catch (error) {
      setClaimResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div>Verifying claim token...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h1>❌ Claim Error</h1>
          <p style={{ color: "#666", marginBottom: "2rem" }}>{error}</p>
          <Link href="/store" style={{ color: "#0070f3" }}>
            ← Back to Store
          </Link>
        </div>
      </div>
    );
  }

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
        <Link href="/store" style={{ color: "#0070f3", textDecoration: "none" }}>
          ← Back to Store
        </Link>
      </div>

      <div style={{
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "2rem",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        maxWidth: "600px",
        width: "100%"
      }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1>🎯 Claim Your Superman Relic</h1>
          <p style={{ color: "#666" }}>
            Your purchase is ready to be claimed!
          </p>
        </div>

        {order && (
          <div style={{ 
            padding: "1rem", 
            backgroundColor: "#e7f5e7", 
            borderRadius: "8px",
            marginBottom: "2rem"
          }}>
            <h3>Order Details:</h3>
            <p>Order ID: {order.id}</p>
            <p>Product: Superman Relic</p>
            <p>Amount: ${order.amount} {order.currency.toUpperCase()}</p>
            <p>Status: {order.status}</p>
            <p>Created: {new Date(order.createdAt).toLocaleString()}</p>
          </div>
        )}

        {order?.status === 'paid' && (
          <>
            {activeAccount ? (
              <div style={{ marginBottom: "2rem" }}>
                <div style={{ 
                  padding: "1rem", 
                  backgroundColor: "#e7f5e7", 
                  borderRadius: "8px",
                  marginBottom: "1rem"
                }}>
                  ✅ Wallet Connected: {activeAccount.address.slice(0, 6)}...{activeAccount.address.slice(-4)}
                </div>
                
                {claimResult?.success ? (
                  <div style={{ 
                    padding: "1rem", 
                    backgroundColor: "#e7f5e7", 
                    borderRadius: "8px",
                    marginBottom: "1rem",
                    textAlign: "center"
                  }}>
                    ✅ Superman Relic Claimed Successfully!
                    <br />
                    <a 
                      href={`https://sepolia.etherscan.io/tx/${claimResult.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#0070f3" }}
                    >
                      View on Etherscan
                    </a>
                  </div>
                ) : claimResult?.error ? (
                  <div style={{ 
                    padding: "1rem", 
                    backgroundColor: "#f8d7da", 
                    borderRadius: "8px",
                    marginBottom: "1rem",
                    color: "#721c24"
                  }}>
                    ❌ {claimResult.error}
                  </div>
                ) : null}

                <button
                  onClick={handleClaim}
                  disabled={claiming || claimResult?.success}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: claimResult?.success ? "#28a745" : "#0070f3",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    cursor: (claiming || claimResult?.success) ? "not-allowed" : "pointer",
                    opacity: (claiming || claimResult?.success) ? 0.6 : 1,
                    width: "100%"
                  }}
                >
                  {claiming ? "🔄 Claiming..." : claimResult?.success ? "✅ Claimed!" : "🚀 Claim Superman Relic"}
                </button>
              </div>
            ) : (
              <div style={{ marginBottom: "2rem" }}>
                <div style={{ 
                  padding: "1rem", 
                  backgroundColor: "#fff3cd", 
                  borderRadius: "8px",
                  marginBottom: "1rem"
                }}>
                  ⚠️ Please connect your wallet to claim your Superman Relic
                </div>
                
                <ConnectButton client={client} />
              </div>
            )}
          </>
        )}

        {order?.status === 'minted' && (
          <div style={{ 
            padding: "1rem", 
            backgroundColor: "#e7f5e7", 
            borderRadius: "8px",
            textAlign: "center"
          }}>
            ✅ This Superman Relic has already been claimed!
            {order.mintTxHash && (
              <>
                <br />
                <a 
                  href={`https://sepolia.etherscan.io/tx/${order.mintTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#0070f3" }}
                >
                  View on Etherscan
                </a>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}