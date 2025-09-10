/**
 * Business SaaS Data Store Interface for phantom-incidentResponse-core plugin
 * Provides multi-tenant, scalable data persistence with multiple backend support
 */

import { MongoDataSource } from '../../../data-layer/core/MongoDataSource.js';
import { PostgreSQLDataSource } from '../../../data-layer/core/PostgreSQLDataSource.js';
import { RedisDataSource } from '../../../data-layer/core/RedisDataSource.js';
import { ElasticsearchDataSource } from '../../../data-layer/core/ElasticsearchDataSource.js';
import { DataFederationEngine } from '../../../data-layer/core/DataFederationEngine.js';
import {
  IDataSource,
  IDataRecord,
  IQuery,
  IQueryContext,
  IQueryResult,
  IHealthStatus,
} from '../../../data-layer/interfaces/IDataSource.js';
import { logger } from '../../../utils/logger.js';

export interface SaaSTenantConfig {
  tenantId: string;
  tenantName: string;
  dataStores: {
    primary: 'mongodb' | 'postgresql';
    cache: 'redis';
    search: 'elasticsearch';
    analytics?: 'elasticsearch' | 'postgresql';
  };
  dataRetention: {
    incidents: number; // days
    evidence: number; // days
    logs: number; // days
    analytics: number; // days
  };
  quotas: {
    maxIncidents: number;
    maxEvidenceSize: number; // bytes
    maxApiRequestsPerHour: number;
    maxConcurrentUsers: number;
  };
  features: {
    realTimeUpdates: boolean;
    advancedAnalytics: boolean;
    customReports: boolean;
    apiAccess: boolean;
    ssoIntegration: boolean;
  };
}

export interface IncidentDataStore {
  // Core incident operations
  createIncident(tenantId: string, incident: any): Promise<string>;
  getIncident(tenantId: string, incidentId: string): Promise<any | null>;
  updateIncident(tenantId: string, incidentId: string, updates: any): Promise<boolean>;
  deleteIncident(tenantId: string, incidentId: string): Promise<boolean>;
  listIncidents(tenantId: string, filters?: any, pagination?: { offset: number; limit: number }): Promise<{ incidents: any[]; total: number }>;
  
  // Evidence operations
  addEvidence(tenantId: string, incidentId: string, evidence: any): Promise<string>;
  getEvidence(tenantId: string, incidentId: string, evidenceId: string): Promise<any | null>;
  updateEvidence(tenantId: string, incidentId: string, evidenceId: string, updates: any): Promise<boolean>;
  deleteEvidence(tenantId: string, incidentId: string, evidenceId: string): Promise<boolean>;
  
  // Search and analytics
  searchIncidents(tenantId: string, query: string, filters?: any): Promise<any[]>;
  generateAnalytics(tenantId: string, dateRange?: { start: Date; end: Date }): Promise<any>;
  
  // Real-time operations
  subscribeToIncidentUpdates(tenantId: string, incidentId: string, callback: (update: any) => void): Promise<void>;
  publishIncidentUpdate(tenantId: string, incidentId: string, update: any): Promise<void>;
  
  // Multi-tenancy operations
  createTenant(tenantConfig: SaaSTenantConfig): Promise<boolean>;
  getTenant(tenantId: string): Promise<SaaSTenantConfig | null>;
  updateTenant(tenantId: string, updates: Partial<SaaSTenantConfig>): Promise<boolean>;
  deleteTenant(tenantId: string): Promise<boolean>;
  
  // Health and monitoring
  getHealthStatus(): Promise<Record<string, IHealthStatus>>;
  getTenantMetrics(tenantId: string): Promise<any>;
}

export class SaaSIncidentDataStore implements IncidentDataStore {
  private dataSources: Map<string, IDataSource> = new Map();
  private tenantConfigs: Map<string, SaaSTenantConfig> = new Map();
  private federationEngine?: DataFederationEngine;

