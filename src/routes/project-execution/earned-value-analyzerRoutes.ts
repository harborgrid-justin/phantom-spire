/**
 * Earned Value Analyzer API Routes
 */

import { Router } from 'express';
import { EarnedValueAnalyzerController } from '../../controllers/project-execution/earned-value-analyzerController.js';
import { authenticate } from '../../middleware/auth.js';

export function createEarnedValueAnalyzerRoutes(): Router {
  const router = Router();
  const controller = new EarnedValueAnalyzerController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
