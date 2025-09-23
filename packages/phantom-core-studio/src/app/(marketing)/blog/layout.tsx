import type { Metadata, Viewport } from 'next';

/**
 * Blog Layout - Server Component Configuration
 * 
 * Provides server-side configuration for the blog module
 * with article management, publishing, and content organization.
 */

export const metadata: Metadata = {
  title: 'Blog | Phantom ML Studio',
  description: 'Machine learning insights, tutorials, and industry analysis from the Phantom ML Studio team',
  keywords: [
    'machine learning blog',
    'ML insights',
    'AI tutorials',
    'data science articles',
    'ML industry analysis',
    'technical blog',
    'AI research',
    'ML best practices'
  ],
  authors: [{ name: 'Phantom ML Studio Editorial Team' }],
  category: 'Technology Blog',
  openGraph: {
    title: 'ML Insights Blog',
    description: 'Machine learning insights and technical articles',
    type: 'website',
    locale: 'en_US',
    siteName: 'Phantom ML Studio'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ML Insights Blog',
    description: 'Latest insights in machine learning and AI'
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
    canonical: '/blog'
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
 * Performance configuration for blog content
 * Static generation with ISR for optimal blog performance
 */
export const dynamic = 'auto';
export const revalidate = 3600; // Revalidate blog content every hour
export const runtime = 'nodejs';

interface BlogLayoutProps {
  children: React.ReactNode;
}

/**
 * Blog Layout Component
 * 
 * Server component that provides structure for blog pages with:
 * - Article listing and navigation
 * - Category and tag organization
 * - Search functionality
 * - Author information display
 * - Social sharing integration
 */
export default function BlogLayout({ children }: BlogLayoutProps) {
  return (
    <>
      {children}
    </>
  );
}