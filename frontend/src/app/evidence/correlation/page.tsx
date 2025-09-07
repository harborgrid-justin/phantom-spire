'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api';
import { useServicePage } from '../../../lib/business-logic';
import { Evidence } from '../../../types/api';

interface CorrelationRule {
  id: string;
  name: string;
  description: string;
  evidenceTypes: string[];
  conditions: {
    field: string;
    operator: 'equals' | 'contains' | 'matches' | 'range' | 'exists';
    value: any;
  }[];
  timeWindow: number; // in minutes
  threshold: number;
  enabled: boolean;
}

interface CorrelationResult {
  id: string;
  ruleId: string;
  ruleName: string;
  correlatedEvidence: {
    id: string;
    type: string;
    description: string;
    timestamp: string;
    relevanceScore: number;
  }[];
  confidenceScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  generatedAt: string;
  status: 'new' | 'investigating' | 'resolved' | 'false-positive';
  assignedTo?: string;
  notes: string[];
}

export default function MultiEvidenceCorrelationPage() {
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
  } = useServicePage('evidence-correlation');

  const [correlations, setCorrelations] = useState<CorrelationResult[]>([]);
  const [rules, setRules] = useState<CorrelationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'correlations' | 'rules'>('correlations');

  useEffect(() => {
    fetchCorrelationData();
  }, [selectedRisk, selectedStatus]);

  const fetchCorrelationData = async () => {
    try {
      setLoading(true);
      
      // Use business logic first
      const businessResponse = await execute('getCorrelationData', { 
        riskLevel: selectedRisk,
        status: selectedStatus 
      });
      
      if (businessResponse.success && businessResponse.data) {
        setCorrelations(businessResponse.data.correlations || []);
        setRules(businessResponse.data.rules || []);
        addNotification('success', 'Correlation data loaded successfully via business logic');
      } else {
        // Fallback to mock data for demo
        const mockRules: CorrelationRule[] = [
          {
            id: 'rule_001',
            name: 'Lateral Movement Detection',
            description: 'Detects potential lateral movement by correlating network traffic and authentication events',
            evidenceTypes: ['network_traffic', 'forensic_artifact'],
            conditions: [
              { field: 'sourceIp', operator: 'equals', value: 'targetIp' },
              { field: 'authenticationFailures', operator: 'range', value: [3, 10] }
            ],
            timeWindow: 30,
            threshold: 3,
            enabled: true
          },
          {
            id: 'rule_002',
            name: 'Malware Campaign Correlation',
            description: 'Correlates malware samples with IOC evidence and threat intelligence',
            evidenceTypes: ['malware_sample', 'ioc_evidence', 'threat_intelligence'],
            conditions: [
              { field: 'fileHash', operator: 'equals', value: 'iocValue' },
              { field: 'threatFamily', operator: 'equals', value: 'familyName' }
            ],
            timeWindow: 60,
            threshold: 2,
            enabled: true
          }
        ];

        const mockCorrelations: CorrelationResult[] = [
          {
            id: 'corr_001',
            ruleId: 'rule_001',
            ruleName: 'Lateral Movement Detection',
            correlatedEvidence: [
              {
                id: 'nt_001',
                type: 'network_traffic',
                description: 'Suspicious RDP connection from workstation to server',
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                relevanceScore: 85
              },
              {
                id: 'fa_001',
                type: 'forensic_artifact',
                description: 'Authentication failure events in security log',
                timestamp: new Date(Date.now() - 3300000).toISOString(),
                relevanceScore: 78
              },
              {
                id: 'nt_002',
                type: 'network_traffic',
                description: 'File share access from same source IP',
                timestamp: new Date(Date.now() - 2700000).toISOString(),
                relevanceScore: 92
              }
            ],
            confidenceScore: 88,
            riskLevel: 'high',
            generatedAt: new Date(Date.now() - 2400000).toISOString(),
            status: 'investigating',
            assignedTo: 'analyst@company.com',
            notes: ['Initial analysis shows credible lateral movement pattern', 'Escalated to incident response team']
          },
          {
            id: 'corr_002',
            ruleId: 'rule_002',
            ruleName: 'Malware Campaign Correlation',
            correlatedEvidence: [
              {
                id: 'mal_001',
                type: 'malware_sample',
                description: 'Banking trojan executable detected',
                timestamp: new Date(Date.now() - 7200000).toISOString(),
                relevanceScore: 95
              },
              {
                id: 'ioc_001',
                type: 'ioc_evidence',
                description: 'Malicious IP address in network traffic',
                timestamp: new Date(Date.now() - 6900000).toISOString(),
                relevanceScore: 87
              },
              {
                id: 'ti_001',
                type: 'threat_intelligence',
                description: 'Zeus banking trojan campaign report',
                timestamp: new Date(Date.now() - 6600000).toISOString(),
                relevanceScore: 91
              }
            ],
            confidenceScore: 94,
            riskLevel: 'critical',
            generatedAt: new Date(Date.now() - 6300000).toISOString(),
            status: 'new',
            notes: ['High confidence correlation detected', 'Requires immediate attention']
          }
        ];
        
        setCorrelations(mockCorrelations);
        setRules(mockRules);
        addNotification('info', 'Correlation data loaded from demo data (business logic unavailable)');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch correlation data';
      setError(errorMsg);
      addNotification('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const filteredCorrelations = correlations.filter(corr => {
    const matchesSearch = searchTerm === '' || 
      corr.ruleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      corr.correlatedEvidence.some(e => e.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRisk = selectedRisk === 'all' || corr.riskLevel === selectedRisk;
    const matchesStatus = selectedStatus === 'all' || corr.status === selectedStatus;
    
    return matchesSearch && matchesRisk && matchesStatus;
  });

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'false-positive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEvidenceTypeIcon = (type: string) => {
    switch (type) {
      case 'network_traffic': return '🌐';
      case 'malware_sample': return '🦠';
      case 'ioc_evidence': return '🔍';
      case 'threat_intelligence': return '🎯';
      case 'forensic_artifact': return '🔬';
      case 'attack_pattern': return '⚔️';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading correlation data...</div>
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
          <h1 className="text-3xl font-bold text-gray-900">Multi-Evidence Correlation</h1>
          <p className="text-gray-600 mt-2">Correlate evidence across multiple types to identify threats and patterns</p>
        </div>
        <div className="flex space-x-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            New Rule
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            Run Analysis
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('correlations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'correlations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Correlation Results ({filteredCorrelations.length})
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rules'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Correlation Rules ({rules.length})
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'correlations' && (
        <>
          {/* Controls */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Risk Level
                </label>
                <select 
                  value={selectedRisk}
                  onChange={(e) => setSelectedRisk(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
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
                  <option value="new">New</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                  <option value="false-positive">False Positive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search correlations..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={fetchCorrelationData}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors w-full"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Correlation Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="text-2xl font-bold text-blue-600">
                {filteredCorrelations.length}
              </div>
              <div className="text-sm text-gray-600">Total Correlations</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="text-2xl font-bold text-red-600">
                {filteredCorrelations.filter(c => c.riskLevel === 'critical').length}
              </div>
              <div className="text-sm text-gray-600">Critical Risk</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="text-2xl font-bold text-yellow-600">
                {filteredCorrelations.filter(c => c.status === 'new').length}
              </div>
              <div className="text-sm text-gray-600">New</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="text-2xl font-bold text-purple-600">
                {(filteredCorrelations.reduce((sum, c) => sum + c.confidenceScore, 0) / Math.max(filteredCorrelations.length, 1)).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Avg Confidence</div>
            </div>
          </div>

          {/* Correlations List */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {filteredCorrelations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-4">🔗</div>
                <h3 className="text-lg font-medium mb-2">No Correlations Found</h3>
                <p>No evidence correlations match your search criteria.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredCorrelations.map((correlation) => (
                  <div key={correlation.id} className="p-6 hover:bg-gray-50">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{correlation.ruleName}</h3>
                        <p className="text-sm text-gray-600">Generated: {new Date(correlation.generatedAt).toLocaleString()}</p>
                      </div>
                      <div className="flex space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(correlation.riskLevel)}`}>
                          {correlation.riskLevel.toUpperCase()}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(correlation.status)}`}>
                          {correlation.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Confidence Score */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Confidence Score</span>
                        <span className="font-medium">{correlation.confidenceScore}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            correlation.confidenceScore >= 80 ? 'bg-green-500' :
                            correlation.confidenceScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${correlation.confidenceScore}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Correlated Evidence */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Correlated Evidence ({correlation.correlatedEvidence.length})</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {correlation.correlatedEvidence.map((evidence) => (
                          <div key={evidence.id} className="bg-gray-50 p-3 rounded-lg border">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-lg">{getEvidenceTypeIcon(evidence.type)}</span>
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {evidence.type.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-900 mb-2 line-clamp-2">{evidence.description}</p>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                              <span>{new Date(evidence.timestamp).toLocaleDateString()}</span>
                              <span className="font-medium text-blue-600">{evidence.relevanceScore}% relevance</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Assignment and Notes */}
                    {(correlation.assignedTo || correlation.notes.length > 0) && (
                      <div className="mb-4">
                        {correlation.assignedTo && (
                          <div className="text-sm mb-2">
                            <span className="text-gray-500">Assigned to:</span>
                            <span className="font-medium text-gray-900 ml-1">{correlation.assignedTo}</span>
                          </div>
                        )}
                        {correlation.notes.length > 0 && (
                          <div>
                            <span className="text-sm text-gray-500">Recent Notes:</span>
                            <div className="mt-1 space-y-1">
                              {correlation.notes.slice(0, 2).map((note, index) => (
                                <div key={index} className="text-sm text-gray-700 bg-yellow-50 p-2 rounded">
                                  {note}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                        View Details
                      </button>
                      <button className="text-green-600 hover:text-green-900 text-sm font-medium">
                        Investigate
                      </button>
                      <button className="text-purple-600 hover:text-purple-900 text-sm font-medium">
                        Export Report
                      </button>
                      <button className="text-orange-600 hover:text-orange-900 text-sm font-medium">
                        Create Incident
                      </button>
                      {correlation.status === 'new' && (
                        <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                          Mark False Positive
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'rules' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Correlation Rules</h2>
          </div>
          
          {rules.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-4">⚙️</div>
              <h3 className="text-lg font-medium mb-2">No Correlation Rules Configured</h3>
              <p>Create correlation rules to automatically detect related evidence patterns.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {rules.map((rule) => (
                <div key={rule.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          rule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {rule.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-gray-500">Evidence Types:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {rule.evidenceTypes.map((type, index) => (
                          <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {type.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Time Window:</span>
                      <div className="font-medium text-gray-900">{rule.timeWindow} minutes</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Threshold:</span>
                      <div className="font-medium text-gray-900">{rule.threshold} matches</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="text-sm text-gray-500">Conditions:</span>
                    <div className="mt-1 space-y-1">
                      {rule.conditions.map((condition, index) => (
                        <div key={index} className="text-sm bg-gray-50 p-2 rounded font-mono">
                          {condition.field} {condition.operator} {JSON.stringify(condition.value)}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                      Edit Rule
                    </button>
                    <button className="text-green-600 hover:text-green-900 text-sm font-medium">
                      Test Rule
                    </button>
                    <button className={`text-sm font-medium ${
                      rule.enabled 
                        ? 'text-orange-600 hover:text-orange-900' 
                        : 'text-green-600 hover:text-green-900'
                    }`}>
                      {rule.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button className="text-red-600 hover:text-red-900 text-sm font-medium">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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