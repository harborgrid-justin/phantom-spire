'use client';

import React from 'react';
import { 
  Shield, 
  Eye, 
  ClipboardList, 
  BarChart3,
  Settings,
  Clock,
  Network,
  Cloud,
  ShieldCheck
} from 'lucide-react';

const XDRDashboard = () => {
  const xdrModules = [
    // Core Detection & Response (1-10)
    { 
      id: 1, 
      name: 'Detection Engine', 
      description: 'Advanced threat detection and analysis', 
      icon: Shield, 
      status: 'active',
      path: '/xdr/detection-engine'
    },
    { 
      id: 2, 
      name: 'Incident Response', 
      description: 'Automated incident response workflows', 
      icon: ClipboardList, 
      status: 'active',
      path: '/xdr/incident-response'
    },
    { 
      id: 3, 
      name: 'Threat Hunting', 
      description: 'Proactive threat hunting capabilities', 
      icon: Eye, 
      status: 'active',
      path: '/xdr/threat-hunting'
    },
    { 
      id: 4, 
      name: 'Analytics Dashboard', 
      description: 'Real-time security analytics and metrics', 
      icon: BarChart3, 
      status: 'active',
      path: '/xdr/analytics'
    },
    { 
      id: 5, 
      name: 'Configuration', 
      description: 'XDR system configuration and settings', 
      icon: Settings, 
      status: 'active',
      path: '/xdr/configuration'
    },
    { 
      id: 6, 
      name: 'Real-time Monitoring', 
      description: 'Live security event monitoring', 
      icon: Clock, 
      status: 'active',
      path: '/xdr/monitoring'
    },
    { 
      id: 7, 
      name: 'Alert Management', 
      description: 'Centralized alert management system', 
      icon: Shield, 
      status: 'active',
      path: '/xdr/alerts'
    },
    { 
      id: 8, 
      name: 'Asset Discovery', 
      description: 'Automated asset discovery and inventory', 
      icon: Network, 
      status: 'active',
      path: '/xdr/assets'
    },
    { 
      id: 9, 
      name: 'Behavioral Analytics', 
      description: 'User and entity behavior analysis', 
      icon: BarChart3, 
      status: 'active',
      path: '/xdr/behavior'
    },
    { 
      id: 10, 
      name: 'Compliance Monitoring', 
      description: 'Regulatory compliance tracking', 
      icon: ShieldCheck, 
      status: 'active',
      path: '/xdr/compliance'
    },
    
    // Extended Security (11-25)
    { id: 11, name: 'Data Loss Prevention', description: 'Prevent sensitive data exfiltration', icon: Shield, status: 'active', path: '/xdr/dlp' },
    { id: 12, name: 'Email Security', description: 'Advanced email threat protection', icon: Shield, status: 'active', path: '/xdr/email-security' },
    { id: 13, name: 'Endpoint Protection', description: 'Comprehensive endpoint security', icon: Shield, status: 'active', path: '/xdr/endpoints' },
    { id: 14, name: 'Forensic Analysis', description: 'Digital forensics and investigation', icon: Eye, status: 'active', path: '/xdr/forensics' },
    { id: 15, name: 'Identity Protection', description: 'Identity and access security', icon: Shield, status: 'active', path: '/xdr/identity' },
    { id: 16, name: 'ML Detection', description: 'Machine learning threat detection', icon: BarChart3, status: 'active', path: '/xdr/ml-detection' },
    { id: 17, name: 'Network Security', description: 'Network threat protection', icon: Network, status: 'active', path: '/xdr/network' },
    { id: 18, name: 'Orchestration Engine', description: 'Security orchestration platform', icon: Settings, status: 'active', path: '/xdr/orchestration' },
    { id: 19, name: 'Patch Management', description: 'Automated patch deployment', icon: Settings, status: 'active', path: '/xdr/patches' },
    { id: 20, name: 'Quarantine Management', description: 'Threat containment system', icon: Shield, status: 'active', path: '/xdr/quarantine' },
    { id: 21, name: 'Risk Assessment', description: 'Comprehensive risk analysis', icon: BarChart3, status: 'active', path: '/xdr/risk' },
    { id: 22, name: 'Sandbox Analysis', description: 'Malware analysis sandbox', icon: Eye, status: 'active', path: '/xdr/sandbox' },
    { id: 23, name: 'Threat Intelligence', description: 'Global threat intelligence feeds', icon: Eye, status: 'active', path: '/xdr/threat-intel' },
    { id: 24, name: 'User Behavior Analytics', description: 'Advanced user behavior monitoring', icon: BarChart3, status: 'active', path: '/xdr/uba' },
    { id: 25, name: 'Vulnerability Management', description: 'Vulnerability assessment and management', icon: Shield, status: 'active', path: '/xdr/vulnerabilities' },
    
    // Advanced Operations (26-49)
    { id: 26, name: 'Workflow Automation', description: 'Automated security workflows', icon: Settings, status: 'active', path: '/xdr/workflow' },
    { id: 27, name: 'Zero Trust Enforcement', description: 'Zero trust security model', icon: ShieldCheck, status: 'active', path: '/xdr/zero-trust' },
    { id: 28, name: 'API Security', description: 'API threat protection', icon: Network, status: 'active', path: '/xdr/api-security' },
    { id: 29, name: 'Backup Security', description: 'Backup integrity monitoring', icon: Shield, status: 'active', path: '/xdr/backup-security' },
    { id: 30, name: 'Cloud Security', description: 'Multi-cloud security posture', icon: Cloud, status: 'active', path: '/xdr/cloud-security' },
    { id: 31, name: 'Device Control', description: 'Device access management', icon: Shield, status: 'active', path: '/xdr/device-control' },
    { id: 32, name: 'Export/Import', description: 'Data export and import tools', icon: Settings, status: 'active', path: '/xdr/export-import' },
    { id: 33, name: 'File Integrity', description: 'File integrity monitoring', icon: Shield, status: 'active', path: '/xdr/file-integrity' },
    { id: 34, name: 'Geo-Location', description: 'Geographic threat tracking', icon: Eye, status: 'active', path: '/xdr/geo-location' },
    { id: 35, name: 'Honeypot', description: 'Deception technology platform', icon: Shield, status: 'active', path: '/xdr/honeypot' },
    { id: 36, name: 'Incident Timeline', description: 'Incident timeline visualization', icon: Clock, status: 'active', path: '/xdr/timeline' },
    { id: 37, name: 'JIRA Integration', description: 'Ticketing system integration', icon: ClipboardList, status: 'active', path: '/xdr/jira' },
    { id: 38, name: 'Knowledge Base', description: 'Security knowledge management', icon: BarChart3, status: 'active', path: '/xdr/knowledge' },
    { id: 39, name: 'Log Analysis', description: 'Advanced log analytics', icon: Eye, status: 'active', path: '/xdr/logs' },
    { id: 40, name: 'Mobile Security', description: 'Mobile device protection', icon: Shield, status: 'active', path: '/xdr/mobile' },
    { id: 41, name: 'Notification Center', description: 'Alert notification system', icon: ClipboardList, status: 'active', path: '/xdr/notifications' },
    { id: 42, name: 'Offline Analysis', description: 'Offline threat analysis', icon: Eye, status: 'active', path: '/xdr/offline' },
    { id: 43, name: 'Policy Management', description: 'Security policy framework', icon: Settings, status: 'active', path: '/xdr/policies' },
    { id: 44, name: 'Query Builder', description: 'Advanced query interface', icon: BarChart3, status: 'active', path: '/xdr/query' },
    { id: 45, name: 'Report Generator', description: 'Automated report generation', icon: BarChart3, status: 'active', path: '/xdr/reports' },
    { id: 46, name: 'Scheduler', description: 'Task scheduling system', icon: Settings, status: 'active', path: '/xdr/scheduler' },
    { id: 47, name: 'Threat Feed', description: 'Threat intelligence feeds', icon: Eye, status: 'active', path: '/xdr/feeds' },
    { id: 48, name: 'User Management', description: 'XDR user administration', icon: Settings, status: 'active', path: '/xdr/users' },
    { id: 49, name: 'Visualization', description: 'Security data visualization', icon: BarChart3, status: 'active', path: '/xdr/visualization' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex-1 p-6">
      <h1 className="text-3xl font-bold mb-2">
        XDR (Extended Detection and Response) Platform
      </h1>
      
      <p className="text-gray-600 mb-6">
        Comprehensive security platform with 49 integrated modules for enterprise threat detection and response
      </p>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Platform Status</h2>
        <div className="flex gap-4 mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {xdrModules.length} Total Modules
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            {xdrModules.filter(m => m.status === 'active').length} Active
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            All Systems Operational
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {xdrModules.map((module) => {
          const IconComponent = module.icon;
          return (
            <div 
              key={module.id}
              className="bg-white rounded-lg shadow border hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col h-full"
            >
              <div className="p-6 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-blue-600">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(module.status)}`}>
                    {module.status}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {module.name}
                </h3>
                <p className="text-gray-600 text-sm">
                  {module.description}
                </p>
              </div>
              <div className="p-6 pt-0">
                <button 
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  onClick={() => window.location.href = module.path}
                >
                  Access Module
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-6 bg-white rounded-lg shadow border">
        <h2 className="text-xl font-semibold mb-4">
          XDR Platform Overview
        </h2>
        <p className="text-gray-600">
          The Extended Detection and Response (XDR) platform provides comprehensive security coverage across 
          endpoints, networks, cloud environments, and applications. With 49 integrated modules, it delivers 
          unified threat detection, investigation, and automated response capabilities for enterprise security operations.
        </p>
      </div>
    </div>
  );
};

export default XDRDashboard;
