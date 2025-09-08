import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { userProductivityInsightsController } from '../controllers/userProductivityInsightsController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: User Productivity Insights
 *   description: Productivity analytics and performance insights
 */

// GET /api/user-management/user-productivity-insights - Get all items
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'pending', 'inactive', 'suspended', 'draft']),
    validateRequest
  ],
  userProductivityInsightsController.getAllUserProductivityInsights
);

// POST /api/user-management/user-productivity-insights - Create new item
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
  userProductivityInsightsController.createUserProductivityInsights
);

// GET /api/user-management/user-productivity-insights/:id - Get item by ID
router.get(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  userProductivityInsightsController.getUserProductivityInsightsById
);

// PUT /api/user-management/user-productivity-insights/:id - Update item
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
  userProductivityInsightsController.updateUserProductivityInsights
);

// DELETE /api/user-management/user-productivity-insights/:id - Delete item
router.delete(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  userProductivityInsightsController.deleteUserProductivityInsights
);

export { router as userProductivityInsightsRoutes };
