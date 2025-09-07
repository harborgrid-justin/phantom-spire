'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api';
import { useServicePage } from '../../../lib/business-logic';
import { Evidence } from '../../../types/api';

interface CustodyEntry {
  id: string;
  evidenceId: string;
  action: 'created' | 'accessed' | 'modified' | 'transferred' | 'analyzed' | 'archived';
  userId: string;
  userName: string;
  timestamp: string;
  location: string;
  details: string;
  signature?: string;
  previousHash?: string;
  currentHash: string;
  verified: boolean;
}

interface CustodyChain {
  evidenceId: string;
  evidenceTitle: string;
  evidenceType: string;
  totalEntries: number;
  firstEntry: string;
  lastEntry: string;
  verified: boolean;
  integrityStatus: 'intact' | 'compromised' | 'unknown';
  entries: CustodyEntry[];
}

export default function ChainOfCustodyTrackingPage() {
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
  } = useServicePage('evidence-custody');

  const [custodyChains, setCustodyChains] = useState<CustodyChain[]>([]);
  const [selectedChain, setSelectedChain] = useState<CustodyChain | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    fetchCustodyData();
  }, [selectedStatus]);

  const fetchCustodyData = async () => {
    try {
      setLoading(true);
      
      // Use business logic first
      const businessResponse = await execute('getCustodyChains', { 
        status: selectedStatus 
      });
      
      if (businessResponse.success && businessResponse.data) {
        setCustodyChains(businessResponse.data);
        addNotification('success', 'Custody data loaded successfully via business logic');
      } else {
        // Fallback to mock data for demo
        const mockCustodyChains: CustodyChain[] = [
          {
            evidenceId: 'ev_001',
            evidenceTitle: 'Suspicious Network Traffic Log',
            evidenceType: 'network_traffic',
            totalEntries: 5,
            firstEntry: new Date(Date.now() - 86400000 * 3).toISOString(),
            lastEntry: new Date(Date.now() - 3600000).toISOString(),
            verified: true,
            integrityStatus: 'intact',
            entries: [
              {
                id: 'c1',
                evidenceId: 'ev_001',
                action: 'created',
                userId: 'u1',
                userName: 'John Doe',
                timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
                location: 'SOC Lab 1',
                details: 'Evidence collected from network monitoring system',
                currentHash: 'abc123...',
                verified: true
              },
              {
                id: 'c2',
                evidenceId: 'ev_001',
                action: 'accessed',
                userId: 'u2',
                userName: 'Jane Smith',
                timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
                location: 'Analysis Workstation 3',
                details: 'Accessed for initial analysis',
                previousHash: 'abc123...',
                currentHash: 'def456...',
                verified: true
              },
              {
                id: 'c3',
                evidenceId: 'ev_001',
                action: 'analyzed',
                userId: 'u2',
                userName: 'Jane Smith',
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                location: 'Analysis Workstation 3',
                details: 'Pattern analysis completed, malicious indicators found',
                previousHash: 'def456...',
                currentHash: 'ghi789...',
                verified: true
              }
            ]
          },
          {
            evidenceId: 'ev_002',
            evidenceTitle: 'Malware Sample',
            evidenceType: 'malware_sample',
            totalEntries: 3,
            firstEntry: new Date(Date.now() - 86400000).toISOString(),
            lastEntry: new Date(Date.now() - 1800000).toISOString(),
            verified: false,
            integrityStatus: 'unknown',
            entries: []
          }
        ];
        
        setCustodyChains(mockCustodyChains);
        addNotification('info', 'Custody data loaded from demo data (business logic unavailable)');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch custody data';
      setError(errorMsg);
      addNotification('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const filteredChains = custodyChains.filter(chain => {
    const matchesSearch = searchTerm === '' || 
      chain.evidenceTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chain.evidenceId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || chain.integrityStatus === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return '📝';
      case 'accessed': return '👁️';
      case 'modified': return '✏️';
      case 'transferred': return '🔄';
      case 'analyzed': return '🔍';
      case 'archived': return '📦';
      default: return '📋';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created': return 'bg-green-100 text-green-800';
      case 'accessed': return 'bg-blue-100 text-blue-800';
      case 'modified': return 'bg-yellow-100 text-yellow-800';
      case 'transferred': return 'bg-purple-100 text-purple-800';
      case 'analyzed': return 'bg-orange-100 text-orange-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIntegrityStatusColor = (status: string) => {
    switch (status) {
      case 'intact': return 'text-green-600';
      case 'compromised': return 'text-red-600';
      case 'unknown': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading chain of custody data...</div>
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
          <h1 className="text-3xl font-bold text-gray-900">Chain of Custody Tracking</h1>
          <p className="text-gray-600 mt-2">Monitor evidence handling and maintain integrity verification</p>
        </div>
        <div className="flex space-x-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Verify All
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            Export Audit
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Evidence
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by evidence ID or title..."
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Integrity Status
            </label>
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Statuses</option>
              <option value="intact">Intact</option>
              <option value="compromised">Compromised</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchCustodyData}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors w-full"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Custody Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-blue-600">
            {filteredChains.length}
          </div>
          <div className="text-sm text-gray-600">Total Evidence</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-green-600">
            {filteredChains.filter(c => c.integrityStatus === 'intact').length}
          </div>
          <div className="text-sm text-gray-600">Intact</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-red-600">
            {filteredChains.filter(c => c.integrityStatus === 'compromised').length}
          </div>
          <div className="text-sm text-gray-600">Compromised</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-yellow-600">
            {filteredChains.filter(c => !c.verified).length}
          </div>
          <div className="text-sm text-gray-600">Unverified</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Evidence List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Evidence Items</h2>
          </div>
          
          {filteredChains.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-lg font-medium mb-2">No Evidence Found</h3>
              <p>No evidence items match your search criteria.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {filteredChains.map((chain) => (
                <div 
                  key={chain.evidenceId} 
                  className={`p-4 hover:bg-gray-50 cursor-pointer ${selectedChain?.evidenceId === chain.evidenceId ? 'bg-blue-50' : ''}`}
                  onClick={() => setSelectedChain(chain)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">{chain.evidenceTitle}</div>
                    <div className={`flex items-center ${getIntegrityStatusColor(chain.integrityStatus)}`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        chain.integrityStatus === 'intact' ? 'bg-green-500' :
                        chain.integrityStatus === 'compromised' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}></div>
                      {chain.integrityStatus}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    ID: {chain.evidenceId} • Type: {chain.evidenceType}
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{chain.totalEntries} entries</span>
                    <span>Last: {new Date(chain.lastEntry).toLocaleDateString()}</span>
                    {chain.verified ? (
                      <span className="text-green-600">✓ Verified</span>
                    ) : (
                      <span className="text-red-600">⚠ Unverified</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Custody Chain Details */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedChain ? `Custody Chain: ${selectedChain.evidenceTitle}` : 'Select Evidence Item'}
            </h2>
          </div>
          
          {selectedChain ? (
            <div className="p-6">
              {/* Chain Summary */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Evidence ID:</span>
                    <div className="font-medium">{selectedChain.evidenceId}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <div className="font-medium">{selectedChain.evidenceType}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Total Entries:</span>
                    <div className="font-medium">{selectedChain.totalEntries}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Integrity:</span>
                    <div className={`font-medium ${getIntegrityStatusColor(selectedChain.integrityStatus)}`}>
                      {selectedChain.integrityStatus.charAt(0).toUpperCase() + selectedChain.integrityStatus.slice(1)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Custody Entries */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Custody Timeline</h3>
                {selectedChain.entries.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-2xl mb-2">📝</div>
                    <p>No custody entries available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedChain.entries.map((entry, index) => (
                      <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getActionIcon(entry.action)}</span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(entry.action)}`}>
                              {entry.action.charAt(0).toUpperCase() + entry.action.slice(1)}
                            </span>
                          </div>
                          {entry.verified ? (
                            <span className="text-green-600 text-sm">✓ Verified</span>
                          ) : (
                            <span className="text-red-600 text-sm">⚠ Unverified</span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                          <div>
                            <span className="text-gray-500">User:</span>
                            <div className="font-medium">{entry.userName}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Location:</span>
                            <div className="font-medium">{entry.location}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Timestamp:</span>
                            <div className="font-medium">{new Date(entry.timestamp).toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Hash:</span>
                            <div className="font-mono text-xs">{entry.currentHash}</div>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-700">
                          <span className="text-gray-500">Details:</span> {entry.details}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex space-x-2">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm">
                    Verify Integrity
                  </button>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm">
                    Export Chain
                  </button>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors text-sm">
                    Add Entry
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-4">👈</div>
              <h3 className="text-lg font-medium mb-2">Select Evidence Item</h3>
              <p>Choose an evidence item from the left to view its custody chain.</p>
            </div>
          )}
        </div>
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