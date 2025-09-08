import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { roleDefinitionStudioController } from '../controllers/roleDefinitionStudioController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Role Definition Studio
 *   description: Visual role creation and permission assignment
 */

// GET /api/user-management/role-definition-studio - Get all items
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'pending', 'inactive', 'suspended', 'draft']),
    validateRequest
  ],
  roleDefinitionStudioController.getAllRoleDefinitionStudio
);

// POST /api/user-management/role-definition-studio - Create new item
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
  roleDefinitionStudioController.createRoleDefinitionStudio
);

// GET /api/user-management/role-definition-studio/:id - Get item by ID
router.get(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  roleDefinitionStudioController.getRoleDefinitionStudioById
);

// PUT /api/user-management/role-definition-studio/:id - Update item
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
  roleDefinitionStudioController.updateRoleDefinitionStudio
);

// DELETE /api/user-management/role-definition-studio/:id - Delete item
router.delete(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  roleDefinitionStudioController.deleteRoleDefinitionStudio
);

export { router as roleDefinitionStudioRoutes };
