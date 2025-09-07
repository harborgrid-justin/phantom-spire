'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api';
import { useServicePage } from '../../../lib/business-logic';
import { Evidence } from '../../../types/api';

interface ThreatIntelEvidence extends Evidence {
  threatType: 'apt' | 'malware' | 'campaign' | 'actor' | 'technique';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  sources: string[];
  attribution?: string;
  targets?: string[];
  ttps?: string[];
}

export default function ThreatIntelligencePage() {
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
  } = useServicePage('evidence-threat-intel');

  const [evidence, setEvidence] = useState<ThreatIntelEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchThreatIntelEvidence();
  }, [selectedSeverity, selectedType]);

  const fetchThreatIntelEvidence = async () => {
    try {
      setLoading(true);
      
      // Use business logic first
      const businessResponse = await execute('getThreatIntelEvidence', { 
        severity: selectedSeverity,
        type: selectedType 
      });
      
      if (businessResponse.success && businessResponse.data) {
        setEvidence(businessResponse.data);
        addNotification('success', 'Threat Intelligence evidence loaded successfully via business logic');
      } else {
        // Fallback to direct API
        const response = await apiClient.getEvidence();
        if (response.data && typeof response.data === 'object' && response.data !== null && 'data' in response.data && Array.isArray((response.data as any).data)) {
          const threatIntelEvidence = (response.data as any).data.filter((e: Evidence) => e.type === 'threat_intelligence');
          setEvidence(threatIntelEvidence);
          addNotification('info', 'Threat Intelligence evidence loaded via direct API (business logic unavailable)');
        } else if (response.error) {
          setError(response.error);
          addNotification('error', `Failed to load threat intelligence evidence: ${response.error}`);
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch threat intelligence evidence';
      setError(errorMsg);
      addNotification('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvidence = evidence.filter(e => {
    const matchesSearch = searchTerm === '' || 
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.attribution?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = selectedSeverity === 'all' || e.severity === selectedSeverity;
    const matchesType = selectedType === 'all' || e.threatType === selectedType;
    
    return matchesSearch && matchesSeverity && matchesType;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading threat intelligence evidence...</div>
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
          <h1 className="text-3xl font-bold text-gray-900">Threat Intelligence Evidence</h1>
          <p className="text-gray-600 mt-2">Manage and analyze threat intelligence data and attribution evidence</p>
        </div>
        <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
          Add Threat Intel
        </button>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Threat Type
            </label>
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Types</option>
              <option value="apt">APT Groups</option>
              <option value="malware">Malware</option>
              <option value="campaign">Campaigns</option>
              <option value="actor">Threat Actors</option>
              <option value="technique">Techniques</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severity Level
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
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by description or attribution..."
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchThreatIntelEvidence}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors w-full"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Threat Intelligence Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-red-600">
            {filteredEvidence.length}
          </div>
          <div className="text-sm text-gray-600">Total Threats</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-purple-600">
            {filteredEvidence.filter(e => e.threatType === 'apt').length}
          </div>
          <div className="text-sm text-gray-600">APT Groups</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-orange-600">
            {filteredEvidence.filter(e => e.threatType === 'malware').length}
          </div>
          <div className="text-sm text-gray-600">Malware</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-blue-600">
            {filteredEvidence.filter(e => e.threatType === 'campaign').length}
          </div>
          <div className="text-sm text-gray-600">Campaigns</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-yellow-600">
            {filteredEvidence.filter(e => e.severity === 'critical').length}
          </div>
          <div className="text-sm text-gray-600">Critical</div>
        </div>
      </div>

      {/* Threat Intelligence Evidence List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredEvidence.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-lg font-medium mb-2">No Threat Intelligence Found</h3>
            <p>Start by adding threat intelligence evidence or adjust your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredEvidence.map((item) => (
              <div key={item.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.threatType === 'apt' ? 'bg-purple-100 text-purple-800' :
                    item.threatType === 'malware' ? 'bg-red-100 text-red-800' :
                    item.threatType === 'campaign' ? 'bg-blue-100 text-blue-800' :
                    item.threatType === 'actor' ? 'bg-orange-100 text-orange-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {item.threatType?.toUpperCase() || 'THREAT'}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.severity === 'critical' ? 'bg-red-100 text-red-800' :
                    item.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                    item.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {item.severity?.toUpperCase() || 'UNKNOWN'}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.attribution || 'Unknown Threat'}
                </h3>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {item.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Confidence:</span>
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${
                            (item.confidence || 50) >= 80 ? 'bg-green-500' :
                            (item.confidence || 50) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${item.confidence || 50}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">{item.confidence || 50}%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Sources:</span>
                    <span className="text-gray-700">{item.sources?.length || 1}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">TTPs:</span>
                    <span className="text-gray-700">{item.ttps?.length || 0}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Targets:</span>
                    <span className="text-gray-700">{item.targets?.length || 0}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                  <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                  <span>Updated: {new Date(item.updatedAt).toLocaleDateString()}</span>
                </div>

                <div className="flex space-x-2">
                  <button className="flex-1 text-xs bg-blue-100 text-blue-700 px-3 py-2 rounded hover:bg-blue-200 transition-colors">
                    Analyze
                  </button>
                  <button className="flex-1 text-xs bg-green-100 text-green-700 px-3 py-2 rounded hover:bg-green-200 transition-colors">
                    Correlate
                  </button>
                  <button className="flex-1 text-xs bg-purple-100 text-purple-700 px-3 py-2 rounded hover:bg-purple-200 transition-colors">
                    Report
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