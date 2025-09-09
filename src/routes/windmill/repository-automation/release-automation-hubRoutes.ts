import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllReleaseAutomationHub,
  getReleaseAutomationHubById,
  createReleaseAutomationHub,
  updateReleaseAutomationHub,
  deleteReleaseAutomationHub,
  getReleaseAutomationHubAnalytics
} from '../../controllers/windmill/repository-automation/release-automation-hubController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';

const router = Router();

const createReleaseAutomationHubValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('type').optional().equals('windmill-feature'),
  body('metadata').optional().isObject()
];

const updateReleaseAutomationHubValidation = [
  body('name').optional().trim().notEmpty(),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('metadata').optional().isObject()
];

router.get('/', authMiddleware, getAllReleaseAutomationHub);
router.get('/analytics', authMiddleware, getReleaseAutomationHubAnalytics);
router.get('/:id', authMiddleware, getReleaseAutomationHubById);
router.post('/', authMiddleware, createReleaseAutomationHubValidation, validateRequest, createReleaseAutomationHub);
router.put('/:id', authMiddleware, updateReleaseAutomationHubValidation, validateRequest, updateReleaseAutomationHub);
router.delete('/:id', authMiddleware, deleteReleaseAutomationHub);

export default router;
