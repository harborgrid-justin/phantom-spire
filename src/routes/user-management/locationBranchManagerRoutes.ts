import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { locationBranchManagerController } from '../controllers/locationBranchManagerController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Location & Branch Manager
 *   description: Multi-location and branch office management
 */

// GET /api/user-management/location-branch-manager - Get all items
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'pending', 'inactive', 'suspended', 'draft']),
    validateRequest
  ],
  locationBranchManagerController.getAllLocationBranchManager
);

// POST /api/user-management/location-branch-manager - Create new item
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
  locationBranchManagerController.createLocationBranchManager
);

// GET /api/user-management/location-branch-manager/:id - Get item by ID
router.get(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  locationBranchManagerController.getLocationBranchManagerById
);

// PUT /api/user-management/location-branch-manager/:id - Update item
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
  locationBranchManagerController.updateLocationBranchManager
);

// DELETE /api/user-management/location-branch-manager/:id - Delete item
router.delete(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  locationBranchManagerController.deleteLocationBranchManager
);

export { router as locationBranchManagerRoutes };
