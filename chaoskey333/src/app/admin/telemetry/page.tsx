'use client';

import { useState, useEffect } from 'react';
import { TelemetryRollup, TelemetryManualRollupResponse } from '@/types/telemetry';

interface DashboardData {
  rollups: TelemetryRollup[];
  loading: boolean;
  error: string | null;
}

export default function TelemetryAdminPage() {
  const [adminToken, setAdminToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    rollups: [],
    loading: false,
    error: null,
  });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Initialize dates to last 7 days
  useEffect(() => {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 6);
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(lastWeek.toISOString().split('T')[0]);
  }, []);

  const authenticate = async () => {
    if (!adminToken.trim()) {
      alert('Please enter an admin token');
      return;
    }

    try {
      const response = await fetch('/api/telemetry/manual-rollup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ startDate, endDate }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        await loadDashboardData();
      } else {
        alert('Invalid admin token');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      alert('Authentication failed');
    }
  };

  const loadDashboardData = async () => {
    if (!startDate || !endDate) return;

    setDashboardData(prev => ({ ...prev, loading: true, error: null }));

    try {
      const dates = getDateRange(startDate, endDate);
      const rollups: TelemetryRollup[] = [];

      for (const date of dates) {
        const response = await fetch(`/api/telemetry/rollup?date=${date}`);
        if (response.ok) {
          const data = await response.json();
          if (data.rollup) {
            rollups.push(data.rollup);
          }
        }
      }

      setDashboardData({
        rollups,
        loading: false,
        error: null,
      });
    } catch (error) {
      setDashboardData({
        rollups: [],
        loading: false,
        error: 'Failed to load dashboard data',
      });
    }
  };

  const refreshRollups = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/telemetry/manual-rollup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ startDate, endDate, saveSnapshot: false }),
      });

      if (response.ok) {
        await loadDashboardData();
      } else {
        alert('Failed to refresh rollups');
      }
    } catch (error) {
      console.error('Refresh error:', error);
      alert('Failed to refresh rollups');
    } finally {
      setRefreshing(false);
    }
  };

  const saveSnapshot = async () => {
    try {
      const response = await fetch('/api/telemetry/manual-rollup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ startDate, endDate, saveSnapshot: true }),
      });

      if (response.ok) {
        const data: TelemetryManualRollupResponse = await response.json();
        alert(`Snapshot saved successfully! ${data.message}`);
      } else {
        alert('Failed to save snapshot');
      }
    } catch (error) {
      console.error('Snapshot error:', error);
      alert('Failed to save snapshot');
    }
  };

  const getDateRange = (start: string, end: string): string[] => {
    const dates: string[] = [];
    const current = new Date(start);
    const endDate = new Date(end);

    while (current <= endDate) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  const getTotalEvents = () => {
    return dashboardData.rollups.reduce((sum, rollup) => sum + rollup.totalEvents, 0);
  };

  const getEventTypeCounts = () => {
    const counts: Record<string, number> = {};
    dashboardData.rollups.forEach(rollup => {
      Object.entries(rollup.events).forEach(([type, count]) => {
        counts[type] = (counts[type] || 0) + count;
      });
    });
    return counts;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Telemetry Admin</h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Token
              </label>
              <input
                type="password"
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter admin token"
                onKeyPress={(e) => e.key === 'Enter' && authenticate()}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              onClick={authenticate}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Access Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Telemetry Dashboard</h1>
              <button
                onClick={() => setIsAuthenticated(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Controls</h2>
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 items-end">
              <button
                onClick={loadDashboardData}
                disabled={dashboardData.loading}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Load Data
              </button>
              <button
                onClick={refreshRollups}
                disabled={refreshing}
                className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {refreshing ? 'Refreshing...' : 'Refresh Rollups'}
              </button>
              <button
                onClick={saveSnapshot}
                className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700"
              >
                Save Snapshot
              </button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Total Events</h3>
            <p className="text-3xl font-bold text-blue-600">{getTotalEvents().toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Days with Data</h3>
            <p className="text-3xl font-bold text-green-600">{dashboardData.rollups.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Avg Events/Day</h3>
            <p className="text-3xl font-bold text-orange-600">
              {dashboardData.rollups.length > 0 
                ? Math.round(getTotalEvents() / dashboardData.rollups.length).toLocaleString()
                : '0'
              }
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Event Types</h3>
            <p className="text-3xl font-bold text-purple-600">
              {Object.keys(getEventTypeCounts()).length}
            </p>
          </div>
        </div>

        {/* Event Type Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Event Type Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(getEventTypeCounts()).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-gray-700 capitalize">{type.replace('_', ' ')}</span>
                  <span className="font-semibold text-gray-900">{count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Daily Events Chart</h3>
            <div className="space-y-2">
              {dashboardData.rollups.map((rollup, index) => (
                <div key={rollup.date} className="flex items-center">
                  <span className="text-sm text-gray-600 w-24">{rollup.date}</span>
                  <div className="flex-1 ml-4">
                    <div className="bg-gray-200 rounded-full h-6 relative">
                      <div
                        className="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2"
                        style={{
                          width: `${Math.max(5, (rollup.totalEvents / Math.max(...dashboardData.rollups.map(r => r.totalEvents))) * 100)}%`
                        }}
                      >
                        <span className="text-white text-xs font-medium">
                          {rollup.totalEvents}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Data Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold">Daily Rollup Details</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Events
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Page Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mint Success
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Checkout Start
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wallet Connect
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Custom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.rollups.map((rollup) => (
                  <tr key={rollup.date}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {rollup.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rollup.totalEvents.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(rollup.events.page_view || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(rollup.events.mint_success || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(rollup.events.checkout_start || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(rollup.events.wallet_connect || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(rollup.events.custom || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(rollup.lastUpdated).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {dashboardData.error && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-800">{dashboardData.error}</div>
          </div>
        )}

        {dashboardData.loading && (
          <div className="mt-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading telemetry data...</p>
          </div>
        )}
      </div>
    </div>
  );
}