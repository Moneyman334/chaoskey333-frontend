import { Metadata } from 'next';
import { Suspense } from 'react';
import AdminDashboard from '@/components/AdminDashboard';

export const metadata: Metadata = {
  title: 'Admin Dashboard - ChaosKey333 Vault',
  description: 'Admin dashboard for managing orders and claims',
  robots: 'noindex, nofollow',
};

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-white">Loading...</div>}>
        <AdminDashboard />
      </Suspense>
    </div>
  );
}