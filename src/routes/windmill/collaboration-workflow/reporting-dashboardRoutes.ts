import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllReportingDashboard,
  getReportingDashboardById,
  createReportingDashboard,
  updateReportingDashboard,
  deleteReportingDashboard,
  getReportingDashboardAnalytics
} from '../../controllers/windmill/collaboration-workflow/reporting-dashboardController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';

const router = Router();

const createReportingDashboardValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('type').optional().equals('windmill-feature'),
  body('metadata').optional().isObject()
];

const updateReportingDashboardValidation = [
  body('name').optional().trim().notEmpty(),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('metadata').optional().isObject()
];

router.get('/', authMiddleware, getAllReportingDashboard);
router.get('/analytics', authMiddleware, getReportingDashboardAnalytics);
router.get('/:id', authMiddleware, getReportingDashboardById);
router.post('/', authMiddleware, createReportingDashboardValidation, validateRequest, createReportingDashboard);
router.put('/:id', authMiddleware, updateReportingDashboardValidation, validateRequest, updateReportingDashboard);
router.delete('/:id', authMiddleware, deleteReportingDashboard);

export default router;
