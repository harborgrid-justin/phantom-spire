/**
 * Utility functions for Bias Detection Engine
 */

import { BiasMetric } from '../../../../../lib/ml-core/types';

export class BiasUtils {
  /**
   * Get color for bias status
   */
  static getStatusColor(status: string): string {
    switch (status) {
      case 'good':
      case 'pass':
        return 'green';
      case 'moderate':
      case 'warning':
        return 'orange';
      case 'high_bias':
      case 'fail':
        return 'red';
      default:
        return 'grey';
    }
  }

  /**
   * Get icon for bias status
   */
  static getStatusIcon(status: string): string {
    switch (status) {
      case 'good':
      case 'pass':
        return '✓';
      case 'moderate':
      case 'warning':
        return '⚠';
      case 'high_bias':
      case 'fail':
        return '✗';
      default:
        return '?';
    }
  }

  /**
   * Calculate overall bias score
   */
  static calculateOverallScore(metrics: BiasMetric[]): number {
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / metrics.length;
  }

  /**
   * Determine status based on score
   */
  static determineStatus(score: number): string {
    if (score >= 0.8) return 'good';
    if (score >= 0.6) return 'moderate';
    return 'high_bias';
  }

  /**
   * Format percentage
   */
  static formatPercentage(value: number): string {
    return `${(value * 100).toFixed(1)}%`;
  }

  /**
   * Format score with color coding
   */
  static formatScoreWithColor(value: number): { score: string; color: string } {
    const score = this.formatPercentage(value);
    let color = 'green';
    
    if (value < 0.6) color = 'red';
    else if (value < 0.8) color = 'orange';
    
    return { score, color };
  }

  /**
   * Get recommendation priority level
   */
  static getRecommendationPriority(recommendation: string): 'high' | 'medium' | 'low' {
    if (recommendation.toLowerCase().includes('urgent') || 
        recommendation.toLowerCase().includes('immediate')) {
      return 'high';
    }
    if (recommendation.toLowerCase().includes('retrain') || 
        recommendation.toLowerCase().includes('bias')) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Sort recommendations by priority
   */
  static sortRecommendationsByPriority(recommendations: string[]): string[] {
    return [...recommendations].sort((a, b) => {
      const priorityA = this.getRecommendationPriority(a);
      const priorityB = this.getRecommendationPriority(b);
      
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[priorityA] - priorityOrder[priorityB];
    });
  }
}