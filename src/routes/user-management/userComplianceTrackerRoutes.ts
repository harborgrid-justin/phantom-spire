import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { userComplianceTrackerController } from '../controllers/userComplianceTrackerController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: User Compliance Tracker
 *   description: Individual compliance status and certification tracking
 */

// GET /api/user-management/user-compliance-tracker - Get all items
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'pending', 'inactive', 'suspended', 'draft']),
    validateRequest
  ],
  userComplianceTrackerController.getAllUserComplianceTracker
);

// POST /api/user-management/user-compliance-tracker - Create new item
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
  userComplianceTrackerController.createUserComplianceTracker
);

// GET /api/user-management/user-compliance-tracker/:id - Get item by ID
router.get(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  userComplianceTrackerController.getUserComplianceTrackerById
);

// PUT /api/user-management/user-compliance-tracker/:id - Update item
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
  userComplianceTrackerController.updateUserComplianceTracker
);

// DELETE /api/user-management/user-compliance-tracker/:id - Delete item
router.delete(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  userComplianceTrackerController.deleteUserComplianceTracker
);

export { router as userComplianceTrackerRoutes };
