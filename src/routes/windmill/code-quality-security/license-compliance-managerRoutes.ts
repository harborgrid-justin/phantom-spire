import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllLicenseComplianceManager,
  getLicenseComplianceManagerById,
  createLicenseComplianceManager,
  updateLicenseComplianceManager,
  deleteLicenseComplianceManager,
  getLicenseComplianceManagerAnalytics
} from '../../controllers/windmill/code-quality-security/license-compliance-managerController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';

const router = Router();

const createLicenseComplianceManagerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('type').optional().equals('windmill-feature'),
  body('metadata').optional().isObject()
];

const updateLicenseComplianceManagerValidation = [
  body('name').optional().trim().notEmpty(),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('metadata').optional().isObject()
];

router.get('/', authMiddleware, getAllLicenseComplianceManager);
router.get('/analytics', authMiddleware, getLicenseComplianceManagerAnalytics);
router.get('/:id', authMiddleware, getLicenseComplianceManagerById);
router.post('/', authMiddleware, createLicenseComplianceManagerValidation, validateRequest, createLicenseComplianceManager);
router.put('/:id', authMiddleware, updateLicenseComplianceManagerValidation, validateRequest, updateLicenseComplianceManager);
router.delete('/:id', authMiddleware, deleteLicenseComplianceManager);

export default router;
