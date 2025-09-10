/**
 * Business SaaS Intel Core
 * Main class that extends phantom-intel-core with business SaaS capabilities
 */

import { IntelCore } from '../index.js';
import {
  IBusinessSaaSConfig,
  DEFAULT_BUSINESS_SAAS_CONFIG,
  ITenantInfo,
} from './config/BusinessSaaSConfig.js';
import {
  IBusinessSaaSQuery,
  IBusinessSaaSResult,
  IBusinessSaaSIndicator,
  IBusinessSaaSThreatActor,
  IBusinessSaaSCampaign,
  IBusinessSaaSFeed,
  IBusinessSaaSReport,
  IBusinessSaaSAnalytics,
  IBusinessSaaSExport,
  IBusinessSaaSImport,
  IBusinessSaaSMetrics,
  IBusinessSaaSHealth,
  IRealTimeUpdate,
} from './types/BusinessSaaSTypes.js';
import { MultiTenantManager } from './services/MultiTenantManager.js';
import { DataStoreIntegration } from './services/DataStoreIntegration.js';
import { RealTimeManager } from './services/RealTimeManager.js';
import { AnalyticsEngine } from './services/AnalyticsEngine.js';
import { BusinessSaaSUtils } from './utils/BusinessSaaSUtils.js';

export class BusinessSaaSIntelCore {
  private config: IBusinessSaaSConfig;
  private coreEngine: IntelCore;
  private multiTenantManager: MultiTenantManager;
  private dataStoreIntegration: DataStoreIntegration;
  private realTimeManager: RealTimeManager;
  private analyticsEngine: AnalyticsEngine;
  private isInitialized = false;

  constructor(config: Partial<IBusinessSaaSConfig>) {
    // Merge with defaults and validate
    this.config = BusinessSaaSUtils.mergeWithDefaults(config);
    const validation = BusinessSaaSUtils.validateConfig(this.config);
    
    if (!validation.valid) {
      throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
    }

    // Initialize core components
    this.coreEngine = new IntelCore();
    this.multiTenantManager = new MultiTenantManager();
    this.dataStoreIntegration = new DataStoreIntegration(this.config.dataStore);
    this.realTimeManager = new RealTimeManager(
      this.config.realTime || DEFAULT_BUSINESS_SAAS_CONFIG.realTime!
    );
    this.analyticsEngine = new AnalyticsEngine(
      this.config.analytics || DEFAULT_BUSINESS_SAAS_CONFIG.analytics!
    );

    console.log(`🏢 Business SaaS Intel Core initialized for tenant: ${this.config.tenantId}`);
  }

  /**
   * Initialize all components
   */
  async initialize(): Promise<void> {
    try {
      console.log('🔄 Initializing Business SaaS Intel Core...');

      // Initialize data stores
      await this.dataStoreIntegration.initialize();
      console.log('✅ Data store integration initialized');

      // Initialize real-time manager with Redis client if available
      const redisConnection = this.dataStoreIntegration.getConnections().get('redis');
      if (redisConnection?.isConnected) {
        // In real implementation, would pass actual Redis client
        await this.realTimeManager.initialize();
        console.log('✅ Real-time manager initialized');
      }

      // Initialize analytics engine
      await this.analyticsEngine.initialize();
      console.log('✅ Analytics engine initialized');

      this.isInitialized = true;
      console.log('🎉 Business SaaS Intel Core fully initialized');
    } catch (error) {
      console.error('❌ Initialization failed:', error);
      throw error;
    }
  }

  // =================================================================
  // PERSISTENT INDICATOR OPERATIONS
  // =================================================================

  /**
   * Create persistent indicator
   */
  async createIndicatorPersistent(indicatorData: any): Promise<string> {
    this.validateTenantAccess('indicators', 'maxIndicators');

    const enrichedData: IBusinessSaaSIndicator = {
      ...indicatorData,
      id: BusinessSaaSUtils.generateId('ind'),
      tenantId: this.config.tenantId,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: 'system', // In real implementation, would come from context
      updated_by: 'system',
    };

    const result = await this.dataStoreIntegration.executePersistentOperation({
      operation: 'create',
      tenantId: this.config.tenantId,
      entityType: 'indicators',
      data: enrichedData,
      options: { validation: true, audit: true, realTimeUpdate: true },
    });

    if (result.success && result.data.length > 0) {
      const createdIndicator = result.data[0];
      
      // Update tenant usage
      await this.multiTenantManager.updateUsage(
        this.config.tenantId,
        'indicators',
        1,
        'increment'
      );

      // Publish real-time update
      if (this.config.features.realTimeUpdates) {
        await this.realTimeManager.publishIndicatorUpdate(
          this.config.tenantId,
          'created',
          createdIndicator.id,
          createdIndicator
        );
      }

      return createdIndicator.id;
    }

    throw new Error(result.error || 'Failed to create indicator');
  }

