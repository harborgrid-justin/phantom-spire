import type { Metadata, Viewport } from 'next';

/**
 * Data Explorer Layout - Server Component Configuration
 * 
 * Provides server-side configuration for the data exploration module
 * with data visualization, analysis, and preparation capabilities.
 */

export const metadata: Metadata = {
  title: 'Data Explorer | Phantom ML Studio',
  description: 'Advanced data exploration and visualization platform with statistical analysis, data profiling, and preparation tools',
  keywords: [
    'data exploration',
    'data visualization',
    'statistical analysis',
    'data profiling',
    'data preparation',
    'exploratory data analysis',
    'EDA',
    'data science tools'
  ],
  authors: [{ name: 'Phantom ML Studio Data Team' }],
  category: 'Data Analysis',
  openGraph: {
    title: 'Data Explorer - Advanced Analytics',
    description: 'Comprehensive data exploration and visualization platform',
    type: 'website',
    locale: 'en_US',
    siteName: 'Phantom ML Studio'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Data Explorer',
    description: 'Advanced data exploration and analysis tools'
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
    canonical: '/dataExplorer'
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
 * Performance configuration for data exploration
 * Dynamic rendering for interactive data analysis
 */
export const dynamic = 'auto';
export const revalidate = 300; // Cache data profiles for 5 minutes
export const runtime = 'nodejs';

interface DataExplorerLayoutProps {
  children: React.ReactNode;
}

/**
 * Data Explorer Layout Component
 * 
 * Server component that provides structure for data exploration pages with:
 * - Interactive data visualization
 * - Statistical analysis tools
 * - Data profiling capabilities
 * - Export and sharing features
 * - Performance-optimized rendering
 */
export default function DataExplorerLayout({ children }: DataExplorerLayoutProps) {
  return (
    <>
      {children}
    </>
  );
}