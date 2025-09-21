// Core Services - Mixed server/client usage
// Contains both server-side logic (environment variables) and client-accessible exports
// Base Classes and Types (export first to avoid reference issues)
export { BusinessLogicBase } from './base/BusinessLogicBase';
export { BaseService } from './base/BaseService';
export * from './types/business-logic.types';
export * from './types/service.types';

// Core ML Services - Enterprise ML Platform for Phantom Spire
export { AutoMLPipelineOrchestrator } from './automl/AutoMLPipelineOrchestrator';
export { DataPipelineService } from './data/DataPipelineService';
export { ModelDeploymentService } from './deployment/ModelDeploymentService';

// Placeholder classes for services that don't exist yet
export class MLEngine {
  constructor(public config?: unknown, public environment?: unknown) {}
}

export class HuggingFaceIntegrationService {
  constructor(public config?: unknown, public environment?: unknown) {}
}

export class ModelRegistryService {
  constructor(public config?: unknown, public environment?: unknown) {}
}

export class RealTimeMonitoringService {
  constructor(public config?: unknown, public environment?: unknown) {}
}

export class TrainingOrchestrator {
  constructor(public config?: unknown, public environment?: unknown) {}
}

export class SecurityService {
  constructor(public config?: unknown, public environment?: unknown) {}
}

// Type definitions for service configurations
export interface ServiceConfig {
  enableLogging?: boolean;
  enableMetrics?: boolean;
  enableEvents?: boolean;
  retryAttempts?: number;
  timeoutMs?: number;
}

export interface ServiceEnvironment {
  name: string;
  region: string;
  apiEndpoints: Record<string, string>;
  credentials: Record<string, string>;
}

export interface ServiceHealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  latency: number;
  checks: unknown[];
  error?: string;
}

// Service Factory for creating configured service instances
export class MLServiceFactory {
  private static instance: MLServiceFactory;
  private services: Map<string, unknown> = new Map();

  private constructor() {}

  public static getInstance(): MLServiceFactory {
    if (!MLServiceFactory.instance) {
      MLServiceFactory.instance = new MLServiceFactory();
    }
    return MLServiceFactory.instance;
  }

  public createMLEngine(config?: Partial<ServiceConfig>): MLEngine {
    const defaultConfig = {
      enableLogging: true,
      enableMetrics: true,
      enableEvents: true,
      retryAttempts: 3,
      timeoutMs: 30000
    };

    const environment = {
      name: process.env.NODE_ENV || 'development',
      region: process.env.AWS_REGION || 'us-east-1',
      apiEndpoints: {
        huggingface: 'https://api-inference.huggingface.co',
        modelRegistry: process.env.MODEL_REGISTRY_URL || 'http://localhost:8080',
        monitoring: process.env.MONITORING_URL || 'http://localhost:9090'
      },
      credentials: {
        huggingfaceToken: process.env.HUGGINGFACE_TOKEN || '',
        awsAccessKey: process.env.AWS_ACCESS_KEY_ID || '',
        awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY || ''
      }
    };

    return new MLEngine({ ...defaultConfig, ...config }, environment);
  }

  public createAutoMLOrchestrator(config?: Partial<ServiceConfig>): AutoMLPipelineOrchestrator {
    const defaultConfig = {
      enableLogging: true,
      enableMetrics: true,
      enableEvents: true,
      retryAttempts: 3,
      timeoutMs: 60000
    };

    const environment = {
      name: process.env.NODE_ENV || 'development',
      region: process.env.AWS_REGION || 'us-east-1',
      apiEndpoints: {
        mlEngine: 'http://localhost:8081',
        dataService: 'http://localhost:8082'
      },
      credentials: {}
    };

    return new AutoMLPipelineOrchestrator({ ...defaultConfig, ...config }, environment);
  }

