import type { Metadata, Viewport } from 'next';

/**
 * Deployments Layout - Server Component Configuration
 * 
 * Provides server-side configuration for the deployment management module
 * with model deployment, scaling, and infrastructure management.
 */

export const metadata: Metadata = {
  title: 'Deployments | Phantom ML Studio',
  description: 'Enterprise model deployment platform with auto-scaling, infrastructure management, and production monitoring capabilities',
  keywords: [
    'model deployment',
    'ML deployments',
    'infrastructure management',
    'auto-scaling',
    'production ML',
    'deployment monitoring',
    'MLOps deployment',
    'enterprise deployment'
  ],
  authors: [{ name: 'Phantom ML Studio Deployment Team' }],
  category: 'Model Deployment',
  openGraph: {
    title: 'ML Model Deployment Platform',
    description: 'Enterprise-grade model deployment and infrastructure management',
    type: 'website',
    locale: 'en_US',
    siteName: 'Phantom ML Studio'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ML Model Deployment',
    description: 'Enterprise model deployment and scaling platform'
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
    canonical: '/deployments'
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
 * Performance configuration for deployment management
 * Real-time updates for deployment status and monitoring
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Real-time deployment status
export const runtime = 'nodejs';

interface DeploymentsLayoutProps {
  children: React.ReactNode;
}

/**
 * Deployments Layout Component
 * 
 * Server component that provides structure for deployment pages with:
 * - Real-time deployment status monitoring
 * - Infrastructure management interface
 * - Auto-scaling configuration
 * - Performance monitoring integration
 * - Enterprise security and compliance
 */
export default function DeploymentsLayout({ children }: DeploymentsLayoutProps) {
  return (
    <>
      {children}
    </>
  );
}