import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { userAuthenticationManagerController } from '../controllers/userAuthenticationManagerController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: User Authentication Manager
 *   description: Multi-factor authentication and security methods
 */

// GET /api/user-management/user-authentication-manager - Get all items
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'pending', 'inactive', 'suspended', 'draft']),
    validateRequest
  ],
  userAuthenticationManagerController.getAllUserAuthenticationManager
);

// POST /api/user-management/user-authentication-manager - Create new item
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
  userAuthenticationManagerController.createUserAuthenticationManager
);

// GET /api/user-management/user-authentication-manager/:id - Get item by ID
router.get(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  userAuthenticationManagerController.getUserAuthenticationManagerById
);

// PUT /api/user-management/user-authentication-manager/:id - Update item
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
  userAuthenticationManagerController.updateUserAuthenticationManager
);

// DELETE /api/user-management/user-authentication-manager/:id - Delete item
router.delete(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  userAuthenticationManagerController.deleteUserAuthenticationManager
);

export { router as userAuthenticationManagerRoutes };
