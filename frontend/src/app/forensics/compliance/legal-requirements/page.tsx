'use client';

import { useEffect, useState } from 'react';
import { useServicePage } from '../../../../lib/business-logic';

export default function LegalRequirementsPage() {
  const [legalData, setLegalData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const {
    notifications,
    addNotification,
    removeNotification,
    execute
  } = useServicePage('compliance-legal-requirements');

  useEffect(() => {
    fetchLegalData();
  }, []);

  const fetchLegalData = async () => {
    try {
      setLoading(true);
      const response = await execute('getLegalRequirementsData');
      
      if (response.success && response.data) {
        setLegalData(response.data);
        addNotification('success', 'Legal requirements data loaded successfully');
      } else {
        const mockData = {
          activeLegalHolds: 15,
          jurisdictionalRequirements: {
            us_federal: 'compliant',
            eu_gdpr: 'compliant',
            uk_dpa: 'under_review',
            canada_pipeda: 'compliant',
            australia_privacy: 'compliant',
            japan_appi: 'pending_review'
          },
          retentionPolicies: {
            criminal_cases: '7 years',
            civil_cases: '5 years',
            regulatory: '10 years',
            administrative: '3 years',
            employment: '5 years'
          },
          upcomingDeadlines: [
            {
              id: 'deadline_001',
              case: 'Case-2024-078',
              deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
              requirement: 'Discovery deadline',
              priority: 'high',
              jurisdiction: 'US Federal'
            },
            {
              id: 'deadline_002',
              case: 'EU-Investigation-2024-012',
              deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              requirement: 'GDPR data subject request response',
              priority: 'medium',
              jurisdiction: 'EU GDPR'
            },
            {
              id: 'deadline_003',
              case: 'UK-Compliance-2024-005',
              deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
              requirement: 'Data Protection Impact Assessment',
              priority: 'medium',
              jurisdiction: 'UK DPA'
            }
          ],
          complianceFrameworks: [
            {
              framework: 'ISO 27037',
              description: 'Digital evidence identification, collection, acquisition and preservation',
              status: 'certified',
              lastAudit: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
              nextAudit: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000)
            },
            {
              framework: 'NIST SP 800-86',
              description: 'Guide to Integrating Forensic Techniques into Incident Response',
              status: 'compliant',
              lastAudit: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
              nextAudit: new Date(Date.now() + 245 * 24 * 60 * 60 * 1000)
            },
            {
              framework: 'FRE 702',
              description: 'Federal Rules of Evidence - Expert Testimony',
              status: 'compliant',
              lastAudit: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
              nextAudit: new Date(Date.now() + 305 * 24 * 60 * 60 * 1000)
            }
          ],
          legalDocuments: {
            warrants: 12,
            subpoenas: 8,
            court_orders: 5,
            consent_forms: 23,
            legal_holds: 15,
            expert_reports: 7
          }
        };
        setLegalData(mockData);
        addNotification('info', 'Using demonstration data');
      }
    } catch (err) {
      addNotification('error', 'Failed to load legal requirements data');
    } finally {
      setLoading(false);
    }
  };

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'certified': return 'bg-green-100 text-green-800';
      case 'under_review':
      case 'pending_review': return 'bg-yellow-100 text-yellow-800';
      case 'non_compliant': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysUntilDeadline = (deadline: Date) => {
    const now = new Date();
    const diffTime = new Date(deadline).getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading legal requirements data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ⚖️ Legal Requirements
          </h1>
          <p className="text-gray-600">
            Legal requirements tracking and compliance management
          </p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Add Legal Requirement
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-blue-600">{legalData.activeLegalHolds}</div>
          <div className="text-sm text-gray-600">Active Legal Holds</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-green-600">
            {Object.values(legalData.jurisdictionalRequirements || {}).filter(status => status === 'compliant').length}
          </div>
          <div className="text-sm text-gray-600">Compliant Jurisdictions</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-yellow-600">
            {(legalData.upcomingDeadlines || []).length}
          </div>
          <div className="text-sm text-gray-600">Upcoming Deadlines</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-purple-600">
            {Object.values(legalData.legalDocuments || {}).reduce((a: number, b: number) => a + b, 0)}
          </div>
          <div className="text-sm text-gray-600">Legal Documents</div>
        </div>
      </div>

      {/* Jurisdictional Compliance */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Jurisdictional Compliance Status</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(legalData.jurisdictionalRequirements || {}).map(([jurisdiction, status]) => (
              <div key={jurisdiction} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="text-sm font-medium capitalize">
                  {jurisdiction.replace(/_/g, ' ').toUpperCase()}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getComplianceStatusColor(status as string)}`}>
                  {(status as string).replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Upcoming Legal Deadlines</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {(legalData.upcomingDeadlines || []).map((deadline: any) => (
            <div key={deadline.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-medium text-gray-900">{deadline.requirement}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(deadline.priority)}`}>
                      {deadline.priority}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <div><strong>Case:</strong> {deadline.case}</div>
                    <div><strong>Jurisdiction:</strong> {deadline.jurisdiction}</div>
                    <div><strong>Deadline:</strong> {new Date(deadline.deadline).toLocaleDateString()}</div>
                    <div className={`inline-flex items-center ${getDaysUntilDeadline(deadline.deadline) <= 7 ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                      <strong>Days remaining:</strong> {getDaysUntilDeadline(deadline.deadline)}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors">
                    View Details
                  </button>
                  <button className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors">
                    Update Status
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Frameworks */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Compliance Frameworks</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {(legalData.complianceFrameworks || []).map((framework: any, index: number) => (
            <div key={index} className="px-6 py-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-medium text-gray-900">{framework.framework}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getComplianceStatusColor(framework.status)}`}>
                      {framework.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {framework.description}
                  </div>
                  <div className="text-xs text-gray-500">
                    <div>Last Audit: {new Date(framework.lastAudit).toLocaleDateString()}</div>
                    <div>Next Audit: {new Date(framework.nextAudit).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors">
                    View Certificate
                  </button>
                  <button className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors">
                    Schedule Audit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legal Documents Summary */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Legal Documents Summary</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(legalData.legalDocuments || {}).map(([docType, count]) => (
              <div key={docType} className="text-center p-4 bg-gray-50 rounded">
                <div className="text-xl font-bold text-gray-900">{count as number}</div>
                <div className="text-sm text-gray-600 capitalize">
                  {docType.replace(/_/g, ' ')}
                </div>
              </div>
            ))}
          </div>
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