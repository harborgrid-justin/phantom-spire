'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Settings } from 'lucide-react';

interface ConfigurationData {
  status: string;
  metrics: {
    total: number;
    active: number;
    resolved: number;
  };
  lastUpdate: string;
}

const ConfigurationPage = () => {
  const [data, setData] = useState<ConfigurationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/xdr/configuration', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const result = await response.json();
      setData(result.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Mock data for demonstration
      setData({
        status: 'operational',
        metrics: {
          total: Math.floor(Math.random() * 1000),
          active: Math.floor(Math.random() * 100),
          resolved: Math.floor(Math.random() * 500)
        },
        lastUpdate: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleGoBack = () => {
    window.history.back();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={handleGoBack}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 mr-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        <h1 className="text-3xl font-bold flex-1">
          Configuration
        </h1>
        <button
          onClick={handleRefresh}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 mr-2"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
        <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
          <Settings className="w-4 h-4 mr-2" />
          Configure
        </button>
      </div>

      <p className="text-gray-600 mb-6">
        XDR system configuration and settings
      </p>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <div className="text-yellow-800">
            Unable to connect to live data. Showing demo data.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow border">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Overview
              </h2>
              
              {data && (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Metric</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4">Status</td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {data.status || 'Active'}
                          </span>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Total Items</td>
                        <td className="py-3 px-4 text-right">
                          {data.metrics?.total || 'N/A'}
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Active</td>
                        <td className="py-3 px-4 text-right">
                          {data.metrics?.active || 'N/A'}
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Resolved</td>
                        <td className="py-3 px-4 text-right">
                          {data.metrics?.resolved || 'N/A'}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Last Update</td>
                        <td className="py-3 px-4 text-right">
                          {data.lastUpdate ? new Date(data.lastUpdate).toLocaleString() : 'N/A'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow border">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                  Execute Action
                </button>
                <button className="w-full border border-gray-300 py-2 px-4 rounded-md hover:bg-gray-50">
                  View History
                </button>
                <button className="w-full border border-gray-300 py-2 px-4 rounded-md hover:bg-gray-50">
                  Export Data
                </button>
                <button className="w-full border border-gray-300 py-2 px-4 rounded-md hover:bg-gray-50">
                  View Reports
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Module Information
              </h2>
              <p className="text-gray-600 text-sm">
                This module provides xdr system configuration and settings. 
                Use the controls above to interact with the system and configure settings as needed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationPage;
