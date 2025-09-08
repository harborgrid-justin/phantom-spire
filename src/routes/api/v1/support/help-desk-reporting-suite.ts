/**
 * Help Desk Reporting Suite API Routes
 * Comprehensive help desk performance reports
 */

import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { HelpDeskReportingSuiteBusinessLogic } from '../../../services/business-logic/modules/support/HelpDeskReportingSuiteBusinessLogic';
import { authenticateToken } from '../../../middleware/auth';
import { validateRequest } from '../../../middleware/validation';
import { Logger } from '../../../utils/Logger';

const router = Router();
const logger = new Logger('Help Desk Reporting SuiteRoutes');
const businessLogic = new HelpDeskReportingSuiteBusinessLogic();

/**
 * GET /api/v1/support/help-desk-reporting-suite
 * Get all help desk reporting suite items
 */
router.get('/',
  authenticateToken,
  query('status').optional().isIn(['active', 'pending', 'completed', 'archived']),
  query('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const filters = {
        ...(req.query.status && { status: req.query.status }),
        ...(req.query.priority && { priority: req.query.priority })
      };

      const data = await businessLogic.getData(filters);
      const metrics = businessLogic.getMetrics();
      const health = businessLogic.getHealthStatus();

      res.json({
        success: true,
        data,
        metrics: {
          totalItems: data.length,
          activeItems: data.filter(item => item.status === 'active').length,
          completedItems: data.filter(item => item.status === 'completed').length,
          averageProcessingTime: metrics.averageResponseTime,
          successRate: (metrics.successfulOperations / Math.max(metrics.totalRequests, 1)) * 100
        },
        health
      });
    } catch (error) {
      logger.error('Failed to get help desk reporting suite data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/v1/support/help-desk-reporting-suite/:id
 * Get specific help desk reporting suite item
 */
router.get('/:id',
  authenticateToken,
  param('id').isString().notEmpty(),
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const data = await businessLogic.getData({ id: req.params.id });
      
      if (data.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Item not found'
        });
      }

      res.json({
        success: true,
        data: data[0]
      });
    } catch (error) {
      logger.error('Failed to get help desk reporting suite item:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve item',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * POST /api/v1/support/help-desk-reporting-suite
 * Create new help desk reporting suite item
 */
router.post('/',
  authenticateToken,
  body('title').isString().notEmpty().trim(),
  body('status').optional().isIn(['active', 'pending', 'completed', 'archived']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('metadata').optional().isObject(),
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const itemData = {
        title: req.body.title,
        status: req.body.status || 'pending',
        priority: req.body.priority || 'medium',
        metadata: req.body.metadata || {}
      };

      const newItem = await businessLogic.createItem(itemData);

      res.status(201).json({
        success: true,
        data: newItem,
        message: 'Help Desk Reporting Suite item created successfully'
      });
    } catch (error) {
      logger.error('Failed to create help desk reporting suite item:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create item',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * PUT /api/v1/support/help-desk-reporting-suite/:id
 * Update help desk reporting suite item
 */
router.put('/:id',
  authenticateToken,
  param('id').isString().notEmpty(),
  body('title').optional().isString().notEmpty().trim(),
  body('status').optional().isIn(['active', 'pending', 'completed', 'archived']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('metadata').optional().isObject(),
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const updates = {
        ...(req.body.title && { title: req.body.title }),
        ...(req.body.status && { status: req.body.status }),
        ...(req.body.priority && { priority: req.body.priority }),
        ...(req.body.metadata && { metadata: req.body.metadata })
      };

      const updatedItem = await businessLogic.updateItem(req.params.id, updates);

      res.json({
        success: true,
        data: updatedItem,
        message: 'Help Desk Reporting Suite item updated successfully'
      });
    } catch (error) {
      logger.error('Failed to update help desk reporting suite item:', error);
      
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          error: 'Item not found'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to update item',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }
);

/**
 * DELETE /api/v1/support/help-desk-reporting-suite/:id
 * Delete help desk reporting suite item
 */
router.delete('/:id',
  authenticateToken,
  param('id').isString().notEmpty(),
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const success = await businessLogic.deleteItem(req.params.id);

      res.json({
        success: true,
        message: 'Help Desk Reporting Suite item deleted successfully'
      });
    } catch (error) {
      logger.error('Failed to delete help desk reporting suite item:', error);
      
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          error: 'Item not found'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to delete item',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }
);

/**
 * GET /api/v1/support/help-desk-reporting-suite/health
 * Get help desk reporting suite health status
 */
router.get('/health',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const health = businessLogic.getHealthStatus();
      const metrics = businessLogic.getMetrics();

      res.json({
        success: true,
        health,
        metrics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Failed to get help desk reporting suite health:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve health status',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/v1/support/help-desk-reporting-suite/metrics
 * Get help desk reporting suite metrics
 */
router.get('/metrics',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const metrics = businessLogic.getMetrics();

      res.json({
        success: true,
        metrics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Failed to get help desk reporting suite metrics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router;
