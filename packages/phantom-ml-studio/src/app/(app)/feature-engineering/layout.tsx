import type { Metadata, Viewport } from 'next';

/**
 * Feature Engineering Layout - Server Component Configuration
 * 
 * Provides server-side configuration for the feature engineering module
 * with automated feature generation, transformation, and selection capabilities.
 */

export const metadata: Metadata = {
  title: 'Feature Engineering | Phantom ML Studio',
  description: 'Advanced feature engineering platform with automated feature generation, transformation pipelines, and intelligent feature selection',
  keywords: [
    'feature engineering',
    'feature generation',
    'feature transformation',
    'feature selection',
    'automated feature engineering',
    'data preprocessing',
    'feature extraction',
    'ML preprocessing'
  ],
  authors: [{ name: 'Phantom ML Studio Feature Team' }],
  category: 'Data Preprocessing',
  openGraph: {
    title: 'Feature Engineering Platform',
    description: 'Automated feature engineering and transformation tools',
    type: 'website',
    locale: 'en_US',
    siteName: 'Phantom ML Studio'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Feature Engineering',
    description: 'Advanced feature engineering and preprocessing platform'
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
    canonical: '/featureEngineering'
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
 * Performance configuration for feature engineering
 * Dynamic rendering for interactive feature transformation
 */
export const dynamic = 'auto';
export const revalidate = 600; // Cache feature transformations for 10 minutes
export const runtime = 'nodejs';

interface FeatureEngineeringLayoutProps {
  children: React.ReactNode;
}

/**
 * Feature Engineering Layout Component
 * 
 * Server component that provides structure for feature engineering pages with:
 * - Interactive feature transformation interface
 * - Automated feature generation tools
 * - Feature selection algorithms
 * - Pipeline visualization
 * - Performance optimization
 */
export default function FeatureEngineeringLayout({ children }: FeatureEngineeringLayoutProps) {
  return (
    <>
      {children}
    </>
  );
}