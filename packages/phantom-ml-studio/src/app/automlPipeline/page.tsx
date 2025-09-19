/**
 * AutoML Pipeline Page - Server Component
 * 
 * Visual pipeline builder for automated machine learning.
 * Metadata and configuration is handled in layout.tsx.
 */
import React, { Suspense } from 'react';
import AutoMLPipelineClient from './AutoMLPipelineClient';

function AutoMLPipelineSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-4" data-cy="page-loading">
      <div className="h-8 bg-gray-200 rounded w-72"></div>
      <div className="flex gap-4">
        <div className="w-64 bg-gray-200 rounded-lg h-96"></div>
        <div className="flex-1 bg-gray-200 rounded-lg h-96"></div>
      </div>
    </div>
  );
}

export default function AutoMLPipelineVisualizerPage(): JSX.Element {
  return (
    <Suspense fallback={<AutoMLPipelineSkeleton />}>
      <AutoMLPipelineClient />
    </Suspense>
  );
}