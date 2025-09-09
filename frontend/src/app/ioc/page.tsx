'use client';

import React, { useState, useEffect, useCallback } from 'react'
import {
  Search,
  Plus,
  Download,
  Trash2,
  Eye,
  Shield,
  AlertTriangle,
  Copy,
  Archive,
  Tag,
  ThumbsUp,
  Zap,
  Target,
  TrendingUp
} from 'lucide-react';

// Import the IOC Core - now using TypeScript implementation
import { IOCCore, IOCType, Severity, IOCContext } from 'phantom-ioc-core';

interface EnhancedIOC {
  id: string;
  indicator_type: IOCType;
  value: string;
  confidence: number;
  severity: Severity;
  source: string;
  timestamp: Date;
  tags: string[];
  context: IOCContext;
  status: 'active' | 'archived' | 'false_positive';
  analysis?: {
    threat_actors: string[];
    campaigns: string[];
    malware_families: string[];
    attack_vectors: string[];
    impact_assessment: {
      business_impact: number;
      technical_impact: number;
      operational_impact: number;
      overall_risk: number;
    };
    recommendations: string[];
  };
}

interface IOCFilter {
  type?: string;
  severity?: string;
  confidence?: string;
  status?: 'active' | 'archived' | 'false_positive';
  source?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
}

