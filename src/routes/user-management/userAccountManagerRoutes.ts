import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { userAccountManagerController } from '../controllers/userAccountManagerController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: User Account Manager
 *   description: Account status, security, and access management
 */

// GET /api/user-management/user-account-manager - Get all items
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'pending', 'inactive', 'suspended', 'draft']),
    validateRequest
  ],
  userAccountManagerController.getAllUserAccountManager
);

// POST /api/user-management/user-account-manager - Create new item
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
  userAccountManagerController.createUserAccountManager
);

// GET /api/user-management/user-account-manager/:id - Get item by ID
router.get(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  userAccountManagerController.getUserAccountManagerById
);

// PUT /api/user-management/user-account-manager/:id - Update item
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
  userAccountManagerController.updateUserAccountManager
);

// DELETE /api/user-management/user-account-manager/:id - Delete item
router.delete(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  userAccountManagerController.deleteUserAccountManager
);

export { router as userAccountManagerRoutes };
