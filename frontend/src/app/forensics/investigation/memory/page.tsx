'use client';

import { useEffect, useState } from 'react';
import { useServicePage } from '../../../../lib/business-logic';

export default function MemoryForensicsPage() {
  const [memoryData, setMemoryData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const {
    notifications,
    addNotification,
    removeNotification,
    execute
  } = useServicePage('investigation-memory');

  useEffect(() => {
    fetchMemoryData();
  }, []);

  const fetchMemoryData = async () => {
    try {
      setLoading(true);
      const response = await execute('getMemoryForensicsData');
      
      if (response.success && response.data) {
        setMemoryData(response.data);
        addNotification('success', 'Memory forensics data loaded successfully');
      } else {
        const mockData = {
          acquisitionId: 'mem_dump_001',
          status: 'completed',
          processCount: 156,
          suspiciousProcesses: 3,
          networkConnections: 45,
          maliciousConnections: 2,
          artifacts: {
            injectedCode: 1,
            hiddenProcesses: 2,
            rootkitIndicators: 1,
            encryptedMemory: 0
          },
          analysisModules: {
            process_analysis: { status: 'completed', findings: 156 },
            network_connections: { status: 'completed', findings: 23 },
            registry_analysis: { status: 'in_progress', findings: 45 },
            malware_detection: { status: 'completed', findings: 2 }
          },
          keyFindings: [
            'Process hollowing detected in explorer.exe',
            'Suspicious network connections to known C2 servers',
            'Rootkit artifacts found in kernel memory',
            'Unusual memory allocation patterns detected'
          ],
          timeline: [
            {
              timestamp: '2024-01-15T10:30:00Z',
              event: 'Memory dump acquired',
              details: 'Full memory image captured (8GB)'
            },
            {
              timestamp: '2024-01-15T10:45:00Z',
              event: 'Process analysis completed',
              details: '3 suspicious processes identified'
            },
            {
              timestamp: '2024-01-15T11:15:00Z',
              event: 'Malware signatures detected',
              details: '2 malware families identified'
            }
          ]
        };
        setMemoryData(mockData);
        addNotification('info', 'Using demonstration data');
      }
    } catch (err) {
      addNotification('error', 'Failed to load memory forensics data');
    } finally {
      setLoading(false);
    }
  };

  const getModuleStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading memory forensics data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧠 Memory Forensics
          </h1>
          <p className="text-gray-600">
            Memory forensics analysis and investigation
          </p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Start Memory Analysis
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-blue-600">{memoryData.processCount}</div>
          <div className="text-sm text-gray-600">Processes Analyzed</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-red-600">{memoryData.suspiciousProcesses}</div>
          <div className="text-sm text-gray-600">Suspicious Processes</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-orange-600">{memoryData.networkConnections}</div>
          <div className="text-sm text-gray-600">Network Connections</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-purple-600">{memoryData.maliciousConnections}</div>
          <div className="text-sm text-gray-600">Malicious Connections</div>
        </div>
      </div>

      {/* Artifacts Analysis */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Memory Artifacts Detected</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(memoryData.artifacts || {}).map(([artifact, count]) => (
              <div key={artifact} className="text-center p-4 bg-gray-50 rounded">
                <div className={`text-xl font-bold ${count > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {count as number}
                </div>
                <div className="text-sm text-gray-600 capitalize">
                  {artifact.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analysis Modules */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Analysis Modules Progress</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {Object.entries(memoryData.analysisModules || {}).map(([module, info]: [string, any]) => (
            <div key={module} className="px-6 py-4">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900 capitalize">
                      {module.replace(/_/g, ' ')}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getModuleStatusColor(info.status)}`}>
                      {info.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Findings: {info.findings}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Findings */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Key Security Findings</h2>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {(memoryData.keyFindings || []).map((finding: string, index: number) => (
              <div key={index} className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2"></span>
                <span className="text-gray-700">{finding}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analysis Timeline */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Analysis Timeline</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {(memoryData.timeline || []).map((event: any, index: number) => (
            <div key={index} className="px-6 py-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{event.event}</div>
                  <div className="text-sm text-gray-600 mt-1">{event.details}</div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(event.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      {notifications.map((notification) => (
        <div key={notification.id} className="fixed bottom-4 right-4 z-40">
          <div className={`p-4 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-500 text-white' :
            notification.type === 'error' ? 'bg-red-500 text-white' :
            notification.type === 'warning' ? 'bg-yellow-500 text-white' :
            'bg-blue-500 text-white'
          }`}>
            <div className="flex justify-between items-center">
              <span>{notification.message}</span>
              <button
                onClick={() => removeNotification(notification.id)}
                className="ml-4 text-white hover:text-gray-200"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}