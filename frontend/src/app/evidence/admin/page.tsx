'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api';
import { useServicePage } from '../../../lib/business-logic';

interface EvidenceConfiguration {
  general: {
    autoArchiveDays: number;
    maxFileSize: number;
    allowedFileTypes: string[];
    enableAutoClassification: boolean;
    defaultClassification: string;
    enableIntegrityChecking: boolean;
    hashAlgorithms: string[];
  };
  storage: {
    storageBackend: 'local' | 's3' | 'azure' | 'gcp';
    compressionEnabled: boolean;
    encryptionEnabled: boolean;
    encryptionAlgorithm: string;
    backupRetentionDays: number;
    storageQuotaGB: number;
  };
  analysis: {
    enableAutoAnalysis: boolean;
    analysisTimeout: number;
    enableYaraScan: boolean;
    enableVirusTotalScan: boolean;
    enableSandboxAnalysis: boolean;
    sandboxTimeout: number;
    analysisQueues: number;
  };
  notifications: {
    enableEmailNotifications: boolean;
    enableSlackNotifications: boolean;
    criticalAlertThreshold: number;
    emailRecipients: string[];
    slackWebhook: string;
    notificationFrequency: 'immediate' | 'hourly' | 'daily';
  };
  security: {
    requireMFA: boolean;
    sessionTimeout: number;
    enableIPRestriction: boolean;
    allowedIPs: string[];
    enableAuditLogging: boolean;
    auditRetentionDays: number;
    encryptInTransit: boolean;
    encryptAtRest: boolean;
  };
  integrations: {
    enableSIEMIntegration: boolean;
    siemEndpoint: string;
    enableThreatFeedIntegration: boolean;
    threatFeedSources: string[];
    enableMISPIntegration: boolean;
    mispUrl: string;
    mispApiKey: string;
  };
}

