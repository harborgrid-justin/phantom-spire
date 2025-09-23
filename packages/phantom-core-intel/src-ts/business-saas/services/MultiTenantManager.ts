/**
 * Multi-Tenant Manager for Business SaaS
 * Handles tenant isolation, quota management, and feature toggles
 */

import { ITenantInfo, ITenantUsage, IQuotaConfig, IFeatureConfig } from '../config/BusinessSaaSConfig.js';

export class MultiTenantManager {
  private tenants: Map<string, ITenantInfo> = new Map();
  private tenantUsage: Map<string, ITenantUsage> = new Map();

  constructor() {
    this.initializeDefaultTenant();
  }

  /**
   * Initialize a default tenant for demonstration
   */
  private initializeDefaultTenant(): void {
    const defaultTenant: ITenantInfo = {
      tenantId: 'default',
      name: 'Default Tenant',
      plan: 'enterprise',
      status: 'active',
      createdAt: new Date(),
      lastActivity: new Date(),
      quotas: {
        maxIndicators: 10000,
        maxThreatActors: 1000,
        maxCampaigns: 500,
        maxReports: 100,
        maxDataSize: 10737418240, // 10GB
        maxApiRequestsPerHour: 1000,
        maxConcurrentUsers: 100,
        maxRetentionDays: 365,
        maxExportSize: 1073741824, // 1GB
      },
      features: {
        realTimeUpdates: true,
        advancedAnalytics: true,
        customReports: true,
        apiAccess: true,
        ssoIntegration: true,
        auditLogging: true,
        dataExport: true,
        multiTenancy: true,
        workflowAutomation: true,
        threatIntelligenceFeeds: true,
      },
      usage: {
        indicators: 0,
        threatActors: 0,
        campaigns: 0,
        reports: 0,
        dataSize: 0,
        apiRequests24h: 0,
        currentUsers: 0,
        lastUpdated: new Date(),
      },
    };

    this.tenants.set(defaultTenant.tenantId, defaultTenant);
    this.tenantUsage.set(defaultTenant.tenantId, defaultTenant.usage);
  }

  /**
   * Create a new tenant
   */
  async createTenant(
    tenantId: string,
    name: string,
    plan: 'basic' | 'professional' | 'enterprise',
    customQuotas?: Partial<IQuotaConfig>,
    customFeatures?: Partial<IFeatureConfig>
  ): Promise<ITenantInfo> {
    if (this.tenants.has(tenantId)) {
      throw new Error(`Tenant ${tenantId} already exists`);
    }

    const quotas = this.getQuotasForPlan(plan, customQuotas);
    const features = this.getFeaturesForPlan(plan, customFeatures);

    const tenant: ITenantInfo = {
      tenantId,
      name,
      plan,
      status: 'active',
      createdAt: new Date(),
      lastActivity: new Date(),
      quotas,
      features,
      usage: {
        indicators: 0,
        threatActors: 0,
        campaigns: 0,
        reports: 0,
        dataSize: 0,
        apiRequests24h: 0,
        currentUsers: 0,
        lastUpdated: new Date(),
      },
    };

    this.tenants.set(tenantId, tenant);
    this.tenantUsage.set(tenantId, tenant.usage);

    return tenant;
  }

  /**
   * Get tenant information
   */
  getTenant(tenantId: string): ITenantInfo | null {
    return this.tenants.get(tenantId) || null;
  }

  /**
   * Update tenant information
   */
  async updateTenant(
    tenantId: string,
    updates: Partial<ITenantInfo>
  ): Promise<ITenantInfo> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    const updatedTenant = {
      ...tenant,
      ...updates,
      lastActivity: new Date(),
    };

