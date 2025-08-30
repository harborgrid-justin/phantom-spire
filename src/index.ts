import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config/config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { connectDatabase } from './config/database';
import routes from './routes';
import swaggerSpec from './config/swagger';
import swaggerUi from 'swagger-ui-express';
import { WorkflowBPMOrchestrator } from './workflow-bpm';
import workflowRoutes from './routes/workflow/workflowRoutes';
import { initializeEnterpriseManagement, shutdownEnterpriseManagement } from './services';
import { EnterprisePlatformIntegration } from './enterprise-integration';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.NODE_ENV,
  });
});

// API routes
app.use('/api/v1', routes);

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} was not found on this server.`,
  });
});

async function startServer(): Promise<void> {
  try {
    // Connect to database
    await connectDatabase();
    
    // Initialize Fortune 100-grade Cache and State Management
    logger.info('🚀 Initializing Fortune 100-Grade Cache and State Management...');
    await initializeEnterpriseManagement({
      cache: {
        enabled: config.CACHE_ENABLED,
        layers: {
          memory: {
            enabled: true,
            maxSize: config.CACHE_MEMORY_MAX_SIZE,
            ttl: config.CACHE_MEMORY_TTL
          },
          redis: {
            enabled: true,
            ttl: config.CACHE_REDIS_TTL,
            keyPrefix: config.CACHE_REDIS_PREFIX
          }
        },
        monitoring: {
          enabled: config.CACHE_MONITORING_ENABLED,
          metricsInterval: config.CACHE_MONITORING_INTERVAL
        }
      },
      state: {
        enabled: config.STATE_ENABLED,
        persistence: {
          enabled: config.STATE_PERSISTENCE_ENABLED,
          strategy: config.STATE_PERSISTENCE_STRATEGY as any,
          syncInterval: config.STATE_SYNC_INTERVAL
        },
        versioning: {
          enabled: config.STATE_VERSIONING_ENABLED,
          maxVersions: config.STATE_VERSIONING_MAX_VERSIONS
        },
        monitoring: {
          enabled: config.STATE_MONITORING_ENABLED,
          trackChanges: true,
          metricsInterval: config.STATE_MONITORING_INTERVAL
        }
      }
    });
    
    // Initialize Workflow BPM Orchestrator
    logger.info('🔧 Initializing Fortune 100-Grade Workflow BPM System...');
    const workflowOrchestrator = new WorkflowBPMOrchestrator({
      engine: {
        maxConcurrentWorkflows: 50000,
        memoryLimit: '8GB',
        executionTimeout: 24 * 60 * 60 * 1000, // 24 hours
        checkpointInterval: 5000
      },
      performance: {
        enableOptimization: true,
        enableMLOptimization: true,
        enableDynamicScaling: true
      }
    });

    // Wait for workflow orchestrator to be ready
    await new Promise<void>((resolve) => {
      workflowOrchestrator.once('orchestrator-ready', () => {
        logger.info('✅ Workflow BPM Orchestrator initialized successfully');
        resolve();
      });
    });

    // Make workflow orchestrator available to routes
    app.locals.workflowOrchestrator = workflowOrchestrator;

    // Add workflow routes
    app.use('/api/v1/workflow', workflowRoutes);
    
    // Initialize Fortune 100-Grade Enterprise Integration Platform
    logger.info('🏢 Initializing Fortune 100-Grade Enterprise Integration Platform...');
    const enterpriseIntegration = new EnterprisePlatformIntegration();
    await enterpriseIntegration.start();
    
    // Make enterprise integration available to the application
    app.locals.enterpriseIntegration = enterpriseIntegration;
    
    logger.info('✅ Enterprise Service Bus and Service Mesh initialized successfully');
    
    const PORT = config.PORT || 3000;
    app.listen(PORT, () => {
      logger.info(`🚀 Phantom Spire CTI Platform started on port ${PORT}`);
      logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      logger.info(`🏥 Health Check: http://localhost:${PORT}/health`);
      logger.info(`🔄 Workflow BPM API: http://localhost:${PORT}/api/v1/workflow`);
      logger.info(`🏢 Enterprise Integration: Service Bus and Service Mesh operational`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  // Shutdown enterprise management systems
  try {
    await shutdownEnterpriseManagement();
  } catch (error) {
    logger.error('Error shutting down enterprise management:', error);
  }
  
  // Shutdown workflow orchestrator if it exists
  if (app.locals.workflowOrchestrator) {
    try {
      await app.locals.workflowOrchestrator.shutdown();
    } catch (error) {
      logger.error('Error shutting down workflow orchestrator:', error);
    }
  }
  
  // Shutdown enterprise integration platform if it exists
  if (app.locals.enterpriseIntegration) {
    try {
      await app.locals.enterpriseIntegration.stop();
    } catch (error) {
      logger.error('Error shutting down enterprise integration:', error);
    }
  }
  
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  
  // Shutdown enterprise management systems
  try {
    await shutdownEnterpriseManagement();
  } catch (error) {
    logger.error('Error shutting down enterprise management:', error);
  }
  
  // Shutdown workflow orchestrator if it exists
  if (app.locals.workflowOrchestrator) {
    try {
      await app.locals.workflowOrchestrator.shutdown();
    } catch (error) {
      logger.error('Error shutting down workflow orchestrator:', error);
    }
  }
  
  // Shutdown enterprise integration platform if it exists
  if (app.locals.enterpriseIntegration) {
    try {
      await app.locals.enterpriseIntegration.stop();
    } catch (error) {
      logger.error('Error shutting down enterprise integration:', error);
    }
  }
  
  process.exit(0);
});

if (require.main === module) {
  startServer();
}

export { app };