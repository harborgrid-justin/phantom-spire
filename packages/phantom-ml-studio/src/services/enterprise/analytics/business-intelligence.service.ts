/**
 * Business Intelligence Analytics Engine
 * Advanced analytics for ROI calculation, cost-benefit analysis, performance forecasting,
 * resource optimization, and comprehensive business metrics
 */

import { EventEmitter } from 'events';
import { enterpriseStateManager } from '../state/enterprise-state-manager.service';
import { persistenceService } from '../persistence/enterprise-persistence.service';
import { mlCoreManager } from '../../../lib/ml-core';

// ==================== BUSINESS INTELLIGENCE TYPES ====================

export interface ROIMetrics {
  initialInvestment: number;
  operationalCosts: number;
  revenue: number;
  savings: number;
  roi: number;
  npv: number;
  irr: number;
  paybackPeriod: number; // months
  timeToValue: number; // months
  breakEvenPoint: Date;
  projectedReturns: {
    year1: number;
    year2: number;
    year3: number;
    year5: number;
  };
}

export interface CostBenefitAnalysis {
  totalCosts: {
    development: number;
    infrastructure: number;
    maintenance: number;
    personnel: number;
    licensing: number;
    total: number;
  };
  totalBenefits: {
    costSavings: number;
    revenueIncrease: number;
    efficiency: number;
    riskReduction: number;
    total: number;
  };
  netBenefit: number;
  benefitCostRatio: number;
  sensitivityAnalysis: {
    pessimistic: number;
    realistic: number;
    optimistic: number;
  };
  riskAssessment: {
    probability: number;
    impact: number;
    mitigation: string[];
  };
}

export interface PerformanceForecast {
  forecast: {
    accuracy: TimeSeries;
    throughput: TimeSeries;
    latency: TimeSeries;
    errorRate: TimeSeries;
    resourceUtilization: TimeSeries;
  };
  seasonality: {
    detected: boolean;
    pattern: 'weekly' | 'monthly' | 'quarterly' | 'none';
    strength: number;
  };
  trends: {
    accuracy: TrendAnalysis;
    throughput: TrendAnalysis;
    latency: TrendAnalysis;
  };
  confidence: {
    level: number;
    intervals: Record<string, [number, number]>;
  };
  recommendations: string[];
}

export interface TimeSeries {
  timestamps: Date[];
  values: number[];
  predicted: boolean[];
  confidence?: number[];
}

export interface TrendAnalysis {
  direction: 'increasing' | 'decreasing' | 'stable';
  slope: number;
  correlation: number;
  significance: number;
  changeRate: number; // percentage
}

export interface ResourceOptimization {
  current: ResourceUtilization;
  optimized: ResourceUtilization;
  recommendations: OptimizationRecommendation[];
  potentialSavings: {
    monthly: number;
    annual: number;
    percentage: number;
  };
  implementation: {
    priority: 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
    timeline: string;
    risks: string[];
  };
}

export interface ResourceUtilization {
  cpu: {
    allocated: number;
    used: number;
    efficiency: number;
    cost: number;
  };
  memory: {
    allocated: number;
    used: number;
    efficiency: number;
    cost: number;
  };
  storage: {
    allocated: number;
    used: number;
    efficiency: number;
    cost: number;
  };
  network: {
    bandwidth: number;
    used: number;
    efficiency: number;
    cost: number;
  };
}

export interface OptimizationRecommendation {
  type: 'scale_down' | 'scale_up' | 'rightsizing' | 'consolidation' | 'migration';
  resource: 'cpu' | 'memory' | 'storage' | 'network';
  currentValue: number;
  recommendedValue: number;
  savings: number;
  impact: string;
  confidence: number;
}

export interface BusinessMetrics {
  financial: {
    revenue: number;
    costs: number;
    profit: number;
    margins: number;
  };
  operational: {
    uptime: number;
    throughput: number;
    efficiency: number;
    quality: number;
  };
  customer: {
    satisfaction: number;
    retention: number;
    acquisition: number;
    lifetime_value: number;
  };
  innovation: {
    time_to_market: number;
    feature_velocity: number;
    automation_level: number;
    tech_debt: number;
  };
  risk: {
    security_score: number;
    compliance_score: number;
    operational_risk: number;
    business_continuity: number;
  };
}

export interface AnalyticsConfiguration {
  timeHorizon: number; // months
  discountRate: number; // percentage
  inflationRate: number; // percentage
  riskFactor: number; // multiplier
  confidenceLevel: number; // percentage
  forecastingMethod: 'linear' | 'exponential' | 'arima' | 'lstm';
  updateFrequency: 'daily' | 'weekly' | 'monthly';
}

