'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../lib/api';
import { Organization } from '../../types/api';

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getOrganizations();
      if (response.data && typeof response.data === 'object' && response.data !== null && 'data' in response.data && Array.isArray((response.data as any).data)) {
        setOrganizations((response.data as any).data);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch organizations');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading organizations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Organizations
          </h1>
          <p className="text-gray-600">
            Manage organizational data and relationships
          </p>
        </div>
        <div className="flex space-x-2">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            Import Organizations
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Add Organization
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
          <br />
          <small>Make sure the backend server is running and accessible.</small>
        </div>
      )}

      {/* Organizations Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="text-3xl mr-4">🏢</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Total Organizations</h3>
              <p className="text-2xl font-bold text-blue-600">{organizations.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="text-3xl mr-4">📊</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Organization Types</h3>
              <p className="text-2xl font-bold text-green-600">
                {new Set(organizations.map(org => org.type)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="text-3xl mr-4">📧</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">With Contact Info</h3>
              <p className="text-2xl font-bold text-purple-600">
                {organizations.filter(org => org.contactEmail).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Organizations List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {organizations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-4">🏢</div>
            <h3 className="text-lg font-medium mb-2">No Organizations Found</h3>
            <p>Start by adding your first organization or importing organization data.</p>
            <div className="mt-4 space-x-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Add Organization
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Import Data
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Organizations Grid View */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {organizations.map((org) => (
                  <div key={org.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg mb-1">{org.name}</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {org.type}
                        </span>
                      </div>
                      <div className="text-2xl">🏢</div>
                    </div>
                    
                    {org.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {org.description}
                      </p>
                    )}
                    
                    <div className="space-y-2 text-sm">
                      {org.contactEmail && (
                        <div className="flex items-center text-gray-600">
                          <span className="mr-2">📧</span>
                          <a href={`mailto:${org.contactEmail}`} className="text-blue-600 hover:underline">
                            {org.contactEmail}
                          </a>
                        </div>
                      )}
                      
                      <div className="flex items-center text-gray-500 text-xs">
                        <span className="mr-2">📅</span>
                        Created: {new Date(org.createdAt).toLocaleDateString()}
                      </div>
                      
                      <div className="flex items-center text-gray-500 text-xs">
                        <span className="mr-2">🔄</span>
                        Updated: {new Date(org.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="flex space-x-2">
                        <button className="flex-1 text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors">
                          View Details
                        </button>
                        <button className="flex-1 text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors">
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Organizations Table View (Alternative) */}
            <div className="hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {organizations.map((org) => (
                      <tr key={org.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{org.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {org.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {org.contactEmail ? (
                            <a href={`mailto:${org.contactEmail}`} className="text-blue-600 hover:underline">
                              {org.contactEmail}
                            </a>
                          ) : (
                            'No contact'
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {org.description || 'No description'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(org.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">
                            View
                          </button>
                          <button className="text-indigo-600 hover:text-indigo-900">
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Organization Types Summary */}
      {organizations.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Organization Types</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from(new Set(organizations.map(org => org.type))).map((type) => {
              const count = organizations.filter(org => org.type === type).length;
              return (
                <div key={type} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{count}</div>
                  <div className="text-sm text-gray-600 capitalize">{type}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
