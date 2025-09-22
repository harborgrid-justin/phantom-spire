/**
 * BiasDetection Page - Server Component
 * 
 * Metadata and configuration is handled in layout.tsx.
 */
import React, { Suspense } from 'react';
import BiasDetectionClient from './BiasDetectionClient';

function BiasDetectionSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-4">
      <div className="h-8 bg-gray-200 rounded w-64"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-200 rounded-lg h-80"></div>
        <div className="bg-gray-200 rounded-lg h-80"></div>
      </div>
    </div>
  );
}

export default function BiasDetectionPage(): JSX.Element {
  return (
    <Suspense fallback={<BiasDetectionSkeleton />}>
      <BiasDetectionClient />
    </Suspense>
  );
}
