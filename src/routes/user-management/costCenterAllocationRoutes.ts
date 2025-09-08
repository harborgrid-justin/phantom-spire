import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { costCenterAllocationController } from '../controllers/costCenterAllocationController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Cost Center Allocation
 *   description: Cost center assignment and budget allocation
 */

// GET /api/user-management/cost-center-allocation - Get all items
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'pending', 'inactive', 'suspended', 'draft']),
    validateRequest
  ],
  costCenterAllocationController.getAllCostCenterAllocation
);

// POST /api/user-management/cost-center-allocation - Create new item
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
  costCenterAllocationController.createCostCenterAllocation
);

// GET /api/user-management/cost-center-allocation/:id - Get item by ID
router.get(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  costCenterAllocationController.getCostCenterAllocationById
);

// PUT /api/user-management/cost-center-allocation/:id - Update item
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
  costCenterAllocationController.updateCostCenterAllocation
);

// DELETE /api/user-management/cost-center-allocation/:id - Delete item
router.delete(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  costCenterAllocationController.deleteCostCenterAllocation
);

export { router as costCenterAllocationRoutes };