  /**
   * Get persistent indicator
   */
  async getIndicatorPersistent(indicatorId: string): Promise<IBusinessSaaSIndicator | null> {
    const result = await this.dataStoreIntegration.executePersistentOperation<IBusinessSaaSIndicator>({
      operation: 'read',
      tenantId: this.config.tenantId,
      entityType: 'indicators',
      entityId: indicatorId,
    });

    return result.success && result.data.length > 0 ? result.data[0] : null;
  }

  /**
   * Update persistent indicator
   */
  async updateIndicatorPersistent(indicatorId: string, updateData: Partial<IBusinessSaaSIndicator>): Promise<boolean> {
    const enrichedData = {
      ...updateData,
      updated_at: new Date(),
      updated_by: 'system',
    };

    const result = await this.dataStoreIntegration.executePersistentOperation({
      operation: 'update',
      tenantId: this.config.tenantId,
      entityType: 'indicators',
      entityId: indicatorId,
      data: enrichedData,
      options: { validation: true, audit: true, realTimeUpdate: true },
    });

    if (result.success && this.config.features.realTimeUpdates) {
      await this.realTimeManager.publishIndicatorUpdate(
        this.config.tenantId,
        'updated',
        indicatorId,
        result.data[0]
      );
    }

    return result.success;
  }

  /**
   * Delete persistent indicator
   */
  async deleteIndicatorPersistent(indicatorId: string): Promise<boolean> {
    const result = await this.dataStoreIntegration.executePersistentOperation({
      operation: 'delete',
      tenantId: this.config.tenantId,
      entityType: 'indicators',
      entityId: indicatorId,
      options: { audit: true, realTimeUpdate: true },
    });

    if (result.success) {
      // Update tenant usage
      await this.multiTenantManager.updateUsage(
        this.config.tenantId,
        'indicators',
        1,
        'decrement'
      );

      // Publish real-time update
      if (this.config.features.realTimeUpdates) {
        await this.realTimeManager.publishIndicatorUpdate(
          this.config.tenantId,
          'deleted',
          indicatorId,
          { id: indicatorId }
        );
      }
    }

    return result.success;
  }

  /**
   * List indicators with filtering and pagination
   */
  async listIndicatorsPersistent(
    filters: Record<string, any> = {},
    pagination: { page?: number; limit?: number } = {}
  ): Promise<IBusinessSaaSResult<IBusinessSaaSIndicator>> {
    const query: IBusinessSaaSQuery = {
      tenantId: this.config.tenantId,
      filters,
      pagination: {
        page: pagination.page || 1,
        limit: pagination.limit || 50,
      },
    };

    const sanitizedQuery = BusinessSaaSUtils.sanitizeQuery(query);
    return await this.dataStoreIntegration.executePersistentOperation<IBusinessSaaSIndicator>({
      operation: 'search',
      tenantId: this.config.tenantId,
      entityType: 'indicators',
      query: sanitizedQuery,
    });
  }

  /**
   * Search indicators with full-text search
   */
  async searchIndicatorsPersistent(
    searchText: string,
    filters: Record<string, any> = {}
  ): Promise<IBusinessSaaSResult<IBusinessSaaSIndicator>> {
    const query: IBusinessSaaSQuery = {
      tenantId: this.config.tenantId,
      searchText,
      filters,
      pagination: { page: 1, limit: 100 },
    };

    const sanitizedQuery = BusinessSaaSUtils.sanitizeQuery(query);
    return await this.dataStoreIntegration.executePersistentOperation<IBusinessSaaSIndicator>({
      operation: 'search',
      tenantId: this.config.tenantId,
      entityType: 'indicators',
      query: sanitizedQuery,
    });
  }

  // =================================================================
  // PERSISTENT THREAT ACTOR OPERATIONS
  // =================================================================

