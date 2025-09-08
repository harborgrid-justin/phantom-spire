#!/usr/bin/env node

/**
 * Generate 48 Digital Forensics Pages
 * This script creates all the required forensics pages for the platform
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the 48 forensics pages organized by categories
const forensicsPages = {
  'evidence': [
    { name: 'collection', title: '📦 Evidence Collection', description: 'Digital evidence acquisition and preservation management', icon: '📦' },
    { name: 'preservation', title: '🔒 Evidence Preservation', description: 'Digital evidence integrity and preservation management', icon: '🔒' },
    { name: 'chain-of-custody', title: '⛓️ Chain of Custody', description: 'Evidence chain of custody tracking and management', icon: '⛓️' },
    { name: 'imaging', title: '💾 Forensic Imaging', description: 'Digital forensic imaging and acquisition workflows', icon: '💾' },
    { name: 'validation', title: '✅ Evidence Validation', description: 'Evidence integrity validation and verification', icon: '✅' },
    { name: 'correlation', title: '🔗 Evidence Correlation', description: 'Cross-evidence correlation and timeline analysis', icon: '🔗' },
    { name: 'legal-hold', title: '⚖️ Legal Hold Management', description: 'Legal hold and compliance management', icon: '⚖️' },
    { name: 'export', title: '📤 Evidence Export', description: 'Evidence export and reporting management', icon: '📤' },
    { name: 'search', title: '🔍 Evidence Search', description: 'Advanced evidence search and filtering', icon: '🔍' },
    { name: 'metadata', title: '📊 Evidence Metadata', description: 'Evidence metadata management and analysis', icon: '📊' },
    { name: 'quality-assurance', title: '🎯 Quality Assurance', description: 'Evidence quality assurance and validation', icon: '🎯' },
    { name: 'retention-policies', title: '📋 Retention Policies', description: 'Evidence retention policy management', icon: '📋' },
    { name: 'audit-trails', title: '📝 Audit Trails', description: 'Evidence handling audit trail management', icon: '📝' }
  ],
  'investigation': [
    { name: 'cases', title: '📁 Investigation Cases', description: 'Investigation case management and tracking', icon: '📁' },
    { name: 'examination', title: '🔬 Forensic Examination', description: 'Digital forensic examination workflows', icon: '🔬' },
    { name: 'memory', title: '🧠 Memory Forensics', description: 'Memory forensics analysis and investigation', icon: '🧠' },
    { name: 'network', title: '🌐 Network Forensics', description: 'Network forensics analysis and investigation', icon: '🌐' },
    { name: 'mobile', title: '📱 Mobile Forensics', description: 'Mobile device forensic investigation', icon: '📱' },
    { name: 'cloud', title: '☁️ Cloud Forensics', description: 'Cloud forensics investigation and analysis', icon: '☁️' },
    { name: 'malware', title: '🦠 Malware Analysis', description: 'Malware forensics analysis and investigation', icon: '🦠' },
    { name: 'reconstruction', title: '🔄 Incident Reconstruction', description: 'Digital incident reconstruction and timeline', icon: '🔄' },
    { name: 'reporting', title: '📋 Forensic Reporting', description: 'Forensic investigation reporting and documentation', icon: '📋' },
    { name: 'collaboration', title: '👥 Investigation Collaboration', description: 'Multi-team investigation collaboration tools', icon: '👥' },
    { name: 'tool-integration', title: '🔧 Tool Integration', description: 'Forensic tool integration and automation', icon: '🔧' },
    { name: 'quality-control', title: '🎯 Analysis Quality Control', description: 'Investigation analysis quality control', icon: '🎯' }
  ],
  'specialized': [
    { name: 'email', title: '📧 Email Forensics', description: 'Email forensics investigation and analysis', icon: '📧' },
    { name: 'database', title: '🗄️ Database Forensics', description: 'Database forensics analysis and investigation', icon: '🗄️' },
    { name: 'iot', title: '🌐 IoT Forensics', description: 'Internet of Things device forensic investigation', icon: '🌐' },
    { name: 'cryptocurrency', title: '₿ Cryptocurrency Forensics', description: 'Cryptocurrency and blockchain forensic analysis', icon: '₿' },
    { name: 'social-media', title: '📱 Social Media Forensics', description: 'Social media platform forensic investigation', icon: '📱' },
    { name: 'web-application', title: '🌍 Web Application Forensics', description: 'Web application forensic analysis', icon: '🌍' },
    { name: 'virtualization', title: '📦 Virtualization Forensics', description: 'Virtual environment forensic investigation', icon: '📦' },
    { name: 'container', title: '🐳 Container Forensics', description: 'Container and orchestration forensic analysis', icon: '🐳' },
    { name: 'blockchain', title: '⛓️ Blockchain Forensics', description: 'Blockchain and distributed ledger forensics', icon: '⛓️' },
    { name: 'ai-ml', title: '🤖 AI/ML Forensics', description: 'Artificial Intelligence and Machine Learning forensics', icon: '🤖' },
    { name: 'scada-ics', title: '🏭 SCADA/ICS Forensics', description: 'Industrial control system forensic analysis', icon: '🏭' },
    { name: 'automotive', title: '🚗 Automotive Forensics', description: 'Vehicle and automotive system forensic investigation', icon: '🚗' }
  ],
  'compliance': [
    { name: 'legal-requirements', title: '⚖️ Legal Requirements', description: 'Legal requirements tracking and compliance', icon: '⚖️' },
    { name: 'regulatory', title: '📋 Regulatory Compliance', description: 'Regulatory compliance management and reporting', icon: '📋' },
    { name: 'court-admissibility', title: '🏛️ Court Admissibility', description: 'Evidence court admissibility validation', icon: '🏛️' },
    { name: 'expert-witness', title: '👨‍⚖️ Expert Witness Preparation', description: 'Expert witness preparation and support', icon: '👨‍⚖️' },
    { name: 'discovery', title: '🔍 Discovery Management', description: 'Legal discovery process management', icon: '🔍' },
    { name: 'privacy-impact', title: '🔒 Privacy Impact Assessment', description: 'Privacy impact assessment and compliance', icon: '🔒' },
    { name: 'data-protection', title: '🛡️ Data Protection Compliance', description: 'Data protection regulation compliance', icon: '🛡️' },
    { name: 'international-law', title: '🌍 International Law Compliance', description: 'International law and jurisdiction compliance', icon: '🌍' },
    { name: 'industry-standards', title: '📊 Industry Standards', description: 'Industry standard compliance and certification', icon: '📊' },
    { name: 'certification-tracking', title: '🏆 Certification Tracking', description: 'Forensics certification and accreditation tracking', icon: '🏆' },
    { name: 'documentation', title: '📚 Legal Documentation', description: 'Legal documentation management and archival', icon: '📚' },
    { name: 'audit-management', title: '🔍 Compliance Audit Management', description: 'Compliance audit management and tracking', icon: '🔍' }
  ]
};

// Template for generating page components
const generatePageTemplate = (category, pageInfo) => {
  const serviceName = `${category}-${pageInfo.name}`;
  const className = pageInfo.name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('') + 'Page';
  
  return `'use client';

import { useEffect, useState } from 'react';
import { useServicePage } from '../../../../lib/business-logic';

export default function ${className}() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    notifications,
    addNotification,
    removeNotification,
    execute,
    refresh,
    stats,
    connected
  } = useServicePage('${serviceName}');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await execute('get${className.replace('Page', '')}Data');
      
      if (response.success && response.data) {
        setData(Array.isArray(response.data) ? response.data : [response.data]);
        addNotification('success', '${pageInfo.title} data loaded successfully');
      } else {
        // Generate appropriate mock data for this page type
        const mockData = generateMockData('${pageInfo.name}');
        setData(mockData);
        addNotification('info', 'Using demonstration data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      addNotification('error', 'Failed to load ${pageInfo.title.toLowerCase()} data');
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (pageType: string) => {
    // Generate contextual mock data based on page type
    switch (pageType) {
      case 'collection':
        return [
          {
            id: 'col_001',
            deviceType: 'Laptop - Dell XPS 13',
            status: 'completed',
            examiner: 'John Doe',
            timestamp: new Date(),
            location: 'Office 3B'
          }
        ];
      case 'cases':
        return [
          {
            id: 'case_001',
            title: 'Data Breach Investigation',
            priority: 'high',
            status: 'active',
            assignedTo: 'Forensics Team Alpha',
            evidenceCount: 23
          }
        ];
      default:
        return [
          {
            id: '${pageInfo.name}_001',
            name: 'Sample ${pageInfo.title} Item',
            status: 'active',
            timestamp: new Date(),
            details: 'Sample data for ${pageInfo.description}'
          }
        ];
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading ${pageInfo.title.toLowerCase()} data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ${pageInfo.title}
          </h1>
          <p className="text-gray-600">
            ${pageInfo.description}
          </p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={refresh}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Refresh
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Add New
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Connection Status */}
      <div className="mb-4">
        <div className="flex items-center space-x-4 text-sm">
          <div className={\`flex items-center \${connected ? 'text-green-600' : 'text-gray-500'}\`}>
            <div className={\`w-2 h-2 rounded-full mr-2 \${connected ? 'bg-green-500' : 'bg-gray-400'}\`}></div>
            {connected ? 'Business Logic Connected' : 'Business Logic Offline'}
          </div>
          {stats && (
            <div className="text-gray-600">
              Service Stats: {stats.totalRequests || 0} requests
            </div>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-blue-600">{data.length}</div>
          <div className="text-sm text-gray-600">Total Items</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-green-600">
            {data.filter(item => item.status === 'active' || item.status === 'completed').length}
          </div>
          <div className="text-sm text-gray-600">Active/Completed</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-yellow-600">
            {data.filter(item => item.status === 'pending' || item.status === 'in_progress').length}
          </div>
          <div className="text-sm text-gray-600">Pending/In Progress</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-purple-600">
            {Math.floor(Math.random() * 100 + 85)}%
          </div>
          <div className="text-sm text-gray-600">Success Rate</div>
        </div>
      </div>

      {/* Data Grid */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">${pageInfo.title} Items</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {data.map((item) => (
            <div key={item.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-medium text-gray-900">
                      {item.name || item.title || item.deviceType || \`\${pageInfo.title} Item\`}
                    </h3>
                    <span className={\`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium \${getStatusColor(item.status)}\`}>
                      {item.status}
                    </span>
                    {item.priority && (
                      <span className={\`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium \${
                        item.priority === 'high' || item.priority === 'critical' ? 'bg-red-100 text-red-800' :
                        item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }\`}>
                        {item.priority}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {item.details || item.description || 'No additional details available'}
                  </div>
                  {item.timestamp && (
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(item.timestamp).toLocaleString()}
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors">
                    View
                  </button>
                  <button className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {data.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No ${pageInfo.title.toLowerCase()} items found</div>
          <div className="text-gray-400 text-sm">Get started by adding your first item</div>
        </div>
      )}

      {/* Notifications */}
      {notifications.map((notification) => (
        <div key={notification.id} className="fixed bottom-4 right-4 z-40">
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
  );
}`;
};

