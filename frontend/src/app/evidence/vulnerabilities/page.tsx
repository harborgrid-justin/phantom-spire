'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api';
import { useServicePage } from '../../../lib/business-logic';
import { Evidence } from '../../../types/api';

interface VulnerabilityEvidence extends Evidence {
  cveId?: string;
  cvssScore: number;
  cvssVector?: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: 'rce' | 'privilege-escalation' | 'dos' | 'information-disclosure' | 'memory-corruption' | 'sql-injection' | 'xss' | 'csrf' | 'other';
  affectedProducts: {
    vendor: string;
    product: string;
    versions: string[];
  }[];
  exploitability: 'proof-of-concept' | 'functional' | 'weaponized' | 'none';
  exploitAvailable: boolean;
  patchAvailable: boolean;
  affectedSystems: string[];
  mitigations: {
    type: 'patch' | 'configuration' | 'workaround';
    description: string;
    effectiveness: number;
  }[];
  references: {
    type: 'advisory' | 'exploit' | 'patch' | 'analysis';
    url: string;
    title: string;
  }[];
  discoveredDate: string;
  publishedDate: string;
  patchDate?: string;
  exploitationStatus: 'not-exploited' | 'exploited-wild' | 'targeted' | 'mass-exploitation';
}

export default function VulnerabilitiesPage() {
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
  } = useServicePage('evidence-vulnerabilities');

  const [vulnerabilities, setVulnerabilities] = useState<VulnerabilityEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [patchedOnly, setPatchedOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVulnerabilities();
  }, [selectedSeverity, selectedCategory, selectedStatus, patchedOnly]);

  const fetchVulnerabilities = async () => {
    try {
      setLoading(true);
      
      // Use business logic first
      const businessResponse = await execute('getVulnerabilities', { 
        severity: selectedSeverity,
        category: selectedCategory,
        status: selectedStatus,
        patched: patchedOnly
      });
      
      if (businessResponse.success && businessResponse.data) {
        setVulnerabilities(businessResponse.data);
        addNotification('success', 'Vulnerabilities loaded successfully via business logic');
      } else {
        // Fallback to mock data for demo
        const mockVulnerabilities: VulnerabilityEvidence[] = [
          {
            id: 'vuln_001',
            type: 'vulnerability',
            description: 'Remote code execution vulnerability in Apache Log4j',
            cveId: 'CVE-2021-44228',
            cvssScore: 10.0,
            cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H',
            severity: 'critical',
            category: 'rce',
            affectedProducts: [
              { vendor: 'Apache', product: 'Log4j', versions: ['2.0-beta9', '2.14.1'] },
              { vendor: 'Various', product: 'Applications using Log4j', versions: ['Multiple'] }
            ],
            exploitability: 'weaponized',
            exploitAvailable: true,
            patchAvailable: true,
            affectedSystems: ['WEB-SERVER-01', 'APP-SERVER-02', 'API-GATEWAY-01'],
            mitigations: [
              { type: 'patch', description: 'Upgrade to Log4j 2.15.0 or later', effectiveness: 100 },
              { type: 'configuration', description: 'Set log4j2.formatMsgNoLookups=true', effectiveness: 95 },
              { type: 'workaround', description: 'Remove JndiLookup class from classpath', effectiveness: 90 }
            ],
            references: [
              { type: 'advisory', url: 'https://nvd.nist.gov/vuln/detail/CVE-2021-44228', title: 'NVD Advisory' },
              { type: 'patch', url: 'https://apache.org/security/log4j', title: 'Apache Security Advisory' },
              { type: 'exploit', url: 'https://github.com/example/exploit', title: 'Public Exploit Code' }
            ],
            discoveredDate: new Date('2021-11-24').toISOString(),
            publishedDate: new Date('2021-12-09').toISOString(),
            patchDate: new Date('2021-12-10').toISOString(),
            exploitationStatus: 'mass-exploitation',
            createdAt: new Date('2021-12-09').toISOString(),
            updatedAt: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 'vuln_002',
            type: 'vulnerability',
            description: 'SQL injection vulnerability in custom web application',
            cvssScore: 8.8,
            cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H',
            severity: 'high',
            category: 'sql-injection',
            affectedProducts: [
              { vendor: 'Internal', product: 'Customer Portal', versions: ['1.0', '1.1', '1.2'] }
            ],
            exploitability: 'functional',
            exploitAvailable: false,
            patchAvailable: true,
            affectedSystems: ['PORTAL-01', 'PORTAL-02'],
            mitigations: [
              { type: 'patch', description: 'Apply security update v1.3', effectiveness: 100 },
              { type: 'configuration', description: 'Enable SQL injection protection', effectiveness: 85 },
              { type: 'workaround', description: 'Disable vulnerable endpoint', effectiveness: 100 }
            ],
            references: [
              { type: 'analysis', url: 'https://internal.security/vuln-002', title: 'Internal Security Analysis' },
              { type: 'patch', url: 'https://internal.repo/patch-v1.3', title: 'Security Update v1.3' }
            ],
            discoveredDate: new Date(Date.now() - 86400000 * 14).toISOString(),
            publishedDate: new Date(Date.now() - 86400000 * 10).toISOString(),
            patchDate: new Date(Date.now() - 86400000 * 7).toISOString(),
            exploitationStatus: 'not-exploited',
            createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
            updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
          },
          {
            id: 'vuln_003',
            type: 'vulnerability',
            description: 'Buffer overflow in network service daemon',
            cvssScore: 7.5,
            cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H',
            severity: 'high',
            category: 'memory-corruption',
            affectedProducts: [
              { vendor: 'SystemCorp', product: 'Network Daemon', versions: ['2.1.0', '2.1.1'] }
            ],
            exploitability: 'proof-of-concept',
            exploitAvailable: true,
            patchAvailable: false,
            affectedSystems: ['NET-SERVICE-01', 'NET-SERVICE-02', 'NET-SERVICE-03'],
            mitigations: [
              { type: 'configuration', description: 'Enable ASLR and DEP protections', effectiveness: 70 },
              { type: 'workaround', description: 'Restrict network access to service', effectiveness: 90 },
              { type: 'configuration', description: 'Monitor for exploitation attempts', effectiveness: 60 }
            ],
            references: [
              { type: 'analysis', url: 'https://security.vendor.com/buffer-overflow', title: 'Vendor Analysis' },
              { type: 'exploit', url: 'https://exploit-db.com/12345', title: 'PoC Exploit Code' }
            ],
            discoveredDate: new Date(Date.now() - 86400000 * 5).toISOString(),
            publishedDate: new Date(Date.now() - 86400000 * 3).toISOString(),
            exploitationStatus: 'targeted',
            createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
            updatedAt: new Date(Date.now() - 1800000).toISOString()
          }
        ];
        
        setVulnerabilities(mockVulnerabilities);
        addNotification('info', 'Vulnerabilities loaded from demo data (business logic unavailable)');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch vulnerabilities';
      setError(errorMsg);
      addNotification('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const filteredVulnerabilities = vulnerabilities.filter(vuln => {
    const matchesSearch = searchTerm === '' || 
      vuln.cveId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vuln.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vuln.affectedProducts.some(p => p.product.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSeverity = selectedSeverity === 'all' || vuln.severity === selectedSeverity;
    const matchesCategory = selectedCategory === 'all' || vuln.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || vuln.exploitationStatus === selectedStatus;
    const matchesPatched = !patchedOnly || vuln.patchAvailable;
    
    return matchesSearch && matchesSeverity && matchesCategory && matchesStatus && matchesPatched;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'rce': 'bg-red-100 text-red-800',
      'privilege-escalation': 'bg-orange-100 text-orange-800',
      'sql-injection': 'bg-purple-100 text-purple-800',
      'xss': 'bg-yellow-100 text-yellow-800',
      'memory-corruption': 'bg-pink-100 text-pink-800',
      'dos': 'bg-gray-100 text-gray-800',
      'information-disclosure': 'bg-blue-100 text-blue-800',
      'csrf': 'bg-indigo-100 text-indigo-800',
      'other': 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getExploitStatusColor = (status: string) => {
    switch (status) {
      case 'mass-exploitation': return 'bg-red-100 text-red-800';
      case 'exploited-wild': return 'bg-orange-100 text-orange-800';
      case 'targeted': return 'bg-yellow-100 text-yellow-800';
      case 'not-exploited': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading vulnerabilities...</div>
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
          <h1 className="text-3xl font-bold text-gray-900">Vulnerability Evidence</h1>
          <p className="text-gray-600 mt-2">Track and manage security vulnerabilities and their remediation status</p>
        </div>
        <div className="flex space-x-2">
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
            Add Vulnerability
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Scan Systems
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severity
            </label>
            <select 
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="info">Informational</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Categories</option>
              <option value="rce">Remote Code Execution</option>
              <option value="sql-injection">SQL Injection</option>
              <option value="xss">Cross-Site Scripting</option>
              <option value="privilege-escalation">Privilege Escalation</option>
              <option value="memory-corruption">Memory Corruption</option>
              <option value="dos">Denial of Service</option>
              <option value="information-disclosure">Information Disclosure</option>
              <option value="csrf">CSRF</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exploitation Status
            </label>
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Statuses</option>
              <option value="not-exploited">Not Exploited</option>
              <option value="targeted">Targeted</option>
              <option value="exploited-wild">Exploited in Wild</option>
              <option value="mass-exploitation">Mass Exploitation</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search & Filters
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search CVE, product..."
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={patchedOnly}
                  onChange={(e) => setPatchedOnly(e.target.checked)}
                  className="mr-2"
                />
                Patches Available
              </label>
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchVulnerabilities}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors w-full"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Vulnerability Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-red-600">
            {filteredVulnerabilities.length}
          </div>
          <div className="text-sm text-gray-600">Total Vulns</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-orange-600">
            {filteredVulnerabilities.filter(v => v.severity === 'critical').length}
          </div>
          <div className="text-sm text-gray-600">Critical</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-green-600">
            {filteredVulnerabilities.filter(v => v.patchAvailable).length}
          </div>
          <div className="text-sm text-gray-600">Patches Available</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-yellow-600">
            {filteredVulnerabilities.filter(v => v.exploitAvailable).length}
          </div>
          <div className="text-sm text-gray-600">Exploits Available</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-purple-600">
            {(filteredVulnerabilities.reduce((sum, v) => sum + v.cvssScore, 0) / Math.max(filteredVulnerabilities.length, 1)).toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Avg CVSS Score</div>
        </div>
      </div>

      {/* Vulnerabilities List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredVulnerabilities.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="text-lg font-medium mb-2">No Vulnerabilities Found</h3>
            <p>Add vulnerability evidence or adjust your search criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredVulnerabilities.map((vuln) => (
              <div key={vuln.id} className="p-6 hover:bg-gray-50">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {vuln.cveId || `VULN-${vuln.id.slice(-3)}`}
                      </h3>
                      <span className="text-2xl font-bold text-gray-700">{vuln.cvssScore.toFixed(1)}</span>
                    </div>
                    <p className="text-sm text-gray-600">{vuln.description}</p>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(vuln.severity)}`}>
                      {vuln.severity.toUpperCase()}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(vuln.category)}`}>
                      {vuln.category.replace('-', ' ').toUpperCase()}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getExploitStatusColor(vuln.exploitationStatus)}`}>
                      {vuln.exploitationStatus.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* CVSS and Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-500">CVSS Score:</span>
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${
                            vuln.cvssScore >= 9 ? 'bg-red-500' :
                            vuln.cvssScore >= 7 ? 'bg-orange-500' :
                            vuln.cvssScore >= 4 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${vuln.cvssScore * 10}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{vuln.cvssScore.toFixed(1)}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Affected Systems:</span>
                    <div className="font-medium text-gray-900">{vuln.affectedSystems.length}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Exploitability:</span>
                    <div className={`font-medium ${
                      vuln.exploitability === 'weaponized' ? 'text-red-600' :
                      vuln.exploitability === 'functional' ? 'text-orange-600' :
                      vuln.exploitability === 'proof-of-concept' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {vuln.exploitability.replace('-', ' ').toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Status:</span>
                    <div className="flex space-x-2">
                      {vuln.exploitAvailable && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Exploit</span>
                      )}
                      {vuln.patchAvailable && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Patch</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Affected Products */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Affected Products</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {vuln.affectedProducts.map((product, index) => (
                      <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                        <div className="font-medium text-gray-900">{product.vendor} {product.product}</div>
                        <div className="text-gray-600 text-xs">Versions: {product.versions.join(', ')}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mitigations */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Mitigations</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {vuln.mitigations.map((mitigation, index) => (
                      <div key={index} className="bg-blue-50 p-2 rounded text-sm">
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-xs px-2 py-1 rounded ${
                            mitigation.type === 'patch' ? 'bg-green-100 text-green-800' :
                            mitigation.type === 'configuration' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {mitigation.type}
                          </span>
                          <span className="text-xs text-blue-600 font-medium">{mitigation.effectiveness}%</span>
                        </div>
                        <div className="text-gray-900">{mitigation.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-500">Discovered:</span>
                    <div className="font-medium text-gray-900">{new Date(vuln.discoveredDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Published:</span>
                    <div className="font-medium text-gray-900">{new Date(vuln.publishedDate).toLocaleDateString()}</div>
                  </div>
                  {vuln.patchDate && (
                    <div>
                      <span className="text-gray-500">Patched:</span>
                      <div className="font-medium text-gray-900">{new Date(vuln.patchDate).toLocaleDateString()}</div>
                    </div>
                  )}
                </div>

                {/* References */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">References ({vuln.references.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {vuln.references.slice(0, 3).map((ref, index) => (
                      <a
                        key={index}
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-gray-100 text-blue-600 hover:bg-blue-50 px-2 py-1 rounded inline-flex items-center"
                      >
                        {ref.type} ↗
                      </a>
                    ))}
                    {vuln.references.length > 3 && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        +{vuln.references.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                    View Details
                  </button>
                  <button className="text-green-600 hover:text-green-900 text-sm font-medium">
                    Track Remediation
                  </button>
                  <button className="text-purple-600 hover:text-purple-900 text-sm font-medium">
                    Risk Assessment
                  </button>
                  <button className="text-orange-600 hover:text-orange-900 text-sm font-medium">
                    Assign Priority
                  </button>
                </div>
              </div>
            ))}
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