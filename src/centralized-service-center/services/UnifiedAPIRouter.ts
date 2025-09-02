/**
 * Unified Platform API Router
 * Centralized access point for all platform services
 */

import express from 'express';
import { centralizedServiceCenter } from '../core/CentralizedSystemServiceCenter.js';
import {
  IServiceOperationRequest,
  IUnifiedRequestContext,
} from '../interfaces/ICentralizedServiceCenter.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

/**
 * Get all available services
 */
router.get('/services', async (req, res) => {
  try {
    const services = await centralizedServiceCenter.getServices();
    res.json({
      success: true,
      data: services,
      metadata: {
        count: services.length,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVICE_LIST_ERROR',
        message: error.message,
      },
    });
  }
});

/**
 * Get specific service details
 */
router.get('/services/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const service = await centralizedServiceCenter.getService(serviceId);

    if (!service) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SERVICE_NOT_FOUND',
          message: `Service ${serviceId} not found`,
        },
      });
    }

    res.json({
      success: true,
      data: service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVICE_GET_ERROR',
        message: error.message,
      },
    });
  }
});

/**
 * Execute operation on any service
 */
router.post('/services/:serviceId/execute', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { operation, parameters, options } = req.body;

    if (!operation) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_OPERATION',
          message: 'Operation is required',
        },
      });
    }

    // Create unified request context
    const context: IUnifiedRequestContext = {
      requestId: uuidv4(),
      userId: req.headers['x-user-id'] as string,
      organizationId: req.headers['x-organization-id'] as string,
      sessionId: req.headers['x-session-id'] as string,
      correlationId: (req.headers['x-correlation-id'] as string) || uuidv4(),
      traceId: (req.headers['x-trace-id'] as string) || uuidv4(),
      timestamp: new Date(),
      source: 'centralized-api',
      priority: (options?.priority || 'normal') as any,
      metadata: req.headers,
    };

    const request: IServiceOperationRequest = {
      serviceId,
      operation,
      parameters: parameters || {},
      context,
      options,
    };

    const result = await centralizedServiceCenter.executeOperation(request);

    res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'EXECUTION_ERROR',
        message: error.message,
      },
    });
  }
});

/**
 * Get platform-wide status
 */
router.get('/platform/status', async (req, res) => {
  try {
    const status = await centralizedServiceCenter.getPlatformStatus();
    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'STATUS_ERROR',
        message: error.message,
      },
    });
  }
});

/**
 * Get platform-wide metrics
 */
router.get('/platform/metrics', async (req, res) => {
  try {
    const metrics = await centralizedServiceCenter.getPlatformMetrics();
    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'METRICS_ERROR',
        message: error.message,
      },
    });
  }
});

/**
 * Get platform configuration
 */
router.get('/platform/config', async (req, res) => {
  try {
    const config = await centralizedServiceCenter.getConfiguration();
    res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'CONFIG_ERROR',
        message: error.message,
      },
    });
  }
});

/**
 * Update platform configuration
 */
router.put('/platform/config', async (req, res) => {
  try {
    const { config } = req.body;
    await centralizedServiceCenter.updateConfiguration(config);
    res.json({
      success: true,
      message: 'Configuration updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'CONFIG_UPDATE_ERROR',
        message: error.message,
      },
    });
  }
});

/**
 * Search services by capability
 */
router.get('/services/capability/:capability', async (req, res) => {
  try {
    const { capability } = req.params;
    const services =
      await centralizedServiceCenter.findServicesByCapability(capability);
    res.json({
      success: true,
      data: services,
      metadata: {
        capability,
        count: services.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'CAPABILITY_SEARCH_ERROR',
        message: error.message,
      },
    });
  }
});

/**
 * Get service dependencies
 */
router.get('/services/:serviceId/dependencies', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const dependencies =
      await centralizedServiceCenter.getServiceDependencies(serviceId);
    res.json({
      success: true,
      data: dependencies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'DEPENDENCIES_ERROR',
        message: error.message,
      },
    });
  }
});

/**
 * Get unified API documentation
 */
router.get('/docs', async (req, res) => {
  try {
    const documentation = await centralizedServiceCenter.getApiDocumentation();
    res.json(documentation);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'DOCS_ERROR',
        message: error.message,
      },
    });
  }
});

export default router;
