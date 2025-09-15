import type { Metadata } from 'next';
import { Suspense } from 'react';
import SettingsClient from './SettingsClient';

export const metadata: Metadata = {
  title: 'Settings | Phantom ML Studio',
  description: 'Configure your ML platform settings, user preferences, security options, and system configurations.',
  keywords: ['settings', 'configuration', 'preferences', 'security', 'system admin'],
  openGraph: {
    title: 'Settings - Phantom ML Studio',
    description: 'Platform configuration and settings',
  },
};

export const dynamic = 'force-dynamic';

function SettingsSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-4">
      <div className="h-8 bg-gray-200 rounded w-48"></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-200 rounded-lg h-64"></div>
        <div className="lg:col-span-2 bg-gray-200 rounded-lg h-64"></div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsClient />
    </Suspense>
  );
}