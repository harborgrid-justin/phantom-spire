/**
 * Unified API Controller for NAPI-RS and Business Logic Integration
 * Production-grade API layer that provides comprehensive access to all services
 */

import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { businessLogicOrchestrator, BusinessLogicRequest } from '../services/integration/BusinessLogicOrchestrator';
import { napiIntegrationService } from '../integration/NAPIIntegrationService';
import { ErrorHandler } from '../../utils/serviceUtils';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Integrated Services
 *   description: Unified API for NAPI-RS packages and business logic integration
 */

/**
 * @swagger
 * /api/v1/services:
 *   get:
 *     tags: [Integrated Services]
 *     summary: Get all available services
 *     responses:
 *       200:
 *         description: List of available services with their capabilities
 */
router.get('/services', async (req: Request, res: Response) => {
  try {
    const services = businessLogicOrchestrator.getAvailableServices();
    const napiPackages = napiIntegrationService.getPackagesInfo();
    
    const response = {
      success: true,
      data: {
        businessLogicServices: services,
        napiPackages: napiPackages,
        totalServices: services.length,
        totalPackages: napiPackages.length,
        systemMetrics: businessLogicOrchestrator.getSystemMetrics()
      },
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    const handledError = ErrorHandler.handleError(error, 'get-services');
    res.status(500).json({
      success: false,
      error: handledError.message,
      timestamp: new Date()
    });
  }
});

/**
 * @swagger
 * /api/v1/services/{serviceId}:
 *   get:
 *     tags: [Integrated Services]
 *     summary: Get specific service information
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/services/:serviceId', 
  param('serviceId').isString().notEmpty(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid service ID',
          details: errors.array()
        });
      }

      const serviceId = req.params.serviceId;
      const serviceInfo = businessLogicOrchestrator.getServiceInfo(serviceId);
      const serviceMetrics = businessLogicOrchestrator.getServiceMetrics(serviceId);

      if (!serviceInfo) {
        return res.status(404).json({
          success: false,
          error: `Service not found: ${serviceId}`
        });
      }

      const response = {
        success: true,
        data: {
          service: serviceInfo,
          metrics: serviceMetrics,
          napiPackageStatus: serviceInfo.napiPackages.map(pkg => ({
            name: pkg,
            info: napiIntegrationService.getPackageInfo(pkg)
          }))
        },
        timestamp: new Date()
      };

      res.json(response);
    } catch (error) {
      const handledError = ErrorHandler.handleError(error, 'get-service-info');
      res.status(500).json({
        success: false,
        error: handledError.message,
        timestamp: new Date()
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/services/{serviceId}/execute:
 *   post:
 *     tags: [Integrated Services]
 *     summary: Execute business logic operation
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               operation:
 *                 type: string
 *               parameters:
 *                 type: object
 *               context:
 *                 type: object
 */
router.post('/services/:serviceId/execute',
  param('serviceId').isString().notEmpty(),
  body('operation').isString().notEmpty(),
  body('parameters').optional().isObject(),
  body('context').optional().isObject(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid request',
          details: errors.array()
        });
      }

      const serviceId = req.params.serviceId;
      const { operation, parameters = {}, context = {} } = req.body;

      const request: BusinessLogicRequest = {
        serviceId,
        operation,
        parameters,
        context: {
          ...context,
          userId: req.user?.id,
          sessionId: req.sessionID
        }
      };

      const result = await businessLogicOrchestrator.executeBusinessLogic(request);

      if (result.success) {
        res.json({
          success: true,
          data: result.data,
          metadata: result.metadata,
          timestamp: new Date()
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error,
          metadata: result.metadata,
          timestamp: new Date()
        });
      }
    } catch (error) {
      const handledError = ErrorHandler.handleError(error, 'execute-business-logic');
      res.status(500).json({
        success: false,
        error: handledError.message,
        timestamp: new Date()
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/napi/packages:
 *   get:
 *     tags: [Integrated Services]
 *     summary: Get NAPI package status
 */
router.get('/napi/packages', async (req: Request, res: Response) => {
  try {
    const packages = napiIntegrationService.getPackagesInfo();
    const systemStatus = napiIntegrationService.getSystemStatus();

    res.json({
      success: true,
      data: {
        packages,
        systemStatus,
        totalPackages: packages.length,
        loadedPackages: packages.filter(p => p.loaded).length
      },
      timestamp: new Date()
    });
  } catch (error) {
    const handledError = ErrorHandler.handleError(error, 'get-napi-packages');
    res.status(500).json({
      success: false,
      error: handledError.message,
      timestamp: new Date()
    });
  }
});

/**
 * @swagger
 * /api/v1/napi/packages/{packageName}/reload:
 *   post:
 *     tags: [Integrated Services]
 *     summary: Reload specific NAPI package
 *     parameters:
 *       - in: path
 *         name: packageName
 *         required: true
 *         schema:
 *           type: string
 */
router.post('/napi/packages/:packageName/reload',
  param('packageName').isString().notEmpty(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid package name',
          details: errors.array()
        });
      }

      const packageName = req.params.packageName;
      const result = await napiIntegrationService.reloadPackage(packageName);

      res.json({
        success: result,
        message: result ? 'Package reloaded successfully' : 'Failed to reload package',
        packageName,
        timestamp: new Date()
      });
    } catch (error) {
      const handledError = ErrorHandler.handleError(error, 'reload-napi-package');
      res.status(500).json({
        success: false,
        error: handledError.message,
        timestamp: new Date()
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     tags: [Integrated Services]
 *     summary: Get comprehensive system health status
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const napiStatus = napiIntegrationService.getSystemStatus();
    const businessLogicMetrics = businessLogicOrchestrator.getSystemMetrics();
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date(),
      uptime: process.uptime(),
      version: '1.0.0',
      services: {
        napi: {
          status: napiStatus.loadedPackages > 0 ? 'healthy' : 'degraded',
          metrics: napiStatus
        },
        businessLogic: {
          status: businessLogicMetrics.activeServices > 0 ? 'healthy' : 'degraded',
          metrics: businessLogicMetrics
        }
      },
      performance: {
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        nodeVersion: process.version
      }
    };

    // Determine overall health
    if (napiStatus.loadedPackages === 0 || businessLogicMetrics.activeServices === 0) {
      healthStatus.status = 'degraded';
    }

    res.json({
      success: true,
      data: healthStatus
    });
  } catch (error) {
    const handledError = ErrorHandler.handleError(error, 'health-check');
    res.status(500).json({
      success: false,
      error: handledError.message,
      status: 'unhealthy',
      timestamp: new Date()
    });
  }
});

