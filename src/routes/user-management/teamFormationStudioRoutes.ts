import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { teamFormationStudioController } from '../controllers/teamFormationStudioController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Team Formation Studio
 *   description: Dynamic team creation and collaboration setup
 */

// GET /api/user-management/team-formation-studio - Get all items
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'pending', 'inactive', 'suspended', 'draft']),
    validateRequest
  ],
  teamFormationStudioController.getAllTeamFormationStudio
);

// POST /api/user-management/team-formation-studio - Create new item
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
  teamFormationStudioController.createTeamFormationStudio
);

// GET /api/user-management/team-formation-studio/:id - Get item by ID
router.get(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  teamFormationStudioController.getTeamFormationStudioById
);

// PUT /api/user-management/team-formation-studio/:id - Update item
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
  teamFormationStudioController.updateTeamFormationStudio
);

// DELETE /api/user-management/team-formation-studio/:id - Delete item
router.delete(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  teamFormationStudioController.deleteTeamFormationStudio
);

export { router as teamFormationStudioRoutes };
