'use client';

import { useEffect, useState } from 'react';
import { CVE } from '../../../types/cve';
import { apiClient } from '../../../lib/api';
import { useServicePage } from '../../../lib/business-logic';

interface CVEDetailsPageProps {
  params: { id: string };
}

export default function CVEDetailsPage({ params }: CVEDetailsPageProps) {
  const [cve, setCve] = useState<CVE | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Business Logic Integration
  const { connected, notifications, execute, addNotification, removeNotification } = useServicePage('cve-details');

  useEffect(() => {
    loadCVEDetails();
  }, [params.id]);

  const loadCVEDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/cve/${params.id}`);
      setCve(response.data);

      await execute('cve-details-loaded', { 
        cveId: response.data.cveId,
        severity: response.data.scoring.severity 
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load CVE details';
      setError(errorMessage);
      addNotification({
        id: 'details-error',
        type: 'error',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'info': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading CVE details...</div>
        </div>
      </div>
    );
  }

  if (error || !cve) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <strong>Error:</strong> {error || 'CVE not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{cve.cveId}</h1>
            <p className="text-gray-600 mt-2">{cve.title}</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(cve.scoring.severity)}`}>
              {cve.scoring.severity.toUpperCase()}
            </span>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Edit
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-2xl font-bold text-gray-900">
            {cve.scoring.cvssV3Score || cve.scoring.cvssV2Score || 'N/A'}
          </div>
          <div className="text-gray-600">CVSS Score</div>
          {cve.scoring.cvssV3Vector && (
            <div className="text-xs text-gray-500 mt-1">
              {cve.scoring.cvssV3Vector}
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className={`text-2xl font-bold ${getRiskColor(cve.riskAssessment.businessRisk)}`}>
            {cve.riskAssessment.riskScore}/100
          </div>
          <div className="text-gray-600">Risk Score</div>
          <div className="text-xs text-gray-500 mt-1">
            Business Risk: {cve.riskAssessment.businessRisk}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-2xl font-bold text-gray-900">
            {cve.assetImpacts.length}
          </div>
          <div className="text-gray-600">Affected Assets</div>
          <div className="text-xs text-gray-500 mt-1">
            {cve.assetImpacts.filter(a => a.criticality === 'critical').length} critical assets
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className={`text-2xl font-bold ${
            cve.exploitInfo.exploitAvailable ? 'text-red-600' : 'text-green-600'
          }`}>
            {cve.exploitInfo.exploitAvailable ? 'YES' : 'NO'}
          </div>
          <div className="text-gray-600">Exploit Available</div>
          <div className="text-xs text-gray-500 mt-1">
            {cve.exploitInfo.publicExploits} public exploits
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'technical', label: 'Technical Details' },
              { id: 'affected', label: 'Affected Products' },
              { id: 'remediation', label: 'Remediation' },
              { id: 'assets', label: 'Asset Impact' },
              { id: 'timeline', label: 'Timeline' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700">{cve.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Key Information</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Published Date:</dt>
                      <dd className="text-sm text-gray-900">{new Date(cve.publishedDate).toLocaleDateString()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Last Modified:</dt>
                      <dd className="text-sm text-gray-900">{new Date(cve.lastModifiedDate).toLocaleDateString()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Source:</dt>
                      <dd className="text-sm text-gray-900">{cve.source}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Status:</dt>
                      <dd className="text-sm text-gray-900">{cve.workflow.status}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Risk Assessment</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Business Risk:</dt>
                      <dd className={`text-sm font-medium ${getRiskColor(cve.riskAssessment.businessRisk)}`}>
                        {cve.riskAssessment.businessRisk.toUpperCase()}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Technical Risk:</dt>
                      <dd className={`text-sm font-medium ${getRiskColor(cve.riskAssessment.technicalRisk)}`}>
                        {cve.riskAssessment.technicalRisk.toUpperCase()}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Financial Impact:</dt>
                      <dd className="text-sm text-gray-900">${cve.riskAssessment.financialImpact.toLocaleString()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Likelihood:</dt>
                      <dd className="text-sm text-gray-900">{cve.riskAssessment.likelihood}%</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          )}

          {/* Technical Details Tab */}
          {activeTab === 'technical' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">CVSS Metrics</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cve.scoring.cvssV3Score && (
                      <div>
                        <div className="text-sm font-medium text-gray-700">CVSS v3.x Score</div>
                        <div className="text-2xl font-bold text-gray-900">{cve.scoring.cvssV3Score}</div>
                        {cve.scoring.cvssV3Vector && (
                          <div className="text-xs text-gray-500 mt-1">{cve.scoring.cvssV3Vector}</div>
                        )}
                      </div>
                    )}
                    {cve.scoring.cvssV2Score && (
                      <div>
                        <div className="text-sm font-medium text-gray-700">CVSS v2.0 Score</div>
                        <div className="text-2xl font-bold text-gray-900">{cve.scoring.cvssV2Score}</div>
                        {cve.scoring.cvssV2Vector && (
                          <div className="text-xs text-gray-500 mt-1">{cve.scoring.cvssV2Vector}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Exploit Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-700">Exploit Available</div>
                      <div className={`text-lg font-bold ${cve.exploitInfo.exploitAvailable ? 'text-red-600' : 'text-green-600'}`}>
                        {cve.exploitInfo.exploitAvailable ? 'Yes' : 'No'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">Exploitability Level</div>
                      <div className="text-lg font-bold text-gray-900">{cve.exploitInfo.exploitabilityLevel}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">In the Wild</div>
                      <div className={`text-lg font-bold ${cve.exploitInfo.exploitInWild ? 'text-red-600' : 'text-green-600'}`}>
                        {cve.exploitInfo.exploitInWild ? 'Yes' : 'No'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Affected Products Tab */}
          {activeTab === 'affected' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Affected Products</h3>
              <div className="space-y-4">
                {cve.affectedProducts.map((product, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{product.vendor} {product.product}</h4>
                      <span className="text-sm text-gray-500">{product.versions.length} versions affected</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Affected Versions:</strong> {product.versions.join(', ')}
                    </div>
                    {product.platforms && product.platforms.length > 0 && (
                      <div className="text-sm text-gray-600 mt-1">
                        <strong>Platforms:</strong> {product.platforms.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Remediation Tab */}
          {activeTab === 'remediation' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Patch Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-700">Patch Available</div>
                      <div className={`text-lg font-bold ${cve.patchInfo.patchAvailable ? 'text-green-600' : 'text-red-600'}`}>
                        {cve.patchInfo.patchAvailable ? 'Yes' : 'No'}
                      </div>
                    </div>
                    {cve.patchInfo.patchDate && (
                      <div>
                        <div className="text-sm font-medium text-gray-700">Patch Date</div>
                        <div className="text-lg font-bold text-gray-900">
                          {new Date(cve.patchInfo.patchDate).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-700">Patch Complexity</div>
                      <div className="text-lg font-bold text-gray-900">{cve.patchInfo.patchComplexity}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Mitigation Strategies</h3>
                <div className="space-y-3">
                  {cve.mitigations.map((mitigation, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-600">{mitigation.type.toUpperCase()}</span>
                        <span className="text-sm text-gray-500">Effectiveness: {mitigation.effectiveness}%</span>
                      </div>
                      <p className="text-sm text-gray-700">{mitigation.description}</p>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span>Implementation Cost: {mitigation.implementationCost}</span>
                        {mitigation.timeToImplement && (
                          <span>Time to Implement: {mitigation.timeToImplement}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Asset Impact Tab */}
          {activeTab === 'assets' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Asset Impact Analysis</h3>
              <div className="space-y-4">
                {cve.assetImpacts.map((asset, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{asset.assetName}</h4>
                      <span className={`text-sm font-medium ${getRiskColor(asset.criticality)}`}>
                        {asset.criticality.toUpperCase()}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Type:</span> {asset.assetType}
                      </div>
                      <div>
                        <span className="text-gray-500">Exposure:</span> {asset.exposure}
                      </div>
                      <div>
                        <span className="text-gray-500">Business Impact:</span> {asset.businessImpact}/100
                      </div>
                    </div>
                    {asset.affectedServices.length > 0 && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-500">Affected Services:</span> {asset.affectedServices.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">CVE Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">CVE Published</div>
                    <div className="text-sm text-gray-500">{new Date(cve.publishedDate).toLocaleDateString()}</div>
                  </div>
                </div>
                
                {cve.discoveredDate && (
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Vulnerability Discovered</div>
                      <div className="text-sm text-gray-500">{new Date(cve.discoveredDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                )}
                
                {cve.patchInfo.patchDate && (
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Patch Released</div>
                      <div className="text-sm text-gray-500">{new Date(cve.patchInfo.patchDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Last Updated</div>
                    <div className="text-sm text-gray-500">{new Date(cve.lastModifiedDate).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Business Logic Notifications */}
      {notifications.length > 0 && (
        <div className="mt-6 space-y-2">
          {notifications.map((notification) => (
            <div 
              key={notification.id}
              className={`p-3 rounded-lg border ${
                notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' :
                notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
                'bg-blue-50 border-blue-200 text-blue-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm">{notification.message}</span>
                <button 
                  onClick={() => removeNotification(notification.id)}
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