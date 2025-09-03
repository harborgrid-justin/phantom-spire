'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api';
import { ApiInfo } from '../types/api';

interface DashboardStats {
  totalIOCs: number;
  totalIssues: number;
  totalOrganizations: number;
  systemStatus: string;
}

export default function Dashboard() {
  const [apiInfo, setApiInfo] = useState<ApiInfo | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalIOCs: 0,
    totalIssues: 0,
    totalOrganizations: 0,
    systemStatus: 'Loading...',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch API info
        const apiResponse = await apiClient.getApiInfo();
        if (apiResponse.data) {
          setApiInfo(apiResponse.data as ApiInfo);
        }

        // Fetch basic stats (these might fail if backend isn't running)
        const [iocsResponse, issuesResponse, orgsResponse] = await Promise.allSettled([
          apiClient.getIOCs(),
          apiClient.getIssues(),
          apiClient.getOrganizations(),
        ]);

        setStats({
          totalIOCs: iocsResponse.status === 'fulfilled' && iocsResponse.value.data?.data && Array.isArray(iocsResponse.value.data.data) 
            ? iocsResponse.value.data.data.length : 0,
          totalIssues: issuesResponse.status === 'fulfilled' && issuesResponse.value.data?.data && Array.isArray(issuesResponse.value.data.data)
            ? issuesResponse.value.data.data.length : 0,
          totalOrganizations: orgsResponse.status === 'fulfilled' && orgsResponse.value.data?.data && Array.isArray(orgsResponse.value.data.data)
            ? orgsResponse.value.data.data.length : 0,
          systemStatus: apiResponse.data ? 'Online' : 'Offline',
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
        setStats(prev => ({ ...prev, systemStatus: 'Offline' }));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Phantom Spire CTI Dashboard
        </h1>
        <p className="text-gray-600">
          Cyber Threat Intelligence Platform Overview
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Warning:</strong> {error}
          <br />
          <small>Make sure the backend server is running on port 3000.</small>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="text-3xl mr-4">🔍</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">IOCs</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.totalIOCs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="text-3xl mr-4">🚨</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Issues</h3>
              <p className="text-2xl font-bold text-red-600">{stats.totalIssues}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="text-3xl mr-4">🏢</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Organizations</h3>
              <p className="text-2xl font-bold text-green-600">{stats.totalOrganizations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="text-3xl mr-4">⚡</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
              <p className={`text-2xl font-bold ${
                stats.systemStatus === 'Online' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stats.systemStatus}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* API Information */}
      {apiInfo && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">API Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Available Endpoints</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                {Object.entries(apiInfo.endpoints).map(([key, value]) => (
                  <li key={key} className="flex justify-between">
                    <span className="capitalize">{key}:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">{value}</code>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Features</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                {Object.entries(apiInfo.features).map(([key, value]) => (
                  <li key={key} className="flex justify-between">
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                    <span className={value ? 'text-green-600' : 'text-red-600'}>
                      {value ? '✓ Enabled' : '✗ Disabled'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/iocs"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-2xl mb-2">🔍</div>
            <h3 className="font-medium text-gray-900">Manage IOCs</h3>
            <p className="text-sm text-gray-600">View and manage indicators of compromise</p>
          </a>
          <a
            href="/mitre"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-medium text-gray-900">MITRE ATT&CK</h3>
            <p className="text-sm text-gray-600">Explore tactics and techniques</p>
          </a>
          <a
            href="/issues"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-2xl mb-2">🚨</div>
            <h3 className="font-medium text-gray-900">Track Issues</h3>
            <p className="text-sm text-gray-600">Monitor and resolve security issues</p>
          </a>
          <a
            href="/organizations"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-2xl mb-2">🏢</div>
            <h3 className="font-medium text-gray-900">Organizations</h3>
            <p className="text-sm text-gray-600">Manage organizational data</p>
          </a>
        </div>
      </div>
    </div>
  );
}