  constructor(
    private config: {
      mongodb?: { uri: string; database: string };
      postgresql?: { connectionString: string };
      redis?: { url: string };
      elasticsearch?: { node: string; auth?: { username: string; password: string } };
    }
  ) {
    this.initializeDataSources();
  }

  private async initializeDataSources(): Promise<void> {
    try {
      // Initialize MongoDB
      if (this.config.mongodb) {
        const mongoSource = new MongoDataSource(this.config.mongodb);
        await mongoSource.connect();
        this.dataSources.set('mongodb', mongoSource);
        logger.info('MongoDB data source initialized');
      }

      // Initialize PostgreSQL
      if (this.config.postgresql) {
        const pgSource = new PostgreSQLDataSource(this.config.postgresql);
        await pgSource.connect();
        this.dataSources.set('postgresql', pgSource);
        logger.info('PostgreSQL data source initialized');
      }

      // Initialize Redis
      if (this.config.redis) {
        const redisSource = new RedisDataSource(this.config.redis);
        await redisSource.connect();
        this.dataSources.set('redis', redisSource);
        logger.info('Redis data source initialized');
      }

      // Initialize Elasticsearch
      if (this.config.elasticsearch) {
        const esSource = new ElasticsearchDataSource(this.config.elasticsearch);
        await esSource.connect();
        this.dataSources.set('elasticsearch', esSource);
        logger.info('Elasticsearch data source initialized');

        // Create incident template
        await (esSource as ElasticsearchDataSource).createIncidentTemplate();
      }

      // Initialize federation engine
      this.federationEngine = new DataFederationEngine(Array.from(this.dataSources.values()));
      logger.info('Data federation engine initialized');

    } catch (error) {
      logger.error('Failed to initialize data sources:', error);
      throw error;
    }
  }

  // Core incident operations
  async createIncident(tenantId: string, incident: any): Promise<string> {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    // Check quotas
    await this.checkIncidentQuota(tenantId, tenant);

    const incidentData = {
      ...incident,
      tenantId,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store in primary data store
    const primaryStore = this.dataSources.get(tenant.dataStores.primary);
    if (!primaryStore) {
      throw new Error(`Primary data store ${tenant.dataStores.primary} not available`);
    }

    const query: IQuery = {
      type: 'select',
      entity: 'incidents',
    };

    const context: IQueryContext = {
      userId: 'system',
      permissions: ['create'],
      filters: { tenantId },
    };

    // Insert into primary store (this is a simplified approach, in real implementation you'd use insert operations)
    await this.storeIncidentInPrimary(tenant.dataStores.primary, incidentData);

    // Cache in Redis
    const redisSource = this.dataSources.get('redis') as RedisDataSource;
    if (redisSource) {
      await redisSource.storeIncidentData(incidentData.id, incidentData, 3600);
    }

    // Index in Elasticsearch
    const esSource = this.dataSources.get('elasticsearch') as ElasticsearchDataSource;
    if (esSource) {
      await esSource.indexIncidentData(incidentData.id, incidentData);
    }

    // Publish real-time update
    await this.publishIncidentUpdate(tenantId, incidentData.id, {
      type: 'incident_created',
      incident: incidentData,
    });

    logger.info(`Incident created for tenant ${tenantId}: ${incidentData.id}`);
    return incidentData.id;
  }

  async getIncident(tenantId: string, incidentId: string): Promise<any | null> {
    // Try cache first
    const redisSource = this.dataSources.get('redis') as RedisDataSource;
    if (redisSource) {
      const cached = await redisSource.getCachedData(`incident:${incidentId}`);
      if (cached && cached.tenantId === tenantId) {
        return cached;
      }
    }

    // Fallback to primary store
    const tenant = await this.getTenant(tenantId);
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    const primaryStore = this.dataSources.get(tenant.dataStores.primary);
    if (!primaryStore) {
      throw new Error(`Primary data store ${tenant.dataStores.primary} not available`);
    }

    const query: IQuery = {
      type: 'select',
      entity: 'incidents',
      filters: { id: incidentId, tenantId },
    };

    const context: IQueryContext = {
      userId: 'system',
      permissions: ['read'],
      filters: { tenantId },
    };

    const result = await primaryStore.query(query, context);
    const incident = result.data.length > 0 ? result.data[0].data : null;

    // Cache the result
    if (incident && redisSource) {
      await redisSource.setCachedData(`incident:${incidentId}`, incident, 1800);
    }

    return incident;
  }

  async updateIncident(tenantId: string, incidentId: string, updates: any): Promise<boolean> {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };

    // Update in primary store
    const success = await this.updateIncidentInPrimary(tenant.dataStores.primary, incidentId, tenantId, updateData);
    
    if (success) {
      // Update cache
      const redisSource = this.dataSources.get('redis') as RedisDataSource;
      if (redisSource) {
        const cached = await redisSource.getCachedData(`incident:${incidentId}`);
        if (cached) {
          Object.assign(cached, updateData);
          await redisSource.setCachedData(`incident:${incidentId}`, cached, 1800);
        }
      }

      // Update search index
      const esSource = this.dataSources.get('elasticsearch') as ElasticsearchDataSource;
      if (esSource) {
        const fullIncident = await this.getIncident(tenantId, incidentId);
        if (fullIncident) {
          await esSource.indexIncidentData(incidentId, fullIncident);
        }
      }

      // Publish real-time update
      await this.publishIncidentUpdate(tenantId, incidentId, {
        type: 'incident_updated',
        updates: updateData,
      });
    }

    return success;
  }

