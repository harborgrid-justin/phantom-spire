import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllTestAutomationManager,
  getTestAutomationManagerById,
  createTestAutomationManager,
  updateTestAutomationManager,
  deleteTestAutomationManager,
  getTestAutomationManagerAnalytics
} from '../../controllers/windmill/cicd-management/test-automation-managerController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';

const router = Router();

const createTestAutomationManagerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('type').optional().equals('windmill-feature'),
  body('metadata').optional().isObject()
];

const updateTestAutomationManagerValidation = [
  body('name').optional().trim().notEmpty(),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('metadata').optional().isObject()
];

router.get('/', authMiddleware, getAllTestAutomationManager);
router.get('/analytics', authMiddleware, getTestAutomationManagerAnalytics);
router.get('/:id', authMiddleware, getTestAutomationManagerById);
router.post('/', authMiddleware, createTestAutomationManagerValidation, validateRequest, createTestAutomationManager);
router.put('/:id', authMiddleware, updateTestAutomationManagerValidation, validateRequest, updateTestAutomationManager);
router.delete('/:id', authMiddleware, deleteTestAutomationManager);

export default router;