// Create directories and generate pages
const frontendBasePath = path.join(__dirname, '../../frontend/src/app/forensics');

// Ensure base forensics directory exists
if (!fs.existsSync(frontendBasePath)) {
  fs.mkdirSync(frontendBasePath, { recursive: true });
}

console.log('🚀 Starting generation of 48 Digital Forensics pages...\n');

let totalPages = 0;
for (const [category, pages] of Object.entries(forensicsPages)) {
  console.log(`📁 Creating ${category} category pages...`);
  
  const categoryPath = path.join(frontendBasePath, category);
  if (!fs.existsSync(categoryPath)) {
    fs.mkdirSync(categoryPath, { recursive: true });
  }
  
  for (const pageInfo of pages) {
    const pagePath = path.join(categoryPath, pageInfo.name);
    if (!fs.existsSync(pagePath)) {
      fs.mkdirSync(pagePath, { recursive: true });
    }
    
    const pageContent = generatePageTemplate(category, pageInfo);
    const pageFilePath = path.join(pagePath, 'page.tsx');
    
    fs.writeFileSync(pageFilePath, pageContent);
    console.log(`  ✅ ${pageInfo.icon} ${pageInfo.title} -> /forensics/${category}/${pageInfo.name}`);
    totalPages++;
  }
  console.log();
}

console.log(`🎉 Successfully generated ${totalPages} forensics pages!`);
console.log('\n📊 Summary by category:');
for (const [category, pages] of Object.entries(forensicsPages)) {
  console.log(`  ${category}: ${pages.length} pages`);
}

export {};