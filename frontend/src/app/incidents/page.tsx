'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  AlertTriangle, 
  Plus, 
  User, 
  Clock, 
  Shield, 
  Eye, 
  Edit, 
  Share, 
  MoreVertical,
  Play,
  MessageSquare,
  FileText,
  CheckCircle,
  AlertCircle,
  Info,
  XCircle,
  Users,
  Database,
  TrendingUp
} from 'lucide-react';

interface IncidentMetrics {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  averageResolutionTime: number;
  escalatedCount: number;
  criticalCount: number;
}

interface SecurityIncident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'assigned' | 'in_progress' | 'investigating' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
  reporter: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  tags: string[];
  indicators: string[];
  timeline: Array<{
    id: string;
    timestamp: Date;
    user: string;
    action: string;
    description: string;
  }>;
  impact?: {
    affectedSystems: number;
    affectedUsers: number;
    dataExfiltrated: boolean;
    businessImpact: string;
  };
}

interface PlaybookStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  assignee?: string;
  estimatedDuration: number;
  actualDuration?: number;
  dependencies?: string[];
  automatable: boolean;
}

interface IncidentPlaybook {
  id: string;
  name: string;
  description: string;
  applicableTypes: string[];
  steps: PlaybookStep[];
  estimatedTotalTime: number;
}

