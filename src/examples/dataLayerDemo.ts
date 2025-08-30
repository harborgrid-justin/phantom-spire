/**
 * Data Layer Integration Test - Demonstrates Palantir-like capabilities
 */

import {
  DataLayerOrchestrator,
  IDataLayerConfig,
} from '../data-layer/DataLayerOrchestrator';
import { logger } from '../utils/logger';

/**
 * Example integration test showing how to use the new modular data layer
 */
export class DataLayerIntegrationExample {
  private dataLayer: DataLayerOrchestrator;

  constructor() {
    // Configure the data layer
    const config: IDataLayerConfig = {
      mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
        database: process.env.MONGODB_DB || 'phantom-spire',
      },
      analytics: {
        enableAdvancedAnalytics: true,
        enableAnomalyDetection: true,
        enablePredictiveAnalytics: true,
      },
      federation: {
        enableCrossSourceQueries: true,
        enableRelationshipDiscovery: true,
        queryTimeout: 30000,
      },
      connectors: {
        'threat-feed-1': {
          name: 'OpenThreatIntel',
          type: 'rest-api',
          connection: {
            url: 'https://api.openthreatintel.com',
            headers: {
              'X-API-Source': 'phantom-spire',
            },
          },
          timeout: 30000,
          authentication: {
            type: 'bearer',
            credentials: {
              token: process.env.THREAT_INTEL_API_KEY || 'demo-key',
            },
          },
          options: {
            enableRateLimit: true,
            cacheDuration: 300000, // 5 minutes
          },
        },
      },
    };

