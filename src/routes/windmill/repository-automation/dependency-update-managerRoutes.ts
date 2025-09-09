import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllDependencyUpdateManager,
  getDependencyUpdateManagerById,
  createDependencyUpdateManager,
  updateDependencyUpdateManager,
  deleteDependencyUpdateManager,
  getDependencyUpdateManagerAnalytics
} from '../../controllers/windmill/repository-automation/dependency-update-managerController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';

const router = Router();

const createDependencyUpdateManagerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('type').optional().equals('windmill-feature'),
  body('metadata').optional().isObject()
];

const updateDependencyUpdateManagerValidation = [
  body('name').optional().trim().notEmpty(),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('metadata').optional().isObject()
];

router.get('/', authMiddleware, getAllDependencyUpdateManager);
router.get('/analytics', authMiddleware, getDependencyUpdateManagerAnalytics);
router.get('/:id', authMiddleware, getDependencyUpdateManagerById);
router.post('/', authMiddleware, createDependencyUpdateManagerValidation, validateRequest, createDependencyUpdateManager);
router.put('/:id', authMiddleware, updateDependencyUpdateManagerValidation, validateRequest, updateDependencyUpdateManager);
router.delete('/:id', authMiddleware, deleteDependencyUpdateManager);

export default router;
