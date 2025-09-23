/**
 * Business Insights Generation Module
 * Generates actionable business insights from analytics data
 */

import { BusinessInsight, TrendAnalysis, AnomalyDetection } from './types';

export class InsightsGenerator {
  /**
   * Generate business insights from analytics data
   */
  async generateInsights(
    trends: Record<string, TrendAnalysis>,
    anomalies: Record<string, AnomalyDetection[]>
  ): Promise<BusinessInsight[]> {
    const insights: BusinessInsight[] = [];

    // Analyze trends for insights
    for (const [metricId, trend] of Object.entries(trends)) {
      // Performance insights
      if (metricId.includes('response_time') || metricId.includes('latency')) {
        if (trend.trend === 'increasing' && trend.changePercentage > 20) {
          insights.push({
            id: this.generateInsightId(),
            title: 'Increasing Response Time Detected',
            description: `Response time has increased by ${trend.changePercentage.toFixed(1)}% over the analyzed period`,
            category: 'performance',
            priority: trend.changePercentage > 50 ? 'critical' : 'high',
            confidence: trend.trendStrength,
            impact: 'negative',
            recommendations: [
              'Investigate system load and resource utilization',
              'Review recent deployments that might affect performance',
              'Consider scaling infrastructure resources'
            ],
            relatedMetrics: [metricId],
            generatedAt: new Date()
          });
        }
      }

      // Usage insights
      if (metricId.includes('usage') || metricId.includes('requests')) {
        if (trend.trend === 'increasing' && trend.changePercentage > 30) {
          insights.push({
            id: this.generateInsightId(),
            title: 'Growing System Usage',
            description: `System usage has grown by ${trend.changePercentage.toFixed(1)}%, indicating increased adoption`,
            category: 'usage',
            priority: 'medium',
            confidence: trend.trendStrength,
            impact: 'positive',
            recommendations: [
              'Plan for capacity scaling to handle continued growth',
              'Monitor resource utilization to prevent bottlenecks',
              'Consider implementing caching strategies'
            ],
            relatedMetrics: [metricId],
            generatedAt: new Date()
          });
        }
      }

      // Cost insights
      if (metricId.includes('cost') || metricId.includes('expense')) {
        if (trend.trend === 'increasing' && trend.changePercentage > 25) {
          insights.push({
            id: this.generateInsightId(),
            title: 'Rising Infrastructure Costs',
            description: `Infrastructure costs have increased by ${trend.changePercentage.toFixed(1)}%`,
            category: 'cost',
            priority: 'high',
            confidence: trend.trendStrength,
            impact: 'negative',
            recommendations: [
              'Review resource allocation and optimization opportunities',
              'Identify unused or underutilized resources',
              'Consider cost-effective alternatives or reserved instances'
            ],
            relatedMetrics: [metricId],
            generatedAt: new Date()
          });
        }
      }

      // Quality insights
      if (metricId.includes('error') || metricId.includes('failure')) {
        if (trend.trend === 'increasing' && trend.changePercentage > 15) {
          insights.push({
            id: this.generateInsightId(),
            title: 'Increasing Error Rate',
            description: `Error rate has increased by ${trend.changePercentage.toFixed(1)}%`,
            category: 'quality',
            priority: 'critical',
            confidence: trend.trendStrength,
            impact: 'negative',
            recommendations: [
              'Investigate root causes of increasing errors',
              'Review recent code deployments for potential issues',
              'Implement additional monitoring and alerting'
            ],
            relatedMetrics: [metricId],
            generatedAt: new Date()
          });
        }
      }
    }

    // Analyze anomalies for insights
    for (const [metricId, metricAnomalies] of Object.entries(anomalies)) {
      const criticalAnomalies = metricAnomalies.filter(a => a.severity === 'critical');
      
      if (criticalAnomalies.length > 0) {
        insights.push({
          id: this.generateInsightId(),
          title: 'Critical Anomalies Detected',
          description: `${criticalAnomalies.length} critical anomalies detected in ${metricId}`,
          category: 'quality',
          priority: 'critical',
          confidence: 0.9,
          impact: 'negative',
          recommendations: [
            'Immediately investigate the root cause of anomalies',
            'Review system logs for error patterns',
            'Consider implementing automated remediation'
          ],
          relatedMetrics: [metricId],
          generatedAt: new Date(),
          metadata: { anomalies: criticalAnomalies.length }
        });
      }

      // Pattern-based insights for anomalies
      if (metricAnomalies.length > 5) {
        const recentAnomalies = metricAnomalies.filter(a => 
          a.timestamp.getTime() > Date.now() - 24 * 60 * 60 * 1000
        );

        if (recentAnomalies.length > 3) {
          insights.push({
            id: this.generateInsightId(),
            title: 'Frequent Anomalies Pattern',
            description: `Multiple anomalies (${recentAnomalies.length}) detected in ${metricId} within the last 24 hours`,
            category: 'quality',
            priority: 'high',
            confidence: 0.8,
            impact: 'negative',
            recommendations: [
              'Investigate if there\'s a pattern causing frequent anomalies',
              'Check for system instability or external factors',
              'Consider adjusting anomaly detection thresholds if appropriate'
            ],
            relatedMetrics: [metricId],
            generatedAt: new Date(),
            metadata: { 
              recentAnomalies: recentAnomalies.length,
              timeframe: '24h'
            }
          });
        }
      }
    }

    return this.sortInsightsByPriority(insights);
  }

