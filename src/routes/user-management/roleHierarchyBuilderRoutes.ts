import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { roleHierarchyBuilderController } from '../controllers/roleHierarchyBuilderController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Role Hierarchy Builder
 *   description: Hierarchical role structure and inheritance management
 */

// GET /api/user-management/role-hierarchy-builder - Get all items
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'pending', 'inactive', 'suspended', 'draft']),
    validateRequest
  ],
  roleHierarchyBuilderController.getAllRoleHierarchyBuilder
);

// POST /api/user-management/role-hierarchy-builder - Create new item
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
  roleHierarchyBuilderController.createRoleHierarchyBuilder
);

// GET /api/user-management/role-hierarchy-builder/:id - Get item by ID
router.get(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  roleHierarchyBuilderController.getRoleHierarchyBuilderById
);

// PUT /api/user-management/role-hierarchy-builder/:id - Update item
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
  roleHierarchyBuilderController.updateRoleHierarchyBuilder
);

// DELETE /api/user-management/role-hierarchy-builder/:id - Delete item
router.delete(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  roleHierarchyBuilderController.deleteRoleHierarchyBuilder
);

export { router as roleHierarchyBuilderRoutes };