export default function EnhancedIOCManagementConsole() {
  const [indicators, setIndicators] = useState<EnhancedIOC[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<IOCFilter>({});
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [iocCore, setIocCore] = useState<IOCCore | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [bulkMenuOpen, setBulkMenuOpen] = useState(false);

  // Initialize IOC Core
  useEffect(() => {
    initializeIOCCore();
  }, []);

  const initializeIOCCore = async () => {
    try {
      setLoading(true);
      // Initialize the IOC Core (this would normally be done once and shared)
      const core = await IOCCore.new();
      setIocCore(core);
    } catch (error) {
      console.error('Failed to initialize IOC Core:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load IOCs from API
  const loadIOCs = useCallback(async (page = 1) => {
    if (!iocCore) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(searchQuery && { search: searchQuery }),
        ...(filters.type && { type: filters.type }),
        ...(filters.severity && { severity: filters.severity }),
        ...(filters.confidence && { minConfidence: filters.confidence }),
        ...(filters.status && { status: filters.status })
      });

      const response = await fetch(`/api/iocs?${params}`);
      if (!response.ok) throw new Error('Failed to fetch IOCs');

      const data = await response.json();
      setIndicators(data.iocs);
    } catch (error) {
      console.error('Failed to load IOCs:', error);
    } finally {
      setLoading(false);
    }
  }, [iocCore, searchQuery, filters]);

  // Load statistics
  const loadStatistics = useCallback(async () => {
    try {
      const response = await fetch('/api/iocs/stats');
      if (response.ok) {
        const stats = await response.json();
        // Statistics loaded but not stored in state for now
        console.log('IOC Statistics:', stats);
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  }, []);

  // Load data when core is ready
  useEffect(() => {
    if (iocCore) {
      loadIOCs();
      loadStatistics();
    }
  }, [iocCore, loadIOCs, loadStatistics]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilters: Partial<IOCFilter>) => {
    setFilters({ ...filters, ...newFilters });
  };

  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case Severity.Critical: return 'bg-red-100 text-red-800 border-red-200';
      case Severity.High: return 'bg-orange-100 text-orange-800 border-orange-200';
      case Severity.Medium: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case Severity.Low: return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-100 text-green-800 border-green-200';
    if (confidence >= 0.7) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (confidence >= 0.5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getRiskColor = (risk: number) => {
    if (risk >= 0.8) return 'bg-red-100 text-red-800';
    if (risk >= 0.6) return 'bg-orange-100 text-orange-800';
    if (risk >= 0.4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const handleRowSelect = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id)
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === indicators.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(indicators.map(ioc => ioc.id));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const tabLabels = [
    { label: 'All IOCs', count: indicators.length },
    { label: 'High Risk', count: indicators.filter(i => i.analysis?.impact_assessment?.overall_risk && i.analysis.impact_assessment.overall_risk >= 0.7).length },
    { label: 'Analyzed', count: indicators.filter(i => i.analysis).length },
    { label: 'Unanalyzed', count: indicators.filter(i => !i.analysis).length },
    { label: 'Archived', count: 0 }
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Enhanced IOC Management Console
            {iocCore && <span className="text-sm text-green-600 ml-2">✓ Core Active</span>}
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddDialog(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add IOC
            </button>
            <button
              onClick={() => loadIOCs()}
              disabled={loading}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
            >
              <Zap className="h-4 w-4" />
              {loading ? 'Processing...' : 'Re-analyze'}
            </button>
            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search IOCs by value, tags, threat actors, malware families..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <select
              value={filters.type || ''}
              onChange={(e) => handleFilterChange({ type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="ip">IP Address</option>
              <option value="domain">Domain</option>
              <option value="url">URL</option>
              <option value="hash">SHA256 Hash</option>
              <option value="email">Email</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={filters.severity || ''}
              onChange={(e) => handleFilterChange({ severity: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={filters.confidence || ''}
              onChange={(e) => handleFilterChange({ confidence: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Confidence</option>
              <option value="0.9">Very High (≥90%)</option>
              <option value="0.7">High (≥70%)</option>
              <option value="0.5">Medium (≥50%)</option>
              <option value="0.0">All</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 mb-6">
        <div className="flex space-x-8 px-6">
          {tabLabels.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === index
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              <span className={`px-2 py-1 rounded-full text-xs ${
                activeTab === index ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedRows.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mx-6 mb-6 flex justify-between items-center">
          <span className="text-blue-800">
            {selectedRows.length} IOC{selectedRows.length !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <div className="relative">
              <button
                onClick={() => setBulkMenuOpen(!bulkMenuOpen)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Bulk Actions
              </button>
              {bulkMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <div className="py-1">
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2">
                      <Archive className="h-4 w-4" />
                      Archive Selected
                    </button>
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Add Tags
                    </button>
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2">
                      <ThumbsUp className="h-4 w-4" />
                      Update Confidence
                    </button>
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Update Severity
                    </button>
                    <hr className="my-1" />
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Export as STIX
                    </button>
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-red-600">
                      <Trash2 className="h-4 w-4" />
                      Delete Selected
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => setSelectedRows([])}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="flex-1 bg-white mx-6 mb-6 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading && (
          <div className="h-1 bg-blue-200">
            <div className="h-full bg-blue-600 animate-pulse"></div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === indicators.length && indicators.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Indicator Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Threat Actors</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Malware Families</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {indicators.map((ioc) => (
                <tr key={ioc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(ioc.id)}
                      onChange={() => handleRowSelect(ioc.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      {ioc.indicator_type.toString().split('::').pop()?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-gray-900 max-w-xs truncate">
                        {ioc.value.length > 50 ? `${ioc.value.substring(0, 50)}...` : ioc.value}
                      </span>
                      <button
                        onClick={() => copyToClipboard(ioc.value)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(ioc.severity)}`}>
                      {ioc.severity.toString().split('::').pop()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getConfidenceColor(ioc.confidence)}`}>
                      {(ioc.confidence * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {ioc.analysis ? (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(ioc.analysis.impact_assessment.overall_risk)}`}>
                        {(ioc.analysis.impact_assessment.overall_risk * 100).toFixed(0)}%
                      </span>
                    ) : (
                      <span className="text-gray-400">Not analyzed</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {ioc.analysis && ioc.analysis.threat_actors.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {ioc.analysis.threat_actors.slice(0, 2).map((actor, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                            {actor}
                          </span>
                        ))}
                        {ioc.analysis.threat_actors.length > 2 && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                            +{ioc.analysis.threat_actors.length - 2}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">None identified</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {ioc.analysis && ioc.analysis.malware_families.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {ioc.analysis.malware_families.slice(0, 2).map((family, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                            {family}
                          </span>
                        ))}
                        {ioc.analysis.malware_families.length > 2 && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                            +{ioc.analysis.malware_families.length - 2}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">None identified</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="text-gray-400 hover:text-blue-600">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-green-600">
                        <TrendingUp className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {indicators.length === 0 && !loading && (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No IOCs Found</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first indicator of compromise.</p>
            <button
              onClick={() => setShowAddDialog(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add IOC
            </button>
          </div>
        )}
      </div>

      {/* Add IOC Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Add New IOC</h2>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IOC Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select type...</option>
                    <option value="ip">IP Address</option>
                    <option value="domain">Domain</option>
                    <option value="url">URL</option>
                    <option value="hash">SHA256 Hash</option>
                    <option value="email">Email</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="medium">Medium</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">IOC Value</label>
                  <textarea
                    rows={3}
                    placeholder="Enter the indicator value..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Describe the threat context..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                  <input
                    type="text"
                    placeholder="e.g., VirusTotal, Internal"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <input
                    type="text"
                    placeholder="malware, apt, phishing (comma-separated)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowAddDialog(false)}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Add IOC
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
