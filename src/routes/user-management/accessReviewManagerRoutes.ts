import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { accessReviewManagerController } from '../controllers/accessReviewManagerController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Access Review Manager
 *   description: Periodic access reviews and certification workflows
 */

// GET /api/user-management/access-review-manager - Get all items
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'pending', 'inactive', 'suspended', 'draft']),
    validateRequest
  ],
  accessReviewManagerController.getAllAccessReviewManager
);

// POST /api/user-management/access-review-manager - Create new item
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
  accessReviewManagerController.createAccessReviewManager
);

// GET /api/user-management/access-review-manager/:id - Get item by ID
router.get(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  accessReviewManagerController.getAccessReviewManagerById
);

// PUT /api/user-management/access-review-manager/:id - Update item
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
  accessReviewManagerController.updateAccessReviewManager
);

// DELETE /api/user-management/access-review-manager/:id - Delete item
router.delete(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  accessReviewManagerController.deleteAccessReviewManager
);

export { router as accessReviewManagerRoutes };
