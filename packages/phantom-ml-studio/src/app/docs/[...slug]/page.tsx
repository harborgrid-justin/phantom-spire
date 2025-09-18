/**
 * Documentation Catch-All Page - SERVER COMPONENT
 * Handles all documentation routes with catch-all segments
 *
 * IMPORTANT: This component demonstrates catch-all route patterns
 * where params.slug is always an array of strings.
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface PageProps {
  params: { slug: string[] };
  searchParams: { [key: string]: string | string[] | undefined };
}

// Generate metadata based on the slug path
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const path = params.slug.join('/');

  return {
    title: `Documentation - ${path} - Phantom ML Studio`,
    description: `Documentation page for ${path} in the ML platform`,
  };
}

// Optional: Generate static params for known documentation paths
export async function generateStaticParams() {
  // In a real application, this would fetch available documentation paths
  return [
    { slug: ['getting-started'] },
    { slug: ['api', 'reference'] },
    { slug: ['guides', 'deployment'] },
    { slug: ['tutorials', 'model-training'] },
  ];
}

export default function DocumentationPage({ params }: PageProps): JSX.Element {
  const slug = params.slug;

  // Validate slug array - catch-all segments are always arrays
  if (!Array.isArray(slug) || slug.length === 0) {
    notFound();
  }

  // Build the full path
  const path = slug.join('/');
  const breadcrumbs = ['docs', ...slug];

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && <span className="mx-2">/</span>}
                <span className={index === breadcrumbs.length - 1 ? 'text-gray-900 font-medium' : ''}>
                  {crumb}
                </span>
              </li>
            ))}
          </ol>
        </nav>

        <h1 className="text-3xl font-bold mb-6">Documentation</h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Path Information</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Path
                </label>
                <code className="block bg-gray-100 p-2 rounded text-sm font-mono">
                  /docs/{path}
                </code>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug Segments (Array)
                </label>
                <code className="block bg-gray-100 p-2 rounded text-sm font-mono">
                  {JSON.stringify(slug, null, 2)}
                </code>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Segment Count
                </label>
                <span className="text-lg font-semibold">{slug.length}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-green-50 rounded-md">
            <h3 className="text-sm font-medium text-green-800 mb-2">
              Catch-All Route Information
            </h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Route pattern: /docs/[...slug]</li>
              <li>• Parameter: {`{slug: [${slug.map(s => `"${s}"`).join(', ')}]}`}</li>
              <li>• Component type: Server Component</li>
              <li>• Static generation: ✓ Enabled</li>
              <li>• Metadata generation: ✓ Enabled</li>
            </ul>
          </div>

          {/* Example content based on path */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Content Preview</h2>
            <div className="prose max-w-none">
              {path === 'getting-started' && (
                <div>
                  <h3>Getting Started with Phantom ML Studio</h3>
                  <p>Welcome to the ML platform documentation...</p>
                </div>
              )}
              {path.startsWith('api/') && (
                <div>
                  <h3>API Reference</h3>
                  <p>API documentation for {slug[1] || 'general'} endpoints...</p>
                </div>
              )}
              {path.startsWith('guides/') && (
                <div>
                  <h3>Guides: {slug[1]?.replace('-', ' ') || 'General'}</h3>
                  <p>Step-by-step guides for {slug[1] || 'using the platform'}...</p>
                </div>
              )}
              {!['getting-started', 'api', 'guides'].some(prefix =>
                path === prefix || path.startsWith(prefix + '/')) && (
                <div>
                  <h3>Documentation</h3>
                  <p>This page would contain documentation for: <strong>{path}</strong></p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}