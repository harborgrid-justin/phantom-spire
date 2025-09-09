import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllEnvironmentConfiguration,
  getEnvironmentConfigurationById,
  createEnvironmentConfiguration,
  updateEnvironmentConfiguration,
  deleteEnvironmentConfiguration,
  getEnvironmentConfigurationAnalytics
} from '../../controllers/windmill/cicd-management/environment-configurationController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';

const router = Router();

const createEnvironmentConfigurationValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('type').optional().equals('windmill-feature'),
  body('metadata').optional().isObject()
];

const updateEnvironmentConfigurationValidation = [
  body('name').optional().trim().notEmpty(),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('metadata').optional().isObject()
];

router.get('/', authMiddleware, getAllEnvironmentConfiguration);
router.get('/analytics', authMiddleware, getEnvironmentConfigurationAnalytics);
router.get('/:id', authMiddleware, getEnvironmentConfigurationById);
router.post('/', authMiddleware, createEnvironmentConfigurationValidation, validateRequest, createEnvironmentConfiguration);
router.put('/:id', authMiddleware, updateEnvironmentConfigurationValidation, validateRequest, updateEnvironmentConfiguration);
router.delete('/:id', authMiddleware, deleteEnvironmentConfiguration);

export default router;
