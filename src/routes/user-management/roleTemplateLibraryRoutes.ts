import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { roleTemplateLibraryController } from '../controllers/roleTemplateLibraryController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Role Template Library
 *   description: Pre-defined role templates and quick deployment
 */

// GET /api/user-management/role-template-library - Get all items
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'pending', 'inactive', 'suspended', 'draft']),
    validateRequest
  ],
  roleTemplateLibraryController.getAllRoleTemplateLibrary
);

// POST /api/user-management/role-template-library - Create new item
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
  roleTemplateLibraryController.createRoleTemplateLibrary
);

// GET /api/user-management/role-template-library/:id - Get item by ID
router.get(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  roleTemplateLibraryController.getRoleTemplateLibraryById
);

// PUT /api/user-management/role-template-library/:id - Update item
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
  roleTemplateLibraryController.updateRoleTemplateLibrary
);

// DELETE /api/user-management/role-template-library/:id - Delete item
router.delete(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  roleTemplateLibraryController.deleteRoleTemplateLibrary
);

export { router as roleTemplateLibraryRoutes };
