/**
 * Phantom CVE Core Plugin Initialization
 * Multi-database setup for business SaaS readiness
 */

import { logger } from '../utils/logger.js';
import { initializeCVEDataService } from '../controllers/cveController.js';
import { 
  loadCVECoreConfig, 
  toCVEDataServiceConfig, 
  validateConfiguration,
  getConfigurationSummary 
} from '../config/cveDataConfig.js';

/**
 * Initialize the Phantom CVE Core plugin with multi-database support
 */
export async function initializePhantomCVECore(): Promise<{
  success: boolean;
  message: string;
  configuration?: any;
  errors?: string[];
}> {
  try {
    logger.info('Initializing Phantom CVE Core plugin with multi-database support...');

    // Load configuration from environment
    const config = loadCVECoreConfig();
    
    // Validate configuration
    const validation = validateConfiguration(config);
    
    if (!validation.isValid) {
      logger.error('CVE Core configuration validation failed', {
        errors: validation.errors,
        warnings: validation.warnings,
      });
      
      return {
        success: false,
        message: 'Configuration validation failed',
        errors: validation.errors,
      };
    }

    // Log warnings and recommendations
    if (validation.warnings.length > 0) {
      logger.warn('CVE Core configuration warnings', {
        warnings: validation.warnings,
        recommendations: validation.recommendations,
      });
    }

    // Convert to data service configuration
    const dataServiceConfig = toCVEDataServiceConfig(config);
    
    // Initialize the CVE data service
    initializeCVEDataService(dataServiceConfig);
    
    // Get configuration summary
    const summary = getConfigurationSummary(config);
    
    logger.info('Phantom CVE Core plugin initialized successfully', {
      businessSaasReadiness: summary.businessSaasReadiness.level,
      readinessScore: summary.businessSaasReadiness.score,
      enabledDatabases: summary.databases.enabled,
      capabilities: summary.capabilities,
    });

    return {
      success: true,
      message: `Phantom CVE Core plugin initialized with ${summary.businessSaasReadiness.level} SaaS readiness`,
      configuration: {
        summary,
        validation: {
          warnings: validation.warnings,
          recommendations: validation.recommendations,
        },
        dataStrategy: config.dataStrategy,
      },
    };
  } catch (error) {
    logger.error('Failed to initialize Phantom CVE Core plugin', error);
    
    return {
      success: false,
      message: 'Initialization failed',
      errors: [(error as Error).message],
    };
  }
}

/**
 * Get current CVE Core plugin status
 */
export function getCVECoreStatus(): {
  initialized: boolean;
  configuration?: any;
  health?: any;
} {
  try {
    const config = loadCVECoreConfig();
    const summary = getConfigurationSummary(config);
    
    return {
      initialized: true,
      configuration: summary,
    };
  } catch (error) {
    logger.error('Failed to get CVE Core status', error);
    
    return {
      initialized: false,
    };
  }
}

/**
 * Express.js middleware to ensure CVE Core is initialized
 */
export function ensureCVECoreInitialized() {
  return (req: any, res: any, next: any) => {
    const status = getCVECoreStatus();
    
    if (!status.initialized) {
      return res.status(503).json({
        error: 'Phantom CVE Core plugin not initialized',
        message: 'Please configure multi-database support and initialize the plugin',
        documentation: 'https://github.com/harborgrid-justin/phantom-spire/blob/main/docs/cve-plugin-setup.md',
      });
    }
    
    // Add CVE core status to request context
    req.cveCore = status;
    next();
  };
}

/**
 * Health check endpoint for CVE Core plugin
 */