/**
 * @swagger
 * /api/v1/metrics:
 *   get:
 *     tags: [Integrated Services]
 *     summary: Get comprehensive performance metrics
 */
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const napiMetrics = napiIntegrationService.getSystemStatus();
    const businessLogicMetrics = businessLogicOrchestrator.getSystemMetrics();
    
    const metrics = {
      timestamp: new Date(),
      napi: napiMetrics,
      businessLogic: businessLogicMetrics,
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        platform: process.platform,
        nodeVersion: process.version
      }
    };

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    const handledError = ErrorHandler.handleError(error, 'get-metrics');
    res.status(500).json({
      success: false,
      error: handledError.message,
      timestamp: new Date()
    });
  }
});

// Specific service endpoints for common operations

/**
 * @swagger
 * /api/v1/ioc/analyze:
 *   post:
 *     tags: [Integrated Services]
 *     summary: Analyze IOC with integrated NAPI and business logic
 */
router.post('/ioc/analyze',
  body('ioc').isString().notEmpty(),
  body('context').optional().isObject(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid IOC data',
          details: errors.array()
        });
      }

      const { ioc, context = {} } = req.body;

      const request: BusinessLogicRequest = {
        serviceId: 'ioc-analysis',
        operation: 'analyzeIOC',
        parameters: { ioc },
        context: {
          ...context,
          userId: req.user?.id,
          sessionId: req.sessionID
        }
      };

      const result = await businessLogicOrchestrator.executeBusinessLogic(request);
      
      res.json({
        success: result.success,
        data: result.data,
        error: result.error,
        metadata: result.metadata,
        timestamp: new Date()
      });
    } catch (error) {
      const handledError = ErrorHandler.handleError(error, 'analyze-ioc');
      res.status(500).json({
        success: false,
        error: handledError.message,
        timestamp: new Date()
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/incident/create:
 *   post:
 *     tags: [Integrated Services]
 *     summary: Create incident with integrated response
 */
router.post('/incident/create',
  body('title').isString().notEmpty(),
  body('description').isString().notEmpty(),
  body('severity').isIn(['low', 'medium', 'high', 'critical']),
  body('context').optional().isObject(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid incident data',
          details: errors.array()
        });
      }

      const { title, description, severity, context = {} } = req.body;

      const request: BusinessLogicRequest = {
        serviceId: 'incident-response',
        operation: 'createIncident',
        parameters: { title, description, severity },
        context: {
          ...context,
          userId: req.user?.id,
          sessionId: req.sessionID,
          priority: severity === 'critical' ? 'critical' : 'medium'
        }
      };

      const result = await businessLogicOrchestrator.executeBusinessLogic(request);
      
      res.status(result.success ? 201 : 400).json({
        success: result.success,
        data: result.data,
        error: result.error,
        metadata: result.metadata,
        timestamp: new Date()
      });
    } catch (error) {
      const handledError = ErrorHandler.handleError(error, 'create-incident');
      res.status(500).json({
        success: false,
        error: handledError.message,
        timestamp: new Date()
      });
    }
  }
);

export default router;