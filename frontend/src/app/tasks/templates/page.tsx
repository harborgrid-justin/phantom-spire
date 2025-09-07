'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api';
import { useServicePage } from '../../../lib/business-logic';

interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: string[];
  estimatedDuration: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  requiredSkills: string[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export default function TaskTemplatesPage() {
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Enhanced business logic integration
  const {
    notifications,
    addNotification,
    removeNotification,
  } = useServicePage('task-templates');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockTemplates: TaskTemplate[] = [
        {
          id: '1',
          name: 'Malware Analysis Template',
          description: 'Standard template for analyzing malware samples',
          category: 'Analysis',
          steps: ['Initial triage', 'Static analysis', 'Dynamic analysis', 'Report generation'],
          estimatedDuration: 180,
          priority: 'high',
          requiredSkills: ['Malware Analysis', 'Reverse Engineering'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: true
        },
        {
          id: '2',
          name: 'Incident Response Template',
          description: 'Template for handling security incidents',
          category: 'Incident Response',
          steps: ['Containment', 'Eradication', 'Recovery', 'Lessons learned'],
          estimatedDuration: 240,
          priority: 'critical',
          requiredSkills: ['Incident Response', 'Forensics'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: true
        },
        {
          id: '3',
          name: 'Threat Hunt Template',
          description: 'Proactive threat hunting methodology',
          category: 'Investigation',
          steps: ['Hypothesis creation', 'Data collection', 'Analysis', 'Documentation'],
          estimatedDuration: 120,
          priority: 'medium',
          requiredSkills: ['Threat Hunting', 'Data Analysis'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: true
        }
      ];
      setTemplates(mockTemplates);
      addNotification('success', 'Task templates loaded successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
      addNotification('error', 'Failed to load task templates');
    } finally {
      setLoading(false);
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

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(template => template.category === selectedCategory);

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading task templates...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📋 Task Templates
          </h1>
          <p className="text-gray-600">
            Manage and create reusable task templates for standardized workflows
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Template
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-blue-600">{templates.length}</div>
          <div className="text-sm text-gray-600">Total Templates</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-green-600">
            {templates.filter(t => t.isActive).length}
          </div>
          <div className="text-sm text-gray-600">Active Templates</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-orange-600">
            {categories.length - 1}
          </div>
          <div className="text-sm text-gray-600">Categories</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round(templates.reduce((sum, t) => sum + t.estimatedDuration, 0) / templates.length) || 0}
          </div>
          <div className="text-sm text-gray-600">Avg Duration (min)</div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex space-x-4 mb-6">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {category === 'all' ? 'All Categories' : category}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(template.priority)}`}>
                {template.priority}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mb-4">{template.description}</p>
            
            <div className="space-y-3">
              <div>
                <span className="text-xs font-medium text-gray-500">Category:</span>
                <span className="ml-2 text-sm text-gray-700">{template.category}</span>
              </div>
              
              <div>
                <span className="text-xs font-medium text-gray-500">Duration:</span>
                <span className="ml-2 text-sm text-gray-700">{template.estimatedDuration} minutes</span>
              </div>
              
              <div>
                <span className="text-xs font-medium text-gray-500">Steps:</span>
                <div className="mt-1 space-y-1">
                  {template.steps.slice(0, 3).map((step, index) => (
                    <div key={index} className="text-xs text-gray-600 flex items-center">
                      <span className="inline-block w-4 h-4 bg-blue-100 text-blue-600 rounded-full text-center text-xs mr-2">
                        {index + 1}
                      </span>
                      {step}
                    </div>
                  ))}
                  {template.steps.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{template.steps.length - 3} more steps
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <span className="text-xs font-medium text-gray-500">Required Skills:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {template.requiredSkills.map((skill, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <span className={`inline-block w-2 h-2 rounded-full ${template.isActive ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                <span className="text-xs text-gray-500">
                  {template.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="flex space-x-2">
                <button className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors">
                  Use Template
                </button>
                <button className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors">
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No templates found</div>
          <div className="text-gray-400 text-sm">
            {selectedCategory === 'all' 
              ? 'Create your first task template to get started'
              : `No templates found in the ${selectedCategory} category`
            }
          </div>
        </div>
      )}

      {/* Notifications */}
      {notifications.map((notification) => (
        <div key={notification.id} className="fixed bottom-4 right-4 z-50">
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