export async function healthCheckCVECore(): Promise<any> {
  try {
    const status = getCVECoreStatus();
    
    if (!status.initialized) {
      return {
        status: 'unhealthy',
        message: 'CVE Core plugin not initialized',
        timestamp: new Date().toISOString(),
      };
    }

    return {
      status: 'healthy',
      message: 'CVE Core plugin operational',
      plugin: 'phantom-cve-core',
      version: '1.0.0',
      businessSaasReadiness: status.configuration?.businessSaasReadiness,
      capabilities: status.configuration?.capabilities,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error('CVE Core health check failed', error);
    
    return {
      status: 'unhealthy',
      message: 'Health check failed',
      error: (error as Error).message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Generate setup guide for CVE Core plugin
 */
export function generateSetupGuide(): {
  title: string;
  steps: Array<{
    step: number;
    title: string;
    description: string;
    commands?: string[];
    environment?: Record<string, string>;
  }>;
  examples: any;
} {
  return {
    title: 'Phantom CVE Core Plugin Setup Guide',
    steps: [
      {
        step: 1,
        title: 'Install Dependencies',
        description: 'Ensure all required database packages are installed',
        commands: [
          'npm install redis pg mongodb @elastic/elasticsearch',
          'npm install @types/pg --save-dev',
        ],
      },
      {
        step: 2,
        title: 'Setup Database Services',
        description: 'Start the required database services using Docker Compose',
        commands: [
          'docker-compose up -d postgres mongodb redis elasticsearch',
          'docker-compose ps',
        ],
      },
      {
        step: 3,
        title: 'Configure Environment Variables',
        description: 'Set up environment variables for multi-database configuration',
        environment: {
          'MONGODB_URI': 'mongodb://admin:phantom_secure_pass@localhost:27017/phantom_spire?authSource=admin',
          'POSTGRESQL_URI': 'postgresql://postgres:phantom_secure_pass@localhost:5432/phantom_spire',
          'REDIS_URL': 'redis://:phantom_redis_pass@localhost:6379/0',
          'ELASTICSEARCH_URL': 'http://localhost:9200',
          'CVE_READ_PREFERENCE': 'cache-first',
          'CVE_WRITE_STRATEGY': 'dual',
          'CVE_CONSISTENCY_LEVEL': 'eventual',
        },
      },
      {
        step: 4,
        title: 'Initialize Plugin',
        description: 'Initialize the CVE Core plugin in your application startup',
        commands: [
          'import { initializePhantomCVECore } from "./src/plugins/cveCore.js";',
          'const result = await initializePhantomCVECore();',
          'console.log(result);',
        ],
      },
      {
        step: 5,
        title: 'Test Configuration',
        description: 'Verify the plugin is working correctly',
        commands: [
          'curl http://localhost:3000/api/cve/health',
          'curl http://localhost:3000/api/cve/statistics',
        ],
      },
    ],
    examples: {
      docker_compose: {
        description: 'Example docker-compose.yml section for CVE databases',
        content: `
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: phantom_spire
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: phantom_secure_pass
    ports:
      - "5432:5432"
    
  mongodb:
    image: mongo:5.0
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: phantom_secure_pass
      MONGO_INITDB_DATABASE: phantom_spire
    ports:
      - "27017:27017"
    
  redis:
    image: redis:6.2
    command: redis-server --requirepass phantom_redis_pass
    ports:
      - "6379:6379"
    
  elasticsearch:
    image: elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
        `,
      },
      environment_file: {
        description: 'Example .env configuration',
        content: `
# Multi-Database Configuration
MONGODB_URI=mongodb://admin:phantom_secure_pass@localhost:27017/phantom_spire?authSource=admin
POSTGRESQL_URI=postgresql://postgres:phantom_secure_pass@localhost:5432/phantom_spire
REDIS_URL=redis://:phantom_redis_pass@localhost:6379/0
ELASTICSEARCH_URL=http://localhost:9200

# CVE Plugin Configuration
CVE_READ_PREFERENCE=cache-first
CVE_WRITE_STRATEGY=dual
CVE_CONSISTENCY_LEVEL=eventual
CVE_CACHE_INVALIDATION=immediate

# Business SaaS Features
CVE_MULTI_TENANCY=true
CVE_DATA_RETENTION=365
CVE_AUDIT_LOGGING=true
CVE_ENCRYPTION=true
CVE_BACKUPS=true

# Database Roles
CVE_MONGODB_ROLE=primary
CVE_REDIS_ROLE=cache
CVE_POSTGRESQL_ROLE=analytics
CVE_ELASTICSEARCH_ROLE=search
        `,
      },
    },
  };
}