// ==================== ANALYTICS ENGINES ====================

export class ROICalculator {
  private config: AnalyticsConfiguration;

  constructor(config: AnalyticsConfiguration) {
    this.config = config;
  }

  async calculateROI(investmentData: {
    initialInvestment: number;
    monthlyOperationalCosts: number;
    projectedMonthlySavings: number;
    projectedMonthlyRevenue: number;
  }): Promise<ROIMetrics> {
    const { initialInvestment, monthlyOperationalCosts, projectedMonthlySavings, projectedMonthlyRevenue } = investmentData;
    const timeHorizon = this.config.timeHorizon;
    const discountRate = this.config.discountRate / 100 / 12; // monthly rate

    // Calculate cash flows
    const monthlyCashFlow = projectedMonthlySavings + projectedMonthlyRevenue - monthlyOperationalCosts;
    const totalOperationalCosts = monthlyOperationalCosts * timeHorizon;
    const totalSavings = projectedMonthlySavings * timeHorizon;
    const totalRevenue = projectedMonthlyRevenue * timeHorizon;

    // Calculate ROI
    const totalBenefits = totalSavings + totalRevenue;
    const totalCosts = initialInvestment + totalOperationalCosts;
    const roi = ((totalBenefits - totalCosts) / totalCosts) * 100;

    // Calculate NPV
    let npv = -initialInvestment;
    for (let month = 1; month <= timeHorizon; month++) {
      npv += monthlyCashFlow / Math.pow(1 + discountRate, month);
    }

    // Calculate IRR (simplified Newton's method)
    const irr = this.calculateIRR(initialInvestment, monthlyCashFlow, timeHorizon);

    // Calculate payback period
    let cumulativeCashFlow = -initialInvestment;
    let paybackPeriod = 0;
    for (let month = 1; month <= timeHorizon; month++) {
      cumulativeCashFlow += monthlyCashFlow;
      if (cumulativeCashFlow >= 0) {
        paybackPeriod = month;
        break;
      }
    }

    // Calculate time to value (when NPV becomes positive)
    let timeToValue = 0;
    let cumulativeNPV = -initialInvestment;
    for (let month = 1; month <= timeHorizon; month++) {
      cumulativeNPV += monthlyCashFlow / Math.pow(1 + discountRate, month);
      if (cumulativeNPV >= 0) {
        timeToValue = month;
        break;
      }
    }

    const breakEvenPoint = new Date();
    breakEvenPoint.setMonth(breakEvenPoint.getMonth() + paybackPeriod);

    return {
      initialInvestment,
      operationalCosts: totalOperationalCosts,
      revenue: totalRevenue,
      savings: totalSavings,
      roi,
      npv,
      irr,
      paybackPeriod,
      timeToValue,
      breakEvenPoint,
      projectedReturns: {
        year1: monthlyCashFlow * 12,
        year2: monthlyCashFlow * 12 * 1.1, // Assume 10% growth
        year3: monthlyCashFlow * 12 * 1.21,
        year5: monthlyCashFlow * 12 * 1.46
      }
    };
  }

  private calculateIRR(initialInvestment: number, monthlyCashFlow: number, periods: number): number {
    // Simplified IRR calculation using Newton's method
    let irr = 0.1; // Initial guess
    const tolerance = 0.0001;
    const maxIterations = 100;

    for (let i = 0; i < maxIterations; i++) {
      let npv = -initialInvestment;
      let derivative = 0;

      for (let month = 1; month <= periods; month++) {
        npv += monthlyCashFlow / Math.pow(1 + irr, month);
        derivative -= (month * monthlyCashFlow) / Math.pow(1 + irr, month + 1);
      }

      if (Math.abs(npv) < tolerance) {
        break;
      }

      irr = irr - npv / derivative;
    }

    return irr * 12 * 100; // Convert to annual percentage
  }
}

export class CostBenefitAnalyzer {
  private config: AnalyticsConfiguration;

  constructor(config: AnalyticsConfiguration) {
    this.config = config;
  }

