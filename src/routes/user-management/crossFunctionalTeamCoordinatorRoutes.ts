import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { crossFunctionalTeamCoordinatorController } from '../controllers/crossFunctionalTeamCoordinatorController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Cross-Functional Team Coordinator
 *   description: Cross-departmental team coordination and management
 */

// GET /api/user-management/cross-functional-team-coordinator - Get all items
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'pending', 'inactive', 'suspended', 'draft']),
    validateRequest
  ],
  crossFunctionalTeamCoordinatorController.getAllCrossFunctionalTeamCoordinator
);

// POST /api/user-management/cross-functional-team-coordinator - Create new item
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
  crossFunctionalTeamCoordinatorController.createCrossFunctionalTeamCoordinator
);

// GET /api/user-management/cross-functional-team-coordinator/:id - Get item by ID
router.get(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  crossFunctionalTeamCoordinatorController.getCrossFunctionalTeamCoordinatorById
);

// PUT /api/user-management/cross-functional-team-coordinator/:id - Update item
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
  crossFunctionalTeamCoordinatorController.updateCrossFunctionalTeamCoordinator
);

// DELETE /api/user-management/cross-functional-team-coordinator/:id - Delete item
router.delete(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  crossFunctionalTeamCoordinatorController.deleteCrossFunctionalTeamCoordinator
);

export { router as crossFunctionalTeamCoordinatorRoutes };
