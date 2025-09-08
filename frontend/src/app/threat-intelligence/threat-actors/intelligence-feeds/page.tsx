'use client';

import { useState, useEffect } from 'react';
import { useServicePage } from '../../../../lib/business-logic';

export default function IntelligenceFeedsPage() {
  const { 
    data, 
    loading, 
    error, 
    connected, 
    execute, 
    stats,
    notifications,
    removeNotification 
  } = useServicePage('threat-intel-threat-actors-intelligence-feeds');

  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setRefreshing(true);
      await execute('get-data', { 
        endpoint: '/api/v1/threat-intelligence/threat-actors/intelligence-feeds',
        filter,
        search: searchTerm 
      });
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = async () => {
    try {
      await execute('export-data', { 
        endpoint: '/api/v1/threat-intelligence/threat-actors/intelligence-feeds/export',
        format: 'json'
      });
    } catch (err) {
      console.error('Failed to export data:', err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading Actor Intelligence Feeds...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Business Logic Status */}
      <div className="mb-4">
        <div className="flex items-center space-x-4 text-sm">
          <div className={`flex items-center ${connected ? 'text-green-600' : 'text-gray-500'}`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            {connected ? 'Actor Intelligence Feeds System Online' : 'Actor Intelligence Feeds System Offline'}
          </div>
          {stats && (
            <div className="text-gray-600">
              Total Requests: {stats?.totalRequests || 0}
            </div>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📡 Actor Intelligence Feeds</h1>
          <p className="text-gray-600 mt-2">Specialized intelligence feeds for threat actors</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={loadData}
            disabled={refreshing}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {refreshing ? 'Loading...' : 'Refresh Data'}
          </button>
          <button 
            onClick={handleExport}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Export Data
          </button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Items</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="critical">Critical</option>
          <option value="high">High Priority</option>
        </select>
        <button
          onClick={loadData}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Apply Filters
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <div className="flex items-center">
            <span className="text-red-500 mr-2">⚠️</span>
            {error}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Summary Cards */}
        <div className="lg:col-span-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{data?.summary?.total || 0}</div>
                  <div className="text-sm text-gray-600">Total Items</div>
                </div>
                <div className="text-blue-500 text-2xl">📡</div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{data?.summary?.active || 0}</div>
                  <div className="text-sm text-gray-600">Active</div>
                </div>
                <div className="text-green-500 text-2xl">✅</div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{data?.summary?.pending || 0}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="text-yellow-500 text-2xl">⏳</div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{data?.summary?.critical || 0}</div>
                  <div className="text-sm text-gray-600">Critical</div>
                </div>
                <div className="text-red-500 text-2xl">🚨</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Data Overview</h2>
              <span className="text-sm text-gray-500">
                Last updated: {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : 'Never'}
              </span>
            </div>
            
            <div className="space-y-4">
              {data?.items?.length > 0 ? (
                data.items.slice(0, 10).map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.name || item.title || `Item ${index + 1}`}</h3>
                        <p className="text-sm text-gray-600 mt-1">{item.description || item.summary || 'No description available'}</p>
                        {item.tags && (
                          <div className="flex items-center space-x-2 mt-2">
                            {item.tags.slice(0, 3).map((tag, tagIndex) => (
                              <span key={tagIndex} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        {item.confidence && (
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">{item.confidence}%</div>
                            <div className="text-xs text-gray-500">Confidence</div>
                          </div>
                        )}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.status === 'active' ? 'bg-green-100 text-green-800' :
                          item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          item.status === 'critical' ? 'bg-red-100 text-red-800' :
                          item.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status || item.severity || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-4xl mb-4">📡</div>
                  <div className="text-gray-500 text-lg mb-2">No data available</div>
                  <div className="text-gray-400 text-sm mb-4">Try adjusting your filters or refreshing the data</div>
                  <button 
                    onClick={loadData}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Refresh Data
                  </button>
                </div>
              )}
            </div>

            {data?.items?.length > 10 && (
              <div className="mt-6 text-center">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Load More ({data.items.length - 10} remaining)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Records:</span>
                <span className="text-gray-900 font-medium">{data?.stats?.totalRecords || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span className="text-gray-900 font-medium">
                  {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-green-600 font-medium">Operational</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Health:</span>
                <span className="text-green-600 font-medium">Good</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Uptime:</span>
                <span className="text-green-600 font-medium">99.9%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {data?.recentActivity?.length > 0 ? (
                data.recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="text-sm">
                    <div className="text-gray-900 font-medium">{activity.action || activity.event}</div>
                    <div className="text-gray-500">
                      {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Recent'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-sm">No recent activity</div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                Create New Item
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                Import Data
              </button>
              <button 
                onClick={handleExport}
                className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              >
                Export Data
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                Generate Report
              </button>
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
                <span className="text-sm font-medium">{notification.message}</span>
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
    </div>
  );
}