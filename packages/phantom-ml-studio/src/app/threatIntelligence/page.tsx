import type { Metadata } from 'next';
import { Suspense } from 'react';
import ThreatIntelligenceClient from './ThreatIntelligenceClient';

export const metadata: Metadata = {
  title: 'Threat Intelligence Marketplace | Phantom ML Studio',
  description: 'Advanced cybersecurity ML models for threat detection, intelligence analysis, and security automation.',
  keywords: ['threat intelligence', 'cybersecurity ML', 'threat detection', 'security automation', 'cyber analytics'],
  openGraph: {
    title: 'Threat Intelligence Marketplace - Phantom ML Studio',
    description: 'Enterprise cybersecurity ML models and threat intelligence',
  },
};

export const dynamic = 'force-dynamic';

function ThreatIntelligenceSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-4">
      <div className="h-8 bg-gray-200 rounded w-72"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
        ))}
      </div>
    </div>
  );
}

export default function ThreatIntelligenceMarketplacePage() {
  return (
    <Suspense fallback={<ThreatIntelligenceSkeleton />}>
      <ThreatIntelligenceClient />
    </Suspense>
  );
}