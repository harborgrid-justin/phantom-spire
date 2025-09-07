'use client';

import { useEffect, useState } from 'react';
import { useServicePage } from '../../../lib/business-logic';

interface TaskWorkflow {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  steps: Array<{
    id: string;
    name: string;
    type: 'manual' | 'automated' | 'approval';
    conditions: string[];
    assignedRole?: string;
  }>;
  triggers: string[];
  createdAt: string;
  lastExecuted?: string;
  executionCount: number;
}

export default function TaskWorkflowsPage() {
  const [workflows, setWorkflows] = useState<TaskWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<TaskWorkflow | null>(null);

  const {
    notifications,
    addNotification,
    removeNotification,
  } = useServicePage('task-workflows');

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const mockWorkflows: TaskWorkflow[] = [
        {
          id: '1',
          name: 'Security Incident Response',
          description: 'Automated workflow for handling security incidents',
          status: 'active',
          steps: [
            { id: '1', name: 'Initial Triage', type: 'automated', conditions: ['severity > medium'] },
            { id: '2', name: 'Analyst Assignment', type: 'automated', conditions: [], assignedRole: 'SOC Analyst' },
            { id: '3', name: 'Investigation', type: 'manual', conditions: [] },
            { id: '4', name: 'Manager Approval', type: 'approval', conditions: ['impact > low'], assignedRole: 'SOC Manager' }
          ],
          triggers: ['New incident created', 'Severity escalation'],
          createdAt: new Date().toISOString(),
          lastExecuted: new Date(Date.now() - 3600000).toISOString(),
          executionCount: 147
        },
        {
          id: '2',
          name: 'Malware Analysis Pipeline',
          description: 'Comprehensive malware analysis workflow',
          status: 'active',
          steps: [
            { id: '1', name: 'File Upload Validation', type: 'automated', conditions: ['file_type in allowed_types'] },
            { id: '2', name: 'Static Analysis', type: 'automated', conditions: [] },
            { id: '3', name: 'Dynamic Analysis', type: 'automated', conditions: ['static_analysis_complete'] },
            { id: '4', name: 'Expert Review', type: 'manual', conditions: ['threat_score > 80'], assignedRole: 'Malware Analyst' }
          ],
          triggers: ['File uploaded', 'Manual trigger'],
          createdAt: new Date().toISOString(),
          lastExecuted: new Date(Date.now() - 7200000).toISOString(),
          executionCount: 89
        }
      ];
      setWorkflows(mockWorkflows);
      addNotification('success', 'Workflows loaded successfully');
    } catch (error) {
      addNotification('error', 'Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStepTypeIcon = (type: string) => {
    switch (type) {
      case 'automated': return '🤖';
      case 'manual': return '👤';
      case 'approval': return '✅';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading workflows...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔄 Task Workflows
          </h1>
          <p className="text-gray-600">
            Design and manage automated task workflows for streamlined operations
          </p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Create Workflow
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-blue-600">{workflows.length}</div>
          <div className="text-sm text-gray-600">Total Workflows</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-green-600">
            {workflows.filter(w => w.status === 'active').length}
          </div>
          <div className="text-sm text-gray-600">Active Workflows</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-orange-600">
            {workflows.reduce((sum, w) => sum + w.executionCount, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Executions</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round(workflows.reduce((sum, w) => sum + w.steps.length, 0) / workflows.length) || 0}
          </div>
          <div className="text-sm text-gray-600">Avg Steps per Workflow</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {workflows.map((workflow) => (
          <div key={workflow.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{workflow.name}</h3>
                <p className="text-gray-600 text-sm">{workflow.description}</p>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}>
                {workflow.status}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-medium text-gray-500">Workflow Steps:</span>
                <div className="mt-2 space-y-2">
                  {workflow.steps.map((step, index) => (
                    <div key={step.id} className="flex items-center space-x-2 text-sm">
                      <span className="text-lg">{getStepTypeIcon(step.type)}</span>
                      <span className="flex-1">{step.name}</span>
                      {step.assignedRole && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {step.assignedRole}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-medium text-gray-500">Triggers:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {workflow.triggers.map((trigger, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-600">
                      {trigger}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                <div>
                  <span className="font-medium">Last Executed:</span>
                  <div>{workflow.lastExecuted ? new Date(workflow.lastExecuted).toLocaleDateString() : 'Never'}</div>
                </div>
                <div>
                  <span className="font-medium">Executions:</span>
                  <div>{workflow.executionCount}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <button 
                  onClick={() => setSelectedWorkflow(workflow)}
                  className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors"
                >
                  View Details
                </button>
                <button className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors">
                  Execute
                </button>
              </div>
              <button className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Workflow Detail Modal */}
      {selectedWorkflow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{selectedWorkflow.name}</h2>
              <button 
                onClick={() => setSelectedWorkflow(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">{selectedWorkflow.description}</p>
              
              <div>
                <h3 className="font-medium mb-2">Workflow Steps:</h3>
                <div className="space-y-2">
                  {selectedWorkflow.steps.map((step, index) => (
                    <div key={step.id} className="border border-gray-200 rounded p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getStepTypeIcon(step.type)}</span>
                          <span className="font-medium">{step.name}</span>
                        </div>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{step.type}</span>
                      </div>
                      {step.conditions.length > 0 && (
                        <div className="mt-2 text-xs text-gray-600">
                          <span className="font-medium">Conditions:</span> {step.conditions.join(', ')}
                        </div>
                      )}
                      {step.assignedRole && (
                        <div className="mt-1 text-xs text-gray-600">
                          <span className="font-medium">Assigned to:</span> {step.assignedRole}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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