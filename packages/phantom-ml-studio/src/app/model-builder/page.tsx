import type { Metadata } from 'next';
import { Suspense } from 'react';
import ModelBuilderClient from './ModelBuilderClient';

export const metadata: Metadata = {
  title: 'Model Builder | Phantom ML Studio',
  description: 'AutoML-powered model creation with advanced feature engineering, hyperparameter tuning, and algorithm selection.',
  keywords: ['AutoML', 'model building', 'machine learning', 'feature engineering', 'hyperparameter tuning'],
  openGraph: {
    title: 'Model Builder - Phantom ML Studio',
    description: 'Build ML models with advanced AutoML capabilities',
  },
};

export const dynamic = 'force-dynamic';

function ModelBuilderSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-4">
      <div className="h-8 bg-gray-200 rounded w-64"></div>
      <div className="border-2 border-dashed border-gray-300 rounded-lg h-32 bg-gray-50"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>
      <div className="h-96 bg-gray-200 rounded-lg"></div>
    </div>
  );
}

export default function ModelBuilderPage() {
  return (
    <Suspense fallback={<ModelBuilderSkeleton />}>
      <ModelBuilderClient />
    </Suspense>
  );
}