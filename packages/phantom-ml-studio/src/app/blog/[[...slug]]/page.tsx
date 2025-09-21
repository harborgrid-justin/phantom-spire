/**
 * Blog Optional Catch-All Page - SERVER COMPONENT
 * Handles blog routes with optional catch-all segments
 *
 * IMPORTANT: This component demonstrates optional catch-all route patterns
 * where params.slug can be undefined (for /blog) or an array of strings.
 */

import { Metadata } from 'next';
import Link from 'next/link';

interface PageProps {
  params: { slug?: string[] };
  searchParams: { [key: string]: string | string[] | undefined };
}

// Generate metadata based on the slug path
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const path = slug ? slug.join('/') : '';
  const title = path ? `Blog - ${path}` : 'Blog';

  return {
    title: `${title} - Phantom ML Studio`,
    description: path
      ? `Blog post: ${path} in the ML platform`
      : 'Blog posts about machine learning and AI',
  };
}

// Optional: Generate static params for known blog paths
export async function generateStaticParams() {
  // In a real application, this would fetch available blog posts
  return [
    { slug: undefined }, // This handles /blog
    { slug: ['2024', 'machine-learning-trends'] },
    { slug: ['2024', 'ai', 'deployment'] },
    { slug: ['tutorials', 'getting-started'] },
  ];
}

export default function BlogPage({ params }: PageProps): JSX.Element {
  const slug = params.slug;

  // Handle the root blog page (when slug is undefined)
  if (!slug) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Blog</h1>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Latest Posts</h2>

            <div className="space-y-4">
              <article className="border-b pb-4">
                <h3 className="text-lg font-medium mb-2">
                  <Link href="/blog/2024/machine-learning-trends" className="text-blue-600 hover:underline">
                    Machine Learning Trends in 2024
                  </Link>
                </h3>
                <p className="text-gray-600 text-sm mb-2">Published: January 15, 2024</p>
                <p className="text-gray-700">
                  Exploring the latest trends and developments in machine learning...
                </p>
              </article>

              <article className="border-b pb-4">
                <h3 className="text-lg font-medium mb-2">
                  <Link href="/blog/tutorials/getting-started" className="text-blue-600 hover:underline">
                    Getting Started with ML Platform
                  </Link>
                </h3>
                <p className="text-gray-600 text-sm mb-2">Published: January 10, 2024</p>
                <p className="text-gray-700">
                  A comprehensive guide to getting started with our ML platform...
                </p>
              </article>
            </div>

            <div className="mt-6 p-4 bg-purple-50 rounded-md">
              <h3 className="text-sm font-medium text-purple-800 mb-2">
                Optional Catch-All Route Information
              </h3>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Route pattern: /blog/[[...slug]]</li>
                <li>• Current path: /blog (root)</li>
                <li>• Parameter: {`{slug: undefined}`}</li>
                <li>• Component type: Server Component</li>
                <li>• Static generation: ✓ Enabled</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Handle specific blog post paths
  const path = slug.join('/');
  const breadcrumbs = ['blog', ...slug];

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

        <h1 className="text-3xl font-bold mb-6">Blog Post</h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Path Information</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Path
                </label>
                <code className="block bg-gray-100 p-2 rounded text-sm font-mono">
                  /blog/{path}
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

          <div className="mt-6 p-4 bg-purple-50 rounded-md">
            <h3 className="text-sm font-medium text-purple-800 mb-2">
              Optional Catch-All Route Information
            </h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Route pattern: /blog/[[...slug]]</li>
              <li>• Parameter: {`{slug: [${slug.map(s => `"${s}"`).join(', ')}]}`}</li>
              <li>• Component type: Server Component</li>
              <li>• Static generation: ✓ Enabled</li>
              <li>• Metadata generation: ✓ Enabled</li>
            </ul>
          </div>

          {/* Example content based on path */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Article Content</h2>
            <div className="prose max-w-none">
              {path.includes('machine-learning-trends') && (
                <div>
                  <h3>Machine Learning Trends in 2024</h3>
                  <p>This article covers the latest trends in machine learning...</p>
                </div>
              )}
              {path.includes('tutorials') && (
                <div>
                  <h3>Tutorial: {slug[slug.length - 1]?.replace('-', ' ')}</h3>
                  <p>Step-by-step tutorial for {slug[slug.length - 1]}...</p>
                </div>
              )}
              {path.includes('ai') && (
                <div>
                  <h3>AI Article: {slug[slug.length - 1]?.replace('-', ' ')}</h3>
                  <p>In-depth discussion about AI topic: {slug[slug.length - 1]}...</p>
                </div>
              )}
              {!path.includes('machine-learning-trends') &&
               !path.includes('tutorials') &&
               !path.includes('ai') && (
                <div>
                  <h3>Blog Post</h3>
                  <p>This blog post would contain content for: <strong>{path}</strong></p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}