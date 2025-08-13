'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { IgnitionEvent, IgnitionListResponse, STEP_CONFIG } from '@/types/ignition';

export default function ReplayPage() {
  const [ignitions, setIgnitions] = useState<IgnitionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const pageSize = 10;

  const loadIgnitions = async (page = 1, date = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      
      if (date) {
        params.set('date', date);
      }
      
      const response = await fetch(`/api/ignitions?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch ignitions');
      }
      
      const data: IgnitionListResponse = await response.json();
      setIgnitions(data.ignitions);
      setCurrentPage(data.page);
      setTotalPages(Math.ceil(data.total / data.pageSize));
    } catch (error) {
      console.error('Error loading ignitions:', error);
      setError('Failed to load ignition events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIgnitions();
  }, []);

  const handleDateFilter = (date: string) => {
    setSelectedDate(date);
    setCurrentPage(1);
    loadIgnitions(1, date);
  };

  const handlePageChange = (page: number) => {
    loadIgnitions(page, selectedDate);
  };

  const filteredIgnitions = ignitions.filter(ignition => {
    if (!searchTerm) return true;
    return (
      ignition.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ignition.metadata?.triggeredBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ignition.sequence.some(step => step.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const formatDuration = (duration?: number) => {
    if (!duration) return 'Unknown';
    return `${(duration / 1000).toFixed(1)}s`;
  };

  const getSequenceDisplay = (sequence: string[]) => {
    return sequence.map(step => STEP_CONFIG[step as keyof typeof STEP_CONFIG]?.emoji || '❓').join(' ');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">📼 Replay Terminal</h1>
              <div className="flex gap-4">
                <Link 
                  href="/ignite" 
                  className="text-orange-400 hover:text-orange-300 underline"
                >
                  🔥 Ignition Control
                </Link>
                <Link 
                  href="/" 
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  🏠 Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">🔍 Filters</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date Filter
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by ID, user, or sequence..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedDate('');
                  setSearchTerm('');
                  loadIgnitions(1, '');
                }}
                className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-300">Total Ignitions</h3>
            <p className="text-3xl font-bold text-orange-400">{filteredIgnitions.length}</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-300">Today&apos;s Ignitions</h3>
            <p className="text-3xl font-bold text-blue-400">
              {filteredIgnitions.filter(i => 
                new Date(i.timestamp).toDateString() === new Date().toDateString()
              ).length}
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-300">Avg Duration</h3>
            <p className="text-3xl font-bold text-green-400">
              {filteredIgnitions.length > 0 
                ? formatDuration(
                    filteredIgnitions.reduce((sum, i) => sum + (i.metadata?.duration || 0), 0) / filteredIgnitions.length
                  )
                : '0s'
              }
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-300">Last 24h</h3>
            <p className="text-3xl font-bold text-purple-400">
              {filteredIgnitions.filter(i => 
                Date.now() - i.timestamp < 24 * 60 * 60 * 1000
              ).length}
            </p>
          </div>
        </div>

        {/* Ignitions List */}
        <div className="bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold">🎬 Ignition Events</h2>
          </div>
          
          {loading && (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
              <p className="mt-2 text-gray-400">Loading ignition events...</p>
            </div>
          )}
          
          {error && (
            <div className="p-6 bg-red-900 border border-red-700 rounded-md m-6">
              <div className="text-red-200">{error}</div>
            </div>
          )}
          
          {!loading && !error && filteredIgnitions.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              <div className="text-6xl mb-4">🌌</div>
              <p>No ignition events found.</p>
              <p className="text-sm mt-2">
                Try <Link href="/ignite" className="text-orange-400 underline">triggering an ignition</Link> first.
              </p>
            </div>
          )}
          
          {!loading && !error && filteredIgnitions.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Sequence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Triggered By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {filteredIgnitions.map((ignition) => (
                    <tr key={ignition.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-400">
                        {ignition.id.split('-').slice(-1)[0]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(ignition.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-1">
                          <span className="text-2xl">{getSequenceDisplay(ignition.sequence)}</span>
                          <span className="text-gray-400 text-xs ml-2">
                            ({ignition.sequence.length} steps)
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDuration(ignition.metadata?.duration)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {ignition.metadata?.triggeredBy || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/replay/${ignition.id}`}
                          className="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                        >
                          🎬 Replay
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-3 border-t border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-gray-600 text-white py-1 px-3 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="bg-gray-600 text-white py-1 px-3 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}