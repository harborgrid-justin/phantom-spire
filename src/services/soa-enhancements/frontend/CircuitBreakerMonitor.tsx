/**
 * Circuit Breaker Monitoring Component
 * Frontend SOA Integration #2: Real-time circuit breaker status visualization
 */

import React, { useState, useEffect } from 'react';

export enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half-open'
}

export interface CircuitBreakerStatus {
  serviceName: string;
  state: CircuitState;
  metrics: {
    successCount: number;
    failureCount: number;
    totalRequests: number;
    averageResponseTime: number;
    lastFailure?: Date;
    lastSuccess?: Date;
  };
  config: {
    failureThreshold: number;
    recoveryTimeout: number;
    successThreshold: number;
    adaptiveThresholds: boolean;
  };
  recentFailureRate: number;
}

export interface CircuitBreakerMonitorProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const CircuitBreakerMonitor: React.FC<CircuitBreakerMonitorProps> = ({
  autoRefresh = true,
  refreshInterval = 5000
}) => {
  const [circuitBreakers, setCircuitBreakers] = useState<CircuitBreakerStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<string>('');

  useEffect(() => {
    fetchCircuitBreakerStatus();
    
    if (autoRefresh) {
      const interval = setInterval(fetchCircuitBreakerStatus, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const fetchCircuitBreakerStatus = async () => {
    try {
      setLoading(true);
      // Simulate API call - in real implementation, this would call the backend
      const mockCircuitBreakers: CircuitBreakerStatus[] = [
        {
          serviceName: 'user-authentication',
          state: CircuitState.CLOSED,
          metrics: {
            successCount: 1245,
            failureCount: 3,
            totalRequests: 1248,
            averageResponseTime: 85,
            lastSuccess: new Date(),
            lastFailure: new Date(Date.now() - 300000)
          },
          config: {
            failureThreshold: 5,
            recoveryTimeout: 60000,
            successThreshold: 3,
            adaptiveThresholds: true
          },
          recentFailureRate: 0.02
        },
        {
          serviceName: 'payment-processing',
          state: CircuitState.HALF_OPEN,
          metrics: {
            successCount: 2,
            failureCount: 8,
            totalRequests: 10,
            averageResponseTime: 250,
            lastSuccess: new Date(Date.now() - 30000),
            lastFailure: new Date(Date.now() - 60000)
          },
          config: {
            failureThreshold: 5,
            recoveryTimeout: 60000,
            successThreshold: 3,
            adaptiveThresholds: true
          },
          recentFailureRate: 0.75
        },
        {
          serviceName: 'notification-service',
          state: CircuitState.OPEN,
          metrics: {
            successCount: 0,
            failureCount: 15,
            totalRequests: 15,
            averageResponseTime: 5000,
            lastFailure: new Date(Date.now() - 10000)
          },
          config: {
            failureThreshold: 5,
            recoveryTimeout: 60000,
            successThreshold: 3,
            adaptiveThresholds: true
          },
          recentFailureRate: 1.0
        }
      ];
      
      setCircuitBreakers(mockCircuitBreakers);
    } catch (error) {
      console.error('Failed to fetch circuit breaker status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStateColor = (state: CircuitState): string => {
    switch (state) {
      case CircuitState.CLOSED: return '#4CAF50'; // Green
      case CircuitState.HALF_OPEN: return '#FF9800'; // Orange
      case CircuitState.OPEN: return '#F44336'; // Red
      default: return '#9E9E9E'; // Gray
    }
  };

  const getStateIcon = (state: CircuitState): string => {
    switch (state) {
      case CircuitState.CLOSED: return '✅';
      case CircuitState.HALF_OPEN: return '⚠️';
      case CircuitState.OPEN: return '🚫';
      default: return '❓';
    }
  };

  const calculateSuccessRate = (metrics: CircuitBreakerStatus['metrics']): number => {
    if (metrics.totalRequests === 0) return 0;
    return (metrics.successCount / metrics.totalRequests) * 100;
  };

  const resetCircuitBreaker = async (serviceName: string) => {
    try {
      // Simulate API call to reset circuit breaker
      console.log(`Resetting circuit breaker for ${serviceName}`);
      // In real implementation: await circuitBreakerAPI.reset(serviceName);
      await fetchCircuitBreakerStatus();
    } catch (error) {
      console.error(`Failed to reset circuit breaker for ${serviceName}:`, error);
    }
  };

  const filteredBreakers = selectedService 
    ? circuitBreakers.filter(cb => cb.serviceName === selectedService)
    : circuitBreakers;

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>Loading circuit breaker status...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ color: '#333', marginBottom: '10px' }}>
          🔌 Circuit Breaker Monitor
        </h2>
        <p style={{ color: '#666', margin: '0' }}>
          Real-time monitoring of circuit breaker states and metrics
        </p>
      </div>

      {/* Controls */}
      <div style={{ 
        display: 'flex', 
        gap: '15px', 
        marginBottom: '20px',
        alignItems: 'center'
      }}>
        <select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        >
          <option value="">All Services</option>
          {circuitBreakers.map(cb => (
            <option key={cb.serviceName} value={cb.serviceName}>
              {cb.serviceName}
            </option>
          ))}
        </select>

        <button
          onClick={fetchCircuitBreakerStatus}
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px',
        marginBottom: '20px'
      }}>
        <div style={{
          padding: '15px',
          backgroundColor: '#e8f5e8',
          borderRadius: '6px',
          textAlign: 'center',
          border: '1px solid #4CAF50'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>
            {circuitBreakers.filter(cb => cb.state === CircuitState.CLOSED).length}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Closed (Healthy)
          </div>
        </div>
        
        <div style={{
          padding: '15px',
          backgroundColor: '#fff3e0',
          borderRadius: '6px',
          textAlign: 'center',
          border: '1px solid #FF9800'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF9800' }}>
            {circuitBreakers.filter(cb => cb.state === CircuitState.HALF_OPEN).length}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Half-Open (Testing)
          </div>
        </div>
        
        <div style={{
          padding: '15px',
          backgroundColor: '#ffebee',
          borderRadius: '6px',
          textAlign: 'center',
          border: '1px solid #F44336'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#F44336' }}>
            {circuitBreakers.filter(cb => cb.state === CircuitState.OPEN).length}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Open (Failed)
          </div>
        </div>
      </div>

      {/* Circuit Breakers Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
        gap: '20px'
      }}>
        {filteredBreakers.map(circuitBreaker => (
          <div
            key={circuitBreaker.serviceName}
            style={{
              border: `2px solid ${getStateColor(circuitBreaker.state)}`,
              borderRadius: '8px',
              padding: '16px',
              backgroundColor: 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {/* Circuit Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h3 style={{ 
                margin: '0', 
                fontSize: '18px', 
                color: '#333'
              }}>
                {getStateIcon(circuitBreaker.state)} {circuitBreaker.serviceName}
              </h3>
              <div style={{
                padding: '4px 12px',
                backgroundColor: getStateColor(circuitBreaker.state),
                color: 'white',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}>
                {circuitBreaker.state}
              </div>
            </div>

            {/* Metrics */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <div style={{
                  padding: '8px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#007bff' }}>
                    {circuitBreaker.metrics.totalRequests}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Total Requests
                  </div>
                </div>
                
                <div style={{
                  padding: '8px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>
                    {calculateSuccessRate(circuitBreaker.metrics).toFixed(1)}%
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Success Rate
                  </div>
                </div>

                <div style={{
                  padding: '8px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffc107' }}>
                    {circuitBreaker.metrics.averageResponseTime}ms
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Avg Response
                  </div>
                </div>

                <div style={{
                  padding: '8px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc3545' }}>
                    {(circuitBreaker.recentFailureRate * 100).toFixed(1)}%
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Recent Failures
                  </div>
                </div>
              </div>
            </div>

            {/* Configuration */}
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                Configuration
              </h4>
              <div style={{ fontSize: '12px', color: '#888' }}>
                <div>Failure Threshold: {circuitBreaker.config.failureThreshold}</div>
                <div>Recovery Timeout: {circuitBreaker.config.recoveryTimeout / 1000}s</div>
                <div>Success Threshold: {circuitBreaker.config.successThreshold}</div>
                <div>Adaptive: {circuitBreaker.config.adaptiveThresholds ? 'Yes' : 'No'}</div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => resetCircuitBreaker(circuitBreaker.serviceName)}
                disabled={circuitBreaker.state === CircuitState.CLOSED}
                style={{
                  padding: '6px 12px',
                  backgroundColor: circuitBreaker.state === CircuitState.CLOSED ? '#ccc' : '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: circuitBreaker.state === CircuitState.CLOSED ? 'not-allowed' : 'pointer',
                  fontSize: '12px'
                }}
              >
                🔄 Reset
              </button>
              
              <button
                onClick={() => console.log('View details for', circuitBreaker.serviceName)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                📊 Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredBreakers.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#666'
        }}>
          No circuit breakers found.
        </div>
      )}
    </div>
  );
};