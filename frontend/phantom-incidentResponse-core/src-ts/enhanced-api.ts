/**
 * Enhanced API for phantom-incidentResponse-core with Business SaaS Data Store Integration
 */

import { IncidentResponseCore } from './index.js';
import { SaaSIncidentDataStore, SaaSTenantConfig, IncidentDataStore } from './data-store.js';
import { 
  Incident,
  Evidence,
  Responder,
  ResponsePlaybook,
  IncidentMetrics,
  IncidentDashboard,
  AutomationRule
} from './types.js';

export interface BusinessSaaSConfig {
  tenantId: string;
  dataStore: {
    mongodb?: { uri: string; database: string };
    postgresql?: { connectionString: string };
    redis?: { url: string };
    elasticsearch?: { node: string; auth?: { username: string; password: string } };
  };
  features?: {
    realTimeUpdates?: boolean;
    advancedAnalytics?: boolean;
    customReports?: boolean;
    apiAccess?: boolean;
    ssoIntegration?: boolean;
  };
  quotas?: {
    maxIncidents?: number;
    maxEvidenceSize?: number;
    maxApiRequestsPerHour?: number;
    maxConcurrentUsers?: number;
  };
}

export class EnhancedIncidentResponseCore extends IncidentResponseCore {
  private dataStore: IncidentDataStore;
  private tenantId: string;
  private config: BusinessSaaSConfig;

  constructor(config: BusinessSaaSConfig) {
    super();
    this.config = config;
    this.tenantId = config.tenantId;
    
    // Initialize SaaS data store
    this.dataStore = new SaaSIncidentDataStore(config.dataStore);
    
    this.initializeTenant();
  }

  private async initializeTenant(): Promise<void> {
    const tenantConfig: SaaSTenantConfig = {
      tenantId: this.tenantId,
      tenantName: `Tenant ${this.tenantId}`,
      dataStores: {
        primary: this.config.dataStore.mongodb ? 'mongodb' : 'postgresql',
        cache: 'redis',
        search: 'elasticsearch',
        analytics: 'elasticsearch',
      },
      dataRetention: {
        incidents: 365,
        evidence: 2555, // 7 years
        logs: 90,
        analytics: 180,
      },
      quotas: {
        maxIncidents: this.config.quotas?.maxIncidents || 10000,
        maxEvidenceSize: this.config.quotas?.maxEvidenceSize || 10737418240, // 10GB
        maxApiRequestsPerHour: this.config.quotas?.maxApiRequestsPerHour || 1000,
        maxConcurrentUsers: this.config.quotas?.maxConcurrentUsers || 100,
      },
      features: {
        realTimeUpdates: this.config.features?.realTimeUpdates ?? true,
        advancedAnalytics: this.config.features?.advancedAnalytics ?? true,
        customReports: this.config.features?.customReports ?? true,
        apiAccess: this.config.features?.apiAccess ?? true,
        ssoIntegration: this.config.features?.ssoIntegration ?? false,
      },
    };

    await this.dataStore.createTenant(tenantConfig);
  }

  // Enhanced incident management with persistent storage
  async createIncidentPersistent(incident: Partial<Incident>): Promise<string> {
    // Create incident using parent class logic for immediate availability
    const localIncidentId = this.createIncident(incident);
    const localIncident = this.getIncident(localIncidentId);

    try {
      // Persist to data store
      const persistentId = await this.dataStore.createIncident(this.tenantId, localIncident);
      
      // Update local incident with persistent ID
      this.updateIncident(localIncidentId, { persistentId });
      
      return persistentId;
    } catch (error) {
      console.error('Failed to persist incident:', error);
      // Return local ID as fallback
      return localIncidentId;
    }
  }

  async getIncidentPersistent(incidentId: string): Promise<any | null> {
    try {
      // Try to get from persistent store first
      const incident = await this.dataStore.getIncident(this.tenantId, incidentId);
      if (incident) {
        return incident;
      }

      // Fallback to local storage
      return this.getIncident(incidentId);
    } catch (error) {
      console.error('Failed to retrieve incident from persistent store:', error);
      return this.getIncident(incidentId);
    }
  }

  async updateIncidentPersistent(incidentId: string, updates: Partial<Incident>): Promise<boolean> {
    try {
      // Update persistent store
      const success = await this.dataStore.updateIncident(this.tenantId, incidentId, updates);
      
      // Also update local copy
      this.updateIncident(incidentId, updates);
      
      return success;
    } catch (error) {
      console.error('Failed to update incident in persistent store:', error);
      // Fallback to local update
      return this.updateIncident(incidentId, updates);
    }
  }