  async analyzeCostBenefit(data: {
    costs: {
      development: number;
      infrastructure: number;
      maintenance: number;
      personnel: number;
      licensing: number;
    };
    benefits: {
      costSavings: number;
      revenueIncrease: number;
      efficiency: number;
      riskReduction: number;
    };
  }): Promise<CostBenefitAnalysis> {
    const { costs, benefits } = data;

    const totalCosts = {
      ...costs,
      total: Object.values(costs).reduce((sum, cost) => sum + cost, 0)
    };

    const totalBenefits = {
      ...benefits,
      total: Object.values(benefits).reduce((sum, benefit) => sum + benefit, 0)
    };

    const netBenefit = totalBenefits.total - totalCosts.total;
    const benefitCostRatio = totalBenefits.total / totalCosts.total;

    // Sensitivity analysis
    const sensitivityAnalysis = {
      pessimistic: (totalBenefits.total * 0.7) / (totalCosts.total * 1.3),
      realistic: benefitCostRatio,
      optimistic: (totalBenefits.total * 1.3) / (totalCosts.total * 0.7)
    };

    // Risk assessment
    const riskAssessment = {
      probability: this.assessRiskProbability(benefitCostRatio),
      impact: this.assessRiskImpact(totalCosts.total),
      mitigation: this.generateRiskMitigation(benefitCostRatio)
    };

    return {
      totalCosts,
      totalBenefits,
      netBenefit,
      benefitCostRatio,
      sensitivityAnalysis,
      riskAssessment
    };
  }

  private assessRiskProbability(ratio: number): number {
    if (ratio > 3) return 0.1; // Low risk
    if (ratio > 2) return 0.3; // Medium risk
    if (ratio > 1.5) return 0.5; // Moderate risk
    return 0.8; // High risk
  }

  private assessRiskImpact(totalCosts: number): number {
    // Impact assessment based on investment size
    if (totalCosts > 10000000) return 0.9; // Very high impact
    if (totalCosts > 1000000) return 0.7; // High impact
    if (totalCosts > 100000) return 0.5; // Medium impact
    return 0.3; // Low impact
  }

  private generateRiskMitigation(ratio: number): string[] {
    const mitigations: string[] = [];

    if (ratio < 2) {
      mitigations.push('Implement phased deployment to reduce initial investment');
      mitigations.push('Establish clear success metrics and checkpoints');
      mitigations.push('Consider pilot programs before full implementation');
    }

    if (ratio < 1.5) {
      mitigations.push('Review and optimize cost structure');
      mitigations.push('Identify additional revenue opportunities');
      mitigations.push('Consider alternative approaches with lower costs');
    }

    mitigations.push('Regular monitoring and course correction');
    mitigations.push('Contingency planning for unexpected costs');

    return mitigations;
  }
}

export class PerformanceForecaster {
  private config: AnalyticsConfiguration;

  constructor(config: AnalyticsConfiguration) {
    this.config = config;
  }

  async generateForecast(historicalData: {
    accuracy: Array<{ timestamp: Date; value: number }>;
    throughput: Array<{ timestamp: Date; value: number }>;
    latency: Array<{ timestamp: Date; value: number }>;
  }): Promise<PerformanceForecast> {
    const forecastPeriods = this.config.timeHorizon;

    // Generate forecasts for each metric
    const accuracyForecast = this.forecastTimeSeries(historicalData.accuracy, forecastPeriods);
    const throughputForecast = this.forecastTimeSeries(historicalData.throughput, forecastPeriods);
    const latencyForecast = this.forecastTimeSeries(historicalData.latency, forecastPeriods);

    // Detect seasonality
    const seasonality = this.detectSeasonality(historicalData.throughput);

    // Analyze trends
    const trends = {
      accuracy: this.analyzeTrend(historicalData.accuracy),
      throughput: this.analyzeTrend(historicalData.throughput),
      latency: this.analyzeTrend(historicalData.latency)
    };

    // Calculate confidence intervals
    const confidence = {
      level: this.config.confidenceLevel,
      intervals: {
        accuracy: this.calculateConfidenceInterval(accuracyForecast.values),
        throughput: this.calculateConfidenceInterval(throughputForecast.values),
        latency: this.calculateConfidenceInterval(latencyForecast.values)
      }
    };

    // Generate recommendations
    const recommendations = this.generatePerformanceRecommendations(trends, seasonality);

    return {
      forecast: {
        accuracy: accuracyForecast,
        throughput: throughputForecast,
        latency: latencyForecast,
        errorRate: this.generateErrorRateForecast(forecastPeriods),
        resourceUtilization: this.generateResourceForecast(forecastPeriods)
      },
      seasonality,
      trends,
      confidence,
      recommendations
    };
  }

