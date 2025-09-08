import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { organizationalChartManagerController } from '../controllers/organizationalChartManagerController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Organizational Chart Manager
 *   description: Interactive organizational charts and reporting structures
 */

// GET /api/user-management/organizational-chart-manager - Get all items
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'pending', 'inactive', 'suspended', 'draft']),
    validateRequest
  ],
  organizationalChartManagerController.getAllOrganizationalChartManager
);

// POST /api/user-management/organizational-chart-manager - Create new item
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
  organizationalChartManagerController.createOrganizationalChartManager
);

// GET /api/user-management/organizational-chart-manager/:id - Get item by ID
router.get(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  organizationalChartManagerController.getOrganizationalChartManagerById
);

// PUT /api/user-management/organizational-chart-manager/:id - Update item
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
  organizationalChartManagerController.updateOrganizationalChartManager
);

// DELETE /api/user-management/organizational-chart-manager/:id - Delete item
router.delete(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  organizationalChartManagerController.deleteOrganizationalChartManager
);

export { router as organizationalChartManagerRoutes };
