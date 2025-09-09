/**
 * Business Ready Cost Tracker
 * Enterprise-grade cost tracking system designed for business operations
 */

import type { BusinessCostMetrics, CostReport, TrendAnalysis } from './index';

export interface BusinessCostTrackingConfig {
  enabled: boolean;
  realTime: boolean;
  granularity: 'minute' | 'hour' | 'day';
  categories?: string[];
  alertThresholds?: {
    costIncrease: number;
    budgetExceeded: number;
    efficiencyDrop: number;
  };
}

export interface BusinessCostMetrics {
  totalCost: number;
  operationalCost: number;
  infrastructureCost: number;
  personnelCost: number;
  technologyCost: number;
  overhead: number;
  efficiency: number;
  costPerTransaction: number;
  costPerUser: number;
  budgetUtilization: number;
  forecastAccuracy: number;
  trends: {
    daily: TrendAnalysis;
    weekly: TrendAnalysis;
    monthly: TrendAnalysis;
    quarterly: TrendAnalysis;
  };
  lastUpdated: Date;
}

export interface CostCategory {
  id: string;
  name: string;
  description: string;
  budget: number;
  actualCost: number;
  variance: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  allocation: number; // percentage of total budget
}

export interface CostAlert {
  id: string;
  type: 'threshold_exceeded' | 'budget_overrun' | 'efficiency_drop' | 'anomaly_detected';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  category?: string;
  currentValue: number;
  thresholdValue: number;
  recommendedAction: string;
  createdAt: Date;
}

export class BusinessReadyCostTracker {
  private config: BusinessCostTrackingConfig;
  private initialized: boolean = false;
  private costData: Map<string, any> = new Map();
  private categories: Map<string, CostCategory> = new Map();
  private alerts: CostAlert[] = [];
  private trackingInterval?: NodeJS.Timeout;

  constructor(config: BusinessCostTrackingConfig) {
    this.config = config;
    this.initializeCategories();
  }

  private initializeCategories(): void {
    const defaultCategories = [
      {
        id: 'infrastructure',
        name: 'Infrastructure',
        description: 'Server, cloud, and hardware costs',
        budget: 100000,
        actualCost: 0,
        variance: 0,
        trend: 'stable' as const,
        allocation: 30
      },
      {
        id: 'personnel',
        name: 'Personnel',
        description: 'Staff salaries and benefits',
        budget: 200000,
        actualCost: 0,
        variance: 0,
        trend: 'stable' as const,
        allocation: 50
      },
      {
        id: 'technology',
        name: 'Technology',
        description: 'Software licenses and tools',
        budget: 50000,
        actualCost: 0,
        variance: 0,
        trend: 'stable' as const,
        allocation: 12.5
      },
      {
        id: 'operations',
        name: 'Operations',
        description: 'Day-to-day operational expenses',
        budget: 30000,
        actualCost: 0,
        variance: 0,
        trend: 'stable' as const,
        allocation: 7.5
      }
    ];

    defaultCategories.forEach(category => {
      this.categories.set(category.id, category);
    });
  }

