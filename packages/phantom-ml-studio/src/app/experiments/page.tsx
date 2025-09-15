/**
 * @fileoverview ML Experiments Page - Enterprise Experiment Tracking & Management Platform
 *
 * This module implements a comprehensive ML experiment tracking system following
 * research-grade experimental design principles and enterprise MLOps best practices.
 *
 * Core architectural patterns:
 * - Experimental Design Framework: Support for A/B testing, multi-armed bandits, and factorial designs
 * - Reproducibility Engine: Complete experiment lineage with versioned code, data, and environments
 * - Statistical Analysis Pipeline: Automated hypothesis testing with significance analysis
 * - Distributed Experiment Orchestration: Multi-GPU and cluster experiment coordination
 * - Collaborative Research Platform: Team-based experiment sharing and peer review workflows
 *
 * Advanced capabilities:
 * - Hyperparameter Optimization: Bayesian optimization, genetic algorithms, and population-based methods
 * - Experiment Comparison Engine: Statistical testing for model performance differences
 * - Resource Optimization: Intelligent compute allocation and cost optimization
 * - Real-time Monitoring: Live experiment tracking with early stopping and anomaly detection
 * - Integration Hub: Support for MLflow, Weights & Biases, TensorBoard, and custom loggers
 *
 * Research-grade features:
 * - Cross-validation strategies with statistical power analysis
 * - Meta-learning for hyperparameter transfer across experiments
 * - Causal inference support for treatment effect analysis
 * - Publication-ready visualization with LaTeX integration
 * - Research compliance with data governance and audit trails
 *
 * @author Phantom ML Studio Research Team
 * @version 3.5.0
 * @since 2024-01-15
 * @category MLOps
 * @subcategory Experiment Management
 */

import type { Metadata, Viewport } from 'next';
import { Suspense, ErrorBoundary } from 'react';
import dynamicImport from 'next/dynamic';
import { headers } from 'next/headers';

// Dynamic imports for optimal experiment tracking interface loading
const ExperimentsClient = dynamicImport(() => import('./ExperimentsClient'), {
  loading: () => <ExperimentsSkeleton />
});

/**
 * Comprehensive metadata configuration for ML research and academic visibility
 * Optimized for research community discovery and citation
 */
export const metadata: Metadata = {
  title: {
    default: 'Experiments | Phantom ML Studio',
    template: '%s | ML Experiments - Research Platform'
  },
  description: 'Enterprise ML experiment tracking platform featuring advanced statistical analysis, reproducible research workflows, hyperparameter optimization, distributed experiment orchestration, and comprehensive model performance comparison with research-grade rigor.',
  keywords: [
    'ML experiments', 'experiment tracking', 'hyperparameter optimization', 'model versioning',
    'statistical testing', 'reproducible research', 'MLOps', 'experiment design',
    'A/B testing', 'multi-armed bandit', 'Bayesian optimization', 'cross-validation',
    'model comparison', 'performance analysis', 'distributed training', 'research platform',
    'experiment orchestration', 'scientific computing', 'meta-learning', 'causal inference'
  ],
  authors: [{ name: 'Phantom ML Studio Research Team' }],
  creator: 'Phantom ML Studio',
  publisher: 'Phantom ML Studio',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    siteName: 'Phantom ML Studio',
    title: 'ML Experiments - Research-Grade Tracking Platform',
    description: 'Comprehensive experiment tracking with statistical analysis, hyperparameter optimization, and reproducible research workflows.',
    url: 'https://phantom-ml.com/experiments',
    images: [
      {
        url: '/og-experiments.png',
        width: 1200,
        height: 630,
        alt: 'Phantom ML Studio Experiments Interface with Statistical Analysis',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@PhantomMLStudio',
    creator: '@PhantomMLStudio',
    title: 'ML Experiments - Research Platform',
    description: 'Advanced experiment tracking with statistical analysis and reproducible workflows',
    images: ['/twitter-experiments.png'],
  },
  alternates: {
    canonical: 'https://phantom-ml.com/experiments',
  },
  category: 'Research',
  classification: 'Machine Learning Operations',
};

/**
 * Advanced viewport configuration for experiment tracking interfaces
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 3,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f9fafb' },
    { media: '(prefers-color-scheme: dark)', color: '#111827' }
  ],
  colorScheme: 'light dark',
};

/**
 * Performance configuration for real-time experiment tracking
 * Ensures live updates for running experiments and metrics
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Real-time experiment data
export const runtime = 'nodejs';

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
 * Error Boundary for Experiments Components
 * Provides comprehensive error recovery with experiment context preservation
 */
function ExperimentsErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-lg mx-auto text-center">
        <div className="bg-red-50 rounded-lg p-6 border border-red-200">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Experiment Tracking Error</h2>
          <p className="text-red-600 mb-4">Unable to load experiment tracking interface</p>
          <div className="space-y-2 mb-4">
            <button
              onClick={resetErrorBoundary}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors mr-2"
            >
              Retry Experiments
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
          <p className="text-sm text-red-500">Running experiments will continue in the background</p>
        </div>
      </div>
    </div>
  );
}

/**
 * ML Experiments Page Component
 *
 * Implements research-grade experiment tracking platform with:
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
export default async function ExperimentsPage(): Promise<JSX.Element> {
  // Extract user context for personalized experiment recommendations
  const headersList = headers();
  const userAgent = headersList.get('user-agent') || '';
  const isBot = /bot|crawler|spider/i.test(userAgent);

  // Optimize for search engine crawlers with research context
  if (isBot) {
    return (
      <main className="min-h-screen bg-gray-50" role="main">
        <div className="max-w-7xl mx-auto p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ML Experiments - Research Platform
          </h1>
          <p className="text-gray-600 mb-6">
            Comprehensive experiment tracking platform with statistical analysis, reproducible workflows, and advanced research capabilities.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="font-semibold mb-2">Experiment Tracking</h2>
              <p className="text-gray-600">Complete experiment lineage with versioned code, data, and environments</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="font-semibold mb-2">Statistical Analysis</h2>
              <p className="text-gray-600">Advanced hypothesis testing and performance comparison with significance analysis</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="font-semibold mb-2">Hyperparameter Optimization</h2>
              <p className="text-gray-600">Bayesian optimization and intelligent search strategies for optimal model performance</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50" role="main">
      <ErrorBoundary
        FallbackComponent={ExperimentsErrorFallback}
        onError={(error, errorInfo) => {
          console.error('Experiments Error:', error, errorInfo);
          // Here you would typically send to error tracking service with experiment context
        }}
      >
        <Suspense fallback={<ExperimentsSkeleton />}>
          <ExperimentsClient />
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}