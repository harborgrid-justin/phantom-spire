/**
 * Enterprise Performance Optimizer
 * Handles performance analysis, anomaly detection, and optimization recommendations
 */

import { EventEmitter } from 'events';
import {
  MonitoringConfiguration,
  PerformanceMetric,
  PerformanceBaseline,
  OptimizationRecommendation,
  OptimizationHistory,
  PerformanceAnomaly,
  OptimizationFilter,
  RecommendationGeneratedEvent
} from './monitoring.types';
import {
  groupMetricsByName,
  calculateBasicStats,
  calculateZScore,
  generateId
} from './monitoring.utils';

export class PerformanceOptimizer extends EventEmitter {
  private recommendations: Map<string, OptimizationRecommendation> = new Map();
  private baselines: Map<string, PerformanceBaseline> = new Map();
  private config: MonitoringConfiguration;
  private optimizationHistory: OptimizationHistory[] = [];

  constructor(config: MonitoringConfiguration) {
    super();
    this.config = config;
  }

  // ==================== ANALYSIS METHODS ====================

  /**
   * Analyze performance metrics and generate recommendations
   */
  analyzePerformance(metrics: PerformanceMetric[]): void {
    // Update baselines
    this.updateBaselines(metrics);

    // Detect performance anomalies
    const anomalies = this.detectAnomalies(metrics);

    // Generate optimization recommendations
    const recommendations = this.generateOptimizationRecommendations(metrics, anomalies);

    // Store recommendations
    recommendations.forEach(rec => {
      this.recommendations.set(rec.id, rec);
    });

    if (recommendations.length > 0) {
      this.emit('recommendations_generated', {
        count: recommendations.length,
        recommendations,
        timestamp: new Date()
      } as RecommendationGeneratedEvent);
    }

    // Auto-apply safe optimizations if enabled
    if (this.config.optimization.autoOptimization) {
      this.autoApplyOptimizations(recommendations);
    }
  }

  // ==================== BASELINE MANAGEMENT ====================

  private updateBaselines(metrics: PerformanceMetric[]): void {
    const now = new Date();
    const groupedMetrics = groupMetricsByName(metrics);

    Object.entries(groupedMetrics).forEach(([metricName, metricList]) => {
      const values = metricList.map(m => m.value);
      if (values.length < 10) return; // Need sufficient data

      const stats = calculateBasicStats(values);

      const baseline: PerformanceBaseline = {
        metric: metricName,
        period: 'hour',
        values: stats,
        confidence: Math.min(95, values.length * 2), // Confidence based on sample size
        createdAt: now,
        validUntil: new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours
      };

      this.baselines.set(metricName, baseline);
    });
  }

  // ==================== ANOMALY DETECTION ====================

  private detectAnomalies(metrics: PerformanceMetric[]): PerformanceAnomaly[] {
    const anomalies: PerformanceAnomaly[] = [];

    metrics.forEach(metric => {
      const baseline = this.baselines.get(metric.name);
      if (!baseline) return;

      // Detect outliers using Z-score
      const zScore = calculateZScore(metric.value, baseline.values.avg, baseline.values.stdDev);
      if (zScore > 3) {
        anomalies.push({
          metric,
          anomalyType: 'outlier',
          severity: Math.min(100, zScore * 10)
        });
      }

      // Detect sudden spikes
      if (metric.value > baseline.values.p99 * 1.5) {
        anomalies.push({
          metric,
          anomalyType: 'spike',
          severity: ((metric.value - baseline.values.p99) / baseline.values.p99) * 100
        });
      }

      // Detect sudden drops (for metrics where lower is worse)
      if (this.isLowerWorse(metric.name) && metric.value < baseline.values.p50 * 0.8) {
        anomalies.push({
          metric,
          anomalyType: 'drop',
          severity: ((baseline.values.p50 - metric.value) / baseline.values.p50) * 100
        });
      }

      // Detect trend changes
      const trendAnomaly = this.detectTrendAnomaly(metric, baseline);
      if (trendAnomaly) {
        anomalies.push(trendAnomaly);
      }
    });

    return anomalies;
  }

  private isLowerWorse(metricName: string): boolean {
    const lowerWorseMetrics = ['accuracy', 'availability', 'performance', 'uptime'];
    return lowerWorseMetrics.some(keyword => metricName.toLowerCase().includes(keyword));
  }

