'use client';

import { useEffect, useState } from 'react';
import { useServicePage } from '../../../lib/business-logic';

interface TaskDependency {
  id: string;
  name: string;
  dependentTaskId: string;
  dependentTaskName: string;
  prerequisiteTaskId: string;
  prerequisiteTaskName: string;
  dependencyType: 'blocking' | 'soft' | 'conditional';
  condition?: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
}

interface DependencyGraph {
  nodes: Array<{
    id: string;
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    type: 'task' | 'milestone';
  }>;
  edges: Array<{
    from: string;
    to: string;
    type: 'blocking' | 'soft' | 'conditional';
  }>;
}

export default function TaskDependenciesPage() {
  const [dependencies, setDependencies] = useState<TaskDependency[]>([]);
  const [dependencyGraph, setDependencyGraph] = useState<DependencyGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'list' | 'graph'>('list');

  const {
    notifications,
    addNotification,
    removeNotification,
  } = useServicePage('task-dependencies');

  useEffect(() => {
    fetchDependencies();
  }, []);

  const fetchDependencies = async () => {
    try {
      setLoading(true);
      
      const mockDependencies: TaskDependency[] = [
        {
          id: '1',
          name: 'Analysis before Review',
          dependentTaskId: 'task-002',
          dependentTaskName: 'Security Review',
          prerequisiteTaskId: 'task-001',
          prerequisiteTaskName: 'Initial Analysis',
          dependencyType: 'blocking',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Manager Approval Gate',
          dependentTaskId: 'task-003',
          dependentTaskName: 'Deploy Countermeasures',
          prerequisiteTaskId: 'task-002',
          prerequisiteTaskName: 'Security Review',
          dependencyType: 'blocking',
          condition: 'severity >= high',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Parallel Investigation',
          dependentTaskId: 'task-004',
          dependentTaskName: 'Extended Analysis',
          prerequisiteTaskId: 'task-001',
          prerequisiteTaskName: 'Initial Analysis',
          dependencyType: 'soft',
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ];

      const mockGraph: DependencyGraph = {
        nodes: [
          { id: 'task-001', name: 'Initial Analysis', status: 'completed', type: 'task' },
          { id: 'task-002', name: 'Security Review', status: 'running', type: 'task' },
          { id: 'task-003', name: 'Deploy Countermeasures', status: 'pending', type: 'task' },
          { id: 'task-004', name: 'Extended Analysis', status: 'running', type: 'task' },
          { id: 'milestone-001', name: 'Analysis Complete', status: 'completed', type: 'milestone' }
        ],
        edges: [
          { from: 'task-001', to: 'task-002', type: 'blocking' },
          { from: 'task-002', to: 'task-003', type: 'blocking' },
          { from: 'task-001', to: 'task-004', type: 'soft' },
          { from: 'task-001', to: 'milestone-001', type: 'blocking' }
        ]
      };

      setDependencies(mockDependencies);
      setDependencyGraph(mockGraph);
      addNotification('success', 'Dependencies loaded successfully');
    } catch (error) {
      addNotification('error', 'Failed to load dependencies');
    } finally {
      setLoading(false);
    }
  };

  const getDependencyTypeColor = (type: string) => {
    switch (type) {
      case 'blocking': return 'bg-red-100 text-red-800';
      case 'soft': return 'bg-yellow-100 text-yellow-800';
      case 'conditional': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNodeStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'running': return 'bg-blue-500';
      case 'pending': return 'bg-gray-400';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading dependencies...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔗 Task Dependencies
          </h1>
          <p className="text-gray-600">
            Manage task dependencies and visualize workflow relationships
          </p>
        </div>
        <div className="flex space-x-4">
          <div className="flex bg-gray-200 rounded-lg p-1">
            <button
              onClick={() => setSelectedView('list')}
              className={`px-4 py-2 rounded transition-colors ${
                selectedView === 'list' ? 'bg-white shadow' : 'text-gray-600'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setSelectedView('graph')}
              className={`px-4 py-2 rounded transition-colors ${
                selectedView === 'graph' ? 'bg-white shadow' : 'text-gray-600'
              }`}
            >
              Graph View
            </button>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Add Dependency
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-blue-600">{dependencies.length}</div>
          <div className="text-sm text-gray-600">Total Dependencies</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-red-600">
            {dependencies.filter(d => d.dependencyType === 'blocking').length}
          </div>
          <div className="text-sm text-gray-600">Blocking Dependencies</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-green-600">
            {dependencies.filter(d => d.status === 'active').length}
          </div>
          <div className="text-sm text-gray-600">Active Dependencies</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-purple-600">
            {dependencyGraph?.nodes.filter(n => n.type === 'task').length || 0}
          </div>
          <div className="text-sm text-gray-600">Connected Tasks</div>
        </div>
      </div>

      {/* List View */}
      {selectedView === 'list' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Dependency Rules</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {dependencies.map((dependency) => (
              <div key={dependency.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium text-gray-900">{dependency.name}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDependencyTypeColor(dependency.dependencyType)}`}>
                        {dependency.dependencyType}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(dependency.status)}`}>
                        {dependency.status}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Prerequisite:</span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {dependency.prerequisiteTaskName}
                        </span>
                        <span>→</span>
                        <span className="font-medium">Dependent:</span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          {dependency.dependentTaskName}
                        </span>
                      </div>
                      
                      {dependency.condition && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Condition:</span>
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                            {dependency.condition}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors">
                      Edit
                    </button>
                    <button className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Graph View */}
      {selectedView === 'graph' && dependencyGraph && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Dependency Graph</h2>
          
          <div className="relative bg-gray-50 rounded-lg p-8 min-h-96">
            {/* Simple visual representation */}
            <div className="grid grid-cols-4 gap-8 h-full">
              {dependencyGraph.nodes.map((node, index) => (
                <div
                  key={node.id}
                  className="relative"
                  style={{ 
                    gridColumn: Math.floor(index / 2) + 1,
                    gridRow: (index % 2) + 1
                  }}
                >
                  <div className={`${getNodeStatusColor(node.status)} text-white p-4 rounded-lg text-center shadow-md`}>
                    <div className="text-sm font-medium">{node.name}</div>
                    <div className="text-xs mt-1 opacity-90">
                      {node.type === 'milestone' ? '🎯' : '📋'} {node.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Legend */}
            <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow border">
              <h3 className="font-medium mb-2">Legend</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Completed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Running</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-400 rounded"></div>
                  <span>Pending</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Failed</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p>Dependencies are shown as connections between tasks. Blocking dependencies prevent dependent tasks from starting until prerequisites are complete.</p>
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