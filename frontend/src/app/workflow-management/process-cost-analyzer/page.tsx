'use client';

import { useEffect, useState } from 'react';

interface ProcessCostAnalyzerData {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'completed' | 'failed' | 'draft' | 'suspended';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  description?: string;
  version?: string;
  completionRate?: number;
}

export default function ProcessCostAnalyzerPage() {
  const [data, setData] = useState<ProcessCostAnalyzerData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data
    setData([
      {
        id: '1',
        name: 'Sample Workflow 1',
        status: 'active',
        priority: 'high',
        createdAt: new Date().toISOString(),
        description: 'Cost analysis and resource optimization',
        version: '1.0.0',
        completionRate: 85
      },
      {
        id: '2',
        name: 'Sample Workflow 2',
        status: 'pending',
        priority: 'medium',
        createdAt: new Date().toISOString(),
        description: 'Cost analysis and resource optimization',
        version: '2.1.0',
        completionRate: 65
      }
    ]);
    setLoading(false);
  }, []);

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
          <span className="mr-3">💰</span>
          Process Cost Analyzer
        </h1>
        <p className="text-gray-600 mt-2">Cost analysis and resource optimization</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-blue-600">{data.length}</div>
          <div className="text-sm text-gray-600">Total Workflows</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-green-600">
            {data.filter(item => item.status === 'active').length}
          </div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-yellow-600">
            {data.filter(item => item.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Workflow Items</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {data.map((item) => (
            <div key={item.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                  <div className="text-xs text-gray-500 mt-1">
                    Status: {item.status} | Priority: {item.priority} | Version: {item.version}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{item.completionRate}%</div>
                  <div className="text-xs text-gray-500">Completion</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}