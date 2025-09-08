import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { userOnboardingJourneyController } from '../controllers/userOnboardingJourneyController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: User Onboarding Journey
 *   description: Personalized user onboarding and training workflows
 */

// GET /api/user-management/user-onboarding-journey - Get all items
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'pending', 'inactive', 'suspended', 'draft']),
    validateRequest
  ],
  userOnboardingJourneyController.getAllUserOnboardingJourney
);

// POST /api/user-management/user-onboarding-journey - Create new item
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
  userOnboardingJourneyController.createUserOnboardingJourney
);

// GET /api/user-management/user-onboarding-journey/:id - Get item by ID
router.get(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  userOnboardingJourneyController.getUserOnboardingJourneyById
);

// PUT /api/user-management/user-onboarding-journey/:id - Update item
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
  userOnboardingJourneyController.updateUserOnboardingJourney
);

// DELETE /api/user-management/user-onboarding-journey/:id - Delete item
router.delete(
  '/:id',
  [
    param('id').isString().trim().notEmpty(),
    validateRequest
  ],
  userOnboardingJourneyController.deleteUserOnboardingJourney
);

export { router as userOnboardingJourneyRoutes };