  async createThreatActorPersistent(actorData: any): Promise<string> {
    this.validateTenantAccess('threat-actors', 'maxThreatActors');

    const enrichedData: IBusinessSaaSThreatActor = {
      ...actorData,
      id: BusinessSaaSUtils.generateId('actor'),
      tenantId: this.config.tenantId,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: 'system',
      updated_by: 'system',
    };

    const result = await this.dataStoreIntegration.executePersistentOperation({
      operation: 'create',
      tenantId: this.config.tenantId,
      entityType: 'threat_actors',
      data: enrichedData,
      options: { validation: true, audit: true, realTimeUpdate: true },
    });

    if (result.success && result.data.length > 0) {
      const createdActor = result.data[0];
      
      await this.multiTenantManager.updateUsage(
        this.config.tenantId,
        'threatActors',
        1,
        'increment'
      );

      if (this.config.features.realTimeUpdates) {
        await this.realTimeManager.publishThreatActorUpdate(
          this.config.tenantId,
          'created',
          createdActor.id,
          createdActor
        );
      }

      return createdActor.id;
    }

    throw new Error(result.error || 'Failed to create threat actor');
  }

  async getThreatActorPersistent(actorId: string): Promise<IBusinessSaaSThreatActor | null> {
    const result = await this.dataStoreIntegration.executePersistentOperation<IBusinessSaaSThreatActor>({
      operation: 'read',
      tenantId: this.config.tenantId,
      entityType: 'threat_actors',
      entityId: actorId,
    });

    return result.success && result.data.length > 0 ? result.data[0] : null;
  }

  // =================================================================
  // PERSISTENT CAMPAIGN OPERATIONS
  // =================================================================

  async createCampaignPersistent(campaignData: any): Promise<string> {
    this.validateTenantAccess('campaigns', 'maxCampaigns');

    const enrichedData: IBusinessSaaSCampaign = {
      ...campaignData,
      id: BusinessSaaSUtils.generateId('camp'),
      tenantId: this.config.tenantId,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: 'system',
      updated_by: 'system',
    };

    const result = await this.dataStoreIntegration.executePersistentOperation({
      operation: 'create',
      tenantId: this.config.tenantId,
      entityType: 'campaigns',
      data: enrichedData,
      options: { validation: true, audit: true, realTimeUpdate: true },
    });

    if (result.success && result.data.length > 0) {
      const createdCampaign = result.data[0];
      
      await this.multiTenantManager.updateUsage(
        this.config.tenantId,
        'campaigns',
        1,
        'increment'
      );

      if (this.config.features.realTimeUpdates) {
        await this.realTimeManager.publishCampaignUpdate(
          this.config.tenantId,
          'created',
          createdCampaign.id,
          createdCampaign
        );
      }

      return createdCampaign.id;
    }

    throw new Error(result.error || 'Failed to create campaign');
  }

  // =================================================================
  // REAL-TIME CAPABILITIES
  // =================================================================

  /**
   * Subscribe to real-time updates
   */
  async subscribeToUpdates(
    channels: string[],
    callback: (update: IRealTimeUpdate) => void,
    filters?: Record<string, any>
  ): Promise<string> {
    if (!this.config.features.realTimeUpdates) {
      throw new Error('Real-time updates are not enabled for this tenant');
    }

    return await this.realTimeManager.subscribeToUpdates(
      this.config.tenantId,
      channels,
      callback,
      filters
    );
  }

  /**
   * Unsubscribe from real-time updates
   */
  async unsubscribeFromUpdates(subscriptionId: string): Promise<void> {
    await this.realTimeManager.unsubscribe(subscriptionId);
  }

  /**
   * Publish custom update
   */
  async publishUpdate(update: Omit<IRealTimeUpdate, 'tenantId'>): Promise<void> {
    if (!this.config.features.realTimeUpdates) {
      throw new Error('Real-time updates are not enabled for this tenant');
    }

    const fullUpdate: IRealTimeUpdate = {
      ...update,
      tenantId: this.config.tenantId,
    };

    await this.realTimeManager.publishUpdate(fullUpdate);
  }

  // =================================================================
  // ADVANCED ANALYTICS
  // =================================================================

  /**
   * Generate advanced analytics
   */
  async generateAdvancedAnalytics(options: {
    start: Date;
    end: Date;
    analysisTypes?: string[];
    entityIds?: string[];
  }): Promise<IBusinessSaaSAnalytics> {
    if (!this.config.features.advancedAnalytics) {
      throw new Error('Advanced analytics are not enabled for this tenant');
    }

    const timeRange = { start: options.start, end: options.end };
    const entityIds = options.entityIds || [];

    // Perform threat landscape analysis by default
    return await this.analyticsEngine.analyzeThreatLandscape(
      this.config.tenantId,
      timeRange,
      { analysisTypes: options.analysisTypes || ['threat_landscape'] }
    );
  }

