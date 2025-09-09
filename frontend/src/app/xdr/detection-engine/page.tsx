'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, RefreshCw, Settings, Shield, Eye, Zap, Brain, AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import { detectionEngine, ThreatIndicator, DetectionRule, BehavioralProfile, Correlation, RiskAssessment } from '../../../lib/detection-engine-business-logic';

interface DetectionEngineData {
  status: string;
  metrics: {
    total: number;
    active: number;
    resolved: number;
    threatsDetected: number;
    correlationsFound: number;
    riskAssessments: number;
  };
  lastUpdate: string;
  recentThreats: ThreatIndicator[];
  activeRules: DetectionRule[];
  behavioralAlerts: any[];
  correlations: Correlation[];
  riskSummary: {
    high: number;
    medium: number;
    low: number;
  };
}

const DetectionEnginePage = () => {
  const [data, setData] = useState<DetectionEngineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'threats' | 'rules' | 'behavioral' | 'correlations' | 'risk'>('overview');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate fetching data from the advanced detection engine
      const mockData: DetectionEngineData = {
        status: 'operational',
        metrics: {
          total: Math.floor(Math.random() * 1000) + 500,
          active: Math.floor(Math.random() * 100) + 20,
          resolved: Math.floor(Math.random() * 200) + 50,
          threatsDetected: Math.floor(Math.random() * 50) + 10,
          correlationsFound: Math.floor(Math.random() * 20) + 5,
          riskAssessments: Math.floor(Math.random() * 30) + 15
        },
        lastUpdate: new Date().toISOString(),
        recentThreats: await generateMockThreats(),
        activeRules: await generateMockRules(),
        behavioralAlerts: [],
        correlations: await generateMockCorrelations(),
        riskSummary: {
          high: Math.floor(Math.random() * 10) + 2,
          medium: Math.floor(Math.random() * 20) + 5,
          low: Math.floor(Math.random() * 30) + 10
        }
      };

      setData(mockData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Set up real-time updates
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [fetchData]);

  const generateMockThreats = async (): Promise<ThreatIndicator[]> => {
    const threats: ThreatIndicator[] = [];
    const types = ['ip', 'domain', 'hash', 'url'];
    const severities: ('low' | 'medium' | 'high' | 'critical')[] = ['low', 'medium', 'high', 'critical'];

    for (let i = 0; i < 5; i++) {
      const threat: ThreatIndicator = {
        id: `threat_${i}`,
        type: types[Math.floor(Math.random() * types.length)] as any,
        value: `mock_${Math.random().toString(36).substr(2, 9)}`,
        confidence: Math.random() * 0.5 + 0.5,
        severity: severities[Math.floor(Math.random() * severities.length)],
        source: 'Mock Feed',
        timestamp: new Date(Date.now() - Math.random() * 86400000),
        tags: ['malicious', 'suspicious'],
        context: {
          geolocation: 'Unknown',
          asn: 'Unknown',
          category: 'Malware',
          firstSeen: new Date(),
          lastSeen: new Date()
        }
      };
      threats.push(threat);
    }

    return threats;
  };

  const generateMockRules = async (): Promise<DetectionRule[]> => {
    return [
      {
        id: 'rule_1',
        name: 'High Risk IP Detection',
        description: 'Detect connections from high-risk IP addresses',
        enabled: true,
        priority: 8,
        conditions: [{
          field: 'source_ip',
          operator: 'in',
          value: [],
          weight: 5
        }],
        actions: [{
          type: 'alert',
          target: 'security_team',
          parameters: { severity: 'high', message: 'Connection from high-risk IP detected' }
        }],
        metadata: {
          author: 'system',
          created: new Date(),
          modified: new Date(),
          tags: ['network', 'threat'],
          mitreTactics: ['TA0001'],
          mitreTechniques: ['T1071']
        }
      }
    ];
  };

  const generateMockCorrelations = async (): Promise<Correlation[]> => {
    const correlations: Correlation[] = [];
    for (let i = 0; i < 3; i++) {
      correlations.push({
        id: `corr_${i}`,
        ruleId: 'rule_1',
        indicators: [],
        confidence: Math.random() * 0.4 + 0.6,
        severity: Math.floor(Math.random() * 3) + 1,
        timestamp: new Date(Date.now() - Math.random() * 3600000),
        status: 'active'
      });
    }
    return correlations;
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleGoBack = () => {
    window.history.back();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'threats', label: 'Threat Intelligence', icon: Shield },
    { id: 'rules', label: 'Detection Rules', icon: Settings },
    { id: 'behavioral', label: 'Behavioral Analytics', icon: Brain },
    { id: 'correlations', label: 'Correlations', icon: TrendingUp },
    { id: 'risk', label: 'Risk Assessment', icon: AlertTriangle }
  ];

  return (
    <div className="flex-1 p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={handleGoBack}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 mr-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        <h1 className="text-3xl font-bold flex-1">
          Advanced Detection Engine
        </h1>
        <button
          onClick={handleRefresh}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 mr-2"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
        <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
          <Settings className="w-4 h-4 mr-2" />
          Configure
        </button>
      </div>

      <p className="text-gray-600 mb-6">
        Enterprise-grade threat detection with AI-powered analytics, behavioral monitoring, and automated response capabilities
      </p>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <div className="text-yellow-800">
            Unable to connect to live data. Showing demo data.
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <IconComponent className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && data && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Key Metrics */}
            <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow border p-4">
                <div className="flex items-center">
                  <Shield className="w-8 h-8 text-red-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Threats Detected</p>
                    <p className="text-2xl font-bold text-gray-900">{data.metrics.threatsDetected}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow border p-4">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Correlations</p>
                    <p className="text-2xl font-bold text-gray-900">{data.metrics.correlationsFound}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow border p-4">
                <div className="flex items-center">
                  <Brain className="w-8 h-8 text-purple-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Risk Assessments</p>
                    <p className="text-2xl font-bold text-gray-900">{data.metrics.riskAssessments}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow border p-4">
                <div className="flex items-center">
                  <Activity className="w-8 h-8 text-green-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Active Rules</p>
                    <p className="text-2xl font-bold text-gray-900">{data.activeRules.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Summary */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow border">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Risk Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-red-600 font-medium">High Risk</span>
                    <span className="text-2xl font-bold">{data.riskSummary.high}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-600 font-medium">Medium Risk</span>
                    <span className="text-2xl font-bold">{data.riskSummary.medium}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-green-600 font-medium">Low Risk</span>
                    <span className="text-2xl font-bold">{data.riskSummary.low}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow border">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">System Status</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Engine Status</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {data.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Last Update</span>
                    <span className="text-sm text-gray-600">
                      {new Date(data.lastUpdate).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Events</span>
                    <span className="font-medium">{data.metrics.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Active Alerts</span>
                    <span className="font-medium text-red-600">{data.metrics.active}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'threats' && data && (
          <div className="bg-white rounded-lg shadow border">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Threat Indicators</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Value</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Severity</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Confidence</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Source</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Last Seen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentThreats.map((threat) => (
                      <tr key={threat.id} className="border-b">
                        <td className="py-3 px-4">{threat.type.toUpperCase()}</td>
                        <td className="py-3 px-4 font-mono text-sm">{threat.value}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            threat.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            threat.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                            threat.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {threat.severity}
                          </span>
                        </td>
                        <td className="py-3 px-4">{(threat.confidence * 100).toFixed(1)}%</td>
                        <td className="py-3 px-4">{threat.source}</td>
                        <td className="py-3 px-4">{threat.timestamp.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rules' && data && (
          <div className="bg-white rounded-lg shadow border">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Active Detection Rules</h2>
              <div className="space-y-4">
                {data.activeRules.map((rule) => (
                  <div key={rule.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-medium">{rule.name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        rule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {rule.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{rule.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Priority: {rule.priority}</span>
                      <span>Author: {rule.metadata.author}</span>
                      <span>Created: {rule.metadata.created.toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'correlations' && data && (
          <div className="bg-white rounded-lg shadow border">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Active Correlations</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Correlation ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Rule</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Confidence</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Severity</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.correlations.map((correlation) => (
                      <tr key={correlation.id} className="border-b">
                        <td className="py-3 px-4 font-mono text-sm">{correlation.id}</td>
                        <td className="py-3 px-4">{correlation.ruleId}</td>
                        <td className="py-3 px-4">{(correlation.confidence * 100).toFixed(1)}%</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            correlation.severity >= 3 ? 'bg-red-100 text-red-800' :
                            correlation.severity >= 2 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {correlation.severity}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            correlation.status === 'active' ? 'bg-blue-100 text-blue-800' :
                            correlation.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {correlation.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">{correlation.timestamp.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'behavioral' && (
          <div className="bg-white rounded-lg shadow border">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Behavioral Analytics</h2>
              <div className="text-center py-12">
                <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Behavioral analytics dashboard coming soon...</p>
                <p className="text-sm text-gray-500 mt-2">Real-time user and entity behavior monitoring</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'risk' && (
          <div className="bg-white rounded-lg shadow border">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Risk Assessment Dashboard</h2>
              <div className="text-center py-12">
                <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Risk assessment dashboard coming soon...</p>
                <p className="text-sm text-gray-500 mt-2">Comprehensive risk analysis and recommendations</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow border">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center p-4 border border-gray-300 rounded-md hover:bg-gray-50">
              <Zap className="w-6 h-6 text-blue-600 mb-2" />
              <span className="text-sm font-medium">Run Scan</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-gray-300 rounded-md hover:bg-gray-50">
              <Shield className="w-6 h-6 text-green-600 mb-2" />
              <span className="text-sm font-medium">Update Rules</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-gray-300 rounded-md hover:bg-gray-50">
              <Eye className="w-6 h-6 text-purple-600 mb-2" />
              <span className="text-sm font-medium">View Reports</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-gray-300 rounded-md hover:bg-gray-50">
              <Settings className="w-6 h-6 text-gray-600 mb-2" />
              <span className="text-sm font-medium">Configure</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetectionEnginePage;
