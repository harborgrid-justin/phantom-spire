import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllIssueAutoClassification,
  getIssueAutoClassificationById,
  createIssueAutoClassification,
  updateIssueAutoClassification,
  deleteIssueAutoClassification,
  getIssueAutoClassificationAnalytics
} from '../../controllers/windmill/repository-automation/issue-auto-classificationController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';

const router = Router();

const createIssueAutoClassificationValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('type').optional().equals('windmill-feature'),
  body('metadata').optional().isObject()
];

const updateIssueAutoClassificationValidation = [
  body('name').optional().trim().notEmpty(),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('metadata').optional().isObject()
];

router.get('/', authMiddleware, getAllIssueAutoClassification);
router.get('/analytics', authMiddleware, getIssueAutoClassificationAnalytics);
router.get('/:id', authMiddleware, getIssueAutoClassificationById);
router.post('/', authMiddleware, createIssueAutoClassificationValidation, validateRequest, createIssueAutoClassification);
router.put('/:id', authMiddleware, updateIssueAutoClassificationValidation, validateRequest, updateIssueAutoClassification);
router.delete('/:id', authMiddleware, deleteIssueAutoClassification);

export default router;
