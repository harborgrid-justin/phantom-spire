/**
 * Cache and State Management Export Index
 * Fortune 100-grade integrated cache and state management system
 */

// Cache Management
export * from './cache/interfaces/ICacheManager.js';
export * from './cache/providers/MemoryCacheProvider.js';
export * from './cache/providers/RedisCacheProvider.js';
export * from './cache/core/EnterpriseCacheManager.js';
export { cacheManager } from './cache/core/EnterpriseCacheManager.js';

// State Management
export * from './state/interfaces/IStateManager.js';
export * from './state/core/EnterpriseStateManager.js';
export { stateManager } from './state/core/EnterpriseStateManager.js';

// Import the managers for use in functions
import { cacheManager } from './cache/core/EnterpriseCacheManager.js';
import { stateManager } from './state/core/EnterpriseStateManager.js';

// Configuration helpers
export interface IIntegratedConfiguration {
  cache: {
    enabled: boolean;
    layers: {
      memory: { enabled: boolean; maxSize: number; ttl: number };
      redis: { enabled: boolean; ttl: number; keyPrefix: string };
    };
    monitoring: {
      enabled: boolean;
      metricsInterval: number;
    };
  };
  state: {
    enabled: boolean;
    persistence: {
      enabled: boolean;
      strategy: 'memory' | 'redis' | 'database' | 'hybrid';
      syncInterval: number;
    };
    versioning: {
      enabled: boolean;
      maxVersions: number;
    };
    monitoring: {
      enabled: boolean;
      trackChanges: boolean;
      metricsInterval: number;
    };
  };
}

// Default configuration for Fortune 100-grade deployment
export const FORTUNE_100_CONFIG: IIntegratedConfiguration = {
  cache: {
    enabled: true,
    layers: {
      memory: {
        enabled: true,
        maxSize: 10000, // 10K entries
        ttl: 300000, // 5 minutes
      },
      redis: {
        enabled: true,
        ttl: 1800000, // 30 minutes
        keyPrefix: 'phantomspire:enterprise:',
      },
    },
    monitoring: {
      enabled: true,
      metricsInterval: 30000, // 30 seconds
    },
  },
  state: {
    enabled: true,
    persistence: {
      enabled: true,
      strategy: 'hybrid',
      syncInterval: 60000, // 1 minute
    },
    versioning: {
      enabled: true,
      maxVersions: 50, // Keep 50 versions for audit trail
    },
    monitoring: {
      enabled: true,
      trackChanges: true,
      metricsInterval: 60000, // 1 minute
    },
  },
};

/**
 * Initialize integrated cache and state management system
 */
export async function initializeEnterpriseManagement(
  config?: Partial<IIntegratedConfiguration>
): Promise<void> {
  const effectiveConfig = { ...FORTUNE_100_CONFIG, ...config };

  try {
    if (effectiveConfig.cache.enabled) {
      await cacheManager.start();
    }

    if (effectiveConfig.state.enabled) {
      await stateManager.start();
    }

    console.log(
      '✅ Fortune 100-grade Cache and State Management initialized successfully'
    );
  } catch (error) {
    console.error('❌ Failed to initialize Enterprise Management:', error);
    throw error;
  }
}

/**
 * Shutdown integrated management system gracefully
 */
export async function shutdownEnterpriseManagement(): Promise<void> {
  try {
    await Promise.all([stateManager.stop(), cacheManager.stop()]);

    console.log('✅ Enterprise Management shutdown completed');
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    throw error;
  }
}
