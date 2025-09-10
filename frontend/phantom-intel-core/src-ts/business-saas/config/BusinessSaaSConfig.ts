/**
 * Business SaaS Configuration Types and Interfaces
 */

export interface IBusinessSaaSConfig {
  tenantId: string;
  dataStore: IDataStoreConfig;
  features: IFeatureConfig;
  quotas: IQuotaConfig;
  security?: ISecurityConfig;
  realTime?: IRealTimeConfig;
  analytics?: IAnalyticsConfig;
}

export interface IDataStoreConfig {
  mongodb?: IMongoConfig;
  postgresql?: IPostgreSQLConfig;
  redis?: IRedisConfig;
  elasticsearch?: IElasticsearchConfig;
}

export interface IMongoConfig {
  uri: string;
  database: string;
  collection?: string;
  options?: {
    maxPoolSize?: number;
    minPoolSize?: number;
    serverSelectionTimeoutMS?: number;
    socketTimeoutMS?: number;
  };
}

export interface IPostgreSQLConfig {
  connectionString: string;
  schema?: string;
  ssl?: boolean;
  pool?: {
    max?: number;
    min?: number;
    acquireTimeoutMillis?: number;
    idleTimeoutMillis?: number;
  };
}

export interface IRedisConfig {
  url: string;
  keyPrefix?: string;
  db?: number;
  options?: {
    maxRetriesPerRequest?: number;
    retryDelayOnFailover?: number;
    enableReadyCheck?: boolean;
    maxLoadingTimeout?: number;
  };
}

export interface IElasticsearchConfig {
  node: string | string[];
  auth?: {
    username: string;
    password: string;
  };
  apiKey?: string;
  ssl?: {
    ca?: string;
    rejectUnauthorized?: boolean;
  };
  requestTimeout?: number;
  maxRetries?: number;
}

export interface IFeatureConfig {
  realTimeUpdates: boolean;
  advancedAnalytics: boolean;
  customReports: boolean;
  apiAccess: boolean;
  ssoIntegration?: boolean;
  auditLogging?: boolean;
  dataExport?: boolean;
  multiTenancy?: boolean;
  workflowAutomation?: boolean;
  threatIntelligenceFeeds?: boolean;
}

export interface IQuotaConfig {
  maxIndicators: number;
  maxThreatActors: number;
  maxCampaigns: number;
  maxReports: number;
  maxDataSize: number; // in bytes
  maxApiRequestsPerHour: number;
  maxConcurrentUsers: number;
  maxRetentionDays?: number;
  maxExportSize?: number;
}

export interface ISecurityConfig {
  encryptionEnabled: boolean;
  encryptionKey?: string;
  accessControl: {
    enabled: boolean;
    defaultRole: string;
    roles: Record<string, string[]>;
  };
  auditLogging: {
    enabled: boolean;
    retentionDays: number;
    sensitiveDataMasking: boolean;
  };
  compliance: {
    gdprEnabled: boolean;
    hipaaEnabled: boolean;
    socEnabled: boolean;
  };
}

export interface IRealTimeConfig {
  enabled: boolean;
  channels: string[];
  websocket?: {
    port: number;
    path: string;
    cors?: {
      origin: string | string[];
      credentials: boolean;
    };
  };
  pubsub?: {
    channelPrefix: string;
    retryAttempts: number;
    messageExpiration: number;
  };
}

export interface IAnalyticsConfig {
  enabled: boolean;
  engines: string[];
  processing: {
    batchSize: number;
    parallelProcessing: boolean;
    cachingEnabled: boolean;
    cacheExpirationMinutes: number;
  };
  reporting: {
    scheduleEnabled: boolean;
    defaultFormat: 'json' | 'csv' | 'pdf';
    maxReportSize: number;
  };
  intelligence: {
    correlationEnabled: boolean;
    predictionEnabled: boolean;
    anomalyDetectionEnabled: boolean;
    confidenceThreshold: number;
  };
}

export interface ITenantInfo {
  tenantId: string;
  name: string;
  plan: 'basic' | 'professional' | 'enterprise';
  status: 'active' | 'suspended' | 'expired';
  createdAt: Date;
  lastActivity: Date;
  quotas: IQuotaConfig;
  features: IFeatureConfig;
  usage: ITenantUsage;
}

export interface ITenantUsage {
  indicators: number;
  threatActors: number;
  campaigns: number;
  reports: number;
  dataSize: number;
  apiRequests24h: number;
  currentUsers: number;
  lastUpdated: Date;
}

export interface IDataRetentionPolicy {
  indicators: {
    retentionDays: number;
    archiveEnabled: boolean;
    autoDelete: boolean;
  };
  threatActors: {
    retentionDays: number;
    archiveEnabled: boolean;
    autoDelete: boolean;
  };
  campaigns: {
    retentionDays: number;
    archiveEnabled: boolean;
    autoDelete: boolean;
  };
  reports: {
    retentionDays: number;
    archiveEnabled: boolean;
    autoDelete: boolean;
  };
  auditLogs: {
    retentionDays: number;
    compressionEnabled: boolean;
    autoDelete: boolean;
  };
}

export const DEFAULT_BUSINESS_SAAS_CONFIG: Partial<IBusinessSaaSConfig> = {
  features: {
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
  security: {
    encryptionEnabled: true,
    accessControl: {
      enabled: true,
      defaultRole: 'analyst',
      roles: {
        admin: ['read', 'write', 'delete', 'manage'],
        analyst: ['read', 'write'],
        viewer: ['read'],
      },
    },
    auditLogging: {
      enabled: true,
      retentionDays: 90,
      sensitiveDataMasking: true,
    },
    compliance: {
      gdprEnabled: false,
      hipaaEnabled: false,
      socEnabled: false,
    },
  },
  realTime: {
    enabled: true,
    channels: ['threat-updates', 'system-alerts', 'user-activity'],
    websocket: {
      port: 3001,
      path: '/ws',
      cors: {
        origin: '*',
        credentials: true,
      },
    },
    pubsub: {
      channelPrefix: 'phantom-intel',
      retryAttempts: 3,
      messageExpiration: 3600,
    },
  },
  analytics: {
    enabled: true,
    engines: ['correlation', 'prediction', 'anomaly'],
    processing: {
      batchSize: 100,
      parallelProcessing: true,
      cachingEnabled: true,
      cacheExpirationMinutes: 30,
    },
    reporting: {
      scheduleEnabled: true,
      defaultFormat: 'json',
      maxReportSize: 104857600, // 100MB
    },
    intelligence: {
      correlationEnabled: true,
      predictionEnabled: true,
      anomalyDetectionEnabled: true,
      confidenceThreshold: 0.7,
    },
  },
};