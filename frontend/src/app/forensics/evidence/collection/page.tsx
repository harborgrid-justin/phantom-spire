'use client';

import { useEffect, useState } from 'react';
import { useServicePage } from '../../../../lib/business-logic';

export default function EvidenceCollectionPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    notifications,
    addNotification,
    removeNotification,
    execute,
    refresh
  } = useServicePage('evidence-collection');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await execute('getEvidenceCollection');
      
      if (response.success && response.data) {
        setData(response.data.recentCollections || []);
        addNotification('success', 'Evidence collection data loaded successfully');
      } else {
        // Fallback to mock data
        const mockData = [
          {
            id: 'col_001',
            deviceType: 'Laptop - Dell XPS 13',
            location: 'Office 3B - Desk 42',
            examiner: 'John Doe',
            status: 'completed',
            timestamp: new Date(),
            evidence: {
              hash: 'sha256:abcd1234ef567890...',
              size: '512GB',
              preservationMethod: 'bit-by-bit copy'
            }
          },
          {
            id: 'col_002',
            deviceType: 'Mobile Phone - iPhone 13',
            location: 'Evidence Locker A-15',
            examiner: 'Jane Smith',
            status: 'in_progress',
            timestamp: new Date(),
            evidence: {
              hash: 'pending',
              size: '128GB',
              preservationMethod: 'logical extraction'
            }
          }
        ];
        setData(mockData);
        addNotification('info', 'Using demonstration data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      addNotification('error', 'Failed to load evidence collection data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const startNewCollection = () => {
    addNotification('info', 'New evidence collection workflow initiated');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading evidence collection data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📦 Evidence Collection
          </h1>
          <p className="text-gray-600">
            Digital evidence acquisition and preservation management
          </p>
        </div>
        <button 
          onClick={startNewCollection}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Start New Collection
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
          <div className="text-sm text-gray-600">Active Collections</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-green-600">
            {data.filter(item => item.status === 'completed').length}
          </div>
          <div className="text-sm text-gray-600">Completed Today</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-yellow-600">
            {data.filter(item => item.status === 'in_progress').length}
          </div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-purple-600">
            2.3TB
          </div>
          <div className="text-sm text-gray-600">Data Collected</div>
        </div>
      </div>

      {/* Collection History */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Recent Evidence Collections</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {data.map((collection) => (
            <div key={collection.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-medium text-gray-900">{collection.deviceType}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(collection.status)}`}>
                      {collection.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <div>Location: {collection.location}</div>
                    <div>Examiner: {collection.examiner}</div>
                    <div>Collected: {new Date(collection.timestamp).toLocaleString()}</div>
                  </div>
                  {collection.evidence && (
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      <div>Size: {collection.evidence.size}</div>
                      <div>Method: {collection.evidence.preservationMethod}</div>
                      <div>Hash: {collection.evidence.hash}</div>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors">
                    View Details
                  </button>
                  <button className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors">
                    Chain of Custody
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {data.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No evidence collections found</div>
          <div className="text-gray-400 text-sm">Start your first evidence collection to begin</div>
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