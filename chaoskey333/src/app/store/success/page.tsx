"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useActiveAccount } from "thirdweb/react";
import { ConnectButton } from "thirdweb/react";
import { client } from "../../client";
import { mintSupermanRelic } from "@/lib/mint";

interface Order {
  id: string;
  status: string;
  amount: number;
  currency: string;
  createdAt: number;
  mintTxHash?: string;
}

export default function Success() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [minting, setMinting] = useState(false);
  const [mintResult, setMintResult] = useState<{ success: boolean; txHash?: string; error?: string } | null>(null);
  const [claimToken, setClaimToken] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const sessionId = searchParams.get('session_id');
  
  const activeAccount = useActiveAccount();

  const fetchOrderStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();
      
      if (data.success) {
        setOrder(data.order);
        setClaimToken(data.order.claimToken);
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      fetchOrderStatus();
    }
  }, [orderId, fetchOrderStatus]);

  const handleMintNow = async () => {
    if (!activeAccount || !order) return;

    setMinting(true);
    setMintResult(null);

    try {
      // Mint the NFT using client wallet
      const result = await mintSupermanRelic(activeAccount, activeAccount.address);
      
      if (result.success && result.txHash) {
        // Confirm mint on server
        const confirmResponse = await fetch('/api/mint', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: order.id,
            walletAddress: activeAccount.address,
            txHash: result.txHash
          }),
        });

        const confirmData = await confirmResponse.json();
        
        if (confirmData.success) {
          setMintResult({ success: true, txHash: result.txHash });
          // Refresh order status
          await fetchOrderStatus();
        } else {
          setMintResult({ success: false, error: confirmData.error });
        }
      } else {
        setMintResult({ success: false, error: result.error || 'Minting failed' });
      }
    } catch (error) {
      setMintResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setMinting(false);
    }
  };

  const generateMagicLink = () => {
    if (!claimToken) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/claim?token=${claimToken}`;
  };

  const copyMagicLink = () => {
    const link = generateMagicLink();
    navigator.clipboard.writeText(link);
    alert('Magic link copied to clipboard!');
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div>Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h1>Order Not Found</h1>
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
          <h1>🎉 Payment Successful!</h1>
          <p style={{ color: "#666" }}>
            Your Superman Relic purchase has been confirmed.
          </p>
        </div>

        <div style={{ 
          padding: "1rem", 
          backgroundColor: "#e7f5e7", 
          borderRadius: "8px",
          marginBottom: "2rem"
        }}>
          <h3>Order Details:</h3>
          <p>Order ID: {order.id}</p>
          <p>Amount: ${order.amount} {order.currency.toUpperCase()}</p>
          <p>Status: {order.status}</p>
          {order.mintTxHash && (
            <p>
              Mint Transaction: 
              <a 
                href={`https://sepolia.etherscan.io/tx/${order.mintTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#0070f3", marginLeft: "0.5rem" }}
              >
                {order.mintTxHash.slice(0, 10)}...
              </a>
            </p>
          )}
        </div>

        {order.status === 'paid' && (
          <>
            {activeAccount ? (
              <div style={{ marginBottom: "2rem" }}>
                <h3>🎯 Mint Your NFT Now</h3>
                <p style={{ color: "#666", marginBottom: "1rem" }}>
                  Connected wallet: {activeAccount.address.slice(0, 6)}...{activeAccount.address.slice(-4)}
                </p>
                
                {mintResult?.success ? (
                  <div style={{ 
                    padding: "1rem", 
                    backgroundColor: "#e7f5e7", 
                    borderRadius: "8px",
                    marginBottom: "1rem"
                  }}>
                    ✅ NFT Minted Successfully!
                    <br />
                    <a 
                      href={`https://sepolia.etherscan.io/tx/${mintResult.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#0070f3" }}
                    >
                      View on Etherscan
                    </a>
                  </div>
                ) : mintResult?.error ? (
                  <div style={{ 
                    padding: "1rem", 
                    backgroundColor: "#f8d7da", 
                    borderRadius: "8px",
                    marginBottom: "1rem",
                    color: "#721c24"
                  }}>
                    ❌ {mintResult.error}
                  </div>
                ) : null}

                <button
                  onClick={handleMintNow}
                  disabled={minting || mintResult?.success}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: mintResult?.success ? "#28a745" : "#0070f3",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    cursor: (minting || mintResult?.success) ? "not-allowed" : "pointer",
                    opacity: (minting || mintResult?.success) ? 0.6 : 1,
                    width: "100%"
                  }}
                >
                  {minting ? "🔄 Minting..." : mintResult?.success ? "✅ Minted!" : "🚀 Mint Now"}
                </button>
              </div>
            ) : (
              <div style={{ marginBottom: "2rem" }}>
                <h3>🔗 Magic Link for Later</h3>
                <p style={{ color: "#666", marginBottom: "1rem" }}>
                  No wallet connected. Use this magic link to claim your NFT later:
                </p>
                
                <div style={{ 
                  padding: "1rem", 
                  backgroundColor: "#fff3cd", 
                  borderRadius: "8px",
                  marginBottom: "1rem"
                }}>
                  <div style={{ 
                    wordBreak: "break-all", 
                    fontSize: "0.9rem",
                    marginBottom: "1rem"
                  }}>
                    {generateMagicLink()}
                  </div>
                  
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <button
                      onClick={copyMagicLink}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#ffc107",
                        color: "#212529",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                    >
                      📋 Copy Link
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: "1rem" }}>
                  <ConnectButton client={client} />
                </div>
              </div>
            )}
          </>
        )}

        {order.status === 'minted' && (
          <div style={{ 
            padding: "1rem", 
            backgroundColor: "#e7f5e7", 
            borderRadius: "8px",
            textAlign: "center"
          }}>
            ✅ Your Superman Relic has been minted!
            <br />
            <a 
              href={`https://sepolia.etherscan.io/tx/${order.mintTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#0070f3" }}
            >
              View on Etherscan
            </a>
          </div>
        )}
      </div>
    </div>
  );
}