/**
 * Enhanced Integration Demo Page
 * Demonstrates production-grade NAPI-RS and business logic integration
 */

'use client';

import React, { useState, useEffect } from 'react';
import businessLogicClient from '../../lib/business-logic';

interface ServiceInfo {
  serviceId: string;
  napiPackages: string[];
  businessLogicClass: string;
  operations: string[];
}

interface SystemStatus {
  napi: {
    loadedPackages: number;
    totalPackages: number;
    successRate: number;
  };
  businessLogic: {
    activeServices: number;
    totalServices: number;
    successRate: number;
  };
}

export default function IntegrationDemo() {
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedOperation, setSelectedOperation] = useState<string>('');
  const [operationParams, setOperationParams] = useState<string>('{}');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadSystemData();
  }, []);

  const loadSystemData = async () => {
    try {
      // Load all services
      const servicesData = await businessLogicClient.getAllServices();
      if (servicesData) {
        setServices(servicesData.businessLogicServices || []);
      }

      // Load system health
      const healthData = await businessLogicClient.getSystemHealth();
      if (healthData) {
        setSystemStatus(healthData.services);
      }
    } catch (error) {
      console.error('Failed to load system data:', error);
    }
  };

  const executeOperation = async () => {
    if (!selectedService || !selectedOperation) {
      setError('Please select service and operation');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const parameters = JSON.parse(operationParams);
      
      const response = await businessLogicClient.executeBusinessLogic({
        serviceId: selectedService,
        operation: selectedOperation,
        parameters,
        options: { priority: 'medium' }
      });

      setResult(response);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedServiceInfo = () => {
    return services.find(s => s.serviceId === selectedService);
  };

  const runQuickDemo = async (demoType: string) => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      let response;
      
      switch (demoType) {
        case 'ioc-analysis':
          response = await businessLogicClient.analyzeIOC('suspicious-file.exe', {
            priority: 'high'
          });
          break;
          
        case 'incident-creation':
          response = await businessLogicClient.createIncident(
            'Security Incident - Suspicious Activity Detected',
            'Unusual network traffic patterns detected from internal systems',
            'high',
            { priority: 'high' }
          );
          break;
          
        case 'threat-actor-analysis':
          response = await businessLogicClient.analyzeThreatActor('APT-DEMO-001', {
            priority: 'medium'
          });
          break;
          
        default:
          throw new Error('Unknown demo type');
      }

      setResult(response);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Demo failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
            Enhanced NAPI-RS Integration Demo
          </h1>
          <p className="text-xl text-purple-200 mb-6">
            Production-grade business logic integration with high-performance NAPI-RS packages
          </p>
        </div>

        {/* System Status */}
        {systemStatus && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20">
              <h3 className="text-xl font-semibold text-white mb-4">NAPI-RS Packages Status</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-purple-200">
                  <span>Loaded Packages:</span>
                  <span className="text-green-400">{systemStatus.napi.loadedPackages}/{systemStatus.napi.totalPackages}</span>
                </div>
                <div className="flex justify-between text-purple-200">
                  <span>Success Rate:</span>
                  <span className="text-green-400">{systemStatus.napi.successRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20">
              <h3 className="text-xl font-semibold text-white mb-4">Business Logic Services</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-purple-200">
                  <span>Active Services:</span>
                  <span className="text-green-400">{systemStatus.businessLogic.activeServices}/{systemStatus.businessLogic.totalServices}</span>
                </div>
                <div className="flex justify-between text-purple-200">
                  <span>Success Rate:</span>
                  <span className="text-green-400">{systemStatus.businessLogic.successRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Demo Buttons */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-white mb-4">Quick Demos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => runQuickDemo('ioc-analysis')}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              🔍 IOC Analysis Demo
            </button>
            
            <button
              onClick={() => runQuickDemo('incident-creation')}
              disabled={loading}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              🚨 Incident Response Demo
            </button>
            
            <button
              onClick={() => runQuickDemo('threat-actor-analysis')}
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              👤 Threat Actor Demo
            </button>
          </div>
        </div>

        {/* Custom Operation Executor */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20 mb-8">
          <h3 className="text-2xl font-semibold text-white mb-6">Custom Operation Executor</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-purple-200 mb-2">Service</label>
              <select
                value={selectedService}
                onChange={(e) => {
                  setSelectedService(e.target.value);
                  setSelectedOperation('');
                }}
                className="w-full bg-slate-700 text-white border border-purple-500/30 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-400"
              >
                <option value="">Select Service</option>
                {services.map(service => (
                  <option key={service.serviceId} value={service.serviceId}>
                    {service.serviceId} ({service.napiPackages.length} NAPI packages)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-purple-200 mb-2">Operation</label>
              <select
                value={selectedOperation}
                onChange={(e) => setSelectedOperation(e.target.value)}
                disabled={!selectedService}
                className="w-full bg-slate-700 text-white border border-purple-500/30 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-400 disabled:opacity-50"
              >
                <option value="">Select Operation</option>
                {getSelectedServiceInfo()?.operations.map(operation => (
                  <option key={operation} value={operation}>
                    {operation}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-purple-200 mb-2">Parameters (JSON)</label>
            <textarea
              value={operationParams}
              onChange={(e) => setOperationParams(e.target.value)}
              className="w-full bg-slate-700 text-white border border-purple-500/30 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-400 h-32 font-mono text-sm"
              placeholder='{"key": "value"}'
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={executeOperation}
              disabled={loading || !selectedService || !selectedOperation}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Executing...' : 'Execute Operation'}
            </button>
            
            <button
              onClick={() => setOperationParams(JSON.stringify({}, null, 2))}
              className="bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
            >
              Clear Parameters
            </button>
          </div>
        </div>

        {/* Selected Service Info */}
        {selectedService && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Service Information</h3>
            {(() => {
              const serviceInfo = getSelectedServiceInfo();
              return serviceInfo ? (
                <div className="space-y-3">
                  <div>
                    <span className="text-purple-200">Service ID:</span>
                    <span className="text-white ml-2">{serviceInfo.serviceId}</span>
                  </div>
                  <div>
                    <span className="text-purple-200">Business Logic Class:</span>
                    <span className="text-white ml-2">{serviceInfo.businessLogicClass}</span>
                  </div>
                  <div>
                    <span className="text-purple-200">NAPI Packages:</span>
                    <div className="ml-2 mt-1">
                      {serviceInfo.napiPackages.map(pkg => (
                        <span key={pkg} className="inline-block bg-purple-600/30 text-purple-200 px-2 py-1 rounded text-sm mr-2 mb-1">
                          {pkg}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-purple-200">Available Operations:</span>
                    <div className="ml-2 mt-1">
                      {serviceInfo.operations.map(op => (
                        <span key={op} className="inline-block bg-blue-600/30 text-blue-200 px-2 py-1 rounded text-sm mr-2 mb-1">
                          {op}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <div className="text-red-400 mr-2">❌</div>
              <div className="text-red-200">{error}</div>
            </div>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20">
            <h3 className="text-xl font-semibold text-white mb-4">
              {result.success ? '✅ Operation Result' : '❌ Operation Failed'}
            </h3>
            
            <div className="space-y-4">
              {result.metadata && (
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h4 className="text-purple-200 font-semibold mb-2">Metadata</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="text-purple-200">
                      Service: <span className="text-white">{result.metadata.serviceId}</span>
                    </div>
                    <div className="text-purple-200">
                      Operation: <span className="text-white">{result.metadata.operation}</span>
                    </div>
                    <div className="text-purple-200">
                      Execution Time: <span className="text-white">{result.metadata.executionTime}ms</span>
                    </div>
                    <div className="text-purple-200">
                      NAPI Packages Used: <span className="text-white">{result.metadata.napiPackagesUsed?.length || 0}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="text-purple-200 font-semibold mb-2">Response Data</h4>
                <pre className="text-green-300 text-sm overflow-auto max-h-96 bg-slate-900/50 p-3 rounded">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}