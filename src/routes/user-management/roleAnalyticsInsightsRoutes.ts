import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { roleAnalyticsInsightsController } from '../controllers/roleAnalyticsInsightsController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Role Analytics & Insights
 *   description: Role usage analytics and optimization insights
 */

// GET /api/user-management/role-analytics-insights - Get all items
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'pending', 'inactive', 'suspended', 'draft']),
    validateRequest
  ],
  roleAnalyticsInsightsController.getAllRoleAnalyticsInsights
);

// POST /api/user-management/role-analytics-insights - Create new item
router.post(
  '/',
  [
    body('name').isString().trim().isLength({ min: 1, max: 200 }),
    body('description').optional().isString().trim().isLength({ max: 1000 }),
    body('status').optional().isIn(['active', 'pending', 'inactive', 'suspended', 'draft']),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('metadata').optional().isObject(),
    validateRequest
  ],
  roleAnalyticsInsightsController.createRoleAnalyticsInsights
);

// GET /api/user-management/role-analytics-insights/:id - Get item by ID
router.get(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  roleAnalyticsInsightsController.getRoleAnalyticsInsightsById
);

// PUT /api/user-management/role-analytics-insights/:id - Update item
router.put(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    body('name').optional().isString().trim().isLength({ min: 1, max: 200 }),
    body('description').optional().isString().trim().isLength({ max: 1000 }),
    body('status').optional().isIn(['active', 'pending', 'inactive', 'suspended', 'draft']),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('metadata').optional().isObject(),
    validateRequest
  ],
  roleAnalyticsInsightsController.updateRoleAnalyticsInsights
);

// DELETE /api/user-management/role-analytics-insights/:id - Delete item
router.delete(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  roleAnalyticsInsightsController.deleteRoleAnalyticsInsights
);

export { router as roleAnalyticsInsightsRoutes };