  private detectTrendAnomaly(metric: PerformanceMetric, baseline: PerformanceBaseline): PerformanceAnomaly | null {
    // Simple trend detection - in practice, you'd want more sophisticated analysis
    const deviation = Math.abs(metric.value - baseline.values.avg);
    const normalDeviation = baseline.values.stdDev * 2;

    if (deviation > normalDeviation) {
      return {
        metric,
        anomalyType: 'trend_deviation',
        severity: (deviation / normalDeviation) * 50
      };
    }

    return null;
  }

  // ==================== RECOMMENDATION GENERATION ====================

  private generateOptimizationRecommendations(
    metrics: PerformanceMetric[],
    anomalies: PerformanceAnomaly[]
  ): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // CPU optimization recommendations
    const cpuMetrics = metrics.filter(m => m.name.includes('cpu'));
    const cpuRecommendation = this.generateCpuOptimizationRecommendation(cpuMetrics);
    if (cpuRecommendation) {
      recommendations.push(cpuRecommendation);
    }

    // Memory optimization recommendations
    const memoryMetrics = metrics.filter(m => m.name.includes('memory'));
    const memoryRecommendation = this.generateMemoryOptimizationRecommendation(memoryMetrics);
    if (memoryRecommendation) {
      recommendations.push(memoryRecommendation);
    }

    // Model performance recommendations
    const accuracyMetrics = metrics.filter(m => m.name.includes('accuracy'));
    const modelRecommendation = this.generateModelOptimizationRecommendation(accuracyMetrics);
    if (modelRecommendation) {
      recommendations.push(modelRecommendation);
    }

    // Storage optimization recommendations
    const diskMetrics = metrics.filter(m => m.name.includes('disk'));
    const storageRecommendation = this.generateStorageOptimizationRecommendation(diskMetrics);
    if (storageRecommendation) {
      recommendations.push(storageRecommendation);
    }

    // Network optimization recommendations
    const networkMetrics = metrics.filter(m => m.name.includes('network'));
    const networkRecommendation = this.generateNetworkOptimizationRecommendation(networkMetrics);
    if (networkRecommendation) {
      recommendations.push(networkRecommendation);
    }

    // Anomaly-based recommendations
    const anomalyRecommendations = this.generateAnomalyBasedRecommendations(anomalies);
    recommendations.push(...anomalyRecommendations);

