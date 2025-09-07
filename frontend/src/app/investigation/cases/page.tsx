'use client';

import { useEffect, useState } from 'react';
import { useServicePage } from '../../../lib/business-logic';

interface InvestigationCase {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  status: 'open' | 'under-investigation' | 'pending-review' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedInvestigator: string;
  leadInvestigator: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  evidenceCount: number;
  tasksCount: number;
  notesCount: number;
}

export default function InvestigationCasesPage() {
  const [cases, setCases] = useState<InvestigationCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCase, setSelectedCase] = useState<InvestigationCase | null>(null);

  const {
    notifications,
    addNotification,
    removeNotification,
  } = useServicePage('investigation-cases');

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setLoading(true);
      
      const mockCases: InvestigationCase[] = [
        {
          id: '1',
          caseNumber: 'INV-2024-001',
          title: 'APT29 Infrastructure Analysis',
          description: 'Investigation into suspected APT29 command and control infrastructure discovered in network logs',
          status: 'under-investigation',
          priority: 'critical',
          assignedInvestigator: 'Sarah Chen',
          leadInvestigator: 'Mike Johnson',
          category: 'Advanced Persistent Threat',
          tags: ['APT29', 'C2', 'Network Analysis'],
          createdAt: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
          updatedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          dueDate: new Date(Date.now() + 604800000).toISOString(), // 1 week from now
          evidenceCount: 23,
          tasksCount: 8,
          notesCount: 15
        },
        {
          id: '2',
          caseNumber: 'INV-2024-002',
          title: 'Phishing Campaign Investigation',
          description: 'Analysis of widespread phishing campaign targeting financial sector employees',
          status: 'open',
          priority: 'high',
          assignedInvestigator: 'Alex Rodriguez',
          leadInvestigator: 'Sarah Chen',
          category: 'Phishing',
          tags: ['Phishing', 'Financial', 'Email Security'],
          createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          updatedAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          dueDate: new Date(Date.now() + 1209600000).toISOString(), // 2 weeks from now
          evidenceCount: 45,
          tasksCount: 12,
          notesCount: 28
        },
        {
          id: '3',
          caseNumber: 'INV-2024-003',
          title: 'Insider Threat Assessment',
          description: 'Investigation into anomalous data access patterns by privileged user account',
          status: 'pending-review',
          priority: 'medium',
          assignedInvestigator: 'David Kim',
          leadInvestigator: 'Mike Johnson',
          category: 'Insider Threat',
          tags: ['Insider Threat', 'Data Exfiltration', 'User Behavior'],
          createdAt: new Date(Date.now() - 864000000).toISOString(), // 10 days ago
          updatedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          evidenceCount: 12,
          tasksCount: 6,
          notesCount: 9
        }
      ];

      setCases(mockCases);
      addNotification('success', 'Investigation cases loaded successfully');
    } catch (error) {
      addNotification('error', 'Failed to load investigation cases');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'under-investigation': return 'bg-yellow-100 text-yellow-800';
      case 'pending-review': return 'bg-purple-100 text-purple-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCases = selectedStatus === 'all' 
    ? cases 
    : cases.filter(c => c.status === selectedStatus);

  const statuses = ['all', 'open', 'under-investigation', 'pending-review', 'closed'];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading investigation cases...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔍 Investigation Cases
          </h1>
          <p className="text-gray-600">
            Manage cybersecurity investigation cases and track investigation progress
          </p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Open New Case
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-blue-600">{cases.length}</div>
          <div className="text-sm text-gray-600">Total Cases</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-yellow-600">
            {cases.filter(c => c.status === 'under-investigation').length}
          </div>
          <div className="text-sm text-gray-600">Under Investigation</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-red-600">
            {cases.filter(c => c.priority === 'critical' || c.priority === 'high').length}
          </div>
          <div className="text-sm text-gray-600">High Priority</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-green-600">
            {cases.reduce((sum, c) => sum + c.evidenceCount, 0)}
          </div>
          <div className="text-sm text-gray-600">Evidence Items</div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex space-x-4 mb-6">
        {statuses.map(status => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status === 'all' ? 'All Cases' : status.split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
          </button>
        ))}
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCases.map((caseItem) => (
          <div key={caseItem.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-mono text-gray-500">{caseItem.caseNumber}</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(caseItem.status)}`}>
                    {caseItem.status.split('-').join(' ')}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(caseItem.priority)}`}>
                    {caseItem.priority}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{caseItem.title}</h3>
                <p className="text-gray-600 text-sm">{caseItem.description}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-medium text-gray-500">Lead Investigator:</span>
                  <div className="text-sm text-gray-700">{caseItem.leadInvestigator}</div>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500">Assigned To:</span>
                  <div className="text-sm text-gray-700">{caseItem.assignedInvestigator}</div>
                </div>
              </div>

              <div>
                <span className="text-xs font-medium text-gray-500">Category:</span>
                <div className="text-sm text-gray-700">{caseItem.category}</div>
              </div>

              <div>
                <span className="text-xs font-medium text-gray-500">Tags:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {caseItem.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-blue-50 p-2 rounded">
                  <div className="text-lg font-bold text-blue-600">{caseItem.evidenceCount}</div>
                  <div className="text-xs text-gray-600">Evidence</div>
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <div className="text-lg font-bold text-green-600">{caseItem.tasksCount}</div>
                  <div className="text-xs text-gray-600">Tasks</div>
                </div>
                <div className="bg-purple-50 p-2 rounded">
                  <div className="text-lg font-bold text-purple-600">{caseItem.notesCount}</div>
                  <div className="text-xs text-gray-600">Notes</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                <div>
                  <span className="font-medium">Created:</span>
                  <div>{new Date(caseItem.createdAt).toLocaleDateString()}</div>
                </div>
                <div>
                  <span className="font-medium">Due Date:</span>
                  <div>{caseItem.dueDate ? new Date(caseItem.dueDate).toLocaleDateString() : 'Not set'}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <button 
                  onClick={() => setSelectedCase(caseItem)}
                  className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors"
                >
                  View Details
                </button>
                <button className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors">
                  Timeline
                </button>
              </div>
              <div className="flex space-x-2">
                <button className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 transition-colors">
                  Evidence
                </button>
                <button className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors">
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCases.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No cases found</div>
          <div className="text-gray-400 text-sm">
            {selectedStatus === 'all' 
              ? 'No investigation cases available'
              : `No cases with status "${selectedStatus}"`
            }
          </div>
        </div>
      )}

      {/* Case Detail Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold">{selectedCase.title}</h2>
                <div className="text-sm text-gray-500">{selectedCase.caseNumber}</div>
              </div>
              <button 
                onClick={() => setSelectedCase(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Case Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Status:</span> {selectedCase.status}</div>
                    <div><span className="font-medium">Priority:</span> {selectedCase.priority}</div>
                    <div><span className="font-medium">Category:</span> {selectedCase.category}</div>
                    <div><span className="font-medium">Lead:</span> {selectedCase.leadInvestigator}</div>
                    <div><span className="font-medium">Assigned:</span> {selectedCase.assignedInvestigator}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-sm text-gray-600">{selectedCase.description}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Case Metrics</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center bg-gray-50 p-2 rounded">
                      <div className="font-bold text-blue-600">{selectedCase.evidenceCount}</div>
                      <div className="text-xs">Evidence</div>
                    </div>
                    <div className="text-center bg-gray-50 p-2 rounded">
                      <div className="font-bold text-green-600">{selectedCase.tasksCount}</div>
                      <div className="text-xs">Tasks</div>
                    </div>
                    <div className="text-center bg-gray-50 p-2 rounded">
                      <div className="font-bold text-purple-600">{selectedCase.notesCount}</div>
                      <div className="text-xs">Notes</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Timeline</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Created:</span> {new Date(selectedCase.createdAt).toLocaleString()}</div>
                    <div><span className="font-medium">Last Updated:</span> {new Date(selectedCase.updatedAt).toLocaleString()}</div>
                    {selectedCase.dueDate && (
                      <div><span className="font-medium">Due Date:</span> {new Date(selectedCase.dueDate).toLocaleString()}</div>
                    )}
                  </div>
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