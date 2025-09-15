import type { Metadata } from 'next';
import { Suspense } from 'react';
import DashboardClient from './DashboardClient';

export const metadata: Metadata = {
  title: 'Dashboard | Phantom ML Studio',
  description: 'Real-time monitoring and analytics dashboard for ML models, experiments, and system performance.',
  keywords: ['ML dashboard', 'analytics', 'monitoring', 'machine learning metrics'],
  openGraph: {
    title: 'ML Dashboard - Phantom ML Studio',
    description: 'Real-time ML analytics and monitoring',
  },
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded mb-4 w-48"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-gray-200 rounded-lg h-96"></div>
        <div className="bg-gray-200 rounded-lg h-96"></div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardClient />
    </Suspense>
  );
}

// This will be the new DashboardClient component (separate file)
// We'll create this as a client component to handle the interactive parts