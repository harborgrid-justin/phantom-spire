import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllOnboardingAutomation,
  getOnboardingAutomationById,
  createOnboardingAutomation,
  updateOnboardingAutomation,
  deleteOnboardingAutomation,
  getOnboardingAutomationAnalytics
} from '../../controllers/windmill/collaboration-workflow/onboarding-automationController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';

const router = Router();

const createOnboardingAutomationValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('type').optional().equals('windmill-feature'),
  body('metadata').optional().isObject()
];

const updateOnboardingAutomationValidation = [
  body('name').optional().trim().notEmpty(),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('metadata').optional().isObject()
];

router.get('/', authMiddleware, getAllOnboardingAutomation);
router.get('/analytics', authMiddleware, getOnboardingAutomationAnalytics);
router.get('/:id', authMiddleware, getOnboardingAutomationById);
router.post('/', authMiddleware, createOnboardingAutomationValidation, validateRequest, createOnboardingAutomation);
router.put('/:id', authMiddleware, updateOnboardingAutomationValidation, validateRequest, updateOnboardingAutomation);
router.delete('/:id', authMiddleware, deleteOnboardingAutomation);

export default router;
