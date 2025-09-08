import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { permissionAuditSystemController } from '../controllers/permissionAuditSystemController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Permission Audit System
 *   description: Permission usage auditing and compliance tracking
 */

// GET /api/user-management/permission-audit-system - Get all items
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'pending', 'inactive', 'suspended', 'draft']),
    validateRequest
  ],
  permissionAuditSystemController.getAllPermissionAuditSystem
);

// POST /api/user-management/permission-audit-system - Create new item
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
  permissionAuditSystemController.createPermissionAuditSystem
);

// GET /api/user-management/permission-audit-system/:id - Get item by ID
router.get(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  permissionAuditSystemController.getPermissionAuditSystemById
);

// PUT /api/user-management/permission-audit-system/:id - Update item
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
  permissionAuditSystemController.updatePermissionAuditSystem
);

// DELETE /api/user-management/permission-audit-system/:id - Delete item
router.delete(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  permissionAuditSystemController.deletePermissionAuditSystem
);

export { router as permissionAuditSystemRoutes };