  private forecastTimeSeries(
    historicalData: Array<{ timestamp: Date; value: number }>,
    periods: number
  ): TimeSeries {
    // Simple linear regression for forecasting
    const n = historicalData.length;
    const x = historicalData.map((_, i) => i);
    const y = historicalData.map(d => d.value);

    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Generate forecast
    const timestamps: Date[] = [];
    const values: number[] = [];
    const predicted: boolean[] = [];
    const confidence: number[] = [];

    const lastTimestamp = historicalData[historicalData.length - 1].timestamp;

    for (let i = 0; i < periods; i++) {
      const nextTimestamp = new Date(lastTimestamp);
      nextTimestamp.setMonth(nextTimestamp.getMonth() + i + 1);

      const forecastValue = intercept + slope * (n + i);
      const confidenceLevel = Math.max(0.5, 1 - (i * 0.1)); // Decreasing confidence over time

      timestamps.push(nextTimestamp);
      values.push(Math.max(0, forecastValue)); // Ensure non-negative
      predicted.push(true);
      confidence.push(confidenceLevel);
    }

    return { timestamps, values, predicted, confidence };
  }

  private detectSeasonality(data: Array<{ timestamp: Date; value: number }>): PerformanceForecast['seasonality'] {
    if (data.length < 12) {
      return { detected: false, pattern: 'none', strength: 0 };
    }

    // Simple seasonality detection based on monthly patterns
    const monthlyAvg = new Array(12).fill(0);
    const monthlyCount = new Array(12).fill(0);

    data.forEach(point => {
      const month = point.timestamp.getMonth();
      monthlyAvg[month] += point.value;
      monthlyCount[month]++;
    });

    monthlyAvg.forEach((sum, i) => {
      monthlyAvg[i] = monthlyCount[i] > 0 ? sum / monthlyCount[i] : 0;
    });

    const overallAvg = monthlyAvg.reduce((sum, val) => sum + val, 0) / 12;
    const variance = monthlyAvg.reduce((sum, val) => sum + Math.pow(val - overallAvg, 2), 0) / 12;
    const strength = Math.sqrt(variance) / overallAvg;

    return {
      detected: strength > 0.1,
      pattern: strength > 0.2 ? 'monthly' : 'none',
      strength
    };
  }

  private analyzeTrend(data: Array<{ timestamp: Date; value: number }>): TrendAnalysis {
    if (data.length < 2) {
      return { direction: 'stable', slope: 0, correlation: 0, significance: 0, changeRate: 0 };
    }

    const n = data.length;
    const x = data.map((_, i) => i);
    const y = data.map(d => d.value);

    // Calculate linear regression
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    const sumYY = y.reduce((sum, val) => sum + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const correlation = (n * sumXY - sumX * sumY) /
      Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

    const direction = slope > 0.01 ? 'increasing' : slope < -0.01 ? 'decreasing' : 'stable';
    const significance = Math.abs(correlation);

    const firstValue = y[0];
    const lastValue = y[y.length - 1];
    const changeRate = firstValue !== 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;

    return { direction, slope, correlation, significance, changeRate };
  }

  private calculateConfidenceInterval(values: number[]): [number, number] {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // 95% confidence interval
    const margin = 1.96 * stdDev;
    return [mean - margin, mean + margin];
  }

  private generateErrorRateForecast(periods: number): TimeSeries {
    // Generate synthetic error rate forecast
    const timestamps: Date[] = [];
    const values: number[] = [];
    const predicted: boolean[] = [];

    const baseErrorRate = 0.02; // 2% base error rate
    const now = new Date();

    for (let i = 0; i < periods; i++) {
      const timestamp = new Date(now);
      timestamp.setMonth(timestamp.getMonth() + i + 1);

      // Simulate slight increase in error rate over time
      const errorRate = baseErrorRate + (i * 0.001);

      timestamps.push(timestamp);
      values.push(errorRate);
      predicted.push(true);
    }

    return { timestamps, values, predicted };
  }

  private generateResourceForecast(periods: number): TimeSeries {
    // Generate synthetic resource utilization forecast
    const timestamps: Date[] = [];
    const values: number[] = [];
    const predicted: boolean[] = [];

    const baseUtilization = 0.65; // 65% base utilization
    const now = new Date();

    for (let i = 0; i < periods; i++) {
      const timestamp = new Date(now);
      timestamp.setMonth(timestamp.getMonth() + i + 1);

      // Simulate gradual increase in resource utilization
      const utilization = Math.min(0.95, baseUtilization + (i * 0.02));

      timestamps.push(timestamp);
      values.push(utilization);
      predicted.push(true);
    }

    return { timestamps, values, predicted };
  }

  private generatePerformanceRecommendations(
    trends: PerformanceForecast['trends'],
    seasonality: PerformanceForecast['seasonality']
  ): string[] {
    const recommendations: string[] = [];

    if (trends.accuracy.direction === 'decreasing') {
      recommendations.push('Model accuracy is declining - consider retraining with fresh data');
      recommendations.push('Implement data drift monitoring to catch performance degradation early');
    }

    if (trends.throughput.direction === 'decreasing') {
      recommendations.push('Throughput is declining - investigate infrastructure constraints');
      recommendations.push('Consider horizontal scaling or performance optimization');
    }

    if (trends.latency.direction === 'increasing') {
      recommendations.push('Latency is increasing - review system performance and optimize bottlenecks');
      recommendations.push('Consider caching strategies or compute resource upgrades');
    }

    if (seasonality.detected) {
      recommendations.push(`Seasonal patterns detected - plan capacity for ${seasonality.pattern} variations`);
      recommendations.push('Implement predictive scaling based on seasonal patterns');
    }

    if (recommendations.length === 0) {
      recommendations.push('System performance is stable - maintain current monitoring practices');
      recommendations.push('Consider proactive optimization to improve efficiency');
    }

    return recommendations;
  }
}

export class ResourceOptimizer {
  private config: AnalyticsConfiguration;

