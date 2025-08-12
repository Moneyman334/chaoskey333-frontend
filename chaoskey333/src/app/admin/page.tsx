'use client';

import { EvolutionAuditTable } from '@/components/EvolutionAuditTable';
import { EvolutionBadge } from '@/components/EvolutionBadge';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ChaosKey333 Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Monitor and manage relic evolution and replay rollup processing
          </p>
          <div className="mt-4">
            <EvolutionBadge />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                System Status
              </h3>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Auto-Evolution</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {process.env.NEXT_PUBLIC_EVOLUTION_AUTO_FEED === 'true' ? 
                      <span className="text-green-600">Enabled</span> : 
                      <span className="text-red-600">Disabled</span>
                    }
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Dry Run Mode</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {process.env.NEXT_PUBLIC_EVOLUTION_DRY_RUN === 'true' ? 
                      <span className="text-yellow-600">Active</span> : 
                      <span className="text-gray-600">Inactive</span>
                    }
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Min Signals</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {process.env.NEXT_PUBLIC_EVOLUTION_MIN_SIGNALS || '3'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Evolution Audit Trail
            </h3>
            <EvolutionAuditTable />
          </div>
        </div>
      </div>
    </div>
  );
}