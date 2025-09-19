import type { Metadata, Viewport } from 'next';

/**
 * Bias Detection Layout - Server Component Configuration
 * 
 * Provides server-side configuration for the bias detection and fairness module
 * with algorithmic fairness testing, bias analysis, and mitigation strategies.
 */

export const metadata: Metadata = {
  title: 'Bias Detection | Phantom ML Studio',
  description: 'Advanced bias detection and fairness testing platform with algorithmic auditing, bias analysis, and mitigation recommendations',
  keywords: [
    'bias detection',
    'algorithmic fairness',
    'ML fairness',
    'bias analysis',
    'fairness testing',
    'ethical AI',
    'algorithmic auditing',
    'bias mitigation'
  ],
  authors: [{ name: 'Phantom ML Studio Ethics Team' }],
  category: 'AI Ethics & Fairness',
  openGraph: {
    title: 'AI Bias Detection Platform',
    description: 'Comprehensive bias detection and fairness testing for ML models',
    type: 'website',
    locale: 'en_US',
    siteName: 'Phantom ML Studio'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Bias Detection',
    description: 'Ethical AI and algorithmic fairness platform'
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
    canonical: '/biasDetection'
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
 * Performance configuration for bias analysis
 * Dynamic rendering for comprehensive fairness testing
 */
export const dynamic = 'auto';
export const revalidate = 600; // Cache bias analysis results for 10 minutes
export const runtime = 'nodejs';

interface BiasDetectionLayoutProps {
  children: React.ReactNode;
}

/**
 * Bias Detection Layout Component
 * 
 * Server component that provides structure for bias detection pages with:
 * - Comprehensive fairness testing interface
 * - Bias analysis visualization
 * - Mitigation strategy recommendations
 * - Compliance reporting features
 * - Ethical AI governance tools
 */
export default function BiasDetectionLayout({ children }: BiasDetectionLayoutProps) {
  return (
    <>
      {children}
    </>
  );
}