'use client';

import { useEffect, useState } from 'react';
import { useServicePage } from '../../../lib/business-logic';

interface TaskAuditTrailData {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'completed' | 'failed' | 'paused';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
  category: string;
  description?: string;
  progress?: number;
  assignedTo?: string;
  estimatedDuration?: number;
  actualDuration?: number;
}

export default function TaskAuditTrailPage() {
  const [data, setData] = useState<TaskAuditTrailData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const {
    notifications,
    addNotification,
    removeNotification,
  } = useServicePage('task-management-task-audit-trail');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration - replace with actual API call
      const mockData: TaskAuditTrailData[] = [
        {
          id: '1',
          name: 'Sample Task Audit Trail Item 1',
          status: 'active',
          priority: 'high',
          category: 'governance',
          description: 'Comprehensive audit trail and compliance tracking',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          progress: 75,
          assignedTo: 'security-team',
          estimatedDuration: 120,
          actualDuration: 90
        },
        {
          id: '2',
          name: 'Sample Task Audit Trail Item 2',
          status: 'pending',
          priority: 'medium',
          category: 'governance',
          description: 'Comprehensive audit trail and compliance tracking',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          progress: 30,
          assignedTo: 'operations-team',
          estimatedDuration: 180,
          actualDuration: 0
        },
        {
          id: '3',
          name: 'Sample Task Audit Trail Item 3',
          status: 'completed',
          priority: 'low',
          category: 'governance',
          description: 'Comprehensive audit trail and compliance tracking',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          progress: 100,
          assignedTo: 'analyst-team',
          estimatedDuration: 60,
          actualDuration: 55
        }
      ];
      
      setData(mockData);
      addNotification('success', 'Task Audit Trail data loaded successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      addNotification('error', 'Failed to load Task Audit Trail data');
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
      case 'paused': return 'bg-gray-100 text-gray-800';
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

  const filteredData = selectedFilter === 'all' 
    ? data 
    : data.filter(item => item.status === selectedFilter);

  const statusOptions = ['all', ...Array.from(new Set(data.map(item => item.status)))];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading task audit trail...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📋 Task Audit Trail
          </h1>
          <p className="text-gray-600">
            Comprehensive audit trail and compliance tracking
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
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
          <div className="text-2xl font-bold text-blue-600">
            {data.length}
          </div>
          <div className="text-sm text-gray-600">Total Items</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-green-600">
            {data.filter(item => item.status === 'active').length}
          </div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-yellow-600">
            {data.filter(item => item.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-purple-600">
            {data.filter(item => item.priority === 'high' || item.priority === 'critical').length}
          </div>
          <div className="text-sm text-gray-600">High Priority</div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex space-x-4 mb-6">
        {statusOptions.map(status => (
          <button
            key={status}
            onClick={() => setSelectedFilter(status)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedFilter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Data Grid */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Task Audit Trail Items</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredData.map((item) => (
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
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  )}
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                    {item.assignedTo && <span>Assigned: {item.assignedTo}</span>}
                    {item.progress !== undefined && (
                      <span>Progress: {item.progress}%</span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors">
                    View
                  </button>
                  <button className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors">
                    Edit
                  </button>
                  <button className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No items found</div>
          <div className="text-gray-400 text-sm">Get started by adding your first item</div>
        </div>
      )}

      {/* Notifications */}
      {notifications.map((notification) => (
        <div key={notification.id} className="fixed bottom-4 right-4 z-50">
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