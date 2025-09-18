/**
 * User Profile Page - SERVER COMPONENT
 * Dynamic route for individual user profiles
 *
 * IMPORTANT: This component receives params from the dynamic [id] segment
 * and should handle parameter validation and error cases.
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface PageProps {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

// Generate metadata for the user page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const userId = params.id;

  return {
    title: `User Profile - ${userId} - Phantom ML Studio`,
    description: `User profile page for user ${userId} in the ML platform`,
  };
}

// Main page component
export default function UserProfilePage({ params }: PageProps): JSX.Element {
  const userId = params.id;

  // Validate the user ID format (basic validation)
  if (!userId || userId.length < 1) {
    notFound();
  }

  // In a real application, you would fetch user data here
  // const user = await getUserById(userId);
  // if (!user) notFound();

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">User Profile</h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User ID
            </label>
            <div className="text-lg font-semibold text-gray-900">
              {userId}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Status
            </label>
            <div className="text-sm text-gray-600">
              This is a dynamic route demonstration. In a real application,
              user data would be fetched based on the ID parameter.
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Dynamic Route Information
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Route pattern: /users/[id]</li>
              <li>• Parameter: {`{id: "${userId}"}`}</li>
              <li>• Component type: Server Component</li>
              <li>• Metadata generation: ✓ Enabled</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}