  constructor(config: AnalyticsConfiguration) {
    this.config = config;
  }

  async optimizeResources(currentUtilization: ResourceUtilization): Promise<ResourceOptimization> {
    const recommendations = this.generateOptimizationRecommendations(currentUtilization);
    const optimizedUtilization = this.applyOptimizations(currentUtilization, recommendations);
    const potentialSavings = this.calculateSavings(currentUtilization, optimizedUtilization);

    return {
      current: currentUtilization,
      optimized: optimizedUtilization,
      recommendations,
      potentialSavings,
      implementation: {
        priority: this.calculatePriority(potentialSavings.percentage),
        effort: this.calculateEffort(recommendations.length),
        timeline: this.estimateTimeline(recommendations.length),
        risks: this.identifyRisks(recommendations)
      }
    };
  }

  private generateOptimizationRecommendations(utilization: ResourceUtilization): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // CPU optimization
    if (utilization.cpu.efficiency < 0.6) {
      recommendations.push({
        type: 'scale_down',
        resource: 'cpu',
        currentValue: utilization.cpu.allocated,
        recommendedValue: utilization.cpu.used * 1.2, // 20% buffer
        savings: (utilization.cpu.allocated - utilization.cpu.used * 1.2) * utilization.cpu.cost / utilization.cpu.allocated,
        impact: 'Reduce CPU allocation while maintaining performance buffer',
        confidence: 0.85
      });
    }

    // Memory optimization
    if (utilization.memory.efficiency < 0.7) {
      recommendations.push({
        type: 'rightsizing',
        resource: 'memory',
        currentValue: utilization.memory.allocated,
        recommendedValue: utilization.memory.used * 1.3, // 30% buffer
        savings: (utilization.memory.allocated - utilization.memory.used * 1.3) * utilization.memory.cost / utilization.memory.allocated,
        impact: 'Optimize memory allocation based on actual usage patterns',
        confidence: 0.8
      });
    }

    // Storage optimization
    if (utilization.storage.efficiency < 0.5) {
      recommendations.push({
        type: 'consolidation',
        resource: 'storage',
        currentValue: utilization.storage.allocated,
        recommendedValue: utilization.storage.used * 1.5, // 50% buffer
        savings: (utilization.storage.allocated - utilization.storage.used * 1.5) * utilization.storage.cost / utilization.storage.allocated,
        impact: 'Consolidate storage and implement compression',
        confidence: 0.75
      });
    }

    // Network optimization
    if (utilization.network.efficiency < 0.4) {
      recommendations.push({
        type: 'rightsizing',
        resource: 'network',
        currentValue: utilization.network.bandwidth,
        recommendedValue: utilization.network.used * 2, // 100% buffer for bursts
        savings: (utilization.network.bandwidth - utilization.network.used * 2) * utilization.network.cost / utilization.network.bandwidth,
        impact: 'Adjust network bandwidth to match actual requirements',
        confidence: 0.7
      });
    }

    return recommendations;
  }

