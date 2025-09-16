/**
 * Enterprise ML Core - Main Export Module
 * Complete H2O.ai competitive enterprise machine learning platform
 * 
 * @example
 * ```typescript
 * import { EnterpriseOrchestratorService, EnterpriseConfig } from '@phantom-ml/enterprise';
 * 
 * const config: EnterpriseConfig = {
 *   tenantId: 'my-company',
 *   environment: 'production',
 *   security: { encryptionEnabled: true, auditLogging: true, rbacEnabled: true, apiKeyRequired: true, rateLimiting: { requestsPerMinute: 1000, requestsPerHour: 10000, burstLimit: 100 } },
 *   compliance: { framework: ComplianceFramework.GDPR, dataRetentionDays: 365, privacyControls: [], auditRequirements: [] },
 *   monitoring: { metricsEnabled: true, alertingEnabled: true, logLevel: LogLevel.INFO, performanceTracking: true },
 *   persistence: { provider: PersistenceProvider.POSTGRESQL, connectionString: 'postgresql://...', backupEnabled: true }
 * };
 * 
 * const orchestrator = new EnterpriseOrchestratorService(config);
 * 
 * // Train and deploy a model with full enterprise workflow
 * const result = await orchestrator.trainAndDeployModel('my-model', trainingData, trainingConfig);
 * 
 * // Perform comprehensive analysis
 * const analysis = await orchestrator.performFullAnalysis('model-id', data);
 * 
 * // Setup production environment with monitoring and compliance
 * const production = await orchestrator.setupProductionEnvironment('model-id');
 * ```
 */

// Core Services
export { EnterpriseCoreService } from './enterprise-core.service';
export { EnterpriseOrchestratorService } from './enterprise-orchestrator.service';

// Specialized Services
export { EnterprisePersistenceService } from './persistence/enterprise-persistence.service';
export { RealTimeProcessingService } from './streaming/real-time-processing.service';
export { EnterpriseStateManager } from './state/enterprise-state-manager.service';
export { BusinessIntelligenceService } from './analytics/business-intelligence.service';
export { ComplianceSecurityService } from './security/compliance-security.service';
export { PerformanceMonitoringService } from './monitoring/performance-monitoring.service';
export { FrontendIntegrationService } from './integration/frontend-integration.service';

// Types and Interfaces
export * from './types';

// Workflow and Orchestration Types
export type {
  OrchestrationWorkflow,
  WorkflowStep,
  WorkflowStatus,
  StepStatus,
  ServiceHealthStatus
} from './enterprise-orchestrator.service';

// Persistence Types
export type {
  PersistenceConnection,
  ConnectionMetrics,
  QueryResult,
  TransactionContext,
  TransactionOperation,
  CacheConfig
} from './persistence/enterprise-persistence.service';

// Real-time Processing Types
export type {
  StreamProcessor,
  ProcessorMetrics,
  StreamMessage,
  ProcessingResult,
  CircuitBreakerConfig,
  BackpressureConfig,
  ProcessorStatus,
  CircuitBreakerState
} from './streaming/real-time-processing.service';

// State Management Types
export type {
  StateEntry,
  StateTransaction,
  StateOperation,
  StateSnapshot
} from './state/enterprise-state-manager.service';

// Business Intelligence Types
export type {
  Dashboard,
  Widget,
  KPIReport,
  KPIMetric,
  BusinessReport,
  WidgetType,
  ReportType
} from './analytics/business-intelligence.service';

// Frontend Integration Types
export type {
  APIEndpoint,
  WebSocketChannel
} from './integration/frontend-integration.service';

/**
 * Enterprise ML Platform Factory
 * Convenience factory for creating fully configured enterprise instances
 */
export class EnterprisePlatformFactory {
  /**
   * Create a development environment configuration
   */
  static createDevelopmentConfig(tenantId: string): EnterpriseConfig {
    return {
      tenantId,
      environment: 'development',
      security: {
        encryptionEnabled: false,
        auditLogging: true,
        rbacEnabled: false,
        apiKeyRequired: false,
        rateLimiting: {
          requestsPerMinute: 100,
          requestsPerHour: 1000,
          burstLimit: 20
        }
      },
      compliance: {
        framework: ComplianceFramework.ISO27001,
        dataRetentionDays: 30,
        privacyControls: [],
        auditRequirements: []
      },
      monitoring: {
        metricsEnabled: true,
        alertingEnabled: false,
        logLevel: LogLevel.DEBUG,
        performanceTracking: false
      },
      persistence: {
        provider: PersistenceProvider.POSTGRESQL,
        connectionString: 'postgresql://localhost:5432/phantom_ml_dev',
        backupEnabled: false
      }
    };
  }

