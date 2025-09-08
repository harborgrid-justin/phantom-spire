import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { permissionMatrixManagerController } from '../controllers/permissionMatrixManagerController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Permission Matrix Manager
 *   description: Comprehensive permission matrix and access control
 */

// GET /api/user-management/permission-matrix-manager - Get all items
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'pending', 'inactive', 'suspended', 'draft']),
    validateRequest
  ],
  permissionMatrixManagerController.getAllPermissionMatrixManager
);

// POST /api/user-management/permission-matrix-manager - Create new item
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
  permissionMatrixManagerController.createPermissionMatrixManager
);

// GET /api/user-management/permission-matrix-manager/:id - Get item by ID
router.get(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  permissionMatrixManagerController.getPermissionMatrixManagerById
);

// PUT /api/user-management/permission-matrix-manager/:id - Update item
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
  permissionMatrixManagerController.updatePermissionMatrixManager
);

// DELETE /api/user-management/permission-matrix-manager/:id - Delete item
router.delete(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  permissionMatrixManagerController.deletePermissionMatrixManager
);

export { router as permissionMatrixManagerRoutes };
