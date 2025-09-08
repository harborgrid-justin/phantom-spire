'use client';

import { useEffect, useState } from 'react';

interface BackupRecoveryManagerData {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'completed' | 'failed' | 'draft' | 'suspended' | 'resolved';
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  description?: string;
  errorCode?: string;
  affectedSystems?: string[];
  resolutionSteps?: string[];
  resolvedAt?: string;
  completionRate?: number;
}

export default function BackupRecoveryManagerPage() {
  const [data, setData] = useState<BackupRecoveryManagerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    // Mock data for backup-recovery-manager
    setData([
      {
        id: '1',
        name: 'Critical System Error #001',
        status: 'active',
        severity: 'high',
        createdAt: new Date().toISOString(),
        description: 'Comprehensive backup recovery manager with automated resolution',
        errorCode: 'ERR_BACKUP_RECOVERY_MANAGER_001',
        affectedSystems: ['authentication-service', 'user-database'],
        resolutionSteps: [
          'Identify root cause',
          'Implement corrective measures',
          'Verify system stability',
          'Monitor for recurrence'
        ],
        completionRate: 75
      },
      {
        id: '2',
        name: 'Security Violation Alert #002',
        status: 'pending',
        severity: 'critical',
        createdAt: new Date().toISOString(),
        description: 'Advanced backup recovery manager processing',
        errorCode: 'ERR_BACKUP_RECOVERY_MANAGER_002',
        affectedSystems: ['api-gateway', 'security-service'],
        resolutionSteps: [
          'Assess security impact',
          'Isolate affected components',
          'Apply security patches',
          'Conduct security audit'
        ],
        completionRate: 45
      },
      {
        id: '3',
        name: 'Performance Degradation #003',
        status: 'resolved',
        severity: 'medium',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date().toISOString(),
        description: 'Resolved backup recovery manager issue',
        errorCode: 'ERR_BACKUP_RECOVERY_MANAGER_003',
        affectedSystems: ['database-cluster'],
        resolutionSteps: [
          'Monitor performance metrics',
          'Optimize database queries',
          'Scale resources',
          'Validate improvements'
        ],
        completionRate: 100
      }
    ]);

    // Mock analytics
    setAnalytics({
      totalErrors: 3,
      errorsByStatus: { active: 1, pending: 1, resolved: 1 },
      errorsBySeverity: { critical: 1, high: 1, medium: 1 },
      resolutionRate: 33.33,
      averageResolutionTime: 8.5
    });

    setLoading(false);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-blue-600 bg-blue-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'resolved': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <span className="mr-3">🔄</span>
          Backup Recovery Manager
        </h1>
        <p className="text-gray-600 mt-2">
          Comprehensive backup recovery manager and recovery management
        </p>
      </div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-blue-600">{analytics?.totalErrors || 0}</div>
          <div className="text-sm text-gray-600">Total Errors</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-green-600">
            {analytics?.resolutionRate?.toFixed(1) || 0}%
          </div>
          <div className="text-sm text-gray-600">Resolution Rate</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-purple-600">
            {analytics?.averageResolutionTime?.toFixed(1) || 0}h
          </div>
          <div className="text-sm text-gray-600">Avg Resolution Time</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-orange-600">
            {data.filter(item => item.status === 'active' || item.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Active Issues</div>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-lg font-semibold text-blue-600">
            {data.filter(item => item.status === 'active').length}
          </div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-lg font-semibold text-yellow-600">
            {data.filter(item => item.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-lg font-semibold text-green-600">
            {data.filter(item => item.status === 'resolved').length}
          </div>
          <div className="text-sm text-gray-600">Resolved</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-lg font-semibold text-red-600">
            {data.filter(item => item.status === 'failed').length}
          </div>
          <div className="text-sm text-gray-600">Failed</div>
        </div>
      </div>

      {/* Error Items Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Backup Recovery Manager Items</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {data.map((item) => (
            <div key={item.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(item.severity)}`}>
                      {item.severity}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>Error Code: {item.errorCode}</div>
                    <div>Affected Systems: {item.affectedSystems?.join(', ') || 'None'}</div>
                    <div>Created: {new Date(item.createdAt).toLocaleString()}</div>
                    {item.resolvedAt && (
                      <div>Resolved: {new Date(item.resolvedAt).toLocaleString()}</div>
                    )}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-sm font-medium">{item.completionRate}%</div>
                  <div className="text-xs text-gray-500">Completion</div>
                  <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${item.completionRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* Resolution Steps */}
              {item.resolutionSteps && item.resolutionSteps.length > 0 && (
                <div className="mt-3 border-t pt-3">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Resolution Steps:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {item.resolutionSteps.map((step, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center mr-2">
                          {index + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}