export default function IncidentResponseCenter() {
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [metrics, setMetrics] = useState<IncidentMetrics | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<SecurityIncident | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPlaybookDialog, setShowPlaybookDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);

  // Load incidents and metrics
  useEffect(() => {
    loadIncidents();
    loadMetrics();
  }, []);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const mockIncidents = generateMockIncidents();
      setIncidents(mockIncidents);
    } catch (error) {
      console.error('Failed to load incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    const mockMetrics: IncidentMetrics = {
      total: 167,
      open: 23,
      inProgress: 12,
      resolved: 132,
      averageResolutionTime: 4.2,
      escalatedCount: 3,
      criticalCount: 5
    };
    setMetrics(mockMetrics);
  };

  const generateMockIncidents = (): SecurityIncident[] => {
    const mockIncidents: SecurityIncident[] = [];
    const statuses = ['new', 'assigned', 'in_progress', 'investigating', 'resolved'] as const;
    const priorities = ['low', 'medium', 'high', 'critical'] as const;
    const severities = ['low', 'medium', 'high', 'critical'] as const;
    const titles = [
      'Suspicious network activity detected',
      'Malware infection on workstation',
      'Phishing email campaign identified',
      'Data exfiltration attempt',
      'Unauthorized access to database',
      'Ransomware indicators detected',
      'APT activity observed',
      'Credential theft incident',
      'DDoS attack in progress',
      'Insider threat investigation'
    ];

    for (let i = 0; i < 25; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const title = titles[Math.floor(Math.random() * titles.length)];
      const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);

      mockIncidents.push({
        id: `INC-2024-${String(i + 1).padStart(4, '0')}`,
        title,
        description: `Investigation required for ${title.toLowerCase()}. Initial triage indicates ${severity} severity incident requiring ${priority} priority response.`,
        severity,
        status,
        priority,
        assignee: Math.random() > 0.3 ? 'John Smith' : undefined,
        reporter: 'Security Analyst',
        createdAt,
        updatedAt: new Date(createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000),
        dueDate: priority === 'critical' ? new Date(createdAt.getTime() + 2 * 60 * 60 * 1000) : undefined,
        tags: ['security', priority === 'critical' ? 'urgent' : 'standard'],
        indicators: [`IOC-${Math.floor(Math.random() * 1000)}`],
        timeline: [
          {
            id: '1',
            timestamp: createdAt,
            user: 'System',
            action: 'Incident Created',
            description: 'Initial incident report generated'
          }
        ],
        impact: {
          affectedSystems: Math.floor(Math.random() * 10) + 1,
          affectedUsers: Math.floor(Math.random() * 100) + 10,
          dataExfiltrated: Math.random() > 0.8,
          businessImpact: priority
        }
      });
    }

    return mockIncidents.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'assigned': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'investigating': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityBorderColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-l-red-500';
      case 'high': return 'border-l-orange-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'Recently';
  };

  const filteredIncidents = useMemo(() => {
    switch (activeTab) {
      case 0: return incidents; // All
      case 1: return incidents.filter(i => ['new', 'assigned', 'in_progress', 'investigating'].includes(i.status)); // Active
      case 2: return incidents.filter(i => i.priority === 'critical' || i.priority === 'high'); // High Priority
      case 3: return incidents.filter(i => !i.assignee); // Unassigned
      case 4: return incidents.filter(i => i.status === 'resolved' || i.status === 'closed'); // Resolved
      default: return incidents;
    }
  }, [incidents, activeTab]);

  const mockPlaybooks: IncidentPlaybook[] = [
    {
      id: 'malware-response',
      name: 'Malware Incident Response',
      description: 'Standard response procedures for malware infections',
      applicableTypes: ['malware', 'virus', 'trojan'],
      estimatedTotalTime: 240,
      steps: [
        {
          id: 'isolate',
          title: 'Isolate Affected Systems',
          description: 'Immediately isolate infected systems from the network',
          status: 'completed',
          estimatedDuration: 15,
          actualDuration: 12,
          assignee: 'Security Team',
          automatable: true
        },
        {
          id: 'analyze',
          title: 'Malware Analysis',
          description: 'Analyze the malware sample and identify indicators',
          status: 'in_progress',
          estimatedDuration: 60,
          assignee: 'Malware Analyst',
          dependencies: ['isolate'],
          automatable: false
        },
        {
          id: 'cleanup',
          title: 'System Cleanup',
          description: 'Remove malware and restore system integrity',
          status: 'pending',
          estimatedDuration: 90,
          dependencies: ['analyze'],
          automatable: false
        },
        {
          id: 'monitor',
          title: 'Post-Incident Monitoring',
          description: 'Monitor for signs of reinfection or lateral movement',
          status: 'pending',
          estimatedDuration: 60,
          dependencies: ['cleanup'],
          automatable: true
        }
      ]
    }
  ];

  const tabLabels = [
    { label: 'All Incidents', count: incidents.length },
    { label: 'Active', count: incidents.filter(i => !['resolved', 'closed'].includes(i.status)).length },
    { label: 'High Priority', count: incidents.filter(i => ['critical', 'high'].includes(i.priority)).length },
    { label: 'Unassigned', count: incidents.filter(i => !i.assignee).length },
    { label: 'Resolved', count: incidents.filter(i => ['resolved', 'closed'].includes(i.status)).length }
  ];

  const renderIncidentCard = (incident: SecurityIncident) => (
    <div
      key={incident.id}
      className={`bg-white rounded-lg shadow-sm border-l-4 ${getPriorityBorderColor(incident.priority)} p-4 mb-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-1`}
      onClick={() => setSelectedIncident(incident)}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-gray-900">{incident.id}</h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(incident.status)}`}>
              {incident.status.replace('_', ' ').toUpperCase()}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(incident.priority)}`}>
              {incident.priority.toUpperCase()}
            </span>
          </div>
          <h4 className="font-medium text-gray-900 mb-1">{incident.title}</h4>
          <p className="text-sm text-gray-600 mb-2">
            {incident.description.length > 150
              ? `${incident.description.substring(0, 150)}...`
              : incident.description}
          </p>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {incident.assignee || 'Unassigned'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {getTimeAgo(incident.createdAt)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {incident.indicators.length} IOCs
            </span>
          </div>
        </div>

        {incident.priority === 'critical' && (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 border border-red-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            URGENT
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            Incident Response Center
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateDialog(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Incident
            </button>
            <button
              onClick={() => setShowPlaybookDialog(true)}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Playbooks
            </button>
          </div>
        </div>

        {/* Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.total}</div>
              <div className="text-xs text-gray-500">Total Incidents</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{metrics.open}</div>
              <div className="text-xs text-gray-500">Open</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{metrics.inProgress}</div>
              <div className="text-xs text-gray-500">In Progress</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.resolved}</div>
              <div className="text-xs text-gray-500">Resolved</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.averageResolutionTime}h</div>
              <div className="text-xs text-gray-500">Avg Resolution</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{metrics.criticalCount}</div>
              <div className="text-xs text-gray-500">Critical</div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 mb-6">
        <div className="flex space-x-8 px-6">
          {tabLabels.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === index
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              <span className={`px-2 py-1 rounded-full text-xs ${
                activeTab === index ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-6 px-6 pb-6 overflow-hidden">
        {/* Incident List */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-4 overflow-auto">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Incidents ({filteredIncidents.length})
          </h2>
          
          {filteredIncidents.map(renderIncidentCard)}
          
          {filteredIncidents.length === 0 && (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No incidents found</h3>
              <p className="text-sm text-gray-400">
                All clear! No incidents match the current filter criteria.
              </p>
            </div>
          )}
        </div>

        {/* Incident Details Panel */}
        <div className="w-96 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          {selectedIncident ? (
            <div>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-bold text-gray-900">{selectedIncident.id}</h2>
                <div className="flex gap-1">
                  <button className="text-gray-400 hover:text-blue-600">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="text-gray-400 hover:text-green-600">
                    <Share className="h-4 w-4" />
                  </button>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-medium text-gray-900 mb-2">{selectedIncident.title}</h3>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedIncident.status)}`}>
                  {selectedIncident.status.replace('_', ' ').toUpperCase()}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(selectedIncident.priority)}`}>
                  {selectedIncident.priority.toUpperCase()} PRIORITY
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(selectedIncident.severity)}`}>
                  {selectedIncident.severity.toUpperCase()} SEVERITY
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-4">{selectedIncident.description}</p>

              <hr className="my-4" />

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Incident Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Assignee:</span>
                    <span className="text-sm text-gray-900">{selectedIncident.assignee || 'Unassigned'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Reporter:</span>
                    <span className="text-sm text-gray-900">{selectedIncident.reporter}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Created:</span>
                    <span className="text-sm text-gray-900">{selectedIncident.createdAt.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">IOCs:</span>
                    <span className="text-sm text-gray-900">{selectedIncident.indicators.length}</span>
                  </div>
                </div>
              </div>

              {selectedIncident.impact && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Impact Assessment</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Affected Systems:</span>
                      <span className="text-sm text-gray-900">{selectedIncident.impact.affectedSystems}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Affected Users:</span>
                      <span className="text-sm text-gray-900">{selectedIncident.impact.affectedUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Data Exfiltrated:</span>
                      <span className="text-sm text-gray-900">{selectedIncident.impact.dataExfiltrated ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Recent Activity</h4>
                <div className="space-y-3">
                  {selectedIncident.timeline.slice(0, 3).map((entry) => (
                    <div key={entry.id} className="flex gap-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{entry.action}</p>
                            <p className="text-xs text-gray-500">by {entry.user}</p>
                          </div>
                          <span className="text-xs text-gray-400">
                            {entry.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                  <Play className="h-3 w-3" />
                  Start Playbook
                </button>
                <button className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                  <User className="h-3 w-3" />
                  Assign
                </button>
                <button className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                  <MessageSquare className="h-3 w-3" />
                  Comment
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">Select an Incident</h3>
              <p className="text-sm text-gray-400">
                Click on an incident to view its details and manage the response.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Incident Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Create New Incident</h2>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Incident Title</label>
                  <input
                    type="text"
                    placeholder="Brief description of the incident..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Detailed description of the incident..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                  <input
                    type="text"
                    placeholder="Assign to team member..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <input
                    type="text"
                    placeholder="malware, phishing, etc. (comma-separated)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateDialog(false)}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Create Incident
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Playbook Dialog */}
      {showPlaybookDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Incident Response Playbooks</h2>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockPlaybooks.map((playbook) => (
                  <div key={playbook.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{playbook.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{playbook.description}</p>
                    
                    <div className="mb-4">
                      <span className="text-xs text-gray-500">
                        Estimated Duration: {Math.floor(playbook.estimatedTotalTime / 60)}h {playbook.estimatedTotalTime % 60}m
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      {playbook.steps.slice(0, 3).map((step) => (
                        <div key={step.id} className="flex items-center gap-2">
                          {step.status === 'completed' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : step.status === 'in_progress' ? (
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                          ) : (
                            <div className="h-4 w-4 border border-gray-300 rounded-full" />
                          )}
                          <span className="text-sm text-gray-700">{step.title}</span>
                        </div>
                      ))}
                      {playbook.steps.length > 3 && (
                        <div className="text-xs text-gray-500 ml-6">
                          +{playbook.steps.length - 3} more steps
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button className="text-sm border border-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-50">
                        View Details
                      </button>
                      <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                        Execute
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowPlaybookDialog(false)}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
