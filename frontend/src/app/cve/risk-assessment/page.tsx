'use client';

import { useEffect, useState } from 'react';
import { CVE } from '../../../types/cve';
import { apiClient } from '../../../lib/api';
import { useServicePage } from '../../../lib/business-logic';

export default function CVERiskAssessmentPage() {
  const [cves, setCves] = useState<CVE[]>([]);
  const [riskAnalytics, setRiskAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCVE, setSelectedCVE] = useState<CVE | null>(null);
  const [riskFilters, setRiskFilters] = useState({
    businessRisk: 'all',
    riskScore: { min: 0, max: 100 },
    financialImpact: { min: 0, max: 1000000 }
  });

  // Business Logic Integration
  const { connected, notifications, execute, addNotification, removeNotification } = useServicePage('cve-risk-assessment');

  useEffect(() => {
    loadRiskData();
  }, []);

  const loadRiskData = async () => {
    try {
      setLoading(true);
      
      // Load CVEs and risk analytics
      const [cveResponse, analyticsResponse] = await Promise.all([
        apiClient.get('/cve?sort={"field":"riskScore","order":"desc"}&limit=50'),
        apiClient.get('/cve/analytics/risk')
      ]);

      setCves(cveResponse.data.cves);
      setRiskAnalytics(analyticsResponse.data);

      await execute('risk-assessment-loaded', { 
        totalCVEs: cveResponse.data.cves.length,
        avgRiskScore: analyticsResponse.data.avgRiskScore 
      });

      addNotification({
        id: 'risk-loaded',
        type: 'success',
        message: 'Risk assessment data loaded successfully'
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load risk data';
      setError(errorMessage);
      addNotification({
        id: 'risk-error',
        type: 'error',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const calculatePortfolioRisk = () => {
    if (!cves.length) return 0;
    return cves.reduce((sum, cve) => sum + cve.riskAssessment.riskScore, 0) / cves.length;
  };

  const getRiskColor = (risk: string | number) => {
    const riskValue = typeof risk === 'string' ? risk : risk >= 80 ? 'critical' : risk >= 60 ? 'high' : risk >= 40 ? 'medium' : 'low';
    switch (riskValue) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskBadgeColor = (risk: string | number) => {
    const riskValue = typeof risk === 'string' ? risk : risk >= 80 ? 'critical' : risk >= 60 ? 'high' : risk >= 40 ? 'medium' : 'low';
    switch (riskValue) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredCVEs = cves.filter(cve => {
    if (riskFilters.businessRisk !== 'all' && cve.riskAssessment.businessRisk !== riskFilters.businessRisk) return false;
    if (cve.riskAssessment.riskScore < riskFilters.riskScore.min || cve.riskAssessment.riskScore > riskFilters.riskScore.max) return false;
    if (cve.riskAssessment.financialImpact < riskFilters.financialImpact.min || cve.riskAssessment.financialImpact > riskFilters.financialImpact.max) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading risk assessment data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">CVE Risk Assessment</h1>
        <p className="text-gray-600 mt-2">Comprehensive risk analysis and business impact assessment for vulnerabilities</p>
      </div>

      {/* Portfolio Risk Overview */}
      {riskAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(calculatePortfolioRisk())}
            </div>
            <div className="text-gray-600">Portfolio Risk Score</div>
            <div className="text-sm text-purple-600 mt-1">
              Average across all CVEs
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <div className="text-2xl font-bold text-gray-900">
              ${Math.round(riskAnalytics.totalFinancialImpact / 1000000)}M
            </div>
            <div className="text-gray-600">Total Financial Impact</div>
            <div className="text-sm text-red-600 mt-1">
              Estimated exposure
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <div className="text-2xl font-bold text-gray-900">
              {riskAnalytics.riskDistribution.critical + riskAnalytics.riskDistribution.high}
            </div>
            <div className="text-gray-600">High Risk CVEs</div>
            <div className="text-sm text-orange-600 mt-1">
              Require immediate attention
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="text-2xl font-bold text-gray-900">
              {riskAnalytics.topRisks.length}
            </div>
            <div className="text-gray-600">Top Risk CVEs</div>
            <div className="text-sm text-blue-600 mt-1">
              Priority remediation targets
            </div>
          </div>
        </div>
      )}

      {/* Risk Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Business Risk Level</label>
            <select
              value={riskFilters.businessRisk}
              onChange={(e) => setRiskFilters(prev => ({ ...prev, businessRisk: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="all">All Risk Levels</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Risk Score Range</label>
            <div className="flex space-x-2">
              <input
                type="number"
                min="0"
                max="100"
                placeholder="Min"
                value={riskFilters.riskScore.min}
                onChange={(e) => setRiskFilters(prev => ({ 
                  ...prev, 
                  riskScore: { ...prev.riskScore, min: parseInt(e.target.value) || 0 }
                }))}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
              />
              <input
                type="number"
                min="0"
                max="100"
                placeholder="Max"
                value={riskFilters.riskScore.max}
                onChange={(e) => setRiskFilters(prev => ({ 
                  ...prev, 
                  riskScore: { ...prev.riskScore, max: parseInt(e.target.value) || 100 }
                }))}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Financial Impact Range</label>
            <div className="flex space-x-2">
              <input
                type="number"
                min="0"
                placeholder="Min $"
                value={riskFilters.financialImpact.min}
                onChange={(e) => setRiskFilters(prev => ({ 
                  ...prev, 
                  financialImpact: { ...prev.financialImpact, min: parseInt(e.target.value) || 0 }
                }))}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
              />
              <input
                type="number"
                min="0"
                placeholder="Max $"
                value={riskFilters.financialImpact.max}
                onChange={(e) => setRiskFilters(prev => ({ 
                  ...prev, 
                  financialImpact: { ...prev.financialImpact, max: parseInt(e.target.value) || 1000000 }
                }))}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Risk Distribution Chart */}
      {riskAnalytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution</h3>
            <div className="space-y-4">
              {Object.entries(riskAnalytics.riskDistribution).map(([level, count]) => (
                <div key={level} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskBadgeColor(level)}`}>
                      {level.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="bg-gray-200 rounded-full h-3 w-32">
                      <div 
                        className={`h-3 rounded-full ${
                          level === 'critical' ? 'bg-red-500' :
                          level === 'high' ? 'bg-orange-500' :
                          level === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}
                        style={{width: `${(count / cves.length) * 100}%`}}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Risk CVEs</h3>
            <div className="space-y-3">
              {riskAnalytics.topRisks.slice(0, 5).map((cve: any, index: number) => (
                <div key={cve.cveId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-blue-600">{cve.cveId}</div>
                    <div className="text-sm text-gray-600 truncate">{cve.title}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getRiskColor(cve.riskScore)}`}>
                      {cve.riskScore}
                    </div>
                    <div className="text-xs text-gray-500">{cve.businessRisk}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CVE Risk List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            CVE Risk Assessment ({filteredCVEs.length} CVEs)
          </h3>
          <div className="flex space-x-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Export Risk Report
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              Risk Matrix
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredCVEs.map((cve) => (
            <div key={cve.id} className="p-6 hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedCVE(cve)}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-sm font-medium text-blue-600">{cve.cveId}</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskBadgeColor(cve.riskAssessment.businessRisk)}`}>
                      {cve.riskAssessment.businessRisk.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">
                      CVSS: {cve.scoring.cvssV3Score || cve.scoring.cvssV2Score || 'N/A'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-900 mb-3">{cve.title}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Risk Score:</span>
                      <span className={`ml-1 font-bold ${getRiskColor(cve.riskAssessment.riskScore)}`}>
                        {cve.riskAssessment.riskScore}/100
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Financial Impact:</span>
                      <span className="ml-1 font-medium text-gray-900">
                        ${cve.riskAssessment.financialImpact.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Likelihood:</span>
                      <span className="ml-1 font-medium text-gray-900">
                        {cve.riskAssessment.likelihood}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Assets Affected:</span>
                      <span className="ml-1 font-medium text-gray-900">
                        {cve.assetImpacts.length}
                      </span>
                    </div>
                  </div>

                  {cve.riskAssessment.riskFactors.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-500">Risk Factors: </span>
                      {cve.riskAssessment.riskFactors.slice(0, 3).map((factor, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded mr-1">
                          {factor}
                        </span>
                      ))}
                      {cve.riskAssessment.riskFactors.length > 3 && (
                        <span className="text-xs text-gray-500">+{cve.riskAssessment.riskFactors.length - 3} more</span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="ml-4 text-right">
                  <div className={`text-2xl font-bold ${getRiskColor(cve.riskAssessment.riskScore)}`}>
                    {cve.riskAssessment.riskScore}
                  </div>
                  <div className="text-xs text-gray-500">Risk Score</div>
                  <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Assess Risk
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected CVE Risk Detail Modal */}
      {selectedCVE && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Risk Assessment: {selectedCVE.cveId}
                </h3>
                <button
                  onClick={() => setSelectedCVE(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Overall Risk Assessment</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Business Risk:</span>
                        <span className={`ml-1 font-bold ${getRiskColor(selectedCVE.riskAssessment.businessRisk)}`}>
                          {selectedCVE.riskAssessment.businessRisk.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Technical Risk:</span>
                        <span className={`ml-1 font-bold ${getRiskColor(selectedCVE.riskAssessment.technicalRisk)}`}>
                          {selectedCVE.riskAssessment.technicalRisk.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Reputational Risk:</span>
                        <span className={`ml-1 font-bold ${getRiskColor(selectedCVE.riskAssessment.reputationalRisk)}`}>
                          {selectedCVE.riskAssessment.reputationalRisk.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Composite Score:</span>
                        <span className={`ml-1 font-bold ${getRiskColor(selectedCVE.riskAssessment.riskScore)}`}>
                          {selectedCVE.riskAssessment.riskScore}/100
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Risk Justification</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                    {selectedCVE.riskAssessment.riskJustification}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Financial Impact Analysis</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-red-600 mb-2">
                      ${selectedCVE.riskAssessment.financialImpact.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      Estimated financial impact if exploited
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Risk Factors</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCVE.riskAssessment.riskFactors.map((factor, index) => (
                      <span key={index} className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={() => setSelectedCVE(null)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Update Risk Assessment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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