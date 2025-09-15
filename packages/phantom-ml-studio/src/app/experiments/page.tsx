import type { Metadata } from 'next';
import { Suspense } from 'react';
import ExperimentsClient from './ExperimentsClient';

export const metadata: Metadata = {
  title: 'Experiments | Phantom ML Studio',
  description: 'Track, compare, and manage ML experiments with detailed metrics, versioning, and comprehensive run analysis.',
  keywords: ['ML experiments', 'experiment tracking', 'model versioning', 'ML metrics', 'hyperparameter tuning'],
  openGraph: {
    title: 'Experiments - Phantom ML Studio',
    description: 'Advanced ML experiment tracking and management',
  },
};

export const dynamic = 'force-dynamic';

function ExperimentsSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-4">
      <div className="h-8 bg-gray-200 rounded w-48"></div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="border border-gray-200 rounded-lg">
          <div className="h-12 bg-gray-100 border-b border-gray-200"></div>
          <div className="p-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ExperimentsPage() {
  return (
    <Suspense fallback={<ExperimentsSkeleton />}>
      <ExperimentsClient />
    </Suspense>
  );
}