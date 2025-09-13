//! Integration example for phantom-secop-core with main application
//! This shows how the enhanced plugin integrates with the existing data layer

import { DataLayerOrchestrator } from '../src/data-layer/index.js';
import SecOpCore from './phantom-secop-core/index.js';

/**
 * Enhanced SecOps service that integrates phantom-secop-core with main app data layer
 */
export class EnhancedSecOpsService {
  private secOpCore: any;
  private dataLayerOrchestrator: DataLayerOrchestrator;
  
  constructor(dataLayerConfig?: any) {
    this.dataLayerOrchestrator = new DataLayerOrchestrator(dataLayerConfig || {
      dataSources: [
        {
          id: 'postgres-primary',
          type: 'postgresql',
          config: {
            connectionString: process.env.POSTGRESQL_URI,
            pool: { max: 20 }
          }
        },
        {
          id: 'mongodb-documents',
          type: 'mongodb', 
          config: {
            connectionString: process.env.MONGODB_URI,
            database: 'phantom-spire'
          }
        },
        {
          id: 'redis-cache',
          type: 'redis',
          config: {
            connectionString: process.env.REDIS_URL,
            keyPrefix: 'phantom:'
          }
        },
        {
          id: 'elasticsearch-search',
          type: 'elasticsearch',
          config: {
            node: process.env.ELASTICSEARCH_URL,
            index: 'phantom-security'
          }
        }
      ]
    });
  }

  /**
   * Initialize the enhanced SecOps service
   */
  async initialize(): Promise<void> {
    // Initialize main application data layer
    await this.dataLayerOrchestrator.initialize();
    
    // Configure phantom-secop-core with same data stores
    const secOpConfig = {
      redis_url: process.env.REDIS_URL,
      postgres_url: process.env.POSTGRESQL_URI,
      mongodb_url: process.env.MONGODB_URI,
      elasticsearch_url: process.env.ELASTICSEARCH_URL,
      default_store: "Hybrid",
      cache_enabled: true,
      connection_pool_size: 10
    };
    
    // Create enhanced SecOp core with external data stores
    this.secOpCore = SecOpCore.newWithDataStore(JSON.stringify(secOpConfig));
    await this.secOpCore.initializeDataStore();
    
    console.log('Enhanced SecOps service initialized with multi-store support');
  }

  /**
   * Create security incident with enhanced storage
   */
  async createIncident(incidentData: {
    title: string;
    description: string;
    category: string;
    severity: string;
    source?: string;
    metadata?: any;
  }): Promise<string> {
    // Create incident in phantom-secop-core (automatically uses hybrid storage)
    const incidentId = this.secOpCore.createIncident(
      incidentData.title,
      incidentData.description, 
      incidentData.category,
      incidentData.severity
    );
    
    // Optionally store additional metadata in main app data layer
    if (incidentData.metadata) {
      await this.dataLayerOrchestrator.executeQuery({
        operation: 'insert',
        target: 'security_incidents_metadata',
        data: {
          incident_id: incidentId,
          metadata: incidentData.metadata,
          created_at: new Date()
        }
      });
    }
    
    // Index for advanced search in main app
    await this.dataLayerOrchestrator.executeQuery({
      operation: 'index',
      target: 'security_search',
      data: {
        id: incidentId,
        type: 'incident',
        title: incidentData.title,
        description: incidentData.description,
        category: incidentData.category,
        severity: incidentData.severity,
        created_at: new Date()
      }
    });
    
    return incidentId;
  }

  /**
   * Search incidents with enhanced capabilities
   */
  async searchIncidents(query: string, filters?: any): Promise<any[]> {
    // Use phantom-secop-core for security-specific search
    const secOpResults = this.secOpCore.searchIncidents({
      query,
      filters: filters || {},
      sort_by: 'created_at',
      sort_order: 'Descending',
      limit: 100
    });
    
    // Optionally enhance with main app data
    const enhancedResults = await Promise.all(
      secOpResults.map(async (incident: any) => {
        // Get additional metadata from main app
        const metadata = await this.dataLayerOrchestrator.executeQuery({
          operation: 'select',
          target: 'security_incidents_metadata',
          filter: { incident_id: incident.id }
        });
        
        return {
          ...incident,
          enhanced_metadata: metadata
        };
      })
    );
    
    return enhancedResults;
  }

