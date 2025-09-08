'use client';

import { useEffect, useState } from 'react';
import { CVE, CVEFeed } from '../../../types/cve';
import { apiClient } from '../../../lib/api';
import { useServicePage } from '../../../lib/business-logic';

export default function CVEFeedsPage() {
  const [feeds, setFeeds] = useState<CVEFeed[]>([]);
  const [recentCVEs, setRecentCVEs] = useState<CVE[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncingFeeds, setSyncingFeeds] = useState<Set<string>>(new Set());

  // Business Logic Integration
  const { connected, notifications, execute, addNotification, removeNotification } = useServicePage('cve-feeds');

  useEffect(() => {
    loadFeedsData();
  }, []);

  const loadFeedsData = async () => {
    try {
      setLoading(true);
      
      const [feedsResponse, recentCVEsResponse] = await Promise.all([
        apiClient.get('/cve/feeds'),
        apiClient.get('/cve?limit=10&sort={"field":"publishedDate","order":"desc"}')
      ]);

      setFeeds(feedsResponse.data);
      setRecentCVEs(recentCVEsResponse.data.cves);

      await execute('feeds-loaded', { 
        totalFeeds: feedsResponse.data.length,
        activeFeeds: feedsResponse.data.filter((f: CVEFeed) => f.enabled).length 
      });

      addNotification({
        id: 'feeds-loaded',
        type: 'success',
        message: 'CVE feeds loaded successfully'
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load feeds data';
      setError(errorMessage);
      addNotification({
        id: 'feeds-error',
        type: 'error',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const syncFeed = async (feedId: string) => {
    try {
      setSyncingFeeds(prev => new Set(prev).add(feedId));
      
      await apiClient.post(`/cve/feeds/${feedId}/sync`);
      
      addNotification({
        id: `sync-${feedId}`,
        type: 'success',
        message: 'Feed sync initiated successfully'
      });

      // Reload feeds to get updated sync status
      setTimeout(loadFeedsData, 2000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync feed';
      addNotification({
        id: `sync-error-${feedId}`,
        type: 'error',
        message: errorMessage
      });
    } finally {
      setSyncingFeeds(prev => {
        const newSet = new Set(prev);
        newSet.delete(feedId);
        return newSet;
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'nvd': return '🏛️';
      case 'mitre': return '🔬';
      case 'vendor': return '🏢';
      case 'third-party': return '🌐';
      case 'internal': return '🔒';
      default: return '📡';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading CVE intelligence feeds...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CVE Intelligence Feeds</h1>
          <p className="text-gray-600 mt-2">Real-time vulnerability intelligence from multiple sources</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={loadFeedsData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Refresh All
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            Add Feed
          </button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
            Configure Sources
          </button>
        </div>
      </div>

      {/* Feed Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="text-2xl font-bold text-gray-900">{feeds.length}</div>
          <div className="text-gray-600">Total Feeds</div>
          <div className="text-sm text-blue-600 mt-1">
            {feeds.filter(f => f.enabled).length} active
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="text-2xl font-bold text-gray-900">
            {feeds.reduce((sum, f) => sum + f.itemsProcessed, 0)}
          </div>
          <div className="text-gray-600">Items Processed</div>
          <div className="text-sm text-green-600 mt-1">
            Last 24 hours
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="text-2xl font-bold text-gray-900">
            {feeds.filter(f => f.syncStatus === 'active').length}
          </div>
          <div className="text-gray-600">Active Syncs</div>
          <div className="text-sm text-orange-600 mt-1">
            Currently syncing
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="text-2xl font-bold text-gray-900">
            {feeds.filter(f => f.syncStatus === 'error').length}
          </div>
          <div className="text-gray-600">Sync Errors</div>
          <div className="text-sm text-red-600 mt-1">
            Need attention
          </div>
        </div>
      </div>

      {/* Active Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Intelligence Feeds</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {feeds.map((feed) => (
              <div key={feed.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">{getTypeIcon(feed.type)}</span>
                      <h4 className="font-medium text-gray-900">{feed.name}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(feed.syncStatus)}`}>
                        {feed.syncStatus.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>Type:</strong> {feed.type.toUpperCase()}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                      <div>
                        <span>Last Sync:</span> {new Date(feed.lastSync).toLocaleString()}
                      </div>
                      <div>
                        <span>Items Processed:</span> {feed.itemsProcessed.toLocaleString()}
                      </div>
                      <div>
                        <span>Sync Interval:</span> {feed.syncInterval}
                      </div>
                      <div>
                        <span>Status:</span> {feed.enabled ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex flex-col space-y-2">
                    <button
                      onClick={() => syncFeed(feed.id)}
                      disabled={syncingFeeds.has(feed.id) || feed.syncStatus === 'active'}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      {syncingFeeds.has(feed.id) ? 'Syncing...' : 'Sync Now'}
                    </button>
                    <button className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">
                      Configure
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent CVEs from Feeds</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentCVEs.slice(0, 5).map((cve) => (
              <div key={cve.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-blue-600">{cve.cveId}</h4>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        cve.scoring.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        cve.scoring.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        cve.scoring.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {cve.scoring.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-1 line-clamp-2">{cve.title}</p>
                    <div className="text-xs text-gray-500">
                      Published: {new Date(cve.publishedDate).toLocaleDateString()} • 
                      Source: {cve.source} • 
                      CVSS: {cve.scoring.cvssV3Score || cve.scoring.cvssV2Score || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-gray-200 text-center">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All Recent CVEs
            </button>
          </div>
        </div>
      </div>

      {/* Feed Configuration Templates */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Available Feed Sources</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          {[
            {
              name: 'National Vulnerability Database (NVD)',
              type: 'nvd',
              description: 'Official US government repository of standards-based vulnerability management data',
              icon: '🏛️',
              status: 'available'
            },
            {
              name: 'MITRE CVE Database',
              type: 'mitre',
              description: 'Authoritative source for CVE identifiers and descriptions',
              icon: '🔬',
              status: 'available'
            },
            {
              name: 'Vendor Security Advisories',
              type: 'vendor',
              description: 'Direct feeds from software vendors and security teams',
              icon: '🏢',
              status: 'configurable'
            },
            {
              name: 'Third-Party Intelligence',
              type: 'third-party',
              description: 'Commercial threat intelligence and vulnerability feeds',
              icon: '🌐',
              status: 'premium'
            },
            {
              name: 'Internal Vulnerability Scanner',
              type: 'internal',
              description: 'Integrate with internal vulnerability scanning tools',
              icon: '🔒',
              status: 'configurable'
            },
            {
              name: 'Security Research Feeds',
              type: 'research',
              description: 'Academic and independent security research sources',
              icon: '📚',
              status: 'available'
            }
          ].map((source) => (
            <div key={source.type} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-3xl">{source.icon}</span>
                <div>
                  <h4 className="font-medium text-gray-900">{source.name}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    source.status === 'available' ? 'bg-green-100 text-green-800' :
                    source.status === 'configurable' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {source.status.toUpperCase()}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">{source.description}</p>
              <button 
                className={`w-full px-4 py-2 rounded-lg text-sm font-medium ${
                  source.status === 'available' ? 'bg-green-600 text-white hover:bg-green-700' :
                  source.status === 'configurable' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                  'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {source.status === 'available' ? 'Add Feed' :
                 source.status === 'configurable' ? 'Configure' : 'Upgrade for Access'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Business Logic Notifications */}
      {notifications.length > 0 && (
        <div className="mt-6 space-y-2">
          {notifications.map((notification) => (
            <div 
              key={notification.id}
              className={`p-3 rounded-lg border ${
                notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' :
                notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
                'bg-blue-50 border-blue-200 text-blue-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm">{notification.message}</span>
                <button 
                  onClick={() => removeNotification(notification.id)}
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