  public createHuggingFaceService(config?: Partial<ServiceConfig>): HuggingFaceIntegrationService {
    const defaultConfig = {
      enableLogging: true,
      enableMetrics: true,
      enableEvents: true,
      retryAttempts: 3,
      timeoutMs: 120000
    };

    const environment = {
      name: process.env.NODE_ENV || 'development',
      region: process.env.AWS_REGION || 'us-east-1',
      apiEndpoints: {
        huggingface: 'https://api-inference.huggingface.co',
        hub: 'https://huggingface.co'
      },
      credentials: {
        huggingfaceToken: process.env.HUGGINGFACE_TOKEN || ''
      }
    };

    return new HuggingFaceIntegrationService({ ...defaultConfig, ...config }, environment);
  }

  public createModelRegistry(config?: Partial<ServiceConfig>): ModelRegistryService {
    const defaultConfig = {
      enableLogging: true,
      enableMetrics: true,
      enableEvents: true,
      retryAttempts: 3,
      timeoutMs: 30000
    };

    const environment = {
      name: process.env.NODE_ENV || 'development',
      region: process.env.AWS_REGION || 'us-east-1',
      apiEndpoints: {
        storage: process.env.MODEL_STORAGE_URL || 's3://phantom-ml-models',
        database: process.env.DATABASE_URL || 'postgresql://phantom_dev:dev_password@localhost:5432/phantom_ml_dev'
      },
      credentials: {
        awsAccessKey: process.env.AWS_ACCESS_KEY_ID || '',
        awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY || ''
      }
    };

    return new ModelRegistryService({ ...defaultConfig, ...config }, environment);
  }

  public createMonitoringService(config?: Partial<ServiceConfig>): RealTimeMonitoringService {
    const defaultConfig = {
      enableLogging: true,
      enableMetrics: true,
      enableEvents: true,
      retryAttempts: 3,
      timeoutMs: 15000
    };

    const environment = {
      name: process.env.NODE_ENV || 'development',
      region: process.env.AWS_REGION || 'us-east-1',
      apiEndpoints: {
        metrics: process.env.METRICS_URL || 'http://localhost:9090',
        alerts: process.env.ALERTS_URL || 'http://localhost:9093'
      },
      credentials: {}
    };

    return new RealTimeMonitoringService({ ...defaultConfig, ...config }, environment);
  }

  public createTrainingOrchestrator(config?: Partial<ServiceConfig>): TrainingOrchestrator {
    const defaultConfig = {
      enableLogging: true,
      enableMetrics: true,
      enableEvents: true,
      retryAttempts: 3,
      timeoutMs: 3600000 // 1 hour for training
    };

    const environment = {
      name: process.env.NODE_ENV || 'development',
      region: process.env.AWS_REGION || 'us-east-1',
      apiEndpoints: {
        compute: process.env.COMPUTE_URL || 'http://localhost:8083',
        storage: process.env.STORAGE_URL || 's3://phantom-ml-training'
      },
      credentials: {
        awsAccessKey: process.env.AWS_ACCESS_KEY_ID || '',
        awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY || ''
      }
    };

    return new TrainingOrchestrator({ ...defaultConfig, ...config }, environment);
  }

  public createDataPipelineService(config?: Partial<ServiceConfig>): DataPipelineService {
    const defaultConfig = {
      enableLogging: true,
      enableMetrics: true,
      enableEvents: true,
      retryAttempts: 3,
      timeoutMs: 300000 // 5 minutes for data operations
    };

    const environment = {
      name: process.env.NODE_ENV || 'development',
      region: process.env.AWS_REGION || 'us-east-1',
      apiEndpoints: {
        dataWarehouse: process.env.DATA_WAREHOUSE_URL || 'postgresql://localhost:5432/phantom_data',
        streaming: process.env.STREAMING_URL || 'kafka://localhost:9092'
      },
      credentials: {
        databaseUser: process.env.DB_USER || 'phantom_user',
        databasePassword: process.env.DB_PASSWORD || ''
      }
    };

    return new DataPipelineService({ ...defaultConfig, ...config }, environment);
  }

