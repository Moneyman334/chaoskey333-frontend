"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Order {
  id: string;
  walletAddress?: string;
  amount: number;
  currency: string;
  status: string;
  paymentProvider: string;
  paymentId: string;
  claimToken?: string;
  createdAt: number;
  updatedAt: number;
  mintTxHash?: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminKey, setAdminKey] = useState<string>('');
  const [authenticated, setAuthenticated] = useState(false);

  const handleAuthenticate = async () => {
    try {
      const response = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${adminKey}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
        setAuthenticated(true);
        setError(null);
      } else {
        setError('Invalid admin key');
      }
    } catch (error) {
      setError('Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'paid': return '#17a2b8';
      case 'minted': return '#28a745';
      case 'failed': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!authenticated) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        padding: "2rem",
        backgroundColor: "#f8f9fa"
      }}>
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "2rem",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          maxWidth: "400px",
          width: "100%"
        }}>
          <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>🔐 Admin Access</h1>
          
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

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              Admin Secret Key:
            </label>
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: "4px"
              }}
              placeholder="Enter admin secret key"
            />
          </div>

          <button
            onClick={handleAuthenticate}
            disabled={loading || !adminKey}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: (!adminKey || loading) ? "not-allowed" : "pointer",
              opacity: (!adminKey || loading) ? 0.6 : 1
            }}
          >
            {loading ? "Authenticating..." : "Access Admin Panel"}
          </button>

          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <Link href="/" style={{ color: "#0070f3", textDecoration: "none" }}>
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      padding: "2rem",
      backgroundColor: "#f8f9fa"
    }}>
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>📊 Order Management</h1>
        <Link href="/" style={{ color: "#0070f3", textDecoration: "none" }}>
          ← Back to Home
        </Link>
      </div>

      <div style={{
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "2rem",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
      }}>
        <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Recent Orders ({orders.length})</h2>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "8px 16px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            🔄 Refresh
          </button>
        </div>

        {orders.length === 0 ? (
          <div style={{ textAlign: "center", color: "#666", padding: "2rem" }}>
            No orders found
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Order ID</th>
                  <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Status</th>
                  <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Amount</th>
                  <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Provider</th>
                  <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Wallet</th>
                  <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Created</th>
                  <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "12px", fontSize: "0.9rem" }}>
                      {order.id.length > 20 ? `${order.id.slice(0, 20)}...` : order.id}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                        backgroundColor: getStatusColor(order.status),
                        color: "white"
                      }}>
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: "12px" }}>
                      ${order.amount} {order.currency.toUpperCase()}
                    </td>
                    <td style={{ padding: "12px", fontSize: "0.9rem" }}>
                      {order.paymentProvider}
                    </td>
                    <td style={{ padding: "12px", fontSize: "0.9rem" }}>
                      {order.walletAddress ? 
                        `${order.walletAddress.slice(0, 6)}...${order.walletAddress.slice(-4)}` : 
                        '📧 Magic Link'
                      }
                    </td>
                    <td style={{ padding: "12px", fontSize: "0.9rem" }}>
                      {formatDate(order.createdAt)}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        {order.mintTxHash && (
                          <a
                            href={`https://sepolia.etherscan.io/tx/${order.mintTxHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: "4px 8px",
                              backgroundColor: "#17a2b8",
                              color: "white",
                              textDecoration: "none",
                              borderRadius: "4px",
                              fontSize: "0.8rem"
                            }}
                          >
                            📄 Tx
                          </a>
                        )}
                        {order.claimToken && (
                          <button
                            onClick={() => {
                              const link = `${window.location.origin}/claim?token=${order.claimToken}`;
                              navigator.clipboard.writeText(link);
                              alert('Claim link copied!');
                            }}
                            style={{
                              padding: "4px 8px",
                              backgroundColor: "#ffc107",
                              color: "#212529",
                              border: "none",
                              borderRadius: "4px",
                              fontSize: "0.8rem",
                              cursor: "pointer"
                            }}
                          >
                            🔗 Copy
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}