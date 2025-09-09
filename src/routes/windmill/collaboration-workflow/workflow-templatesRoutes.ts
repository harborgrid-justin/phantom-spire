import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllWorkflowTemplates,
  getWorkflowTemplatesById,
  createWorkflowTemplates,
  updateWorkflowTemplates,
  deleteWorkflowTemplates,
  getWorkflowTemplatesAnalytics
} from '../../controllers/windmill/collaboration-workflow/workflow-templatesController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';

const router = Router();

const createWorkflowTemplatesValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('type').optional().equals('windmill-feature'),
  body('metadata').optional().isObject()
];

const updateWorkflowTemplatesValidation = [
  body('name').optional().trim().notEmpty(),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('metadata').optional().isObject()
];

router.get('/', authMiddleware, getAllWorkflowTemplates);
router.get('/analytics', authMiddleware, getWorkflowTemplatesAnalytics);
router.get('/:id', authMiddleware, getWorkflowTemplatesById);
router.post('/', authMiddleware, createWorkflowTemplatesValidation, validateRequest, createWorkflowTemplates);
router.put('/:id', authMiddleware, updateWorkflowTemplatesValidation, validateRequest, updateWorkflowTemplates);
router.delete('/:id', authMiddleware, deleteWorkflowTemplates);

export default router;
