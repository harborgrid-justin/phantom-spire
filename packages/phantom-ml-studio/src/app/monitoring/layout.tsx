import type { Metadata, Viewport } from 'next';

/**
 * Monitoring Layout - Server Component Configuration
 * 
 * Provides server-side configuration for the monitoring module
 * with real-time alerting, performance tracking, and system health monitoring.
 */

export const metadata: Metadata = {
  title: 'Monitoring | Phantom ML Studio',
  description: 'Real-time monitoring and alerting platform for machine learning systems with comprehensive health checks and performance analytics',
  keywords: [
    'ML monitoring',
    'model monitoring',
    'performance monitoring',
    'system health',
    'real-time alerts',
    'observability',
    'MLOps monitoring',
    'enterprise monitoring'
  ],
  authors: [{ name: 'Phantom ML Studio Monitoring Team' }],
  category: 'System Monitoring',
  openGraph: {
    title: 'ML System Monitoring Platform',
    description: 'Real-time monitoring and alerting for enterprise ML systems',
    type: 'website',
    locale: 'en_US',
    siteName: 'Phantom ML Studio'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ML System Monitoring',
    description: 'Comprehensive monitoring and alerting platform'
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
    canonical: '/monitoring'
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
 * Performance configuration for real-time monitoring
 * Enables live updates for system metrics and alerts
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Real-time monitoring data
export const runtime = 'nodejs';

interface MonitoringLayoutProps {
  children: React.ReactNode;
}

/**
 * Monitoring Layout Component
 * 
 * Server component that provides structure for monitoring pages with:
 * - Real-time system health updates
 * - Performance metrics streaming
 * - Alert management interface
 * - Comprehensive observability features
 * - Enterprise-grade security monitoring
 */
export default function MonitoringLayout({ children }: MonitoringLayoutProps) {
  return (
    <>
      {children}
    </>
  );
}