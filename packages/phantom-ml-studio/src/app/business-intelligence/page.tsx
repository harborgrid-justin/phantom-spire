/**
 * Business Intelligence Page - Server Component
 *
 * Enterprise business intelligence dashboard providing comprehensive
 * analytics, ROI calculations, and performance metrics for ML operations.
 *
 * Features:
 * - Cost-benefit analysis across ML models and operations
 * - Resource optimization recommendations with financial impact
 * - Performance forecasting with business context
 * - Executive dashboards with enterprise KPIs
 * - Compliance reporting and audit trails
 */

import React from 'react';
import dynamic from 'next/dynamic';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Business Intelligence | Phantom ML Studio',
  description: 'Enterprise business intelligence dashboard with ROI calculations, cost-benefit analysis, and performance forecasting',
  keywords: ['business intelligence', 'ROI', 'analytics', 'enterprise', 'cost-benefit', 'forecasting']
};

// Dynamic import for optimal loading
const BusinessIntelligenceClient = dynamic(() => import('./BusinessIntelligenceClient'), {
  loading: () => <BusinessIntelligenceSkeleton />
});

/**
 * Loading skeleton for business intelligence interface
 */
function BusinessIntelligenceSkeleton() {
  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6"
      role="status"
      aria-label="Loading business intelligence dashboard"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="animate-pulse">
          <div className="h-12 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg w-96 mb-4"></div>
          <div className="h-5 bg-gray-200 rounded w-[40rem]"></div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-5 bg-gray-300 rounded w-24"></div>
                <div className="h-8 w-8 bg-blue-100 rounded-lg"></div>
              </div>
              <div className="h-8 bg-gradient-to-r from-blue-300 to-purple-300 rounded w-20 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
          ))}
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 bg-white rounded-xl shadow-sm p-6 animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-48 mb-6"></div>
            <div className="h-96 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg"></div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-36 mb-6"></div>
            <div className="h-96 bg-gradient-to-br from-indigo-50 to-pink-50 rounded-lg"></div>
          </div>
        </div>

        {/* Analytics Table */}
        <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-40 mb-6"></div>
          <div className="space-y-4">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-4 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-green-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Business Intelligence Page Component
 * 
 * Provides comprehensive business intelligence capabilities including:
 * - Financial performance analysis and ROI calculations
 * - Resource utilization optimization with cost impact
 * - Predictive analytics for business planning
 * - Compliance and audit reporting
 * - Executive-level dashboards with enterprise KPIs
 */
export default function BusinessIntelligencePage(): JSX.Element {
  return (
    <main className="min-h-screen bg-gray-50" role="main">
      <React.Suspense fallback={<BusinessIntelligenceSkeleton />}>
        <BusinessIntelligenceClient />
      </React.Suspense>
    </main>
  );
}