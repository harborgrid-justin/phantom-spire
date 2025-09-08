import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { userPrivacyControlCenterController } from '../controllers/userPrivacyControlCenterController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: User Privacy Control Center
 *   description: Personal data privacy and GDPR compliance management
 */

// GET /api/user-management/user-privacy-control-center - Get all items
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'pending', 'inactive', 'suspended', 'draft']),
    validateRequest
  ],
  userPrivacyControlCenterController.getAllUserPrivacyControlCenter
);

// POST /api/user-management/user-privacy-control-center - Create new item
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
  userPrivacyControlCenterController.createUserPrivacyControlCenter
);

// GET /api/user-management/user-privacy-control-center/:id - Get item by ID
router.get(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  userPrivacyControlCenterController.getUserPrivacyControlCenterById
);

// PUT /api/user-management/user-privacy-control-center/:id - Update item
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
  userPrivacyControlCenterController.updateUserPrivacyControlCenter
);

// DELETE /api/user-management/user-privacy-control-center/:id - Delete item
router.delete(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  userPrivacyControlCenterController.deleteUserPrivacyControlCenter
);

export { router as userPrivacyControlCenterRoutes };
