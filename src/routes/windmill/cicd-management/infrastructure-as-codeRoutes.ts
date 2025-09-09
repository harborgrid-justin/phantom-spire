import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllInfrastructureAsCode,
  getInfrastructureAsCodeById,
  createInfrastructureAsCode,
  updateInfrastructureAsCode,
  deleteInfrastructureAsCode,
  getInfrastructureAsCodeAnalytics
} from '../../controllers/windmill/cicd-management/infrastructure-as-codeController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';

const router = Router();

const createInfrastructureAsCodeValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('type').optional().equals('windmill-feature'),
  body('metadata').optional().isObject()
];

const updateInfrastructureAsCodeValidation = [
  body('name').optional().trim().notEmpty(),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('metadata').optional().isObject()
];

router.get('/', authMiddleware, getAllInfrastructureAsCode);
router.get('/analytics', authMiddleware, getInfrastructureAsCodeAnalytics);
router.get('/:id', authMiddleware, getInfrastructureAsCodeById);
router.post('/', authMiddleware, createInfrastructureAsCodeValidation, validateRequest, createInfrastructureAsCode);
router.put('/:id', authMiddleware, updateInfrastructureAsCodeValidation, validateRequest, updateInfrastructureAsCode);
router.delete('/:id', authMiddleware, deleteInfrastructureAsCode);

export default router;
