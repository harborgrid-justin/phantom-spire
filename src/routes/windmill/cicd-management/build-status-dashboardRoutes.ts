import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllBuildStatusDashboard,
  getBuildStatusDashboardById,
  createBuildStatusDashboard,
  updateBuildStatusDashboard,
  deleteBuildStatusDashboard,
  getBuildStatusDashboardAnalytics
} from '../../controllers/windmill/cicd-management/build-status-dashboardController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';

const router = Router();

const createBuildStatusDashboardValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('type').optional().equals('windmill-feature'),
  body('metadata').optional().isObject()
];

const updateBuildStatusDashboardValidation = [
  body('name').optional().trim().notEmpty(),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('metadata').optional().isObject()
];

router.get('/', authMiddleware, getAllBuildStatusDashboard);
router.get('/analytics', authMiddleware, getBuildStatusDashboardAnalytics);
router.get('/:id', authMiddleware, getBuildStatusDashboardById);
router.post('/', authMiddleware, createBuildStatusDashboardValidation, validateRequest, createBuildStatusDashboard);
router.put('/:id', authMiddleware, updateBuildStatusDashboardValidation, validateRequest, updateBuildStatusDashboard);
router.delete('/:id', authMiddleware, deleteBuildStatusDashboard);

export default router;
