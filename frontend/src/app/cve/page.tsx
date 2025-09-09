'use client';

import { useEffect, useState } from 'react';
import { CVE, CVESearchResponse } from '../../types/cve';
import { apiClient } from '../../lib/api';
import { useServicePage } from '../../lib/business-logic';
import Link from 'next/link';

export default function CVEMainPage() {
  const [searchResults, setSearchResults] = useState<CVESearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('publishedDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterSeverity, setFilterSeverity] = useState('all');

  // Business Logic Integration
  const { connected, notifications, execute, addNotification, removeNotification } = useServicePage('cve-main');

  useEffect(() => {
    loadCVEs();
  }, [page, sortBy, sortOrder, filterSeverity]);

  const loadCVEs = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '20');
      params.append('sort', JSON.stringify({ field: sortBy, order: sortOrder }));
      
      if (filterSeverity !== 'all') {
        params.append('filters', JSON.stringify({ severity: [filterSeverity] }));
      }

      const response = await apiClient.get(`/cve?${params.toString()}`);
      setSearchResults(response.data);

      await execute('cve-list-loaded', { 
        totalCVEs: response.data.total,
        currentPage: page 
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load CVEs';
      setError(errorMessage);
      addNotification({
        id: 'load-error',
        type: 'error',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'info': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-purple-100 text-purple-800';
      case 'triaged': return 'bg-blue-100 text-blue-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'patching': return 'bg-orange-100 text-orange-800';
      case 'testing': return 'bg-indigo-100 text-indigo-800';
      case 'closed': return 'bg-green-100 text-green-800';
      case 'accepted-risk': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Business Logic Status */}
      <div className="mb-4">
        <div className="flex items-center space-x-4 text-sm">
          <div className={`flex items-center ${connected ? 'text-green-600' : 'text-gray-500'}`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            {connected ? 'CVE Management System Online' : 'CVE Management System Offline'}
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CVE Management Center</h1>
          <p className="text-gray-600 mt-2">Comprehensive vulnerability management and threat intelligence platform</p>
        </div>
        <div className="flex space-x-2">
          <Link 
            href="/cve/search"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Advanced Search
          </Link>
          <Link 
            href="/cve/analysis"
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Analysis Engine
          </Link>
          <Link 
            href="/cve/dashboard"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Dashboard
          </Link>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            Add CVE
          </button>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link href="/cve/dashboard" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="text-3xl mr-4">📊</div>
            <div>
              <h3 className="font-semibold text-gray-900">Dashboard</h3>
              <p className="text-sm text-gray-600">Overview & metrics</p>
            </div>
          </div>
        </Link>

        <Link href="/cve/search" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="text-3xl mr-4">🔍</div>
            <div>
              <h3 className="font-semibold text-gray-900">Search & Discovery</h3>
              <p className="text-sm text-gray-600">Advanced filtering</p>
            </div>
          </div>
        </Link>

        <Link href="/cve/risk-assessment" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="text-3xl mr-4">⚠️</div>
            <div>
              <h3 className="font-semibold text-gray-900">Risk Assessment</h3>
              <p className="text-sm text-gray-600">Business impact analysis</p>
            </div>
          </div>
        </Link>

        <Link href="/cve/remediation" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-orange-500">
          <div className="flex items-center">
            <div className="text-3xl mr-4">🔧</div>
            <div>
              <h3 className="font-semibold text-gray-900">Remediation</h3>
              <p className="text-sm text-gray-600">Patch management</p>
            </div>
          </div>
        </Link>

        <Link href="/cve/compliance" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="text-3xl mr-4">📋</div>
            <div>
              <h3 className="font-semibold text-gray-900">Compliance</h3>
              <p className="text-sm text-gray-600">Regulatory tracking</p>
            </div>
          </div>
        </Link>

        <Link href="/cve/feeds" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="text-3xl mr-4">📡</div>
            <div>
              <h3 className="font-semibold text-gray-900">Intelligence Feeds</h3>
              <p className="text-sm text-gray-600">Real-time updates</p>
            </div>
          </div>
        </Link>

        <Link href="/cve/assets" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-indigo-500">
          <div className="flex items-center">
            <div className="text-3xl mr-4">🏢</div>
            <div>
              <h3 className="font-semibold text-gray-900">Asset Impact</h3>
              <p className="text-sm text-gray-600">Infrastructure mapping</p>
            </div>
          </div>
        </Link>

        <Link href="/cve/reports" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-pink-500">
          <div className="flex items-center">
            <div className="text-3xl mr-4">📈</div>
            <div>
              <h3 className="font-semibold text-gray-900">Executive Reports</h3>
              <p className="text-sm text-gray-600">Management dashboards</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Severity</label>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="info">Info</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="publishedDate">Published Date</option>
                <option value="cvssScore">CVSS Score</option>
                <option value="riskScore">Risk Score</option>
                <option value="cveId">CVE ID</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-2">
            <button 
              onClick={loadCVEs}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Refresh
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              Export
            </button>
          </div>
        </div>
      </div>

      {/* CVE List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading CVEs...</div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      ) : searchResults ? (
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              CVE List ({searchResults.total} total)
            </h3>
            <div className="text-sm text-gray-600">
              Page {searchResults.page} of {searchResults.totalPages}
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {searchResults.cves.map((cve) => (
              <div key={cve.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Link 
                        href={`/cve/details/${cve.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        {cve.cveId}
                      </Link>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(cve.scoring.severity)}`}>
                        {cve.scoring.severity.toUpperCase()}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(cve.workflow.status)}`}>
                        {cve.workflow.status.replace('-', ' ').toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        CVSS: {cve.scoring.cvssV3Score || cve.scoring.cvssV2Score || 'N/A'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-900 mb-2">{cve.title}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs text-gray-500 mb-2">
                      <div>
                        <span>Published:</span> {new Date(cve.publishedDate).toLocaleDateString()}
                      </div>
                      <div>
                        <span>Risk Score:</span> {cve.riskAssessment.riskScore}/100
                      </div>
                      <div>
                        <span>Assets Affected:</span> {cve.assetImpacts.length}
                      </div>
                      <div>
                        {cve.exploitInfo.exploitAvailable ? (
                          <span className="text-red-600 font-medium">Exploit Available</span>
                        ) : cve.patchInfo.patchAvailable ? (
                          <span className="text-green-600 font-medium">Patch Available</span>
                        ) : (
                          <span className="text-gray-500">No Patch</span>
                        )}
                      </div>
                    </div>

                    {cve.affectedProducts.length > 0 && (
                      <div className="text-xs text-gray-500">
                        <span>Affects:</span> {cve.affectedProducts.slice(0, 2).map(p => `${p.vendor} ${p.product}`).join(', ')}
                        {cve.affectedProducts.length > 2 && ` +${cve.affectedProducts.length - 2} more`}
                      </div>
                    )}

                    <div className="flex items-center space-x-2 mt-2">
                      {cve.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                      {cve.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{cve.tags.length - 3} more</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex flex-col space-y-2">
                    <Link 
                      href={`/cve/details/${cve.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details
                    </Link>
                    <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                      Assign
                    </button>
                    <button className="text-orange-600 hover:text-orange-800 text-sm font-medium">
                      Update Status
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {searchResults.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1 || loading}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                Previous
              </button>
              
              <div className="flex space-x-2">
                {Array.from({ length: Math.min(5, searchResults.totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(searchResults.totalPages - 4, page - 2)) + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-2 rounded-lg ${
                        pageNum === page 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage(Math.min(searchResults.totalPages, page + 1))}
                disabled={page === searchResults.totalPages || loading}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : null}

      {/* Business Logic Notifications */}
      {notifications.length > 0 && (
        <div className="mt-6 space-y-2">
          {notifications.map((notification) => (
            <div 
              key={notification.id}
              className={`p-3 rounded-lg border ${
                notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' :
                notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
                'bg-blue-50 border-blue-200 text-blue-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm">{notification.message}</span>
                <button 
                  onClick={() => removeNotification(notification.id)}
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
