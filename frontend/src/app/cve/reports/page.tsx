'use client';

import { useEffect, useState } from 'react';
import { CVE, CVEReport } from '../../../types/cve';
import { apiClient } from '../../../lib/api';
import { useServicePage } from '../../../lib/business-logic';

export default function CVEReportsPage() {
  const [reports, setReports] = useState<CVEReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportForm, setReportForm] = useState({
    name: '',
    type: 'executive',
    format: 'pdf',
    schedule: false,
    frequency: 'monthly',
    recipients: ['']
  });

  // Business Logic Integration
  const { connected, notifications, execute, addNotification, removeNotification } = useServicePage('cve-reports');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/cve/reports');
      setReports(response.data);

      await execute('reports-loaded', { 
        totalReports: response.data.length,
        completedReports: response.data.filter((r: CVEReport) => r.status === 'completed').length 
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load reports';
      setError(errorMessage);
      addNotification({
        id: 'reports-error',
        type: 'error',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      setGeneratingReport(true);
      
      const reportData = {
        ...reportForm,
        schedule: reportForm.schedule ? {
          frequency: reportForm.frequency,
          recipients: reportForm.recipients.filter(email => email.trim() !== '')
        } : undefined
      };

      await apiClient.post('/cve/reports', reportData);
      
      addNotification({
        id: 'report-generated',
        type: 'success',
        message: 'Report generation initiated successfully'
      });

      // Reset form
      setReportForm({
        name: '',
        type: 'executive',
        format: 'pdf',
        schedule: false,
        frequency: 'monthly',
        recipients: ['']
      });

      // Reload reports
      setTimeout(loadReports, 2000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate report';
      addNotification({
        id: 'report-error',
        type: 'error',
        message: errorMessage
      });
    } finally {
      setGeneratingReport(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'generating': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'executive': return '👔';
      case 'technical': return '🔧';
      case 'compliance': return '📋';
      case 'risk': return '⚠️';
      case 'trend': return '📈';
      default: return '📄';
    }
  };

  const reportTemplates = [
    {
      type: 'executive',
      name: 'Executive Summary',
      description: 'High-level overview for senior management',
      icon: '👔',
      includes: ['Risk metrics', 'Key vulnerabilities', 'Remediation status', 'Financial impact']
    },
    {
      type: 'technical',
      name: 'Technical Report',
      description: 'Detailed technical analysis for security teams',
      icon: '🔧',
      includes: ['CVSS scores', 'Exploit details', 'Patch information', 'Mitigation strategies']
    },
    {
      type: 'compliance',
      name: 'Compliance Report',
      description: 'Regulatory compliance and audit requirements',
      icon: '📋',
      includes: ['Framework mapping', 'Compliance status', 'Audit trails', 'Policy adherence']
    },
    {
      type: 'risk',
      name: 'Risk Assessment',
      description: 'Business risk analysis and prioritization',
      icon: '⚠️',
      includes: ['Risk scores', 'Business impact', 'Asset exposure', 'Risk trends']
    },
    {
      type: 'trend',
      name: 'Trend Analysis',
      description: 'Historical trends and predictive analytics',
      icon: '📈',
      includes: ['Time series data', 'Trend analysis', 'Forecasting', 'Pattern recognition']
    }
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading CVE reports...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">CVE Executive Reports</h1>
        <p className="text-gray-600 mt-2">Comprehensive reporting and analytics for vulnerability management</p>
      </div>

      {/* Report Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="text-2xl font-bold text-gray-900">{reports.length}</div>
          <div className="text-gray-600">Total Reports</div>
          <div className="text-sm text-blue-600 mt-1">
            {reports.filter(r => r.status === 'completed').length} completed
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="text-2xl font-bold text-gray-900">
            {reports.filter(r => r.schedule).length}
          </div>
          <div className="text-gray-600">Scheduled Reports</div>
          <div className="text-sm text-green-600 mt-1">
            Automated delivery
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="text-2xl font-bold text-gray-900">
            {reports.filter(r => r.status === 'generating').length}
          </div>
          <div className="text-gray-600">Generating</div>
          <div className="text-sm text-orange-600 mt-1">
            In progress
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="text-2xl font-bold text-gray-900">
            {new Set(reports.map(r => r.type)).size}
          </div>
          <div className="text-gray-600">Report Types</div>
          <div className="text-sm text-purple-600 mt-1">
            Available formats
          </div>
        </div>
      </div>

      {/* Report Generation Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate New Report</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Name</label>
              <input
                type="text"
                value={reportForm.name}
                onChange={(e) => setReportForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter report name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                <select
                  value={reportForm.type}
                  onChange={(e) => setReportForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="executive">Executive Summary</option>
                  <option value="technical">Technical Report</option>
                  <option value="compliance">Compliance Report</option>
                  <option value="risk">Risk Assessment</option>
                  <option value="trend">Trend Analysis</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                <select
                  value={reportForm.format}
                  onChange={(e) => setReportForm(prev => ({ ...prev, format: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reportForm.schedule}
                  onChange={(e) => setReportForm(prev => ({ ...prev, schedule: e.target.checked }))}
                  className="mr-2"
                />
                Schedule this report
              </label>
            </div>

            {reportForm.schedule && (
              <div className="space-y-3 pl-6 border-l-2 border-blue-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                  <select
                    value={reportForm.frequency}
                    onChange={(e) => setReportForm(prev => ({ ...prev, frequency: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
                  {reportForm.recipients.map((email, index) => (
                    <div key={index} className="flex mb-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          const newRecipients = [...reportForm.recipients];
                          newRecipients[index] = e.target.value;
                          setReportForm(prev => ({ ...prev, recipients: newRecipients }));
                        }}
                        placeholder="Enter email address"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                      />
                      {reportForm.recipients.length > 1 && (
                        <button
                          onClick={() => {
                            const newRecipients = reportForm.recipients.filter((_, i) => i !== index);
                            setReportForm(prev => ({ ...prev, recipients: newRecipients }));
                          }}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => setReportForm(prev => ({ ...prev, recipients: [...prev.recipients, ''] }))}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add recipient
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={generateReport}
              disabled={generatingReport || !reportForm.name}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {generatingReport ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Templates</h3>
          
          <div className="space-y-3">
            {reportTemplates.map((template) => (
              <div 
                key={template.type}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  reportForm.type === template.type 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setReportForm(prev => ({ ...prev, type: template.type }))}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">{template.icon}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  <strong>Includes:</strong> {template.includes.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
          <button 
            onClick={loadReports}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Refresh
          </button>
        </div>

        <div className="divide-y divide-gray-200">
          {reports.map((report) => (
            <div key={report.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{getTypeIcon(report.type)}</span>
                    <h4 className="font-medium text-gray-900">{report.name}</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-2">
                    <div>
                      <span className="text-gray-500">Type:</span> {report.type}
                    </div>
                    <div>
                      <span className="text-gray-500">Format:</span> {report.format.toUpperCase()}
                    </div>
                    <div>
                      <span className="text-gray-500">Generated:</span> {new Date(report.generatedAt).toLocaleDateString()}
                    </div>
                    <div>
                      {report.schedule ? (
                        <span className="text-green-600">Scheduled ({report.schedule.frequency})</span>
                      ) : (
                        <span className="text-gray-500">One-time</span>
                      )}
                    </div>
                  </div>

                  {report.schedule && report.schedule.recipients.length > 0 && (
                    <div className="text-sm text-gray-500">
                      <span>Recipients:</span> {report.schedule.recipients.join(', ')}
                    </div>
                  )}
                </div>
                
                <div className="ml-4 flex flex-col space-y-2">
                  {report.status === 'completed' && (
                    <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                      Download
                    </button>
                  )}
                  <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                    View Details
                  </button>
                  {report.schedule && (
                    <button className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">
                      Edit Schedule
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {reports.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <span className="text-4xl mb-4 block">📄</span>
            <p>No reports generated yet</p>
            <p className="text-sm">Create your first report using the form above</p>
          </div>
        )}
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