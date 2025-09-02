'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../lib/api';
import { Issue, CreateIssueRequest } from '../../types/api';

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newIssue, setNewIssue] = useState<CreateIssueRequest>({
    title: '',
    description: '',
    priority: 'medium',
    assignedTo: '',
    tags: [],
  });

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getIssues();
      if (response.data && Array.isArray(response.data)) {
        setIssues(response.data);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch issues');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiClient.createIssue(newIssue);
      if (response.data) {
        setIssues([...issues, response.data]);
        setNewIssue({
          title: '',
          description: '',
          priority: 'medium',
          assignedTo: '',
          tags: [],
        });
        setShowCreateForm(false);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create issue');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-800 bg-red-100';
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-blue-800 bg-blue-100';
      case 'in-progress': return 'text-yellow-800 bg-yellow-100';
      case 'resolved': return 'text-green-800 bg-green-100';
      case 'closed': return 'text-gray-800 bg-gray-100';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading issues...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Security Issues
          </h1>
          <p className="text-gray-600">
            Track and manage security incidents and issues
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create New Issue
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
          <br />
          <small>Make sure the backend server is running and accessible.</small>
        </div>
      )}

      {/* Create Issue Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Create New Issue</h2>
            <form onSubmit={handleCreateIssue}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newIssue.title}
                  onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newIssue.description}
                  onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={4}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={newIssue.priority}
                  onChange={(e) => setNewIssue({ ...newIssue, priority: e.target.value as 'low' | 'medium' | 'high' | 'critical' })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned To (optional)
                </label>
                <input
                  type="text"
                  value={newIssue.assignedTo}
                  onChange={(e) => setNewIssue({ ...newIssue, assignedTo: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter assignee name or email"
                />
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
                  Create Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issues Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-blue-600">
            {issues.filter(issue => issue.status === 'open').length}
          </div>
          <div className="text-sm text-gray-600">Open Issues</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-yellow-600">
            {issues.filter(issue => issue.status === 'in-progress').length}
          </div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-red-600">
            {issues.filter(issue => issue.priority === 'critical' || issue.priority === 'high').length}
          </div>
          <div className="text-sm text-gray-600">High Priority</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-green-600">
            {issues.filter(issue => issue.status === 'resolved' || issue.status === 'closed').length}
          </div>
          <div className="text-sm text-gray-600">Resolved</div>
        </div>
      </div>

      {/* Issues List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {issues.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-4">🚨</div>
            <h3 className="text-lg font-medium mb-2">No Issues Found</h3>
            <p>Start by creating your first security issue.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {issues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{issue.title}</div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {issue.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                        {issue.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(issue.priority)}`}>
                        {issue.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {issue.assignedTo || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(issue.updatedAt).toLocaleDateString()}
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
