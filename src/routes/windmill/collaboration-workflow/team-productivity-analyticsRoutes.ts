import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllTeamProductivityAnalytics,
  getTeamProductivityAnalyticsById,
  createTeamProductivityAnalytics,
  updateTeamProductivityAnalytics,
  deleteTeamProductivityAnalytics,
  getTeamProductivityAnalyticsAnalytics
} from '../../controllers/windmill/collaboration-workflow/team-productivity-analyticsController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';

const router = Router();

const createTeamProductivityAnalyticsValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('type').optional().equals('windmill-feature'),
  body('metadata').optional().isObject()
];

const updateTeamProductivityAnalyticsValidation = [
  body('name').optional().trim().notEmpty(),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('metadata').optional().isObject()
];

router.get('/', authMiddleware, getAllTeamProductivityAnalytics);
router.get('/analytics', authMiddleware, getTeamProductivityAnalyticsAnalytics);
router.get('/:id', authMiddleware, getTeamProductivityAnalyticsById);
router.post('/', authMiddleware, createTeamProductivityAnalyticsValidation, validateRequest, createTeamProductivityAnalytics);
router.put('/:id', authMiddleware, updateTeamProductivityAnalyticsValidation, validateRequest, updateTeamProductivityAnalytics);
router.delete('/:id', authMiddleware, deleteTeamProductivityAnalytics);

export default router;
