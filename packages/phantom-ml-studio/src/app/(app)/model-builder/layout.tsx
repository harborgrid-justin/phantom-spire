import type { Metadata, Viewport } from 'next';

/**
 * Model Builder Layout - Server Component Configuration
 * 
 * Provides server-side configuration for the model building module
 * with drag-and-drop interface, automated ML, and custom model development.
 */

export const metadata: Metadata = {
  title: 'Model Builder | Phantom ML Studio',
  description: 'Advanced model building platform with drag-and-drop interface, AutoML capabilities, and custom model development tools',
  keywords: [
    'model builder',
    'drag and drop ML',
    'AutoML',
    'model development',
    'machine learning builder',
    'no-code ML',
    'visual ML',
    'model creation'
  ],
  authors: [{ name: 'Phantom ML Studio Builder Team' }],
  category: 'Model Development',
  openGraph: {
    title: 'Visual Model Builder Platform',
    description: 'Drag-and-drop model building with AutoML capabilities',
    type: 'website',
    locale: 'en_US',
    siteName: 'Phantom ML Studio'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Visual Model Builder',
    description: 'No-code model development platform'
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
    canonical: '/modelBuilder'
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
 * Performance configuration for model builder
 * Dynamic rendering for interactive model building
 */
export const dynamic = 'auto';
export const revalidate = 600; // Cache model templates for 10 minutes
export const runtime = 'nodejs';

interface ModelBuilderLayoutProps {
  children: React.ReactNode;
}

/**
 * Model Builder Layout Component
 * 
 * Server component that provides structure for model building pages with:
 * - Visual drag-and-drop interface support
 * - AutoML pipeline integration
 * - Model template management
 * - Real-time validation and testing
 * - Enterprise-grade security
 */
export default function ModelBuilderLayout({ children }: ModelBuilderLayoutProps) {
  return (
    <>
      {children}
    </>
  );
}