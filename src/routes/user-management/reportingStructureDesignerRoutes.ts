import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { reportingStructureDesignerController } from '../controllers/reportingStructureDesignerController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Reporting Structure Designer
 *   description: Hierarchical reporting relationships and chains of command
 */

// GET /api/user-management/reporting-structure-designer - Get all items
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'pending', 'inactive', 'suspended', 'draft']),
    validateRequest
  ],
  reportingStructureDesignerController.getAllReportingStructureDesigner
);

// POST /api/user-management/reporting-structure-designer - Create new item
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
  reportingStructureDesignerController.createReportingStructureDesigner
);

// GET /api/user-management/reporting-structure-designer/:id - Get item by ID
router.get(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  reportingStructureDesignerController.getReportingStructureDesignerById
);

// PUT /api/user-management/reporting-structure-designer/:id - Update item
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
  reportingStructureDesignerController.updateReportingStructureDesigner
);

// DELETE /api/user-management/reporting-structure-designer/:id - Delete item
router.delete(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  reportingStructureDesignerController.deleteReportingStructureDesigner
);

export { router as reportingStructureDesignerRoutes };
