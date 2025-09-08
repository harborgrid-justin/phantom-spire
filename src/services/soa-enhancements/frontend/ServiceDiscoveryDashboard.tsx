/**
 * Service Discovery Dashboard Component
 * Frontend SOA Integration #1: Real-time service discovery visualization
 */

import React, { useState, useEffect } from 'react';

export interface ServiceEndpoint {
  id: string;
  name: string;
  url: string;
  health: number;
  lastPing: Date;
  capabilities: string[];
  metadata: Record<string, any>;
}

export interface ServiceDiscoveryDashboardProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const ServiceDiscoveryDashboard: React.FC<ServiceDiscoveryDashboardProps> = ({
  autoRefresh = true,
  refreshInterval = 30000
}) => {
  const [services, setServices] = useState<ServiceEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCapability, setSelectedCapability] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchServices();
    
    if (autoRefresh) {
      const interval = setInterval(fetchServices, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      // Simulate API call - in real implementation, this would call the backend
      const mockServices: ServiceEndpoint[] = [
        {
          id: 'service-1',
          name: 'User Authentication Service',
          url: 'http://auth-service:8080',
          health: 95,
          lastPing: new Date(),
          capabilities: ['authentication', 'authorization', 'user-management'],
          metadata: { version: '1.2.3', region: 'us-east-1' }
        },
        {
          id: 'service-2',
          name: 'Data Processing Engine',
          url: 'http://data-processor:8081',
          health: 87,
          lastPing: new Date(),
          capabilities: ['data-processing', 'analytics', 'machine-learning'],
          metadata: { version: '2.1.0', region: 'us-west-2' }
        },
        {
          id: 'service-3',
          name: 'Notification Service',
          url: 'http://notification:8082',
          health: 92,
          lastPing: new Date(),
          capabilities: ['notifications', 'email', 'sms', 'push'],
          metadata: { version: '1.0.5', region: 'eu-west-1' }
        }
      ];
      
      setServices(mockServices);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (health: number): string => {
    if (health >= 90) return '#4CAF50'; // Green
    if (health >= 70) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const getHealthStatus = (health: number): string => {
    if (health >= 90) return 'Excellent';
    if (health >= 70) return 'Good';
    if (health >= 50) return 'Warning';
    return 'Critical';
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCapability = !selectedCapability || 
                             service.capabilities.includes(selectedCapability);
    return matchesSearch && matchesCapability;
  });

  const allCapabilities = Array.from(
    new Set(services.flatMap(service => service.capabilities))
  ).sort();

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>Loading service discovery data...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ color: '#333', marginBottom: '10px' }}>
          🔍 Service Discovery Dashboard
        </h2>
        <p style={{ color: '#666', margin: '0' }}>
          Real-time view of all discovered services and their health status
        </p>
      </div>

      {/* Controls */}
      <div style={{ 
        display: 'flex', 
        gap: '15px', 
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="Search services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            minWidth: '200px'
          }}
        />
        
        <select
          value={selectedCapability}
          onChange={(e) => setSelectedCapability(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        >
          <option value="">All Capabilities</option>
          {allCapabilities.map(capability => (
            <option key={capability} value={capability}>
              {capability}
            </option>
          ))}
        </select>

        <button
          onClick={fetchServices}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Summary Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '20px'
      }}>
        <div style={{
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
            {filteredServices.length}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Discovered Services
          </div>
        </div>
        
        <div style={{
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
            {filteredServices.filter(s => s.health >= 90).length}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Healthy Services
          </div>
        </div>
        
        <div style={{
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
            {filteredServices.filter(s => s.health < 90 && s.health >= 70).length}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Warning Services
          </div>
        </div>
        
        <div style={{
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
            {filteredServices.filter(s => s.health < 70).length}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Critical Services
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '20px'
      }}>
        {filteredServices.map(service => (
          <div
            key={service.id}
            style={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '16px',
              backgroundColor: 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {/* Service Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <h3 style={{ 
                margin: '0', 
                fontSize: '16px', 
                color: '#333',
                flex: 1
              }}>
                {service.name}
              </h3>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: getHealthColor(service.health)
                  }}
                />
                <span style={{ 
                  fontSize: '12px', 
                  color: getHealthColor(service.health),
                  fontWeight: 'bold'
                }}>
                  {getHealthStatus(service.health)}
                </span>
              </div>
            </div>

            {/* Service Details */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                <strong>ID:</strong> {service.id}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                <strong>URL:</strong> {service.url}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                <strong>Health:</strong> {service.health}%
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                <strong>Last Ping:</strong> {service.lastPing.toLocaleTimeString()}
              </div>
            </div>

            {/* Capabilities */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                <strong>Capabilities:</strong>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {service.capabilities.map(capability => (
                  <span
                    key={capability}
                    style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      backgroundColor: '#e3f2fd',
                      color: '#1976d2',
                      borderRadius: '12px',
                      border: '1px solid #bbdefb'
                    }}
                  >
                    {capability}
                  </span>
                ))}
              </div>
            </div>

            {/* Metadata */}
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                <strong>Metadata:</strong>
              </div>
              <div style={{ fontSize: '11px', color: '#888' }}>
                {Object.entries(service.metadata).map(([key, value]) => (
                  <div key={key}>
                    {key}: {String(value)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#666'
        }}>
          No services found matching the current filters.
        </div>
      )}
    </div>
  );
};