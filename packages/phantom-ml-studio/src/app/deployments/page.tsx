import type { Metadata } from 'next';
import { Suspense } from 'react';
import DeploymentsClient from './DeploymentsClient';

export const metadata: Metadata = {
  title: 'Deployments | Phantom ML Studio',
  description: 'Deploy and manage ML models with enterprise-grade scalability, monitoring, and endpoint management.',
  keywords: ['ML deployment', 'model serving', 'endpoint management', 'production ML', 'model monitoring'],
  openGraph: {
    title: 'Deployments - Phantom ML Studio',
    description: 'Enterprise ML model deployment and management',
  },
};

export const dynamic = 'force-dynamic';

function DeploymentsSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-4">
      <div className="h-8 bg-gray-200 rounded w-48"></div>
      <div className="bg-gray-200 rounded-lg h-[600px]"></div>
    </div>
  );
}

export default function DeploymentsPage() {
  return (
    <Suspense fallback={<DeploymentsSkeleton />}>
      <DeploymentsClient />
    </Suspense>
  );
}