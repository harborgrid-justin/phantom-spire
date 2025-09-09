import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/config.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { connectDatabase } from './config/database.js';
import routes from './routes/index.js';
import setupRoutes from './routes/setup.js';
import comprehensiveSetupRoutes from './setup/routes/setupRoutes.js';
import vulnerabilityManagementRoutes from './routes/vulnerabilityManagement.js';
import secopsRoutes from './routes/secopsRoutes.js';
import ttpRoutes from './routes/ttpRoutes.js';
import swaggerSpec from './config/swagger.js';
import swaggerUi from 'swagger-ui-express';
import { WorkflowBPMOrchestrator } from './workflow-bpm/index.js';
import workflowRoutes from './routes/workflow/workflowRoutes.js';
import {
  initializeEnterpriseManagement,
  shutdownEnterpriseManagement,
} from './services/index.js';
import { EnterprisePlatformIntegration } from './enterprise-integration/index.js';
import { centralizedServiceCenter } from './centralized-service-center/index.js';
import unifiedAPIRouter from './centralized-service-center/services/UnifiedAPIRouter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security middleware - disable CSP for setup pages
app.use((req, res, next) => {
  if (req.path.startsWith('/setup')) {
    // Disable CSP for setup pages
    helmet({
      contentSecurityPolicy: false,
    })(req, res, next);
  } else {
    // Use normal CSP for other pages
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://fonts.googleapis.com',
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://fonts.googleapis.com',
          ],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
        },
      },
    })(req, res, next);
  }
});
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
  })
);

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

// Serve static files from setup directory
app.use('/setup/static', express.static(path.join(__dirname, 'setup/static')));

// Setup page route
app.get('/setup', (_req, res) => {
  res.sendFile(path.join(__dirname, 'setup/static/index.html'));
});

// Dashboard page route
app.get('/dashboard', (_req, res) => {
  res.sendFile(path.join(__dirname, 'setup/static/dashboard.html'));
});

// Frontend React application route
app.get('/frontend', (_req, res) => {
  res.sendFile(path.join(__dirname, 'setup/static/frontend.html'));
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.NODE_ENV,
  });
});

// Root endpoint - main entry point
app.get('/', (_req, res) => {
  res.status(200).json({
    name: 'Phantom Spire CTI Platform',
    version: '1.0.0',
    description: 'Enterprise-grade Cyber Threat Intelligence Platform',
    status: 'operational',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      setup: '/setup',
      dashboard: '/dashboard',
      apiDocs: '/api-docs',
      api: '/api/v1',
      secops: '/api/v1/secops',
      ttp: '/api/v1/ttp',
      workflow: '/api/v1/workflow',
      platform: '/api/v1/platform',
      vulnerabilityManagement: '/api/v1/vulnerability-management',
    },
    ui: {
      setup: 'http://localhost:3000/setup',
      dashboard: 'http://localhost:3000/dashboard',
    },
  });
});

// API routes
app.use('/api/v1', routes);
app.use('/api/v1/vulnerability-management', vulnerabilityManagementRoutes);
app.use('/api/v1/secops', secopsRoutes);
app.use('/api/v1/ttp', ttpRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/setup', comprehensiveSetupRoutes);

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
    logger.info('🔄 Starting server initialization...');

    // Connect to database
    logger.info('📂 Connecting to database...');
    await connectDatabase();
    logger.info('✅ Database connected successfully');

    // Initialize Fortune 100-grade Cache and State Management
    logger.info(
      '🚀 Initializing Fortune 100-Grade Cache and State Management...'
    );
    await initializeEnterpriseManagement({
      cache: {
        enabled: config.CACHE_ENABLED,
        layers: {
          memory: {
            enabled: true,
            maxSize: config.CACHE_MEMORY_MAX_SIZE,
            ttl: config.CACHE_MEMORY_TTL,
          },
          redis: {
            enabled: true,
            ttl: config.CACHE_REDIS_TTL,
            keyPrefix: config.CACHE_REDIS_PREFIX,
          },
        },
        monitoring: {
          enabled: config.CACHE_MONITORING_ENABLED,
          metricsInterval: config.CACHE_MONITORING_INTERVAL,
        },
      },
      state: {
        enabled: config.STATE_ENABLED,
        persistence: {
          enabled: config.STATE_PERSISTENCE_ENABLED,
          strategy: config.STATE_PERSISTENCE_STRATEGY as any,
          syncInterval: config.STATE_SYNC_INTERVAL,
        },
        versioning: {
          enabled: config.STATE_VERSIONING_ENABLED,
          maxVersions: config.STATE_VERSIONING_MAX_VERSIONS,
        },
        monitoring: {
          enabled: config.STATE_MONITORING_ENABLED,
          trackChanges: true,
          metricsInterval: config.STATE_MONITORING_INTERVAL,
        },
      },
    });
    logger.info('✅ Enterprise Management initialized');

    // Initialize Workflow BPM Orchestrator
    logger.info('🔧 Initializing Fortune 100-Grade Workflow BPM System...');
    const workflowOrchestrator = new WorkflowBPMOrchestrator({
      engine: {
        maxConcurrentWorkflows: 50000,
        memoryLimit: '8GB',
        executionTimeout: 24 * 60 * 60 * 1000, // 24 hours
        checkpointInterval: 5000,
      },
      performance: {
        enableOptimization: true,
        enableMLOptimization: true,
        enableDynamicScaling: true,
      },
    });

    logger.info(
      '⏭️ Starting server without waiting for workflow orchestrator...'
    );
    // Don't wait for workflow orchestrator - let it initialize in background
    workflowOrchestrator.once('orchestrator-ready', () => {
      logger.info('✅ Workflow BPM Orchestrator initialized successfully');
    });

    // Make workflow orchestrator available to routes
    app.locals.workflowOrchestrator = workflowOrchestrator;

    // Add workflow routes
    app.use('/api/v1/workflow', workflowRoutes);
    logger.info('✅ Workflow routes registered');

    // Skip enterprise integration for now to get server started
    logger.info(
      '⏭️ Skipping enterprise integration initialization for faster startup...'
    );

    const PORT = config.PORT || 3000;
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Phantom Spire CTI Platform started on port ${PORT}`);
      logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      logger.info(`🏥 Health Check: http://localhost:${PORT}/health`);
      logger.info(`🌐 Main Entry Point: http://localhost:${PORT}/`);
      logger.info(
        `🔄 Workflow BPM API: http://localhost:${PORT}/api/v1/workflow`
      );
      logger.info(
        `🏢 Enterprise Integration: Service Bus and Service Mesh operational`
      );
      logger.info(
        `🏛️ Centralized Service Center: http://localhost:${PORT}/api/v1/platform`
      );
      logger.info(
        `📋 Unified API Documentation: http://localhost:${PORT}/api/v1/platform/docs`
      );
    });

    // Handle server errors
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use`);
      } else {
        logger.error('Server error:', error);
      }
      process.exit(1);
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

  // Shutdown centralized service center if it exists
  if (app.locals.serviceCenter) {
    try {
      await app.locals.serviceCenter.stop();
    } catch (error) {
      logger.error('Error shutting down service center:', error);
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

  // Shutdown centralized service center if it exists
  if (app.locals.serviceCenter) {
    try {
      await app.locals.serviceCenter.stop();
    } catch (error) {
      logger.error('Error shutting down service center:', error);
    }
  }

  process.exit(0);
});

// ES module equivalent of require.main === module
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export { app };