  async deleteIncidentPersistent(incidentId: string): Promise<boolean> {
    try {
      const success = await this.dataStore.deleteIncident(this.tenantId, incidentId);
      
      // Also remove from local storage if it exists
      const localIncidents = this.getAllIncidents();
      const localIncident = localIncidents.find(inc => inc.id === incidentId || inc.persistentId === incidentId);
      if (localIncident) {
        // Remove from local storage (simplified - would need proper implementation)
      }
      
      return success;
    } catch (error) {
      console.error('Failed to delete incident from persistent store:', error);
      return false;
    }
  }

  async listIncidentsPersistent(filters?: any, pagination?: { offset: number; limit: number }): Promise<{ incidents: any[]; total: number }> {
    try {
      return await this.dataStore.listIncidents(this.tenantId, filters, pagination);
    } catch (error) {
      console.error('Failed to list incidents from persistent store:', error);
      // Fallback to local incidents
      const localIncidents = this.filterIncidents(filters || {});
      const offset = pagination?.offset || 0;
      const limit = pagination?.limit || 50;
      return {
        incidents: localIncidents.slice(offset, offset + limit),
        total: localIncidents.length,
      };
    }
  }

  // Enhanced evidence management
  async addEvidencePersistent(incidentId: string, evidence: Partial<Evidence>): Promise<string> {
    try {
      const evidenceId = await this.dataStore.addEvidence(this.tenantId, incidentId, evidence);
      
      // Also add to local incident if it exists
      this.addEvidence(incidentId, evidence);
      
      return evidenceId;
    } catch (error) {
      console.error('Failed to add evidence to persistent store:', error);
      return this.addEvidence(incidentId, evidence);
    }
  }

  async getEvidencePersistent(incidentId: string, evidenceId: string): Promise<any | null> {
    try {
      return await this.dataStore.getEvidence(this.tenantId, incidentId, evidenceId);
    } catch (error) {
      console.error('Failed to get evidence from persistent store:', error);
      const incident = this.getIncident(incidentId);
      return incident?.evidence?.find((e: any) => e.id === evidenceId) || null;
    }
  }

  // Advanced search capabilities
  async searchIncidentsPersistent(query: string, filters?: any): Promise<any[]> {
    try {
      return await this.dataStore.searchIncidents(this.tenantId, query, filters);
    } catch (error) {
      console.error('Failed to search incidents in persistent store:', error);
      // Fallback to local search
      return this.searchIncidents(query);
    }
  }

  // Real-time updates
  async subscribeToIncidentUpdates(incidentId: string, callback: (update: any) => void): Promise<void> {
    try {
      await this.dataStore.subscribeToIncidentUpdates(this.tenantId, incidentId, callback);
    } catch (error) {
      console.error('Failed to subscribe to incident updates:', error);
    }
  }

  async publishIncidentUpdate(incidentId: string, update: any): Promise<void> {
    try {
      await this.dataStore.publishIncidentUpdate(this.tenantId, incidentId, update);
    } catch (error) {
      console.error('Failed to publish incident update:', error);
    }
  }

  // Analytics and reporting
  async generateAdvancedAnalytics(dateRange?: { start: Date; end: Date }): Promise<any> {
    try {
      const persistentAnalytics = await this.dataStore.generateAnalytics(this.tenantId, dateRange);
      const localMetrics = this.generateIncidentMetrics();
      
      return {
        ...persistentAnalytics,
        localMetrics,
        combined: true,
      };
    } catch (error) {
      console.error('Failed to generate advanced analytics:', error);
      return this.generateIncidentMetrics();
    }
  }

  // Multi-tenant operations
  async getTenantInfo(): Promise<SaaSTenantConfig | null> {
    try {
      return await this.dataStore.getTenant(this.tenantId);
    } catch (error) {
      console.error('Failed to get tenant info:', error);
      return null;
    }
  }

  async getTenantMetrics(): Promise<any> {
    try {
      return await this.dataStore.getTenantMetrics(this.tenantId);
    } catch (error) {
      console.error('Failed to get tenant metrics:', error);
      return null;
    }
  }

