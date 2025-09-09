import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllPerformanceBenchmarking,
  getPerformanceBenchmarkingById,
  createPerformanceBenchmarking,
  updatePerformanceBenchmarking,
  deletePerformanceBenchmarking,
  getPerformanceBenchmarkingAnalytics
} from '../../controllers/windmill/cicd-management/performance-benchmarkingController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';

const router = Router();

const createPerformanceBenchmarkingValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('type').optional().equals('windmill-feature'),
  body('metadata').optional().isObject()
];

const updatePerformanceBenchmarkingValidation = [
  body('name').optional().trim().notEmpty(),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('metadata').optional().isObject()
];

router.get('/', authMiddleware, getAllPerformanceBenchmarking);
router.get('/analytics', authMiddleware, getPerformanceBenchmarkingAnalytics);
router.get('/:id', authMiddleware, getPerformanceBenchmarkingById);
router.post('/', authMiddleware, createPerformanceBenchmarkingValidation, validateRequest, createPerformanceBenchmarking);
router.put('/:id', authMiddleware, updatePerformanceBenchmarkingValidation, validateRequest, updatePerformanceBenchmarking);
router.delete('/:id', authMiddleware, deletePerformanceBenchmarking);

export default router;
