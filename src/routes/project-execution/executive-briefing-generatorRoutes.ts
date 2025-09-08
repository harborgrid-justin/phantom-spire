/**
 * Executive Briefing Generator API Routes
 */

import { Router } from 'express';
import { ExecutiveBriefingGeneratorController } from '../../controllers/project-execution/executive-briefing-generatorController.js';
import { authenticate } from '../../middleware/auth.js';

export function createExecutiveBriefingGeneratorRoutes(): Router {
  const router = Router();
  const controller = new ExecutiveBriefingGeneratorController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
