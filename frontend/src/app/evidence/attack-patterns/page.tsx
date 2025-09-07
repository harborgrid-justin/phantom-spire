'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api';
import { useServicePage } from '../../../lib/business-logic';
import { Evidence } from '../../../types/api';

interface AttackPatternEvidence extends Evidence {
  patternName: string;
  mitreId?: string;
  tactics: string[];
  techniques: string[];
  phase: 'reconnaissance' | 'initial-access' | 'execution' | 'persistence' | 'privilege-escalation' | 'defense-evasion' | 'credential-access' | 'discovery' | 'lateral-movement' | 'collection' | 'exfiltration' | 'impact';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  observedBehaviors: {
    indicator: string;
    category: string;
    frequency: number;
  }[];
  affectedSystems: string[];
  relatedCampaigns: string[];
  countermeasures: {
    type: 'prevention' | 'detection' | 'response';
    measure: string;
    effectiveness: number;
  }[];
  firstObserved: string;
  lastObserved: string;
  analysisStatus: 'pending' | 'in-progress' | 'completed' | 'verified';
}

export default function AttackPatternsPage() {
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
  } = useServicePage('evidence-attack-patterns');

  const [patterns, setPatterns] = useState<AttackPatternEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAttackPatterns();
  }, [selectedPhase, selectedSeverity, selectedStatus]);

  const fetchAttackPatterns = async () => {
    try {
      setLoading(true);
      
      // Use business logic first
      const businessResponse = await execute('getAttackPatterns', { 
        phase: selectedPhase,
        severity: selectedSeverity,
        status: selectedStatus
      });
      
      if (businessResponse.success && businessResponse.data) {
        setPatterns(businessResponse.data);
        addNotification('success', 'Attack patterns loaded successfully via business logic');
      } else {
        // Fallback to mock data for demo
        const mockPatterns: AttackPatternEvidence[] = [
          {
            id: 'ap_001',
            type: 'attack_pattern',
            description: 'Spear phishing email campaign targeting finance department',
            patternName: 'Spear Phishing Attachment',
            mitreId: 'T1566.001',
            tactics: ['Initial Access'],
            techniques: ['Spear Phishing Attachment', 'User Execution'],
            phase: 'initial-access',
            severity: 'high',
            confidence: 85,
            observedBehaviors: [
              { indicator: 'Malicious email attachment', category: 'email', frequency: 15 },
              { indicator: 'Suspicious macro execution', category: 'execution', frequency: 12 },
              { indicator: 'Outbound C2 communication', category: 'network', frequency: 8 }
            ],
            affectedSystems: ['WS-FINANCE-01', 'WS-FINANCE-03', 'WS-FINANCE-07'],
            relatedCampaigns: ['Operation FakeInvoice', 'APT29 Q4 Campaign'],
            countermeasures: [
              { type: 'prevention', measure: 'Email attachment blocking', effectiveness: 90 },
              { type: 'detection', measure: 'Macro execution monitoring', effectiveness: 85 },
              { type: 'response', measure: 'Automated quarantine', effectiveness: 95 }
            ],
            firstObserved: new Date(Date.now() - 86400000 * 14).toISOString(),
            lastObserved: new Date(Date.now() - 86400000 * 2).toISOString(),
            analysisStatus: 'completed',
            createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
            updatedAt: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 'ap_002',
            type: 'attack_pattern',
            description: 'Living off the land technique using PowerShell for data exfiltration',
            patternName: 'PowerShell Command and Control',
            mitreId: 'T1059.001',
            tactics: ['Execution', 'Command and Control'],
            techniques: ['PowerShell', 'Application Layer Protocol'],
            phase: 'exfiltration',
            severity: 'critical',
            confidence: 92,
            observedBehaviors: [
              { indicator: 'Encoded PowerShell commands', category: 'execution', frequency: 25 },
              { indicator: 'DNS tunneling traffic', category: 'network', frequency: 18 },
              { indicator: 'Large data uploads', category: 'exfiltration', frequency: 6 }
            ],
            affectedSystems: ['SRV-DATABASE-01', 'WS-ADMIN-02', 'SRV-FILE-01'],
            relatedCampaigns: ['Operation DataSiphon'],
            countermeasures: [
              { type: 'prevention', measure: 'PowerShell execution policy', effectiveness: 70 },
              { type: 'detection', measure: 'Command line monitoring', effectiveness: 88 },
              { type: 'response', measure: 'Network traffic analysis', effectiveness: 82 }
            ],
            firstObserved: new Date(Date.now() - 86400000 * 7).toISOString(),
            lastObserved: new Date(Date.now() - 86400000 * 1).toISOString(),
            analysisStatus: 'in-progress',
            createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
            updatedAt: new Date(Date.now() - 1800000).toISOString()
          },
          {
            id: 'ap_003',
            type: 'attack_pattern',
            description: 'Credential dumping from LSASS memory using Mimikatz-like tools',
            patternName: 'OS Credential Dumping',
            mitreId: 'T1003.001',
            tactics: ['Credential Access'],
            techniques: ['LSASS Memory', 'OS Credential Dumping'],
            phase: 'credential-access',
            severity: 'high',
            confidence: 88,
            observedBehaviors: [
              { indicator: 'LSASS process access', category: 'process', frequency: 8 },
              { indicator: 'Credential dump files', category: 'file', frequency: 3 },
              { indicator: 'Lateral movement attempts', category: 'network', frequency: 12 }
            ],
            affectedSystems: ['DC-01', 'WS-ADMIN-01'],
            relatedCampaigns: ['Operation CredHarvest'],
            countermeasures: [
              { type: 'prevention', measure: 'Credential Guard', effectiveness: 95 },
              { type: 'detection', measure: 'Process monitoring', effectiveness: 90 },
              { type: 'response', measure: 'Immediate password reset', effectiveness: 85 }
            ],
            firstObserved: new Date(Date.now() - 86400000 * 5).toISOString(),
            lastObserved: new Date(Date.now() - 86400000 * 1).toISOString(),
            analysisStatus: 'verified',
            createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
            updatedAt: new Date(Date.now() - 900000).toISOString()
          }
        ];
        
        setPatterns(mockPatterns);
        addNotification('info', 'Attack patterns loaded from demo data (business logic unavailable)');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch attack patterns';
      setError(errorMsg);
      addNotification('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatterns = patterns.filter(pattern => {
    const matchesSearch = searchTerm === '' || 
      pattern.patternName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pattern.mitreId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pattern.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPhase = selectedPhase === 'all' || pattern.phase === selectedPhase;
    const matchesSeverity = selectedSeverity === 'all' || pattern.severity === selectedSeverity;
    const matchesStatus = selectedStatus === 'all' || pattern.analysisStatus === selectedStatus;
    
    return matchesSearch && matchesPhase && matchesSeverity && matchesStatus;
  });

  const getPhaseColor = (phase: string) => {
    const colors = {
      'reconnaissance': 'bg-gray-100 text-gray-800',
      'initial-access': 'bg-red-100 text-red-800',
      'execution': 'bg-orange-100 text-orange-800',
      'persistence': 'bg-yellow-100 text-yellow-800',
      'privilege-escalation': 'bg-green-100 text-green-800',
      'defense-evasion': 'bg-blue-100 text-blue-800',
      'credential-access': 'bg-purple-100 text-purple-800',
      'discovery': 'bg-pink-100 text-pink-800',
      'lateral-movement': 'bg-indigo-100 text-indigo-800',
      'collection': 'bg-teal-100 text-teal-800',
      'exfiltration': 'bg-red-100 text-red-800',
      'impact': 'bg-black text-white'
    };
    return colors[phase as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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
      case 'completed': return 'bg-green-100 text-green-800';
      case 'verified': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading attack patterns...</div>
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
          <h1 className="text-3xl font-bold text-gray-900">Attack Patterns Evidence</h1>
          <p className="text-gray-600 mt-2">Analyze and track adversary tactics, techniques, and procedures</p>
        </div>
        <div className="flex space-x-2">
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
            New Pattern
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            MITRE Mapping
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kill Chain Phase
            </label>
            <select 
              value={selectedPhase}
              onChange={(e) => setSelectedPhase(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Phases</option>
              <option value="reconnaissance">Reconnaissance</option>
              <option value="initial-access">Initial Access</option>
              <option value="execution">Execution</option>
              <option value="persistence">Persistence</option>
              <option value="privilege-escalation">Privilege Escalation</option>
              <option value="defense-evasion">Defense Evasion</option>
              <option value="credential-access">Credential Access</option>
              <option value="discovery">Discovery</option>
              <option value="lateral-movement">Lateral Movement</option>
              <option value="collection">Collection</option>
              <option value="exfiltration">Exfiltration</option>
              <option value="impact">Impact</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severity
            </label>
            <select 
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Analysis Status
            </label>
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="verified">Verified</option>
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
              placeholder="Search patterns or MITRE IDs..."
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Attack Pattern Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-red-600">
            {filteredPatterns.length}
          </div>
          <div className="text-sm text-gray-600">Total Patterns</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-orange-600">
            {filteredPatterns.filter(p => p.severity === 'critical').length}
          </div>
          <div className="text-sm text-gray-600">Critical</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-blue-600">
            {filteredPatterns.filter(p => p.analysisStatus === 'verified').length}
          </div>
          <div className="text-sm text-gray-600">Verified</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-purple-600">
            {[...new Set(filteredPatterns.flatMap(p => p.tactics))].length}
          </div>
          <div className="text-sm text-gray-600">Unique Tactics</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-green-600">
            {(filteredPatterns.reduce((sum, p) => sum + p.confidence, 0) / Math.max(filteredPatterns.length, 1)).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Avg Confidence</div>
        </div>
      </div>

      {/* Attack Patterns List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredPatterns.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-lg font-medium mb-2">No Attack Patterns Found</h3>
            <p>Create attack pattern evidence or adjust your search criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredPatterns.map((pattern) => (
              <div key={pattern.id} className="p-6 hover:bg-gray-50">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{pattern.patternName}</h3>
                      {pattern.mitreId && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {pattern.mitreId}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{pattern.description}</p>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPhaseColor(pattern.phase)}`}>
                      {pattern.phase.replace('-', ' ').toUpperCase()}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(pattern.severity)}`}>
                      {pattern.severity.toUpperCase()}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(pattern.analysisStatus)}`}>
                      {pattern.analysisStatus.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Basic Info */}
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
                    <span className="text-sm text-gray-500">Affected Systems:</span>
                    <div className="font-medium text-gray-900">{pattern.affectedSystems.length}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Related Campaigns:</span>
                    <div className="font-medium text-gray-900">{pattern.relatedCampaigns.length}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Behaviors:</span>
                    <div className="font-medium text-gray-900">{pattern.observedBehaviors.length}</div>
                  </div>
                </div>

                {/* Tactics and Techniques */}
                <div className="mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Tactics</h4>
                      <div className="flex flex-wrap gap-1">
                        {pattern.tactics.map((tactic, index) => (
                          <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {tactic}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Techniques</h4>
                      <div className="flex flex-wrap gap-1">
                        {pattern.techniques.map((technique, index) => (
                          <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {technique}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Observed Behaviors */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Top Observed Behaviors</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {pattern.observedBehaviors.slice(0, 3).map((behavior, index) => (
                      <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                        <div className="font-medium text-gray-900">{behavior.indicator}</div>
                        <div className="text-gray-600 text-xs">
                          {behavior.category} • {behavior.frequency} occurrences
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Countermeasures */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Countermeasures</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {pattern.countermeasures.map((measure, index) => (
                      <div key={index} className="bg-green-50 p-2 rounded text-sm">
                        <div className="flex justify-between items-start">
                          <span className={`text-xs px-2 py-1 rounded ${
                            measure.type === 'prevention' ? 'bg-green-100 text-green-800' :
                            measure.type === 'detection' ? 'bg-blue-100 text-blue-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {measure.type}
                          </span>
                          <span className="text-xs text-green-600 font-medium">{measure.effectiveness}%</span>
                        </div>
                        <div className="font-medium text-gray-900 mt-1">{measure.measure}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline */}
                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                  <span>First Observed: {new Date(pattern.firstObserved).toLocaleDateString()}</span>
                  <span>Last Observed: {new Date(pattern.lastObserved).toLocaleDateString()}</span>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                    View Details
                  </button>
                  <button className="text-green-600 hover:text-green-900 text-sm font-medium">
                    MITRE Map
                  </button>
                  <button className="text-purple-600 hover:text-purple-900 text-sm font-medium">
                    Correlate
                  </button>
                  <button className="text-orange-600 hover:text-orange-900 text-sm font-medium">
                    Generate IOCs
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