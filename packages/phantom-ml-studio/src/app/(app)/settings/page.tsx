/**
 * Settings Page - Server Component
 * 
 * Metadata and configuration is handled in layout.tsx.
 */
import React, { Suspense } from 'react';
import SettingsClient from './SettingsClient';

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

export default function SettingsPage(): JSX.Element {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsClient />
    </Suspense>
  );
}
