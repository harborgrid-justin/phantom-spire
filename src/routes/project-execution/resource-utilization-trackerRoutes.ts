/**
 * Resource Utilization Tracker API Routes
 */

import { Router } from 'express';
import { ResourceUtilizationTrackerController } from '../../controllers/project-execution/resource-utilization-trackerController.js';
import { authenticate } from '../../middleware/auth.js';

export function createResourceUtilizationTrackerRoutes(): Router {
  const router = Router();
  const controller = new ResourceUtilizationTrackerController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
