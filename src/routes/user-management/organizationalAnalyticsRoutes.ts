import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { organizationalAnalyticsController } from '../controllers/organizationalAnalyticsController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Organizational Analytics
 *   description: Organizational structure analytics and insights
 */

// GET /api/user-management/organizational-analytics - Get all items
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'pending', 'inactive', 'suspended', 'draft']),
    validateRequest
  ],
  organizationalAnalyticsController.getAllOrganizationalAnalytics
);

// POST /api/user-management/organizational-analytics - Create new item
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
  organizationalAnalyticsController.createOrganizationalAnalytics
);

// GET /api/user-management/organizational-analytics/:id - Get item by ID
router.get(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  organizationalAnalyticsController.getOrganizationalAnalyticsById
);

// PUT /api/user-management/organizational-analytics/:id - Update item
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
  organizationalAnalyticsController.updateOrganizationalAnalytics
);

// DELETE /api/user-management/organizational-analytics/:id - Delete item
router.delete(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  organizationalAnalyticsController.deleteOrganizationalAnalytics
);

export { router as organizationalAnalyticsRoutes };