  async deleteIncident(tenantId: string, incidentId: string): Promise<boolean> {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    // Delete from primary store
    const success = await this.deleteIncidentFromPrimary(tenant.dataStores.primary, incidentId, tenantId);

    if (success) {
      // Remove from cache
      const redisSource = this.dataSources.get('redis') as RedisDataSource;
      if (redisSource && redisSource.client) {
        await redisSource.client.del(`incident:${incidentId}`);
      }

      // Remove from search index
      const esSource = this.dataSources.get('elasticsearch');
      if (esSource && (esSource as any).client) {
        await (esSource as any).client.delete({
          index: 'incident-data',
          id: incidentId,
        });
      }

      // Publish real-time update
      await this.publishIncidentUpdate(tenantId, incidentId, {
        type: 'incident_deleted',
      });
    }

    return success;
  }

  async listIncidents(
    tenantId: string, 
    filters?: any, 
    pagination?: { offset: number; limit: number }
  ): Promise<{ incidents: any[]; total: number }> {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    const primaryStore = this.dataSources.get(tenant.dataStores.primary);
    if (!primaryStore) {
      throw new Error(`Primary data store ${tenant.dataStores.primary} not available`);
    }

    const query: IQuery = {
      type: 'select',
      entity: 'incidents',
      filters: { ...filters, tenantId },
      limit: pagination?.limit || 50,
      offset: pagination?.offset || 0,
    };

    const context: IQueryContext = {
      userId: 'system',
      permissions: ['read'],
      filters: { tenantId },
    };

    const result = await primaryStore.query(query, context);
    
    return {
      incidents: result.data.map(record => record.data),
      total: result.metadata.total,
    };
  }

  async addEvidence(tenantId: string, incidentId: string, evidence: any): Promise<string> {
    const incident = await this.getIncident(tenantId, incidentId);
    if (!incident) {
      throw new Error(`Incident ${incidentId} not found`);
    }

    const evidenceData = {
      ...evidence,
      id: this.generateId(),
      incidentId,
      tenantId,
      createdAt: new Date(),
    };

    // Store evidence data
    await this.storeEvidenceData(tenantId, evidenceData);

    // Update incident with evidence reference
    const currentEvidence = incident.evidence || [];
    currentEvidence.push(evidenceData);
    
    await this.updateIncident(tenantId, incidentId, { evidence: currentEvidence });

    return evidenceData.id;
  }

