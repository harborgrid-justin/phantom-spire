'use client';

/**
 * @fileoverview Data Explorer Page - Advanced Dataset Analysis & Visualization Interface
 */

import DataExplorerClient from './DataExplorerClient';

interface PageProps {
  params: Record<string, string>;
  searchParams: { [key: string]: string | string[] | undefined };
}

/**
 * Data Explorer Page Component
 */
export default function DataExplorerPage(props: PageProps): JSX.Element {
  return (
    <main className="min-h-screen bg-gray-50" role="main">
      <DataExplorerClient />
    </main>
  );
}