  private applyOptimizations(
    current: ResourceUtilization,
    recommendations: OptimizationRecommendation[]
  ): ResourceUtilization {
    const optimized = JSON.parse(JSON.stringify(current)); // Deep copy

    recommendations.forEach(rec => {
      switch (rec.resource) {
        case 'cpu':
          optimized.cpu.allocated = rec.recommendedValue;
          optimized.cpu.efficiency = optimized.cpu.used / optimized.cpu.allocated;
          optimized.cpu.cost = current.cpu.cost * (rec.recommendedValue / current.cpu.allocated);
          break;
        case 'memory':
          optimized.memory.allocated = rec.recommendedValue;
          optimized.memory.efficiency = optimized.memory.used / optimized.memory.allocated;
          optimized.memory.cost = current.memory.cost * (rec.recommendedValue / current.memory.allocated);
          break;
        case 'storage':
          optimized.storage.allocated = rec.recommendedValue;
          optimized.storage.efficiency = optimized.storage.used / optimized.storage.allocated;
          optimized.storage.cost = current.storage.cost * (rec.recommendedValue / current.storage.allocated);
          break;
        case 'network':
          optimized.network.bandwidth = rec.recommendedValue;
          optimized.network.efficiency = optimized.network.used / optimized.network.bandwidth;
          optimized.network.cost = current.network.cost * (rec.recommendedValue / current.network.bandwidth);
          break;
      }
    });

    return optimized;
  }

  private calculateSavings(current: ResourceUtilization, optimized: ResourceUtilization): ResourceOptimization['potentialSavings'] {
    const currentMonthlyCost = current.cpu.cost + current.memory.cost + current.storage.cost + current.network.cost;
    const optimizedMonthlyCost = optimized.cpu.cost + optimized.memory.cost + optimized.storage.cost + optimized.network.cost;

    const monthly = currentMonthlyCost - optimizedMonthlyCost;
    const annual = monthly * 12;
    const percentage = (monthly / currentMonthlyCost) * 100;

    return { monthly, annual, percentage };
  }

  private calculatePriority(savingsPercentage: number): 'high' | 'medium' | 'low' {
    if (savingsPercentage > 30) return 'high';
    if (savingsPercentage > 15) return 'medium';
    return 'low';
  }

  private calculateEffort(recommendationCount: number): 'low' | 'medium' | 'high' {
    if (recommendationCount > 6) return 'high';
    if (recommendationCount > 3) return 'medium';
    return 'low';
  }

  private estimateTimeline(recommendationCount: number): string {
    if (recommendationCount > 6) return '3-6 months';
    if (recommendationCount > 3) return '1-3 months';
    return '2-4 weeks';
  }

  private identifyRisks(recommendations: OptimizationRecommendation[]): string[] {
    const risks: string[] = [];

    const hasScaleDown = recommendations.some(r => r.type === 'scale_down');
    if (hasScaleDown) {
      risks.push('Potential performance impact during peak loads');
    }

    const hasConsolidation = recommendations.some(r => r.type === 'consolidation');
    if (hasConsolidation) {
      risks.push('Increased dependency on fewer resources');
    }

    const hasMigration = recommendations.some(r => r.type === 'migration');
    if (hasMigration) {
      risks.push('Migration downtime and complexity');
    }

    if (risks.length === 0) {
      risks.push('Minimal risks with gradual implementation');
    }

    return risks;
  }
}

// ==================== BUSINESS INTELLIGENCE SERVICE ====================

export class BusinessIntelligenceService extends EventEmitter {
  private roiCalculator: ROICalculator;
  private costBenefitAnalyzer: CostBenefitAnalyzer;
  private performanceForecaster: PerformanceForecaster;
  private resourceOptimizer: ResourceOptimizer;
  private config: AnalyticsConfiguration;
  private isInitialized = false;

  constructor(config?: Partial<AnalyticsConfiguration>) {
    super();

    this.config = {
      timeHorizon: 36, // 3 years
      discountRate: 8, // 8% annual
      inflationRate: 3, // 3% annual
      riskFactor: 1.2,
      confidenceLevel: 95,
      forecastingMethod: 'linear',
      updateFrequency: 'monthly',
      ...config
    };

    this.roiCalculator = new ROICalculator(this.config);
    this.costBenefitAnalyzer = new CostBenefitAnalyzer(this.config);
    this.performanceForecaster = new PerformanceForecaster(this.config);
    this.resourceOptimizer = new ResourceOptimizer(this.config);
  }

  async initialize(): Promise<void> {
    try {
      this.isInitialized = true;
      this.emit('initialized');
      console.log('✅ Business Intelligence Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize BI service:', error);
      throw error;
    }
  }

