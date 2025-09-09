import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllRollbackManagement,
  getRollbackManagementById,
  createRollbackManagement,
  updateRollbackManagement,
  deleteRollbackManagement,
  getRollbackManagementAnalytics
} from '../../controllers/windmill/cicd-management/rollback-managementController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';

const router = Router();

const createRollbackManagementValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('type').optional().equals('windmill-feature'),
  body('metadata').optional().isObject()
];

const updateRollbackManagementValidation = [
  body('name').optional().trim().notEmpty(),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('metadata').optional().isObject()
];

router.get('/', authMiddleware, getAllRollbackManagement);
router.get('/analytics', authMiddleware, getRollbackManagementAnalytics);
router.get('/:id', authMiddleware, getRollbackManagementById);
router.post('/', authMiddleware, createRollbackManagementValidation, validateRequest, createRollbackManagement);
router.put('/:id', authMiddleware, updateRollbackManagementValidation, validateRequest, updateRollbackManagement);
router.delete('/:id', authMiddleware, deleteRollbackManagement);

export default router;
