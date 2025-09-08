import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { userRecognitionSystemController } from '../controllers/userRecognitionSystemController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: User Recognition System
 *   description: Employee recognition and achievement tracking
 */

// GET /api/user-management/user-recognition-system - Get all items
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'pending', 'inactive', 'suspended', 'draft']),
    validateRequest
  ],
  userRecognitionSystemController.getAllUserRecognitionSystem
);

// POST /api/user-management/user-recognition-system - Create new item
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
  userRecognitionSystemController.createUserRecognitionSystem
);

// GET /api/user-management/user-recognition-system/:id - Get item by ID
router.get(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  userRecognitionSystemController.getUserRecognitionSystemById
);

// PUT /api/user-management/user-recognition-system/:id - Update item
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
  userRecognitionSystemController.updateUserRecognitionSystem
);

// DELETE /api/user-management/user-recognition-system/:id - Delete item
router.delete(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  userRecognitionSystemController.deleteUserRecognitionSystem
);

export { router as userRecognitionSystemRoutes };
