import type { Metadata, Viewport } from 'next';

/**
 * A/B Testing Layout - Server Component Configuration
 * 
 * Provides server-side configuration for the A/B testing module
 * with experiment design, statistical analysis, and performance comparison.
 */

export const metadata: Metadata = {
  title: 'A/B Testing | Phantom ML Studio',
  description: 'Advanced A/B testing platform for ML models with statistical significance testing, experiment design, and performance analysis',
  keywords: [
    'A/B testing',
    'model testing',
    'statistical testing',
    'experiment design',
    'performance comparison',
    'statistical significance',
    'ML testing',
    'model validation'
  ],
  authors: [{ name: 'Phantom ML Studio Testing Team' }],
  category: 'Model Testing',
  openGraph: {
    title: 'ML A/B Testing Platform',
    description: 'Statistical testing and experiment design for ML models',
    type: 'website',
    locale: 'en_US',
    siteName: 'Phantom ML Studio'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ML A/B Testing',
    description: 'Advanced model testing and validation platform'
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
    canonical: '/abTesting'
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
 * Performance configuration for A/B testing
 * Real-time updates for ongoing experiments
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Real-time experiment data
export const runtime = 'nodejs';

interface ABTestingLayoutProps {
  children: React.ReactNode;
}

/**
 * A/B Testing Layout Component
 * 
 * Server component that provides structure for A/B testing pages with:
 * - Real-time experiment monitoring
 * - Statistical analysis interface
 * - Performance comparison tools
 * - Significance testing results
 * - Experiment design wizard
 */
export default function ABTestingLayout({ children }: ABTestingLayoutProps) {
  return (
    <>
      {children}
    </>
  );
}