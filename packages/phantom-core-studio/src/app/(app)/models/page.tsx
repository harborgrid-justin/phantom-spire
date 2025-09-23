/**
 * Models Page - Server Component
 * 
 * Model management and registry page.
 * Metadata and configuration is handled in layout.tsx.
 */
import React, { Suspense } from 'react';
import ModelsClient from './ModelsClient';

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

export default function ModelsPage(): JSX.Element {
  return (
    <Suspense fallback={<ModelsSkeleton />}>
      <ModelsClient />
    </Suspense>
  );
}