  /**
   * Create a production environment configuration
   */
  static createProductionConfig(tenantId: string): EnterpriseConfig {
    return {
      tenantId,
      environment: 'production',
      security: {
        encryptionEnabled: true,
        auditLogging: true,
        rbacEnabled: true,
        apiKeyRequired: true,
        rateLimiting: {
          requestsPerMinute: 1000,
          requestsPerHour: 10000,
          burstLimit: 100
        }
      },
      compliance: {
        framework: ComplianceFramework.SOC2,
        dataRetentionDays: 2555, // 7 years
        privacyControls: [
          {
            type: 'data_minimization',
            enabled: true,
            config: {}
          },
          {
            type: 'consent_management',
            enabled: true,
            config: {}
          }
        ],
        auditRequirements: [
          {
            type: 'data_access',
            frequency: 'realtime',
            retention: 2555
          },
          {
            type: 'model_changes',
            frequency: 'realtime',
            retention: 2555
          }
        ]
      },
      monitoring: {
        metricsEnabled: true,
        alertingEnabled: true,
        logLevel: LogLevel.INFO,
        performanceTracking: true
      },
      persistence: {
        provider: PersistenceProvider.POSTGRESQL,
        connectionString: process.env.DATABASE_URL || 'postgresql://prod-db:5432/phantom_ml',
        encryptionKey: process.env.DB_ENCRYPTION_KEY,
        backupEnabled: true
      }
    };
  }

  /**
   * Create a HIPAA-compliant configuration
   */
  static createHIPAAConfig(tenantId: string): EnterpriseConfig {
    return {
      tenantId,
      environment: 'production',
      security: {
        encryptionEnabled: true,
        auditLogging: true,
        rbacEnabled: true,
        apiKeyRequired: true,
        rateLimiting: {
          requestsPerMinute: 500,
          requestsPerHour: 5000,
          burstLimit: 50
        }
      },
      compliance: {
        framework: ComplianceFramework.HIPAA,
        dataRetentionDays: 2190, // 6 years
        privacyControls: [
          {
            type: 'phi_protection',
            enabled: true,
            config: { encryptionLevel: 'AES-256' }
          },
          {
            type: 'access_logging',
            enabled: true,
            config: { granularity: 'field_level' }
          },
          {
            type: 'data_anonymization',
            enabled: true,
            config: { method: 'k_anonymity', k: 5 }
          }
        ],
        auditRequirements: [
          {
            type: 'phi_access',
            frequency: 'realtime',
            retention: 2190
          },
          {
            type: 'system_security',
            frequency: 'daily',
            retention: 2190
          }
        ]
      },
      monitoring: {
        metricsEnabled: true,
        alertingEnabled: true,
        logLevel: LogLevel.WARN,
        performanceTracking: true
      },
      persistence: {
        provider: PersistenceProvider.POSTGRESQL,
        connectionString: process.env.HIPAA_DATABASE_URL || '',
        encryptionKey: process.env.HIPAA_ENCRYPTION_KEY,
        backupEnabled: true
      }
    };
  }

  /**
   * Create a GDPR-compliant configuration
   */
  static createGDPRConfig(tenantId: string): EnterpriseConfig {
    return {
      tenantId,
      environment: 'production',
      security: {
        encryptionEnabled: true,
        auditLogging: true,
        rbacEnabled: true,
        apiKeyRequired: true,
        rateLimiting: {
          requestsPerMinute: 1000,
          requestsPerHour: 10000,
          burstLimit: 100
        }
      },
      compliance: {
        framework: ComplianceFramework.GDPR,
        dataRetentionDays: 1095, // 3 years default
        privacyControls: [
          {
            type: 'consent_management',
            enabled: true,
            config: { granularity: 'purpose_specific' }
          },
          {
            type: 'right_to_be_forgotten',
            enabled: true,
            config: { automation: true }
          },
          {
            type: 'data_portability',
            enabled: true,
            config: { format: 'structured' }
          },
          {
            type: 'privacy_by_design',
            enabled: true,
            config: { default_privacy: 'maximum' }
          }
        ],
        auditRequirements: [
          {
            type: 'data_processing',
            frequency: 'realtime',
            retention: 1095
          },
          {
            type: 'consent_changes',
            frequency: 'realtime',
            retention: 1095
          },
          {
            type: 'data_subject_requests',
            frequency: 'realtime',
            retention: 1095
          }
        ]
      },
      monitoring: {
        metricsEnabled: true,
        alertingEnabled: true,
        logLevel: LogLevel.INFO,
        performanceTracking: true
      },
      persistence: {
        provider: PersistenceProvider.POSTGRESQL,
        connectionString: process.env.GDPR_DATABASE_URL || '',
        encryptionKey: process.env.GDPR_ENCRYPTION_KEY,
        backupEnabled: true
      }
    };
  }

