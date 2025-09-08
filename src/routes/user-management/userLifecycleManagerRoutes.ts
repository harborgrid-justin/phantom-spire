import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { userLifecycleManagerController } from '../controllers/userLifecycleManagerController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: User Lifecycle Manager
 *   description: Complete user lifecycle from onboarding to offboarding
 */

// GET /api/user-management/user-lifecycle-manager - Get all items
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'pending', 'inactive', 'suspended', 'draft']),
    validateRequest
  ],
  userLifecycleManagerController.getAllUserLifecycleManager
);

// POST /api/user-management/user-lifecycle-manager - Create new item
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
  userLifecycleManagerController.createUserLifecycleManager
);

// GET /api/user-management/user-lifecycle-manager/:id - Get item by ID
router.get(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  userLifecycleManagerController.getUserLifecycleManagerById
);

// PUT /api/user-management/user-lifecycle-manager/:id - Update item
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
  userLifecycleManagerController.updateUserLifecycleManager
);

// DELETE /api/user-management/user-lifecycle-manager/:id - Delete item
router.delete(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  userLifecycleManagerController.deleteUserLifecycleManager
);

export { router as userLifecycleManagerRoutes };
