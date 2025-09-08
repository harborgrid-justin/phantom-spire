import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { userSecurityDashboardController } from '../controllers/userSecurityDashboardController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: User Security Dashboard
 *   description: Personal security status and threat monitoring
 */

// GET /api/user-management/user-security-dashboard - Get all items
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'pending', 'inactive', 'suspended', 'draft']),
    validateRequest
  ],
  userSecurityDashboardController.getAllUserSecurityDashboard
);

// POST /api/user-management/user-security-dashboard - Create new item
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
  userSecurityDashboardController.createUserSecurityDashboard
);

// GET /api/user-management/user-security-dashboard/:id - Get item by ID
router.get(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  userSecurityDashboardController.getUserSecurityDashboardById
);

// PUT /api/user-management/user-security-dashboard/:id - Update item
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
  userSecurityDashboardController.updateUserSecurityDashboard
);

// DELETE /api/user-management/user-security-dashboard/:id - Delete item
router.delete(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  userSecurityDashboardController.deleteUserSecurityDashboard
);

export { router as userSecurityDashboardRoutes };
