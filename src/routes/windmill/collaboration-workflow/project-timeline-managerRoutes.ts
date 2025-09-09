import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllProjectTimelineManager,
  getProjectTimelineManagerById,
  createProjectTimelineManager,
  updateProjectTimelineManager,
  deleteProjectTimelineManager,
  getProjectTimelineManagerAnalytics
} from '../../controllers/windmill/collaboration-workflow/project-timeline-managerController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';

const router = Router();

const createProjectTimelineManagerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('type').optional().equals('windmill-feature'),
  body('metadata').optional().isObject()
];

const updateProjectTimelineManagerValidation = [
  body('name').optional().trim().notEmpty(),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('metadata').optional().isObject()
];

router.get('/', authMiddleware, getAllProjectTimelineManager);
router.get('/analytics', authMiddleware, getProjectTimelineManagerAnalytics);
router.get('/:id', authMiddleware, getProjectTimelineManagerById);
router.post('/', authMiddleware, createProjectTimelineManagerValidation, validateRequest, createProjectTimelineManager);
router.put('/:id', authMiddleware, updateProjectTimelineManagerValidation, validateRequest, updateProjectTimelineManager);
router.delete('/:id', authMiddleware, deleteProjectTimelineManager);

export default router;
