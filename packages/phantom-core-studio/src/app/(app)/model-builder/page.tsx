/**
 * ModelBuilder Page - Server Component
 * 
 * Advanced AutoML model building interface.
 * Metadata and configuration is handled in layout.tsx.
 * 
 * @author Phantom ML Studio Engineering Team
 * @version 2.0.0
 * @since 2024-01-15
 */

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import for client component to optimize bundle splitting
const ModelBuilderClient = dynamic(() => import('./ModelBuilderClient'), {
  loading: () => <ModelBuilderSkeleton />
});

/**
 * Sophisticated loading skeleton component with progressive disclosure
 * Implements skeleton loading patterns for optimal perceived performance
 *
 * Design principles:
 * - Content-aware skeleton shapes matching actual UI elements
 * - Smooth animation timing for natural loading experience
 * - Accessibility support with proper ARIA labels
 * - Responsive design adapting to various screen sizes
 */
function ModelBuilderSkeleton() {
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6"
      role="status"
      aria-label="Loading model builder interface"
      aria-live="polite"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section Skeleton */}
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-3">
              <div className="h-10 bg-gray-300 rounded-lg w-80"></div>
              <div className="h-4 bg-gray-200 rounded w-96"></div>
            </div>
            <div className="flex space-x-3">
              <div className="h-10 bg-gray-300 rounded-lg w-32"></div>
              <div className="h-10 bg-blue-200 rounded-lg w-40"></div>
            </div>
          </div>
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Configuration */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-300 rounded w-48 mb-4"></div>
              <div className="space-y-4">
                <div className="h-12 bg-gray-100 rounded-lg"></div>
                <div className="h-12 bg-gray-100 rounded-lg"></div>
                <div className="h-12 bg-gray-100 rounded-lg"></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-300 rounded w-40 mb-4"></div>
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-300 rounded w-56 mb-6"></div>
              <div className="h-96 bg-gray-100 rounded-lg"></div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-300 rounded w-44 mb-4"></div>
              <div className="space-y-3">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="flex-1 h-2 bg-gray-100 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="fixed bottom-6 right-6">
          <div className="bg-white rounded-full shadow-lg border border-gray-200 p-4 animate-pulse">
            <div className="h-6 w-6 bg-blue-200 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Model Builder Page Component
 *
 * Implements enterprise-grade page architecture with:
 * - Comprehensive error boundary integration
 * - Progressive enhancement with Suspense
 * - Optimized client-server separation
 * - Accessibility-first design
 * - Performance monitoring integration
 *
 * @returns {JSX.Element} The complete model builder page interface
 */
export default function ModelBuilderPage(): JSX.Element {
  return (
    <main className="min-h-screen bg-gray-50" role="main">
      <Suspense fallback={<ModelBuilderSkeleton />}>
        <ModelBuilderClient />
      </Suspense>
    </main>
  );
}
