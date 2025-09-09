import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllCodeQualityAnalyzer,
  getCodeQualityAnalyzerById,
  createCodeQualityAnalyzer,
  updateCodeQualityAnalyzer,
  deleteCodeQualityAnalyzer,
  getCodeQualityAnalyzerAnalytics
} from '../../controllers/windmill/code-quality-security/code-quality-analyzerController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';

const router = Router();

const createCodeQualityAnalyzerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('type').optional().equals('windmill-feature'),
  body('metadata').optional().isObject()
];

const updateCodeQualityAnalyzerValidation = [
  body('name').optional().trim().notEmpty(),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('metadata').optional().isObject()
];

router.get('/', authMiddleware, getAllCodeQualityAnalyzer);
router.get('/analytics', authMiddleware, getCodeQualityAnalyzerAnalytics);
router.get('/:id', authMiddleware, getCodeQualityAnalyzerById);
router.post('/', authMiddleware, createCodeQualityAnalyzerValidation, validateRequest, createCodeQualityAnalyzer);
router.put('/:id', authMiddleware, updateCodeQualityAnalyzerValidation, validateRequest, updateCodeQualityAnalyzer);
router.delete('/:id', authMiddleware, deleteCodeQualityAnalyzer);

export default router;
