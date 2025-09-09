import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllDocumentationGenerator,
  getDocumentationGeneratorById,
  createDocumentationGenerator,
  updateDocumentationGenerator,
  deleteDocumentationGenerator,
  getDocumentationGeneratorAnalytics
} from '../../controllers/windmill/code-quality-security/documentation-generatorController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';

const router = Router();

const createDocumentationGeneratorValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('type').optional().equals('windmill-feature'),
  body('metadata').optional().isObject()
];

const updateDocumentationGeneratorValidation = [
  body('name').optional().trim().notEmpty(),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('metadata').optional().isObject()
];

router.get('/', authMiddleware, getAllDocumentationGenerator);
router.get('/analytics', authMiddleware, getDocumentationGeneratorAnalytics);
router.get('/:id', authMiddleware, getDocumentationGeneratorById);
router.post('/', authMiddleware, createDocumentationGeneratorValidation, validateRequest, createDocumentationGenerator);
router.put('/:id', authMiddleware, updateDocumentationGeneratorValidation, validateRequest, updateDocumentationGenerator);
router.delete('/:id', authMiddleware, deleteDocumentationGenerator);

export default router;
