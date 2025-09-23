import type { Metadata, Viewport } from 'next';

/**
 * AutoML Pipeline Layout - Server Component Configuration
 * 
 * Provides server-side configuration for the automated machine learning module
 * with automated model selection, hyperparameter tuning, and pipeline optimization.
 */

export const metadata: Metadata = {
  title: 'AutoML Pipeline | Phantom ML Studio',
  description: 'Advanced AutoML platform with automated model selection, hyperparameter optimization, and intelligent pipeline generation',
  keywords: [
    'AutoML',
    'automated machine learning',
    'automated model selection',
    'hyperparameter optimization',
    'pipeline automation',
    'neural architecture search',
    'automated feature engineering',
    'no-code ML'
  ],
  authors: [{ name: 'Phantom ML Studio AutoML Team' }],
  category: 'Automated Machine Learning',
  openGraph: {
    title: 'Enterprise AutoML Platform',
    description: 'Automated machine learning with intelligent pipeline optimization',
    type: 'website',
    locale: 'en_US',
    siteName: 'Phantom ML Studio'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AutoML Pipeline',
    description: 'Intelligent automated machine learning platform'
  },
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
  alternates: {
    canonical: '/automlPipeline'
  }
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1f2937' }
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
};

/**
 * Performance configuration for AutoML operations
 * Real-time updates for long-running AutoML experiments
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Real-time AutoML progress
export const runtime = 'nodejs';

interface AutoMLPipelineLayoutProps {
  children: React.ReactNode;
}

/**
 * AutoML Pipeline Layout Component
 * 
 * Server component that provides structure for AutoML pages with:
 * - Real-time experiment progress tracking
 * - Automated model comparison interface
 * - Pipeline optimization visualization
 * - Resource usage monitoring
 * - Enterprise-grade AutoML workflows
 */
export default function AutoMLPipelineLayout({ children }: AutoMLPipelineLayoutProps) {
  return (
    <>
      {children}
    </>
  );
}