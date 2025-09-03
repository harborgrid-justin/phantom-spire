'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../lib/api';
import { useServicePage } from '../../lib/business-logic';
import { MITRETechnique, MITRETactic, MITREGroup } from '../../types/api';

type TabType = 'techniques' | 'tactics' | 'groups';

export default function MITREPage() {
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
  } = useServicePage('mitre');

  const [activeTab, setActiveTab] = useState<TabType>('techniques');
  const [techniques, setTechniques] = useState<MITRETechnique[]>([]);
  const [tactics, setTactics] = useState<MITRETactic[]>([]);
  const [groups, setGroups] = useState<MITREGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMITREData();
  }, []);

  const fetchMITREData = async () => {
    try {
      setLoading(true);
      
      // Try business logic first
      const [techniquesRes, tacticsRes, groupsRes] = await Promise.allSettled([
        execute('getTechniques', {}),
        execute('getTactics', {}),
        execute('getGroups', {})
      ]);

      // Process business logic results
      let hasBusinessData = false;
      
      if (techniquesRes.status === 'fulfilled' && techniquesRes.value.success) {
        setTechniques(techniquesRes.value.data || []);
        hasBusinessData = true;
      }
      
      if (tacticsRes.status === 'fulfilled' && tacticsRes.value.success) {
        setTactics(tacticsRes.value.data || []);
        hasBusinessData = true;
      }
      
      if (groupsRes.status === 'fulfilled' && groupsRes.value.success) {
        setGroups(groupsRes.value.data || []);
        hasBusinessData = true;
      }

      if (hasBusinessData) {
        addNotification('success', 'MITRE data loaded via business logic');
      } else {
        // Fallback to direct API
        const [techniquesResponse, tacticsResponse, groupsResponse] = await Promise.allSettled([
          apiClient.getMITRETechniques(),
          apiClient.getMITRETactics(),
          apiClient.getMITREGroups(),
        ]);

        if (techniquesResponse.status === 'fulfilled' && techniquesResponse.value.data && typeof techniquesResponse.value.data === 'object' && techniquesResponse.value.data !== null && 'data' in techniquesResponse.value.data && Array.isArray((techniquesResponse.value.data as any).data)) {
          setTechniques((techniquesResponse.value.data as any).data);
        }
        if (tacticsResponse.status === 'fulfilled' && tacticsResponse.value.data && typeof tacticsResponse.value.data === 'object' && tacticsResponse.value.data !== null && 'data' in tacticsResponse.value.data && Array.isArray((tacticsResponse.value.data as any).data)) {
          setTactics((tacticsResponse.value.data as any).data);
        }
        if (groupsResponse.status === 'fulfilled' && groupsResponse.value.data && typeof groupsResponse.value.data === 'object' && groupsResponse.value.data !== null && 'data' in groupsResponse.value.data && Array.isArray((groupsResponse.value.data as any).data)) {
          setGroups((groupsResponse.value.data as any).data);
        }

        // Check if any requests failed
        const failedRequests = [techniquesResponse, tacticsResponse, groupsResponse]
          .filter(response => response.status === 'rejected');
        
        if (failedRequests.length > 0) {
          setError('Some MITRE data could not be loaded. Make sure the backend server is running.');
          addNotification('warning', 'Some MITRE data could not be loaded');
        } else {
          addNotification('info', 'MITRE data loaded via direct API (business logic unavailable)');
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch MITRE data';
      setError(errorMsg);
      addNotification('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const renderTechniques = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {techniques.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-lg font-medium mb-2">No Techniques Found</h3>
          <p>MITRE ATT&CK techniques data is not available.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tactics
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Platforms
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {techniques.map((technique) => (
                <tr key={technique.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="text-sm font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {technique.techniqueId}
                    </code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {technique.name}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {technique.tactics.map((tactic, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {tactic}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {technique.platforms.map((platform, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {platform}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-md truncate">
                      {technique.description}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderTactics = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {tactics.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-lg font-medium mb-2">No Tactics Found</h3>
          <p>MITRE ATT&CK tactics data is not available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {tactics.map((tactic) => (
            <div key={tactic.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <code className="text-sm font-mono bg-purple-100 text-purple-800 px-2 py-1 rounded mr-3">
                  {tactic.tacticId}
                </code>
                <h3 className="font-semibold text-gray-900">{tactic.name}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">{tactic.description}</p>
              <div className="text-xs text-gray-500">
                {tactic.techniques.length} technique{tactic.techniques.length !== 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderGroups = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {groups.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="text-lg font-medium mb-2">No Groups Found</h3>
          <p>MITRE ATT&CK groups data is not available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {groups.map((group) => (
            <div key={group.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <code className="text-sm font-mono bg-red-100 text-red-800 px-2 py-1 rounded mr-3">
                  {group.groupId}
                </code>
                <h3 className="font-semibold text-gray-900">{group.name}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">{group.description}</p>
              {group.aliases && group.aliases.length > 0 && (
                <div className="mb-3">
                  <span className="text-xs font-medium text-gray-700">Aliases: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {group.aliases.map((alias, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {alias}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="text-xs text-gray-500">
                {group.techniques.length} technique{group.techniques.length !== 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading MITRE ATT&CK data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          MITRE ATT&CK Framework
        </h1>
        <p className="text-gray-600">
          Explore adversary tactics, techniques, and procedures
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Warning:</strong> {error}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('techniques')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'techniques'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Techniques ({techniques.length})
          </button>
          <button
            onClick={() => setActiveTab('tactics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tactics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Tactics ({tactics.length})
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'groups'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Groups ({groups.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'techniques' && renderTechniques()}
      {activeTab === 'tactics' && renderTactics()}
      {activeTab === 'groups' && renderGroups()}
    </div>
  );
}