  /**
   * Perform correlation analysis
   */
  async analyzeCorrelations(entityIds: string[], timeRange: { start: Date; end: Date }): Promise<IBusinessSaaSAnalytics> {
    if (!this.config.features.advancedAnalytics) {
      throw new Error('Advanced analytics are not enabled for this tenant');
    }

    return await this.analyticsEngine.analyzeCorrelations(
      this.config.tenantId,
      entityIds,
      timeRange
    );
  }

  /**
   * Detect anomalies
   */
  async detectAnomalies(entityIds: string[], timeRange: { start: Date; end: Date }): Promise<IBusinessSaaSAnalytics> {
    if (!this.config.features.advancedAnalytics) {
      throw new Error('Advanced analytics are not enabled for this tenant');
    }

    return await this.analyticsEngine.detectAnomalies(
      this.config.tenantId,
      entityIds,
      timeRange
    );
  }

  // =================================================================
  // DATA EXPORT/IMPORT
  // =================================================================

  /**
   * Export data
   */
  async exportData(
    entityTypes: string[],
    format: 'json' | 'csv' | 'pdf' | 'stix' | 'misp',
    filters: Record<string, any> = {}
  ): Promise<IBusinessSaaSExport> {
    if (!this.config.features.dataExport) {
      throw new Error('Data export is not enabled for this tenant');
    }

    // Create export job
    const exportJob: IBusinessSaaSExport = {
      exportId: BusinessSaaSUtils.generateId('exp'),
      tenantId: this.config.tenantId,
      format,
      entityTypes,
      filters,
      options: {
        includeMetadata: true,
        includeRelationships: true,
        includeEnrichment: true,
        compression: format !== 'json',
        encryption: false,
      },
      status: 'pending',
      created_at: new Date(),
      expiration_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };

    // Simulate export processing
    setTimeout(async () => {
      exportJob.status = 'processing';
      // In real implementation, would perform actual export
      await BusinessSaaSUtils.sleep(2000);
      
      exportJob.status = 'completed';
      exportJob.completed_at = new Date();
      exportJob.file_size = Math.floor(Math.random() * 1000000); // Random file size
      exportJob.download_url = `/api/exports/${exportJob.exportId}/download`;
    }, 100);

    return exportJob;
  }

  // =================================================================
  // TENANT MANAGEMENT
  // =================================================================

  /**
   * Get tenant information
   */
  getTenantInfo(): ITenantInfo | null {
    return this.multiTenantManager.getTenant(this.config.tenantId);
  }

  /**
   * Get tenant metrics
   */
  getTenantMetrics(): IBusinessSaaSMetrics {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const usage = this.multiTenantManager.getTenantUsage(this.config.tenantId);
    const tenant = this.multiTenantManager.getTenant(this.config.tenantId);

    return {
      tenantId: this.config.tenantId,
      period: { start: startOfDay, end: now },
      data_metrics: {
        total_indicators: usage?.indicators || 0,
        new_indicators: 0, // Would be calculated from actual data
        updated_indicators: 0,
        total_threat_actors: usage?.threatActors || 0,
        new_threat_actors: 0,
        total_campaigns: usage?.campaigns || 0,
        active_campaigns: 0,
        total_reports: usage?.reports || 0,
        new_reports: 0,
      },
      usage_metrics: {
        api_requests: usage?.apiRequests24h || 0,
        search_queries: 0,
        real_time_updates: 0,
        data_exports: 0,
        data_imports: 0,
        active_users: usage?.currentUsers || 0,
        storage_used: usage?.dataSize || 0,
      },
      performance_metrics: {
        average_query_time: 150, // ms
        cache_hit_rate: 75, // percentage
        system_uptime: 99.9, // percentage
        error_rate: 0.1, // percentage
      },
      quota_metrics: {
        indicators_quota_usage: tenant ? (usage!.indicators / tenant.quotas.maxIndicators) * 100 : 0,
        threat_actors_quota_usage: tenant ? (usage!.threatActors / tenant.quotas.maxThreatActors) * 100 : 0,
        api_requests_quota_usage: tenant ? (usage!.apiRequests24h / tenant.quotas.maxApiRequestsPerHour) * 100 : 0,
        storage_quota_usage: tenant ? (usage!.dataSize / tenant.quotas.maxDataSize) * 100 : 0,
      },
    };
  }

