'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api';
import { useServicePage } from '../../../lib/business-logic';
import { Evidence } from '../../../types/api';

interface ForensicArtifact extends Evidence {
  artifactType: 'filesystem' | 'registry' | 'memory' | 'network' | 'browser' | 'email' | 'logs' | 'mobile';
  source: string;
  extractionMethod: 'live' | 'post-mortem' | 'remote' | 'cloud';
  fileSystem?: {
    path: string;
    permissions: string;
    timestamps: {
      created: string;
      modified: string;
      accessed: string;
    };
  };
  registry?: {
    hive: string;
    key: string;
    value: string;
    dataType: string;
  };
  memory?: {
    processId: number;
    processName: string;
    memoryRegion: string;
    allocationType: string;
  };
  hash: string;
  size: number;
  preserved: boolean;
  chainOfCustody: string[];
  forensicTool: string;
  examinerNotes: string;
}

export default function ForensicArtifactsPage() {
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
  } = useServicePage('evidence-forensic');

  const [artifacts, setArtifacts] = useState<ForensicArtifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [preservedOnly, setPreservedOnly] = useState(false);

  useEffect(() => {
    fetchForensicArtifacts();
  }, [selectedType, selectedMethod, preservedOnly]);

  const fetchForensicArtifacts = async () => {
    try {
      setLoading(true);
      
      // Use business logic first
      const businessResponse = await execute('getForensicArtifacts', { 
        type: selectedType,
        method: selectedMethod,
        preserved: preservedOnly 
      });
      
      if (businessResponse.success && businessResponse.data) {
        setArtifacts(businessResponse.data);
        addNotification('success', 'Forensic artifacts loaded successfully via business logic');
      } else {
        // Fallback to mock data for demo
        const mockArtifacts: ForensicArtifact[] = [
          {
            id: 'fa_001',
            type: 'forensic_artifact',
            description: 'Suspicious registry modification in HKEY_LOCAL_MACHINE',
            artifactType: 'registry',
            source: 'Workstation-DC01',
            extractionMethod: 'live',
            registry: {
              hive: 'HKEY_LOCAL_MACHINE',
              key: 'SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run',
              value: 'MaliciousService',
              dataType: 'REG_SZ'
            },
            hash: 'a1b2c3d4e5f6789012345678901234567890abcdef01234567890abcdef012345',
            size: 512,
            preserved: true,
            chainOfCustody: ['Investigator John Doe', 'Lead Analyst Jane Smith'],
            forensicTool: 'Registry Recon',
            examinerNotes: 'Unauthorized startup entry detected, appears to be persistence mechanism',
            createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
            updatedAt: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 'fa_002',
            type: 'forensic_artifact',
            description: 'Deleted file recovered from unallocated space',
            artifactType: 'filesystem',
            source: 'Employee-Laptop-045',
            extractionMethod: 'post-mortem',
            fileSystem: {
              path: 'C:\\Users\\Employee\\Documents\\confidential_data.xlsx',
              permissions: 'rw-rw----',
              timestamps: {
                created: new Date(Date.now() - 86400000 * 7).toISOString(),
                modified: new Date(Date.now() - 86400000 * 2).toISOString(),
                accessed: new Date(Date.now() - 86400000 * 1).toISOString()
              }
            },
            hash: 'b2c3d4e5f6789012345678901234567890abcdef01234567890abcdef023456',
            size: 2048576,
            preserved: true,
            chainOfCustody: ['Forensic Specialist Mike Wilson', 'Senior Investigator Sarah Lee'],
            forensicTool: 'EnCase Forensic',
            examinerNotes: 'File deleted but recoverable, contains sensitive financial data',
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            updatedAt: new Date(Date.now() - 1800000).toISOString()
          },
          {
            id: 'fa_003',
            type: 'forensic_artifact',
            description: 'Memory dump showing malicious process injection',
            artifactType: 'memory',
            source: 'Server-PROD-001',
            extractionMethod: 'live',
            memory: {
              processId: 1337,
              processName: 'svchost.exe',
              memoryRegion: '0x7FF800000000-0x7FF801000000',
              allocationType: 'MEM_COMMIT'
            },
            hash: 'c3d4e5f6789012345678901234567890abcdef01234567890abcdef034567',
            size: 67108864,
            preserved: false,
            chainOfCustody: ['IR Team Lead David Chen'],
            forensicTool: 'Volatility Framework',
            examinerNotes: 'Process injection detected, possible DLL hijacking attempt',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 900000).toISOString()
          }
        ];
        
        setArtifacts(mockArtifacts);
        addNotification('info', 'Forensic artifacts loaded from demo data (business logic unavailable)');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch forensic artifacts';
      setError(errorMsg);
      addNotification('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const filteredArtifacts = artifacts.filter(artifact => {
    const matchesSearch = searchTerm === '' || 
      artifact.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artifact.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artifact.forensicTool.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || artifact.artifactType === selectedType;
    const matchesMethod = selectedMethod === 'all' || artifact.extractionMethod === selectedMethod;
    const matchesPreserved = !preservedOnly || artifact.preserved;
    
    return matchesSearch && matchesType && matchesMethod && matchesPreserved;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'filesystem': return '📁';
      case 'registry': return '⚙️';
      case 'memory': return '🧠';
      case 'network': return '🌐';
      case 'browser': return '🌏';
      case 'email': return '📧';
      case 'logs': return '📝';
      case 'mobile': return '📱';
      default: return '📋';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'filesystem': return 'bg-blue-100 text-blue-800';
      case 'registry': return 'bg-purple-100 text-purple-800';
      case 'memory': return 'bg-green-100 text-green-800';
      case 'network': return 'bg-orange-100 text-orange-800';
      case 'browser': return 'bg-yellow-100 text-yellow-800';
      case 'email': return 'bg-pink-100 text-pink-800';
      case 'logs': return 'bg-gray-100 text-gray-800';
      case 'mobile': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'live': return 'bg-green-100 text-green-800';
      case 'post-mortem': return 'bg-red-100 text-red-800';
      case 'remote': return 'bg-blue-100 text-blue-800';
      case 'cloud': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading forensic artifacts...</div>
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
          <h1 className="text-3xl font-bold text-gray-900">Forensic Artifacts Evidence</h1>
          <p className="text-gray-600 mt-2">Digital forensic evidence collection and analysis</p>
        </div>
        <div className="flex space-x-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Collect Artifact
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            Timeline Analysis
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Artifact Type
            </label>
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Types</option>
              <option value="filesystem">File System</option>
              <option value="registry">Registry</option>
              <option value="memory">Memory</option>
              <option value="network">Network</option>
              <option value="browser">Browser</option>
              <option value="email">Email</option>
              <option value="logs">Logs</option>
              <option value="mobile">Mobile</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Extraction Method
            </label>
            <select 
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Methods</option>
              <option value="live">Live Acquisition</option>
              <option value="post-mortem">Post-mortem</option>
              <option value="remote">Remote</option>
              <option value="cloud">Cloud</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search artifacts..."
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={preservedOnly}
                  onChange={(e) => setPreservedOnly(e.target.checked)}
                  className="mr-2"
                />
                Preserved Only
              </label>
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchForensicArtifacts}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors w-full"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Forensic Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-blue-600">
            {filteredArtifacts.length}
          </div>
          <div className="text-sm text-gray-600">Total Artifacts</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-green-600">
            {filteredArtifacts.filter(a => a.preserved).length}
          </div>
          <div className="text-sm text-gray-600">Preserved</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-purple-600">
            {filteredArtifacts.filter(a => a.artifactType === 'filesystem').length}
          </div>
          <div className="text-sm text-gray-600">File System</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-orange-600">
            {filteredArtifacts.filter(a => a.artifactType === 'memory').length}
          </div>
          <div className="text-sm text-gray-600">Memory</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-yellow-600">
            {filteredArtifacts.filter(a => a.extractionMethod === 'live').length}
          </div>
          <div className="text-sm text-gray-600">Live Collection</div>
        </div>
      </div>

      {/* Forensic Artifacts List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredArtifacts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-medium mb-2">No Forensic Artifacts Found</h3>
            <p>Collect digital forensic evidence or adjust your search criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredArtifacts.map((artifact) => (
              <div key={artifact.id} className="p-6 hover:bg-gray-50">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getTypeIcon(artifact.artifactType)}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{artifact.description}</h3>
                      <p className="text-sm text-gray-600">Source: {artifact.source}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(artifact.artifactType)}`}>
                      {artifact.artifactType.charAt(0).toUpperCase() + artifact.artifactType.slice(1)}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMethodColor(artifact.extractionMethod)}`}>
                      {artifact.extractionMethod.charAt(0).toUpperCase() + artifact.extractionMethod.slice(1)}
                    </span>
                    {artifact.preserved && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Preserved
                      </span>
                    )}
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-500">Tool Used:</span>
                    <div className="font-medium text-gray-900">{artifact.forensicTool}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Size:</span>
                    <div className="font-medium text-gray-900">{formatFileSize(artifact.size)}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Chain of Custody:</span>
                    <div className="font-medium text-gray-900">{artifact.chainOfCustody.length} entries</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Collected:</span>
                    <div className="font-medium text-gray-900">{new Date(artifact.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                {/* Specific Artifact Details */}
                {artifact.fileSystem && (
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">File System Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-blue-700">Path:</span>
                        <div className="font-mono text-blue-900 break-all">{artifact.fileSystem.path}</div>
                      </div>
                      <div>
                        <span className="text-blue-700">Permissions:</span>
                        <div className="font-mono text-blue-900">{artifact.fileSystem.permissions}</div>
                      </div>
                      <div>
                        <span className="text-blue-700">Created:</span>
                        <div className="text-blue-900">{new Date(artifact.fileSystem.timestamps.created).toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-blue-700">Modified:</span>
                        <div className="text-blue-900">{new Date(artifact.fileSystem.timestamps.modified).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                )}

                {artifact.registry && (
                  <div className="bg-purple-50 p-4 rounded-lg mb-4">
                    <h4 className="text-sm font-medium text-purple-900 mb-2">Registry Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-purple-700">Hive:</span>
                        <div className="font-mono text-purple-900">{artifact.registry.hive}</div>
                      </div>
                      <div>
                        <span className="text-purple-700">Data Type:</span>
                        <div className="font-mono text-purple-900">{artifact.registry.dataType}</div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-purple-700">Key:</span>
                        <div className="font-mono text-purple-900 break-all">{artifact.registry.key}</div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-purple-700">Value:</span>
                        <div className="font-mono text-purple-900">{artifact.registry.value}</div>
                      </div>
                    </div>
                  </div>
                )}

                {artifact.memory && (
                  <div className="bg-green-50 p-4 rounded-lg mb-4">
                    <h4 className="text-sm font-medium text-green-900 mb-2">Memory Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-green-700">Process:</span>
                        <div className="font-mono text-green-900">{artifact.memory.processName} (PID: {artifact.memory.processId})</div>
                      </div>
                      <div>
                        <span className="text-green-700">Allocation:</span>
                        <div className="font-mono text-green-900">{artifact.memory.allocationType}</div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-green-700">Memory Region:</span>
                        <div className="font-mono text-green-900">{artifact.memory.memoryRegion}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Hash and Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-500">Hash (SHA256):</span>
                    <div className="font-mono text-xs text-gray-700 break-all">{artifact.hash}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Examiner Notes:</span>
                    <div className="text-sm text-gray-700">{artifact.examinerNotes}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                    View Details
                  </button>
                  <button className="text-green-600 hover:text-green-900 text-sm font-medium">
                    Timeline
                  </button>
                  <button className="text-purple-600 hover:text-purple-900 text-sm font-medium">
                    Export
                  </button>
                  <button className="text-orange-600 hover:text-orange-900 text-sm font-medium">
                    Correlate
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