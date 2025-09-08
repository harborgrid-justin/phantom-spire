import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { userEngagementDashboardController } from '../controllers/userEngagementDashboardController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: User Engagement Dashboard
 *   description: User activity monitoring and engagement metrics
 */

// GET /api/user-management/user-engagement-dashboard - Get all items
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'pending', 'inactive', 'suspended', 'draft']),
    validateRequest
  ],
  userEngagementDashboardController.getAllUserEngagementDashboard
);

// POST /api/user-management/user-engagement-dashboard - Create new item
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
  userEngagementDashboardController.createUserEngagementDashboard
);

// GET /api/user-management/user-engagement-dashboard/:id - Get item by ID
router.get(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  userEngagementDashboardController.getUserEngagementDashboardById
);

// PUT /api/user-management/user-engagement-dashboard/:id - Update item
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
  userEngagementDashboardController.updateUserEngagementDashboard
);

// DELETE /api/user-management/user-engagement-dashboard/:id - Delete item
router.delete(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  userEngagementDashboardController.deleteUserEngagementDashboard
);

export { router as userEngagementDashboardRoutes };
