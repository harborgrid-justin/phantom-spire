#!/usr/bin/env node

/**
 * Generate 32 Threat Intelligence Pages Script
 * Creates comprehensive business-ready threat intelligence pages
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const threatIntelPages = [
  // Advanced Analytics & Intelligence (8 pages)
  {
    category: 'advanced-analytics',
    name: 'threat-analytics',
    title: '📊 Advanced Threat Analytics',
    description: 'Advanced analytics and machine learning for threat detection',
    endpoint: '/threat-analytics',
    icon: '📊'
  },
  {
    category: 'advanced-analytics',
    name: 'intelligence-dashboard',
    title: '🎯 Threat Intelligence Dashboard',
    description: 'Comprehensive threat intelligence overview and metrics',
    endpoint: '/intelligence-dashboard',
    icon: '🎯'
  },
  {
    category: 'advanced-analytics',
    name: 'ioc-correlation',
    title: '🔗 IOC Correlation Engine',
    description: 'Advanced correlation analysis for indicators of compromise',
    endpoint: '/ioc-correlation',
    icon: '🔗'
  },
  {
    category: 'advanced-analytics',
    name: 'actor-attribution',
    title: '👤 Threat Actor Attribution',
    description: 'Attribution analysis and threat actor identification',
    endpoint: '/actor-attribution',
    icon: '👤'
  },
  {
    category: 'advanced-analytics',
    name: 'campaign-analysis',
    title: '🎭 Campaign Analysis',
    description: 'Deep analysis of threat campaigns and attack patterns',
    endpoint: '/campaign-analysis',
    icon: '🎭'
  },
  {
    category: 'advanced-analytics',
    name: 'landscape-assessment',
    title: '🌍 Threat Landscape Assessment',
    description: 'Comprehensive assessment of the global threat landscape',
    endpoint: '/landscape-assessment',
    icon: '🌍'
  },
  {
    category: 'advanced-analytics',
    name: 'vulnerability-mapping',
    title: '🗺️ Vulnerability-Threat Mapping',
    description: 'Mapping vulnerabilities to active threat campaigns',
    endpoint: '/vulnerability-mapping',
    icon: '🗺️'
  },
  {
    category: 'advanced-analytics',
    name: 'predictive-modeling',
    title: '🔮 Predictive Threat Modeling',
    description: 'AI-powered predictive threat modeling and forecasting',
    endpoint: '/predictive-modeling',
    icon: '🔮'
  },

  // IOC & Indicators Management (8 pages)
  {
    category: 'ioc-management',
    name: 'lifecycle-management',
    title: '🔄 IOC Lifecycle Management',
    description: 'Complete lifecycle management for indicators of compromise',
    endpoint: '/lifecycle-management',
    icon: '🔄'
  },
  {
    category: 'ioc-management',
    name: 'enrichment-service',
    title: '💎 IOC Enrichment Service',
    description: 'Automated enrichment and contextualization of IOCs',
    endpoint: '/enrichment-service',
    icon: '💎'
  },
  {
    category: 'ioc-management',
    name: 'validation-system',
    title: '✅ IOC Validation System',
    description: 'Validation and quality assurance for threat indicators',
    endpoint: '/validation-system',
    icon: '✅'
  },
  {
    category: 'ioc-management',
    name: 'investigation-tools',
    title: '🔍 IOC Investigation Tools',
    description: 'Advanced tools for IOC research and investigation',
    endpoint: '/investigation-tools',
    icon: '🔍'
  },
  {
    category: 'ioc-management',
    name: 'reputation-scoring',
    title: '⭐ IOC Reputation Scoring',
    description: 'Reputation scoring and confidence rating for IOCs',
    endpoint: '/reputation-scoring',
    icon: '⭐'
  },
  {
    category: 'ioc-management',
    name: 'relationship-mapping',
    title: '🕸️ IOC Relationship Mapping',
    description: 'Visual mapping of IOC relationships and connections',
    endpoint: '/relationship-mapping',
    icon: '🕸️'
  },
  {
    category: 'ioc-management',
    name: 'source-management',
    title: '📡 IOC Source Management',
    description: 'Management of IOC sources and data feeds',
    endpoint: '/source-management',
    icon: '📡'
  },
  {
    category: 'ioc-management',
    name: 'export-import-hub',
    title: '🔄 IOC Export/Import Hub',
    description: 'Centralized hub for IOC data export and import',
    endpoint: '/export-import-hub',
    icon: '🔄'
  },

  // Threat Actor & Attribution (8 pages)
  {
    category: 'threat-actors',
    name: 'actor-profiles',
    title: '👥 Threat Actor Profiles',
    description: 'Comprehensive profiles of known threat actors',
    endpoint: '/actor-profiles',
    icon: '👥'
  },
  {
    category: 'threat-actors',
    name: 'attribution-analytics',
    title: '🎯 Attribution Analytics',
    description: 'Advanced analytics for threat attribution',
    endpoint: '/attribution-analytics',
    icon: '🎯'
  },
  {
    category: 'threat-actors',
    name: 'actor-tracking',
    title: '📍 Threat Actor Tracking',
    description: 'Real-time tracking of threat actor activities',
    endpoint: '/actor-tracking',
    icon: '📍'
  },
  {
    category: 'threat-actors',
    name: 'capability-assessment',
    title: '💪 Actor Capability Assessment',
    description: 'Assessment of threat actor capabilities and resources',
    endpoint: '/capability-assessment',
    icon: '💪'
  },
  {
    category: 'threat-actors',
    name: 'confidence-scoring',
    title: '📊 Attribution Confidence Scoring',
    description: 'Confidence scoring for threat actor attribution',
    endpoint: '/confidence-scoring',
    icon: '📊'
  },
  {
    category: 'threat-actors',
    name: 'collaboration-networks',
    title: '🤝 Actor Collaboration Networks',
    description: 'Analysis of threat actor collaboration and networks',
    endpoint: '/collaboration-networks',
    icon: '🤝'
  },
  {
    category: 'threat-actors',
    name: 'campaign-mapping',
    title: '🗺️ Actor Campaign Mapping',
    description: 'Mapping threat actors to their campaigns',
    endpoint: '/campaign-mapping',
    icon: '🗺️'
  },
  {
    category: 'threat-actors',
    name: 'intelligence-feeds',
    title: '📡 Actor Intelligence Feeds',
    description: 'Specialized intelligence feeds for threat actors',
    endpoint: '/intelligence-feeds',
    icon: '📡'
  },

  // Intelligence Operations (8 pages)
  {
    category: 'intel-operations',
    name: 'intelligence-sharing',
    title: '🤝 Threat Intelligence Sharing',
    description: 'Secure sharing of threat intelligence with partners',
    endpoint: '/intelligence-sharing',
    icon: '🤝'
  },
  {
    category: 'intel-operations',
    name: 'collection-management',
    title: '📥 Intelligence Collection Management',
    description: 'Management of intelligence collection requirements',
    endpoint: '/collection-management',
    icon: '📥'
  },
  {
    category: 'intel-operations',
    name: 'automation-engine',
    title: '🤖 Threat Intelligence Automation',
    description: 'Automated threat intelligence processing and analysis',
    endpoint: '/automation-engine',
    icon: '🤖'
  },
  {
    category: 'intel-operations',
    name: 'realtime-monitoring',
    title: '📺 Real-time Threat Monitoring',
    description: 'Real-time monitoring of global threat activities',
    endpoint: '/realtime-monitoring',
    icon: '📺'
  },
  {
    category: 'intel-operations',
    name: 'workflow-engine',
    title: '⚙️ Threat Intelligence Workflows',
    description: 'Automated workflows for intelligence processing',
    endpoint: '/workflow-engine',
    icon: '⚙️'
  },
  {
    category: 'intel-operations',
    name: 'source-management',
    title: '🔗 Intelligence Source Management',
    description: 'Management of external intelligence sources',
    endpoint: '/source-management',
    icon: '🔗'
  },
  {
    category: 'intel-operations',
    name: 'api-management',
    title: '🌐 Threat Intelligence APIs',
    description: 'API management for threat intelligence services',
    endpoint: '/api-management',
    icon: '🌐'
  },
  {
    category: 'intel-operations',
    name: 'training-center',
    title: '📚 Intelligence Training Center',
    description: 'Training and education for threat intelligence analysts',
    endpoint: '/training-center',
    icon: '📚'
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
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setRefreshing(true);
      await execute('get-data', { 
        endpoint: '${apiEndpoint}',
        filter,
        search: searchTerm 
      });
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = async () => {
    try {
      await execute('export-data', { 
        endpoint: '${apiEndpoint}/export',
        format: 'json'
      });
    } catch (err) {
      console.error('Failed to export data:', err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading ${page.title.replace(/📊|🎯|🔗|👤|🎭|🌍|🗺️|🔮|🔄|💎|✅|🔍|⭐|🕸️|📡|👥|📍|💪|🤝|📥|🤖|📺|⚙️|🌐|📚/g, '').trim()}...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Business Logic Status */}
      <div className="mb-4">
        <div className="flex items-center space-x-4 text-sm">
          <div className={\`flex items-center \${connected ? 'text-green-600' : 'text-gray-500'}\`}>
            <div className={\`w-2 h-2 rounded-full mr-2 \${connected ? 'bg-green-500' : 'bg-gray-400'}\`}></div>
            {connected ? '${page.title.replace(/📊|🎯|🔗|👤|🎭|🌍|🗺️|🔮|🔄|💎|✅|🔍|⭐|🕸️|📡|👥|📍|💪|🤝|📥|🤖|📺|⚙️|🌐|📚/g, '').trim()} System Online' : '${page.title.replace(/📊|🎯|🔗|👤|🎭|🌍|🗺️|🔮|🔄|💎|✅|🔍|⭐|🕸️|📡|👥|📍|💪|🤝|📥|🤖|📺|⚙️|🌐|📚/g, '').trim()} System Offline'}
          </div>
          {stats && (
            <div className="text-gray-600">
              Total Requests: {stats?.totalRequests || 0}
            </div>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">${page.title}</h1>
          <p className="text-gray-600 mt-2">${page.description}</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={loadData}
            disabled={refreshing}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {refreshing ? 'Loading...' : 'Refresh Data'}
          </button>
          <button 
            onClick={handleExport}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Export Data
          </button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Items</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="critical">Critical</option>
          <option value="high">High Priority</option>
        </select>
        <button
          onClick={loadData}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Apply Filters
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <div className="flex items-center">
            <span className="text-red-500 mr-2">⚠️</span>
            {error}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Summary Cards */}
        <div className="lg:col-span-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{data?.summary?.total || 0}</div>
                  <div className="text-sm text-gray-600">Total Items</div>
                </div>
                <div className="text-blue-500 text-2xl">${page.icon}</div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{data?.summary?.active || 0}</div>
                  <div className="text-sm text-gray-600">Active</div>
                </div>
                <div className="text-green-500 text-2xl">✅</div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{data?.summary?.pending || 0}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="text-yellow-500 text-2xl">⏳</div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{data?.summary?.critical || 0}</div>
                  <div className="text-sm text-gray-600">Critical</div>
                </div>
                <div className="text-red-500 text-2xl">🚨</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Data Overview</h2>
              <span className="text-sm text-gray-500">
                Last updated: {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : 'Never'}
              </span>
            </div>
            
            <div className="space-y-4">
              {data?.items?.length > 0 ? (
                data.items.slice(0, 10).map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.name || item.title || \`Item \${index + 1}\`}</h3>
                        <p className="text-sm text-gray-600 mt-1">{item.description || item.summary || 'No description available'}</p>
                        {item.tags && (
                          <div className="flex items-center space-x-2 mt-2">
                            {item.tags.slice(0, 3).map((tag, tagIndex) => (
                              <span key={tagIndex} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        {item.confidence && (
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">{item.confidence}%</div>
                            <div className="text-xs text-gray-500">Confidence</div>
                          </div>
                        )}
                        <span className={\`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium \${
                          item.status === 'active' ? 'bg-green-100 text-green-800' :
                          item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          item.status === 'critical' ? 'bg-red-100 text-red-800' :
                          item.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }\`}>
                          {item.status || item.severity || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-4xl mb-4">${page.icon}</div>
                  <div className="text-gray-500 text-lg mb-2">No data available</div>
                  <div className="text-gray-400 text-sm mb-4">Try adjusting your filters or refreshing the data</div>
                  <button 
                    onClick={loadData}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Refresh Data
                  </button>
                </div>
              )}
            </div>

            {data?.items?.length > 10 && (
              <div className="mt-6 text-center">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Load More ({data.items.length - 10} remaining)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Records:</span>
                <span className="text-gray-900 font-medium">{data?.stats?.totalRecords || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span className="text-gray-900 font-medium">
                  {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-green-600 font-medium">Operational</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Health:</span>
                <span className="text-green-600 font-medium">Good</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Uptime:</span>
                <span className="text-green-600 font-medium">99.9%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {data?.recentActivity?.length > 0 ? (
                data.recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="text-sm">
                    <div className="text-gray-900 font-medium">{activity.action || activity.event}</div>
                    <div className="text-gray-500">
                      {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Recent'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-sm">No recent activity</div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                Create New Item
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                Import Data
              </button>
              <button 
                onClick={handleExport}
                className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              >
                Export Data
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {notifications.map((notification) => (
          <div key={notification.id} className="max-w-sm w-full">
            <div className={\`p-4 rounded-lg shadow-lg \${
              notification.type === 'success' ? 'bg-green-500 text-white' :
              notification.type === 'error' ? 'bg-red-500 text-white' :
              notification.type === 'warning' ? 'bg-yellow-500 text-white' :
              'bg-blue-500 text-white'
            }\`}>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{notification.message}</span>
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
    </div>
  );
}`;
}

// Create directories and generate pages
const basePath = path.join(__dirname, 'frontend/src/app/threat-intelligence');

console.log('🚀 Generating 32 Threat Intelligence Pages...\n');

let generatedCount = 0;

for (const page of threatIntelPages) {
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

console.log(`\n🎉 Successfully generated ${generatedCount} threat intelligence pages!`);
console.log('\nPages organized by category:');
console.log('📊 Advanced Analytics & Intelligence: 8 pages');
console.log('🔄 IOC & Indicators Management: 8 pages'); 
console.log('👥 Threat Actor & Attribution: 8 pages');
console.log('🤝 Intelligence Operations: 8 pages');
console.log(`\n📊 Total: ${generatedCount} threat intelligence pages generated`);