'use client';

import { useEffect, useState } from 'react';
import { useServicePage } from '../../../../lib/business-logic';

export default function EvidencePreservationPage() {
  const [preservationData, setPreservationData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const {
    notifications,
    addNotification,
    removeNotification,
    execute
  } = useServicePage('evidence-preservation');

  useEffect(() => {
    fetchPreservationData();
  }, []);

  const fetchPreservationData = async () => {
    try {
      setLoading(true);
      const response = await execute('getEvidencePreservation');
      
      if (response.success && response.data) {
        setPreservationData(response.data);
        addNotification('success', 'Preservation data loaded successfully');
      } else {
        const mockData = {
          totalItems: 342,
          preservedItems: 315,
          integrityVerified: 298,
          pendingVerification: 17,
          preservationMethods: {
            cryptographic_hash: 156,
            digital_signature: 89,
            blockchain_notary: 45,
            traditional_seal: 52
          },
          complianceRate: 92.1,
          recentActivities: [
            { id: 1, action: 'Evidence sealed', item: 'Device_ABC123', timestamp: new Date() },
            { id: 2, action: 'Hash verified', item: 'Image_XYZ789', timestamp: new Date() }
          ]
        };
        setPreservationData(mockData);
        addNotification('info', 'Using demonstration data');
      }
    } catch (err) {
      addNotification('error', 'Failed to load preservation data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading preservation data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔒 Evidence Preservation
          </h1>
          <p className="text-gray-600">
            Digital evidence integrity and preservation management
          </p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Create Preservation Order
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-blue-600">{preservationData.totalItems}</div>
          <div className="text-sm text-gray-600">Total Evidence Items</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-green-600">{preservationData.preservedItems}</div>
          <div className="text-sm text-gray-600">Successfully Preserved</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-purple-600">{preservationData.integrityVerified}</div>
          <div className="text-sm text-gray-600">Integrity Verified</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-orange-600">{preservationData.complianceRate}%</div>
          <div className="text-sm text-gray-600">Compliance Rate</div>
        </div>
      </div>

      {/* Preservation Methods Chart */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Preservation Methods Distribution</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(preservationData.preservationMethods || {}).map(([method, count]) => (
              <div key={method} className="text-center p-4 bg-gray-50 rounded">
                <div className="text-xl font-bold text-gray-900">{count as number}</div>
                <div className="text-sm text-gray-600 capitalize">{method.replace('_', ' ')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Recent Preservation Activities</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {(preservationData.recentActivities || []).map((activity: any) => (
            <div key={activity.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-gray-900">{activity.action}</div>
                  <div className="text-sm text-gray-600">{activity.item}</div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(activity.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

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