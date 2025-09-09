import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllDeploymentStrategyEngine,
  getDeploymentStrategyEngineById,
  createDeploymentStrategyEngine,
  updateDeploymentStrategyEngine,
  deleteDeploymentStrategyEngine,
  getDeploymentStrategyEngineAnalytics
} from '../../controllers/windmill/cicd-management/deployment-strategy-engineController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';

const router = Router();

const createDeploymentStrategyEngineValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('type').optional().equals('windmill-feature'),
  body('metadata').optional().isObject()
];

const updateDeploymentStrategyEngineValidation = [
  body('name').optional().trim().notEmpty(),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('metadata').optional().isObject()
];

router.get('/', authMiddleware, getAllDeploymentStrategyEngine);
router.get('/analytics', authMiddleware, getDeploymentStrategyEngineAnalytics);
router.get('/:id', authMiddleware, getDeploymentStrategyEngineById);
router.post('/', authMiddleware, createDeploymentStrategyEngineValidation, validateRequest, createDeploymentStrategyEngine);
router.put('/:id', authMiddleware, updateDeploymentStrategyEngineValidation, validateRequest, updateDeploymentStrategyEngine);
router.delete('/:id', authMiddleware, deleteDeploymentStrategyEngine);

export default router;
