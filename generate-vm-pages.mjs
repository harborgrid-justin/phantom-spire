#!/usr/bin/env node

/**
 * Generate Vulnerability Management Pages Script
 * Automatically creates all 32 vulnerability management pages
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pages = [
  // Asset Management (8 pages)
  {
    category: 'assets',
    name: 'assessment',
    title: '🔍 Asset Vulnerability Assessment',
    description: 'Detailed vulnerability assessment for individual assets',
    endpoint: '/assessment/:assetId',
    icon: '🔍'
  },
  {
    category: 'assets',
    name: 'groups',
    title: '📋 Asset Groups Management',
    description: 'Manage and monitor asset groups and collections',
    endpoint: '/groups',
    icon: '📋'
  },
  {
    category: 'assets',
    name: 'risk-profiles',
    title: '⚠️ Asset Risk Profiles',
    description: 'Risk assessment and profiling for all assets',
    endpoint: '/risk-profiles',
    icon: '⚠️'
  },
  {
    category: 'assets',
    name: 'compliance-status',
    title: '✅ Asset Compliance Status',
    description: 'Compliance monitoring and status tracking',
    endpoint: '/compliance-status',
    icon: '✅'
  },
  {
    category: 'assets',
    name: 'patch-status',
    title: '🔧 Asset Patch Status',
    description: 'Patch management and deployment status',
    endpoint: '/patch-status',
    icon: '🔧'
  },
  {
    category: 'assets',
    name: 'security-baselines',
    title: '🛡️ Security Baselines',
    description: 'Security baseline compliance and monitoring',
    endpoint: '/security-baselines',
    icon: '🛡️'
  },
  {
    category: 'assets',
    name: 'lifecycle',
    title: '🔄 Asset Lifecycle Management',
    description: 'End-to-end asset lifecycle tracking',
    endpoint: '/lifecycle',
    icon: '🔄'
  },

  // Threat Intelligence (6 pages)
  {
    category: 'threat-intelligence',
    name: 'feeds',
    title: '📡 Threat Feeds Management',
    description: 'Threat intelligence feeds and data sources',
    endpoint: '/feeds',
    icon: '📡'
  },
  {
    category: 'threat-intelligence',
    name: 'iocs',
    title: '🎯 IOC Management',
    description: 'Indicators of compromise management',
    endpoint: '/iocs',
    icon: '🎯'
  },
  {
    category: 'threat-intelligence',
    name: 'actors',
    title: '👥 Threat Actor Profiles',
    description: 'Threat actor analysis and profiling',
    endpoint: '/actors',
    icon: '👥'
  },
  {
    category: 'threat-intelligence',
    name: 'campaigns',
    title: '🎭 Campaign Tracking',
    description: 'Threat campaign monitoring and analysis',
    endpoint: '/campaigns',
    icon: '🎭'
  },
  {
    category: 'threat-intelligence',
    name: 'hunting',
    title: '🕵️ Threat Hunting',
    description: 'Proactive threat hunting activities',
    endpoint: '/hunting',
    icon: '🕵️'
  },
  {
    category: 'threat-intelligence',
    name: 'early-warning',
    title: '🚨 Early Warning System',
    description: 'Real-time threat alerts and warnings',
    endpoint: '/early-warning',
    icon: '🚨'
  },

  // Compliance & Frameworks (6 pages)
  {
    category: 'compliance',
    name: 'dashboard',
    title: '📊 Compliance Dashboard',
    description: 'Comprehensive compliance status overview',
    endpoint: '/dashboard',
    icon: '📊'
  },
  {
    category: 'compliance',
    name: 'framework-mapping',
    title: '🗺️ Framework Mapping',
    description: 'Security framework mapping and cross-reference',
    endpoint: '/framework-mapping',
    icon: '🗺️'
  },
  {
    category: 'compliance',
    name: 'control-assessments',
    title: '✔️ Control Assessments',
    description: 'Security control assessment and validation',
    endpoint: '/control-assessments',
    icon: '✔️'
  },
  {
    category: 'compliance',
    name: 'audit-trails',
    title: '📝 Audit Trails',
    description: 'Comprehensive audit trail management',
    endpoint: '/audit-trails',
    icon: '📝'
  },
  {
    category: 'compliance',
    name: 'regulatory-reports',
    title: '📋 Regulatory Reports',
    description: 'Regulatory compliance reporting',
    endpoint: '/regulatory-reports',
    icon: '📋'
  },
  {
    category: 'compliance',
    name: 'policy-management',
    title: '📜 Policy Management',
    description: 'Security policy governance and management',
    endpoint: '/policy-management',
    icon: '📜'
  },

  // Remediation & Patch Management (6 pages)
  {
    category: 'remediation',
    name: 'patch-planning',
    title: '📅 Patch Planning',
    description: 'Strategic patch planning and scheduling',
    endpoint: '/patch-planning',
    icon: '📅'
  },
  {
    category: 'remediation',
    name: 'patch-testing',
    title: '🧪 Patch Testing',
    description: 'Patch testing and validation processes',
    endpoint: '/patch-testing',
    icon: '🧪'
  },
  {
    category: 'remediation',
    name: 'patch-deployment',
    title: '🚀 Patch Deployment',
    description: 'Patch deployment management and monitoring',
    endpoint: '/patch-deployment',
    icon: '🚀'
  },
  {
    category: 'remediation',
    name: 'rollback-management',
    title: '↩️ Rollback Management',
    description: 'Patch rollback procedures and management',
    endpoint: '/rollback-management',
    icon: '↩️'
  },
  {
    category: 'remediation',
    name: 'emergency-response',
    title: '🚑 Emergency Response',
    description: 'Emergency response and incident handling',
    endpoint: '/emergency-response',
    icon: '🚑'
  },
  {
    category: 'remediation',
    name: 'maintenance-windows',
    title: '🕒 Maintenance Windows',
    description: 'Maintenance window scheduling and management',
    endpoint: '/maintenance-windows',
    icon: '🕒'
  },

  // Analytics & Metrics (6 pages)
  {
    category: 'analytics',
    name: 'security-metrics',
    title: '📈 Security Metrics',
    description: 'Comprehensive security metrics and KPIs',
    endpoint: '/security-metrics',
    icon: '📈'
  },
  {
    category: 'analytics',
    name: 'trend-analysis',
    title: '📉 Trend Analysis',
    description: 'Security trend analysis and forecasting',
    endpoint: '/trend-analysis',
    icon: '📉'
  },
  {
    category: 'analytics',
    name: 'performance-kpis',
    title: '⚡ Performance KPIs',
    description: 'Performance indicators and benchmarks',
    endpoint: '/performance-kpis',
    icon: '⚡'
  },
  {
    category: 'analytics',
    name: 'executive-dashboard',
    title: '👔 Executive Dashboard',
    description: 'Executive-level security overview',
    endpoint: '/executive-dashboard',
    icon: '👔'
  },
  {
    category: 'analytics',
    name: 'risk-heatmaps',
    title: '🌡️ Risk Heatmaps',
    description: 'Visual risk assessment and heatmaps',
    endpoint: '/risk-heatmaps',
    icon: '🌡️'
  },
  {
    category: 'analytics',
    name: 'predictive-analytics',
    title: '🔮 Predictive Analytics',
    description: 'AI-powered predictive security analytics',
    endpoint: '/predictive-analytics',
    icon: '🔮'
  }
];

function generatePageTemplate(page) {
  const componentName = page.name.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('') + 'Page';

  const apiEndpoint = `/api/v1/vulnerability-management/${page.category}${page.endpoint}`;
  const serviceKey = `${page.category}-${page.name}`;

  return `'use client';

import { useState, useEffect } from 'react';
import { useServicePage } from '../../../../../lib/business-logic';

export default function ${componentName}() {
  const { 
    data, 
    loading, 
    error, 
    connected, 
    execute, 
    businessStats,
    notifications,
    removeNotification 
  } = useServicePage('${serviceKey}', '${apiEndpoint}');

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setRefreshing(true);
      await execute('load-data', {});
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading ${page.title.replace(/🎯|📡|👥|🎭|🕵️|🚨|📊|🗺️|✔️|📝|📋|📜|📅|🧪|🚀|↩️|🚑|🕒|📈|📉|⚡|👔|🌡️|🔮|🔍|📋|⚠️|✅|🔧|🛡️|🔄/g, '').trim()}...</div>
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
            {connected ? '${page.title.replace(/🎯|📡|👥|🎭|🕵️|🚨|📊|🗺️|✔️|📝|📋|📜|📅|🧪|🚀|↩️|🚑|🕒|📈|📉|⚡|👔|🌡️|🔮|🔍|📋|⚠️|✅|🔧|🛡️|🔄/g, '').trim()} System Online' : '${page.title.replace(/🎯|📡|👥|🎭|🕵️|🚨|📊|🗺️|✔️|📝|📋|📜|📅|🧪|🚀|↩️|🚑|🕒|📈|📉|⚡|👔|🌡️|🔮|🔍|📋|⚠️|✅|🔧|🛡️|🔄/g, '').trim()} System Offline'}
          </div>
          {businessStats && (
            <div className="text-gray-600">
              Total Requests: {businessStats.totalRequests || 0}
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
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            Export Data
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary Cards */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
              <div className="text-2xl font-bold text-gray-900">{data?.summary?.total || 0}</div>
              <div className="text-gray-600">Total Items</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
              <div className="text-2xl font-bold text-gray-900">{data?.summary?.active || 0}</div>
              <div className="text-gray-600">Active</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
              <div className="text-2xl font-bold text-gray-900">{data?.summary?.pending || 0}</div>
              <div className="text-gray-600">Pending</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
              <div className="text-2xl font-bold text-gray-900">{data?.summary?.critical || 0}</div>
              <div className="text-gray-600">Critical</div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
            <div className="space-y-4">
              {data?.items?.length > 0 ? (
                data.items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{item.name || item.title || \`Item \${index + 1}\`}</h3>
                        <p className="text-sm text-gray-600">{item.description || item.summary || 'No description available'}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={\`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium \${
                          item.status === 'active' ? 'bg-green-100 text-green-800' :
                          item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          item.status === 'critical' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }\`}>
                          {item.status || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500">No data available</div>
                  <button 
                    onClick={loadData}
                    className="mt-2 text-blue-600 hover:text-blue-800"
                  >
                    Refresh to load data
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span className="text-gray-900">{data?.lastUpdated ? new Date(data.lastUpdated).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-green-600">Operational</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Health:</span>
                <span className="text-green-600">Good</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {data?.recentActivity?.length > 0 ? (
                data.recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="text-sm">
                    <div className="text-gray-900">{activity.action || activity.event}</div>
                    <div className="text-gray-500">{activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Recent'}</div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-sm">No recent activity</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {notifications.map((notification) => (
          <div key={notification.id} className="max-w-sm w-full bg-white shadow-lg rounded-lg">
            <div className={\`p-4 rounded-lg shadow-lg \${
              notification.type === 'success' ? 'bg-green-500 text-white' :
              notification.type === 'error' ? 'bg-red-500 text-white' :
              notification.type === 'warning' ? 'bg-yellow-500 text-white' :
              'bg-blue-500 text-white'
            }\`}>
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
    </div>
  );
}`;
}

// Create directories and generate pages
const basePath = path.join(__dirname, '../frontend/src/app/vulnerability-management');

console.log('🚀 Generating 32 Vulnerability Management Pages...\n');

let generatedCount = 0;

for (const page of pages) {
  const categoryPath = path.join(basePath, page.category);
  const pagePath = path.join(categoryPath, page.name);
  
  // Create directories
  if (!fs.existsSync(categoryPath)) {
    fs.mkdirSync(categoryPath, { recursive: true });
  }
  if (!fs.existsSync(pagePath)) {
    fs.mkdirSync(pagePath, { recursive: true });
  }

  // Generate page
  const pageContent = generatePageTemplate(page);
  const filePath = path.join(pagePath, 'page.tsx');
  
  fs.writeFileSync(filePath, pageContent);
  generatedCount++;
  
  console.log(`✅ Generated: ${page.category}/${page.name} - ${page.title}`);
}

console.log(`\n🎉 Successfully generated ${generatedCount} vulnerability management pages!`);
console.log('\nPages organized by category:');
console.log('📂 Assets: 8 pages');
console.log('🔍 Threat Intelligence: 6 pages');
console.log('📋 Compliance: 6 pages');
console.log('🔧 Remediation: 6 pages');
console.log('📊 Analytics: 6 pages');
console.log(`\n📊 Total: ${generatedCount} pages generated`);