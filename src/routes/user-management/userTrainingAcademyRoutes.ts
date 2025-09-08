import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { userTrainingAcademyController } from '../controllers/userTrainingAcademyController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: User Training Academy
 *   description: Comprehensive training programs and skill development
 */

// GET /api/user-management/user-training-academy - Get all items
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'pending', 'inactive', 'suspended', 'draft']),
    validateRequest
  ],
  userTrainingAcademyController.getAllUserTrainingAcademy
);

// POST /api/user-management/user-training-academy - Create new item
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
  userTrainingAcademyController.createUserTrainingAcademy
);

// GET /api/user-management/user-training-academy/:id - Get item by ID
router.get(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  userTrainingAcademyController.getUserTrainingAcademyById
);

// PUT /api/user-management/user-training-academy/:id - Update item
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
  userTrainingAcademyController.updateUserTrainingAcademy
);

// DELETE /api/user-management/user-training-academy/:id - Delete item
router.delete(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  userTrainingAcademyController.deleteUserTrainingAcademy
);

export { router as userTrainingAcademyRoutes };
