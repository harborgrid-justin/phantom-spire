import type { Metadata, Viewport } from 'next';

/**
 * Explainable AI Layout - Server Component Configuration
 * 
 * Provides server-side configuration for the explainable AI module
 * with model interpretability, feature importance analysis, and transparency tools.
 */

export const metadata: Metadata = {
  title: 'Explainable AI | Phantom ML Studio',
  description: 'Advanced model interpretability platform with SHAP analysis, LIME explanations, and comprehensive AI transparency tools',
  keywords: [
    'explainable AI',
    'XAI',
    'model interpretability',
    'AI transparency',
    'SHAP analysis',
    'LIME explanations',
    'feature importance',
    'model explainability'
  ],
  authors: [{ name: 'Phantom ML Studio XAI Team' }],
  category: 'AI Interpretability',
  openGraph: {
    title: 'Explainable AI Platform',
    description: 'Comprehensive model interpretability and AI transparency tools',
    type: 'website',
    locale: 'en_US',
    siteName: 'Phantom ML Studio'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Explainable AI',
    description: 'Model interpretability and AI transparency platform'
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
    canonical: '/explainableAi'
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
 * Performance configuration for explainability analysis
 * Dynamic rendering for interactive explanation generation
 */
export const dynamic = 'auto';
export const revalidate = 300; // Cache explanations for 5 minutes
export const runtime = 'nodejs';

interface ExplainableAiLayoutProps {
  children: React.ReactNode;
}

/**
 * Explainable AI Layout Component
 * 
 * Server component that provides structure for XAI pages with:
 * - Interactive model explanation interface
 * - SHAP and LIME visualization
 * - Feature importance analysis
 * - Transparency reporting tools
 * - Regulatory compliance features
 */
export default function ExplainableAiLayout({ children }: ExplainableAiLayoutProps) {
  return (
    <>
      {children}
    </>
  );
}