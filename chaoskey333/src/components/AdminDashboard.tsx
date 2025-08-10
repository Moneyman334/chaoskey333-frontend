'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface Order {
  id: string;
  amount: string;
  currency: string;
  status: string;
  paymentProvider: string;
  createdAt: string;
  completedAt?: string;
}

interface Claim {
  id: string;
  orderId: string;
  status: string;
  createdAt: string;
  consumedAt?: string;
}

export default function AdminDashboard() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'claims'>('orders');

  useEffect(() => {
    // Check admin token
    const adminToken = process.env.NEXT_PUBLIC_TEMP_ADMIN_TOKEN || 'dev_admin_token_123';
    
    if (token === adminToken) {
      setIsAuthenticated(true);
      loadData();
    } else {
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, [token]);

  const loadData = async () => {
    try {
      // Load mock data for demonstration
      // In production, these would be real API calls
      const mockOrders: Order[] = [
        {
          id: 'ord_123',
          amount: '99',
          currency: 'USD',
          status: 'completed',
          paymentProvider: 'coinbase',
          createdAt: '2024-01-15T10:30:00Z',
          completedAt: '2024-01-15T10:35:00Z'
        },
        {
          id: 'ord_124',
          amount: '199',
          currency: 'USD',
          status: 'pending',
          paymentProvider: 'paypal',
          createdAt: '2024-01-15T11:00:00Z'
        }
      ];

      const mockClaims: Claim[] = [
        {
          id: 'clm_123',
          orderId: 'ord_123',
          status: 'active',
          createdAt: '2024-01-15T10:35:00Z'
        }
      ];

      setOrders(mockOrders);
      setClaims(mockClaims);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">
            Invalid or missing admin token. Please check your URL and try again.
          </p>
          <div className="bg-gray-800 rounded-lg p-4 text-left">
            <p className="text-sm text-gray-300">
              Expected format: <br />
              <code className="text-blue-400">/admin/kv?token=YOUR_ADMIN_TOKEN</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-xl">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🛠️ Admin Dashboard
          </h1>
          <p className="text-gray-400">
            Manage orders and claims for ChaosKey333 Vault Store
          </p>
        </header>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'orders'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('claims')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'claims'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Claims ({claims.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'orders' && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">Orders</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Provider
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-white">
                        {order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        ${order.amount} {order.currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {order.paymentProvider}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(order.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'claims' && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">Claims</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Claim ID
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Consumed
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {claims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-white">
                        {claim.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-300">
                        {claim.orderId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          claim.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {claim.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(claim.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {claim.consumedAt ? new Date(claim.consumedAt).toLocaleString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Total Orders</h3>
            <p className="text-3xl font-bold text-blue-400">{orders.length}</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Completed Orders</h3>
            <p className="text-3xl font-bold text-green-400">
              {orders.filter(o => o.status === 'completed').length}
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Active Claims</h3>
            <p className="text-3xl font-bold text-yellow-400">
              {claims.filter(c => c.status === 'active').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}