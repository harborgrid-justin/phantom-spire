'use client';

import { useState } from 'react';
import { useXDR } from '@/hooks/useXDR';

export default function XDRDashboard() {
  const { loading, error, processThreatIndicator, evaluateAccess, analyzeTraffic, getSystemStatus } = useXDR();
  const [results, setResults] = useState<any>(null);

  const handleProcessThreat = async () => {
    const threatIndicator = {
      id: `threat-${Date.now()}`,
      indicator_type: 'IP',
      value: '192.168.1.100',
      confidence: 0.85,
      severity: 'HIGH',
      source: 'internal_scan',
      timestamp: new Date(),
      tags: ['malware', 'c2_server'],
      context: {
        geolocation: 'Unknown',
        asn: 'AS12345',
        category: 'Malicious'
      }
    };

    const result = await processThreatIndicator(threatIndicator);
    setResults({ type: 'threat', data: result });
  };

  const handleEvaluateAccess = async () => {
    const accessRequest = {
      id: `access-${Date.now()}`,
      user_id: 'user123',
      resource: '/api/sensitive-data',
      action: 'READ',
      timestamp: new Date(),
      context: {
        ip_address: '10.0.0.1',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: {
          country: 'US',
          city: 'New York',
          trusted: true
        },
        device_fingerprint: 'abc123def456',
        session_id: 'session_789',
        risk_factors: ['unusual_time']
      }
    };

    const result = await evaluateAccess(accessRequest);
    setResults({ type: 'access', data: result });
  };

  const handleAnalyzeTraffic = async () => {
    const networkTraffic = {
      id: `traffic-${Date.now()}`,
      source_ip: '192.168.1.50',
      destination_ip: '10.0.0.100',
      protocol: 'TCP',
      port: 443,
      bytes_sent: 1500,
      bytes_received: 2048,
      timestamp: new Date()
    };

    const result = await analyzeTraffic(networkTraffic);
    setResults({ type: 'traffic', data: result });
  };

  const handleGetStatus = async () => {
    const result = await getSystemStatus();
    setResults({ type: 'status', data: result });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🚀 Phantom XDR Dashboard
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">XDR Core Controls</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <button
              onClick={handleProcessThreat}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              📊 Process Threat
            </button>

            <button
              onClick={handleEvaluateAccess}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              🔐 Evaluate Access
            </button>

            <button
              onClick={handleAnalyzeTraffic}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              🌐 Analyze Traffic
            </button>

            <button
              onClick={handleGetStatus}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              📈 System Status
            </button>
          </div>

          {loading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Processing...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 font-medium">Error: {error}</p>
            </div>
          )}
        </div>

        {results && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">
              Results: {results.type.toUpperCase()}
            </h3>

            <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-96">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                {JSON.stringify(results.data, null, 2)}
              </pre>
            </div>
          </div>
        )}

        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">XDR Core Features</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">🔍 Threat Detection</h4>
              <p className="text-sm text-gray-600">
                Advanced rule-based threat detection with behavioral analysis and correlation.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">🛡️ Zero Trust</h4>
              <p className="text-sm text-gray-600">
                Continuous access evaluation with risk-based policy enforcement.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">🧠 ML Predictions</h4>
              <p className="text-sm text-gray-600">
                Machine learning-powered threat prediction and anomaly detection.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">🌐 Network Analysis</h4>
              <p className="text-sm text-gray-600">
                Real-time network traffic analysis and protocol inspection.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">⚡ Automated Response</h4>
              <p className="text-sm text-gray-600">
                Intelligent automated response orchestration and remediation.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">📊 Risk Assessment</h4>
              <p className="text-sm text-gray-600">
                Comprehensive risk scoring and threat intelligence integration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
