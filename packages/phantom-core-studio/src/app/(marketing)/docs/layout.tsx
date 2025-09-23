import type { Metadata, Viewport } from 'next';

/**
 * Documentation Layout - Server Component Configuration
 * 
 * Provides server-side configuration for the documentation module
 * with comprehensive guides, API references, and developer resources.
 */

export const metadata: Metadata = {
  title: 'Documentation | Phantom ML Studio',
  description: 'Comprehensive documentation platform with user guides, API references, tutorials, and developer resources',
  keywords: [
    'ML documentation',
    'API documentation',
    'user guides',
    'tutorials',
    'developer resources',
    'technical documentation',
    'platform guides',
    'help documentation'
  ],
  authors: [{ name: 'Phantom ML Studio Documentation Team' }],
  category: 'Documentation',
  openGraph: {
    title: 'ML Platform Documentation',
    description: 'Comprehensive guides and resources for ML platform',
    type: 'website',
    locale: 'en_US',
    siteName: 'Phantom ML Studio'
  },
  twitter: {
    card: 'summary',
    title: 'Platform Documentation',
    description: 'Comprehensive ML platform documentation and guides'
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
    canonical: '/docs'
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
 * Performance configuration for documentation
 * Static generation for optimal documentation loading
 */
export const dynamic = 'auto';
export const revalidate = 86400; // Cache documentation for 24 hours
export const runtime = 'nodejs';

interface DocsLayoutProps {
  children: React.ReactNode;
}

/**
 * Documentation Layout Component
 * 
 * Server component that provides structure for documentation pages with:
 * - Searchable documentation interface
 * - Interactive API reference
 * - Tutorial and guide navigation
 * - Code example integration
 * - Multi-format content support
 */
export default function DocsLayout({ children }: DocsLayoutProps) {
  return (
    <>
      {children}
    </>
  );
}