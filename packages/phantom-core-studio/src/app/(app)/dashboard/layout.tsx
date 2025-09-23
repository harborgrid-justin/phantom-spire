import type { Metadata, Viewport } from 'next';

/**
 * Dashboard Layout - Server Component Configuration
 * 
 * Provides server-side configuration for the main dashboard module
 * with real-time metrics, performance monitoring, and enterprise features.
 */

export const metadata: Metadata = {
  title: 'Dashboard | Phantom ML Studio',
  description: 'Comprehensive ML operations dashboard with real-time metrics, model performance tracking, and enterprise-grade analytics',
  keywords: [
    'machine learning dashboard',
    'ML operations',
    'model monitoring',
    'performance metrics',
    'analytics dashboard',
    'enterprise ML',
    'real-time monitoring',
    'MLOps dashboard'
  ],
  authors: [{ name: 'Phantom ML Studio Operations Team' }],
  category: 'Machine Learning Operations',
  openGraph: {
    title: 'ML Operations Dashboard',
    description: 'Real-time monitoring and analytics for machine learning operations',
    type: 'website',
    locale: 'en_US',
    siteName: 'Phantom ML Studio'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ML Operations Dashboard',
    description: 'Enterprise-grade ML monitoring and analytics'
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
    canonical: '/dashboard'
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
 * Performance configuration for real-time dashboard updates
 * Enables live metrics and monitoring data
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Real-time dashboard data
export const runtime = 'nodejs';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Dashboard Layout Component
 * 
 * Server component that provides structure for dashboard pages with:
 * - Real-time metrics updates
 * - Enterprise performance optimization
 * - Proper SEO and metadata handling
 * - Accessibility and responsive design support
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <>
      {children}
    </>
  );
}