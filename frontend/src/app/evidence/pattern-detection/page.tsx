'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api';
import { useServicePage } from '../../../lib/business-logic';

interface DetectedPattern {
  id: string;
  name: string;
  description: string;
  category: 'behavior' | 'communication' | 'persistence' | 'evasion' | 'exploitation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  frequency: number;
  firstDetected: string;
  lastDetected: string;
  evidenceCount: number;
  indicators: {
    type: string;
    value: string;
    weight: number;
  }[];
  relatedEvidence: {
    id: string;
    type: string;
    description: string;
    matchScore: number;
  }[];
  mitreMapping?: {
    technique: string;
    tactic: string;
    id: string;
  };
  status: 'active' | 'investigating' | 'resolved' | 'false-positive';
}

interface PatternRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions: any[];
  threshold: number;
  severity: string;
  lastModified: string;
}

export default function PatternDetectionPage() {
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
  } = useServicePage('evidence-pattern-detection');

  const [patterns, setPatterns] = useState<DetectedPattern[]>([]);
  const [rules, setRules] = useState<PatternRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'patterns' | 'rules'>('patterns');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPatternData();
  }, [selectedCategory, selectedSeverity, selectedStatus]);

  const fetchPatternData = async () => {
    try {
      setLoading(true);
      
      // Use business logic first
      const businessResponse = await execute('getPatternDetectionData', { 
        category: selectedCategory,
        severity: selectedSeverity,
        status: selectedStatus
      });
      
      if (businessResponse.success && businessResponse.data) {
        setPatterns(businessResponse.data.patterns || []);
        setRules(businessResponse.data.rules || []);
        addNotification('success', 'Pattern data loaded successfully via business logic');
      } else {
        // Fallback to mock data for demo
        const mockPatterns: DetectedPattern[] = [
          {
            id: 'pattern_001',
            name: 'Credential Dumping Pattern',
            description: 'Multiple attempts to access LSASS memory followed by network connections',
            category: 'exploitation',
            severity: 'high',
            confidence: 88,
            frequency: 15,
            firstDetected: new Date(Date.now() - 86400000 * 7).toISOString(),
            lastDetected: new Date(Date.now() - 3600000).toISOString(),
            evidenceCount: 8,
            indicators: [
              { type: 'process_access', value: 'lsass.exe', weight: 0.9 },
              { type: 'network_connection', value: 'suspicious_ip', weight: 0.7 },
              { type: 'file_creation', value: 'credential_dump', weight: 0.8 }
            ],
            relatedEvidence: [
              { id: 'ev_001', type: 'forensic_artifact', description: 'LSASS memory access event', matchScore: 95 },
              { id: 'ev_002', type: 'network_traffic', description: 'Outbound connection to C2', matchScore: 82 },
              { id: 'ev_003', type: 'malware_sample', description: 'Credential dumping tool', matchScore: 90 }
            ],
            mitreMapping: {
              technique: 'OS Credential Dumping',
              tactic: 'Credential Access',
              id: 'T1003'
            },
            status: 'investigating'
          },
          {
            id: 'pattern_002',
            name: 'Lateral Movement Sequence',
            description: 'Pattern of authentication attempts followed by remote execution',
            category: 'behavior',
            severity: 'critical',
            confidence: 94,
            frequency: 23,
            firstDetected: new Date(Date.now() - 86400000 * 3).toISOString(),
            lastDetected: new Date(Date.now() - 1800000).toISOString(),
            evidenceCount: 12,
            indicators: [
              { type: 'authentication', value: 'failed_logon', weight: 0.6 },
              { type: 'authentication', value: 'successful_logon', weight: 0.8 },
              { type: 'remote_execution', value: 'psexec', weight: 0.9 }
            ],
            relatedEvidence: [
              { id: 'ev_004', type: 'network_traffic', description: 'SMB traffic spike', matchScore: 87 },
              { id: 'ev_005', type: 'forensic_artifact', description: 'Windows event logs', matchScore: 91 },
              { id: 'ev_006', type: 'attack_pattern', description: 'Lateral movement TTP', matchScore: 96 }
            ],
            mitreMapping: {
              technique: 'Remote Services',
              tactic: 'Lateral Movement',
              id: 'T1021'
            },
            status: 'active'
          }
        ];

        const mockRules: PatternRule[] = [
          {
            id: 'rule_001',
            name: 'Suspicious Process Sequence',
            description: 'Detects sequences of suspicious process executions',
            enabled: true,
            conditions: [
              { field: 'process_name', operator: 'in', values: ['powershell.exe', 'cmd.exe', 'wscript.exe'] },
              { field: 'parent_process', operator: 'equals', value: 'winword.exe' }
            ],
            threshold: 3,
            severity: 'medium',
            lastModified: new Date(Date.now() - 86400000 * 5).toISOString()
          }
        ];
        
        setPatterns(mockPatterns);
        setRules(mockRules);
        addNotification('info', 'Pattern data loaded from demo data (business logic unavailable)');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch pattern data';
      setError(errorMsg);
      addNotification('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatterns = patterns.filter(pattern => {
    const matchesSearch = searchTerm === '' || 
      pattern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pattern.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || pattern.category === selectedCategory;
    const matchesSeverity = selectedSeverity === 'all' || pattern.severity === selectedSeverity;
    const matchesStatus = selectedStatus === 'all' || pattern.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesSeverity && matchesStatus;
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      'behavior': 'bg-blue-100 text-blue-800',
      'communication': 'bg-green-100 text-green-800',
      'persistence': 'bg-yellow-100 text-yellow-800',
      'evasion': 'bg-purple-100 text-purple-800',
      'exploitation': 'bg-red-100 text-red-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'false-positive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading pattern detection data...</div>
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
          <h1 className="text-3xl font-bold text-gray-900">Pattern Detection</h1>
          <p className="text-gray-600 mt-2">Automated detection and analysis of behavioral patterns in evidence</p>
        </div>
        <div className="flex space-x-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            New Rule
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            Run Detection
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('patterns')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'patterns'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Detected Patterns ({filteredPatterns.length})
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rules'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Detection Rules ({rules.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Pattern Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-blue-600">
            {filteredPatterns.length}
          </div>
          <div className="text-sm text-gray-600">Total Patterns</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-red-600">
            {filteredPatterns.filter(p => p.severity === 'critical').length}
          </div>
          <div className="text-sm text-gray-600">Critical</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-yellow-600">
            {filteredPatterns.filter(p => p.status === 'active').length}
          </div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-purple-600">
            {(filteredPatterns.reduce((sum, p) => sum + p.confidence, 0) / Math.max(filteredPatterns.length, 1)).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Avg Confidence</div>
        </div>
      </div>

      {/* Patterns List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredPatterns.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-medium mb-2">No Patterns Found</h3>
            <p>No patterns match your search criteria or none have been detected yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredPatterns.map((pattern) => (
              <div key={pattern.id} className="p-6 hover:bg-gray-50">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{pattern.name}</h3>
                    <p className="text-sm text-gray-600">{pattern.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(pattern.category)}`}>
                      {pattern.category.toUpperCase()}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(pattern.severity)}`}>
                      {pattern.severity.toUpperCase()}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(pattern.status)}`}>
                      {pattern.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-500">Confidence:</span>
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${
                            pattern.confidence >= 80 ? 'bg-green-500' :
                            pattern.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${pattern.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{pattern.confidence}%</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Frequency:</span>
                    <div className="font-medium text-gray-900">{pattern.frequency} occurrences</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Evidence:</span>
                    <div className="font-medium text-gray-900">{pattern.evidenceCount} items</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Last Detected:</span>
                    <div className="font-medium text-gray-900">{new Date(pattern.lastDetected).toLocaleDateString()}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                    View Details
                  </button>
                  <button className="text-green-600 hover:text-green-900 text-sm font-medium">
                    Investigate
                  </button>
                  <button className="text-purple-600 hover:text-purple-900 text-sm font-medium">
                    Export
                  </button>
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