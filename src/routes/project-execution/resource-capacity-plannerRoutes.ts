/**
 * Resource Capacity Planner API Routes
 */

import { Router } from 'express';
import { ResourceCapacityPlannerController } from '../../controllers/project-execution/resource-capacity-plannerController.js';
import { authenticate } from '../../middleware/auth.js';

export function createResourceCapacityPlannerRoutes(): Router {
  const router = Router();
  const controller = new ResourceCapacityPlannerController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
