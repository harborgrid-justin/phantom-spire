'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api';
import { useServicePage } from '../../../lib/business-logic';
import { Evidence } from '../../../types/api';

interface NetworkTrafficEvidence extends Evidence {
  sourceIp: string;
  destIp: string;
  sourcePort: number;
  destPort: number;
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'HTTP' | 'HTTPS' | 'DNS';
  bytes: number;
  packets: number;
  duration: number;
  flags: string[];
  suspicious: boolean;
  geoLocation?: {
    source: string;
    destination: string;
  };
}

export default function NetworkTrafficEvidencePage() {
  // Business Logic Integration
  const {
    loading: businessLoading,
    error: businessError,
    stats,
    connected,
    notifications,
    execute,
    refresh,
    addNotification,
    removeNotification
  } = useServicePage('evidence-network-traffic');

  const [evidence, setEvidence] = useState<NetworkTrafficEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProtocol, setSelectedProtocol] = useState<string>('all');
  const [suspiciousOnly, setSuspiciousOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchNetworkTrafficEvidence();
  }, [selectedProtocol, suspiciousOnly]);

  const fetchNetworkTrafficEvidence = async () => {
    try {
      setLoading(true);
      
      // Use business logic first
      const businessResponse = await execute('getNetworkTrafficEvidence', { 
        protocol: selectedProtocol,
        suspicious: suspiciousOnly 
      });
      
      if (businessResponse.success && businessResponse.data) {
        setEvidence(businessResponse.data);
        addNotification('success', 'Network traffic evidence loaded successfully via business logic');
      } else {
        // Fallback to direct API
        const response = await apiClient.getEvidence();
        if (response.data && typeof response.data === 'object' && response.data !== null && 'data' in response.data && Array.isArray((response.data as any).data)) {
          const networkEvidence = (response.data as any).data.filter((e: Evidence) => e.type === 'network_traffic');
          setEvidence(networkEvidence);
          addNotification('info', 'Network traffic evidence loaded via direct API (business logic unavailable)');
        } else if (response.error) {
          setError(response.error);
          addNotification('error', `Failed to load network traffic evidence: ${response.error}`);
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch network traffic evidence';
      setError(errorMsg);
      addNotification('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvidence = evidence.filter(e => {
    const matchesSearch = searchTerm === '' || 
      e.sourceIp?.includes(searchTerm) ||
      e.destIp?.includes(searchTerm) ||
      e.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProtocol = selectedProtocol === 'all' || e.protocol === selectedProtocol;
    const matchesSuspicious = !suspiciousOnly || e.suspicious;
    
    return matchesSearch && matchesProtocol && matchesSuspicious;
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading network traffic evidence...</div>
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
          <h1 className="text-3xl font-bold text-gray-900">Network Traffic Evidence</h1>
          <p className="text-gray-600 mt-2">Analyze network communications and traffic patterns</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Import Traffic
        </button>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Protocol
            </label>
            <select 
              value={selectedProtocol}
              onChange={(e) => setSelectedProtocol(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Protocols</option>
              <option value="TCP">TCP</option>
              <option value="UDP">UDP</option>
              <option value="HTTP">HTTP</option>
              <option value="HTTPS">HTTPS</option>
              <option value="DNS">DNS</option>
              <option value="ICMP">ICMP</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter Options
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={suspiciousOnly}
                  onChange={(e) => setSuspiciousOnly(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Suspicious Only</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search IPs
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by IP address..."
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchNetworkTrafficEvidence}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors w-full"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Network Traffic Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-blue-600">
            {filteredEvidence.length}
          </div>
          <div className="text-sm text-gray-600">Total Flows</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-red-600">
            {filteredEvidence.filter(e => e.suspicious).length}
          </div>
          <div className="text-sm text-gray-600">Suspicious</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-green-600">
            {filteredEvidence.filter(e => e.protocol === 'TCP').length}
          </div>
          <div className="text-sm text-gray-600">TCP</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-purple-600">
            {filteredEvidence.filter(e => e.protocol === 'UDP').length}
          </div>
          <div className="text-sm text-gray-600">UDP</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-orange-600">
            {filteredEvidence.reduce((sum, e) => sum + (e.bytes || 0), 0) > 0 ? 
              formatBytes(filteredEvidence.reduce((sum, e) => sum + (e.bytes || 0), 0)) : '0 B'}
          </div>
          <div className="text-sm text-gray-600">Total Data</div>
        </div>
      </div>

      {/* Network Traffic Evidence List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredEvidence.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-4">🌐</div>
            <h3 className="text-lg font-medium mb-2">No Network Traffic Found</h3>
            <p>Start by importing network traffic data or adjust your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Protocol</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEvidence.map((item) => (
                  <tr key={item.id} className={`hover:bg-gray-50 ${item.suspicious ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {item.suspicious ? (
                          <div className="flex items-center text-red-600">
                            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                            <span className="text-xs font-medium">ALERT</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-green-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-xs font-medium">NORMAL</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono">
                        <div className="font-medium text-gray-900">{item.sourceIp || 'N/A'}</div>
                        <div className="text-gray-500 text-xs">:{item.sourcePort || 0}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono">
                        <div className="font-medium text-gray-900">{item.destIp || 'N/A'}</div>
                        <div className="text-gray-500 text-xs">:{item.destPort || 0}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.protocol === 'TCP' ? 'bg-blue-100 text-blue-800' :
                        item.protocol === 'UDP' ? 'bg-purple-100 text-purple-800' :
                        item.protocol === 'HTTP' ? 'bg-green-100 text-green-800' :
                        item.protocol === 'HTTPS' ? 'bg-green-100 text-green-800' :
                        item.protocol === 'DNS' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.protocol || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <div className="text-gray-900">{formatBytes(item.bytes || 0)}</div>
                      <div className="text-gray-500 text-xs">{item.packets || 0} packets</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDuration(item.duration || 0)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">Analyze</button>
                        <button className="text-green-600 hover:text-green-900">PCAP</button>
                        {item.suspicious && (
                          <button className="text-red-600 hover:text-red-900">Block</button>
                        )}
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