import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllPipelineOrchestrator,
  getPipelineOrchestratorById,
  createPipelineOrchestrator,
  updatePipelineOrchestrator,
  deletePipelineOrchestrator,
  getPipelineOrchestratorAnalytics
} from '../../controllers/windmill/cicd-management/pipeline-orchestratorController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';

const router = Router();

const createPipelineOrchestratorValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('type').optional().equals('windmill-feature'),
  body('metadata').optional().isObject()
];

const updatePipelineOrchestratorValidation = [
  body('name').optional().trim().notEmpty(),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed']),
  body('metadata').optional().isObject()
];

router.get('/', authMiddleware, getAllPipelineOrchestrator);
router.get('/analytics', authMiddleware, getPipelineOrchestratorAnalytics);
router.get('/:id', authMiddleware, getPipelineOrchestratorById);
router.post('/', authMiddleware, createPipelineOrchestratorValidation, validateRequest, createPipelineOrchestrator);
router.put('/:id', authMiddleware, updatePipelineOrchestratorValidation, validateRequest, updatePipelineOrchestrator);
router.delete('/:id', authMiddleware, deletePipelineOrchestrator);

export default router;
