import type { Metadata, Viewport } from 'next';

/**
 * Projects Layout - Server Component Configuration
 * 
 * Provides server-side configuration for the project management module
 * with collaborative workspaces, project tracking, and team management.
 */

export const metadata: Metadata = {
  title: 'Projects | Phantom ML Studio',
  description: 'Collaborative ML project management platform with team workspaces, version control, and project tracking capabilities',
  keywords: [
    'ML projects',
    'project management',
    'collaborative workspace',
    'team management',
    'project tracking',
    'ML collaboration',
    'version control',
    'project portfolio'
  ],
  authors: [{ name: 'Phantom ML Studio Project Team' }],
  category: 'Project Management',
  openGraph: {
    title: 'ML Project Management Platform',
    description: 'Collaborative workspace for machine learning projects',
    type: 'website',
    locale: 'en_US',
    siteName: 'Phantom ML Studio'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ML Project Management',
    description: 'Collaborative ML project workspace'
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
    canonical: '/projects'
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
 * Performance configuration for project management
 * Dynamic rendering for collaborative features
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Real-time collaboration updates
export const runtime = 'nodejs';

interface ProjectsLayoutProps {
  children: React.ReactNode;
}

/**
 * Projects Layout Component
 * 
 * Server component that provides structure for project pages with:
 * - Collaborative workspace interface
 * - Project tracking and management
 * - Team member coordination
 * - Version control integration
 * - Real-time project updates
 */
export default function ProjectsLayout({ children }: ProjectsLayoutProps) {
  return (
    <>
      {children}
    </>
  );
}