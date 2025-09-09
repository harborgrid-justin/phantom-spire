import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllIntegrationManager,
  getIntegrationManagerById,
  createIntegrationManager,
  updateIntegrationManager,
  deleteIntegrationManager,
  getIntegrationManagerAnalytics
} from '../../controllers/windmill/collaboration-workflow/integration-managerController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';

const router = Router();

const createIntegrationManagerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('type').optional().equals('windmill-feature'),
  body('metadata').optional().isObject()
];

const updateIntegrationManagerValidation = [
  body('name').optional().trim().notEmpty(),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('metadata').optional().isObject()
];

router.get('/', authMiddleware, getAllIntegrationManager);
router.get('/analytics', authMiddleware, getIntegrationManagerAnalytics);
router.get('/:id', authMiddleware, getIntegrationManagerById);
router.post('/', authMiddleware, createIntegrationManagerValidation, validateRequest, createIntegrationManager);
router.put('/:id', authMiddleware, updateIntegrationManagerValidation, validateRequest, updateIntegrationManager);
router.delete('/:id', authMiddleware, deleteIntegrationManager);

export default router;
