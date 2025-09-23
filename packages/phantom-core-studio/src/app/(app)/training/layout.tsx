import type { Metadata, Viewport } from 'next';

/**
 * Training Layout - Server Component Configuration
 * 
 * Provides server-side configuration for the model training module
 * with distributed training, hyperparameter optimization, and training monitoring.
 */

export const metadata: Metadata = {
  title: 'Training | Phantom ML Studio',
  description: 'Enterprise model training platform with distributed training, hyperparameter optimization, and real-time training monitoring',
  keywords: [
    'model training',
    'distributed training',
    'hyperparameter optimization',
    'training monitoring',
    'GPU training',
    'neural network training',
    'deep learning',
    'ML training pipeline'
  ],
  authors: [{ name: 'Phantom ML Studio Training Team' }],
  category: 'Model Training',
  openGraph: {
    title: 'Enterprise ML Training Platform',
    description: 'Distributed training with advanced optimization and monitoring',
    type: 'website',
    locale: 'en_US',
    siteName: 'Phantom ML Studio'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ML Training Platform',
    description: 'Enterprise-grade model training and optimization'
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
    canonical: '/training'
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
 * Performance configuration for training monitoring
 * Real-time updates for training progress and metrics
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Real-time training metrics
export const runtime = 'nodejs';

interface TrainingLayoutProps {
  children: React.ReactNode;
}

/**
 * Training Layout Component
 * 
 * Server component that provides structure for training pages with:
 * - Real-time training progress monitoring
 * - Distributed training management
 * - Hyperparameter optimization interface
 * - Resource utilization tracking
 * - Training job scheduling
 */
export default function TrainingLayout({ children }: TrainingLayoutProps) {
  return (
    <>
      {children}
    </>
  );
}