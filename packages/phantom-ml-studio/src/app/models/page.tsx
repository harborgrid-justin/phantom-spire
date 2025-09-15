import type { Metadata } from 'next';
import { Suspense } from 'react';
import ModelsClient from './ModelsClient';

export const metadata: Metadata = {
  title: 'Models | Phantom ML Studio',
  description: 'Manage and version your machine learning models with comprehensive model registry, versioning, and performance tracking.',
  keywords: ['ML models', 'model registry', 'model versioning', 'model management', 'MLOps'],
  openGraph: {
    title: 'Models - Phantom ML Studio',
    description: 'Comprehensive ML model management and registry',
  },
};

export const dynamic = 'force-dynamic';

function ModelsSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-4">
      <div className="h-8 bg-gray-200 rounded w-48"></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-200 rounded-lg h-96"></div>
        <div className="bg-gray-200 rounded-lg h-96"></div>
      </div>
    </div>
  );
}

export default function ModelsPage() {
  return (
    <Suspense fallback={<ModelsSkeleton />}>
      <ModelsClient />
    </Suspense>
  );
}