import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { userDirectoryPortalController } from '../controllers/userDirectoryPortalController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: User Directory Portal
 *   description: Comprehensive user directory and profile management
 */

// GET /api/user-management/user-directory-portal - Get all items
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'pending', 'inactive', 'suspended', 'draft']),
    validateRequest
  ],
  userDirectoryPortalController.getAllUserDirectoryPortal
);

// POST /api/user-management/user-directory-portal - Create new item
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
  userDirectoryPortalController.createUserDirectoryPortal
);

// GET /api/user-management/user-directory-portal/:id - Get item by ID
router.get(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  userDirectoryPortalController.getUserDirectoryPortalById
);

// PUT /api/user-management/user-directory-portal/:id - Update item
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
  userDirectoryPortalController.updateUserDirectoryPortal
);

// DELETE /api/user-management/user-directory-portal/:id - Delete item
router.delete(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  userDirectoryPortalController.deleteUserDirectoryPortal
);

export { router as userDirectoryPortalRoutes };
