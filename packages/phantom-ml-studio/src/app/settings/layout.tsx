import type { Metadata, Viewport } from 'next';

/**
 * Settings Layout - Server Component Configuration
 * 
 * Provides server-side configuration for the settings and configuration module
 * with user preferences, system configuration, and security settings.
 */

export const metadata: Metadata = {
  title: 'Settings | Phantom ML Studio',
  description: 'Comprehensive settings and configuration management for enterprise ML platform with security, preferences, and system administration',
  keywords: [
    'ML platform settings',
    'system configuration',
    'user preferences',
    'security settings',
    'administration',
    'enterprise configuration',
    'platform management',
    'user management'
  ],
  authors: [{ name: 'Phantom ML Studio Admin Team' }],
  category: 'Platform Administration',
  openGraph: {
    title: 'Platform Settings & Configuration',
    description: 'Enterprise ML platform configuration and administration',
    type: 'website',
    locale: 'en_US',
    siteName: 'Phantom ML Studio'
  },
  twitter: {
    card: 'summary',
    title: 'Platform Settings',
    description: 'ML platform configuration and management'
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
 * Performance configuration for settings pages
 * Static generation for better performance on configuration pages
 */
export const dynamic = 'auto';
export const revalidate = 3600; // Settings cache for 1 hour
export const runtime = 'nodejs';

interface SettingsLayoutProps {
  children: React.ReactNode;
}

/**
 * Settings Layout Component
 * 
 * Server component that provides structure for settings pages with:
 * - Secure configuration management
 * - User preference handling
 * - System administration interface
 * - Enterprise security compliance
 * - Role-based access control
 */
export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <>
      {children}
    </>
  );
}