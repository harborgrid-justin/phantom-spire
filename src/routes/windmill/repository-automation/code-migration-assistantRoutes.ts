import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllCodeMigrationAssistant,
  getCodeMigrationAssistantById,
  createCodeMigrationAssistant,
  updateCodeMigrationAssistant,
  deleteCodeMigrationAssistant,
  getCodeMigrationAssistantAnalytics
} from '../../controllers/windmill/repository-automation/code-migration-assistantController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';

const router = Router();

const createCodeMigrationAssistantValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('type').optional().equals('windmill-feature'),
  body('metadata').optional().isObject()
];

const updateCodeMigrationAssistantValidation = [
  body('name').optional().trim().notEmpty(),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('metadata').optional().isObject()
];

router.get('/', authMiddleware, getAllCodeMigrationAssistant);
router.get('/analytics', authMiddleware, getCodeMigrationAssistantAnalytics);
router.get('/:id', authMiddleware, getCodeMigrationAssistantById);
router.post('/', authMiddleware, createCodeMigrationAssistantValidation, validateRequest, createCodeMigrationAssistant);
router.put('/:id', authMiddleware, updateCodeMigrationAssistantValidation, validateRequest, updateCodeMigrationAssistant);
router.delete('/:id', authMiddleware, deleteCodeMigrationAssistant);

export default router;
