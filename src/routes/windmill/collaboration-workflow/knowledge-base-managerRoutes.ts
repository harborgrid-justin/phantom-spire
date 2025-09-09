import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllKnowledgeBaseManager,
  getKnowledgeBaseManagerById,
  createKnowledgeBaseManager,
  updateKnowledgeBaseManager,
  deleteKnowledgeBaseManager,
  getKnowledgeBaseManagerAnalytics
} from '../../controllers/windmill/collaboration-workflow/knowledge-base-managerController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';

const router = Router();

const createKnowledgeBaseManagerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('type').optional().equals('windmill-feature'),
  body('metadata').optional().isObject()
];

const updateKnowledgeBaseManagerValidation = [
  body('name').optional().trim().notEmpty(),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('metadata').optional().isObject()
];

router.get('/', authMiddleware, getAllKnowledgeBaseManager);
router.get('/analytics', authMiddleware, getKnowledgeBaseManagerAnalytics);
router.get('/:id', authMiddleware, getKnowledgeBaseManagerById);
router.post('/', authMiddleware, createKnowledgeBaseManagerValidation, validateRequest, createKnowledgeBaseManager);
router.put('/:id', authMiddleware, updateKnowledgeBaseManagerValidation, validateRequest, updateKnowledgeBaseManager);
router.delete('/:id', authMiddleware, deleteKnowledgeBaseManager);

export default router;
