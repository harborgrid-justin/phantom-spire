'use client';

import { useEffect, useState } from 'react';
import { useServicePage } from '../../../../lib/business-logic';

export default function ChangeManagementPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    notifications,
    addNotification,
    removeNotification,
  } = useServicePage('vendor-risk-operational-risk-change-management');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Simulate API call to vendor risk endpoint
      const response = await fetch(`/api/vendor-risk/${page.category}/${page.endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const result = await response.json();
      setData(result.data || {
        summary: {
          total: Math.floor(Math.random() * 100) + 50,
          active: Math.floor(Math.random() * 50) + 20,
          pending: Math.floor(Math.random() * 20) + 5,
          critical: Math.floor(Math.random() * 10) + 1
        },
        items: Array.from({ length: 10 }, (_, i) => ({
          id: `item-${i + 1}`,
          name: `Sample ${page.title.replace(/[^a-zA-Z ]/g, '')} Item ${i + 1}`,
          description: `Description for ${page.description.toLowerCase()}`,
          status: ['active', 'pending', 'critical', 'completed'][Math.floor(Math.random() * 4)],
          priority: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
          lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          riskScore: Math.floor(Math.random() * 100),
          complianceStatus: Math.random() > 0.3 ? 'compliant' : 'non-compliant'
        })),
        recentActivity: Array.from({ length: 5 }, (_, i) => ({
          event: `Recent activity event ${i + 1}`,
          action: `Action performed on ${page.title.replace(/[^a-zA-Z ]/g, '')}`,
          timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
          user: `User ${i + 1}`
        })),
        lastUpdated: new Date().toISOString()
      });
      
      addNotification('success', 'Data loaded successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      addNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-900">Loading 🔄 Change Management...</div>
          <div className="text-sm text-gray-600 mt-2">Please wait while we fetch the latest data</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={loadData}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <span className="mr-3">🔄</span>
                🔄 Change Management
              </h1>
              <p className="mt-2 text-gray-600">
                Vendor change control and impact management
              </p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={loadData}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh Data
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="text-3xl font-bold text-blue-600">{data?.summary?.total || 0}</div>
              <div className="ml-auto text-2xl">📊</div>
            </div>
            <div className="text-gray-600 mt-2">Total Items</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="text-3xl font-bold text-green-600">{data?.summary?.active || 0}</div>
              <div className="ml-auto text-2xl">✅</div>
            </div>
            <div className="text-gray-600 mt-2">Active</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="text-3xl font-bold text-yellow-600">{data?.summary?.pending || 0}</div>
              <div className="ml-auto text-2xl">⏳</div>
            </div>
            <div className="text-gray-600 mt-2">Pending</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="text-3xl font-bold text-red-600">{data?.summary?.critical || 0}</div>
              <div className="ml-auto text-2xl">🚨</div>
            </div>
            <div className="text-gray-600 mt-2">Critical</div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
              <div className="space-y-4">
                {data?.items?.length > 0 ? (
                  data.items.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.name || item.title || `Item ${index + 1}`}</h3>
                          <p className="text-sm text-gray-600 mt-1">{item.description || 'No description available'}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-gray-500">
                              Risk Score: <span className={`font-medium ${item.riskScore > 70 ? 'text-red-600' : item.riskScore > 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                                {item.riskScore}
                              </span>
                            </span>
                            <span className="text-xs text-gray-500">
                              Last Updated: {new Date(item.lastUpdated).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.status === 'active' ? 'bg-green-100 text-green-800' :
                            item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            item.status === 'critical' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.status || 'Unknown'}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.complianceStatus === 'compliant' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {item.complianceStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-500 text-lg mb-2">No data available</div>
                    <button 
                      onClick={loadData}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Refresh to load data
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="text-gray-900">{data?.lastUpdated ? new Date(data.lastUpdated).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-green-600">Operational</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Health:</span>
                  <span className="text-green-600">Good</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Compliance:</span>
                  <span className="text-blue-600">
                    {data?.items ? Math.round((data.items.filter(item => item.complianceStatus === 'compliant').length / data.items.length) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {data?.recentActivity?.length > 0 ? (
                  data.recentActivity.slice(0, 5).map((activity, index) => (
                    <div key={index} className="text-sm border-l-2 border-blue-200 pl-3">
                      <div className="text-gray-900 font-medium">{activity.action || activity.event}</div>
                      <div className="text-gray-500 text-xs mt-1">
                        {activity.user} • {new Date(activity.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-sm">No recent activity</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {notifications.map((notification) => (
          <div key={notification.id} className="max-w-sm w-full">
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
                  className="ml-4 text-white hover:text-gray-200 font-bold"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}