/**
 * Project Estimation Engine API Routes
 */

import { Router } from 'express';
import { ProjectEstimationEngineController } from '../../controllers/project-execution/project-estimation-engineController.js';
import { authenticate } from '../../middleware/auth.js';

export function createProjectEstimationEngineRoutes(): Router {
  const router = Router();
  const controller = new ProjectEstimationEngineController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