  /**
   * Get comprehensive security metrics
   */
  async getSecurityMetrics(startDate: string, endDate: string): Promise<any> {
    // Get core metrics from phantom-secop-core
    const coreMetrics = this.secOpCore.generateSecurityMetrics(startDate, endDate);
    
    // Enhance with application-specific metrics
    const enhancedMetrics = await this.dataLayerOrchestrator.executeQuery({
      operation: 'aggregate',
      target: 'security_events',
      pipeline: [
        { $match: { created_at: { $gte: new Date(startDate), $lte: new Date(endDate) } } },
        { $group: { 
          _id: '$event_type', 
          count: { $sum: 1 },
          avg_response_time: { $avg: '$response_time_ms' }
        }}
      ]
    });
    
    return {
      ...JSON.parse(coreMetrics),
      application_metrics: enhancedMetrics,
      data_store_health: {
        phantom_secop_core: this.secOpCore.dataStoreHealth(),
        main_app_data_layer: await this.dataLayerOrchestrator.healthCheck()
      }
    };
  }

  /**
   * Real-time security event processing
   */
  async processSecurityEvent(event: any): Promise<void> {
    // Store in main app data layer for audit trail
    await this.dataLayerOrchestrator.executeQuery({
      operation: 'insert',
      target: 'security_events',
      data: {
        ...event,
        processed_at: new Date(),
        processor: 'enhanced-secops'
      }
    });
    
    // Process with phantom-secop-core if it's an alert
    if (event.type === 'security_alert') {
      const alertId = this.secOpCore.createAlert(
        event.title,
        event.description,
        event.priority || 'Medium',
        event.source || 'system'
      );
      
      // Cache alert for real-time dashboard
      await this.dataLayerOrchestrator.executeQuery({
        operation: 'cache_set',
        target: 'active_alerts',
        key: alertId,
        value: { ...event, alert_id: alertId },
        ttl: 3600 // 1 hour
      });
    }
  }

  /**
   * Export security data for compliance
   */
  async exportComplianceData(format: 'json' | 'csv' = 'json'): Promise<any> {
    // Get all incidents from phantom-secop-core
    const incidents = this.secOpCore.searchIncidents({
      query: '*',
      sort_by: 'created_at',
      sort_order: 'Descending'
    });
    
    // Get all alerts
    const alerts = this.secOpCore.getActiveAlerts();
    
    // Get audit trail from main app
    const auditTrail = await this.dataLayerOrchestrator.executeQuery({
      operation: 'select',
      target: 'security_audit_log',
      sort: { created_at: -1 }
    });
    
    const exportData = {
      export_date: new Date().toISOString(),
      incidents: JSON.parse(incidents),
      alerts: JSON.parse(alerts),
      audit_trail: auditTrail,
      data_sources: {
        phantom_secop_core: this.secOpCore.getDataStoreInfo(),
        main_application: await this.dataLayerOrchestrator.getDataSourceInfo()
      }
    };
    
    if (format === 'csv') {
      // Convert to CSV format for compliance reporting
      return this.convertToCSV(exportData);
    }
    
    return exportData;
  }

  /**
   * Health check for entire enhanced system
   */
  async healthCheck(): Promise<any> {
    const health = {
      service: 'enhanced-secops',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      components: {
        phantom_secop_core: {
          status: this.secOpCore.dataStoreHealth() ? 'healthy' : 'unhealthy',
          info: JSON.parse(this.secOpCore.getDataStoreInfo())
        },
        main_data_layer: {
          status: await this.dataLayerOrchestrator.healthCheck() ? 'healthy' : 'unhealthy',
          sources: await this.dataLayerOrchestrator.getDataSourceHealth()
        }
      }
    };
    
    // Overall health based on components
    health.status = Object.values(health.components).every(
      (component: any) => component.status === 'healthy'
    ) ? 'healthy' : 'degraded';
    
    return health;
  }

  private convertToCSV(data: any): string {
    // Simple CSV conversion for compliance exports
    const incidents = data.incidents.map((incident: any) => ({
      incident_id: incident.id,
      title: incident.title,
      severity: incident.severity,
      status: incident.status,
      created_at: incident.created_at
    }));
    
    const headers = Object.keys(incidents[0] || {});
    const csvRows = [
      headers.join(','),
      ...incidents.map((row: any) => headers.map(header => row[header]).join(','))
    ];
    
    return csvRows.join('\n');
  }
}

// Usage example
export async function initializeEnhancedSecOps(): Promise<EnhancedSecOpsService> {
  const secOpsService = new EnhancedSecOpsService();
  await secOpsService.initialize();
  
  console.log('Enhanced SecOps service ready with multi-store support!');
  console.log('- Phantom SecOp Core: Advanced security operations engine');
  console.log('- Multi-store backend: Redis + PostgreSQL + MongoDB + Elasticsearch');
  console.log('- Integrated with main application data layer');
  console.log('- Business SaaS ready with high availability and scalability');
  
  return secOpsService;
}