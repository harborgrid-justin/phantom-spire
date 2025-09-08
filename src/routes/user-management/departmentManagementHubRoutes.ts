import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { departmentManagementHubController } from '../controllers/departmentManagementHubController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Department Management Hub
 *   description: Department creation, management, and restructuring
 */

// GET /api/user-management/department-management-hub - Get all items
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'pending', 'inactive', 'suspended', 'draft']),
    validateRequest
  ],
  departmentManagementHubController.getAllDepartmentManagementHub
);

// POST /api/user-management/department-management-hub - Create new item
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
  departmentManagementHubController.createDepartmentManagementHub
);

// GET /api/user-management/department-management-hub/:id - Get item by ID
router.get(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  departmentManagementHubController.getDepartmentManagementHubById
);

// PUT /api/user-management/department-management-hub/:id - Update item
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
  departmentManagementHubController.updateDepartmentManagementHub
);

// DELETE /api/user-management/department-management-hub/:id - Delete item
router.delete(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  departmentManagementHubController.deleteDepartmentManagementHub
);

export { router as departmentManagementHubRoutes };