    this.tenants.set(tenantId, updatedTenant);
    return updatedTenant;
  }

  /**
   * Suspend a tenant
   */
  async suspendTenant(tenantId: string, reason?: string): Promise<void> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    tenant.status = 'suspended';
    tenant.lastActivity = new Date();
    this.tenants.set(tenantId, tenant);
  }

  /**
   * Activate a tenant
   */
  async activateTenant(tenantId: string): Promise<void> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    tenant.status = 'active';
    tenant.lastActivity = new Date();
    this.tenants.set(tenantId, tenant);
  }

  /**
   * Check if tenant is active
   */
  isTenantActive(tenantId: string): boolean {
    const tenant = this.tenants.get(tenantId);
    return tenant ? tenant.status === 'active' : false;
  }

  /**
   * Check if feature is enabled for tenant
   */
  isFeatureEnabled(tenantId: string, feature: keyof IFeatureConfig): boolean {
    const tenant = this.tenants.get(tenantId);
    if (!tenant || tenant.status !== 'active') {
      return false;
    }
    return tenant.features[feature] || false;
  }

  /**
   * Check quota for a specific resource
   */
  checkQuota(
    tenantId: string,
    resource: keyof IQuotaConfig,
    requestedAmount: number = 1
  ): { allowed: boolean; currentUsage: number; limit: number; remaining: number } {
    const tenant = this.tenants.get(tenantId);
    const usage = this.tenantUsage.get(tenantId);

    if (!tenant || !usage) {
      return { allowed: false, currentUsage: 0, limit: 0, remaining: 0 };
    }

    const limit = tenant.quotas[resource] as number;
    let currentUsage = 0;

    // Map resource to usage field
    switch (resource) {
      case 'maxIndicators':
        currentUsage = usage.indicators;
        break;
      case 'maxThreatActors':
        currentUsage = usage.threatActors;
        break;
      case 'maxCampaigns':
        currentUsage = usage.campaigns;
        break;
      case 'maxReports':
        currentUsage = usage.reports;
        break;
      case 'maxDataSize':
        currentUsage = usage.dataSize;
        break;
      case 'maxApiRequestsPerHour':
        currentUsage = usage.apiRequests24h;
        break;
      case 'maxConcurrentUsers':
        currentUsage = usage.currentUsers;
        break;
      default:
        currentUsage = 0;
    }

    const remaining = Math.max(0, limit - currentUsage);
    const allowed = currentUsage + requestedAmount <= limit;

    return { allowed, currentUsage, limit, remaining };
  }

  /**
   * Update usage for a tenant
   */
  async updateUsage(
    tenantId: string,
    resource: keyof ITenantUsage,
    amount: number,
    operation: 'increment' | 'decrement' | 'set' = 'increment'
  ): Promise<ITenantUsage> {
    const usage = this.tenantUsage.get(tenantId);
    if (!usage) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    switch (operation) {
      case 'increment':
        (usage[resource] as number) += amount;
        break;
      case 'decrement':
        (usage[resource] as number) = Math.max(0, (usage[resource] as number) - amount);
        break;
      case 'set':
        (usage[resource] as number) = amount;
        break;
    }

    usage.lastUpdated = new Date();
    this.tenantUsage.set(tenantId, usage);

    // Update tenant last activity
    const tenant = this.tenants.get(tenantId);
    if (tenant) {
      tenant.lastActivity = new Date();
      this.tenants.set(tenantId, tenant);
    }

    return usage;
  }

  /**
   * Get usage for a tenant
   */
  getTenantUsage(tenantId: string): ITenantUsage | null {
    return this.tenantUsage.get(tenantId) || null;
  }

  /**
   * Get all tenants (for admin purposes)
   */
  getAllTenants(): ITenantInfo[] {
    return Array.from(this.tenants.values());
  }

  /**
   * Get tenants by status
   */
  getTenantsByStatus(status: 'active' | 'suspended' | 'expired'): ITenantInfo[] {
    return Array.from(this.tenants.values()).filter(tenant => tenant.status === status);
  }

  /**
   * Get tenant metrics
   */
  getTenantMetrics(tenantId: string): {
    quotaUtilization: Record<string, number>;
    featureUsage: Record<string, boolean>;
    lastActivity: Date;
    plan: string;
  } | null {
    const tenant = this.tenants.get(tenantId);
    const usage = this.tenantUsage.get(tenantId);

    if (!tenant || !usage) {
      return null;
    }

    const quotaUtilization: Record<string, number> = {
      indicators: (usage.indicators / tenant.quotas.maxIndicators) * 100,
      threatActors: (usage.threatActors / tenant.quotas.maxThreatActors) * 100,
      campaigns: (usage.campaigns / tenant.quotas.maxCampaigns) * 100,
      reports: (usage.reports / tenant.quotas.maxReports) * 100,
      dataSize: (usage.dataSize / tenant.quotas.maxDataSize) * 100,
      apiRequests: (usage.apiRequests24h / tenant.quotas.maxApiRequestsPerHour) * 100,
      concurrentUsers: (usage.currentUsers / tenant.quotas.maxConcurrentUsers) * 100,
    };

    return {
      quotaUtilization,
      featureUsage: tenant.features,
      lastActivity: tenant.lastActivity,
      plan: tenant.plan,
    };
  }

  /**
   * Validate tenant access for operation
   */
  validateTenantAccess(
    tenantId: string,
    operation: string,
    resource?: keyof IQuotaConfig,
    amount: number = 1
  ): { valid: boolean; reason?: string } {
    // Check if tenant exists and is active
    if (!this.isTenantActive(tenantId)) {
      return { valid: false, reason: 'Tenant is not active' };
    }

    // Check quotas if resource is specified
    if (resource) {
      const quotaCheck = this.checkQuota(tenantId, resource, amount);
      if (!quotaCheck.allowed) {
        return { valid: false, reason: `Quota exceeded for ${resource}` };
      }
    }

    // Check feature access based on operation
    const featureMap: Record<string, keyof IFeatureConfig> = {
      'real-time': 'realTimeUpdates',
      'analytics': 'advancedAnalytics',
      'reports': 'customReports',
      'api': 'apiAccess',
      'export': 'dataExport',
      'workflow': 'workflowAutomation',
      'feeds': 'threatIntelligenceFeeds',
    };

    const requiredFeature = featureMap[operation];
    if (requiredFeature && !this.isFeatureEnabled(tenantId, requiredFeature)) {
      return { valid: false, reason: `Feature ${requiredFeature} is not enabled` };
    }

    return { valid: true };
  }

  /**
   * Get quotas for a plan
   */
  private getQuotasForPlan(
    plan: 'basic' | 'professional' | 'enterprise',
    customQuotas?: Partial<IQuotaConfig>
  ): IQuotaConfig {
    const baseQuotas: Record<string, IQuotaConfig> = {
      basic: {
        maxIndicators: 1000,
        maxThreatActors: 100,
        maxCampaigns: 50,
        maxReports: 10,
        maxDataSize: 1073741824, // 1GB
        maxApiRequestsPerHour: 100,
        maxConcurrentUsers: 5,
        maxRetentionDays: 90,
        maxExportSize: 104857600, // 100MB
      },
      professional: {
        maxIndicators: 5000,
        maxThreatActors: 500,
        maxCampaigns: 250,
        maxReports: 50,
        maxDataSize: 5368709120, // 5GB
        maxApiRequestsPerHour: 500,
        maxConcurrentUsers: 25,
        maxRetentionDays: 180,
        maxExportSize: 536870912, // 500MB
      },
      enterprise: {
        maxIndicators: 10000,
        maxThreatActors: 1000,
        maxCampaigns: 500,
        maxReports: 100,
        maxDataSize: 10737418240, // 10GB
        maxApiRequestsPerHour: 1000,
        maxConcurrentUsers: 100,
        maxRetentionDays: 365,
        maxExportSize: 1073741824, // 1GB
      },
    };

    return { ...baseQuotas[plan], ...customQuotas };
  }

  /**
   * Get features for a plan
   */
  private getFeaturesForPlan(
    plan: 'basic' | 'professional' | 'enterprise',
    customFeatures?: Partial<IFeatureConfig>
  ): IFeatureConfig {
    const baseFeatures: Record<string, IFeatureConfig> = {
      basic: {
        realTimeUpdates: false,
        advancedAnalytics: false,
        customReports: false,
        apiAccess: true,
        ssoIntegration: false,
        auditLogging: false,
        dataExport: true,
        multiTenancy: false,
        workflowAutomation: false,
        threatIntelligenceFeeds: false,
      },
      professional: {
        realTimeUpdates: true,
        advancedAnalytics: true,
        customReports: true,
        apiAccess: true,
        ssoIntegration: false,
        auditLogging: true,
        dataExport: true,
        multiTenancy: true,
        workflowAutomation: true,
        threatIntelligenceFeeds: true,
      },
      enterprise: {
        realTimeUpdates: true,
        advancedAnalytics: true,
        customReports: true,
        apiAccess: true,
        ssoIntegration: true,
        auditLogging: true,
        dataExport: true,
        multiTenancy: true,
        workflowAutomation: true,
        threatIntelligenceFeeds: true,
      },
    };

    return { ...baseFeatures[plan], ...customFeatures };
  }
}