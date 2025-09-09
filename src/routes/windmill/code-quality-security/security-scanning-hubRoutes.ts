import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllSecurityScanningHub,
  getSecurityScanningHubById,
  createSecurityScanningHub,
  updateSecurityScanningHub,
  deleteSecurityScanningHub,
  getSecurityScanningHubAnalytics
} from '../../controllers/windmill/code-quality-security/security-scanning-hubController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';

const router = Router();

const createSecurityScanningHubValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('type').optional().equals('windmill-feature'),
  body('metadata').optional().isObject()
];

const updateSecurityScanningHubValidation = [
  body('name').optional().trim().notEmpty(),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('metadata').optional().isObject()
];

router.get('/', authMiddleware, getAllSecurityScanningHub);
router.get('/analytics', authMiddleware, getSecurityScanningHubAnalytics);
router.get('/:id', authMiddleware, getSecurityScanningHubById);
router.post('/', authMiddleware, createSecurityScanningHubValidation, validateRequest, createSecurityScanningHub);
router.put('/:id', authMiddleware, updateSecurityScanningHubValidation, validateRequest, updateSecurityScanningHub);
router.delete('/:id', authMiddleware, deleteSecurityScanningHub);

export default router;
