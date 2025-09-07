'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api';
import { useServicePage } from '../../../lib/business-logic';
import { Evidence } from '../../../types/api';

interface AnalysisResult {
  id: string;
  evidenceId: string;
  analysisType: 'pattern' | 'correlation' | 'risk' | 'behavioral' | 'timeline';
  status: 'pending' | 'running' | 'completed' | 'failed';
  confidence: number;
  findings: any[];
  startTime: string;
  endTime?: string;
  duration?: number;
}

interface AnalysisMetrics {
  totalAnalyses: number;
  completedAnalyses: number;
  failedAnalyses: number;
  averageConfidence: number;
  averageDuration: number;
  topPatterns: string[];
}

export default function EvidenceAnalysisDashboard() {
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
  } = useServicePage('evidence-analysis');

  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [metrics, setMetrics] = useState<AnalysisMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    fetchAnalysisData();
  }, [selectedStatus, selectedType]);

  const fetchAnalysisData = async () => {
    try {
      setLoading(true);
      
      // Use business logic first
      const businessResponse = await execute('getAnalysisResults', { 
        status: selectedStatus,
        type: selectedType 
      });
      
      if (businessResponse.success && businessResponse.data) {
        setAnalyses(businessResponse.data.analyses || []);
        setMetrics(businessResponse.data.metrics || null);
        addNotification('success', 'Analysis data loaded successfully via business logic');
      } else {
        // Fallback to mock data for demo
        const mockAnalyses: AnalysisResult[] = [
          {
            id: '1',
            evidenceId: 'ev_001',
            analysisType: 'pattern',
            status: 'completed',
            confidence: 85,
            findings: ['Suspicious pattern detected', 'Multiple IOC correlations'],
            startTime: new Date(Date.now() - 3600000).toISOString(),
            endTime: new Date(Date.now() - 3540000).toISOString(),
            duration: 60000
          },
          {
            id: '2',
            evidenceId: 'ev_002',
            analysisType: 'correlation',
            status: 'running',
            confidence: 0,
            findings: [],
            startTime: new Date(Date.now() - 300000).toISOString()
          },
          {
            id: '3',
            evidenceId: 'ev_003',
            analysisType: 'risk',
            status: 'completed',
            confidence: 92,
            findings: ['High risk indicators found', 'APT group correlation'],
            startTime: new Date(Date.now() - 7200000).toISOString(),
            endTime: new Date(Date.now() - 7140000).toISOString(),
            duration: 60000
          }
        ];
        
        const mockMetrics: AnalysisMetrics = {
          totalAnalyses: 156,
          completedAnalyses: 142,
          failedAnalyses: 8,
          averageConfidence: 78.5,
          averageDuration: 45000,
          topPatterns: ['Malware Communication', 'Data Exfiltration', 'Lateral Movement']
        };
        
        setAnalyses(mockAnalyses);
        setMetrics(mockMetrics);
        addNotification('info', 'Analysis data loaded from demo data (business logic unavailable)');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch analysis data';
      setError(errorMsg);
      addNotification('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnalyses = analyses.filter(a => {
    const matchesStatus = selectedStatus === 'all' || a.status === selectedStatus;
    const matchesType = selectedType === 'all' || a.analysisType === selectedType;
    return matchesStatus && matchesType;
  });

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pattern': return 'bg-purple-100 text-purple-800';
      case 'correlation': return 'bg-blue-100 text-blue-800';
      case 'risk': return 'bg-red-100 text-red-800';
      case 'behavioral': return 'bg-orange-100 text-orange-800';
      case 'timeline': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading analysis dashboard...</div>
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
          <h1 className="text-3xl font-bold text-gray-900">Evidence Analysis Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor and manage evidence analysis operations</p>
        </div>
        <div className="flex space-x-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            New Analysis
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            Batch Analysis
          </button>
        </div>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="text-2xl font-bold text-blue-600">
              {metrics.totalAnalyses}
            </div>
            <div className="text-sm text-gray-600">Total Analyses</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="text-2xl font-bold text-green-600">
              {metrics.completedAnalyses}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="text-2xl font-bold text-red-600">
              {metrics.failedAnalyses}
            </div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="text-2xl font-bold text-purple-600">
              {metrics.averageConfidence.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Avg Confidence</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="text-2xl font-bold text-orange-600">
              {formatDuration(metrics.averageDuration)}
            </div>
            <div className="text-sm text-gray-600">Avg Duration</div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Analysis Type
            </label>
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Types</option>
              <option value="pattern">Pattern Analysis</option>
              <option value="correlation">Correlation Analysis</option>
              <option value="risk">Risk Assessment</option>
              <option value="behavioral">Behavioral Analysis</option>
              <option value="timeline">Timeline Analysis</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchAnalysisData}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors w-full"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Top Patterns */}
      {metrics && metrics.topPatterns.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Detected Patterns</h2>
          <div className="flex flex-wrap gap-2">
            {metrics.topPatterns.map((pattern, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {pattern}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Results */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Analysis Results</h2>
        </div>
        
        {filteredAnalyses.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-medium mb-2">No Analysis Results Found</h3>
            <p>Start a new analysis or adjust your filters to view results.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAnalyses.map((analysis) => (
              <div key={analysis.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(analysis.analysisType)}`}>
                      {analysis.analysisType.charAt(0).toUpperCase() + analysis.analysisType.slice(1)}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(analysis.status)}`}>
                      {analysis.status.charAt(0).toUpperCase() + analysis.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Evidence ID: {analysis.evidenceId}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-500">Started:</span>
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(analysis.startTime).toLocaleString()}
                    </div>
                  </div>
                  {analysis.endTime && (
                    <div>
                      <span className="text-sm text-gray-500">Completed:</span>
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(analysis.endTime).toLocaleString()}
                      </div>
                    </div>
                  )}
                  {analysis.duration && (
                    <div>
                      <span className="text-sm text-gray-500">Duration:</span>
                      <div className="text-sm font-medium text-gray-900">
                        {formatDuration(analysis.duration)}
                      </div>
                    </div>
                  )}
                  {analysis.status === 'completed' && (
                    <div>
                      <span className="text-sm text-gray-500">Confidence:</span>
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${
                              analysis.confidence >= 80 ? 'bg-green-500' :
                              analysis.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${analysis.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{analysis.confidence}%</span>
                      </div>
                    </div>
                  )}
                </div>

                {analysis.findings.length > 0 && (
                  <div className="mb-4">
                    <span className="text-sm text-gray-500 mb-2 block">Key Findings:</span>
                    <div className="space-y-1">
                      {analysis.findings.map((finding, index) => (
                        <div key={index} className="text-sm text-gray-700 bg-gray-50 px-3 py-1 rounded">
                          • {finding}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                    View Details
                  </button>
                  {analysis.status === 'completed' && (
                    <>
                      <button className="text-green-600 hover:text-green-900 text-sm font-medium">
                        Export Report
                      </button>
                      <button className="text-purple-600 hover:text-purple-900 text-sm font-medium">
                        Re-analyze
                      </button>
                    </>
                  )}
                  {analysis.status === 'running' && (
                    <button className="text-red-600 hover:text-red-900 text-sm font-medium">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
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