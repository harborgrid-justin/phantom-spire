/**
 * Enhanced UI/UX Evaluation Integration Example
 * Shows how to integrate performance monitoring and feature checking into React components
 */

import React, { useEffect, useState } from 'react';
import { useUIUXEvaluation } from '../../services/ui-ux-evaluation/hooks/useUIUXEvaluation.js';

interface PerformanceDashboardProps {
  pageId?: string;
  enableContinuousMonitoring?: boolean;
  monitoringInterval?: number;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  pageId = 'performance-dashboard',
  enableContinuousMonitoring = true,
  monitoringInterval = 30000
}) => {
  const {
    evaluation,
    performanceMetrics,
    featureReport,
    performanceMonitoring,
    loading,
    error,
    runEvaluation,
    startContinuousMonitoring,
    stopContinuousMonitoring,
    reportPerformanceIssue,
    reportMissingFeature,
    generateReport,
    score,
    loadTime,
    fcp,
    featureAvailability,
    isHealthy,
    performanceScore,
    performanceTrend,
    missingFeatures
  } = useUIUXEvaluation(pageId);

  const [showDetails, setShowDetails] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Start continuous monitoring on mount if enabled
  useEffect(() => {
    if (enableContinuousMonitoring) {
      startContinuousMonitoring(monitoringInterval);
      setIsMonitoring(true);
    }

    return () => {
      if (isMonitoring) {
        stopContinuousMonitoring();
      }
    };
  }, [enableContinuousMonitoring, monitoringInterval, startContinuousMonitoring, stopContinuousMonitoring]);

  // Auto-report performance issues
  useEffect(() => {
    if (loadTime > 3000) {
      reportPerformanceIssue(
        'Slow Page Load Performance',
        loadTime,
        3000
      );
    }
  }, [loadTime, reportPerformanceIssue]);

  // Auto-report missing features
  useEffect(() => {
    if (missingFeatures.length > 0) {
      missingFeatures.forEach(feature => {
        reportMissingFeature(feature, 'medium');
      });
    }
  }, [missingFeatures, reportMissingFeature]);

  const getScoreColor = (score: number) => {
    if (score >= 85) return '#28a745';
    if (score >= 70) return '#ffc107';
    if (score >= 50) return '#fd7e14';
    return '#dc3545';
  };

  const getPerformanceIcon = () => {
    if (loading) return '⏳';
    if (performanceScore === 'excellent') return '⚡';
    if (performanceScore === 'good') return '👍';
    if (performanceScore === 'fair') return '⚠️';
    return '🐌';
  };

  const getTrendIcon = () => {
    if (performanceTrend === 'improving') return '📈';
    if (performanceTrend === 'degrading') return '📉';
    return '➡️';
  };

  return (
    <div style={{
      background: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      padding: '20px',
      margin: '20px 0',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: 0, color: '#2c3e50' }}>
          {getPerformanceIcon()} UI/UX Performance Monitor
        </h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{
            background: isHealthy ? '#d4edda' : '#f8d7da',
            color: isHealthy ? '#155724' : '#721c24',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {isHealthy ? '✅ Healthy' : '⚠️ Issues'}
          </span>
          {isMonitoring && (
            <span style={{
              background: '#d1ecf1',
              color: '#0c5460',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px'
            }}>
              🔄 Monitoring
            </span>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          background: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          padding: '12px',
          marginBottom: '20px',
          color: '#721c24'
        }}>
          ❌ Error: {error}
        </div>
      )}

      {/* Main Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px',
        marginBottom: '20px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '2em',
            fontWeight: 'bold',
            color: getScoreColor(score),
            marginBottom: '5px'
          }}>
            {score}
          </div>
          <div style={{ fontSize: '0.9em', color: '#666' }}>
            Overall Score
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '1.5em',
            fontWeight: 'bold',
            color: loadTime > 3000 ? '#dc3545' : loadTime > 2000 ? '#ffc107' : '#28a745',
            marginBottom: '5px'
          }}>
            {loadTime}ms
          </div>
          <div style={{ fontSize: '0.9em', color: '#666' }}>
            Load Time
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '1.5em',
            fontWeight: 'bold',
            color: fcp > 1800 ? '#dc3545' : fcp > 1200 ? '#ffc107' : '#28a745',
            marginBottom: '5px'
          }}>
            {fcp}ms
          </div>
          <div style={{ fontSize: '0.9em', color: '#666' }}>
            First Paint
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '1.5em',
            fontWeight: 'bold',
            color: getScoreColor(featureAvailability),
            marginBottom: '5px'
          }}>
            {featureAvailability}%
          </div>
          <div style={{ fontSize: '0.9em', color: '#666' }}>
            Features
          </div>
        </div>
      </div>

      {/* Performance Trend */}
      {performanceTrend && (
        <div style={{
          background: '#f8f9fa',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '1.2em' }}>{getTrendIcon()}</span>
          <span style={{ fontSize: '0.9em', color: '#666' }}>
            Performance trend: <strong>{performanceTrend}</strong>
          </span>
        </div>
      )}

      {/* Missing Features Alert */}
      {missingFeatures.length > 0 && (
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '4px',
          padding: '12px',
          marginBottom: '20px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#856404' }}>
            🔧 Missing Features ({missingFeatures.length}):
          </div>
          <div style={{ fontSize: '0.9em', color: '#856404' }}>
            {missingFeatures.map(feature => feature.replace(/-/g, ' ')).join(', ')}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={runEvaluation}
          disabled={loading}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? '⏳ Analyzing...' : '🔍 Re-analyze'}
        </button>

        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{
            background: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {showDetails ? '📋 Hide Details' : '📊 Show Details'}
        </button>

        <button
          onClick={async () => {
            const report = await generateReport();
            console.log('Generated comprehensive report:', report);
            alert('Report generated! Check console for details.');
          }}
          style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          📄 Generate Report
        </button>

        <button
          onClick={() => {
            if (isMonitoring) {
              stopContinuousMonitoring();
              setIsMonitoring(false);
            } else {
              startContinuousMonitoring(monitoringInterval);
              setIsMonitoring(true);
            }
          }}
          style={{
            background: isMonitoring ? '#dc3545' : '#17a2b8',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isMonitoring ? '⏹️ Stop Monitoring' : '▶️ Start Monitoring'}
        </button>
      </div>

      {/* Detailed Information */}
      {showDetails && (
        <div style={{
          background: '#f8f9fa',
          padding: '15px',
          borderRadius: '4px',
          border: '1px solid #dee2e6'
        }}>
          <h4 style={{ marginTop: 0, color: '#495057' }}>Detailed Metrics</h4>
          
          {/* Performance Metrics */}
          {performanceMetrics && (
            <div style={{ marginBottom: '20px' }}>
              <h5 style={{ color: '#6c757d' }}>⚡ Performance</h5>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '10px',
                fontSize: '0.9em'
              }}>
                <div>Load Time: <strong>{performanceMetrics.loadTime}ms</strong></div>
                <div>DOM Load: <strong>{performanceMetrics.domContentLoadTime}ms</strong></div>
                <div>Time to Interactive: <strong>{performanceMetrics.timeToInteractive}ms</strong></div>
                <div>Resource Load: <strong>{performanceMetrics.resourceLoadTime}ms</strong></div>
                <div>Network Latency: <strong>{performanceMetrics.networkLatency}ms</strong></div>
                <div>Render Time: <strong>{performanceMetrics.renderTime}ms</strong></div>
              </div>
            </div>
          )}

          {/* Feature Report */}
          {featureReport && (
            <div style={{ marginBottom: '20px' }}>
              <h5 style={{ color: '#6c757d' }}>🔍 Feature Availability</h5>
              <div style={{ fontSize: '0.9em' }}>
                <div>Expected Features: <strong>{featureReport.expectedFeatures.length}</strong></div>
                <div>Available Features: <strong>{featureReport.availableFeatures.length}</strong></div>
                <div>Availability Score: <strong>{featureReport.availabilityScore}%</strong></div>
                
                {featureReport.availableFeatures.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ color: '#28a745', fontWeight: 'bold' }}>✅ Available:</div>
                    <div style={{ paddingLeft: '15px' }}>
                      {featureReport.availableFeatures.map(feature => feature.replace(/-/g, ' ')).join(', ')}
                    </div>
                  </div>
                )}

                {featureReport.missingFeatures.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ color: '#dc3545', fontWeight: 'bold' }}>❌ Missing:</div>
                    <div style={{ paddingLeft: '15px' }}>
                      {featureReport.missingFeatures.map(feature => feature.replace(/-/g, ' ')).join(', ')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Evaluation Issues */}
          {evaluation && evaluation.issues.length > 0 && (
            <div>
              <h5 style={{ color: '#6c757d' }}>⚠️ Issues ({evaluation.issues.length})</h5>
              <div style={{ fontSize: '0.9em' }}>
                {evaluation.issues.slice(0, 5).map((issue, index) => (
                  <div key={issue.id} style={{
                    background: 'white',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    padding: '8px',
                    marginBottom: '8px'
                  }}>
                    <div style={{ fontWeight: 'bold', color: '#495057' }}>
                      {issue.severity === 'critical' ? '🚨' : issue.severity === 'high' ? '⚠️' : '💡'} {issue.title}
                    </div>
                    <div style={{ color: '#6c757d' }}>{issue.description}</div>
                    {issue.recommendation && (
                      <div style={{ color: '#17a2b8', fontStyle: 'italic', marginTop: '4px' }}>
                        💡 {issue.recommendation}
                      </div>
                    )}
                  </div>
                ))}
                {evaluation.issues.length > 5 && (
                  <div style={{ color: '#6c757d', fontStyle: 'italic' }}>
                    ... and {evaluation.issues.length - 5} more issues
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        marginTop: '20px',
        paddingTop: '15px',
        borderTop: '1px solid #dee2e6',
        fontSize: '0.8em',
        color: '#6c757d'
      }}>
        Last updated: {evaluation ? new Date(evaluation.timestamp).toLocaleString() : 'Never'}
        {isMonitoring && (
          <span> | Next check in {Math.round(monitoringInterval / 1000)}s</span>
        )}
      </div>
    </div>
  );
};

export default PerformanceDashboard;