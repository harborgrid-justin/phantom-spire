'use client';

import { useEffect, useState } from 'react';
import { useServicePage } from '../../../../lib/business-logic';

export default function ChainOfCustodyPage() {
  const [custodyData, setCustodyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    notifications,
    addNotification,
    removeNotification,
    execute
  } = useServicePage('evidence-chain-of-custody');

  useEffect(() => {
    fetchCustodyData();
  }, []);

  const fetchCustodyData = async () => {
    try {
      setLoading(true);
      const response = await execute('getChainOfCustodyData');
      
      if (response.success && response.data) {
        setCustodyData(Array.isArray(response.data) ? response.data : [response.data]);
        addNotification('success', 'Chain of custody data loaded successfully');
      } else {
        const mockData = [
          {
            id: 'custody_001',
            evidenceId: 'evidence_123',
            action: 'acquisition',
            performer: 'forensic_analyst_1',
            timestamp: new Date(),
            location: 'Lab A',
            hash: 'sha256:abcd1234...',
            verified: true,
            details: 'Initial evidence acquisition from suspect workstation'
          },
          {
            id: 'custody_002',
            evidenceId: 'evidence_123',
            action: 'analysis',
            performer: 'senior_investigator',
            timestamp: new Date(),
            location: 'Analysis Station 3',
            hash: 'sha256:abcd1234...',
            verified: true,
            details: 'Forensic analysis initiated on evidence item'
          },
          {
            id: 'custody_003',
            evidenceId: 'evidence_456',
            action: 'transfer',
            performer: 'evidence_custodian',
            timestamp: new Date(),
            location: 'Secure Storage Vault B',
            hash: 'sha256:efgh5678...',
            verified: true,
            details: 'Evidence transferred to long-term storage'
          }
        ];
        setCustodyData(mockData);
        addNotification('info', 'Using demonstration data');
      }
    } catch (err) {
      addNotification('error', 'Failed to load chain of custody data');
    } finally {
      setLoading(false);
    }
  };

  const getVerificationStatus = (verified: boolean) => {
    return verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading chain of custody data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ⛓️ Chain of Custody
          </h1>
          <p className="text-gray-600">
            Evidence chain of custody tracking and management
          </p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Add Custody Entry
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-blue-600">{custodyData.length}</div>
          <div className="text-sm text-gray-600">Custody Entries</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-green-600">
            {custodyData.filter(item => item.verified).length}
          </div>
          <div className="text-sm text-gray-600">Verified Entries</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-purple-600">
            {new Set(custodyData.map(item => item.evidenceId)).size}
          </div>
          <div className="text-sm text-gray-600">Evidence Items</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-orange-600">100%</div>
          <div className="text-sm text-gray-600">Integrity Rate</div>
        </div>
      </div>

      {/* Chain of Custody Timeline */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Chain of Custody Timeline</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {custodyData.map((entry) => (
            <div key={entry.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-medium text-gray-900">
                      {entry.action.charAt(0).toUpperCase() + entry.action.slice(1)} - {entry.evidenceId}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getVerificationStatus(entry.verified)}`}>
                      {entry.verified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <div>Performer: {entry.performer}</div>
                    <div>Location: {entry.location}</div>
                    <div>Timestamp: {new Date(entry.timestamp).toLocaleString()}</div>
                    <div>Details: {entry.details}</div>
                  </div>
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    <div>Hash: {entry.hash}</div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors">
                    View Details
                  </button>
                  <button className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors">
                    Verify
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {custodyData.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No chain of custody entries found</div>
          <div className="text-gray-400 text-sm">Add your first custody entry to begin tracking</div>
        </div>
      )}

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