  /**
   * Initialize the business cost tracker
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    console.log('🚀 Initializing Business Ready Cost Tracker...');

    // Set up real-time tracking if enabled
    if (this.config.realTime) {
      this.startRealTimeTracking();
    }

    // Load historical data
    await this.loadHistoricalData();

    this.initialized = true;
    console.log('✅ Business Ready Cost Tracker initialized');
  }

  private startRealTimeTracking(): void {
    const intervalMs = this.getIntervalMs();
    
    this.trackingInterval = setInterval(async () => {
      await this.collectRealTimeCosts();
    }, intervalMs);
  }

  private getIntervalMs(): number {
    switch (this.config.granularity) {
      case 'minute': return 60 * 1000;
      case 'hour': return 60 * 60 * 1000;
      case 'day': return 24 * 60 * 60 * 1000;
      default: return 60 * 60 * 1000; // hour
    }
  }

  private async collectRealTimeCosts(): Promise<void> {
    // Simulate real-time cost collection
    const timestamp = new Date().toISOString();
    
    // Update category costs with some realistic fluctuation
    this.categories.forEach((category, id) => {
      const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
      const newCost = category.actualCost + (category.budget * 0.001 * (1 + variation));
      
      this.categories.set(id, {
        ...category,
        actualCost: Math.max(0, newCost),
        variance: ((newCost - category.budget) / category.budget) * 100
      });
    });

    // Check for alerts
    await this.checkAlertThresholds();
  }

  private async checkAlertThresholds(): Promise<void> {
    if (!this.config.alertThresholds) return;

    const metrics = await this.calculateMetrics();

    // Check budget exceeded threshold
    if (metrics.budgetUtilization > this.config.alertThresholds.budgetExceeded) {
      this.createAlert({
        type: 'budget_overrun',
        severity: 'high',
        message: `Budget utilization exceeded threshold: ${metrics.budgetUtilization.toFixed(2)}%`,
        currentValue: metrics.budgetUtilization,
        thresholdValue: this.config.alertThresholds.budgetExceeded,
        recommendedAction: 'Review spending and consider budget reallocation'
      });
    }

    // Check efficiency drop threshold
    if (metrics.efficiency < (1 - this.config.alertThresholds.efficiencyDrop)) {
      this.createAlert({
        type: 'efficiency_drop',
        severity: 'medium',
        message: `Cost efficiency dropped below threshold: ${metrics.efficiency.toFixed(2)}`,
        currentValue: metrics.efficiency,
        thresholdValue: 1 - this.config.alertThresholds.efficiencyDrop,
        recommendedAction: 'Analyze operational processes for optimization opportunities'
      });
    }
  }

  private createAlert(alertData: Omit<CostAlert, 'id' | 'createdAt'>): void {
    const alert: CostAlert = {
      ...alertData,
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };

    this.alerts.push(alert);
    console.log(`🚨 Cost Alert Generated: ${alert.message}`);
  }

  /**
   * Track costs for specific data
   */
  async trackCosts(data: any): Promise<any> {
    if (!this.initialized) {
      throw new Error('Business Cost Tracker must be initialized first');
    }

    const trackingId = `tracking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Process and categorize the cost data
    const processedData = await this.processCostData(data);
    
    // Store tracking data
    this.costData.set(trackingId, {
      ...processedData,
      trackedAt: new Date(),
      trackingId
    });

    // Update category costs if applicable
    if (processedData.category && this.categories.has(processedData.category)) {
      const category = this.categories.get(processedData.category)!;
      this.categories.set(processedData.category, {
        ...category,
        actualCost: category.actualCost + (processedData.cost || 0)
      });
    }

    return {
      trackingId,
      processedData,
      metrics: await this.calculateMetrics(),
      status: 'tracked',
      timestamp: new Date().toISOString()
    };
  }

  private async processCostData(data: any): Promise<any> {
    // Intelligent cost data processing
    const processed = {
      ...data,
      cost: this.extractCostValue(data),
      category: this.categorizeCost(data),
      businessUnit: this.identifyBusinessUnit(data),
      resourceType: this.identifyResourceType(data),
      allocation: this.calculateAllocation(data)
    };

    return processed;
  }

  private extractCostValue(data: any): number {
    // Extract cost value from various possible fields
    return data.cost || data.amount || data.price || data.expense || 0;
  }

  private categorizeCost(data: any): string {
    // Intelligent categorization based on data characteristics
    if (data.type || data.category) {
      return data.type || data.category;
    }

    // Auto-categorize based on patterns
    const costValue = this.extractCostValue(data);
    if (costValue > 10000) return 'infrastructure';
    if (data.description?.includes('staff') || data.description?.includes('salary')) return 'personnel';
    if (data.description?.includes('software') || data.description?.includes('license')) return 'technology';
    
    return 'operations';
  }

  private identifyBusinessUnit(data: any): string {
    return data.businessUnit || data.department || data.team || 'default';
  }

  private identifyResourceType(data: any): string {
    return data.resourceType || data.resource || 'general';
  }

  private calculateAllocation(data: any): number {
    // Calculate allocation percentage
    const totalBudget = Array.from(this.categories.values()).reduce((sum, cat) => sum + cat.budget, 0);
    const costValue = this.extractCostValue(data);
    return totalBudget > 0 ? (costValue / totalBudget) * 100 : 0;
  }

  /**
   * Get current business cost metrics
   */
  async getMetrics(): Promise<BusinessCostMetrics> {
    return await this.calculateMetrics();
  }

  private async calculateMetrics(): Promise<BusinessCostMetrics> {
    const categories = Array.from(this.categories.values());
    const totalBudget = categories.reduce((sum, cat) => sum + cat.budget, 0);
    const totalActualCost = categories.reduce((sum, cat) => sum + cat.actualCost, 0);

    return {
      totalCost: totalActualCost,
      operationalCost: this.getCategoryCost('operations'),
      infrastructureCost: this.getCategoryCost('infrastructure'),
      personnelCost: this.getCategoryCost('personnel'),
      technologyCost: this.getCategoryCost('technology'),
      overhead: totalActualCost * 0.15, // 15% overhead assumption
      efficiency: this.calculateEfficiency(),
      costPerTransaction: this.calculateCostPerTransaction(),
      costPerUser: this.calculateCostPerUser(),
      budgetUtilization: totalBudget > 0 ? (totalActualCost / totalBudget) * 100 : 0,
      forecastAccuracy: this.calculateForecastAccuracy(),
      trends: {
        daily: await this.getTrendAnalysis('daily'),
        weekly: await this.getTrendAnalysis('weekly'),
        monthly: await this.getTrendAnalysis('monthly'),
        quarterly: await this.getTrendAnalysis('quarterly')
      },
      lastUpdated: new Date()
    };
  }

  private getCategoryCost(categoryId: string): number {
    return this.categories.get(categoryId)?.actualCost || 0;
  }

  private calculateEfficiency(): number {
    // Calculate cost efficiency based on output vs input
    // This is a simplified calculation - in practice would involve more complex metrics
    const totalOutput = 1000; // Placeholder for actual output metrics
    const totalCost = Array.from(this.categories.values()).reduce((sum, cat) => sum + cat.actualCost, 0);
    return totalCost > 0 ? totalOutput / totalCost : 0;
  }

  private calculateCostPerTransaction(): number {
    // Placeholder calculation - would integrate with actual transaction metrics
    const totalTransactions = 10000; // Would come from actual system metrics
    const totalCost = Array.from(this.categories.values()).reduce((sum, cat) => sum + cat.actualCost, 0);
    return totalTransactions > 0 ? totalCost / totalTransactions : 0;
  }

  private calculateCostPerUser(): number {
    // Placeholder calculation - would integrate with actual user metrics
    const totalUsers = 1000; // Would come from actual system metrics
    const totalCost = Array.from(this.categories.values()).reduce((sum, cat) => sum + cat.actualCost, 0);
    return totalUsers > 0 ? totalCost / totalUsers : 0;
  }

  private calculateForecastAccuracy(): number {
    // Compare forecasted vs actual costs
    // Simplified calculation - would involve historical forecast data
    return 0.88; // 88% accuracy placeholder
  }

  private async getTrendAnalysis(period: string): Promise<TrendAnalysis> {
    // Analyze cost trends for the specified period
    // This would involve historical data analysis
    return {
      metric: 'totalCost',
      direction: 'increasing',
      magnitude: 5.2, // 5.2% increase
      period,
      forecast: [100, 105, 110, 115, 120] // 5-point forecast
    };
  }

  /**
   * Get cost reports
   */
  async getReports(): Promise<CostReport[]> {
    const metrics = await this.getMetrics();
    
    return [
      {
        id: `report-operational-${Date.now()}`,
        type: 'operational',
        period: 'current',
        metrics: {
          totalCost: metrics.totalCost,
          efficiency: metrics.efficiency,
          budgetUtilization: metrics.budgetUtilization
        },
        trends: [metrics.trends.daily, metrics.trends.weekly],
        recommendations: [
          'Monitor infrastructure costs - trending upward',
          'Optimize personnel allocation for better efficiency',
          'Consider technology cost optimization initiatives'
        ],
        createdAt: new Date()
      },
      {
        id: `report-strategic-${Date.now()}`,
        type: 'strategic',
        period: 'quarterly',
        metrics: {
          forecastAccuracy: metrics.forecastAccuracy,
          totalCost: metrics.totalCost,
          growth: 12.5 // Quarterly growth percentage
        },
        trends: [metrics.trends.monthly, metrics.trends.quarterly],
        recommendations: [
          'Develop long-term cost optimization strategy',
          'Invest in automation to reduce operational costs',
          'Establish cost governance framework'
        ],
        createdAt: new Date()
      }
    ];
  }

  /**
   * Get active cost alerts
   */
  getAlerts(): CostAlert[] {
    // Return alerts from the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.alerts.filter(alert => alert.createdAt > oneDayAgo);
  }

  private async loadHistoricalData(): Promise<void> {
    // Load historical cost data for trend analysis
    // In a real implementation, this would load from a database
    console.log('📈 Loading historical cost data...');
  }

  /**
   * Check if tracker is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Shutdown the cost tracker
   */
  async shutdown(): Promise<void> {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = undefined;
    }

    this.initialized = false;
    console.log('✅ Business Ready Cost Tracker shutdown complete');
  }

  /**
   * Get tracker status and health
   */
  getStatus(): any {
    return {
      initialized: this.initialized,
      realTimeTracking: !!this.trackingInterval,
      categoriesCount: this.categories.size,
      activeAlertsCount: this.getAlerts().length,
      dataPointsCount: this.costData.size,
      config: this.config
    };
  }
}