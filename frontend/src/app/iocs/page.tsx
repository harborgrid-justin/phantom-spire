'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../lib/api';
import { IOC, CreateIOCRequest } from '../../types/api';

export default function IOCsPage() {
  const [iocs, setIOCs] = useState<IOC[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newIOC, setNewIOC] = useState<CreateIOCRequest>({
    type: '',
    value: '',
    description: '',
    severity: 'medium',
    tags: [],
  });

  useEffect(() => {
    fetchIOCs();
  }, []);

  const fetchIOCs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getIOCs();
      if (response.data && typeof response.data === 'object' && response.data !== null && 'data' in response.data && Array.isArray((response.data as any).data)) {
        setIOCs((response.data as any).data);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch IOCs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIOC = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiClient.createIOC(newIOC);
      if (response.data) {
        setIOCs([...iocs, response.data]);
        setNewIOC({
          type: '',
          value: '',
          description: '',
          severity: 'medium',
          tags: [],
        });
        setShowCreateForm(false);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create IOC');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-800 bg-red-100';
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading IOCs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Indicators of Compromise (IOCs)
          </h1>
          <p className="text-gray-600">
            Manage and monitor threat indicators
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add New IOC
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
          <br />
          <small>Make sure the backend server is running and accessible.</small>
        </div>
      )}

      {/* Create IOC Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Create New IOC</h2>
            <form onSubmit={handleCreateIOC}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={newIOC.type}
                  onChange={(e) => setNewIOC({ ...newIOC, type: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select type</option>
                  <option value="ip">IP Address</option>
                  <option value="domain">Domain</option>
                  <option value="url">URL</option>
                  <option value="hash">File Hash</option>
                  <option value="email">Email</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Value
                </label>
                <input
                  type="text"
                  value={newIOC.value}
                  onChange={(e) => setNewIOC({ ...newIOC, value: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newIOC.description}
                  onChange={(e) => setNewIOC({ ...newIOC, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity
                </label>
                <select
                  value={newIOC.severity}
                  onChange={(e) => setNewIOC({ ...newIOC, severity: e.target.value as 'low' | 'medium' | 'high' | 'critical' })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create IOC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IOCs List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {iocs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-medium mb-2">No IOCs Found</h3>
            <p>Start by adding your first indicator of compromise.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {iocs.map((ioc) => (
                  <tr key={ioc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {ioc.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {ioc.value}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(ioc.severity)}`}>
                        {ioc.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {ioc.description || 'No description'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(ioc.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