  async calculateROI(investmentData: {
    initialInvestment: number;
    monthlyOperationalCosts: number;
    projectedMonthlySavings: number;
    projectedMonthlyRevenue: number;
  }): Promise<ROIMetrics> {
    if (!this.isInitialized) {
      throw new Error('Service not initialized');
    }

    const metrics = await this.roiCalculator.calculateROI(investmentData);

    this.emit('roi_calculated', { metrics, timestamp: new Date() });

    return metrics;
  }

  async analyzeCostBenefit(data: {
    costs: {
      development: number;
      infrastructure: number;
      maintenance: number;
      personnel: number;
      licensing: number;
    };
    benefits: {
      costSavings: number;
      revenueIncrease: number;
      efficiency: number;
      riskReduction: number;
    };
  }): Promise<CostBenefitAnalysis> {
    if (!this.isInitialized) {
      throw new Error('Service not initialized');
    }

    const analysis = await this.costBenefitAnalyzer.analyzeCostBenefit(data);

    this.emit('cost_benefit_analyzed', { analysis, timestamp: new Date() });

    return analysis;
  }

  async generatePerformanceForecast(): Promise<PerformanceForecast> {
    if (!this.isInitialized) {
      throw new Error('Service not initialized');
    }

    // Get historical performance data
    const systemState = enterpriseStateManager.getSystemState();
    const models = enterpriseStateManager.getAllModels();

    // Generate synthetic historical data for demonstration
    const historicalData = this.generateHistoricalPerformanceData();

    const forecast = await this.performanceForecaster.generateForecast(historicalData);

    this.emit('forecast_generated', { forecast, timestamp: new Date() });

    return forecast;
  }

  async optimizeResources(): Promise<ResourceOptimization> {
    if (!this.isInitialized) {
      throw new Error('Service not initialized');
    }

    const systemState = enterpriseStateManager.getSystemState();
    if (!systemState) {
      throw new Error('System state not available');
    }

    // Convert system resource metrics to our format
    const currentUtilization: ResourceUtilization = {
      cpu: {
        allocated: 100,
        used: systemState.resources.cpu.current,
        efficiency: systemState.resources.cpu.utilization / 100,
        cost: 500 // Monthly cost in USD
      },
      memory: {
        allocated: systemState.resources.memory.available,
        used: systemState.resources.memory.current,
        efficiency: systemState.resources.memory.utilization / 100,
        cost: 200
      },
      storage: {
        allocated: systemState.resources.disk.available,
        used: systemState.resources.disk.current,
        efficiency: systemState.resources.disk.utilization / 100,
        cost: 100
      },
      network: {
        bandwidth: systemState.resources.network.available,
        used: systemState.resources.network.current,
        efficiency: systemState.resources.network.utilization / 100,
        cost: 150
      }
    };

    const optimization = await this.resourceOptimizer.optimizeResources(currentUtilization);

    this.emit('resources_optimized', { optimization, timestamp: new Date() });

    return optimization;
  }

  async generateBusinessMetrics(): Promise<BusinessMetrics> {
    if (!this.isInitialized) {
      throw new Error('Service not initialized');
    }

    const systemState = enterpriseStateManager.getSystemState();
    const models = enterpriseStateManager.getAllModels();
    const deployments = enterpriseStateManager.getAllDeployments();

    // Calculate business metrics based on current state
    const metrics: BusinessMetrics = {
      financial: {
        revenue: this.calculateRevenue(models, deployments),
        costs: this.calculateCosts(systemState),
        profit: 0, // Will be calculated
        margins: 0 // Will be calculated
      },
      operational: {
        uptime: systemState?.uptime || 0,
        throughput: this.calculateThroughput(models),
        efficiency: this.calculateEfficiency(systemState),
        quality: this.calculateQuality(models)
      },
      customer: {
        satisfaction: 87.5, // Mock data - would come from surveys
        retention: 94.2,
        acquisition: 15.3,
        lifetime_value: 45000
      },
      innovation: {
        time_to_market: this.calculateTimeToMarket(models),
        feature_velocity: this.calculateFeatureVelocity(),
        automation_level: this.calculateAutomationLevel(deployments),
        tech_debt: this.calculateTechDebt()
      },
      risk: {
        security_score: this.calculateSecurityScore(systemState),
        compliance_score: this.calculateComplianceScore(),
        operational_risk: this.calculateOperationalRisk(systemState),
        business_continuity: this.calculateBusinessContinuity(systemState)
      }
    };

    // Calculate derived metrics
    metrics.financial.profit = metrics.financial.revenue - metrics.financial.costs;
    metrics.financial.margins = metrics.financial.revenue > 0 ?
      (metrics.financial.profit / metrics.financial.revenue) * 100 : 0;

    this.emit('metrics_generated', { metrics, timestamp: new Date() });

    return metrics;
  }

