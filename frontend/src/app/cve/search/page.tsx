'use client';

import { useEffect, useState } from 'react';
import { CVE, CVESearchFilters, CVESearchResponse } from '../../../types/cve';
import { apiClient } from '../../../lib/api';
import { useServicePage } from '../../../lib/business-logic';

export default function CVESearchPage() {
  const [searchResults, setSearchResults] = useState<CVESearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<CVESearchFilters>({});
  const [page, setPage] = useState(1);

  // Business Logic Integration
  const { connected, notifications, execute, addNotification, removeNotification } = useServicePage('cve-search');

  useEffect(() => {
    if (searchQuery || Object.keys(filters).length > 0) {
      performSearch();
    }
  }, [page]);

  const performSearch = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      params.append('page', page.toString());
      params.append('limit', '20');
      
      if (Object.keys(filters).length > 0) {
        params.append('filters', JSON.stringify(filters));
      }

      const response = await apiClient.get(`/cve?${params.toString()}`);
      setSearchResults(response.data);

      await execute('search-performed', { 
        query: searchQuery, 
        resultsCount: response.data.total,
        filters: Object.keys(filters).length 
      });

      addNotification({
        id: 'search-complete',
        type: 'success',
        message: `Found ${response.data.total} CVEs matching your criteria`
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      addNotification({
        id: 'search-error',
        type: 'error',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    performSearch();
  };

  const updateFilter = (key: keyof CVESearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setSearchResults(null);
    setPage(1);
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">CVE Search & Discovery</h1>
        <p className="text-gray-600 mt-2">Advanced search and filtering for comprehensive vulnerability discovery</p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="space-y-4">
          {/* Search Query */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Query</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search CVEs by ID, title, description, vendor, or product..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {/* Filters Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select
                multiple
                value={filters.severity || []}
                onChange={(e) => updateFilter('severity', Array.from(e.target.selectedOptions, option => option.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                size={5}
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="info">Info</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CVSS Score Range</label>
              <div className="space-y-2">
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  placeholder="Min CVSS"
                  value={filters.cvssScore?.min || ''}
                  onChange={(e) => updateFilter('cvssScore', { ...filters.cvssScore, min: parseFloat(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  placeholder="Max CVSS"
                  value={filters.cvssScore?.max || ''}
                  onChange={(e) => updateFilter('cvssScore', { ...filters.cvssScore, max: parseFloat(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
              <input
                type="text"
                placeholder="Filter by vendor"
                value={filters.vendor?.[0] || ''}
                onChange={(e) => updateFilter('vendor', e.target.value ? [e.target.value] : [])}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
              <input
                type="text"
                placeholder="Filter by product"
                value={filters.product?.[0] || ''}
                onChange={(e) => updateFilter('product', e.target.value ? [e.target.value] : [])}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Filters Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Published Date Range</label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={filters.publishedDate?.start || ''}
                  onChange={(e) => updateFilter('publishedDate', { ...filters.publishedDate, start: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  type="date"
                  value={filters.publishedDate?.end || ''}
                  onChange={(e) => updateFilter('publishedDate', { ...filters.publishedDate, end: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exploit Status</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.exploitAvailable === true}
                    onChange={(e) => updateFilter('exploitAvailable', e.target.checked ? true : undefined)}
                    className="mr-2"
                  />
                  Exploit Available
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.patchAvailable === true}
                    onChange={(e) => updateFilter('patchAvailable', e.target.checked ? true : undefined)}
                    className="mr-2"
                  />
                  Patch Available
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                multiple
                value={filters.status || []}
                onChange={(e) => updateFilter('status', Array.from(e.target.selectedOptions, option => option.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                size={4}
              >
                <option value="new">New</option>
                <option value="triaged">Triaged</option>
                <option value="investigating">Investigating</option>
                <option value="patching">Patching</option>
                <option value="testing">Testing</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <input
                type="text"
                placeholder="Filter by tags"
                value={filters.tags?.[0] || ''}
                onChange={(e) => updateFilter('tags', e.target.value ? [e.target.value] : [])}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4 border-t">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Clear All
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              Save Search
            </button>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
              Export Results
            </button>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchResults && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Search Results ({searchResults.total} CVEs found)
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
                      <h4 className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                        {cve.cveId}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(cve.scoring.severity)}`}>
                        {cve.scoring.severity.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        CVSS: {cve.scoring.cvssV3Score || cve.scoring.cvssV2Score || 'N/A'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-900 mb-2">{cve.title}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                      <span>Published: {new Date(cve.publishedDate).toLocaleDateString()}</span>
                      {cve.affectedProducts.length > 0 && (
                        <span>Affects: {cve.affectedProducts[0].vendor} {cve.affectedProducts[0].product}</span>
                      )}
                      {cve.exploitInfo.exploitAvailable && (
                        <span className="text-red-600 font-medium">Exploit Available</span>
                      )}
                      {cve.patchInfo.patchAvailable && (
                        <span className="text-green-600 font-medium">Patch Available</span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
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
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View Details
                    </button>
                    <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                      Assign
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
      )}

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