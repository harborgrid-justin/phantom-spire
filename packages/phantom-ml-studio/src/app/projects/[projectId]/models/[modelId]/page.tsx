/**
 * Project Model Detail Page - SERVER COMPONENT
 * Nested dynamic route for individual models within projects
 *
 * IMPORTANT: This component demonstrates multilevel dynamic segments
 * with proper parameter handling and validation.
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ projectId: string; modelId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Generate metadata for the model page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { projectId, modelId } = resolvedParams;

  return {
    title: `Model ${modelId} - Project ${projectId} - Phantom ML Studio`,
    description: `Model details for ${modelId} in project ${projectId}`,
  };
}

// Optional: Generate static params for known project/model combinations
export async function generateStaticParams() {
  // In a real application, this would fetch available project/model combinations
  return [
    { projectId: 'sentiment-analysis', modelId: 'bert-v1' },
    { projectId: 'image-classification', modelId: 'resnet-50' },
    { projectId: 'recommendation', modelId: 'collaborative-filter' },
  ];
}

export default async function ProjectModelPage({ params }: PageProps): Promise<JSX.Element> {
  const resolvedParams = await params;
  const { projectId, modelId } = resolvedParams;

  // Validate parameters
  if (!projectId || !modelId) {
    notFound();
  }

  // Basic validation for parameter format
  if (projectId.length < 1 || modelId.length < 1) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>projects</li>
            <span className="mx-2">/</span>
            <li className="text-blue-600">
              <Link href={`/projects/${projectId}`} className="hover:underline">
                {projectId}
              </Link>
            </li>
            <span className="mx-2">/</span>
            <li>models</li>
            <span className="mx-2">/</span>
            <li className="text-gray-900 font-medium">{modelId}</li>
          </ol>
        </nav>

        <h1 className="text-3xl font-bold mb-6">Model Details</h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Model Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model ID
                  </label>
                  <div className="text-lg font-semibold text-gray-900">
                    {modelId}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project ID
                  </label>
                  <div className="text-lg font-semibold text-gray-900">
                    {projectId}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Model Metrics</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Accuracy:</span>
                  <span className="text-sm font-medium">94.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Precision:</span>
                  <span className="text-sm font-medium">92.8%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Recall:</span>
                  <span className="text-sm font-medium">93.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">F1 Score:</span>
                  <span className="text-sm font-medium">93.1%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-orange-50 rounded-md">
            <h3 className="text-sm font-medium text-orange-800 mb-2">
              Nested Dynamic Route Information
            </h3>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• Route pattern: /projects/[projectId]/models/[modelId]</li>
              <li>• Parameters: {`{projectId: "${projectId}", modelId: "${modelId}"}`}</li>
              <li>• Component type: Server Component</li>
              <li>• Static generation: ✓ Enabled</li>
              <li>• Metadata generation: ✓ Enabled</li>
              <li>• Parameter validation: ✓ Enabled</li>
            </ul>
          </div>

          {/* Example content based on model type */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Model Configuration</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
{`{
  "modelId": "${modelId}",
  "projectId": "${projectId}",
  "type": "${modelId.includes('bert') ? 'transformer' :
           modelId.includes('resnet') ? 'cnn' :
           modelId.includes('filter') ? 'collaborative-filtering' : 'unknown'}",
  "framework": "${modelId.includes('bert') ? 'pytorch' :
                modelId.includes('resnet') ? 'tensorflow' : 'custom'}",
  "version": "1.0.0",
  "parameters": {
    "learningRate": 0.001,
    "batchSize": 32,
    "epochs": 100
  }
}`}
              </pre>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex space-x-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Deploy Model
            </button>
            <button className="bg-gray-200 text-gray-900 px-4 py-2 rounded-md hover:bg-gray-300">
              Download Weights
            </button>
            <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
              Delete Model
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}