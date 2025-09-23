'use client';

import dynamic from 'next/dynamic';

// Dynamic import to ensure client-side rendering
const MitreDashboard = dynamic(
  () => import('@/shared/ui/mitre/MitreDashboard'),
  {
    ssr: false,
    loading: () => <div>Loading MITRE Dashboard...</div>
  }
);

export default function MitreDashboardClient() {
  return <MitreDashboard />;
}