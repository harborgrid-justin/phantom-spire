'use client';

import { useEffect, useState } from 'react';
import { CVE } from '../../../types/cve';
import { apiClient } from '../../../lib/api';
import { useServicePage } from '../../../lib/business-logic';

export default function CVERemediationPage() {
  const [cves, setCves] = useState<CVE[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCVE, setSelectedCVE] = useState<CVE | null>(null);
  const [remediationFilter, setRemediationFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Business Logic Integration
  const { connected, notifications, execute, addNotification, removeNotification } = useServicePage('cve-remediation');

  useEffect(() => {
    loadCVEs();
  }, [remediationFilter, priorityFilter]);

  const loadCVEs = async () => {
    try {
      setLoading(true);
      
      const filters: any = {};
      if (remediationFilter !== 'all') {
        if (remediationFilter === 'patched') {
          filters.patchAvailable = true;
        } else if (remediationFilter === 'unpatched') {
          filters.patchAvailable = false;
        }
      }

      const params = new URLSearchParams();
      params.append('limit', '50');
      params.append('sort', JSON.stringify({ field: 'riskScore', order: 'desc' }));
      
      if (Object.keys(filters).length > 0) {
        params.append('filters', JSON.stringify(filters));
      }

      const response = await apiClient.get(`/cve?${params.toString()}`);
      
      let filteredCVEs = response.data.cves;
      if (priorityFilter !== 'all') {
        filteredCVEs = filteredCVEs.filter((cve: CVE) => cve.workflow.priority === priorityFilter);
      }
      
      setCves(filteredCVEs);

      await execute('remediation-loaded', { 
        totalCVEs: filteredCVEs.length,
        patchAvailable: filteredCVEs.filter((c: CVE) => c.patchInfo.patchAvailable).length 
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load CVEs';
      setError(errorMessage);
      addNotification({
        id: 'remediation-error',
        type: 'error',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRemediationStatus = async (cveId: string, status: string, notes: string) => {
    try {
      await apiClient.put(`/cve/${cveId}`, {
        workflow: {
          status,
          notes
        }
      });

      addNotification({
        id: 'status-updated',
        type: 'success',
        message: 'Remediation status updated successfully'
      });

      loadCVEs();
    } catch (err) {
      addNotification({
        id: 'status-error',
        type: 'error',
        message: 'Failed to update remediation status'
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'p1': return 'bg-red-100 text-red-800 border-red-200';
      case 'p2': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'p3': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'p4': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const remediationStats = {
    total: cves.length,
    patchAvailable: cves.filter(c => c.patchInfo.patchAvailable).length,
    inProgress: cves.filter(c => ['investigating', 'patching', 'testing'].includes(c.workflow.status)).length,
    completed: cves.filter(c => c.workflow.status === 'closed').length,
    pastDue: cves.filter(c => c.workflow.dueDate && new Date(c.workflow.dueDate) < new Date()).length
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading remediation data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">CVE Remediation Planning</h1>
        <p className="text-gray-600 mt-2">Comprehensive patch management and vulnerability remediation</p>
      </div>

      {/* Remediation Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="text-2xl font-bold text-gray-900">{remediationStats.total}</div>
          <div className="text-gray-600">Total CVEs</div>
          <div className="text-sm text-blue-600 mt-1">Requiring attention</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="text-2xl font-bold text-gray-900">{remediationStats.patchAvailable}</div>
          <div className="text-gray-600">Patches Available</div>
          <div className="text-sm text-green-600 mt-1">
            {Math.round((remediationStats.patchAvailable / remediationStats.total) * 100)}% coverage
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="text-2xl font-bold text-gray-900">{remediationStats.inProgress}</div>
          <div className="text-gray-600">In Progress</div>
          <div className="text-sm text-orange-600 mt-1">Active remediation</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="text-2xl font-bold text-gray-900">{remediationStats.completed}</div>
          <div className="text-gray-600">Completed</div>
          <div className="text-sm text-purple-600 mt-1">Successfully remediated</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="text-2xl font-bold text-gray-900">{remediationStats.pastDue}</div>
          <div className="text-gray-600">Past Due</div>
          <div className="text-sm text-red-600 mt-1">SLA breached</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remediation Status</label>
            <select
              value={remediationFilter}
              onChange={(e) => setRemediationFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All CVEs</option>
              <option value="patched">Patches Available</option>
              <option value="unpatched">No Patches</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Priorities</option>
              <option value="p1">P1 - Critical</option>
              <option value="p2">P2 - High</option>
              <option value="p3">P3 - Medium</option>
              <option value="p4">P4 - Low</option>
            </select>
          </div>

          <div className="flex-1"></div>

          <div className="flex space-x-2">
            <button 
              onClick={loadCVEs}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Refresh
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              Export Plan
            </button>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
              Schedule Patches
            </button>
          </div>
        </div>
      </div>

      {/* CVE Remediation List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Remediation Queue ({cves.length} CVEs)</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {cves.map((cve) => (
            <div key={cve.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-sm font-medium text-blue-600">{cve.cveId}</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(cve.workflow.priority)}`}>
                      {cve.workflow.priority.toUpperCase()}
                    </span>
                    <span className={`text-xs font-medium ${
                      cve.workflow.status === 'closed' ? 'text-green-600' :
                      ['investigating', 'patching', 'testing'].includes(cve.workflow.status) ? 'text-orange-600' :
                      'text-gray-600'
                    }`}>
                      {cve.workflow.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-900 mb-3">{cve.title}</p>
                  
                  {/* Patch Information */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Patch Information</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Patch Available:</span>
                        <span className={`ml-1 font-medium ${cve.patchInfo.patchAvailable ? 'text-green-600' : 'text-red-600'}`}>
                          {cve.patchInfo.patchAvailable ? 'Yes' : 'No'}
                        </span>
                      </div>
                      {cve.patchInfo.patchDate && (
                        <div>
                          <span className="text-gray-500">Patch Date:</span>
                          <span className="ml-1 text-gray-900">{new Date(cve.patchInfo.patchDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">Complexity:</span>
                        <span className={`ml-1 font-medium ${getComplexityColor(cve.patchInfo.patchComplexity)}`}>
                          {cve.patchInfo.patchComplexity.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mitigation Strategies */}
                  <div className="mb-3">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Recommended Mitigation ({cve.mitigations.length} options)</h5>
                    <div className="space-y-1">
                      {cve.mitigations.slice(0, 2).map((mitigation, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div>
                            <span className="font-medium text-blue-600">{mitigation.type.toUpperCase()}:</span>
                            <span className="ml-1 text-gray-700">{mitigation.description}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {mitigation.effectiveness}% effective • {mitigation.implementationCost} cost
                          </div>
                        </div>
                      ))}
                      {cve.mitigations.length > 2 && (
                        <button 
                          onClick={() => setSelectedCVE(cve)}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          View all {cve.mitigations.length} mitigation options
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Asset Impact */}
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Affected Assets:</span> {cve.assetImpacts.length} assets •
                    <span className="ml-1 font-medium">Business Impact:</span> 
                    <span className="ml-1">${cve.riskAssessment.financialImpact.toLocaleString()}</span> •
                    <span className="ml-1 font-medium">Due Date:</span>
                    <span className={`ml-1 ${cve.workflow.dueDate && new Date(cve.workflow.dueDate) < new Date() ? 'text-red-600 font-medium' : ''}`}>
                      {cve.workflow.dueDate ? new Date(cve.workflow.dueDate).toLocaleDateString() : 'Not set'}
                    </span>
                  </div>
                </div>
                
                <div className="ml-4 flex flex-col space-y-2">
                  <select
                    value={cve.workflow.status}
                    onChange={(e) => updateRemediationStatus(cve.id, e.target.value, 'Status updated from remediation page')}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="new">New</option>
                    <option value="triaged">Triaged</option>
                    <option value="investigating">Investigating</option>
                    <option value="patching">Patching</option>
                    <option value="testing">Testing</option>
                    <option value="closed">Closed</option>
                    <option value="accepted-risk">Accepted Risk</option>
                  </select>
                  <button 
                    onClick={() => setSelectedCVE(cve)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Details
                  </button>
                  <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                    Schedule Patch
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CVE Details Modal */}
      {selectedCVE && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Remediation Plan: {selectedCVE.cveId}
                </h3>
                <button
                  onClick={() => setSelectedCVE(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">All Mitigation Options</h4>
                  <div className="space-y-3">
                    {selectedCVE.mitigations.map((mitigation, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium text-blue-600">{mitigation.type.toUpperCase()}</h5>
                          <div className="text-right text-sm">
                            <div className="text-gray-900 font-medium">{mitigation.effectiveness}% Effective</div>
                            <div className="text-gray-500">{mitigation.implementationCost} Cost</div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{mitigation.description}</p>
                        <div className="flex justify-between text-xs text-gray-500">
                          {mitigation.timeToImplement && (
                            <span>Time to Implement: {mitigation.timeToImplement}</span>
                          )}
                          {mitigation.prerequisites && mitigation.prerequisites.length > 0 && (
                            <span>Prerequisites: {mitigation.prerequisites.join(', ')}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Patch Sources</h4>
                  <div className="space-y-2">
                    {selectedCVE.patchInfo.patchSources.map((source, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 rounded p-3">
                        <div>
                          <span className="text-sm font-medium text-gray-900">{source.type.toUpperCase()}</span>
                          {source.name && <span className="ml-2 text-sm text-gray-600">{source.name}</span>}
                        </div>
                        <a 
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View Source ↗
                        </a>
                      </div>
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
                  Create Remediation Plan
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