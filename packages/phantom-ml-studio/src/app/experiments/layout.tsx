import type { Metadata, Viewport } from 'next';

/**
 * Experiments Layout - Server Component Configuration
 * 
 * Provides proper server-side configuration for the experiments module
 * including metadata, viewport settings, and performance optimizations.
 */

export const metadata: Metadata = {
  title: 'ML Experiments | Phantom ML Studio',
  description: 'Advanced experiment tracking platform with statistical analysis, reproducible workflows, and research-grade capabilities',
  keywords: [
    'machine learning experiments',
    'experiment tracking',
    'hyperparameter optimization',
    'statistical analysis',
    'model comparison',
    'research platform',
    'MLOps',
    'reproducible research'
  ],
  authors: [{ name: 'Phantom ML Studio Research Team' }],
  category: 'Machine Learning',
  openGraph: {
    title: 'ML Experiments - Research Platform',
    description: 'Comprehensive experiment tracking with advanced analytics and statistical testing',
    type: 'website',
    locale: 'en_US',
    siteName: 'Phantom ML Studio'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ML Experiments Platform',
    description: 'Research-grade experiment tracking and analysis'
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
    canonical: '/experiments'
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
 * Performance configuration for real-time experiment tracking
 * Ensures live updates for running experiments and metrics
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Real-time experiment data
export const runtime = 'nodejs';

interface ExperimentsLayoutProps {
  children: React.ReactNode;
}

/**
 * Experiments Layout Component
 * 
 * Provides the layout structure for all experiments pages with:
 * - Real-time data updates
 * - Research-grade performance optimization
 * - Proper SEO and metadata handling
 * - Accessibility support
 */
export default function ExperimentsLayout({ children }: ExperimentsLayoutProps) {
  return (
    <>
      {children}
    </>
  );
}