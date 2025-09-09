import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllRepositoryHealthMonitor,
  getRepositoryHealthMonitorById,
  createRepositoryHealthMonitor,
  updateRepositoryHealthMonitor,
  deleteRepositoryHealthMonitor,
  getRepositoryHealthMonitorAnalytics
} from '../../controllers/windmill/repository-automation/repository-health-monitorController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';

const router = Router();

const createRepositoryHealthMonitorValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('type').optional().equals('windmill-feature'),
  body('metadata').optional().isObject()
];

const updateRepositoryHealthMonitorValidation = [
  body('name').optional().trim().notEmpty(),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('metadata').optional().isObject()
];

router.get('/', authMiddleware, getAllRepositoryHealthMonitor);
router.get('/analytics', authMiddleware, getRepositoryHealthMonitorAnalytics);
router.get('/:id', authMiddleware, getRepositoryHealthMonitorById);
router.post('/', authMiddleware, createRepositoryHealthMonitorValidation, validateRequest, createRepositoryHealthMonitor);
router.put('/:id', authMiddleware, updateRepositoryHealthMonitorValidation, validateRequest, updateRepositoryHealthMonitor);
router.delete('/:id', authMiddleware, deleteRepositoryHealthMonitor);

export default router;