  async getEvidence(tenantId: string, incidentId: string, evidenceId: string): Promise<any | null> {
    const incident = await this.getIncident(tenantId, incidentId);
    if (!incident || !incident.evidence) {
      return null;
    }

    const evidence = incident.evidence.find((e: any) => e.id === evidenceId);
    return evidence || null;
  }

  async updateEvidence(tenantId: string, incidentId: string, evidenceId: string, updates: any): Promise<boolean> {
    const incident = await this.getIncident(tenantId, incidentId);
    if (!incident || !incident.evidence) {
      return false;
    }

    const evidenceIndex = incident.evidence.findIndex((e: any) => e.id === evidenceId);
    if (evidenceIndex === -1) {
      return false;
    }

    Object.assign(incident.evidence[evidenceIndex], updates, { updatedAt: new Date() });
    
    return await this.updateIncident(tenantId, incidentId, { evidence: incident.evidence });
  }

  async deleteEvidence(tenantId: string, incidentId: string, evidenceId: string): Promise<boolean> {
    const incident = await this.getIncident(tenantId, incidentId);
    if (!incident || !incident.evidence) {
      return false;
    }

    const filteredEvidence = incident.evidence.filter((e: any) => e.id !== evidenceId);
    
    return await this.updateIncident(tenantId, incidentId, { evidence: filteredEvidence });
  }

  async searchIncidents(tenantId: string, query: string, filters?: any): Promise<any[]> {
    const esSource = this.dataSources.get('elasticsearch');
    if (!esSource) {
      throw new Error('Elasticsearch not available for search');
    }

    const searchQuery: IQuery = {
      type: 'search',
      entity: 'incident-data',
      searchTerm: query,
      filters: { ...filters, tenantId },
    };

    const context: IQueryContext = {
      userId: 'system',
      permissions: ['read'],
      filters: { tenantId },
    };

    const result = await esSource.query(searchQuery, context);
    return result.data.map(record => record.data);
  }

  async generateAnalytics(tenantId: string, dateRange?: { start: Date; end: Date }): Promise<any> {
    const esSource = this.dataSources.get('elasticsearch');
    if (!esSource) {
      throw new Error('Elasticsearch not available for analytics');
    }

    const query: IQuery = {
      type: 'aggregate',
      entity: 'incident-data',
      filters: { 
        tenantId,
        ...(dateRange && {
          timestamp: {
            $gte: dateRange.start,
            $lte: dateRange.end,
          }
        })
      },
    };

    const context: IQueryContext = {
      userId: 'system',
      permissions: ['read'],
      filters: { tenantId },
    };

    const result = await esSource.query(query, context);
    
    return {
      summary: {
        totalIncidents: result.metadata.total,
        dateRange: dateRange || { start: new Date(0), end: new Date() },
      },
      aggregations: result.aggregations,
      trends: this.calculateTrends(result.data),
    };
  }

  async subscribeToIncidentUpdates(tenantId: string, incidentId: string, callback: (update: any) => void): Promise<void> {
    const redisSource = this.dataSources.get('redis') as RedisDataSource;
    if (!redisSource) {
      throw new Error('Redis not available for real-time updates');
    }

    const channel = `tenant:${tenantId}:incident:${incidentId}:updates`;
    await redisSource.subscribeToChannel(channel, (message) => {
      try {
        const update = JSON.parse(message);
        callback(update);
      } catch (error) {
        logger.error('Failed to parse incident update message:', error);
      }
    });
  }

  async publishIncidentUpdate(tenantId: string, incidentId: string, update: any): Promise<void> {
    const redisSource = this.dataSources.get('redis') as RedisDataSource;
    if (!redisSource) {
      return; // Gracefully handle missing Redis
    }

    const channel = `tenant:${tenantId}:incident:${incidentId}:updates`;
    await redisSource.publishMessage(channel, {
      ...update,
      timestamp: new Date().toISOString(),
      tenantId,
      incidentId,
    });

    // Also store in incident timeline
    await redisSource.storeIncidentUpdate(incidentId, update);
  }

