'use client';

import { useState, useEffect } from 'react';

interface AuditEntry {
  action: string;
  relicId: string;
  rollupCount?: number;
  mutationSeed?: string;
  timestamp: number;
  broadcastId?: string;
  isDryRun?: boolean;
  success?: boolean;
  error?: string;
}

interface EvolutionAuditTableProps {
  relicId?: string;
}

export function EvolutionAuditTable({ relicId }: EvolutionAuditTableProps) {
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAuditEntries();
  }, [relicId]);

  const fetchAuditEntries = async () => {
    try {
      setLoading(true);
      const url = relicId 
        ? `/api/admin/evolution-audit?relicId=${relicId}`
        : '/api/admin/evolution-audit';
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch audit entries');
      }
      
      const data = await response.json();
      setAuditEntries(data.entries || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'queued':
        return 'bg-blue-100 text-blue-800';
      case 'mutation_applied':
        return 'bg-green-100 text-green-800';
      case 'dry_run_mutation':
        return 'bg-yellow-100 text-yellow-800';
      case 'mutation_failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">Error loading audit entries: {error}</div>
        <button 
          onClick={fetchAuditEntries}
          className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Timestamp
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Relic ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Details
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Mutation Seed
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {auditEntries.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                No audit entries found
              </td>
            </tr>
          ) : (
            auditEntries.map((entry, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatTimestamp(entry.timestamp)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                  {entry.relicId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionBadgeColor(entry.action)}`}>
                    {entry.action.replace('_', ' ')}
                    {entry.isDryRun && ' (dry)'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {entry.rollupCount && (
                    <div>Rollups: {entry.rollupCount}</div>
                  )}
                  {entry.broadcastId && (
                    <div className="text-xs text-gray-500">
                      Broadcast: {entry.broadcastId.substring(0, 8)}...
                    </div>
                  )}
                  {entry.error && (
                    <div className="text-red-600 text-xs">
                      Error: {entry.error}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                  {entry.mutationSeed && (
                    <span title={entry.mutationSeed}>
                      {entry.mutationSeed.substring(0, 8)}...
                    </span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}