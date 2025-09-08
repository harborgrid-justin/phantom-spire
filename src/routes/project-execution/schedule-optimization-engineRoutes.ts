/**
 * Schedule Optimization Engine API Routes
 */

import { Router } from 'express';
import { ScheduleOptimizationEngineController } from '../../controllers/project-execution/schedule-optimization-engineController.js';
import { authenticate } from '../../middleware/auth.js';

export function createScheduleOptimizationEngineRoutes(): Router {
  const router = Router();
  const controller = new ScheduleOptimizationEngineController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
