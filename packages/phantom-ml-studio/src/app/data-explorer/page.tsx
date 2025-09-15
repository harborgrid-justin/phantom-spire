import type { Metadata } from 'next';
import { Suspense } from 'react';
import DataExplorerClient from './DataExplorerClient';

export const metadata: Metadata = {
  title: 'Data Explorer | Phantom ML Studio',
  description: 'Comprehensive data analysis, visualization, and preprocessing capabilities for machine learning datasets.',
  keywords: ['data analysis', 'data visualization', 'data preprocessing', 'dataset exploration', 'statistics'],
  openGraph: {
    title: 'Data Explorer - Phantom ML Studio',
    description: 'Explore and analyze your datasets before training',
  },
};

export const dynamic = 'force-dynamic';

function DataExplorerSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-48"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>

      <div className="h-12 bg-gray-200 rounded mb-4"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-80 bg-gray-200 rounded-lg"></div>
        <div className="h-80 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
}

export default function DataExplorerPage() {
  return (
    <Suspense fallback={<DataExplorerSkeleton />}>
      <DataExplorerClient />
    </Suspense>
  );
}