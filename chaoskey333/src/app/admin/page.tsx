'use client';

import { useState } from 'react';
import { ReplayDashboard } from '@/components/ReplayDashboard';

export default function AdminPage() {
  const [adminToken, setAdminToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple token check - in production, this would be more secure
    if (adminToken.length > 0) {
      setIsAuthenticated(true);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center">
        <div className="border border-green-400 p-8 rounded-lg bg-black/80">
          <h1 className="text-2xl mb-6 text-center">⚡ Cosmic Replay Terminal v2.0</h1>
          <h2 className="text-lg mb-4 text-center">Admin Access Required</h2>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="token" className="block text-sm mb-2">
                Admin Token:
              </label>
              <input
                type="password"
                id="token"
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
                className="w-full p-3 bg-black border border-green-400 rounded text-green-400 focus:outline-none focus:border-green-300"
                placeholder="Enter admin token..."
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full p-3 bg-green-400 text-black rounded hover:bg-green-300 transition-colors font-bold"
            >
              ACCESS TERMINAL
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <ReplayDashboard adminToken={adminToken} />;
}