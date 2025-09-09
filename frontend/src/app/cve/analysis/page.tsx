'use client';

import { useEffect, useState } from 'react';
import { CVECore } from 'phantom-cve-core';
import type { 
  CVE, 
  CVEAnalysisResult, 
  ExploitTimeline, 
  RemediationStrategy,
  CVESearchCriteria 
} from 'phantom-cve-core';

interface AnalysisState {
  core: CVECore | null;
  loading: boolean;
  error: string | null;
  healthStatus: any;
}

interface CVEAnalysisPageState {
  selectedCVE: CVE | null;
  analysisResult: CVEAnalysisResult | null;
  exploitTimeline: ExploitTimeline | null;
  remediationStrategy: RemediationStrategy | null;
  searchResults: CVE[];
  batchResults: CVEAnalysisResult[];
  processing: boolean;
}

export default function CVEAnalysisPage() {
  const [analysis, setAnalysis] = useState<AnalysisState>({
    core: null,
    loading: true,
    error: null,
    healthStatus: null
  });

  const [cveState, setCVEState] = useState<CVEAnalysisPageState>({
    selectedCVE: null,
    analysisResult: null,
    exploitTimeline: null,
    remediationStrategy: null,
    searchResults: [],
    batchResults: [],
    processing: false
  });

  const [searchCriteria, setSearchCriteria] = useState<CVESearchCriteria>({
    min_score: 7.0,
    max_score: 10.0,
    severity: 'high'
  });

  // Initialize CVE Core
  useEffect(() => {
    const initializeCVECore = async () => {
      try {
        setAnalysis(prev => ({ ...prev, loading: true, error: null }));
        
        const core = await CVECore.new();
        const healthStatus = await core.get_health_status();
        
        setAnalysis({
          core,
          loading: false,
          error: null,
          healthStatus
        });

        console.log('CVE Core initialized successfully:', healthStatus);
      } catch (error) {
        console.error('Failed to initialize CVE Core:', error);
        setAnalysis({
          core: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to initialize CVE Core',
          healthStatus: null
        });
      }
    };

    initializeCVECore();
  }, []);

  // Search CVEs with criteria
  const searchCVEs = async () => {
    if (!analysis.core) return;

    try {
      setCVEState(prev => ({ ...prev, processing: true }));
      
      const results = await analysis.core.search_cves(searchCriteria);
      setCVEState(prev => ({ 
        ...prev, 
        searchResults: results,
        processing: false 
      }));

      console.log(`Found ${results.length} CVEs matching criteria`);
    } catch (error) {
      console.error('Search failed:', error);
      setCVEState(prev => ({ ...prev, processing: false }));
    }
  };

  // Process single CVE
  const processCVE = async (cve: CVE) => {
    if (!analysis.core) return;

    try {
      setCVEState(prev => ({ ...prev, processing: true, selectedCVE: cve }));

      // Get comprehensive analysis
      const [analysisResult, exploitTimeline, remediationStrategy] = await Promise.all([
        analysis.core.process_cve(cve),
        analysis.core.get_exploit_timeline(cve.id),
        analysis.core.get_remediation_strategy(cve)
      ]);

      setCVEState(prev => ({
        ...prev,
        analysisResult,
        exploitTimeline,
        remediationStrategy,
        processing: false
      }));

      console.log('CVE analysis completed:', analysisResult);
    } catch (error) {
      console.error('CVE processing failed:', error);
      setCVEState(prev => ({ ...prev, processing: false }));
    }
  };

  // Batch process CVEs
  const batchProcessCVEs = async () => {
    if (!analysis.core || cveState.searchResults.length === 0) return;

    try {
      setCVEState(prev => ({ ...prev, processing: true }));

      const batchResults = await analysis.core.process_cves_batch(cveState.searchResults);
      setCVEState(prev => ({
        ...prev,
        batchResults,
        processing: false
      }));

      console.log(`Batch processed ${batchResults.length} CVEs`);
    } catch (error) {
      console.error('Batch processing failed:', error);
      setCVEState(prev => ({ ...prev, processing: false }));
    }
  };

  // Create sample CVE for testing
  const createSampleCVE = (): CVE => ({
    id: `CVE-2024-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    description: "Remote code execution vulnerability in web application framework allowing attackers to execute arbitrary code through malicious HTTP requests",
    published_date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
    last_modified_date: new Date(),
    status: 'published',
    assigner: 'cve@mitre.org',
    tags: ['web-application', 'remote-code-execution', 'critical'],
    affected_products: [{
      vendor: 'Example Corp',
      product: 'Web Framework',
      version: '2.1.0'
    }],
    references: [{
      url: 'https://example.com/security-advisory',
      source: 'vendor',
      tags: ['vendor-advisory']
    }],
    cvss_metrics: {
      version: '3.1' as any,
      base_score: 9.8,
      severity: 'critical' as any,
      attack_vector: 'network' as any,
      attack_complexity: 'low' as any,
      privileges_required: 'none' as any,
      user_interaction: 'none' as any,
      scope: 'unchanged' as any,
      confidentiality_impact: 'high' as any,
      integrity_impact: 'high' as any,
      availability_impact: 'high' as any
    }
  });

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  if (analysis.loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-lg">Initializing CVE Analysis Engine...</div>
            <div className="text-sm text-gray-600 mt-2">Loading phantom-cve-core module</div>
          </div>
        </div>
      </div>
    );
  }

  if (analysis.error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          <h3 className="font-semibold mb-2">CVE Analysis Engine Error</h3>
          <p>{analysis.error}</p>
          <p className="text-sm mt-2">The system is running in fallback mode with mock data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CVE Analysis Engine</h1>
          <p className="text-gray-600 mt-2">Enterprise-grade vulnerability intelligence and threat analysis</p>
        </div>
        <div className="flex items-center space-x-4">
          {analysis.healthStatus && (
            <div className="text-sm">
              <div className="flex items-center text-green-600">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                {analysis.healthStatus.status}
              </div>
              <div className="text-gray-500">v{analysis.healthStatus.version}</div>
            </div>
          )}
        </div>
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Search Criteria */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Search Criteria</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min CVSS Score</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={searchCriteria.min_score || ''}
                onChange={(e) => setSearchCriteria(prev => ({ 
                  ...prev, 
                  min_score: parseFloat(e.target.value) || undefined 
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max CVSS Score</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={searchCriteria.max_score || ''}
                onChange={(e) => setSearchCriteria(prev => ({ 
                  ...prev, 
                  max_score: parseFloat(e.target.value) || undefined 
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select
                value={searchCriteria.severity || ''}
                onChange={(e) => setSearchCriteria(prev => ({ 
                  ...prev, 
                  severity: e.target.value as any || undefined 
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Any</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <button
              onClick={searchCVEs}
              disabled={cveState.processing}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {cveState.processing ? 'Searching...' : 'Search CVEs'}
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => processCVE(createSampleCVE())}
              disabled={cveState.processing}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Analyze Sample CVE
            </button>
            <button
              onClick={batchProcessCVEs}
              disabled={cveState.processing || cveState.searchResults.length === 0}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              Batch Process Results
            </button>
            <button
              onClick={() => setCVEState({
                selectedCVE: null,
                analysisResult: null,
                exploitTimeline: null,
                remediationStrategy: null,
                searchResults: [],
                batchResults: [],
                processing: false
              })}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Clear Results
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Analysis Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Search Results:</span>
              <span className="font-medium">{cveState.searchResults.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Batch Processed:</span>
              <span className="font-medium">{cveState.batchResults.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Current CVE:</span>
              <span className="font-medium">{cveState.selectedCVE?.id || 'None'}</span>
            </div>
            <div className="flex justify-between">
              <span>Processing:</span>
              <span className={`font-medium ${cveState.processing ? 'text-orange-600' : 'text-green-600'}`}>
                {cveState.processing ? 'Active' : 'Idle'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {cveState.searchResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Search Results ({cveState.searchResults.length})</h3>
          </div>
          <div className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
            {cveState.searchResults.map((cve) => (
              <div key={cve.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <span className="font-medium text-blue-600">{cve.id}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(cve.cvss_metrics?.severity || 'unknown')}`}>
                        {cve.cvss_metrics?.severity?.toUpperCase() || 'UNKNOWN'}
                      </span>
                      <span className="text-sm text-gray-500">
                        CVSS: {cve.cvss_metrics?.base_score || 'N/A'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 truncate">{cve.description}</p>
                  </div>
                  <button
                    onClick={() => processCVE(cve)}
                    disabled={cveState.processing}
                    className="ml-4 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    Analyze
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CVE Analysis Results */}
      {cveState.analysisResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Vulnerability Assessment */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Vulnerability Assessment</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Risk Level</div>
                  <div className={`text-lg font-semibold ${getRiskColor(cveState.analysisResult.assessment.risk_level)}`}>
                    {cveState.analysisResult.assessment.risk_level.toUpperCase()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Exploitability</div>
                  <div className="text-lg font-semibold">
                    {(cveState.analysisResult.assessment.exploitability * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Impact Score</div>
                  <div className="text-lg font-semibold">
                    {cveState.analysisResult.assessment.impact_score.toFixed(1)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Priority</div>
                  <div className="text-lg font-semibold">
                    {cveState.analysisResult.assessment.remediation_priority}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className={`p-3 rounded-lg ${cveState.analysisResult.assessment.exploit_available ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  <div className="text-sm font-medium">Exploit Available</div>
                  <div className="text-lg">{cveState.analysisResult.assessment.exploit_available ? '⚠️' : '✅'}</div>
                </div>
                <div className={`p-3 rounded-lg ${cveState.analysisResult.assessment.public_exploits ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  <div className="text-sm font-medium">Public Exploits</div>
                  <div className="text-lg">{cveState.analysisResult.assessment.public_exploits ? '⚠️' : '✅'}</div>
                </div>
                <div className={`p-3 rounded-lg ${cveState.analysisResult.assessment.in_the_wild ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  <div className="text-sm font-medium">In the Wild</div>
                  <div className="text-lg">{cveState.analysisResult.assessment.in_the_wild ? '🔥' : '✅'}</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Affected Systems</div>
                <div className="flex flex-wrap gap-2">
                  {cveState.analysisResult.assessment.affected_systems.map((system, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {system}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Threat Intelligence */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Threat Intelligence</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Related CVEs</div>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {cveState.analysisResult.related_cves.map((relatedCve, index) => (
                    <div key={index} className="text-sm text-blue-600">{relatedCve}</div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Threat Actors</div>
                <div className="flex flex-wrap gap-2">
                  {cveState.analysisResult.threat_actors.map((actor, index) => (
                    <span key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                      {actor}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Associated Campaigns</div>
                <div className="flex flex-wrap gap-2">
                  {cveState.analysisResult.campaigns.map((campaign, index) => (
                    <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                      {campaign}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exploit Timeline */}
      {cveState.exploitTimeline && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Exploit Timeline</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Disclosure Date</div>
                <div className="font-medium">{new Date(cveState.exploitTimeline.disclosure_date).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-gray-600">First Exploit</div>
                <div className="font-medium">
                  {cveState.exploitTimeline.first_exploit_date 
                    ? new Date(cveState.exploitTimeline.first_exploit_date).toLocaleDateString()
                    : 'N/A'
                  }
                </div>
              </div>
              <div>
                <div className="text-gray-600">Weaponization</div>
                <div className="font-medium">
                  {cveState.exploitTimeline.weaponization_date 
                    ? new Date(cveState.exploitTimeline.weaponization_date).toLocaleDateString()
                    : 'N/A'
                  }
                </div>
              </div>
              <div>
                <div className="text-gray-600">Mass Exploitation</div>
                <div className="font-medium">
                  {cveState.exploitTimeline.mass_exploitation_date 
                    ? new Date(cveState.exploitTimeline.mass_exploitation_date).toLocaleDateString()
                    : 'N/A'
                  }
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Exploitation Stages</div>
              <div className="space-y-2">
                {cveState.exploitTimeline.exploitation_stages.map((stage, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{stage.stage}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(stage.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{stage.description}</div>
                      {stage.threat_actors.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {stage.threat_actors.map((actor, actorIndex) => (
                            <span key={actorIndex} className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-xs">
                              {actor}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remediation Strategy */}
      {cveState.remediationStrategy && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Remediation Strategy</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600">Priority</div>
                <div className={`text-lg font-semibold ${getRiskColor(cveState.remediationStrategy.priority)}`}>
                  {cveState.remediationStrategy.priority.toUpperCase()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Estimated Hours</div>
                <div className="text-lg font-semibold">{cveState.remediationStrategy.estimated_effort.hours}h</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Complexity</div>
                <div className="text-lg font-semibold">{cveState.remediationStrategy.estimated_effort.complexity}</div>
              </div>
            </div>

            {cveState.remediationStrategy.immediate_actions.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-3">Immediate Actions</div>
                <div className="space-y-2">
                  {cveState.remediationStrategy.immediate_actions.map((action, index) => (
                    <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="font-medium text-red-800">{action.description}</div>
                      <div className="text-sm text-red-600 mt-1">
                        Estimated time: {action.estimated_time}
                      </div>
                      {action.resources_required.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {action.resources_required.map((resource, resourceIndex) => (
                            <span key={resourceIndex} className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs">
                              {resource}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {cveState.remediationStrategy.compensating_controls.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-3">Compensating Controls</div>
                <div className="space-y-2">
                  {cveState.remediationStrategy.compensating_controls.map((control, index) => (
                    <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="font-medium text-blue-800">{control.description}</div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-blue-600">
                          Effectiveness: {(control.effectiveness * 100).toFixed(0)}%
                        </span>
                        <span className="text-sm text-blue-600">
                          Cost: {control.implementation_cost}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Batch Results Summary */}
      {cveState.batchResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Batch Analysis Results</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {cveState.batchResults.filter(r => r.assessment.risk_level === 'critical').length}
                </div>
                <div className="text-sm text-red-600">Critical</div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {cveState.batchResults.filter(r => r.assessment.risk_level === 'high').length}
                </div>
                <div className="text-sm text-orange-600">High</div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {cveState.batchResults.filter(r => r.assessment.risk_level === 'medium').length}
                </div>
                <div className="text-sm text-yellow-600">Medium</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {cveState.batchResults.filter(r => r.assessment.risk_level === 'low').length}
                </div>
                <div className="text-sm text-blue-600">Low</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CVE ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exploitability</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Threat Actors</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cveState.batchResults.slice(0, 10).map((result, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {result.cve.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(result.assessment.risk_level)}`}>
                          {result.assessment.risk_level.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(result.assessment.exploitability * 100).toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.assessment.impact_score.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {result.threat_actors.slice(0, 2).join(', ')}
                        {result.threat_actors.length > 2 && ` +${result.threat_actors.length - 2}`}
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
  );
}
