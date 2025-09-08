'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '../../lib/api';
import { threatIntelligenceNavigation, threatIntelligenceCategories } from './index';

interface DashboardMetrics {
  totalIOCs: number;
  activeThreats: number;
  resolvedIncidents: number;
  threatLevel: 'critical' | 'high' | 'medium' | 'low';
  feedsOperational: number;
  totalFeeds: number;
  securityScore: number;
  lastUpdate: Date;
}

interface ThreatTrendData {
  date: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}

interface IOCTypeData {
  type: string;
  count: number;
  trend: number;
  color: string;
}

interface RecentActivity {
  id: string;
  type: 'ioc' | 'incident' | 'alert' | 'investigation';
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: Date;
  user: string;
}

interface TopThreatActor {
  id: string;
  name: string;
  aliases: string[];
  associatedIOCs: number;
  lastActivity: Date;
  severity: 'critical' | 'high' | 'medium' | 'low';
  targetSectors: string[];
}

interface CampaignActivity {
  id: string;
  name: string;
  description: string;
  indicators: number;
  firstSeen: Date;
  lastSeen: Date;
  countries: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export default function ThreatIntelligenceDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [threatTrends, setThreatTrends] = useState<ThreatTrendData[]>([]);
  const [iocTypes, setIOCTypes] = useState<IOCTypeData[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [topActors, setTopActors] = useState<TopThreatActor[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    loadDashboardData();
    
    if (autoRefresh) {
      const interval = setInterval(loadDashboardData, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      await Promise.all([
        loadMetrics(),
        loadThreatTrends(),
        loadIOCTypes(),
        loadRecentActivity(),
        loadTopActors(),
        loadCampaigns()
      ]);
      
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    setMetrics({
      totalIOCs: 45678,
      activeThreats: 23,
      resolvedIncidents: 156,
      threatLevel: 'medium',
      feedsOperational: 12,
      totalFeeds: 15,
      securityScore: 87,
      lastUpdate: new Date()
    });
  };

  const loadThreatTrends = async (): Promise<void> => {
    const trends: ThreatTrendData[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      trends.push({
        date: date.toISOString().split('T')[0],
        critical: Math.floor(Math.random() * 5) + 1,
        high: Math.floor(Math.random() * 15) + 5,
        medium: Math.floor(Math.random() * 30) + 15,
        low: Math.floor(Math.random() * 50) + 25,
        total: 0
      });
    }
    
    trends.forEach(trend => {
      trend.total = trend.critical + trend.high + trend.medium + trend.low;
    });
    
    setThreatTrends(trends);
  };

  const loadIOCTypes = async (): Promise<void> => {
    const types: IOCTypeData[] = [
      { type: 'ip', count: 15234, trend: 5.2, color: '#1976d2' },
      { type: 'domain', count: 8765, trend: -2.1, color: '#388e3c' },
      { type: 'url', count: 12456, trend: 8.7, color: '#f57c00' },
      { type: 'hash_sha256', count: 6543, trend: 3.4, color: '#7b1fa2' },
      { type: 'email', count: 3210, trend: -1.5, color: '#d32f2f' },
      { type: 'file_name', count: 2107, trend: 12.3, color: '#0288d1' }
    ];
    
    setIOCTypes(types);
  };

  const loadRecentActivity = async (): Promise<void> => {
    const activities: RecentActivity[] = [
      {
        id: '1',
        type: 'alert',
        title: 'High-severity IOC detected',
        description: 'Malicious IP 192.168.1.100 detected in network traffic',
        severity: 'high',
        timestamp: new Date(Date.now() - 300000),
        user: 'Security Analyst'
      },
      {
        id: '2',
        type: 'incident',
        title: 'New incident created',
        description: 'INC-2024-0045: Suspected APT activity',
        severity: 'critical',
        timestamp: new Date(Date.now() - 600000),
        user: 'John Smith'
      },
      {
        id: '3',
        type: 'ioc',
        title: 'IOC enrichment completed',
        description: 'Domain analysis for malicious-site.com completed',
        severity: 'medium',
        timestamp: new Date(Date.now() - 900000),
        user: 'Enrichment Engine'
      },
      {
        id: '4',
        type: 'investigation',
        title: 'Investigation updated',
        description: 'Added 3 new indicators to Campaign Lazarus',
        severity: 'medium',
        timestamp: new Date(Date.now() - 1200000),
        user: 'Threat Researcher'
      }
    ];
    
    setRecentActivity(activities);
  };

  const loadTopActors = async (): Promise<void> => {
    const actors: TopThreatActor[] = [
      {
        id: '1',
        name: 'Lazarus Group',
        aliases: ['APT38', 'Hidden Cobra'],
        associatedIOCs: 1234,
        lastActivity: new Date(Date.now() - 86400000),
        severity: 'critical',
        targetSectors: ['Financial', 'Government', 'Cryptocurrency']
      },
      {
        id: '2',
        name: 'APT29',
        aliases: ['Cozy Bear', 'The Dukes'],
        associatedIOCs: 987,
        lastActivity: new Date(Date.now() - 172800000),
        severity: 'high',
        targetSectors: ['Government', 'Healthcare', 'Energy']
      },
      {
        id: '3',
        name: 'FIN7',
        aliases: ['Carbanak Group'],
        associatedIOCs: 756,
        lastActivity: new Date(Date.now() - 259200000),
        severity: 'high',
        targetSectors: ['Retail', 'Hospitality', 'Financial']
      }
    ];
    
    setTopActors(actors);
  };

  const loadCampaigns = async (): Promise<void> => {
    const campaignData: CampaignActivity[] = [
      {
        id: '1',
        name: 'Operation Sharpshooter',
        description: 'Targeted attacks against defense contractors',
        indicators: 156,
        firstSeen: new Date(Date.now() - 2592000000),
        lastSeen: new Date(Date.now() - 86400000),
        countries: ['US', 'GB', 'DE', 'FR'],
        severity: 'high'
      },
      {
        id: '2',
        name: 'CloudHopper Campaign',
        description: 'Supply chain attacks via MSPs',
        indicators: 89,
        firstSeen: new Date(Date.now() - 5184000000),
        lastSeen: new Date(Date.now() - 172800000),
        countries: ['JP', 'KR', 'SG', 'AU'],
        severity: 'critical'
      }
    ];
    
    setCampaigns(campaignData);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-800 bg-red-100 border-red-200';
      case 'high': return 'text-orange-800 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-800 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-800 bg-green-100 border-green-200';
      default: return 'text-gray-800 bg-gray-100 border-gray-200';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'alert': return '⚠️';
      case 'incident': return '🚨';
      case 'ioc': return '🔍';
      case 'investigation': return '🕵️';
      default: return '📋';
    }
  };

  if (loading && !metrics) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg font-semibold mb-4">Loading Threat Intelligence Dashboard</div>
            <div className="w-64 bg-gray-200 rounded-full h-2 mb-4">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
            <div className="text-sm text-gray-600">
              Aggregating threat data from multiple sources...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-full overflow-auto">
      {/* Dashboard Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🛡️ Threat Intelligence Dashboard
          </h1>
          <p className="text-gray-600">
            Real-time threat landscape overview • Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              autoRefresh 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-gray-100 text-gray-800 border border-gray-200'
            }`}
          >
            🔄 {autoRefresh ? 'Auto Refresh' : 'Manual'}
          </button>
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            🔄 Refresh
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            📥 Export Report
          </button>
        </div>
      </div>

      {/* Threat Intelligence Navigation */}
      <div className="bg-white rounded-lg shadow-md border p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">🎯 Threat Intelligence Modules</h2>
            <p className="text-gray-600 mt-1">Access all 48 specialized threat intelligence pages</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{threatIntelligenceNavigation.length}</div>
            <div className="text-sm text-gray-500">Total Modules</div>
          </div>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(threatIntelligenceCategories).map(([categoryKey, category]) => {
            const categoryPages = threatIntelligenceNavigation.filter(page => page.category === categoryKey);
            const colorClasses = {
              blue: 'bg-blue-50 border-blue-200 text-blue-800',
              green: 'bg-green-50 border-green-200 text-green-800',
              purple: 'bg-purple-50 border-purple-200 text-purple-800',
              orange: 'bg-orange-50 border-orange-200 text-orange-800',
              red: 'bg-red-50 border-red-200 text-red-800',
              cyan: 'bg-cyan-50 border-cyan-200 text-cyan-800'
            };

            return (
              <div key={categoryKey} className={`border rounded-lg p-4 ${colorClasses[category.color as keyof typeof colorClasses] || 'bg-gray-50 border-gray-200 text-gray-800'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{category.icon}</span>
                    <div>
                      <h3 className="font-semibold text-sm">{category.name}</h3>
                      <p className="text-xs opacity-75 mt-1">{category.description}</p>
                    </div>
                  </div>
                  <div className="text-lg font-bold">{categoryPages.length}</div>
                </div>
                
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {categoryPages.slice(0, 4).map((page) => (
                    <Link 
                      key={page.id} 
                      href={page.path}
                      className="block text-xs hover:underline py-1 opacity-90 hover:opacity-100 transition-opacity"
                    >
                      {page.icon} {page.title.replace(/^[^\s]+ /, '')}
                    </Link>
                  ))}
                  {categoryPages.length > 4 && (
                    <div className="text-xs opacity-60 py-1">
                      ... and {categoryPages.length - 4} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-blue-600">
                {metrics ? formatNumber(metrics.totalIOCs) : '—'}
              </div>
              <div className="text-sm text-gray-600">Total IOCs</div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-xl">🔒</span>
            </div>
          </div>
          <div className="flex items-center mt-2">
            <span className="text-green-600 text-sm">📈 +12.3% from last week</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-red-600">
                {metrics?.activeThreats || '—'}
              </div>
              <div className="text-sm text-gray-600">Active Threats</div>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-xl">⚠️</span>
            </div>
          </div>
          <div className="flex items-center mt-2">
            <span className="text-green-600 text-sm">📉 -5.2% from yesterday</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-green-600">
                {metrics?.resolvedIncidents || '—'}
              </div>
              <div className="text-sm text-gray-600">Resolved Incidents</div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-xl">✅</span>
            </div>
          </div>
          <div className="text-sm text-gray-600 mt-2">
            {metrics ? `${metrics.feedsOperational}/${metrics.totalFeeds} feeds operational` : '—'}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-blue-600">
                {metrics?.securityScore || '—'}
              </div>
              <div className="text-sm text-gray-600">Security Score</div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-xl">⚡</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${metrics?.securityScore || 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Threat Level Alert */}
      {metrics?.threatLevel && (
        <div className={`p-4 rounded-lg border mb-8 ${
          metrics.threatLevel === 'critical' || metrics.threatLevel === 'high'
            ? 'bg-red-50 border-red-200 text-red-800'
            : metrics.threatLevel === 'medium'
            ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
            : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <div className="flex justify-between items-start">
            <div>
              <div className="font-bold text-lg">
                Current Threat Level: {metrics.threatLevel.toUpperCase()}
              </div>
              <div className="text-sm mt-1">
                {metrics.threatLevel === 'high' && 'Elevated threat activity detected. Enhanced monitoring is active.'}
                {metrics.threatLevel === 'medium' && 'Normal threat activity levels. Continue standard monitoring procedures.'}
                {metrics.threatLevel === 'low' && 'Low threat activity. All systems operating normally.'}
                {metrics.threatLevel === 'critical' && 'Critical threat level reached. Immediate action required.'}
              </div>
            </div>
            <button className="px-4 py-2 bg-white border border-current rounded-lg text-sm hover:bg-opacity-10">
              View Details
            </button>
          </div>
        </div>
      )}

      {/* Charts and Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Threat Trends Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">📈 Threat Activity Trends (30 Days)</h3>
            <button className="text-gray-400 hover:text-gray-600">⋮</button>
          </div>
          
          <div className="h-64 flex items-end justify-between space-x-1">
            {threatTrends.slice(-14).map((trend, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="w-full flex flex-col justify-end h-48 space-y-0">
                  <div 
                    className="bg-red-500 w-full"
                    style={{ height: `${(trend.critical / Math.max(...threatTrends.map(t => t.total))) * 100}%` }}
                  ></div>
                  <div 
                    className="bg-orange-500 w-full"
                    style={{ height: `${(trend.high / Math.max(...threatTrends.map(t => t.total))) * 100}%` }}
                  ></div>
                  <div 
                    className="bg-yellow-500 w-full"
                    style={{ height: `${(trend.medium / Math.max(...threatTrends.map(t => t.total))) * 100}%` }}
                  ></div>
                  <div 
                    className="bg-green-500 w-full"
                    style={{ height: `${(trend.low / Math.max(...threatTrends.map(t => t.total))) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1 transform rotate-45 origin-left">
                  {trend.date.split('-')[2]}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center space-x-4 mt-4 text-sm">
            <div className="flex items-center"><div className="w-3 h-3 bg-red-500 rounded mr-1"></div>Critical</div>
            <div className="flex items-center"><div className="w-3 h-3 bg-orange-500 rounded mr-1"></div>High</div>
            <div className="flex items-center"><div className="w-3 h-3 bg-yellow-500 rounded mr-1"></div>Medium</div>
            <div className="flex items-center"><div className="w-3 h-3 bg-green-500 rounded mr-1"></div>Low</div>
          </div>
        </div>

        {/* IOC Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-bold mb-4">🎯 IOC Type Distribution</h3>
          
          <div className="space-y-3">
            {iocTypes.slice(0, 6).map((type, index) => (
              <div key={type.type} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: type.color }}
                  ></div>
                  <span className="text-sm font-medium">{type.type.toUpperCase()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold">{formatNumber(type.count)}</span>
                  <span className={`text-xs ${type.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {type.trend > 0 ? '📈' : '📉'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row - Activity & Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">🔄 Recent Activity</h3>
            <button className="text-blue-600 text-sm hover:underline">View All</button>
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">{getActivityIcon(activity.type)}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900">{activity.title}</div>
                  <div className="text-sm text-gray-600 mt-1">{activity.description}</div>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(activity.severity)}`}>
                      {activity.severity}
                    </span>
                    <span className="text-xs text-gray-500">
                      {getTimeAgo(activity.timestamp)} • {activity.user}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Threat Actors & Campaigns */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-bold mb-4">🎭 Active Threat Actors & Campaigns</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Top Threat Actors</h4>
              {topActors.slice(0, 2).map((actor) => (
                <div key={actor.id} className="border border-gray-200 rounded-lg p-3 mb-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium">{actor.name}</div>
                      <div className="text-xs text-gray-500">{actor.aliases.join(', ')}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(actor.severity)}`}>
                      {actor.severity}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {formatNumber(actor.associatedIOCs)} IOCs • Active {getTimeAgo(actor.lastActivity)}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {actor.targetSectors.slice(0, 3).map((sector) => (
                      <span key={sector} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {sector}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Active Campaigns</h4>
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="border border-gray-200 rounded-lg p-3 mb-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium">{campaign.name}</div>
                      <div className="text-xs text-gray-500">{campaign.description}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(campaign.severity)}`}>
                      {campaign.severity}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {campaign.indicators} indicators • Last seen {getTimeAgo(campaign.lastSeen)}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {campaign.countries.map((country) => (
                      <span key={country} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {country}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
