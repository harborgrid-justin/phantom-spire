import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { userFeedbackCenterController } from '../controllers/userFeedbackCenterController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: User Feedback Center
 *   description: User feedback collection and sentiment analysis
 */

// GET /api/user-management/user-feedback-center - Get all items
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'pending', 'inactive', 'suspended', 'draft']),
    validateRequest
  ],
  userFeedbackCenterController.getAllUserFeedbackCenter
);

// POST /api/user-management/user-feedback-center - Create new item
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
  userFeedbackCenterController.createUserFeedbackCenter
);

// GET /api/user-management/user-feedback-center/:id - Get item by ID
router.get(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  userFeedbackCenterController.getUserFeedbackCenterById
);

// PUT /api/user-management/user-feedback-center/:id - Update item
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
  userFeedbackCenterController.updateUserFeedbackCenter
);

// DELETE /api/user-management/user-feedback-center/:id - Delete item
router.delete(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  userFeedbackCenterController.deleteUserFeedbackCenter
);

export { router as userFeedbackCenterRoutes };
