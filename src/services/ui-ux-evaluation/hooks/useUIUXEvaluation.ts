/**
 * Enhanced UI/UX Evaluation Hook with Performance Monitoring
 * Comprehensive evaluation system with real performance measurement and feature checking
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { UIUXEvaluationService } from '../core/UIUXEvaluationService.js';
import PagePerformanceMonitor, {
  IPageLoadMetrics,
  IFeatureAvailabilityReport,
} from '../utils/PagePerformanceMonitor.js';
import {
  IPageEvaluation,
  IEvaluationIssue,
  IEvaluationMetric,
  EvaluationCategory,
  EvaluationSeverity,
} from '../interfaces/IUIUXEvaluation.js';

export interface IPerformanceMonitoringResult {
  loadTime: number;
  fcp: number;
  tti: number;
  score: 'excellent' | 'good' | 'fair' | 'poor';
  trend: 'improving' | 'degrading' | 'stable';
  featureAvailability: number;
  missingFeatures: string[];
  issues: string[];
}

// Enhanced evaluation hook with performance monitoring
export const useUIUXEvaluation = (pageId: string, autoStart = true) => {
  const [evaluation, setEvaluation] = useState<IPageEvaluation | null>(null);
  const [performanceMetrics, setPerformanceMetrics] =
    useState<IPageLoadMetrics | null>(null);
  const [featureReport, setFeatureReport] =
    useState<IFeatureAvailabilityReport | null>(null);
  const [performanceMonitoring, setPerformanceMonitoring] =
    useState<IPerformanceMonitoringResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const serviceRef = useRef<UIUXEvaluationService>(new UIUXEvaluationService());
  const performanceMonitorRef = useRef<PagePerformanceMonitor>(
    PagePerformanceMonitor.getInstance()
  );
  const sessionRef = useRef<string | null>(null);
  const monitoringInterval = useRef<NodeJS.Timeout | null>(null);

  const runPerformanceEvaluation = useCallback(async () => {
    try {
      // Measure page performance
      const metrics =
        await performanceMonitorRef.current.monitorPageLoad(pageId);
      setPerformanceMetrics(metrics);

      // Check feature availability
      const features =
        await performanceMonitorRef.current.checkFeatureAvailability(pageId);
      setFeatureReport(features);

      // Get comprehensive page report
      const pageReport = performanceMonitorRef.current.getPageReport(pageId);
      const performanceStats =
        performanceMonitorRef.current.getPerformanceStats(pageId);

      const result: IPerformanceMonitoringResult = {
        loadTime: metrics.loadTime,
        fcp: metrics.firstContentfulPaint,
        tti: metrics.timeToInteractive,
        score: pageReport.overallHealth.status,
        trend: performanceStats.trend,
        featureAvailability: features.availabilityScore,
        missingFeatures: features.missingFeatures,
        issues: pageReport.overallHealth.issues,
      };

      setPerformanceMonitoring(result);

      console.log(`⚡ Performance evaluation completed for ${pageId}:`, {
        loadTime: metrics.loadTime,
        fcp: metrics.firstContentfulPaint,
        featureScore: features.availabilityScore,
        healthScore: pageReport.overallHealth.score,
      });

      return result;
    } catch (err) {
      console.warn('Performance evaluation failed:', err);
      return null;
    }
  }, [pageId]);

  const runEvaluation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Run both UI/UX evaluation and performance monitoring
      const [evaluation, performanceResult] = await Promise.all([
        serviceRef.current.evaluatePage(pageId),
        runPerformanceEvaluation(),
      ]);

      setEvaluation(evaluation);

      console.log(`📊 Complete UI/UX Evaluation completed for ${pageId}:`, {
        uiuxScore: evaluation.overallScore,
        performanceScore: performanceResult?.score || 'unknown',
        issues: evaluation.issues.length,
        wcag: evaluation.compliance.wcag,
        enterprise: evaluation.compliance.enterprise,
        featureAvailability: performanceResult?.featureAvailability || 0,
      });

      return { evaluation, performance: performanceResult };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('UI/UX Evaluation failed:', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [pageId, runPerformanceEvaluation]);

  const startContinuousMonitoring = useCallback(
    async (intervalMs = 30000) => {
      try {
        // Stop existing monitoring
        if (monitoringInterval.current) {
          clearInterval(monitoringInterval.current);
        }

        // Configure the service for continuous evaluation
        await serviceRef.current.configure({
          autoEvaluate: true,
          evaluationInterval: intervalMs,
        });

        const sessionId =
          await serviceRef.current.startContinuousEvaluation(pageId);
        sessionRef.current = sessionId;

        // Subscribe to evaluation updates
        await serviceRef.current.subscribe(newEvaluation => {
          setEvaluation(newEvaluation);
          console.log(`🔄 Continuous evaluation update for ${pageId}:`, {
            score: newEvaluation.overallScore,
            issues: newEvaluation.issues.length,
          });
        });

        // Start continuous performance monitoring
        monitoringInterval.current = setInterval(async () => {
          await runPerformanceEvaluation();
        }, intervalMs);

        console.log(
          `🔄 Started continuous monitoring for ${pageId} (interval: ${intervalMs}ms)`
        );
        return sessionId;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Failed to start continuous monitoring:', errorMessage);
        return null;
      }
    },
    [pageId, runPerformanceEvaluation]
  );

  const stopContinuousMonitoring = useCallback(async () => {
    if (sessionRef.current) {
      try {
        await serviceRef.current.stopContinuousEvaluation(sessionRef.current);
        sessionRef.current = null;
        console.log(`⏹️ Stopped continuous evaluation for ${pageId}`);
      } catch (err) {
        console.error('Failed to stop continuous evaluation:', err);
      }
    }

    if (monitoringInterval.current) {
      clearInterval(monitoringInterval.current);
      monitoringInterval.current = null;
      console.log(`⏹️ Stopped performance monitoring for ${pageId}`);
    }
  }, [pageId]);

  const reportPerformanceIssue = useCallback(
    async (title: string, loadTime: number, threshold: number = 3000) => {
      const severity =
        loadTime > threshold * 2
          ? EvaluationSeverity.CRITICAL
          : loadTime > threshold
            ? EvaluationSeverity.HIGH
            : EvaluationSeverity.MEDIUM;

      await serviceRef.current.reportIssue(pageId, {
        category: EvaluationCategory.PERFORMANCE,
        severity,
        title,
        description: `Page load time of ${loadTime}ms exceeds ${threshold}ms threshold`,
        recommendation:
          'Optimize page loading performance - reduce resource size, enable compression, use CDN',
        metadata: {
          actualLoadTime: loadTime,
          threshold,
          type: 'performance-measurement',
        },
      });

      await runEvaluation();
      console.log(`🐛 Reported performance issue for ${pageId}:`, title);
    },
    [pageId, runEvaluation]
  );

  const reportMissingFeature = useCallback(
    async (
      featureName: string,
      importance: 'critical' | 'high' | 'medium' | 'low' = 'medium'
    ) => {
      const severityMap = {
        critical: EvaluationSeverity.CRITICAL,
        high: EvaluationSeverity.HIGH,
        medium: EvaluationSeverity.MEDIUM,
        low: EvaluationSeverity.LOW,
      };

      await serviceRef.current.reportIssue(pageId, {
        category: EvaluationCategory.USABILITY,
        severity: severityMap[importance],
        title: `Missing Feature: ${featureName}`,
        description: `Expected feature "${featureName}" is not available or not functioning properly`,
        recommendation: `Implement or fix the "${featureName}" feature to improve user experience`,
        metadata: { featureName, importance, type: 'feature-availability' },
      });

      await runEvaluation();
      console.log(`🔧 Reported missing feature for ${pageId}:`, featureName);
    },
    [pageId, runEvaluation]
  );

  const reportCustomIssue = useCallback(
    async (
      title: string,
      description: string,
      category: EvaluationCategory = EvaluationCategory.USABILITY,
      severity: EvaluationSeverity = EvaluationSeverity.MEDIUM
    ) => {
      try {
        await serviceRef.current.reportIssue(pageId, {
          category,
          severity,
          title,
          description,
          recommendation: `Review and address: ${title}`,
        });

        // Re-run evaluation to get updated results
        await runEvaluation();

        console.log(`🐛 Reported custom issue for ${pageId}:`, title);
      } catch (err) {
        console.error('Failed to report custom issue:', err);
      }
    },
    [pageId, runEvaluation]
  );

  const collectCustomMetric = useCallback(
    async (
      name: string,
      value: number,
      maxValue: number,
      category: EvaluationCategory = EvaluationCategory.USABILITY,
      unit = 'score'
    ) => {
      try {
        await serviceRef.current.collectMetric(pageId, {
          name,
          category,
          description: `Custom metric: ${name}`,
          value,
          maxValue,
          unit,
          threshold: {
            excellent: maxValue * 0.9,
            good: maxValue * 0.75,
            acceptable: maxValue * 0.6,
            poor: maxValue * 0.4,
          },
        });

        console.log(`📈 Collected custom metric for ${pageId}:`, {
          name,
          value,
          maxValue,
        });
      } catch (err) {
        console.error('Failed to collect custom metric:', err);
      }
    },
    [pageId]
  );

  const generateReport = useCallback(async () => {
    try {
      const report = await serviceRef.current.generateReport([pageId]);
      const performanceStats =
        performanceMonitorRef.current.getPerformanceStats(pageId);
      const featureReport =
        performanceMonitorRef.current.getLatestFeatureReport(pageId);

      console.log(
        `📋 Generated comprehensive evaluation report for ${pageId}:`,
        {
          overallScore: report.summary.overallScore,
          totalIssues:
            report.summary.criticalIssues +
            report.summary.highIssues +
            report.summary.mediumIssues +
            report.summary.lowIssues,
          avgLoadTime: performanceStats.averageLoadTime,
          featureAvailability: featureReport?.availabilityScore || 0,
        }
      );

      return {
        report,
        performanceStats,
        featureReport,
      };
    } catch (err) {
      console.error('Failed to generate report:', err);
      return null;
    }
  }, [pageId]);

  // Auto-start evaluation if requested
  useEffect(() => {
    if (autoStart) {
      runEvaluation();
    }
  }, [autoStart, runEvaluation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        serviceRef.current.stopContinuousEvaluation(sessionRef.current);
      }
      if (monitoringInterval.current) {
        clearInterval(monitoringInterval.current);
      }
      // Cleanup old performance data
      performanceMonitorRef.current.cleanup();
    };
  }, []);

  return {
    evaluation,
    performanceMetrics,
    featureReport,
    performanceMonitoring,
    loading,
    error,
    // Actions
    runEvaluation,
    runPerformanceEvaluation,
    startContinuousMonitoring,
    stopContinuousMonitoring,
    reportCustomIssue,
    reportPerformanceIssue,
    reportMissingFeature,
    collectCustomMetric,
    generateReport,
    // Computed values
    score: evaluation?.overallScore || 0,
    issueCount: evaluation?.issues.length || 0,
    criticalIssues:
      evaluation?.issues.filter(i => i.severity === EvaluationSeverity.CRITICAL)
        .length || 0,
    highIssues:
      evaluation?.issues.filter(i => i.severity === EvaluationSeverity.HIGH)
        .length || 0,
    wcagCompliance: evaluation?.compliance.wcag || 'Non-compliant',
    enterpriseCompliant: evaluation?.compliance.enterprise || false,
    loadTime: performanceMetrics?.loadTime || 0,
    fcp: performanceMetrics?.firstContentfulPaint || 0,
    featureAvailability: featureReport?.availabilityScore || 0,
    isHealthy:
      (evaluation?.overallScore || 0) >= 75 &&
      (evaluation?.issues.filter(
        i => i.severity === EvaluationSeverity.CRITICAL
      ).length || 0) === 0 &&
      (performanceMetrics?.loadTime || 0) <= 3000 &&
      (featureReport?.availabilityScore || 0) >= 80,
    performanceScore: performanceMonitoring?.score || 'unknown',
    performanceTrend: performanceMonitoring?.trend || 'stable',
    missingFeatures: featureReport?.missingFeatures || [],
  };
};

// Enhanced evaluation status component with performance data
export const createEvaluationStatusElement = (
  pageId: string,
  options: {
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    showScore?: boolean;
    showIssues?: boolean;
    minimized?: boolean;
  } = {}
) => {
  const {
    position = 'bottom-right',
    showScore = true,
    showIssues = true,
    minimized = false,
  } = options;

  // Create the status element
  const statusElement = document.createElement('div');
  statusElement.id = `ux-evaluation-status-${pageId}`;
  statusElement.style.cssText = `
    position: fixed;
    ${position.includes('top') ? 'top: 20px;' : 'bottom: 20px;'}
    ${position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: ${minimized ? '8px' : '12px 16px'};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 9999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    max-width: ${minimized ? 'auto' : '280px'};
    backdrop-filter: blur(10px);
    cursor: pointer;
    transition: all 0.3s ease;
  `;

  // Initialize with loading state
  statusElement.innerHTML = minimized
    ? `<div style="display: flex; align-items: center; gap: 8px;">
         📊 <span style="font-size: 12px;">Loading...</span>
       </div>`
    : `<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
         <strong style="color: #1976d2;">🎯 UI/UX Evaluation</strong>
         <span style="font-size: 12px; color: #666;">Loading...</span>
       </div>`;

  // Add to document
  document.body.appendChild(statusElement);

  // Initialize evaluation service
  const evaluationService = new UIUXEvaluationService();

  // Function to update status
  const updateStatus = (evaluation: IPageEvaluation | null) => {
    if (!evaluation) {
      statusElement.innerHTML = minimized
        ? `<div style="display: flex; align-items: center; gap: 8px;">
             ❌ <span style="font-size: 12px; color: #d32f2f;">Failed</span>
           </div>`
        : `<div style="text-align: center; color: #d32f2f;">
             ❌ Evaluation Failed
           </div>`;
      return;
    }

    const scoreColor =
      evaluation.overallScore >= 75
        ? '#2e7d32'
        : evaluation.overallScore >= 50
          ? '#ed6c02'
          : '#d32f2f';
    const criticalIssues = evaluation.issues.filter(
      i => i.severity === EvaluationSeverity.CRITICAL
    ).length;
    const highIssues = evaluation.issues.filter(
      i => i.severity === EvaluationSeverity.HIGH
    ).length;

    if (minimized) {
      statusElement.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-weight: bold; color: ${scoreColor};">${evaluation.overallScore}</span>
          ${evaluation.issues.length > 0 ? `<span style="background: #d32f2f; color: white; padding: 2px 6px; border-radius: 10px; font-size: 11px;">${evaluation.issues.length}</span>` : ''}
          <span style="font-size: 10px;">${evaluation.compliance.wcag}</span>
        </div>
      `;
    } else {
      statusElement.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <strong style="color: #1976d2;">🎯 UI/UX Evaluation</strong>
          <span style="font-size: 12px; color: #666;">${new Date(evaluation.timestamp).toLocaleTimeString()}</span>
        </div>
        
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
          <div style="text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: ${scoreColor};">${evaluation.overallScore}</div>
            <div style="font-size: 10px; color: #666;">SCORE</div>
          </div>
          
          <div style="flex: 1;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
              <span>Issues:</span>
              <span style="color: ${evaluation.issues.length > 0 ? '#d32f2f' : '#2e7d32'};">
                ${evaluation.issues.length}
              </span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
              <span>WCAG:</span>
              <span style="color: ${evaluation.compliance.wcag === 'AAA' ? '#2e7d32' : '#ed6c02'};">
                ${evaluation.compliance.wcag}
              </span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px;">
              <span>Enterprise:</span>
              <span style="color: ${evaluation.compliance.enterprise ? '#2e7d32' : '#d32f2f'};">
                ${evaluation.compliance.enterprise ? '✓' : '✗'}
              </span>
            </div>
          </div>
        </div>
        
        ${
          criticalIssues > 0 || highIssues > 0
            ? `
          <div style="background: rgba(211, 47, 47, 0.1); padding: 8px; border-radius: 4px; font-size: 12px;">
            <strong style="color: #d32f2f;">⚠️ Attention:</strong>
            ${criticalIssues > 0 ? `${criticalIssues} critical` : ''}
            ${criticalIssues > 0 && highIssues > 0 ? ', ' : ''}
            ${highIssues > 0 ? `${highIssues} high priority` : ''} 
            issue${criticalIssues + highIssues > 1 ? 's' : ''} found
          </div>
        `
            : `
          <div style="background: rgba(46, 125, 50, 0.1); padding: 8px; border-radius: 4px; font-size: 12px; color: #2e7d32; text-align: center;">
            ✅ No critical issues detected
          </div>
        `
        }
      `;
    }
  };

  // Run initial evaluation
  evaluationService
    .evaluatePage(pageId)
    .then(updateStatus)
    .catch(() => updateStatus(null));

  // Add click handler for refresh
  statusElement.addEventListener('click', () => {
    statusElement.style.opacity = '0.7';
    evaluationService
      .evaluatePage(pageId)
      .then(evaluation => {
        updateStatus(evaluation);
        statusElement.style.opacity = '1';
      })
      .catch(() => {
        updateStatus(null);
        statusElement.style.opacity = '1';
      });
  });

  return {
    element: statusElement,
    refresh: () => evaluationService.evaluatePage(pageId).then(updateStatus),
    remove: () => statusElement.remove(),
    updateStatus,
  };
};

// Utility function to add evaluation to any page
export const addUIUXEvaluation = (
  pageId: string,
  options?: {
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    showScore?: boolean;
    showIssues?: boolean;
    minimized?: boolean;
    autoStart?: boolean;
    continuous?: boolean;
    interval?: number;
  }
) => {
  const {
    position = 'bottom-right',
    showScore = true,
    showIssues = true,
    minimized = false,
    autoStart = true,
    continuous = false,
    interval = 30000,
  } = options || {};

  console.log(`🚀 Initializing UI/UX evaluation for ${pageId}`);

  // Create status element
  const statusWidget = createEvaluationStatusElement(pageId, {
    position,
    showScore,
    showIssues,
    minimized,
  });

  // Initialize evaluation service
  const evaluationService = new UIUXEvaluationService();
  let sessionId: string | null = null;

  // Start continuous evaluation if requested
  if (continuous && autoStart) {
    evaluationService
      .configure({
        autoEvaluate: true,
        evaluationInterval: interval,
      })
      .then(() => {
        return evaluationService.startContinuousEvaluation(pageId);
      })
      .then(id => {
        sessionId = id;
        console.log(`🔄 Started continuous UI/UX evaluation for ${pageId}`);

        // Subscribe to updates
        evaluationService.subscribe(evaluation => {
          statusWidget.updateStatus(evaluation);
        });
      })
      .catch(err => {
        console.error('Failed to start continuous evaluation:', err);
      });
  }

  // Return control interface
  return {
    refresh: statusWidget.refresh,
    remove: () => {
      if (sessionId) {
        evaluationService.stopContinuousEvaluation(sessionId);
      }
      statusWidget.remove();
    },
    startContinuous: () => {
      if (!sessionId) {
        evaluationService.startContinuousEvaluation(pageId).then(id => {
          sessionId = id;
        });
      }
    },
    stopContinuous: () => {
      if (sessionId) {
        evaluationService.stopContinuousEvaluation(sessionId);
        sessionId = null;
      }
    },
    generateReport: () => evaluationService.generateReport([pageId]),
  };
};
