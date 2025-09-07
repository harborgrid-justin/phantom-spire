'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api';
import { useServicePage } from '../../../lib/business-logic';
import { Evidence } from '../../../types/api';

interface IOCEvidence extends Evidence {
  iocType: 'ip' | 'domain' | 'hash' | 'url' | 'email';
  iocValue: string;
  confidence: number;
  firstSeen: string;
  lastSeen: string;
  sources: string[];
}

export default function IOCEvidencePage() {
  // Business Logic Integration
  const {
    loading: businessLoading,
    data: businessData,
    error: businessError,
    stats,
    connected,
    notifications,
    execute,
    refresh,
    addNotification,
    removeNotification
  } = useServicePage('evidence-ioc');

  const [evidence, setEvidence] = useState<IOCEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchIOCEvidence();
  }, [selectedType]);

  const fetchIOCEvidence = async () => {
    try {
      setLoading(true);
      
      // Use business logic first
      const businessResponse = await execute('getIOCEvidence', { type: selectedType });
      
      if (businessResponse.success && businessResponse.data) {
        setEvidence(businessResponse.data);
        addNotification('success', 'IOC Evidence loaded successfully via business logic');
      } else {
        // Fallback to direct API
        const response = await apiClient.getEvidence();
        if (response.data && typeof response.data === 'object' && response.data !== null && 'data' in response.data && Array.isArray((response.data as any).data)) {
          const iocEvidence = (response.data as any).data.filter((e: Evidence) => e.type === 'ioc_evidence');
          setEvidence(iocEvidence);
          addNotification('info', 'IOC Evidence loaded via direct API (business logic unavailable)');
        } else if (response.error) {
          setError(response.error);
          addNotification('error', `Failed to load IOC evidence: ${response.error}`);
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch IOC evidence';
      setError(errorMsg);
      addNotification('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvidence = evidence.filter(e => 
    searchTerm === '' || 
    e.iocValue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading IOC evidence...</div>
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
            {connected ? 'Business Logic Connected' : 'Business Logic Offline'}
          </div>
          {stats && (
            <div className="text-gray-600">
              Service Stats: {stats.totalRequests || 0} requests
            </div>
          )}
          <button
            onClick={refresh}
            className="text-blue-600 hover:text-blue-800"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">IOC Evidence Management</h1>
          <p className="text-gray-600 mt-2">Manage and analyze Indicators of Compromise evidence</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Add IOC Evidence
        </button>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IOC Type
            </label>
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Types</option>
              <option value="ip">IP Address</option>
              <option value="domain">Domain</option>
              <option value="hash">File Hash</option>
              <option value="url">URL</option>
              <option value="email">Email</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search IOCs
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by IOC value or description..."
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchIOCEvidence}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* IOC Evidence Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-blue-600">
            {filteredEvidence.length}
          </div>
          <div className="text-sm text-gray-600">Total IOCs</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-red-600">
            {filteredEvidence.filter(e => e.iocType === 'ip').length}
          </div>
          <div className="text-sm text-gray-600">IP Addresses</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-orange-600">
            {filteredEvidence.filter(e => e.iocType === 'domain').length}
          </div>
          <div className="text-sm text-gray-600">Domains</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-purple-600">
            {filteredEvidence.filter(e => e.iocType === 'hash').length}
          </div>
          <div className="text-sm text-gray-600">File Hashes</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-green-600">
            {filteredEvidence.filter(e => e.iocType === 'url').length}
          </div>
          <div className="text-sm text-gray-600">URLs</div>
        </div>
      </div>

      {/* IOC Evidence List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredEvidence.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-medium mb-2">No IOC Evidence Found</h3>
            <p>Start by adding your first IOC evidence or adjust your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IOC Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Confidence</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">First Seen</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sources</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEvidence.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.iocType === 'ip' ? 'bg-red-100 text-red-800' :
                        item.iocType === 'domain' ? 'bg-orange-100 text-orange-800' :
                        item.iocType === 'hash' ? 'bg-purple-100 text-purple-800' :
                        item.iocType === 'url' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {item.iocType?.toUpperCase() || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 break-all">
                        {item.iocValue || item.description.substring(0, 50) + '...'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${
                              (item.confidence || 50) >= 80 ? 'bg-green-500' :
                              (item.confidence || 50) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${item.confidence || 50}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{item.confidence || 50}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.firstSeen ? new Date(item.firstSeen).toLocaleDateString() : new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {item.sources?.length || 1} source{(item.sources?.length || 1) !== 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">View</button>
                        <button className="text-green-600 hover:text-green-900">Analyze</button>
                        <button className="text-red-600 hover:text-red-900">Flag</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Notifications */}
      {notifications && notifications.length > 0 && (
        <div className="fixed bottom-4 right-4 space-y-2">
          {notifications.map((notification, index) => (
            <div
              key={notification.id || index}
              className={`p-4 rounded-lg shadow-lg max-w-sm ${
                notification.type === 'success' ? 'bg-green-100 text-green-800' :
                notification.type === 'error' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}
            >
              <div className="flex justify-between items-start">
                <span>{notification.message}</span>
                <button
                  onClick={() => removeNotification(notification.id || index.toString())}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}