    return recommendations;
  }

  private generateCpuOptimizationRecommendation(cpuMetrics: PerformanceMetric[]): OptimizationRecommendation | null {
    if (cpuMetrics.length === 0) return null;

    const highCpuMetrics = cpuMetrics.filter(m => m.value > 80);
    if (highCpuMetrics.length === 0) return null;

    const avgUtilization = cpuMetrics.reduce((sum, m) => sum + m.value, 0) / cpuMetrics.length;

    return {
      id: generateId('cpu_optimization'),
      type: 'scaling',
      priority: avgUtilization > 90 ? 'critical' : 'high',
      title: 'CPU Scaling Recommendation',
      description: `High CPU utilization detected (${avgUtilization.toFixed(1)}%). Consider scaling up compute resources.`,
      impact: {
        performance: 'Reduce CPU bottlenecks by 30-50%',
        cost: 'Increase infrastructure costs by $200-500/month',
        risk: 'Low risk - reversible scaling operation'
      },
      implementation: {
        effort: 'low',
        timeline: '15-30 minutes',
        steps: [
          'Increase CPU allocation by 50%',
          'Monitor performance for 1 hour',
          'Adjust allocation based on results',
          'Update resource monitoring thresholds'
        ],
        rollback: [
          'Reduce CPU allocation to original values',
          'Verify system stability',
          'Monitor for performance degradation'
        ]
      },
      metrics: {
        current: { cpu_utilization: avgUtilization },
        projected: { cpu_utilization: Math.max(60, avgUtilization * 0.7) },
        confidence: 85
      },
      createdAt: new Date(),
      status: 'pending'
    };
  }

  private generateMemoryOptimizationRecommendation(memoryMetrics: PerformanceMetric[]): OptimizationRecommendation | null {
    if (memoryMetrics.length === 0) return null;

    const highMemoryMetrics = memoryMetrics.filter(m => m.value > 85);
    if (highMemoryMetrics.length === 0) return null;

    const avgUtilization = memoryMetrics.reduce((sum, m) => sum + m.value, 0) / memoryMetrics.length;

    return {
      id: generateId('memory_optimization'),
      type: 'resource',
      priority: avgUtilization > 95 ? 'critical' : 'medium',
      title: 'Memory Optimization',
      description: `High memory usage detected (${avgUtilization.toFixed(1)}%). Optimize memory allocation and usage patterns.`,
      impact: {
        performance: 'Reduce memory pressure and improve responsiveness',
        cost: 'Minimal cost increase for memory optimization',
        risk: 'Medium risk - requires careful memory management'
      },
      implementation: {
        effort: 'medium',
        timeline: '1-2 hours',
        steps: [
          'Analyze memory usage patterns',
          'Implement memory pooling',
          'Optimize data structures',
          'Add memory monitoring',
          'Configure garbage collection'
        ],
        rollback: [
          'Restore original memory configuration',
          'Remove optimization changes',
          'Reset garbage collection settings'
        ]
      },
      metrics: {
        current: { memory_utilization: avgUtilization },
        projected: { memory_utilization: Math.max(70, avgUtilization * 0.8) },
        confidence: 75
      },
      createdAt: new Date(),
      status: 'pending'
    };
  }

  private generateModelOptimizationRecommendation(accuracyMetrics: PerformanceMetric[]): OptimizationRecommendation | null {
    if (accuracyMetrics.length === 0) return null;

    const lowAccuracyMetrics = accuracyMetrics.filter(m => m.value < 0.85);
    if (lowAccuracyMetrics.length === 0) return null;

    const avgAccuracy = accuracyMetrics.reduce((sum, m) => sum + m.value, 0) / accuracyMetrics.length;

    return {
      id: generateId('model_retraining'),
      type: 'algorithm',
      priority: avgAccuracy < 0.7 ? 'critical' : 'high',
      title: 'Model Retraining Recommendation',
      description: `Model accuracy has degraded (${(avgAccuracy * 100).toFixed(1)}%). Consider retraining with fresh data.`,
      impact: {
        performance: 'Improve model accuracy by 5-15%',
        cost: 'Training compute costs: $100-300',
        risk: 'Low risk - current model remains as fallback'
      },
      implementation: {
        effort: 'high',
        timeline: '4-8 hours',
        steps: [
          'Collect recent training data',
          'Validate data quality',
          'Retrain model with updated dataset',
          'A/B test new model against current',
          'Deploy if performance improves'
        ],
        rollback: [
          'Revert to previous model version',
          'Verify prediction quality',
          'Monitor model performance'
        ]
      },
      metrics: {
        current: { accuracy: avgAccuracy },
        projected: { accuracy: Math.min(0.95, avgAccuracy + 0.1) },
        confidence: 70
      },
      createdAt: new Date(),
      status: 'pending'
    };
  }

  private generateStorageOptimizationRecommendation(diskMetrics: PerformanceMetric[]): OptimizationRecommendation | null {
    if (diskMetrics.length === 0) return null;

    const highDiskMetrics = diskMetrics.filter(m => m.value > 85);
    if (highDiskMetrics.length === 0) return null;

    const avgUtilization = diskMetrics.reduce((sum, m) => sum + m.value, 0) / diskMetrics.length;

    return {
      id: generateId('storage_optimization'),
      type: 'resource',
      priority: avgUtilization > 95 ? 'critical' : 'medium',
      title: 'Storage Optimization',
      description: `High disk utilization detected (${avgUtilization.toFixed(1)}%). Clean up or expand storage.`,
      impact: {
        performance: 'Improve I/O performance and prevent outages',
        cost: 'Storage expansion costs: $50-200/month',
        risk: 'Low risk - data cleanup and expansion'
      },
      implementation: {
        effort: 'medium',
        timeline: '2-4 hours',
        steps: [
          'Analyze disk usage patterns',
          'Clean up temporary files',
          'Archive old logs',
          'Implement log rotation',
          'Consider storage expansion'
        ],
        rollback: [
          'Restore archived data if needed',
          'Adjust log retention policies'
        ]
      },
      metrics: {
        current: { disk_utilization: avgUtilization },
        projected: { disk_utilization: Math.max(60, avgUtilization * 0.7) },
        confidence: 80
      },
      createdAt: new Date(),
      status: 'pending'
    };
  }

  private generateNetworkOptimizationRecommendation(networkMetrics: PerformanceMetric[]): OptimizationRecommendation | null {
    if (networkMetrics.length === 0) return null;

    const highNetworkMetrics = networkMetrics.filter(m => m.value > 85);
    if (highNetworkMetrics.length === 0) return null;

    const avgUtilization = networkMetrics.reduce((sum, m) => sum + m.value, 0) / networkMetrics.length;

    return {
      id: generateId('network_optimization'),
      type: 'configuration',
      priority: avgUtilization > 95 ? 'high' : 'medium',
      title: 'Network Optimization',
      description: `High network utilization detected (${avgUtilization.toFixed(1)}%). Optimize network usage.`,
      impact: {
        performance: 'Reduce network latency and improve throughput',
        cost: 'Minimal configuration costs',
        risk: 'Low risk - configuration optimization'
      },
      implementation: {
        effort: 'medium',
        timeline: '1-3 hours',
        steps: [
          'Analyze network traffic patterns',
          'Optimize data compression',
          'Implement request batching',
          'Consider load balancing',
          'Review API efficiency'
        ],
        rollback: [
          'Restore original network configuration',
          'Verify connectivity'
        ]
      },
      metrics: {
        current: { network_utilization: avgUtilization },
        projected: { network_utilization: Math.max(60, avgUtilization * 0.8) },
        confidence: 70
      },
      createdAt: new Date(),
      status: 'pending'
    };
  }

  private generateAnomalyBasedRecommendations(anomalies: PerformanceAnomaly[]): OptimizationRecommendation[] {
    return anomalies
      .filter(anomaly => anomaly.severity > 50)
      .map(anomaly => ({
        id: generateId('anomaly_fix'),
        type: 'configuration' as const,
        priority: (anomaly.severity > 80 ? 'critical' : 'high') as const,
        title: `Fix ${anomaly.anomalyType} in ${anomaly.metric.name}`,
        description: `Detected ${anomaly.anomalyType} anomaly in ${anomaly.metric.name} with severity ${anomaly.severity.toFixed(1)}`,
        impact: {
          performance: 'Stabilize metric performance',
          cost: 'Minimal operational cost',
          risk: 'Low risk - configuration adjustment'
        },
        implementation: {
          effort: 'low' as const,
          timeline: '30-60 minutes',
          steps: [
            'Investigate root cause of anomaly',
            'Apply targeted configuration fix',
            'Monitor metric stability',
            'Document changes made'
          ],
          rollback: [
            'Revert configuration changes',
            'Verify system stability'
          ]
        },
        metrics: {
          current: { [anomaly.metric.name]: anomaly.metric.value },
          projected: { [anomaly.metric.name]: anomaly.metric.value * 0.9 },
          confidence: 60
        },
        createdAt: new Date(),
        status: 'pending' as const
      }));
  }

  // ==================== AUTO-OPTIMIZATION ====================

  private autoApplyOptimizations(recommendations: OptimizationRecommendation[]): void {
    const safeRecommendations = recommendations.filter(rec =>
      rec.priority !== 'critical' &&
      rec.implementation.effort === 'low' &&
      rec.metrics.confidence > 80
    );

    safeRecommendations.forEach(rec => {
      if (this.shouldAutoApply(rec)) {
        this.applyOptimization(rec.id);
      }
    });
  }

  private shouldAutoApply(recommendation: OptimizationRecommendation): boolean {
    // Apply safety checks
    const safetyMargin = this.config.optimization.safetyMargin / 100;

    // Check if we've had recent failures
    const recentFailures = this.optimizationHistory.filter(h =>
      h.applied.getTime() > Date.now() - 3600000 && // Last hour
      h.result === 'failed'
    ).length;

    if (recentFailures > 2) {
      return false; // Too many recent failures
    }

    // Check confidence threshold
    if (recommendation.metrics.confidence < 80) {
      return false;
    }

    // Check if optimization window is appropriate
    const now = new Date();
    const windowStart = new Date(now.getTime() - this.config.optimization.optimizationWindow);
    const recentOptimizations = this.optimizationHistory.filter(h =>
      h.applied > windowStart
    ).length;

    return recentOptimizations < 3; // Limit optimizations per window
  }

  // ==================== OPTIMIZATION EXECUTION ====================

  async applyOptimization(recommendationId: string): Promise<boolean> {
    const recommendation = this.recommendations.get(recommendationId);
    if (!recommendation) {
      return false;
    }

    try {
      recommendation.status = 'implementing';
      this.emit('optimization_started', { recommendationId, timestamp: new Date() });

      // Execute optimization steps
      await this.executeOptimizationSteps(recommendation);

      recommendation.status = 'completed';

      // Record successful optimization
      this.optimizationHistory.push({
        recommendation,
        applied: new Date(),
        result: 'success',
        impact: recommendation.metrics.projected
      });

      this.emit('optimization_completed', {
        recommendationId,
        result: 'success',
        timestamp: new Date()
      });

      return true;

    } catch (error) {
      recommendation.status = 'rejected';

      // Record failed optimization
      this.optimizationHistory.push({
        recommendation,
        applied: new Date(),
        result: 'failed',
        impact: {}
      });

      this.emit('optimization_failed', {
        recommendationId,
        error,
        timestamp: new Date()
      });

      // Auto-rollback if enabled
      if (this.config.optimization.rollbackEnabled) {
        await this.rollbackOptimization(recommendation);
      }

      return false;
    }
  }

  private async executeOptimizationSteps(recommendation: OptimizationRecommendation): Promise<void> {
    for (const step of recommendation.implementation.steps) {
      // Simulate step execution - in real implementation, perform actual optimization
      await new Promise(resolve => setTimeout(resolve, 1000));

      this.emit('optimization_step_completed', {
        recommendationId: recommendation.id,
        step,
        timestamp: new Date()
      });
    }
  }

  private async rollbackOptimization(recommendation: OptimizationRecommendation): Promise<void> {
    try {
      for (const step of recommendation.implementation.rollback) {
        // Simulate rollback step
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Update history
      const historyEntry = this.optimizationHistory.find(h =>
        h.recommendation.id === recommendation.id &&
        h.result === 'failed'
      );

      if (historyEntry) {
        historyEntry.result = 'rolled_back';
      }

      this.emit('optimization_rolled_back', {
        recommendationId: recommendation.id,
        timestamp: new Date()
      });

    } catch (error) {
      this.emit('rollback_failed', {
        recommendationId: recommendation.id,
        error,
        timestamp: new Date()
      });
    }
  }

  // ==================== PUBLIC API METHODS ====================

  /**
   * Get optimization recommendations with optional filtering
   */
  getRecommendations(filter?: OptimizationFilter): OptimizationRecommendation[] {
    let recommendations = Array.from(this.recommendations.values());

    if (filter) {
      if (filter.type) {
        recommendations = recommendations.filter(rec => rec.type === filter.type);
      }
      if (filter.priority) {
        recommendations = recommendations.filter(rec => rec.priority === filter.priority);
      }
      if (filter.status) {
        recommendations = recommendations.filter(rec => rec.status === filter.status);
      }
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Get optimization history
   */
  getOptimizationHistory(): OptimizationHistory[] {
    return [...this.optimizationHistory].sort((a, b) => b.applied.getTime() - a.applied.getTime());
  }

  /**
   * Get performance baselines
   */
  getBaselines(): PerformanceBaseline[] {
    return Array.from(this.baselines.values());
  }

  /**
   * Get specific baseline by metric name
   */
  getBaseline(metricName: string): PerformanceBaseline | undefined {
    return this.baselines.get(metricName);
  }

  /**
   * Get optimization statistics
   */
  getOptimizationStatistics(): {
    totalRecommendations: number;
    pending: number;
    completed: number;
    failed: number;
    successRate: number;
    averageConfidence: number;
  } {
    const recommendations = Array.from(this.recommendations.values());
    const history = this.optimizationHistory;

    const pending = recommendations.filter(r => r.status === 'pending').length;
    const completed = history.filter(h => h.result === 'success').length;
    const failed = history.filter(h => h.result === 'failed').length;
    const successRate = history.length > 0 ? (completed / history.length) * 100 : 0;
    const avgConfidence = recommendations.length > 0
      ? recommendations.reduce((sum, r) => sum + r.metrics.confidence, 0) / recommendations.length
      : 0;

    return {
      totalRecommendations: recommendations.length,
      pending,
      completed,
      failed,
      successRate,
      averageConfidence: avgConfidence
    };
  }

  /**
   * Clear old recommendations and history
   */
  cleanup(olderThan: Date): number {
    const initialRecommendations = this.recommendations.size;
    const initialHistory = this.optimizationHistory.length;

    // Clear old completed/rejected recommendations
    for (const [id, rec] of this.recommendations.entries()) {
      if ((rec.status === 'completed' || rec.status === 'rejected') && rec.createdAt < olderThan) {
        this.recommendations.delete(id);
      }
    }

    // Clear old history
    this.optimizationHistory = this.optimizationHistory.filter(h => h.applied >= olderThan);

    // Clear old baselines
    for (const [metric, baseline] of this.baselines.entries()) {
      if (baseline.validUntil < new Date()) {
        this.baselines.delete(metric);
      }
    }

    const clearedRecommendations = initialRecommendations - this.recommendations.size;
    const clearedHistory = initialHistory - this.optimizationHistory.length;

    this.emit('cleanup_completed', {
      clearedRecommendations,
      clearedHistory,
      timestamp: new Date()
    });

    return clearedRecommendations + clearedHistory;
  }
}