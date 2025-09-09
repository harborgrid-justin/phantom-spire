import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllCodeReviewAnalytics,
  getCodeReviewAnalyticsById,
  createCodeReviewAnalytics,
  updateCodeReviewAnalytics,
  deleteCodeReviewAnalytics,
  getCodeReviewAnalyticsAnalytics
} from '../../controllers/windmill/code-quality-security/code-review-analyticsController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';

const router = Router();

const createCodeReviewAnalyticsValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('type').optional().equals('windmill-feature'),
  body('metadata').optional().isObject()
];

const updateCodeReviewAnalyticsValidation = [
  body('name').optional().trim().notEmpty(),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('metadata').optional().isObject()
];

router.get('/', authMiddleware, getAllCodeReviewAnalytics);
router.get('/analytics', authMiddleware, getCodeReviewAnalyticsAnalytics);
router.get('/:id', authMiddleware, getCodeReviewAnalyticsById);
router.post('/', authMiddleware, createCodeReviewAnalyticsValidation, validateRequest, createCodeReviewAnalytics);
router.put('/:id', authMiddleware, updateCodeReviewAnalyticsValidation, validateRequest, updateCodeReviewAnalytics);
router.delete('/:id', authMiddleware, deleteCodeReviewAnalytics);

export default router;
