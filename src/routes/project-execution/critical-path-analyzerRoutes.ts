/**
 * Critical Path Analyzer API Routes
 */

import { Router } from 'express';
import { CriticalPathAnalyzerController } from '../../controllers/project-execution/critical-path-analyzerController.js';
import { authenticate } from '../../middleware/auth.js';

export function createCriticalPathAnalyzerRoutes(): Router {
  const router = Router();
  const controller = new CriticalPathAnalyzerController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
