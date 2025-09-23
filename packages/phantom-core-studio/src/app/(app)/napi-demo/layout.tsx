import type { Metadata, Viewport } from 'next';

/**
 * NAPI Demo Layout - Server Component Configuration
 * 
 * Provides server-side configuration for the NAPI demonstration module
 * showcasing native Rust integration capabilities.
 */

export const metadata: Metadata = {
  title: 'NAPI Demo | Phantom ML Studio',
  description: 'Demonstration of NAPI-RS integration showcasing high-performance Rust modules within the ML platform',
  keywords: [
    'NAPI demo',
    'Rust integration',
    'native modules',
    'high-performance computing',
    'NAPI-RS',
    'native bindings',
    'performance demo',
    'system integration'
  ],
  authors: [{ name: 'Phantom ML Studio Core Team' }],
  category: 'Technical Demo',
  openGraph: {
    title: 'NAPI Integration Demo',
    description: 'High-performance Rust integration demonstration',
    type: 'website',
    locale: 'en_US',
    siteName: 'Phantom ML Studio'
  },
  twitter: {
    card: 'summary',
    title: 'NAPI Demo',
    description: 'Native Rust integration showcase'
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
 * Performance configuration for NAPI demo
 * Dynamic rendering for real-time performance metrics
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Real-time performance demonstration
export const runtime = 'nodejs';

interface NapiDemoLayoutProps {
  children: React.ReactNode;
}

/**
 * NAPI Demo Layout Component
 * 
 * Server component that provides structure for NAPI demo pages with:
 * - Performance benchmark interface
 * - Real-time metrics display
 * - Native module integration showcase
 * - System performance monitoring
 * - Technical documentation
 */
export default function NapiDemoLayout({ children }: NapiDemoLayoutProps) {
  return (
    <>
      {children}
    </>
  );
}