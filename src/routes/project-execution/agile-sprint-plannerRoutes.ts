/**
 * Agile Sprint Planner API Routes
 */

import { Router } from 'express';
import { AgileSprintPlannerController } from '../../controllers/project-execution/agile-sprint-plannerController.js';
import { authenticate } from '../../middleware/auth.js';

export function createAgileSprintPlannerRoutes(): Router {
  const router = Router();
  const controller = new AgileSprintPlannerController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
