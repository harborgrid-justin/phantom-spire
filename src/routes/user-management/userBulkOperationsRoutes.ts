import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { userBulkOperationsController } from '../controllers/userBulkOperationsController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: User Bulk Operations
 *   description: Bulk user operations and mass management tools
 */

// GET /api/user-management/user-bulk-operations - Get all items
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'pending', 'inactive', 'suspended', 'draft']),
    validateRequest
  ],
  userBulkOperationsController.getAllUserBulkOperations
);

// POST /api/user-management/user-bulk-operations - Create new item
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
  userBulkOperationsController.createUserBulkOperations
);

// GET /api/user-management/user-bulk-operations/:id - Get item by ID
router.get(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  userBulkOperationsController.getUserBulkOperationsById
);

// PUT /api/user-management/user-bulk-operations/:id - Update item
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
  userBulkOperationsController.updateUserBulkOperations
);

// DELETE /api/user-management/user-bulk-operations/:id - Delete item
router.delete(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  userBulkOperationsController.deleteUserBulkOperations
);

export { router as userBulkOperationsRoutes };
