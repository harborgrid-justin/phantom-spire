'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api';
import { useServicePage } from '../../../lib/business-logic';

interface EvidenceMetrics {
  totalEvidence: number;
  evidenceByType: Record<string, number>;
  evidenceByStatus: Record<string, number>;
  evidenceTrend: { date: string; count: number }[];
  averageProcessingTime: number;
  integrityStatus: Record<string, number>;
  topSources: { source: string; count: number }[];
  riskDistribution: Record<string, number>;
}

interface PerformanceMetrics {
  avgAnalysisTime: number;
  throughput: number;
  errorRate: number;
  systemLoad: number;
  activeAnalyses: number;
  queuedAnalyses: number;
}

export default function EvidenceMetricsDashboard() {
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
  } = useServicePage('evidence-metrics');

  const [metrics, setMetrics] = useState<EvidenceMetrics | null>(null);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('7d');

  useEffect(() => {
    fetchMetricsData();
  }, [timeRange]);

  const fetchMetricsData = async () => {
    try {
      setLoading(true);
      
      // Use business logic first
      const businessResponse = await execute('getEvidenceMetrics', { 
        timeRange: timeRange 
      });
      
      if (businessResponse.success && businessResponse.data) {
        setMetrics(businessResponse.data.evidenceMetrics);
        setPerformance(businessResponse.data.performanceMetrics);
        addNotification('success', 'Metrics data loaded successfully via business logic');
      } else {
        // Fallback to mock data for demo
        const mockMetrics: EvidenceMetrics = {
          totalEvidence: 1247,
          evidenceByType: {
            'IOC Evidence': 456,
            'Threat Intelligence': 298,
            'Network Traffic': 203,
            'Malware Samples': 156,
            'Forensic Artifacts': 134
          },
          evidenceByStatus: {
            'Active': 892,
            'Archived': 255,
            'Under Review': 100
          },
          evidenceTrend: [
            { date: '2024-01-01', count: 23 },
            { date: '2024-01-02', count: 45 },
            { date: '2024-01-03', count: 67 },
            { date: '2024-01-04', count: 34 },
            { date: '2024-01-05', count: 78 },
            { date: '2024-01-06', count: 56 },
            { date: '2024-01-07', count: 89 }
          ],
          averageProcessingTime: 45.6,
          integrityStatus: {
            'Verified': 1156,
            'Pending': 67,
            'Failed': 24
          },
          topSources: [
            { source: 'SIEM System', count: 345 },
            { source: 'EDR Platform', count: 298 },
            { source: 'Threat Feeds', count: 234 },
            { source: 'Manual Collection', count: 198 },
            { source: 'Honeypots', count: 172 }
          ],
          riskDistribution: {
            'Critical': 89,
            'High': 234,
            'Medium': 567,
            'Low': 357
          }
        };

        const mockPerformance: PerformanceMetrics = {
          avgAnalysisTime: 123.4,
          throughput: 89.2,
          errorRate: 2.1,
          systemLoad: 67.8,
          activeAnalyses: 23,
          queuedAnalyses: 7
        };
        
        setMetrics(mockMetrics);
        setPerformance(mockPerformance);
        addNotification('info', 'Metrics data loaded from demo data (business logic unavailable)');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch metrics data';
      setError(errorMsg);
      addNotification('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getProgressBarColor = (value: number, max: number) => {
    const percentage = (value / max) * 100;
    if (percentage >= 80) return 'bg-red-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading metrics dashboard...</div>
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
          <h1 className="text-3xl font-bold text-gray-900">Evidence Metrics Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor evidence collection, processing, and analysis metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {/* Main Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {formatNumber(metrics.totalEvidence)}
            </div>
            <div className="text-sm text-gray-600">Total Evidence Items</div>
            <div className="text-xs text-green-600 mt-1">↗ +12% from last period</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {metrics.averageProcessingTime.toFixed(1)}s
            </div>
            <div className="text-sm text-gray-600">Avg Processing Time</div>
            <div className="text-xs text-green-600 mt-1">↘ -8% improvement</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {metrics.integrityStatus.Verified}
            </div>
            <div className="text-sm text-gray-600">Verified Evidence</div>
            <div className="text-xs text-green-600 mt-1">
              {((metrics.integrityStatus.Verified / metrics.totalEvidence) * 100).toFixed(1)}% integrity rate
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {metrics.riskDistribution.Critical + metrics.riskDistribution.High}
            </div>
            <div className="text-sm text-gray-600">High Risk Evidence</div>
            <div className="text-xs text-red-600 mt-1">Requires immediate attention</div>
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {performance && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">System Load</span>
                <span className="font-medium">{performance.systemLoad.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getProgressBarColor(performance.systemLoad, 100)}`}
                  style={{ width: `${performance.systemLoad}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Throughput</span>
                <span className="font-medium">{performance.throughput.toFixed(1)} items/min</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-blue-500"
                  style={{ width: `${Math.min(performance.throughput, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Error Rate</span>
                <span className="font-medium">{performance.errorRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${performance.errorRate > 5 ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(performance.errorRate * 5, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{performance.activeAnalyses}</div>
              <div className="text-sm text-gray-600">Active Analyses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{performance.queuedAnalyses}</div>
              <div className="text-sm text-gray-600">Queued Analyses</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Evidence by Type */}
        {metrics && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Evidence by Type</h2>
            <div className="space-y-4">
              {Object.entries(metrics.evidenceByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{type}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{count}</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${(count / Math.max(...Object.values(metrics.evidenceByType))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risk Distribution */}
        {metrics && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Risk Distribution</h2>
            <div className="space-y-4">
              {Object.entries(metrics.riskDistribution).map(([risk, count]) => (
                <div key={risk} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      risk === 'Critical' ? 'bg-red-500' :
                      risk === 'High' ? 'bg-orange-500' :
                      risk === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    <span className="text-sm text-gray-600">{risk}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{count}</span>
                    <span className="text-xs text-gray-500">
                      {((count / metrics.totalEvidence) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Sources */}
        {metrics && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Evidence Sources</h2>
            <div className="space-y-3">
              {metrics.topSources.map((source, index) => (
                <div key={source.source} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <span className="text-sm text-gray-900">{source.source}</span>
                  </div>
                  <span className="text-sm font-medium text-blue-600">{source.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Overview */}
        {metrics && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Evidence Status</h2>
            <div className="space-y-4">
              {Object.entries(metrics.evidenceByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{status}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{count}</span>
                    <span className="text-xs text-gray-500">
                      {((count / metrics.totalEvidence) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Integrity Status</h3>
              <div className="space-y-2">
                {Object.entries(metrics.integrityStatus).map(([status, count]) => (
                  <div key={status} className="flex justify-between text-sm">
                    <span className={`${
                      status === 'Verified' ? 'text-green-600' :
                      status === 'Failed' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {status}
                    </span>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Evidence Trend Chart */}
      {metrics && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Evidence Collection Trend</h2>
          <div className="h-64 flex items-end justify-between space-x-2">
            {metrics.evidenceTrend.map((item, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="bg-blue-500 w-full rounded-t"
                  style={{ 
                    height: `${(item.count / Math.max(...metrics.evidenceTrend.map(i => i.count))) * 200}px`,
                    minHeight: '10px'
                  }}
                ></div>
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-xs font-medium text-gray-700">{item.count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

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