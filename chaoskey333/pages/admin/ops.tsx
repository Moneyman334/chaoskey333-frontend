"use client";

import { useState, useEffect } from 'react';

interface HealthReport {
  timestamp: string;
  status: 'pass' | 'fail' | 'warn';
  component: string;
  details: any;
  duration?: number;
}

interface SystemReport {
  timestamp: string;
  overall_status: 'healthy' | 'degraded' | 'down';
  checks: HealthReport[];
  metadata: {
    version: string;
    environment: string;
    uptime: number;
  };
}

interface TriggerResult {
  component: string;
  status: 'success' | 'error' | 'skipped';
  message: string;
  details?: any;
  duration?: number;
}

export default function OpsConsole() {
  const [adminToken, setAdminToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastReport, setLastReport] = useState<SystemReport | null>(null);
  const [triggerResults, setTriggerResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentReports, setRecentReports] = useState<SystemReport[]>([]);

  // Load admin token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('ops-admin-token');
    if (savedToken) {
      setAdminToken(savedToken);
    }
  }, []);

  // Save admin token to localStorage when it changes
  useEffect(() => {
    if (adminToken) {
      localStorage.setItem('ops-admin-token', adminToken);
    }
  }, [adminToken]);

  const runHealthCheck = async () => {
    if (!adminToken) {
      setError('Admin token is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/webhook-selftest', {
        method: 'GET',
        headers: {
          'X-Admin-Token': adminToken,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setLastReport(data.data);
      } else {
        setError(data.message || 'Health check failed');
      }
    } catch (err) {
      setError('Failed to run health check');
      console.error('Health check error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const runTriggerTest = async () => {
    if (!adminToken) {
      setError('Admin token is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/webhook-selftest/trigger', {
        method: 'POST',
        headers: {
          'X-Admin-Token': adminToken,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setTriggerResults(data.data);
      } else {
        setError(data.message || 'Trigger test failed');
      }
    } catch (err) {
      setError('Failed to run trigger test');
      console.error('Trigger test error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
      case 'success':
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warn':
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100';
      case 'fail':
      case 'error':
      case 'down':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A';
    return `${ms}ms`;
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔧 ChaosKey333 Operations Console
          </h1>
          <p className="text-gray-600 mb-6">
            Monitor system health and run operational tests
          </p>

          {/* Admin Token Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Token
            </label>
            <input
              type="password"
              value={adminToken}
              onChange={(e) => setAdminToken(e.target.value)}
              placeholder="Enter TEMP_ADMIN_TOKEN"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={runHealthCheck}
              disabled={isLoading || !adminToken}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Running...' : '🔍 Run Health Check'}
            </button>
            <button
              onClick={runTriggerTest}
              disabled={isLoading || !adminToken}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Running...' : '🚀 Run Trigger Test'}
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {/* Health Check Results */}
          {lastReport && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">📊 Latest Health Check</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Overall Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lastReport.overall_status)}`}>
                      {lastReport.overall_status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(lastReport.timestamp).toLocaleString()}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div className="bg-white p-3 rounded border">
                    <div className="text-sm font-medium text-gray-500">Version</div>
                    <div className="text-lg">{lastReport.metadata.version}</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="text-sm font-medium text-gray-500">Environment</div>
                    <div className="text-lg">{lastReport.metadata.environment}</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="text-sm font-medium text-gray-500">Uptime</div>
                    <div className="text-lg">{formatUptime(lastReport.metadata.uptime)}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  {lastReport.checks.map((check, index) => (
                    <div key={index} className="bg-white border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{check.component}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(check.status)}`}>
                            {check.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDuration(check.duration)}
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        {check.details.message || JSON.stringify(check.details, null, 2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Trigger Test Results */}
          {triggerResults && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">🚀 Latest Trigger Test</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Overall Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(triggerResults.overall_status)}`}>
                      {triggerResults.overall_status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Duration: {triggerResults.duration_ms}ms
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-white p-3 rounded border">
                    <div className="text-sm font-medium text-gray-500">Total Tests</div>
                    <div className="text-lg">{triggerResults.total_tests}</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="text-sm font-medium text-gray-500">Successful</div>
                    <div className="text-lg text-green-600">{triggerResults.successful}</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="text-sm font-medium text-gray-500">Failed</div>
                    <div className="text-lg text-red-600">{triggerResults.failed}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  {triggerResults.results.map((result: TriggerResult, index: number) => (
                    <div key={index} className="bg-white border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{result.component}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                            {result.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDuration(result.duration)}
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        {result.message}
                      </div>
                      {result.details && (
                        <div className="mt-2 text-xs text-gray-500 bg-gray-100 p-2 rounded">
                          <pre>{JSON.stringify(result.details, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {triggerResults.next_allowed_trigger && (
                  <div className="mt-4 p-3 bg-blue-100 border border-blue-400 rounded">
                    <div className="text-sm text-blue-700">
                      Next trigger allowed at: {new Date(triggerResults.next_allowed_trigger).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}