    this.dataLayer = new DataLayerOrchestrator(config);
  }

  /**
   * Initialize and demonstrate the data layer
   */
  async demonstrateCapabilities(): Promise<void> {
    try {
      logger.info('🚀 Starting Data Layer Demonstration');

      // Initialize the data layer
      await this.dataLayer.initialize();
      logger.info('✅ Data layer initialized successfully');

      // Demonstrate federated queries
      await this.demonstrateFederatedQueries();

      // Demonstrate advanced analytics
      await this.demonstrateAdvancedAnalytics();

      // Demonstrate relationship discovery
      await this.demonstrateRelationshipDiscovery();

      // Show health status
      await this.demonstrateHealthMonitoring();

      // Show performance metrics
      this.demonstrateMetrics();
    } catch (error) {
      logger.error('❌ Data layer demonstration failed', error);
      throw error;
    } finally {
      await this.dataLayer.shutdown();
      logger.info('🛑 Data layer shutdown complete');
    }
  }

  /**
   * Demonstrate federated queries across multiple sources
   */
  private async demonstrateFederatedQueries(): Promise<void> {
    logger.info('📊 Demonstrating Federated Queries');

    const context = {
      userId: 'demo-analyst',
      permissions: ['read:iocs', 'read:analytics'],
      timeRange: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        end: new Date(),
      },
    };

    try {
      // Query IOCs across all sources
      const iocQuery = {
        type: 'select' as const,
        entity: 'iocs',
        filters: {
          severity: { $in: ['high', 'critical'] },
          isActive: true,
        },
        fusion: 'union' as const,
        limit: 100,
        sources: [],
      };

      const results = await this.dataLayer.query(iocQuery, context);

      logger.info('📈 Federated Query Results', {
        totalResults: results.metadata.total,
        sourcesQueried: Object.keys(results.sourceBreakdown || {}),
        executionTime: results.metadata.executionTime,
      });
    } catch (error) {
      logger.warn(
        '⚠️  Federated query demonstration skipped (no data sources available)',
        {
          error: (error as Error).message,
        }
      );
    }
  }

  /**
   * Demonstrate advanced analytics capabilities
   */
  private async demonstrateAdvancedAnalytics(): Promise<void> {
    logger.info('🧠 Demonstrating Advanced Analytics');

    const context = {
      userId: 'demo-analyst',
      permissions: ['read:iocs', 'read:analytics'],
    };

    try {
      // Analyze threats with pattern recognition
      const threatQuery = {
        type: 'select' as const,
        entity: 'iocs',
        filters: {
          timestamp: {
            $gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
        sources: [],
      };

      const analytics = await this.dataLayer.analyzeThreats(
        threatQuery,
        context,
        {
          patterns: ['apt-campaign', 'botnet-activity', 'data-exfiltration'],
          includeAnomalies: true,
          includePredictions: true,
        }
      );

      logger.info('🎯 Analytics Results', {
        confidence: analytics.confidence,
        findings: analytics.findings.length,
        recommendations: analytics.recommendations.length,
        executionTime: analytics.metadata.executionTime,
        algorithmsUsed: analytics.metadata.algorithmsUsed,
      });

      // Log top findings
      analytics.findings.slice(0, 3).forEach((finding, index) => {
        logger.info(`🔍 Finding #${index + 1}: ${finding.pattern}`, {
          risk: finding.risk,
          score: finding.score,
          evidence: finding.evidence.length,
          description: finding.description,
        });
      });
    } catch (error) {
      logger.warn('⚠️  Analytics demonstration skipped', {
        error: (error as Error).message,
      });
    }
  }

  /**
   * Demonstrate cross-source relationship discovery
   */
  private async demonstrateRelationshipDiscovery(): Promise<void> {
    logger.info('🔗 Demonstrating Relationship Discovery');

    const context = {
      userId: 'demo-analyst',
      permissions: ['read:iocs', 'read:analytics', 'read:relationships'],
    };

    try {
      // Discover relationships for a set of entities
      const entityIds = ['entity-1', 'entity-2', 'entity-3']; // Mock IDs

      const relationships = await this.dataLayer.discoverRelationships(
        entityIds,
        context,
        {
          maxDepth: 3,
          relationshipTypes: ['infrastructure', 'temporal', 'attribution'],
          similarityThreshold: 0.75,
        }
      );

      logger.info('🕸️  Relationship Discovery Results', {
        nodes: relationships.nodes.length,
        relationships: relationships.relationships.length,
        crossSourceLinks: relationships.crossSourceLinks.length,
      });
    } catch (error) {
      logger.warn('⚠️  Relationship discovery demonstration skipped', {
        error: (error as Error).message,
      });
    }
  }

  /**
   * Demonstrate health monitoring
   */
  private async demonstrateHealthMonitoring(): Promise<void> {
    logger.info('🏥 Demonstrating Health Monitoring');

    try {
      const health = await this.dataLayer.getHealthStatus();

      logger.info('💚 System Health Status', {
        overall: health.overall,
        dataSourcesHealthy: Object.values(health.dataSources).filter(
          (status: any) => status.status === 'healthy'
        ).length,
        connectorsHealthy: Object.values(health.connectors).filter(
          (status: any) => status.status === 'healthy'
        ).length,
        analyticsStatus: health.analytics.status,
        federationStatus: health.federation.status,
      });
    } catch (error) {
      logger.error('❌ Health monitoring failed', error);
    }
  }

  /**
   * Demonstrate performance metrics
   */
  private demonstrateMetrics(): void {
    logger.info('📊 Demonstrating Performance Metrics');

    const metrics = this.dataLayer.getMetrics();

    logger.info('📈 System Metrics', {
      dataSources: {
        total: metrics.dataSources.total,
        healthy: metrics.dataSources.healthy,
      },
      queries: {
        totalExecuted: metrics.queries.totalExecuted,
        averageTime: Math.round(metrics.queries.averageExecutionTime),
        errorRate: Math.round(metrics.queries.errorRate * 100),
      },
      analytics: {
        threatsAnalyzed: metrics.analytics.threatsAnalyzed,
        patternsDetected: metrics.analytics.patternsDetected,
      },
      connectors: {
        total: metrics.connectors.total,
        connected: metrics.connectors.connected,
      },
    });
  }
}

// Example usage
if (require.main === module) {
  const demo = new DataLayerIntegrationExample();

  demo
    .demonstrateCapabilities()
    .then(() => {
      logger.info('✅ Data layer demonstration completed successfully');
      process.exit(0);
    })
    .catch(error => {
      logger.error('❌ Data layer demonstration failed', error);
      process.exit(1);
    });
}
