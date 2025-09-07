'use client';

import { useEffect, useState } from 'react';
import { useServicePage } from '../../../lib/business-logic';

export default function IncidentMetricsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    notifications,
    addNotification,
    removeNotification,
  } = useServicePage('incident-response-metrics');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockData = [
        {
          id: '1',
          name: 'Sample Item 1',
          status: 'active',
          createdAt: new Date().toISOString(),
          priority: 'high'
        },
        {
          id: '2',
          name: 'Sample Item 2',
          status: 'pending',
          createdAt: new Date().toISOString(),
          priority: 'medium'
        }
      ];
      
      setData(mockData);
      addNotification('success', 'Data loaded successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      addNotification('error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 IR Metrics
          </h1>
          <p className="text-gray-600">
            Track incident response performance metrics
          </p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Add New
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-blue-600">{data.length}</div>
          <div className="text-sm text-gray-600">Total Items</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-green-600">
            {data.filter(item => item.status === 'active').length}
          </div>
          <div className="text-sm text-gray-600">Active Items</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-yellow-600">
            {data.filter(item => item.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Pending Items</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-purple-600">
            {data.filter(item => item.priority === 'high' || item.priority === 'critical').length}
          </div>
          <div className="text-sm text-gray-600">High Priority</div>
        </div>
      </div>

      {/* Data Grid */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Items</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {data.map((item) => (
            <div key={item.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Created: {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors">
                    View
                  </button>
                  <button className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {data.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No items found</div>
          <div className="text-gray-400 text-sm">Get started by adding your first item</div>
        </div>
      )}

      {/* Notifications */}
      {notifications.map((notification) => (
        <div key={notification.id} className="fixed bottom-4 right-4 z-40">
          <div className={`p-4 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-500 text-white' :
            notification.type === 'error' ? 'bg-red-500 text-white' :
            notification.type === 'warning' ? 'bg-yellow-500 text-white' :
            'bg-blue-500 text-white'
          }`}>
            <div className="flex justify-between items-center">
              <span>{notification.message}</span>
              <button
                onClick={() => removeNotification(notification.id)}
                className="ml-4 text-white hover:text-gray-200"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