  private generateHistoricalPerformanceData(): {
    accuracy: Array<{ timestamp: Date; value: number }>;
    throughput: Array<{ timestamp: Date; value: number }>;
    latency: Array<{ timestamp: Date; value: number }>;
  } {
    const now = new Date();
    const data = {
      accuracy: [] as Array<{ timestamp: Date; value: number }>,
      throughput: [] as Array<{ timestamp: Date; value: number }>,
      latency: [] as Array<{ timestamp: Date; value: number }>
    };

    // Generate 12 months of historical data
    for (let i = 11; i >= 0; i--) {
      const timestamp = new Date(now);
      timestamp.setMonth(timestamp.getMonth() - i);

      data.accuracy.push({
        timestamp,
        value: 0.85 + Math.random() * 0.1 // 85-95% accuracy
      });

      data.throughput.push({
        timestamp,
        value: 800 + Math.random() * 400 // 800-1200 requests/sec
      });

      data.latency.push({
        timestamp,
        value: 20 + Math.random() * 30 // 20-50ms latency
      });
    }

    return data;
  }

  private calculateRevenue(models: any[], deployments: any[]): number {
    // Mock revenue calculation based on model performance and deployments
    return models.reduce((total, model) => {
      const modelDeployments = deployments.filter(d => d.modelId === model.id);
      return total + (modelDeployments.length * model.accuracy * 10000);
    }, 0);
  }

  private calculateCosts(systemState: any): number {
    // Mock cost calculation based on resource usage
    if (!systemState) return 0;

    const resourceCosts = Object.values(systemState.resources).reduce((total: number, resource: any) => {
      return total + (resource.current * 0.1); // $0.10 per unit
    }, 0);

    return resourceCosts * 24 * 30; // Monthly costs
  }

  private calculateThroughput(models: any[]): number {
    return models.reduce((total, model) => total + (model.monitoring?.predictions || 0), 0) / models.length;
  }

  private calculateEfficiency(systemState: any): number {
    if (!systemState) return 0;

    const resourceEfficiencies = Object.values(systemState.resources).map((resource: any) => {
      return resource.utilization;
    });

    return resourceEfficiencies.reduce((sum: number, eff: number) => sum + eff, 0) / resourceEfficiencies.length;
  }

  private calculateQuality(models: any[]): number {
    if (models.length === 0) return 0;

    return models.reduce((total, model) => total + (model.performance?.accuracy || 0), 0) / models.length * 100;
  }

  private calculateTimeToMarket(models: any[]): number {
    // Average time from creation to deployment
    return 45; // days - mock data
  }

  private calculateFeatureVelocity(): number {
    // Features deployed per month
    return 8.5; // mock data
  }

  private calculateAutomationLevel(deployments: any[]): number {
    // Percentage of automated deployments
    return 78.5; // mock data
  }

  private calculateTechDebt(): number {
    // Technical debt score (lower is better)
    return 23.2; // mock data
  }

  private calculateSecurityScore(systemState: any): number {
    return systemState?.configuration?.security?.encryptionEnabled ? 95 : 60;
  }

  private calculateComplianceScore(): number {
    return 92.3; // mock data
  }

  private calculateOperationalRisk(systemState: any): number {
    if (!systemState) return 100;

    const healthScore = systemState.status === 'healthy' ? 10 :
                      systemState.status === 'degraded' ? 30 : 70;

    return healthScore;
  }

  private calculateBusinessContinuity(systemState: any): number {
    return systemState?.uptime ? Math.min(99.9, (systemState.uptime / (24 * 60 * 60 * 1000)) * 100) : 0;
  }

  updateConfiguration(updates: Partial<AnalyticsConfiguration>): void {
    Object.assign(this.config, updates);

    // Update all analyzers with new config
    this.roiCalculator = new ROICalculator(this.config);
    this.costBenefitAnalyzer = new CostBenefitAnalyzer(this.config);
    this.performanceForecaster = new PerformanceForecaster(this.config);
    this.resourceOptimizer = new ResourceOptimizer(this.config);

    this.emit('configuration_updated', { config: this.config, timestamp: new Date() });
  }

  getConfiguration(): AnalyticsConfiguration {
    return { ...this.config };
  }

  async cleanup(): Promise<void> {
    this.isInitialized = false;
    this.emit('cleanup');
  }
}

// Export singleton instance
export const businessIntelligenceService = new BusinessIntelligenceService();
export default businessIntelligenceService;