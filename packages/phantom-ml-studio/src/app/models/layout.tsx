import type { Metadata, Viewport } from 'next';

/**
 * Models Layout - Server Component Configuration
 * 
 * Provides server-side configuration for the models management module
 * with model registry, versioning, and deployment capabilities.
 */

export const metadata: Metadata = {
  title: 'Models | Phantom ML Studio',
  description: 'Comprehensive model management platform with versioning, deployment, and performance tracking for enterprise ML operations',
  keywords: [
    'machine learning models',
    'model registry',
    'model versioning',
    'model deployment',
    'model management',
    'MLOps',
    'enterprise ML',
    'model lifecycle'
  ],
  authors: [{ name: 'Phantom ML Studio Model Team' }],
  category: 'Model Management',
  openGraph: {
    title: 'ML Model Management Platform',
    description: 'Enterprise-grade model registry and deployment platform',
    type: 'website',
    locale: 'en_US',
    siteName: 'Phantom ML Studio'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ML Model Management',
    description: 'Comprehensive model lifecycle management'
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
    canonical: '/models'
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
 * Performance configuration for model management
 * Optimized for model metadata and deployment status updates
 */
export const dynamic = 'auto';
export const revalidate = 60; // Model metadata cache for 1 minute
export const runtime = 'nodejs';

interface ModelsLayoutProps {
  children: React.ReactNode;
}

/**
 * Models Layout Component
 * 
 * Server component that provides structure for model management pages with:
 * - Model registry integration
 * - Version control support
 * - Deployment status tracking
 * - Performance metrics display
 * - Enterprise security compliance
 */
export default function ModelsLayout({ children }: ModelsLayoutProps) {
  return (
    <>
      {children}
    </>
  );
}