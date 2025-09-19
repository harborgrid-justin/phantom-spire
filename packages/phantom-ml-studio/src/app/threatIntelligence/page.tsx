/**
 * ThreatIntelligence Page - Server Component
 * 
 * Metadata and configuration is handled in layout.tsx.
 */
import React, { Suspense } from 'react';
import ThreatIntelligenceClient from './ThreatIntelligenceClient';

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

export default function ThreatIntelligenceMarketplacePage(): JSX.Element {
  return (
    <Suspense fallback={<ThreatIntelligenceSkeleton />}>
      <ThreatIntelligenceClient />
    </Suspense>
  );
}
