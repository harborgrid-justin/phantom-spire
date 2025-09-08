/**
 * SOA Platform Dashboard
 * Frontend SOA Integration #3: Comprehensive SOA platform monitoring
 */

import React, { useState, useEffect } from 'react';
import { ServiceDiscoveryDashboard } from './ServiceDiscoveryDashboard.js';
import { CircuitBreakerMonitor } from './CircuitBreakerMonitor.js';

export interface SOAPlatformDashboardProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface TabItem {
  id: string;
  label: string;
  icon: string;
  component: React.ComponentType<any>;
}

export const SOAPlatformDashboard: React.FC<SOAPlatformDashboardProps> = ({
  autoRefresh = true,
  refreshInterval = 30000
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [platformMetrics, setPlatformMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const tabs: TabItem[] = [
    {
      id: 'overview',
      label: 'Platform Overview',
      icon: '📊',
      component: () => <PlatformOverview metrics={platformMetrics} />
    },
    {
      id: 'service-discovery',
      label: 'Service Discovery',
      icon: '🔍',
      component: ServiceDiscoveryDashboard
    },
    {
      id: 'circuit-breakers',
      label: 'Circuit Breakers',
      icon: '🔌',
      component: CircuitBreakerMonitor
    },
    {
      id: 'load-balancing',
      label: 'Load Balancing',
      icon: '⚖️',
      component: () => <LoadBalancingDashboard />
    },
    {
      id: 'message-queues',
      label: 'Message Queues',
      icon: '📬',
      component: () => <MessageQueueDashboard />
    },
    {
      id: 'api-gateway',
      label: 'API Gateway',
      icon: '🚪',
      component: () => <APIGatewayDashboard />
    },
    {
      id: 'service-mesh',
      label: 'Service Mesh',
      icon: '🕸️',
      component: () => <ServiceMeshDashboard />
    },
    {
      id: 'monitoring',
      label: 'Monitoring',
      icon: '📈',
      component: () => <MonitoringDashboard />
    }
  ];

  useEffect(() => {
    fetchPlatformMetrics();
    
    if (autoRefresh) {
      const interval = setInterval(fetchPlatformMetrics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const fetchPlatformMetrics = async () => {
    try {
      setLoading(true);
      // Simulate API call - in real implementation, this would call the backend
      const mockMetrics = {
        timestamp: new Date(),
        platform: {
          totalModules: 40,
          businessLogicModules: 33,
          genericModules: 7,
          soaEnhancements: 32,
          precisionLevel: 'enterprise-grade',
          integrationHealth: 'optimal'
        },
        soaEnhancements: {
          backendServices: {
            serviceDiscovery: { registeredServices: 15, healthyServices: 14 },
            circuitBreakers: { totalBreakers: 8, openBreakers: 1, halfOpenBreakers: 1 },
            loadBalancer: { totalNodes: 12, healthyNodes: 11, averageResponseTime: 85 },
            messageQueues: { totalQueues: 6, totalMessages: 1250, processingRate: 95 }
          },
          platformIntegration: {
            totalEnhancements: 32,
            activeServices: 28,
            healthyServices: 26,
            averageResponseTime: 75
          }
        }
      };
      
      setPlatformMetrics(mockMetrics);
    } catch (error) {
      console.error('Failed to fetch platform metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderActiveTab = () => {
    const activeTabItem = tabs.find(tab => tab.id === activeTab);
    if (!activeTabItem) return null;

    const Component = activeTabItem.component;
    return <Component autoRefresh={autoRefresh} refreshInterval={refreshInterval} />;
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔄</div>
          <div>Loading SOA Platform Dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e0e0e0',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h1 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '28px' }}>
          🏗️ SOA Platform Dashboard
        </h1>
        <p style={{ margin: '0', color: '#666', fontSize: '16px' }}>
          Comprehensive monitoring and management of 32 SOA enhancements across the enterprise platform
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e0e0e0',
        marginBottom: '20px',
        overflowX: 'auto'
      }}>
        <div style={{
          display: 'flex',
          minWidth: 'max-content',
          padding: '0 20px'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 20px',
                border: 'none',
                backgroundColor: 'transparent',
                borderBottom: activeTab === tab.id ? '3px solid #007bff' : '3px solid transparent',
                color: activeTab === tab.id ? '#007bff' : '#666',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ padding: '0 20px 20px' }}>
        {renderActiveTab()}
      </div>
    </div>
  );
};

// Platform Overview Component
const PlatformOverview: React.FC<{ metrics: any }> = ({ metrics }) => {
  if (!metrics) {
    return <div>Loading overview...</div>;
  }

  const getHealthColor = (health: string): string => {
    switch (health) {
      case 'optimal': return '#4CAF50';
      case 'good': return '#8BC34A';
      case 'warning': return '#FF9800';
      case 'critical': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
      {/* Platform Summary */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🏗️ Platform Summary
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
              {metrics.platform.totalModules}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Total Modules</div>
          </div>
          <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
              {metrics.platform.soaEnhancements}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>SOA Enhancements</div>
          </div>
          <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#17a2b8' }}>
              {metrics.platform.businessLogicModules}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Business Logic</div>
          </div>
          <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6610f2' }}>
              {metrics.platform.genericModules}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Generic Modules</div>
          </div>
        </div>
        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          <div style={{
            padding: '8px 16px',
            backgroundColor: getHealthColor(metrics.platform.integrationHealth),
            color: 'white',
            borderRadius: '16px',
            display: 'inline-block',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            Integration Health: {metrics.platform.integrationHealth.toUpperCase()}
          </div>
        </div>
      </div>

      {/* SOA Services Overview */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ⚙️ SOA Services
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1976d2' }}>
              {metrics.soaEnhancements.backendServices.serviceDiscovery.registeredServices}
            </div>
            <div style={{ fontSize: '11px', color: '#666' }}>Registered Services</div>
          </div>
          <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#fff3e0', borderRadius: '4px' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f57c00' }}>
              {metrics.soaEnhancements.backendServices.circuitBreakers.totalBreakers}
            </div>
            <div style={{ fontSize: '11px', color: '#666' }}>Circuit Breakers</div>
          </div>
          <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#e8f5e8', borderRadius: '4px' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#388e3c' }}>
              {metrics.soaEnhancements.backendServices.loadBalancer.totalNodes}
            </div>
            <div style={{ fontSize: '11px', color: '#666' }}>Load Balancer Nodes</div>
          </div>
          <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#fce4ec', borderRadius: '4px' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#c2185b' }}>
              {metrics.soaEnhancements.backendServices.messageQueues.totalQueues}
            </div>
            <div style={{ fontSize: '11px', color: '#666' }}>Message Queues</div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
          📈 Performance Metrics
        </h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '8px 0',
            borderBottom: '1px solid #eee'
          }}>
            <span style={{ fontSize: '14px', color: '#666' }}>Average Response Time</span>
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#007bff' }}>
              {metrics.soaEnhancements.platformIntegration.averageResponseTime}ms
            </span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '8px 0',
            borderBottom: '1px solid #eee'
          }}>
            <span style={{ fontSize: '14px', color: '#666' }}>Active Services</span>
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#28a745' }}>
              {metrics.soaEnhancements.platformIntegration.activeServices}/{metrics.soaEnhancements.platformIntegration.totalEnhancements}
            </span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '8px 0'
          }}>
            <span style={{ fontSize: '14px', color: '#666' }}>Service Health Rate</span>
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#28a745' }}>
              {Math.round((metrics.soaEnhancements.platformIntegration.healthyServices / metrics.soaEnhancements.platformIntegration.totalEnhancements) * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Placeholder components for other tabs
const LoadBalancingDashboard: React.FC = () => (
  <div style={{ padding: '20px', textAlign: 'center', backgroundColor: 'white', borderRadius: '8px' }}>
    <h3>⚖️ Load Balancing Dashboard</h3>
    <p>Advanced load balancing metrics and controls coming soon...</p>
  </div>
);

const MessageQueueDashboard: React.FC = () => (
  <div style={{ padding: '20px', textAlign: 'center', backgroundColor: 'white', borderRadius: '8px' }}>
    <h3>📬 Message Queue Dashboard</h3>
    <p>Message queue monitoring and management coming soon...</p>
  </div>
);

const APIGatewayDashboard: React.FC = () => (
  <div style={{ padding: '20px', textAlign: 'center', backgroundColor: 'white', borderRadius: '8px' }}>
    <h3>🚪 API Gateway Dashboard</h3>
    <p>API gateway management and analytics coming soon...</p>
  </div>
);

const ServiceMeshDashboard: React.FC = () => (
  <div style={{ padding: '20px', textAlign: 'center', backgroundColor: 'white', borderRadius: '8px' }}>
    <h3>🕸️ Service Mesh Dashboard</h3>
    <p>Service mesh topology and traffic management coming soon...</p>
  </div>
);

const MonitoringDashboard: React.FC = () => (
  <div style={{ padding: '20px', textAlign: 'center', backgroundColor: 'white', borderRadius: '8px' }}>
    <h3>📈 Advanced Monitoring</h3>
    <p>Comprehensive monitoring and observability dashboard coming soon...</p>
  </div>
);