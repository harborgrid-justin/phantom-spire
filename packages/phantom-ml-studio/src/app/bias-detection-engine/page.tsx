import type { Metadata } from 'next';
import { Suspense } from 'react';
import BiasDetectionClient from './BiasDetectionClient';

export const metadata: Metadata = {
  title: 'Bias Detection Engine | Phantom ML Studio',
  description: 'AI fairness tools to detect and mitigate bias in machine learning models with comprehensive analysis and reporting.',
  keywords: ['AI bias', 'fairness', 'ML ethics', 'bias detection', 'algorithmic fairness'],
  openGraph: {
    title: 'Bias Detection Engine - Phantom ML Studio',
    description: 'Advanced AI fairness and bias detection tools',
  },
};

export const dynamic = 'force-dynamic';

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

export default function BiasDetectionPage() {
  return (
    <Suspense fallback={<BiasDetectionSkeleton />}>
      <BiasDetectionClient />
    </Suspense>
  );
}