import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllCommunicationHub,
  getCommunicationHubById,
  createCommunicationHub,
  updateCommunicationHub,
  deleteCommunicationHub,
  getCommunicationHubAnalytics
} from '../../controllers/windmill/collaboration-workflow/communication-hubController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';

const router = Router();

const createCommunicationHubValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('type').optional().equals('windmill-feature'),
  body('metadata').optional().isObject()
];

const updateCommunicationHubValidation = [
  body('name').optional().trim().notEmpty(),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('metadata').optional().isObject()
];

router.get('/', authMiddleware, getAllCommunicationHub);
router.get('/analytics', authMiddleware, getCommunicationHubAnalytics);
router.get('/:id', authMiddleware, getCommunicationHubById);
router.post('/', authMiddleware, createCommunicationHubValidation, validateRequest, createCommunicationHub);
router.put('/:id', authMiddleware, updateCommunicationHubValidation, validateRequest, updateCommunicationHub);
router.delete('/:id', authMiddleware, deleteCommunicationHub);

export default router;