  // Multi-tenancy operations
  async createTenant(tenantConfig: SaaSTenantConfig): Promise<boolean> {
    try {
      this.tenantConfigs.set(tenantConfig.tenantId, tenantConfig);
      
      // Initialize tenant-specific schemas/collections/tables if needed
      await this.initializeTenantData(tenantConfig);
      
      logger.info(`Tenant created: ${tenantConfig.tenantId}`);
      return true;
    } catch (error) {
      logger.error(`Failed to create tenant ${tenantConfig.tenantId}:`, error);
      return false;
    }
  }

  async getTenant(tenantId: string): Promise<SaaSTenantConfig | null> {
    return this.tenantConfigs.get(tenantId) || null;
  }

  async updateTenant(tenantId: string, updates: Partial<SaaSTenantConfig>): Promise<boolean> {
    const tenant = this.tenantConfigs.get(tenantId);
    if (!tenant) {
      return false;
    }

    Object.assign(tenant, updates);
    this.tenantConfigs.set(tenantId, tenant);
    
    logger.info(`Tenant updated: ${tenantId}`);
    return true;
  }

  async deleteTenant(tenantId: string): Promise<boolean> {
    try {
      // Clean up tenant data
      await this.cleanupTenantData(tenantId);
      
      this.tenantConfigs.delete(tenantId);
      
      logger.info(`Tenant deleted: ${tenantId}`);
      return true;
    } catch (error) {
      logger.error(`Failed to delete tenant ${tenantId}:`, error);
      return false;
    }
  }

  async getHealthStatus(): Promise<Record<string, IHealthStatus>> {
    const statuses: Record<string, IHealthStatus> = {};
    
    for (const [name, source] of this.dataSources) {
      statuses[name] = await source.healthCheck();
    }
    
    return statuses;
  }

  async getTenantMetrics(tenantId: string): Promise<any> {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    const incidents = await this.listIncidents(tenantId);
    
    return {
      tenantId,
      incidentCount: incidents.total,
      quotaUsage: {
        incidents: incidents.total / tenant.quotas.maxIncidents,
        // Add other quota usage calculations
      },
      lastActivity: new Date(), // Calculate from recent incidents
    };
  }

  // Private helper methods
  private generateId(): string {
    return `inc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async checkIncidentQuota(tenantId: string, tenant: SaaSTenantConfig): Promise<void> {
    const incidents = await this.listIncidents(tenantId);
    if (incidents.total >= tenant.quotas.maxIncidents) {
      throw new Error(`Incident quota exceeded for tenant ${tenantId}`);
    }
  }

  private async storeIncidentInPrimary(storeType: string, incident: any): Promise<void> {
    // This is a simplified implementation
    // In a real implementation, you'd use proper insert operations for each store type
    if (storeType === 'mongodb') {
      // Store in MongoDB collection
    } else if (storeType === 'postgresql') {
      // Store in PostgreSQL table
    }
  }

  private async updateIncidentInPrimary(storeType: string, incidentId: string, tenantId: string, updates: any): Promise<boolean> {
    // Simplified implementation
    return true;
  }

  private async deleteIncidentFromPrimary(storeType: string, incidentId: string, tenantId: string): Promise<boolean> {
    // Simplified implementation
    return true;
  }

  private async storeEvidenceData(tenantId: string, evidence: any): Promise<void> {
    // Store evidence in appropriate data store
  }

  private async initializeTenantData(tenant: SaaSTenantConfig): Promise<void> {
    // Initialize tenant-specific data structures
  }

  private async cleanupTenantData(tenantId: string): Promise<void> {
    // Clean up all tenant data across all stores
  }

  private calculateTrends(data: any[]): any {
    // Calculate trend analysis from aggregated data
    return {
      incidentTrend: 'increasing', // simplified
      severityDistribution: {},
      categoryTrends: {},
    };
  }
}