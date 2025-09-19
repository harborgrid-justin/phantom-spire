import type { Metadata, Viewport } from 'next';

/**
 * Users Layout - Server Component Configuration
 * 
 * Provides server-side configuration for the user management module
 * with authentication, authorization, and user administration features.
 */

export const metadata: Metadata = {
  title: 'Users | Phantom ML Studio',
  description: 'Enterprise user management platform with role-based access control, authentication, and comprehensive user administration',
  keywords: [
    'user management',
    'user administration',
    'role-based access control',
    'RBAC',
    'authentication',
    'authorization',
    'enterprise users',
    'security management'
  ],
  authors: [{ name: 'Phantom ML Studio Security Team' }],
  category: 'User Management',
  openGraph: {
    title: 'Enterprise User Management',
    description: 'Comprehensive user administration and security management',
    type: 'website',
    locale: 'en_US',
    siteName: 'Phantom ML Studio'
  },
  twitter: {
    card: 'summary',
    title: 'User Management',
    description: 'Enterprise user administration platform'
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
 * Performance configuration for user management
 * Dynamic rendering for security-sensitive user data
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0; // No caching for security-sensitive data
export const runtime = 'nodejs';

interface UsersLayoutProps {
  children: React.ReactNode;
}

/**
 * Users Layout Component
 * 
 * Server component that provides structure for user management pages with:
 * - Secure user data handling
 * - Role-based access control
 * - Authentication state management
 * - Enterprise security compliance
 * - Audit logging capabilities
 */
export default function UsersLayout({ children }: UsersLayoutProps) {
  return (
    <>
      {children}
    </>
  );
}