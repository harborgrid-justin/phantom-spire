/**
 * Project Budget Planner API Routes
 */

import { Router } from 'express';
import { ProjectBudgetPlannerController } from '../../controllers/project-execution/project-budget-plannerController.js';
import { authenticate } from '../../middleware/auth.js';

export function createProjectBudgetPlannerRoutes(): Router {
  const router = Router();
  const controller = new ProjectBudgetPlannerController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
