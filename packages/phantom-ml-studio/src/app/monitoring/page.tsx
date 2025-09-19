/**
 * Monitoring Page - Server Component
 * 
 * Metadata and configuration is handled in layout.tsx.
 */
import React, { Suspense } from 'react';
import RealTimeMonitoringClient from './RealTimeMonitoringClient';

function MonitoringSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-4">
      <div className="h-8 bg-gray-200 rounded w-64"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-200 rounded-lg h-96"></div>
        <div className="bg-gray-200 rounded-lg h-96"></div>
      </div>
    </div>
  );
}

export default function RealTimeMonitoringPage(): JSX.Element {
  return (
    <Suspense fallback={<MonitoringSkeleton />}>
      <RealTimeMonitoringClient />
    </Suspense>
  );
}
