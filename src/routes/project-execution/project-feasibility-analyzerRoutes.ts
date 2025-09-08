/**
 * Project Feasibility Analyzer API Routes
 */

import { Router } from 'express';
import { ProjectFeasibilityAnalyzerController } from '../../controllers/project-execution/project-feasibility-analyzerController.js';
import { authenticate } from '../../middleware/auth.js';

export function createProjectFeasibilityAnalyzerRoutes(): Router {
  const router = Router();
  const controller = new ProjectFeasibilityAnalyzerController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