  /**
   * Get system health
   */
  async getSystemHealth(): Promise<IBusinessSaaSHealth> {
    const dataStoreHealth = await this.dataStoreIntegration.getHealthStatus();
    const realTimeHealth = await this.realTimeManager.getHealth();
    const analyticsHealth = await this.analyticsEngine.getHealth();
    const usage = this.multiTenantManager.getTenantUsage(this.config.tenantId);
    const tenant = this.multiTenantManager.getTenant(this.config.tenantId);

    // Calculate overall status
    const healthStatuses = [
      ...Object.values(dataStoreHealth).map(ds => ds.status),
      realTimeHealth.status,
      analyticsHealth.status,
    ];

    let overall_status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (healthStatuses.includes('unhealthy')) {
      overall_status = 'unhealthy';
    } else if (healthStatuses.includes('degraded')) {
      overall_status = 'degraded';
    }

    return {
      overall_status,
      tenantId: this.config.tenantId,
      timestamp: new Date(),
      data_stores: dataStoreHealth,
      services: {
        real_time: {
          status: realTimeHealth.status,
          active_connections: realTimeHealth.metrics.activeSubscriptions,
          message_queue_size: 0,
        },
        analytics: {
          status: analyticsHealth.status,
          running_jobs: analyticsHealth.metrics.activeJobs,
          queue_size: analyticsHealth.metrics.queueSize,
        },
        data_sync: {
          status: 'healthy',
          sync_lag: 0,
          last_sync: new Date(),
        },
      },
      quotas: {
        indicators: {
          used: usage?.indicators || 0,
          limit: tenant?.quotas.maxIndicators || 0,
          percentage: tenant ? (usage!.indicators / tenant.quotas.maxIndicators) * 100 : 0,
        },
        storage: {
          used: usage?.dataSize || 0,
          limit: tenant?.quotas.maxDataSize || 0,
          percentage: tenant ? (usage!.dataSize / tenant.quotas.maxDataSize) * 100 : 0,
        },
        api_requests: {
          used_24h: usage?.apiRequests24h || 0,
          limit_24h: tenant?.quotas.maxApiRequestsPerHour || 0,
          percentage: tenant ? (usage!.apiRequests24h / tenant.quotas.maxApiRequestsPerHour) * 100 : 0,
        },
      },
    };
  }

  // =================================================================
  // FALLBACK TO ORIGINAL CORE METHODS
  // =================================================================

  /**
   * Fallback methods for compatibility with original phantom-intel-core
   */
  addIndicator(indicator: any): string {
    return this.coreEngine.addIndicator(indicator);
  }

  getIndicator(id: string): any {
    return this.coreEngine.getIndicator(id);
  }

  getAllIndicators(): any[] {
    return this.coreEngine.getAllIndicators();
  }

  searchIndicators(filters: any): any[] {
    return this.coreEngine.searchIndicators(filters);
  }

  addThreatActor(actor: any): string {
    return this.coreEngine.addThreatActor(actor);
  }

  getThreatActor(id: string): any {
    return this.coreEngine.getThreatActor(id);
  }

  getAllThreatActors(): any[] {
    return this.coreEngine.getAllThreatActors();
  }

  addCampaign(campaign: any): string {
    return this.coreEngine.addCampaign(campaign);
  }

  getCampaign(id: string): any {
    return this.coreEngine.getCampaign(id);
  }

  generateIntelligenceSummary(): any {
    return this.coreEngine.generateIntelligenceSummary();
  }

  exportData(format: string, filters: any = {}): { success: boolean; data?: string; error?: string } {
    return this.coreEngine.exportData(format, filters);
  }

  // =================================================================
  // PRIVATE HELPER METHODS
  // =================================================================

  private validateTenantAccess(operation: string, quotaResource?: keyof typeof this.config.quotas): void {
    const validation = this.multiTenantManager.validateTenantAccess(
      this.config.tenantId,
      operation,
      quotaResource,
      1
    );

    if (!validation.valid) {
      throw new Error(`Access denied: ${validation.reason}`);
    }
  }

  /**
   * Shutdown the Business SaaS Intel Core
   */
  async shutdown(): Promise<void> {
    try {
      console.log('🔄 Shutting down Business SaaS Intel Core...');

      await this.realTimeManager.shutdown();
      await this.dataStoreIntegration.disconnect();

      this.isInitialized = false;
      console.log('✅ Business SaaS Intel Core shutdown complete');
    } catch (error) {
      console.error('❌ Shutdown error:', error);
      throw error;
    }
  }
}

/**
 * Factory function to create Business SaaS Intel Core instance
 */
export function createBusinessSaaSIntelCore(config: Partial<IBusinessSaaSConfig>): BusinessSaaSIntelCore {
  return new BusinessSaaSIntelCore(config);
}

export default BusinessSaaSIntelCore;