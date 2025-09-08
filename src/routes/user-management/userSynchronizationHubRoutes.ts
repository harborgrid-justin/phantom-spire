import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { userSynchronizationHubController } from '../controllers/userSynchronizationHubController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: User Synchronization Hub
 *   description: External directory synchronization and integration
 */

// GET /api/user-management/user-synchronization-hub - Get all items
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'pending', 'inactive', 'suspended', 'draft']),
    validateRequest
  ],
  userSynchronizationHubController.getAllUserSynchronizationHub
);

// POST /api/user-management/user-synchronization-hub - Create new item
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
  userSynchronizationHubController.createUserSynchronizationHub
);

// GET /api/user-management/user-synchronization-hub/:id - Get item by ID
router.get(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  userSynchronizationHubController.getUserSynchronizationHubById
);

// PUT /api/user-management/user-synchronization-hub/:id - Update item
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
  userSynchronizationHubController.updateUserSynchronizationHub
);

// DELETE /api/user-management/user-synchronization-hub/:id - Delete item
router.delete(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  userSynchronizationHubController.deleteUserSynchronizationHub
);

export { router as userSynchronizationHubRoutes };