  /**
   * Create a high-performance configuration for real-time ML
   */
  static createHighPerformanceConfig(tenantId: string): EnterpriseConfig {
    return {
      tenantId,
      environment: 'production',
      security: {
        encryptionEnabled: true,
        auditLogging: false, // Disabled for performance
        rbacEnabled: true,
        apiKeyRequired: true,
        rateLimiting: {
          requestsPerMinute: 10000,
          requestsPerHour: 100000,
          burstLimit: 1000
        }
      },
      compliance: {
        framework: ComplianceFramework.ISO27001,
        dataRetentionDays: 365,
        privacyControls: [],
        auditRequirements: []
      },
      monitoring: {
        metricsEnabled: true,
        alertingEnabled: true,
        logLevel: LogLevel.ERROR, // Only errors for performance
        performanceTracking: true
      },
      persistence: {
        provider: PersistenceProvider.REDIS, // Fast in-memory storage
        connectionString: process.env.REDIS_URL || 'redis://localhost:6379',
        backupEnabled: false // Disabled for performance
      }
    };
  }
}

/**
 * Enterprise ML Platform Instance
 * Pre-configured instance with commonly used workflows
 */
export class EnterprisePlatform {
  private orchestrator: EnterpriseOrchestratorService;

  constructor(config: EnterpriseConfig) {
    this.orchestrator = new EnterpriseOrchestratorService(config);
  }

  /**
   * Quick start: Train, deploy and monitor a model
   */
  async quickStart(modelName: string, data: TrainingData, config: TrainingConfig) {
    const result = await this.orchestrator.trainAndDeployModel(modelName, data, config);
    const monitoring = await this.orchestrator.setupProductionEnvironment(result.model.id);
    
    return {
      model: result.model,
      deployment: result.deploymentId,
      monitoring: monitoring.monitoring,
      dashboardUrl: `https://dashboard.${this.orchestrator.config.tenantId}.com/models/${result.model.id}`
    };
  }

  /**
   * Full analytics pipeline
   */
  async runFullAnalytics(modelId: string, data: any[]) {
    return await this.orchestrator.performFullAnalysis(modelId, data);
  }

  /**
   * Get system health and status
   */
  async getSystemStatus() {
    return await this.orchestrator.getSystemHealth();
  }

  /**
   * Access individual services
   */
  get services() {
    return {
      core: this.orchestrator.core,
      persistence: this.orchestrator.persistence,
      realTime: this.orchestrator.realTime,
      state: this.orchestrator.state,
      businessIntelligence: this.orchestrator.businessIntelligence,
      security: this.orchestrator.security,
      monitoring: this.orchestrator.monitoring,
      frontend: this.orchestrator.frontend
    };
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    await this.orchestrator.shutdown();
  }
}

// Re-export key types for convenience
import {
  EnterpriseConfig,
  ComplianceFramework,
  LogLevel,
  PersistenceProvider,
  TrainingData,
  TrainingConfig
} from './types';

export {
  ComplianceFramework,
  LogLevel,
  PersistenceProvider
};

// Default export for easy importing
export default EnterprisePlatform;

/**
 * Version information
 */
export const VERSION = '1.0.0';
export const BUILD_DATE = new Date().toISOString();
export const FEATURES = [
  'enterprise-ml-core',
  'real-time-processing',
  'business-intelligence',
  'compliance-automation',
  'performance-monitoring',
  'workflow-orchestration',
  'multi-provider-persistence',
  'frontend-integration'
];

/**
 * Library information
 */
export const PHANTOM_ML_ENTERPRISE = {
  version: VERSION,
  buildDate: BUILD_DATE,
  features: FEATURES,
  description: 'Enterprise-grade machine learning platform with H2O.ai competitive features',
  author: 'Phantom ML Team',
  license: 'Enterprise',
  compatibility: {
    nodejs: '>=16.0.0',
    typescript: '>=4.5.0',
    nextjs: '>=12.0.0'
  }
};

console.log(`
🚀 Phantom ML Enterprise v${VERSION}
   ${FEATURES.length} enterprise features loaded
   Build: ${BUILD_DATE}
   Ready for production ML workloads
`);
