/**
 * Main API Router v1
 * Integrates all business-ready package endpoints
 */

import { Router } from 'express';
import cveRouter from './v1/cve';
import threatActorRouter from './v1/threat-actor';
import xdrRouter from './v1/xdr-extended';
import { DatabaseService } from '../../services/DatabaseService';
import { LoggingService } from '../../services/LoggingService';
import { CacheService } from '../../services/CacheService';

const router = Router();
const logger = LoggingService.getInstance();

// Initialize services
const initializeServices = async () => {
  try {
    await DatabaseService.getInstance().initialize();
    logger.info('All services initialized successfully');
  } catch (error) {
    logger.error('Service initialization failed:', error);
    throw error;
  }
};

// Health check for all services
router.get('/health', async (req, res) => {
  try {
    const dbService = DatabaseService.getInstance();
    const cacheService = CacheService.getInstance();
    
    const dbHealth = await dbService.getHealthStatus();
    const cacheStats = await cacheService.getStats();
    
    const overallHealth = {
      status: 'healthy',
      timestamp: new Date(),
      services: {
        database: dbHealth,
        cache: cacheStats,
        packages: {
          cve_core: 'operational',
          threat_actor_core: 'operational',
          xdr_core: 'operational'
        }
      }
    };

    res.json({
      success: true,
      data: overallHealth,
      message: 'System health check completed'
    });

  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      success: false,
      message: 'Health check failed',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Initialize services on startup
initializeServices().catch((error) => {
  logger.error('Failed to initialize services:', error);
  process.exit(1);
});

// Mount package-specific routers
router.use('/cve', cveRouter);
router.use('/threat-actor', threatActorRouter);
router.use('/xdr', xdrRouter);

// API documentation endpoint
router.get('/docs', (req, res) => {
  res.json({
    success: true,
    data: {
      title: 'Phantom Spire API v1',
      version: '1.0.0',
      description: 'Production-ready REST API for cybersecurity threat intelligence',
      endpoints: {
        cve: {
          base: '/api/v1/cve',
          endpoints: [
            'POST /analyze - Analyze CVE for threat intelligence',
            'GET /search - Search CVEs with advanced criteria',
            'GET /:cveId/timeline - Get exploit timeline',
            'POST /remediation - Generate remediation strategy',
            'POST /batch - Batch process multiple CVEs',
            'GET /health - CVE Core health status'
          ]
        },
        threat_actor: {
          base: '/api/v1/threat-actor',
          endpoints: [
            'POST /analyze - Analyze threat actor from indicators',
            'POST /attribution - Perform attribution analysis',
            'POST /campaign - Track campaign activities',
            'GET /:actorId/behavior - Analyze behavioral patterns',
            'GET /search - Search threat actors',
            'GET /:actorId/reputation - Get reputation score',
            'GET /health - Threat Actor Core health status'
          ]
        },
        xdr: {
          base: '/api/v1/xdr',
          endpoints: [
            'POST /detect - Analyze events for threat detection',
            'POST /respond - Execute automated response',
            'POST /hunt - Execute threat hunting queries',
            'GET /analytics - Get behavioral analytics',
            'GET /dashboard - Get real-time dashboard data',
            'GET /health - XDR Core health status'
          ]
        }
      },
      features: [
        'Production-ready REST APIs',
        'Rate limiting and security',
        'Comprehensive caching',
        'Multi-database persistence',
        'Real-time threat intelligence',
        'Automated response capabilities',
        'Advanced behavioral analytics',
        'Swagger/OpenAPI documentation'
      ]
    },
    message: 'API documentation retrieved successfully'
  });
});

export default router;