/**
 * Enhanced Main Server Entry Point
 * Production-grade server with comprehensive NAPI-RS and business logic integration
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { json, urlencoded } from 'express';

// Import integration services
import { napiIntegrationService } from './services/integration/NAPIIntegrationService';
import { businessLogicOrchestrator } from './services/integration/BusinessLogicOrchestrator';

// Import controllers
import integratedServicesController from './controllers/integratedServicesController';
import authRoutes from './routes/auth';

// Import middleware
import { authMiddleware } from './middleware/auth';
import { validateRequest } from './middleware/validation';

// Import utilities
import { ErrorHandler } from './utils/serviceUtils';

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Security and Performance Middleware
 */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:4000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Limit each IP
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// Body parsing middleware
app.use(json({ limit: '10mb' }));
app.use(urlencoded({ extended: true, limit: '10mb' }));

/**
 * Health Check Endpoint
 */
app.get('/health', async (req, res) => {
  try {
    const napiStatus = napiIntegrationService.getSystemStatus();
    const businessLogicMetrics = businessLogicOrchestrator.getSystemMetrics();
    
    const health = {
      status: 'healthy',
      timestamp: new Date(),
      uptime: process.uptime(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        napi: {
          status: napiStatus.loadedPackages > 0 ? 'healthy' : 'degraded',
          loadedPackages: napiStatus.loadedPackages,
          totalPackages: napiStatus.totalPackages,
          successRate: napiStatus.overallSuccessRate
        },
        businessLogic: {
          status: businessLogicMetrics.activeServices > 0 ? 'healthy' : 'degraded',
          activeServices: businessLogicMetrics.activeServices,
          totalServices: businessLogicMetrics.totalServices,
          successRate: businessLogicMetrics.successRate
        }
      },
      performance: {
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
      }
    };

    // Determine overall status
    if (napiStatus.loadedPackages === 0 || businessLogicMetrics.activeServices === 0) {
      health.status = 'degraded';
      res.status(503);
    }

    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date()
    });
  }
});

/**
 * API Routes
 */
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', integratedServicesController);

/**
 * Development Demo Endpoints
 */
if (process.env.NODE_ENV !== 'production') {
  app.get('/demo/packages', async (req, res) => {
    try {
      const packages = napiIntegrationService.getPackagesInfo();
      res.json({
        success: true,
        data: packages,
        timestamp: new Date()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  app.post('/demo/test-integration', async (req, res) => {
    try {
      const { serviceId, operation, parameters } = req.body;

      const result = await businessLogicOrchestrator.executeBusinessLogic({
        serviceId: serviceId || 'incident-response',
        operation: operation || 'createIncident',
        parameters: parameters || {
          title: 'Demo Incident',
          description: 'This is a demo incident for testing integration',
          severity: 'medium'
        },
        context: {
          userId: 'demo-user',
          sessionId: 'demo-session'
        }
      });

      res.json({
        success: true,
        demo: true,
        result,
        timestamp: new Date()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        demo: true
      });
    }
  });
}

/**
 * Error Handling Middleware
 */
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const handledError = ErrorHandler.handleError(error, 'express-error-handler');
  
  res.status(error.status || 500).json({
    success: false,
    error: handledError.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: handledError.stack }),
    timestamp: new Date()
  });
});

/**
 * 404 Handler
 */
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date()
  });
});

/**
 * Graceful Shutdown Handler
 */
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown(signal: string) {
  console.log(`Received ${signal}. Starting graceful shutdown...`);
  
  // Close HTTP server
  server.close(() => {
    console.log('HTTP server closed.');
    
    // Shutdown integration services
    napiIntegrationService.shutdown();
    
    console.log('Graceful shutdown completed.');
    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
}

/**
 * Start Server
 */
const server = app.listen(PORT, () => {
  console.log(`🚀 Phantom Spire Enhanced Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
  console.log(`📖 API Documentation: http://localhost:${PORT}/api/v1/services`);
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🧪 Demo Endpoints Available:`);
    console.log(`   - GET  /demo/packages`);
    console.log(`   - POST /demo/test-integration`);
  }
  
  // Log service status
  setTimeout(async () => {
    const napiStatus = napiIntegrationService.getSystemStatus();
    const businessLogicMetrics = businessLogicOrchestrator.getSystemMetrics();
    
    console.log(`📦 NAPI Packages: ${napiStatus.loadedPackages}/${napiStatus.totalPackages} loaded`);
    console.log(`⚡ Business Logic Services: ${businessLogicMetrics.activeServices}/${businessLogicMetrics.totalServices} active`);
    console.log(`✅ Integration system ready`);
  }, 2000);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit in production, just log the error
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('SIGTERM');
});

export default app;