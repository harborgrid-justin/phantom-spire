'use client';

import { useEffect, useState } from 'react';
import { CVEStats, CVE } from '../../../types/cve';
import { apiClient } from '../../../lib/api';
import { useServicePage } from '../../../lib/business-logic';

export default function CVEDashboardPage() {
  const [stats, setStats] = useState<CVEStats | null>(null);
  const [recentCVEs, setRecentCVEs] = useState<CVE[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Business Logic Integration
  const {
    loading: businessLoading,
    error: businessError,
    stats: businessStats,
    connected,
    notifications,
    execute,
    refresh,
    addNotification,
    removeNotification
  } = useServicePage('cve-dashboard');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load CVE statistics
      const statsResponse = await apiClient.get('/cve/stats');
      setStats(statsResponse.data);

      // Load recent CVEs
      const cveResponse = await apiClient.get('/cve?limit=10&sort={"field":"publishedDate","order":"desc"}');
      setRecentCVEs(cveResponse.data.cves);

      // Execute business logic
      await execute('dashboard-load', { 
        statsLoaded: true, 
        recentCVEsCount: cveResponse.data.cves.length 
      });

      addNotification({
        id: 'dashboard-loaded',
        type: 'success',
        message: 'CVE dashboard loaded successfully'
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(errorMessage);
      addNotification({
        id: 'dashboard-error',
        type: 'error',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'info': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-purple-100 text-purple-800';
      case 'triaged': return 'bg-blue-100 text-blue-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'patching': return 'bg-orange-100 text-orange-800';
      case 'testing': return 'bg-indigo-100 text-indigo-800';
      case 'closed': return 'bg-green-100 text-green-800';
      case 'accepted-risk': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (businessLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading CVE Dashboard...</div>
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
          {businessStats && (
            <div className="text-gray-600">
              Service Stats: {businessStats.totalRequests || 0} requests
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
          <h1 className="text-3xl font-bold text-gray-900">CVE Management Dashboard</h1>
          <p className="text-gray-600 mt-2">Comprehensive vulnerability management and risk assessment</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={loadDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Data
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Key Metrics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-gray-600">Total CVEs</div>
            <div className="text-sm text-blue-600 mt-1">
              +{stats.trending.newCVEs} this month
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <div className="text-2xl font-bold text-gray-900">{stats.bySeverity.critical}</div>
            <div className="text-gray-600">Critical CVEs</div>
            <div className="text-sm text-red-600 mt-1">
              +{stats.trending.criticalNew} new critical
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="text-2xl font-bold text-gray-900">{stats.withPatches}</div>
            <div className="text-gray-600">Patches Available</div>
            <div className="text-sm text-green-600 mt-1">
              {Math.round((stats.withPatches / stats.total) * 100)}% coverage
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <div className="text-2xl font-bold text-gray-900">{stats.pastDue}</div>
            <div className="text-gray-600">Past Due</div>
            <div className="text-sm text-orange-600 mt-1">
              Require immediate attention
            </div>
          </div>
        </div>
      )}

      {/* Severity Distribution */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Severity Distribution</h3>
            <div className="space-y-3">
              {Object.entries(stats.bySeverity).map(([severity, count]) => (
                <div key={severity} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(severity)}`}>
                      {severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="bg-gray-200 rounded-full h-2 w-24">
                      <div 
                        className={`h-2 rounded-full ${
                          severity === 'critical' ? 'bg-red-500' :
                          severity === 'high' ? 'bg-orange-500' :
                          severity === 'medium' ? 'bg-yellow-500' :
                          severity === 'low' ? 'bg-blue-500' : 'bg-gray-500'
                        }`}
                        style={{width: `${(count / stats.total) * 100}%`}}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Affected Vendors</h3>
            <div className="space-y-3">
              {stats.topVendors.slice(0, 5).map((vendor, index) => (
                <div key={vendor.vendor} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900">{index + 1}.</span>
                    <span className="ml-2 text-sm text-gray-700">{vendor.vendor}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{vendor.count} CVEs</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent CVEs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent CVEs</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentCVEs.map((cve) => (
            <div key={cve.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                      {cve.cveId}
                    </h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(cve.scoring.severity)}`}>
                      {cve.scoring.severity.toUpperCase()}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(cve.workflow.status)}`}>
                      {cve.workflow.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 mb-2">{cve.title}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>CVSS: {cve.scoring.cvssV3Score || cve.scoring.cvssV2Score || 'N/A'}</span>
                    <span>Published: {new Date(cve.publishedDate).toLocaleDateString()}</span>
                    {cve.exploitInfo.exploitAvailable && (
                      <span className="text-red-600 font-medium">Exploit Available</span>
                    )}
                    {cve.patchInfo.patchAvailable && (
                      <span className="text-green-600 font-medium">Patch Available</span>
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-gray-200 text-center">
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All CVEs
          </button>
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