#!/usr/bin/env node

/**
 * Extend Threat Intelligence Pages Script
 * Adds 16 additional pages to reach 48 total cyber threat program pages
 * Creates comprehensive business-ready cyber threat hunting and detection pages
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const additionalThreatIntelPages = [
  // Cyber Threat Hunting & Response (8 pages)
  {
    category: 'threat-hunting',
    name: 'proactive-hunting',
    title: '🎯 Proactive Threat Hunting',
    description: 'Advanced proactive threat hunting operations and methodologies',
    endpoint: '/proactive-hunting',
    icon: '🎯'
  },
  {
    category: 'threat-hunting',
    name: 'behavioral-analytics',
    title: '🧠 Behavioral Analytics Engine',
    description: 'AI-driven behavioral analysis for anomaly detection',
    endpoint: '/behavioral-analytics',
    icon: '🧠'
  },
  {
    category: 'threat-hunting',
    name: 'hunting-playbooks',
    title: '📋 Threat Hunting Playbooks',
    description: 'Structured hunting methodologies and playbook management',
    endpoint: '/hunting-playbooks',
    icon: '📋'
  },
  {
    category: 'threat-hunting',
    name: 'incident-response',
    title: '🚨 Rapid Incident Response',
    description: 'Real-time incident response and containment strategies',
    endpoint: '/incident-response',
    icon: '🚨'
  },
  {
    category: 'threat-hunting',
    name: 'forensic-analysis',
    title: '🔬 Digital Forensics Analysis',
    description: 'Advanced digital forensics and evidence analysis',
    endpoint: '/forensic-analysis',
    icon: '🔬'
  },
  {
    category: 'threat-hunting',
    name: 'threat-simulation',
    title: '⚔️ Threat Simulation Engine',
    description: 'Red team simulation and attack scenario modeling',
    endpoint: '/threat-simulation',
    icon: '⚔️'
  },
  {
    category: 'threat-hunting',
    name: 'compromise-assessment',
    title: '🔍 Compromise Assessment',
    description: 'Comprehensive compromise assessment and validation',
    endpoint: '/compromise-assessment',
    icon: '🔍'
  },
  {
    category: 'threat-hunting',
    name: 'response-automation',
    title: '🤖 Response Automation Hub',
    description: 'Automated response orchestration and playbook execution',
    endpoint: '/response-automation',
    icon: '🤖'
  },

  // Advanced Threat Detection & Prevention (8 pages)
  {
    category: 'threat-detection',
    name: 'ml-detection',
    title: '🧬 ML-Powered Detection',
    description: 'Machine learning threat detection and classification',
    endpoint: '/ml-detection',
    icon: '🧬'
  },
  {
    category: 'threat-detection',
    name: 'zero-day-protection',
    title: '🛡️ Zero-Day Protection',
    description: 'Advanced zero-day threat detection and mitigation',
    endpoint: '/zero-day-protection',
    icon: '🛡️'
  },
  {
    category: 'threat-detection',
    name: 'sandbox-analysis',
    title: '📦 Sandbox Analysis Center',
    description: 'Automated malware analysis and dynamic sandboxing',
    endpoint: '/sandbox-analysis',
    icon: '📦'
  },
  {
    category: 'threat-detection',
    name: 'network-monitoring',
    title: '🌐 Network Threat Monitoring',
    description: 'Real-time network traffic analysis and threat detection',
    endpoint: '/network-monitoring',
    icon: '🌐'
  },
  {
    category: 'threat-detection',
    name: 'endpoint-protection',
    title: '💻 Endpoint Protection Center',
    description: 'Advanced endpoint detection and response capabilities',
    endpoint: '/endpoint-protection',
    icon: '💻'
  },
  {
    category: 'threat-detection',
    name: 'threat-prevention',
    title: '🚫 Threat Prevention Engine',
    description: 'Proactive threat prevention and blocking mechanisms',
    endpoint: '/threat-prevention',
    icon: '🚫'
  },
  {
    category: 'threat-detection',
    name: 'signature-engine',
    title: '🔖 Signature Detection Engine',
    description: 'Advanced signature-based detection and pattern matching',
    endpoint: '/signature-engine',
    icon: '🔖'
  },
  {
    category: 'threat-detection',
    name: 'threat-scoring',
    title: '📊 Threat Scoring Matrix',
    description: 'Intelligent threat scoring and risk assessment framework',
    endpoint: '/threat-scoring',
    icon: '📊'
  }
];

function generateThreatIntelPageTemplate(page) {
  const componentName = page.name.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('') + 'Page';

  const apiEndpoint = `/api/v1/threat-intelligence/${page.category}${page.endpoint}`;
  const serviceKey = `threat-intel-${page.category}-${page.name}`;

  return `'use client';

import { useState, useEffect } from 'react';
import { useServicePage } from '../../../../lib/business-logic';

export default function ${componentName}() {
  const { 
    data, 
    loading, 
    error, 
    connected, 
    execute, 
    stats,
    notifications,
    removeNotification 
  } = useServicePage('${serviceKey}');

  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    execute('initialize');
  }, [execute]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await execute('refresh-data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleAction = async (action, params = {}) => {
    await execute(action, params);
  };

  const filteredData = data?.items?.filter(item => {
    const matchesFilter = filter === 'all' || item.status === filter;
    const matchesSearch = !searchTerm || 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  }) || [];

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            ${page.icon} Error Loading ${page.title}
          </h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-3">${page.icon}</span>
                ${page.title}
              </h1>
              <p className="text-gray-600 mt-1">${page.description}</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className={\`flex items-center px-3 py-1 rounded-full text-sm \${connected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}\`}>
                <div className={\`w-2 h-2 rounded-full mr-2 \${connected ? 'bg-green-500' : 'bg-gray-400'}\`}></div>
                {connected ? 'Connected' : 'Disconnected'}
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className={\`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 \${refreshing ? 'cursor-not-allowed' : ''}\`}
              >
                {refreshing ? 'Refreshing...' : '🔄 Refresh'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="monitoring">Monitoring</option>
                <option value="resolved">Resolved</option>
                <option value="escalated">Escalated</option>
              </select>
            </div>
          </div>
          
          {stats && (
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div>Total: <span className="font-semibold">{stats.total || 0}</span></div>
              <div>Active: <span className="font-semibold text-blue-600">{stats.active || 0}</span></div>
              <div>Critical: <span className="font-semibold text-red-600">{stats.critical || 0}</span></div>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      {notifications && notifications.length > 0 && (
        <div className="px-6 py-2">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className={\`mb-2 p-3 rounded-lg border \${
                notification.type === 'error' 
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : notification.type === 'warning'
                  ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                  : 'bg-blue-50 border-blue-200 text-blue-700'
              }\`}
            >
              <div className="flex justify-between items-center">
                <span>{notification.message}</span>
                <button
                  onClick={() => removeNotification(index)}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  ${page.title} Operations
                </h2>
              </div>
              <div className="p-6">
                {filteredData.length > 0 ? (
                  <div className="space-y-4">
                    {filteredData.map((item, index) => (
                      <div
                        key={index}
                        className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{item.name || \`Item \${index + 1}\`}</h3>
                            <p className="text-sm text-gray-600 mt-1">{item.description || 'No description available'}</p>
                            <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                              <span>Status: {item.status || 'Unknown'}</span>
                              <span>Priority: {item.priority || 'Medium'}</span>
                              <span>Updated: {item.lastUpdated || 'Never'}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleAction('view-details', { id: item.id })}
                              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleAction('edit', { id: item.id })}
                              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">${page.icon}</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No ${page.title} Data
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Get started by initializing the ${page.title.toLowerCase()} service.
                    </p>
                    <button
                      onClick={() => handleAction('initialize-data')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Initialize Service
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6 space-y-3">
                <button
                  onClick={() => handleAction('scan-threats')}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-left"
                >
                  🔍 Scan for Threats
                </button>
                <button
                  onClick={() => handleAction('generate-report')}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-left"
                >
                  📊 Generate Report
                </button>
                <button
                  onClick={() => handleAction('export-data')}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-left"
                >
                  📤 Export Data
                </button>
                <button
                  onClick={() => handleAction('configure-alerts')}
                  className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-left"
                >
                  🔔 Configure Alerts
                </button>
              </div>
            </div>

            {/* Statistics */}
            {stats && (
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Statistics</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Items:</span>
                      <span className="font-semibold">{stats.total || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active:</span>
                      <span className="font-semibold text-blue-600">{stats.active || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Critical:</span>
                      <span className="font-semibold text-red-600">{stats.critical || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Success Rate:</span>
                      <span className="font-semibold text-green-600">{stats.successRate || '0%'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}`;
}

// Create directories and generate pages
const basePath = path.join(__dirname, 'frontend/src/app/threat-intelligence');

console.log('🚀 Extending Threat Intelligence with 16 Additional Pages...\\n');

let generatedCount = 0;

for (const page of additionalThreatIntelPages) {
  const categoryPath = path.join(basePath, page.category);
  const pagePath = path.join(categoryPath, page.name);
  
  console.log(`Creating: ${page.category}/${page.name}`);
  
  // Create directories
  if (!fs.existsSync(categoryPath)) {
    fs.mkdirSync(categoryPath, { recursive: true });
    console.log(`  Created category directory: ${categoryPath}`);
  }
  if (!fs.existsSync(pagePath)) {
    fs.mkdirSync(pagePath, { recursive: true });
    console.log(`  Created page directory: ${pagePath}`);
  }

  // Generate page
  const pageContent = generateThreatIntelPageTemplate(page);
  const filePath = path.join(pagePath, 'page.tsx');
  
  fs.writeFileSync(filePath, pageContent);
  generatedCount++;
  
  console.log(`✅ Generated: ${page.category}/${page.name} - ${page.title}`);
}

console.log(`\\n🎉 Successfully generated ${generatedCount} additional threat intelligence pages!`);
console.log('\\nNew pages organized by category:');
console.log('🎯 Cyber Threat Hunting & Response: 8 pages');
console.log('🧬 Advanced Threat Detection & Prevention: 8 pages');
console.log(`\\n📊 Total additional pages: ${generatedCount}`);
console.log('📊 Grand total threat intelligence pages: 48 (32 existing + 16 new)');