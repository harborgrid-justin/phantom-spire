import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllRepositoryTemplateEngine,
  getRepositoryTemplateEngineById,
  createRepositoryTemplateEngine,
  updateRepositoryTemplateEngine,
  deleteRepositoryTemplateEngine,
  getRepositoryTemplateEngineAnalytics
} from '../../controllers/windmill/repository-automation/repository-template-engineController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';

const router = Router();

const createRepositoryTemplateEngineValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('type').optional().equals('windmill-feature'),
  body('metadata').optional().isObject()
];

const updateRepositoryTemplateEngineValidation = [
  body('name').optional().trim().notEmpty(),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('metadata').optional().isObject()
];

router.get('/', authMiddleware, getAllRepositoryTemplateEngine);
router.get('/analytics', authMiddleware, getRepositoryTemplateEngineAnalytics);
router.get('/:id', authMiddleware, getRepositoryTemplateEngineById);
router.post('/', authMiddleware, createRepositoryTemplateEngineValidation, validateRequest, createRepositoryTemplateEngine);
router.put('/:id', authMiddleware, updateRepositoryTemplateEngineValidation, validateRequest, updateRepositoryTemplateEngine);
router.delete('/:id', authMiddleware, deleteRepositoryTemplateEngine);

export default router;
