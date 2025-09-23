import type { Metadata, Viewport } from 'next';

/**
 * Threat Intelligence Layout - Server Component Configuration
 * 
 * Provides server-side configuration for the threat intelligence module
 * with cybersecurity threat analysis, IOC processing, and security monitoring.
 */

export const metadata: Metadata = {
  title: 'Threat Intelligence | Phantom ML Studio',
  description: 'Advanced threat intelligence platform with ML-powered threat analysis, IOC processing, and cybersecurity monitoring',
  keywords: [
    'threat intelligence',
    'cybersecurity',
    'threat analysis',
    'IOC processing',
    'security monitoring',
    'ML security',
    'threat detection',
    'security analytics'
  ],
  authors: [{ name: 'Phantom ML Studio Security Team' }],
  category: 'Cybersecurity Intelligence',
  openGraph: {
    title: 'ML-Powered Threat Intelligence',
    description: 'Advanced cybersecurity threat analysis and monitoring platform',
    type: 'website',
    locale: 'en_US',
    siteName: 'Phantom ML Studio'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Threat Intelligence Platform',
    description: 'ML-powered cybersecurity threat analysis'
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
 * Performance configuration for threat intelligence
 * Real-time updates for threat monitoring and analysis
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Real-time threat intelligence data
export const runtime = 'nodejs';

interface ThreatIntelligenceLayoutProps {
  children: React.ReactNode;
}

/**
 * Threat Intelligence Layout Component
 * 
 * Server component that provides structure for threat intelligence pages with:
 * - Real-time threat monitoring
 * - ML-powered threat analysis
 * - IOC processing and correlation
 * - Security incident tracking
 * - Enterprise security compliance
 */
export default function ThreatIntelligenceLayout({ children }: ThreatIntelligenceLayoutProps) {
  return (
    <>
      {children}
    </>
  );
}