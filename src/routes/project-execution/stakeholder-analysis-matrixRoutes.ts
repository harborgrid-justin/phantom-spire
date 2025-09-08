/**
 * Stakeholder Analysis Matrix API Routes
 */

import { Router } from 'express';
import { StakeholderAnalysisMatrixController } from '../../controllers/project-execution/stakeholder-analysis-matrixController.js';
import { authenticate } from '../../middleware/auth.js';

export function createStakeholderAnalysisMatrixRoutes(): Router {
  const router = Router();
  const controller = new StakeholderAnalysisMatrixController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
