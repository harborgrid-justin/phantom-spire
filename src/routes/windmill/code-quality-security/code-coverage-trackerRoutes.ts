import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllCodeCoverageTracker,
  getCodeCoverageTrackerById,
  createCodeCoverageTracker,
  updateCodeCoverageTracker,
  deleteCodeCoverageTracker,
  getCodeCoverageTrackerAnalytics
} from '../../controllers/windmill/code-quality-security/code-coverage-trackerController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';

const router = Router();

const createCodeCoverageTrackerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('type').optional().equals('windmill-feature'),
  body('metadata').optional().isObject()
];

const updateCodeCoverageTrackerValidation = [
  body('name').optional().trim().notEmpty(),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('metadata').optional().isObject()
];

router.get('/', authMiddleware, getAllCodeCoverageTracker);
router.get('/analytics', authMiddleware, getCodeCoverageTrackerAnalytics);
router.get('/:id', authMiddleware, getCodeCoverageTrackerById);
router.post('/', authMiddleware, createCodeCoverageTrackerValidation, validateRequest, createCodeCoverageTracker);
router.put('/:id', authMiddleware, updateCodeCoverageTrackerValidation, validateRequest, updateCodeCoverageTracker);
router.delete('/:id', authMiddleware, deleteCodeCoverageTracker);

export default router;
