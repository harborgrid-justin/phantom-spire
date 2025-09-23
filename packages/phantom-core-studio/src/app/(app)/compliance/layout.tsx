import type { Metadata, Viewport } from 'next';

/**
 * Compliance Layout - Server Component Configuration
 * 
 * Provides server-side configuration for the compliance module
 * with regulatory compliance tracking, audit trails, and governance features.
 */

export const metadata: Metadata = {
  title: 'Compliance | Phantom ML Studio',
  description: 'Enterprise compliance management platform with regulatory tracking, audit trails, and governance features for ML systems',
  keywords: [
    'ML compliance',
    'regulatory compliance',
    'audit trails',
    'governance',
    'GDPR compliance',
    'regulatory reporting',
    'compliance monitoring',
    'AI governance'
  ],
  authors: [{ name: 'Phantom ML Studio Compliance Team' }],
  category: 'Regulatory Compliance',
  openGraph: {
    title: 'ML Compliance Platform',
    description: 'Enterprise regulatory compliance and governance for ML systems',
    type: 'website',
    locale: 'en_US',
    siteName: 'Phantom ML Studio'
  },
  twitter: {
    card: 'summary',
    title: 'ML Compliance',
    description: 'Regulatory compliance and governance platform'
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
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
 * Performance configuration for compliance monitoring
 * Secure handling of compliance-sensitive data
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0; // No caching for compliance data
export const runtime = 'nodejs';

interface ComplianceLayoutProps {
  children: React.ReactNode;
}

/**
 * Compliance Layout Component
 * 
 * Server component that provides structure for compliance pages with:
 * - Regulatory compliance tracking
 * - Comprehensive audit trails
 * - Governance policy management
 * - Compliance reporting tools
 * - Risk assessment features
 */
export default function ComplianceLayout({ children }: ComplianceLayoutProps) {
  return (
    <>
      {children}
    </>
  );
}