  public createDeploymentService(config?: Partial<ServiceConfig>): ModelDeploymentService {
    const defaultConfig = {
      enableLogging: true,
      enableMetrics: true,
      enableEvents: true,
      retryAttempts: 3,
      timeoutMs: 180000 // 3 minutes for deployments
    };

    const environment = {
      name: process.env.NODE_ENV || 'development',
      region: process.env.AWS_REGION || 'us-east-1',
      apiEndpoints: {
        kubernetes: process.env.K8S_API_URL || 'https://kubernetes.default.svc',
        registry: process.env.CONTAINER_REGISTRY || 'ghcr.io/phantom-spire'
      },
      credentials: {
        kubeconfig: process.env.KUBECONFIG || '',
        registryToken: process.env.REGISTRY_TOKEN || ''
      }
    };

    return new ModelDeploymentService({ ...defaultConfig, ...config }, environment);
  }

  public createSecurityService(config?: Partial<ServiceConfig>): SecurityService {
    const defaultConfig = {
      enableLogging: true,
      enableMetrics: true,
      enableEvents: true,
      retryAttempts: 3,
      timeoutMs: 30000
    };

    const environment = {
      name: process.env.NODE_ENV || 'development',
      region: process.env.AWS_REGION || 'us-east-1',
      apiEndpoints: {
        auth: process.env.AUTH_URL || 'http://localhost:8084',
        vault: process.env.VAULT_URL || 'http://localhost:8200'
      },
      credentials: {
        vaultToken: process.env.VAULT_TOKEN || '',
        jwtSecret: process.env.JWT_SECRET || 'phantom-ml-secret'
      }
    };

    return new SecurityService({ ...defaultConfig, ...config }, environment);
  }

  // Convenience method to get all services
  public getAllServices(): {
    mlEngine: MLEngine;
    automl: AutoMLPipelineOrchestrator;
    huggingface: HuggingFaceIntegrationService;
    modelRegistry: ModelRegistryService;
    monitoring: RealTimeMonitoringService;
    training: TrainingOrchestrator;
    dataPipeline: DataPipelineService;
    deployment: ModelDeploymentService;
    security: SecurityService;
  } {
    return {
      mlEngine: this.createMLEngine(),
      automl: this.createAutoMLOrchestrator(),
      huggingface: this.createHuggingFaceService(),
      modelRegistry: this.createModelRegistry(),
      monitoring: this.createMonitoringService(),
      training: this.createTrainingOrchestrator(),
      dataPipeline: this.createDataPipelineService(),
      deployment: this.createDeploymentService(),
      security: this.createSecurityService()
    };
  }

  // Health check for all services
  public async healthCheck(): Promise<{
    overall: 'healthy' | 'unhealthy' | 'degraded';
    services: Record<string, {
      status: 'healthy' | 'unhealthy' | 'degraded';
      latency: number;
      checks: unknown[];
    }>;
  }> {
    const services = this.getAllServices();
    const serviceChecks: Record<string, ServiceHealthCheck> = {};

    for (const [name, service] of Object.entries(services)) {
      try {
        const start = Date.now();
        const health = await (service as any).executeHealthCheck();
        const latency = Date.now() - start;

        serviceChecks[name] = {
          status: health.status,
          latency,
          checks: health.checks
        };
      } catch (error) {
        serviceChecks[name] = {
          status: 'unhealthy',
          latency: -1,
          checks: [],
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    // Determine overall health
    const statuses = Object.values(serviceChecks).map(s => s.status);
    const unhealthyCount = statuses.filter(s => s === 'unhealthy').length;
    const degradedCount = statuses.filter(s => s === 'degraded').length;

    let overall: 'healthy' | 'unhealthy' | 'degraded';
    if (unhealthyCount > 0) {
      overall = 'unhealthy';
    } else if (degradedCount > 0) {
      overall = 'degraded';
    } else {
      overall = 'healthy';
    }

    return { overall, services: serviceChecks };
  }
}

// Export singleton instance
export const mlServices = MLServiceFactory.getInstance();
