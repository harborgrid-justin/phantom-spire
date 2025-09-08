'use client';

import { useEffect, useState } from 'react';
import { useServicePage } from '../../../lib/business-logic';
import Link from 'next/link';

interface ForensicsModule {
  category: string;
  icon: string;
  title: string;
  description: string;
  pages: Array<{
    name: string;
    title: string;
    icon: string;
    description: string;
  }>;
}

export default function ForensicsDashboardPage() {
  const [dashboardData, setDashboardData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const {
    notifications,
    addNotification,
    removeNotification,
    execute
  } = useServicePage('forensics-dashboard');

  const forensicsModules: ForensicsModule[] = [
    {
      category: 'evidence',
      icon: '📦',
      title: 'Evidence Management',
      description: 'Digital evidence collection, preservation, and chain of custody',
      pages: [
        { name: 'collection', title: 'Evidence Collection', icon: '📦', description: 'Digital evidence acquisition and preservation' },
        { name: 'preservation', title: 'Evidence Preservation', icon: '🔒', description: 'Evidence integrity and preservation management' },
        { name: 'chain-of-custody', title: 'Chain of Custody', icon: '⛓️', description: 'Evidence custody tracking and management' },
        { name: 'imaging', title: 'Forensic Imaging', icon: '💾', description: 'Digital forensic imaging workflows' },
        { name: 'validation', title: 'Evidence Validation', icon: '✅', description: 'Evidence integrity validation' },
        { name: 'correlation', title: 'Evidence Correlation', icon: '🔗', description: 'Cross-evidence correlation analysis' },
        { name: 'legal-hold', title: 'Legal Hold Management', icon: '⚖️', description: 'Legal hold and compliance management' },
        { name: 'export', title: 'Evidence Export', icon: '📤', description: 'Evidence export and reporting' },
        { name: 'search', title: 'Evidence Search', icon: '🔍', description: 'Advanced evidence search and filtering' },
        { name: 'metadata', title: 'Evidence Metadata', icon: '📊', description: 'Evidence metadata management' },
        { name: 'quality-assurance', title: 'Quality Assurance', icon: '🎯', description: 'Evidence quality assurance' },
        { name: 'retention-policies', title: 'Retention Policies', icon: '📋', description: 'Evidence retention policy management' },
        { name: 'audit-trails', title: 'Audit Trails', icon: '📝', description: 'Evidence handling audit trails' }
      ]
    },
    {
      category: 'investigation',
      icon: '🔬',
      title: 'Investigation & Analysis',
      description: 'Digital forensic investigation and analysis workflows',
      pages: [
        { name: 'cases', title: 'Investigation Cases', icon: '📁', description: 'Investigation case management' },
        { name: 'examination', title: 'Forensic Examination', icon: '🔬', description: 'Digital forensic examination workflows' },
        { name: 'memory', title: 'Memory Forensics', icon: '🧠', description: 'Memory forensics analysis' },
        { name: 'network', title: 'Network Forensics', icon: '🌐', description: 'Network forensics analysis' },
        { name: 'mobile', title: 'Mobile Forensics', icon: '📱', description: 'Mobile device forensic investigation' },
        { name: 'cloud', title: 'Cloud Forensics', icon: '☁️', description: 'Cloud forensics investigation' },
        { name: 'malware', title: 'Malware Analysis', icon: '🦠', description: 'Malware forensics analysis' },
        { name: 'reconstruction', title: 'Incident Reconstruction', icon: '🔄', description: 'Digital incident reconstruction' },
        { name: 'reporting', title: 'Forensic Reporting', icon: '📋', description: 'Forensic investigation reporting' },
        { name: 'collaboration', title: 'Investigation Collaboration', icon: '👥', description: 'Multi-team collaboration tools' },
        { name: 'tool-integration', title: 'Tool Integration', icon: '🔧', description: 'Forensic tool integration' },
        { name: 'quality-control', title: 'Quality Control', icon: '🎯', description: 'Analysis quality control' }
      ]
    },
    {
      category: 'specialized',
      icon: '🎯',
      title: 'Specialized Forensics',
      description: 'Specialized forensic analysis for specific technologies',
      pages: [
        { name: 'email', title: 'Email Forensics', icon: '📧', description: 'Email forensics investigation' },
        { name: 'database', title: 'Database Forensics', icon: '🗄️', description: 'Database forensics analysis' },
        { name: 'iot', title: 'IoT Forensics', icon: '🌐', description: 'IoT device forensic investigation' },
        { name: 'cryptocurrency', title: 'Cryptocurrency Forensics', icon: '₿', description: 'Cryptocurrency forensic analysis' },
        { name: 'social-media', title: 'Social Media Forensics', icon: '📱', description: 'Social media forensic investigation' },
        { name: 'web-application', title: 'Web Application Forensics', icon: '🌍', description: 'Web application forensic analysis' },
        { name: 'virtualization', title: 'Virtualization Forensics', icon: '📦', description: 'Virtual environment forensics' },
        { name: 'container', title: 'Container Forensics', icon: '🐳', description: 'Container forensic analysis' },
        { name: 'blockchain', title: 'Blockchain Forensics', icon: '⛓️', description: 'Blockchain forensic analysis' },
        { name: 'ai-ml', title: 'AI/ML Forensics', icon: '🤖', description: 'AI/ML forensic investigation' },
        { name: 'scada-ics', title: 'SCADA/ICS Forensics', icon: '🏭', description: 'Industrial system forensics' },
        { name: 'automotive', title: 'Automotive Forensics', icon: '🚗', description: 'Vehicle forensic investigation' }
      ]
    },
    {
      category: 'compliance',
      icon: '⚖️',
      title: 'Compliance & Legal',
      description: 'Legal compliance and regulatory requirements management',
      pages: [
        { name: 'legal-requirements', title: 'Legal Requirements', icon: '⚖️', description: 'Legal requirements tracking' },
        { name: 'regulatory', title: 'Regulatory Compliance', icon: '📋', description: 'Regulatory compliance management' },
        { name: 'court-admissibility', title: 'Court Admissibility', icon: '🏛️', description: 'Evidence court admissibility' },
        { name: 'expert-witness', title: 'Expert Witness Preparation', icon: '👨‍⚖️', description: 'Expert witness preparation' },
        { name: 'discovery', title: 'Discovery Management', icon: '🔍', description: 'Legal discovery management' },
        { name: 'privacy-impact', title: 'Privacy Impact Assessment', icon: '🔒', description: 'Privacy impact assessment' },
        { name: 'data-protection', title: 'Data Protection Compliance', icon: '🛡️', description: 'Data protection compliance' },
        { name: 'international-law', title: 'International Law Compliance', icon: '🌍', description: 'International law compliance' },
        { name: 'industry-standards', title: 'Industry Standards', icon: '📊', description: 'Industry standard compliance' },
        { name: 'certification-tracking', title: 'Certification Tracking', icon: '🏆', description: 'Certification tracking' },
        { name: 'documentation', title: 'Legal Documentation', icon: '📚', description: 'Legal documentation management' },
        { name: 'audit-management', title: 'Audit Management', icon: '🔍', description: 'Compliance audit management' }
      ]
    }
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Mock dashboard data
      const mockDashboardData = {
        overview: {
          totalCases: 156,
          activeCases: 23,
          evidenceItems: 1247,
          complianceRate: 94.2
        },
        recentActivity: [
          { id: 1, action: 'Evidence Collection', item: 'Laptop-WS001', timestamp: new Date(), status: 'completed' },
          { id: 2, action: 'Memory Analysis', item: 'Memory-DMP-003', timestamp: new Date(), status: 'in_progress' },
          { id: 3, action: 'Legal Hold', item: 'Case-2024-015', timestamp: new Date(), status: 'active' }
        ],
        systemHealth: {
          serviceStatus: 'operational',
          storageUsage: 76.3,
          processingQueue: 8,
          lastBackup: new Date()
        }
      };
      
      setDashboardData(mockDashboardData);
      addNotification('success', 'Forensics dashboard loaded successfully');
    } catch (err) {
      addNotification('error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading forensics dashboard...</div>
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
            🔬 Digital Forensics Platform
          </h1>
          <p className="text-gray-600">
            Comprehensive digital forensics investigation and analysis platform
          </p>
        </div>
        <div className="flex space-x-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Start Investigation
          </button>
        </div>
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-blue-600">{dashboardData.overview?.totalCases || 0}</div>
          <div className="text-sm text-gray-600">Total Cases</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-green-600">{dashboardData.overview?.activeCases || 0}</div>
          <div className="text-sm text-gray-600">Active Investigations</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-purple-600">{dashboardData.overview?.evidenceItems || 0}</div>
          <div className="text-sm text-gray-600">Evidence Items</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-orange-600">{dashboardData.overview?.complianceRate || 0}%</div>
          <div className="text-sm text-gray-600">Compliance Rate</div>
        </div>
      </div>

      {/* Forensics Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {forensicsModules.map((module) => (
          <div key={module.category} className="bg-white rounded-lg shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{module.icon}</span>
                <div>
                  <h2 className="text-lg font-semibold">{module.title}</h2>
                  <p className="text-sm text-gray-600">{module.description}</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {module.pages.map((page) => (
                  <Link
                    key={page.name}
                    href={`/forensics/${module.category}/${page.name}`}
                    className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-lg">{page.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {page.title}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {page.description}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Recent Forensics Activity</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {(dashboardData.recentActivity || []).map((activity: any) => (
            <div key={activity.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-gray-900">{activity.action}</div>
                  <div className="text-sm text-gray-600">{activity.item}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                    activity.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {activity.status}
                  </span>
                  <div className="text-sm text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

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