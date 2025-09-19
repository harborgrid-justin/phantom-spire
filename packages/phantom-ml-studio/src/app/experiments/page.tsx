/**
 * ML Experiments Page - Server Component
 *
 * This is a Next.js Server Component that provides the main experiments page.
 * All metadata and configuration is handled in the layout.tsx file.
 * Client-side interactivity is handled by child client components.
 *
 * @author Phantom ML Studio Research Team
 * @version 3.5.0
 * @since 2024-01-15
 * @category MLOps
 * @subcategory Experiment Management
 */

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamic imports for optimal experiment tracking interface loading
const ExperimentsClient = dynamic(() => import('./ExperimentsClient'), {
  loading: () => <ExperimentsSkeleton />
});

/**
 * Advanced loading skeleton for experiment tracking interface
 * Implements research-grade loading states with experiment context
 *
 * Features:
 * - Experiment-aware skeleton shapes matching research workflows
 * - Statistical analysis loading indicators
 * - Performance metrics placeholders with proper formatting
 * - Accessibility support with experiment context
 * - Responsive design for various research scenarios
 * - Progressive disclosure for complex experiment hierarchies
 */
function ExperimentsSkeleton() {
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 p-6"
      role="status"
      aria-label="Loading experiment tracking interface"
      aria-live="polite"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section Skeleton */}
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-4">
              <div className="h-12 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-lg w-96"></div>
              <div className="h-5 bg-gray-200 rounded w-[36rem]"></div>
              <div className="flex items-center space-x-4">
                <div className="h-4 bg-green-200 rounded w-32"></div>
                <div className="h-4 bg-gray-300 rounded w-40"></div>
              </div>
            </div>
            <div className="flex space-x-4">
              <div className="h-12 bg-gray-200 rounded-lg w-44"></div>
              <div className="h-12 bg-indigo-200 rounded-lg w-48"></div>
            </div>
          </div>
        </div>

        {/* Experiment Status Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-5 bg-gray-300 rounded w-28"></div>
                <div className="h-8 w-8 bg-indigo-100 rounded-lg"></div>
              </div>
              <div className="space-y-3">
                <div className="h-8 bg-gradient-to-r from-indigo-300 to-purple-300 rounded w-12"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
                <div className="flex items-center space-x-2">
                  <div className="h-3 bg-green-200 rounded w-14"></div>
                  <div className="h-3 bg-gray-200 rounded w-18"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Experiments Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Experiment List */}
          <div className="xl:col-span-3 space-y-6">
            {/* Experiment Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 bg-gray-300 rounded w-40"></div>
                <div className="flex space-x-2">
                  <div className="h-8 bg-gray-200 rounded w-28"></div>
                  <div className="h-8 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="h-10 bg-gray-100 rounded-lg"></div>
                ))}
              </div>
            </div>

            {/* Experiment Cards */}
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 animate-pulse">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-2">
                      <div className="h-6 bg-gray-300 rounded w-64"></div>
                      <div className="h-4 bg-gray-200 rounded w-48"></div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="h-6 bg-green-200 rounded w-20"></div>
                      <div className="h-8 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                      <div className="h-4 bg-indigo-200 rounded w-12"></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-4 bg-purple-200 rounded w-16"></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-4 bg-gray-200 rounded w-18"></div>
                      <div className="h-4 bg-green-200 rounded w-14"></div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl"></div>
                    <div className="space-y-4">
                      {Array.from({ length: 6 }, (_, j) => (
                        <div key={j} className="flex items-center justify-between">
                          <div className="h-4 bg-gray-300 rounded w-24"></div>
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Experiment Analytics Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
              <div className="h-6 bg-gray-300 rounded w-40 mb-6"></div>
              <div className="space-y-4">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-indigo-100 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-28"></div>
                      <div className="h-3 bg-gray-200 rounded w-36"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-14"></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
              <div className="h-6 bg-gray-300 rounded w-36 mb-6"></div>
              <div className="h-56 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl"></div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
              <div className="h-6 bg-gray-300 rounded w-32 mb-4"></div>
              <div className="space-y-3">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="h-4 bg-gray-300 rounded w-20"></div>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 bg-gray-200 rounded-full w-16"></div>
                      <div className="h-4 bg-gray-200 rounded w-10"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Experiment Status */}
        <div className="fixed bottom-8 right-8">
          <div className="bg-white rounded-full shadow-lg border border-gray-200 p-4 animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="h-3 w-3 bg-indigo-400 rounded-full animate-ping"></div>
              <div className="h-4 bg-gray-300 rounded w-32"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ML Experiments Page Component
 *
 * Server component that provides structure for experiment tracking with:
 * - Advanced statistical analysis with hypothesis testing
 * - Reproducible experiment workflows with complete lineage
 * - Real-time experiment monitoring with anomaly detection
 * - Distributed experiment orchestration across compute resources
 * - Collaborative research features with peer review workflows
 * - Publication-ready visualizations and reporting
 * - Integration with popular ML tracking platforms
 * - Resource optimization and cost management
 *
 * @returns {JSX.Element} The complete experiment tracking interface
 */
export default function ExperimentsPage(): JSX.Element {
  return (
    <main className="min-h-screen bg-gray-50" role="main">
      <React.Suspense fallback={<ExperimentsSkeleton />}>
        <ExperimentsClient />
      </React.Suspense>
    </main>
  );
}