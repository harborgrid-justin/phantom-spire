import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllTechnicalDebtMonitor,
  getTechnicalDebtMonitorById,
  createTechnicalDebtMonitor,
  updateTechnicalDebtMonitor,
  deleteTechnicalDebtMonitor,
  getTechnicalDebtMonitorAnalytics
} from '../../controllers/windmill/code-quality-security/technical-debt-monitorController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';

const router = Router();

const createTechnicalDebtMonitorValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('type').optional().equals('windmill-feature'),
  body('metadata').optional().isObject()
];

const updateTechnicalDebtMonitorValidation = [
  body('name').optional().trim().notEmpty(),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('metadata').optional().isObject()
];

router.get('/', authMiddleware, getAllTechnicalDebtMonitor);
router.get('/analytics', authMiddleware, getTechnicalDebtMonitorAnalytics);
router.get('/:id', authMiddleware, getTechnicalDebtMonitorById);
router.post('/', authMiddleware, createTechnicalDebtMonitorValidation, validateRequest, createTechnicalDebtMonitor);
router.put('/:id', authMiddleware, updateTechnicalDebtMonitorValidation, validateRequest, updateTechnicalDebtMonitor);
router.delete('/:id', authMiddleware, deleteTechnicalDebtMonitor);

export default router;
