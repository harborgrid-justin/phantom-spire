'use client';

/**
 * @fileoverview Data Explorer Page - Advanced Dataset Analysis & Visualization Interface
 */

import DataExplorerClient from './DataExplorerClient';

/**
 * Data Explorer Page Component
 */
export default function DataExplorerPage() {
  return (
    <main className="min-h-screen bg-gray-50" role="main">
      <DataExplorerClient />
    </main>
  );
}