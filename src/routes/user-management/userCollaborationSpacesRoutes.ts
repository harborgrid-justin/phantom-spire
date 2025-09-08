import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { userCollaborationSpacesController } from '../controllers/userCollaborationSpacesController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: User Collaboration Spaces
 *   description: Digital collaboration environments and workspace management
 */

// GET /api/user-management/user-collaboration-spaces - Get all items
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'pending', 'inactive', 'suspended', 'draft']),
    validateRequest
  ],
  userCollaborationSpacesController.getAllUserCollaborationSpaces
);

// POST /api/user-management/user-collaboration-spaces - Create new item
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
  userCollaborationSpacesController.createUserCollaborationSpaces
);

// GET /api/user-management/user-collaboration-spaces/:id - Get item by ID
router.get(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  userCollaborationSpacesController.getUserCollaborationSpacesById
);

// PUT /api/user-management/user-collaboration-spaces/:id - Update item
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
  userCollaborationSpacesController.updateUserCollaborationSpaces
);

// DELETE /api/user-management/user-collaboration-spaces/:id - Delete item
router.delete(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  userCollaborationSpacesController.deleteUserCollaborationSpaces
);

export { router as userCollaborationSpacesRoutes };