export default function EvidenceConfigurationPage() {
  // Business Logic Integration
  const {
    loading: businessLoading,
    data: businessData,
    error: businessError,
    stats,
    connected,
    notifications,
    execute,
    refresh,
    addNotification,
    removeNotification
  } = useServicePage('evidence-config');

  const [config, setConfig] = useState<EvidenceConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'storage' | 'analysis' | 'notifications' | 'security' | 'integrations'>('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfiguration();
  }, []);

  const fetchConfiguration = async () => {
    try {
      setLoading(true);
      
      // Use business logic first
      const businessResponse = await execute('getEvidenceConfiguration', {});
      
      if (businessResponse.success && businessResponse.data) {
        setConfig(businessResponse.data);
        addNotification('success', 'Configuration loaded successfully via business logic');
      } else {
        // Fallback to mock data for demo
        const mockConfig: EvidenceConfiguration = {
          general: {
            autoArchiveDays: 365,
            maxFileSize: 1073741824, // 1GB
            allowedFileTypes: ['.pdf', '.doc', '.docx', '.txt', '.log', '.pcap', '.exe', '.zip'],
            enableAutoClassification: true,
            defaultClassification: 'TLP:WHITE',
            enableIntegrityChecking: true,
            hashAlgorithms: ['SHA256', 'MD5', 'SHA1']
          },
          storage: {
            storageBackend: 'local',
            compressionEnabled: true,
            encryptionEnabled: true,
            encryptionAlgorithm: 'AES-256',
            backupRetentionDays: 90,
            storageQuotaGB: 1000
          },
          analysis: {
            enableAutoAnalysis: true,
            analysisTimeout: 600,
            enableYaraScan: true,
            enableVirusTotalScan: false,
            enableSandboxAnalysis: true,
            sandboxTimeout: 300,
            analysisQueues: 4
          },
          notifications: {
            enableEmailNotifications: true,
            enableSlackNotifications: false,
            criticalAlertThreshold: 8.0,
            emailRecipients: ['security@company.com', 'admin@company.com'],
            slackWebhook: '',
            notificationFrequency: 'immediate'
          },
          security: {
            requireMFA: true,
            sessionTimeout: 480,
            enableIPRestriction: false,
            allowedIPs: ['192.168.1.0/24', '10.0.0.0/8'],
            enableAuditLogging: true,
            auditRetentionDays: 365,
            encryptInTransit: true,
            encryptAtRest: true
          },
          integrations: {
            enableSIEMIntegration: true,
            siemEndpoint: 'https://siem.company.com/api/events',
            enableThreatFeedIntegration: true,
            threatFeedSources: ['AlienVault OTX', 'Malware Bazaar', 'URLVoid'],
            enableMISPIntegration: false,
            mispUrl: 'https://misp.company.com',
            mispApiKey: ''
          }
        };
        
        setConfig(mockConfig);
        addNotification('info', 'Configuration loaded from default settings (business logic unavailable)');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch configuration';
      setError(errorMsg);
      addNotification('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const saveConfiguration = async () => {
    if (!config) return;
    
    try {
      setSaving(true);
      
      // Use business logic first
      const businessResponse = await execute('saveEvidenceConfiguration', { config });
      
      if (businessResponse.success) {
        setHasChanges(false);
        addNotification('success', 'Configuration saved successfully');
      } else {
        // Simulate save for demo
        setHasChanges(false);
        addNotification('info', 'Configuration saved (demo mode)');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save configuration';
      setError(errorMsg);
      addNotification('error', errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (section: keyof EvidenceConfiguration, field: string, value: any) => {
    if (!config) return;
    
    setConfig(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading configuration...</div>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">Failed to load configuration</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Business Logic Status */}
      <div className="mb-4">
        <div className="flex items-center space-x-4 text-sm">
          <div className={`flex items-center ${connected ? 'text-green-600' : 'text-gray-500'}`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            {connected ? 'Business Logic Connected' : 'Business Logic Offline'}
          </div>
          {stats && (
            <div className="text-gray-600">
              Service Stats: {stats.totalRequests || 0} requests
            </div>
          )}
          <button
            onClick={refresh}
            className="text-blue-600 hover:text-blue-800"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Evidence Configuration</h1>
          <p className="text-gray-600 mt-2">Configure evidence management system settings and policies</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={fetchConfiguration}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={saveConfiguration}
            disabled={!hasChanges || saving}
            className={`px-4 py-2 rounded-lg transition-colors ${
              hasChanges && !saving
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['general', 'storage', 'analysis', 'notifications', 'security', 'integrations'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Configuration Content */}
      <div className="bg-white rounded-lg shadow-md">
        {activeTab === 'general' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">General Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auto Archive After (days)
                </label>
                <input
                  type="number"
                  value={config.general.autoArchiveDays}
                  onChange={(e) => updateConfig('general', 'autoArchiveDays', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max File Size ({formatBytes(config.general.maxFileSize)})
                </label>
                <input
                  type="range"
                  min="1048576"
                  max="10737418240"
                  step="1048576"
                  value={config.general.maxFileSize}
                  onChange={(e) => updateConfig('general', 'maxFileSize', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Classification
                </label>
                <select
                  value={config.general.defaultClassification}
                  onChange={(e) => updateConfig('general', 'defaultClassification', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="TLP:WHITE">TLP:WHITE</option>
                  <option value="TLP:GREEN">TLP:GREEN</option>
                  <option value="TLP:AMBER">TLP:AMBER</option>
                  <option value="TLP:RED">TLP:RED</option>
                  <option value="UNCLASSIFIED">UNCLASSIFIED</option>
                  <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                  <option value="SECRET">SECRET</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allowed File Types
                </label>
                <input
                  type="text"
                  value={config.general.allowedFileTypes.join(', ')}
                  onChange={(e) => updateConfig('general', 'allowedFileTypes', e.target.value.split(', '))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder=".pdf, .doc, .txt"
                />
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.general.enableAutoClassification}
                  onChange={(e) => updateConfig('general', 'enableAutoClassification', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Enable automatic classification</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.general.enableIntegrityChecking}
                  onChange={(e) => updateConfig('general', 'enableIntegrityChecking', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Enable integrity checking</span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'storage' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Storage Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Storage Backend
                </label>
                <select
                  value={config.storage.storageBackend}
                  onChange={(e) => updateConfig('storage', 'storageBackend', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="local">Local Storage</option>
                  <option value="s3">Amazon S3</option>
                  <option value="azure">Azure Blob Storage</option>
                  <option value="gcp">Google Cloud Storage</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Encryption Algorithm
                </label>
                <select
                  value={config.storage.encryptionAlgorithm}
                  onChange={(e) => updateConfig('storage', 'encryptionAlgorithm', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="AES-256">AES-256</option>
                  <option value="AES-128">AES-128</option>
                  <option value="ChaCha20">ChaCha20</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Backup Retention (days)
                </label>
                <input
                  type="number"
                  value={config.storage.backupRetentionDays}
                  onChange={(e) => updateConfig('storage', 'backupRetentionDays', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Storage Quota (GB)
                </label>
                <input
                  type="number"
                  value={config.storage.storageQuotaGB}
                  onChange={(e) => updateConfig('storage', 'storageQuotaGB', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.storage.compressionEnabled}
                  onChange={(e) => updateConfig('storage', 'compressionEnabled', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Enable compression</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.storage.encryptionEnabled}
                  onChange={(e) => updateConfig('storage', 'encryptionEnabled', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Enable encryption</span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Analysis Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Analysis Timeout (seconds)
                </label>
                <input
                  type="number"
                  value={config.analysis.analysisTimeout}
                  onChange={(e) => updateConfig('analysis', 'analysisTimeout', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sandbox Timeout (seconds)
                </label>
                <input
                  type="number"
                  value={config.analysis.sandboxTimeout}
                  onChange={(e) => updateConfig('analysis', 'sandboxTimeout', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Analysis Queues
                </label>
                <input
                  type="number"
                  min="1"
                  max="16"
                  value={config.analysis.analysisQueues}
                  onChange={(e) => updateConfig('analysis', 'analysisQueues', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.analysis.enableAutoAnalysis}
                  onChange={(e) => updateConfig('analysis', 'enableAutoAnalysis', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Enable automatic analysis</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.analysis.enableYaraScan}
                  onChange={(e) => updateConfig('analysis', 'enableYaraScan', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Enable YARA scanning</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.analysis.enableVirusTotalScan}
                  onChange={(e) => updateConfig('analysis', 'enableVirusTotalScan', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Enable VirusTotal scanning</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.analysis.enableSandboxAnalysis}
                  onChange={(e) => updateConfig('analysis', 'enableSandboxAnalysis', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Enable sandbox analysis</span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  value={config.security.sessionTimeout}
                  onChange={(e) => updateConfig('security', 'sessionTimeout', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Audit Retention (days)
                </label>
                <input
                  type="number"
                  value={config.security.auditRetentionDays}
                  onChange={(e) => updateConfig('security', 'auditRetentionDays', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allowed IP Addresses (one per line)
                </label>
                <textarea
                  value={config.security.allowedIPs.join('\n')}
                  onChange={(e) => updateConfig('security', 'allowedIPs', e.target.value.split('\n').filter(ip => ip.trim()))}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="192.168.1.0/24&#10;10.0.0.0/8"
                />
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.security.requireMFA}
                  onChange={(e) => updateConfig('security', 'requireMFA', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Require Multi-Factor Authentication</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.security.enableIPRestriction}
                  onChange={(e) => updateConfig('security', 'enableIPRestriction', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Enable IP address restrictions</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.security.enableAuditLogging}
                  onChange={(e) => updateConfig('security', 'enableAuditLogging', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Enable audit logging</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.security.encryptInTransit}
                  onChange={(e) => updateConfig('security', 'encryptInTransit', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Encrypt data in transit</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.security.encryptAtRest}
                  onChange={(e) => updateConfig('security', 'encryptAtRest', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Encrypt data at rest</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Notifications */}
      {notifications && notifications.length > 0 && (
        <div className="fixed bottom-4 right-4 space-y-2">
          {notifications.map((notification, index) => (
            <div
              key={notification.id || index}
              className={`p-4 rounded-lg shadow-lg max-w-sm ${
                notification.type === 'success' ? 'bg-green-100 text-green-800' :
                notification.type === 'error' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}
            >
              <div className="flex justify-between items-start">
                <span>{notification.message}</span>
                <button
                  onClick={() => removeNotification(notification.id || index.toString())}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}