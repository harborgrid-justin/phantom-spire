'use client';

import { useEffect, useState } from 'react';
import { useServicePage } from '../../../../lib/business-logic';

export default function CryptocurrencyForensicsPage() {
  const [cryptoData, setCryptoData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const {
    notifications,
    addNotification,
    removeNotification,
    execute
  } = useServicePage('specialized-cryptocurrency');

  useEffect(() => {
    fetchCryptoData();
  }, []);

  const fetchCryptoData = async () => {
    try {
      setLoading(true);
      const response = await execute('getCryptocurrencyForensicsData');
      
      if (response.success && response.data) {
        setCryptoData(response.data);
        addNotification('success', 'Cryptocurrency forensics data loaded successfully');
      } else {
        const mockData = {
          walletsAnalyzed: 89,
          transactionsTracked: 2456,
          cryptocurrencies: ['Bitcoin', 'Ethereum', 'Monero', 'Litecoin', 'Bitcoin Cash'],
          suspiciousTransactions: 45,
          totalValueTracked: '$2.4M',
          investigationCases: [
            {
              id: 'crypto_001',
              type: 'Money Laundering',
              cryptocurrency: 'Bitcoin',
              amount: '$156,789',
              status: 'active',
              suspiciousAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
              createdAt: new Date(),
              findings: 'Multiple mixing service transactions detected'
            },
            {
              id: 'crypto_002', 
              type: 'Ransomware Payment',
              cryptocurrency: 'Monero',
              amount: '$45,230',
              status: 'completed',
              suspiciousAddress: '4AdUndXHHZ6cfufTMvppY6JwXNouMBzSkbLYfpAV5Usx3skxNgYeYTRJ5...',
              createdAt: new Date(),
              findings: 'Privacy coin used to obscure transaction trail'
            },
            {
              id: 'crypto_003',
              type: 'Dark Market Transaction',
              cryptocurrency: 'Ethereum',
              amount: '$23,450',
              status: 'under_review',
              suspiciousAddress: '0x742d35Cc6635C0532925a3b8D45C1b26c4F7212',
              createdAt: new Date(),
              findings: 'Smart contract interaction with known illicit service'
            }
          ],
          blockchainAnalysis: {
            addressClustering: 234,
            transactionGraphs: 56,
            mixingServices: 12,
            exchangeInteractions: 45,
            crossChainAnalysis: 8
          },
          complianceTools: {
            amlChecks: 1456,
            sanctionScreening: 234,
            pepsChecks: 89,
            riskScoring: 567
          }
        };
        setCryptoData(mockData);
        addNotification('info', 'Using demonstration data');
      }
    } catch (err) {
      addNotification('error', 'Failed to load cryptocurrency forensics data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCryptoIcon = (crypto: string) => {
    switch (crypto.toLowerCase()) {
      case 'bitcoin': return '₿';
      case 'ethereum': return 'Ξ';
      case 'monero': return 'ɱ';
      case 'litecoin': return 'Ł';
      default: return '🪙';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading cryptocurrency forensics data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ₿ Cryptocurrency Forensics
          </h1>
          <p className="text-gray-600">
            Cryptocurrency and blockchain forensic analysis
          </p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Start Crypto Analysis
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-blue-600">{cryptoData.walletsAnalyzed}</div>
          <div className="text-sm text-gray-600">Wallets Analyzed</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-green-600">{cryptoData.transactionsTracked}</div>
          <div className="text-sm text-gray-600">Transactions Tracked</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-red-600">{cryptoData.suspiciousTransactions}</div>
          <div className="text-sm text-gray-600">Suspicious Transactions</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-purple-600">{cryptoData.totalValueTracked}</div>
          <div className="text-sm text-gray-600">Total Value Tracked</div>
        </div>
      </div>

      {/* Supported Cryptocurrencies */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Supported Cryptocurrencies</h2>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-3">
            {(cryptoData.cryptocurrencies || []).map((crypto: string) => (
              <div key={crypto} className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                <span className="text-lg">{getCryptoIcon(crypto)}</span>
                <span className="text-sm font-medium">{crypto}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Investigation Cases */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Active Investigation Cases</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {(cryptoData.investigationCases || []).map((case_: any) => (
            <div key={case_.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">{getCryptoIcon(case_.cryptocurrency)}</span>
                    <h3 className="font-medium text-gray-900">{case_.type}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(case_.status)}`}>
                      {case_.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <div><strong>Amount:</strong> {case_.amount}</div>
                    <div><strong>Cryptocurrency:</strong> {case_.cryptocurrency}</div>
                    <div className="break-all"><strong>Address:</strong> {case_.suspiciousAddress}</div>
                  </div>
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    <strong>Findings:</strong> {case_.findings}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors">
                    Trace
                  </button>
                  <button className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors">
                    Analyze
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Blockchain Analysis Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Blockchain Analysis Metrics</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Object.entries(cryptoData.blockchainAnalysis || {}).map(([metric, count]) => (
                <div key={metric} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">
                    {metric.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </span>
                  <span className="font-medium text-gray-900">{count as number}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Compliance Tools Usage</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Object.entries(cryptoData.complianceTools || {}).map(([tool, count]) => (
                <div key={tool} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">
                    {tool.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </span>
                  <span className="font-medium text-gray-900">{count as number}</span>
                </div>
              ))}
            </div>
          </div>
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