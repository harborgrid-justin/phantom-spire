import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllAutomatedBranchManagement,
  getAutomatedBranchManagementById,
  createAutomatedBranchManagement,
  updateAutomatedBranchManagement,
  deleteAutomatedBranchManagement,
  getAutomatedBranchManagementAnalytics
} from '../../controllers/windmill/repository-automation/automated-branch-managementController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';

const router = Router();

const createAutomatedBranchManagementValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('type').optional().equals('windmill-feature'),
  body('metadata').optional().isObject()
];

const updateAutomatedBranchManagementValidation = [
  body('name').optional().trim().notEmpty(),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('metadata').optional().isObject()
];

router.get('/', authMiddleware, getAllAutomatedBranchManagement);
router.get('/analytics', authMiddleware, getAutomatedBranchManagementAnalytics);
router.get('/:id', authMiddleware, getAutomatedBranchManagementById);
router.post('/', authMiddleware, createAutomatedBranchManagementValidation, validateRequest, createAutomatedBranchManagement);
router.put('/:id', authMiddleware, updateAutomatedBranchManagementValidation, validateRequest, updateAutomatedBranchManagement);
router.delete('/:id', authMiddleware, deleteAutomatedBranchManagement);

export default router;
