'use client';

import { useEffect, useState } from 'react';

interface UserOnboardingJourneyData {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'inactive' | 'suspended' | 'draft';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
  description?: string;
  metadata?: Record<string, any>;
}

export default function UserOnboardingJourneyPage() {
  const [data, setData] = useState<UserOnboardingJourneyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user-management/user-onboarding-journey');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const result = await response.json();
      setData(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    // Implementation for creating new item
    console.log('Create new item');
  };

  const handleEdit = async (id: string) => {
    // Implementation for editing item
    console.log('Edit item:', id);
  };

  const handleDelete = async (id: string) => {
    // Implementation for deleting item
    console.log('Delete item:', id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <button 
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚀 User Onboarding Journey
          </h1>
          <p className="text-gray-600">Personalized user onboarding and training workflows</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Create New
        </button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🚀</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Data Available</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first item.</p>
          <button
            onClick={handleCreate}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Create First Item
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  item.status === 'active' ? 'bg-green-100 text-green-800' :
                  item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  item.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {item.status}
                </span>
              </div>
              
              {item.description && (
                <p className="text-gray-600 mb-4">{item.description}</p>
              )}
              
              <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                <span className={`px-2 py-1 rounded ${
                  item.priority === 'critical' ? 'bg-red-100 text-red-800' :
                  item.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {item.priority}
                </span>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(item.id)}
                  className="flex-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
