'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, RefreshCw, Settings, Activity, Shield, Eye, TrendingUp, AlertTriangle, Network, Globe, Search } from 'lucide-react';
import { networkAnalysis, NetworkFlow, LateralMovement, NetworkTopology, EncryptedTrafficAnalysis, NetworkHuntQuery, NetworkHuntResult } from '../../../lib/network-analysis-business-logic';

interface NetworkData {
  status: string;
  metrics: {
    totalFlows: number;
    activeConnections: number;
    lateralMovements: number;
    anomalies: number;
    encryptedTraffic: number;
    highRiskFlows: number;
    topologyNodes: number;
    performanceIssues: number;
  };
  lastUpdate: string;
  recentFlows: NetworkFlow[];
  lateralMovements: LateralMovement[];
  topology: NetworkTopology;
  encryptedTraffic: EncryptedTrafficAnalysis[];
  performance: {
    bandwidth: number;
    latency: number;
    packetLoss: number;
  };
  riskSummary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

const NetworkPage = () => {
  const [data, setData] = useState<NetworkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'flows' | 'topology' | 'lateral' | 'encrypted' | 'hunting' | 'performance'>('overview');
  const [huntQuery, setHuntQuery] = useState<NetworkHuntQuery>({});
  const [huntResults, setHuntResults] = useState<NetworkHuntResult | null>(null);
  const [hunting, setHunting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate comprehensive network analysis data
      const mockData: NetworkData = {
        status: 'operational',
        metrics: {
          totalFlows: Math.floor(Math.random() * 10000) + 5000,
          activeConnections: Math.floor(Math.random() * 500) + 100,
          lateralMovements: Math.floor(Math.random() * 20) + 5,
          anomalies: Math.floor(Math.random() * 100) + 20,
          encryptedTraffic: Math.floor(Math.random() * 2000) + 1000,
          highRiskFlows: Math.floor(Math.random() * 50) + 10,
          topologyNodes: Math.floor(Math.random() * 200) + 50,
          performanceIssues: Math.floor(Math.random() * 10) + 2
        },
        lastUpdate: new Date().toISOString(),
        recentFlows: await generateMockFlows(),
        lateralMovements: await generateMockLateralMovements(),
        topology: await generateMockTopology(),
        encryptedTraffic: await generateMockEncryptedTraffic(),
        performance: {
          bandwidth: Math.random() * 30 + 20, // 20-50% utilization
          latency: Math.random() * 50 + 10, // 10-60ms
          packetLoss: Math.random() * 2 // 0-2%
        },
        riskSummary: {
          critical: Math.floor(Math.random() * 5) + 1,
          high: Math.floor(Math.random() * 15) + 5,
          medium: Math.floor(Math.random() * 30) + 10,
          low: Math.floor(Math.random() * 50) + 20
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

  const generateMockFlows = async (): Promise<NetworkFlow[]> => {
    const flows: NetworkFlow[] = [];
    const protocols = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'SMB', 'RDP', 'SSH', 'DNS'];

    for (let i = 0; i < 10; i++) {
      const protocol = protocols[Math.floor(Math.random() * protocols.length)];
      const flow: NetworkFlow = {
        id: `flow_${i}`,
        sourceIP: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        destinationIP: `10.0.0.${Math.floor(Math.random() * 254) + 1}`,
        sourcePort: Math.floor(Math.random() * 65535) + 1,
        destinationPort: protocol === 'HTTP' ? 80 : protocol === 'HTTPS' ? 443 : Math.floor(Math.random() * 65535) + 1,
        protocol: protocol as any,
        bytesSent: Math.floor(Math.random() * 1000000),
        bytesReceived: Math.floor(Math.random() * 1000000),
        packetsSent: Math.floor(Math.random() * 1000),
        packetsReceived: Math.floor(Math.random() * 1000),
        startTime: new Date(Date.now() - Math.random() * 3600000),
        endTime: new Date(),
        duration: Math.floor(Math.random() * 300) + 10,
        flags: ['SYN', 'ACK'],
        application: protocol === 'SMB' ? 'Windows File Sharing' : protocol === 'RDP' ? 'Remote Desktop' : 'Unknown',
        riskScore: Math.floor(Math.random() * 100),
        anomalies: []
      };
      flows.push(flow);
    }

    return flows;
  };

  const generateMockLateralMovements = async (): Promise<LateralMovement[]> => {
    const movements: LateralMovement[] = [];

    for (let i = 0; i < 5; i++) {
      movements.push({
        id: `lateral_${i}`,
        sourceHost: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        targetHost: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        technique: ['pass_the_hash', 'remote_execution', 'windows_admin_shares'][Math.floor(Math.random() * 3)] as any,
        confidence: Math.random() * 0.4 + 0.6,
        timestamp: new Date(Date.now() - Math.random() * 3600000),
        indicators: ['SMB connection', 'Administrative share access', 'Remote execution'],
        riskScore: Math.floor(Math.random() * 50) + 50,
        status: ['detected', 'confirmed', 'mitigated'][Math.floor(Math.random() * 3)] as any
      });
    }

    return movements;
  };

  const generateMockTopology = async (): Promise<NetworkTopology> => {
    const nodes = [];
    const edges = [];

    // Generate nodes
    for (let i = 0; i < 20; i++) {
      nodes.push({
        id: `node_${i}`,
        ip: `192.168.1.${i + 10}`,
        hostname: `host-${i}.company.com`,
        type: ['server', 'workstation', 'network_device'][Math.floor(Math.random() * 3)] as any,
        services: [
          {
            port: 80,
            protocol: 'HTTP',
            service: 'Web Server',
            state: 'open' as const,
            riskScore: Math.floor(Math.random() * 30)
          }
        ],
        vulnerabilities: [],
        riskScore: Math.floor(Math.random() * 100),
        lastSeen: new Date(),
        tags: ['internal', 'production']
      });
    }

    // Generate edges
    for (let i = 0; i < 15; i++) {
      edges.push({
        source: `192.168.1.${Math.floor(Math.random() * 20) + 10}`,
        target: `192.168.1.${Math.floor(Math.random() * 20) + 10}`,
        protocol: 'TCP',
        port: 80,
        frequency: Math.floor(Math.random() * 100) + 10,
        bandwidth: Math.floor(Math.random() * 1000000),
        riskScore: Math.floor(Math.random() * 50),
        lastSeen: new Date()
      });
    }

    return {
      nodes,
      edges,
      segments: [
        {
          id: 'segment_1',
          name: 'Internal Network',
          cidr: '192.168.1.0/24',
          nodes: nodes.map(n => n.id),
          securityLevel: 'internal',
          accessPolicies: [],
          riskScore: Math.floor(Math.random() * 30)
        }
      ],
      lastUpdated: new Date(),
      riskAssessment: {
        overallRisk: Math.floor(Math.random() * 50) + 20,
        vulnerableNodes: Math.floor(Math.random() * 5) + 1,
        exposedServices: Math.floor(Math.random() * 10) + 3,
        segmentationGaps: Math.floor(Math.random() * 3) + 1
      }
    };
  };

  const generateMockEncryptedTraffic = async (): Promise<EncryptedTrafficAnalysis[]> => {
    const traffic: EncryptedTrafficAnalysis[] = [];

    for (let i = 0; i < 8; i++) {
      traffic.push({
        id: `encrypted_${i}`,
        sourceIP: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        destinationIP: `10.0.0.${Math.floor(Math.random() * 254) + 1}`,
        protocol: 'HTTPS',
        tlsVersion: '1.2',
        cipherSuite: 'ECDHE-RSA-AES256-GCM-SHA384',
        certificateInfo: {
          issuer: 'DigiCert Inc',
          subject: 'example.com',
          validFrom: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
          validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          fingerprint: 'SHA256:' + Math.random().toString(36).substr(2, 64)
        },
        ja3Fingerprint: Math.random().toString(36).substr(2, 32),
        ja3sFingerprint: Math.random().toString(36).substr(2, 32),
        anomalies: [],
        riskScore: Math.floor(Math.random() * 30),
        classification: ['legitimate', 'suspicious', 'unknown'][Math.floor(Math.random() * 3)] as any
      });
    }

    return traffic;
  };

  const handleHunt = async () => {
    if (!huntQuery.sourceIP && !huntQuery.destinationIP && !huntQuery.protocol) {
      alert('Please specify at least one search criteria');
      return;
    }

    setHunting(true);
    try {
      const results = await networkAnalysis.huntForNetworkThreats(huntQuery);
      setHuntResults(results);
    } catch (error) {
      console.error('Hunt failed:', error);
      alert('Hunt failed. Please try again.');
    } finally {
      setHunting(false);
    }
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
    { id: 'flows', label: 'Network Flows', icon: Network },
    { id: 'topology', label: 'Topology', icon: Globe },
    { id: 'lateral', label: 'Lateral Movement', icon: Shield },
    { id: 'encrypted', label: 'Encrypted Traffic', icon: Eye },
    { id: 'hunting', label: 'Threat Hunting', icon: Search },
    { id: 'performance', label: 'Performance', icon: TrendingUp }
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
          Advanced Network Analysis
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
        Enterprise-grade network traffic analysis, lateral movement detection, and threat hunting capabilities
      </p>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <div className="text-yellow-800">
            Unable to connect to live data. Showing demo data.
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
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
                  <Network className="w-8 h-8 text-blue-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Total Flows</p>
                    <p className="text-2xl font-bold text-gray-900">{data.metrics.totalFlows.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow border p-4">
                <div className="flex items-center">
                  <Shield className="w-8 h-8 text-red-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Lateral Movements</p>
                    <p className="text-2xl font-bold text-gray-900">{data.metrics.lateralMovements}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow border p-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-8 h-8 text-orange-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Anomalies</p>
                    <p className="text-2xl font-bold text-gray-900">{data.metrics.anomalies}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow border p-4">
                <div className="flex items-center">
                  <Eye className="w-8 h-8 text-purple-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Encrypted Traffic</p>
                    <p className="text-2xl font-bold text-gray-900">{data.metrics.encryptedTraffic.toLocaleString()}</p>
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
                    <span className="text-red-600 font-medium">Critical</span>
                    <span className="text-2xl font-bold">{data.riskSummary.critical}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-orange-600 font-medium">High</span>
                    <span className="text-2xl font-bold">{data.riskSummary.high}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-600 font-medium">Medium</span>
                    <span className="text-2xl font-bold">{data.riskSummary.medium}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-green-600 font-medium">Low</span>
                    <span className="text-2xl font-bold">{data.riskSummary.low}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow border">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Bandwidth Utilization</span>
                    <span className="font-medium">{data.performance.bandwidth.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Latency</span>
                    <span className="font-medium">{data.performance.latency.toFixed(1)}ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Packet Loss</span>
                    <span className="font-medium">{data.performance.packetLoss.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Topology Nodes</span>
                    <span className="font-medium">{data.metrics.topologyNodes}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'flows' && data && (
          <div className="bg-white rounded-lg shadow border">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Network Flows</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Source</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Destination</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Protocol</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Bytes</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Duration</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Risk Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentFlows.map((flow) => (
                      <tr key={flow.id} className="border-b">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-mono text-sm">{flow.sourceIP}:{flow.sourcePort}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-mono text-sm">{flow.destinationIP}:{flow.destinationPort}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {flow.protocol}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {(flow.bytesSent + flow.bytesReceived).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          {flow.duration}s
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            flow.riskScore > 70 ? 'bg-red-100 text-red-800' :
                            flow.riskScore > 40 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {flow.riskScore}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'lateral' && data && (
          <div className="bg-white rounded-lg shadow border">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Lateral Movement Detection</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Source Host</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Target Host</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Technique</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Confidence</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Risk Score</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.lateralMovements.map((movement) => (
                      <tr key={movement.id} className="border-b">
                        <td className="py-3 px-4 font-mono text-sm">{movement.sourceHost}</td>
                        <td className="py-3 px-4 font-mono text-sm">{movement.targetHost}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {movement.technique.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4">{(movement.confidence * 100).toFixed(1)}%</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {movement.riskScore}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            movement.status === 'mitigated' ? 'bg-green-100 text-green-800' :
                            movement.status === 'confirmed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {movement.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'encrypted' && data && (
          <div className="bg-white rounded-lg shadow border">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Encrypted Traffic Analysis</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Source</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Destination</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">TLS Version</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Certificate</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Classification</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Risk Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.encryptedTraffic.map((traffic) => (
                      <tr key={traffic.id} className="border-b">
                        <td className="py-3 px-4 font-mono text-sm">{traffic.sourceIP}</td>
                        <td className="py-3 px-4 font-mono text-sm">{traffic.destinationIP}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {traffic.tlsVersion}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <div className="font-medium">{traffic.certificateInfo?.subject}</div>
                            <div className="text-gray-500">{traffic.certificateInfo?.issuer}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            traffic.classification === 'malicious' ? 'bg-red-100 text-red-800' :
                            traffic.classification === 'suspicious' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {traffic.classification}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            traffic.riskScore > 50 ? 'bg-red-100 text-red-800' :
                            traffic.riskScore > 25 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {traffic.riskScore}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hunting' && (
          <div className="space-y-6">
            {/* Hunt Query Builder */}
            <div className="bg-white rounded-lg shadow border">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Threat Hunting Query</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Source IP</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="192.168.1.1"
                      value={huntQuery.sourceIP || ''}
                      onChange={(e) => setHuntQuery({...huntQuery, sourceIP: e.target.value || undefined})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Destination IP</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="10.0.0.1"
                      value={huntQuery.destinationIP || ''}
                      onChange={(e) => setHuntQuery({...huntQuery, destinationIP: e.target.value || undefined})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Protocol</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={huntQuery.protocol || ''}
                      onChange={(e) => setHuntQuery({...huntQuery, protocol: e.target.value as any || undefined})}
                    >
                      <option value="">All Protocols</option>
                      <option value="TCP">TCP</option>
                      <option value="UDP">UDP</option>
                      <option value="HTTP">HTTP</option>
                      <option value="HTTPS">HTTPS</option>
                      <option value="SMB">SMB</option>
                      <option value="RDP">RDP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Risk Score</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="50"
                      min="0"
                      max="100"
                      value={huntQuery.minRiskScore || ''}
                      onChange={(e) => setHuntQuery({...huntQuery, minRiskScore: e.target.value ? parseInt(e.target.value) : undefined})}
                    />
                  </div>
                </div>
                <button
                  onClick={handleHunt}
                  disabled={hunting}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {hunting ? 'Hunting...' : 'Execute Hunt'}
                </button>
              </div>
            </div>

            {/* Hunt Results */}
            {huntResults && (
              <div className="bg-white rounded-lg shadow border">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Hunt Results</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{huntResults.statistics.flowsAnalyzed}</div>
                      <div className="text-sm text-gray-600">Flows Analyzed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{huntResults.statistics.anomaliesFound}</div>
                      <div className="text-sm text-gray-600">Anomalies Found</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{huntResults.statistics.highRiskFlows}</div>
                      <div className="text-sm text-gray-600">High Risk</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{(huntResults.statistics.executionTime / 1000).toFixed(2)}s</div>
                      <div className="text-sm text-gray-600">Execution Time</div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Risk Score</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Indicators</th>
                        </tr>
                      </thead>
                      <tbody>
                        {huntResults.matches.map((match, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-3 px-4 capitalize">{match.type.replace('_', ' ')}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                match.riskScore > 70 ? 'bg-red-100 text-red-800' :
                                match.riskScore > 40 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {match.riskScore}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm text-gray-600">
                                {match.indicators.slice(0, 3).join(', ')}
                                {match.indicators.length > 3 && '...'}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'topology' && data && (
          <div className="bg-white rounded-lg shadow border">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Network Topology</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{data.topology.nodes.length}</div>
                  <div className="text-sm text-gray-600">Total Nodes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{data.topology.edges.length}</div>
                  <div className="text-sm text-gray-600">Connections</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{data.topology.riskAssessment.vulnerableNodes}</div>
                  <div className="text-sm text-gray-600">Vulnerable Nodes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{data.topology.riskAssessment.overallRisk}</div>
                  <div className="text-sm text-gray-600">Overall Risk</div>
                </div>
              </div>

              <div className="text-center py-12">
                <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Interactive topology visualization coming soon...</p>
                <p className="text-sm text-gray-500 mt-2">Real-time network mapping and risk assessment</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="bg-white rounded-lg shadow border">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Network Performance Monitoring</h2>
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Performance monitoring dashboard coming soon...</p>
                <p className="text-sm text-gray-500 mt-2">Real-time bandwidth, latency, and packet loss monitoring</p>
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
              <Network className="w-6 h-6 text-blue-600 mb-2" />
              <span className="text-sm font-medium">Start Capture</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-gray-300 rounded-md hover:bg-gray-50">
              <Shield className="w-6 h-6 text-green-600 mb-2" />
              <span className="text-sm font-medium">Block Traffic</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-gray-300 rounded-md hover:bg-gray-50">
              <Eye className="w-6 h-6 text-purple-600 mb-2" />
              <span className="text-sm font-medium">Deep Packet Inspection</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-gray-300 rounded-md hover:bg-gray-50">
              <AlertTriangle className="w-6 h-6 text-red-600 mb-2" />
              <span className="text-sm font-medium">Generate Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkPage;
