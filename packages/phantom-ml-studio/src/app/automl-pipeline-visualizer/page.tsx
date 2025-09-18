import type { Metadata } from 'next';
import { Suspense } from 'react';
import AutoMLPipelineClient from './AutoMLPipelineClient';

export const metadata: Metadata = {
  title: 'AutoML Pipeline Visualizer | Phantom ML Studio',
  description: 'Visual pipeline builder for automated machine learning workflows with drag-and-drop interface and real-time visualization.',
  keywords: ['AutoML pipeline', 'visual ML', 'workflow builder', 'pipeline automation', 'ML orchestration'],
  openGraph: {
    title: 'AutoML Pipeline Visualizer - Phantom ML Studio',
    description: 'Visual AutoML pipeline builder and orchestration',
  },
};

export const dynamic = 'force-dynamic';

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

export default function AutoMLPipelineVisualizerPage() {
  return (
    <Suspense fallback={<AutoMLPipelineSkeleton />}>
      <AutoMLPipelineClient />
    </Suspense>
  );
}