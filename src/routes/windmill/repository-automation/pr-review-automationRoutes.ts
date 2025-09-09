import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllPrReviewAutomation,
  getPrReviewAutomationById,
  createPrReviewAutomation,
  updatePrReviewAutomation,
  deletePrReviewAutomation,
  getPrReviewAutomationAnalytics
} from '../../controllers/windmill/repository-automation/pr-review-automationController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';

const router = Router();

const createPrReviewAutomationValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('type').optional().equals('windmill-feature'),
  body('metadata').optional().isObject()
];

const updatePrReviewAutomationValidation = [
  body('name').optional().trim().notEmpty(),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('metadata').optional().isObject()
];

router.get('/', authMiddleware, getAllPrReviewAutomation);
router.get('/analytics', authMiddleware, getPrReviewAutomationAnalytics);
router.get('/:id', authMiddleware, getPrReviewAutomationById);
router.post('/', authMiddleware, createPrReviewAutomationValidation, validateRequest, createPrReviewAutomation);
router.put('/:id', authMiddleware, updatePrReviewAutomationValidation, validateRequest, updatePrReviewAutomation);
router.delete('/:id', authMiddleware, deletePrReviewAutomation);

export default router;