  /**
   * Generate performance-specific insights
   */
  async generatePerformanceInsights(trends: Record<string, TrendAnalysis>): Promise<BusinessInsight[]> {
    const insights: BusinessInsight[] = [];

    for (const [metricId, trend] of Object.entries(trends)) {
      if (this.isPerformanceMetric(metricId)) {
        if (trend.trend === 'increasing' && trend.changePercentage > 10) {
          const severity = this.calculatePerformanceSeverity(trend.changePercentage);
          
          insights.push({
            id: this.generateInsightId(),
            title: `Performance Degradation in ${this.getMetricDisplayName(metricId)}`,
            description: `${this.getMetricDisplayName(metricId)} has degraded by ${trend.changePercentage.toFixed(1)}%`,
            category: 'performance',
            priority: severity,
            confidence: trend.trendStrength,
            impact: 'negative',
            recommendations: this.getPerformanceRecommendations(metricId, trend.changePercentage),
            relatedMetrics: [metricId],
            generatedAt: new Date()
          });
        }
      }
    }

    return insights;
  }

  private generateInsightId(): string {
    return `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sortInsightsByPriority(insights: BusinessInsight[]): BusinessInsight[] {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    
    return insights.sort((a, b) => {
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      return b.confidence - a.confidence;
    });
  }

  private isPerformanceMetric(metricId: string): boolean {
    const performanceKeywords = [
      'response_time', 'latency', 'duration', 'processing_time',
      'throughput', 'requests_per_second', 'cpu_usage', 'memory_usage'
    ];
    
    return performanceKeywords.some(keyword => metricId.includes(keyword));
  }

  private calculatePerformanceSeverity(changePercentage: number): BusinessInsight['priority'] {
    if (changePercentage > 75) return 'critical';
    if (changePercentage > 50) return 'high';
    if (changePercentage > 25) return 'medium';
    return 'low';
  }

  private getMetricDisplayName(metricId: string): string {
    return metricId
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  private getPerformanceRecommendations(metricId: string, changePercentage: number): string[] {
    const baseRecommendations = [
      'Monitor system resources and identify bottlenecks',
      'Review recent changes that might impact performance'
    ];

    if (metricId.includes('cpu')) {
      baseRecommendations.push(
        'Consider CPU optimization or scaling',
        'Review CPU-intensive operations and algorithms'
      );
    } else if (metricId.includes('memory')) {
      baseRecommendations.push(
        'Investigate memory leaks or excessive memory usage',
        'Consider memory optimization or scaling'
      );
    } else if (metricId.includes('response_time') || metricId.includes('latency')) {
      baseRecommendations.push(
        'Optimize database queries and API calls',
        'Implement caching strategies',
        'Consider load balancing improvements'
      );
    }

    if (changePercentage > 50) {
      baseRecommendations.push('Consider immediate scaling or emergency measures');
    }

    return baseRecommendations;
  }
}