  // Health monitoring
  async getSystemHealth(): Promise<Record<string, any>> {
    try {
      const dataStoreHealth = await this.dataStore.getHealthStatus();
      return {
        dataStores: dataStoreHealth,
        localEngine: {
          status: 'healthy',
          incidentCount: this.getAllIncidents().length,
          responderCount: this.getAllResponders().length,
          playbookCount: this.getAllPlaybooks().length,
        },
        tenant: {
          id: this.tenantId,
          ...(await this.getTenantMetrics()),
        },
      };
    } catch (error) {
      console.error('Failed to get system health:', error);
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Business SaaS specific features
  async exportIncidentData(incidentIds?: string[], format: 'json' | 'csv' = 'json'): Promise<any> {
    try {
      const incidents = incidentIds 
        ? await Promise.all(incidentIds.map(id => this.getIncidentPersistent(id)))
        : (await this.listIncidentsPersistent()).incidents;

      if (format === 'csv') {
        return this.convertToCSV(incidents.filter(Boolean));
      }

      return {
        tenantId: this.tenantId,
        exportDate: new Date().toISOString(),
        incidents: incidents.filter(Boolean),
        metadata: {
          count: incidents.filter(Boolean).length,
          format,
        },
      };
    } catch (error) {
      console.error('Failed to export incident data:', error);
      throw error;
    }
  }

  async importIncidentData(data: any[], validateSchema: boolean = true): Promise<{ success: number; failed: number; errors: string[] }> {
    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (const incidentData of data) {
      try {
        if (validateSchema) {
          // Basic validation
          if (!incidentData.title || !incidentData.severity) {
            throw new Error('Missing required fields: title and severity');
          }
        }

        await this.createIncidentPersistent(incidentData);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Failed to import incident: ${error.message}`);
      }
    }

    return results;
  }

  // API rate limiting and quota management
  private apiRequestCount = 0;
  private apiRequestWindow = Date.now();

  async checkApiQuota(): Promise<boolean> {
    const tenant = await this.getTenantInfo();
    if (!tenant) return false;

    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    // Reset counter if window expired
    if (now - this.apiRequestWindow > oneHour) {
      this.apiRequestCount = 0;
      this.apiRequestWindow = now;
    }

    return this.apiRequestCount < tenant.quotas.maxApiRequestsPerHour;
  }

  incrementApiUsage(): void {
    this.apiRequestCount++;
  }

  // Advanced automation with persistent rules
  async createAutomationRulePersistent(rule: Partial<AutomationRule>): Promise<string> {
    // Create local rule
    const ruleId = this.createAutomationRule(rule);
    
    // TODO: Persist automation rules to data store
    // This would require extending the data store interface
    
    return ruleId;
  }

  // Custom reporting
  async generateCustomReport(reportConfig: {
    type: 'incidents' | 'evidence' | 'responders' | 'metrics';
    dateRange?: { start: Date; end: Date };
    filters?: any;
    groupBy?: string[];
    aggregations?: string[];
  }): Promise<any> {
    try {
      switch (reportConfig.type) {
        case 'incidents':
          return await this.generateIncidentReport(reportConfig);
        case 'evidence':
          return await this.generateEvidenceReport(reportConfig);
        case 'responders':
          return await this.generateResponderReport(reportConfig);
        case 'metrics':
          return await this.generateMetricsReport(reportConfig);
        default:
          throw new Error(`Unsupported report type: ${reportConfig.type}`);
      }
    } catch (error) {
      console.error('Failed to generate custom report:', error);
      throw error;
    }
  }

  // Private helper methods
  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        }).join(',')
      )
    ];

    return csvRows.join('\n');
  }

  private async generateIncidentReport(config: any): Promise<any> {
    const { incidents } = await this.listIncidentsPersistent(config.filters);
    
    return {
      type: 'incidents',
      generatedAt: new Date().toISOString(),
      config,
      data: incidents,
      summary: {
        total: incidents.length,
        byStatus: this.groupBy(incidents, 'status'),
        bySeverity: this.groupBy(incidents, 'severity'),
        byCategory: this.groupBy(incidents, 'category'),
      },
    };
  }

  private async generateEvidenceReport(config: any): Promise<any> {
    const { incidents } = await this.listIncidentsPersistent(config.filters);
    const allEvidence = incidents.flatMap(inc => inc.evidence || []);
    
    return {
      type: 'evidence',
      generatedAt: new Date().toISOString(),
      config,
      data: allEvidence,
      summary: {
        total: allEvidence.length,
        byType: this.groupBy(allEvidence, 'type'),
        totalSize: allEvidence.reduce((sum, e) => sum + (e.size || 0), 0),
      },
    };
  }

  private async generateResponderReport(config: any): Promise<any> {
    const responders = this.getAllResponders();
    
    return {
      type: 'responders',
      generatedAt: new Date().toISOString(),
      config,
      data: responders,
      summary: {
        total: responders.length,
        byRole: this.groupBy(responders, 'role'),
        active: responders.filter(r => r.active).length,
      },
    };
  }

  private async generateMetricsReport(config: any): Promise<any> {
    const analytics = await this.generateAdvancedAnalytics(config.dateRange);
    
    return {
      type: 'metrics',
      generatedAt: new Date().toISOString(),
      config,
      data: analytics,
    };
  }

  private groupBy(array: any[], key: string): Record<string, number> {
    return array.reduce((groups, item) => {
      const value = item[key] || 'unknown';
      groups[value] = (groups[value] || 0) + 1;
      return groups;
    }, {});
  }
}

// Factory function for easy initialization
export function createBusinessSaaSIncidentResponse(config: BusinessSaaSConfig): EnhancedIncidentResponseCore {
  return new EnhancedIncidentResponseCore(config);
}

export default EnhancedIncidentResponseCore;