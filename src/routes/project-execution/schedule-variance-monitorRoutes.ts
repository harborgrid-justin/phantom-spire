/**
 * Schedule Variance Monitor API Routes
 */

import { Router } from 'express';
import { ScheduleVarianceMonitorController } from '../../controllers/project-execution/schedule-variance-monitorController.js';
import { authenticate } from '../../middleware/auth.js';

export function createScheduleVarianceMonitorRoutes(): Router {
  const router = Router();
  const controller = new ScheduleVarianceMonitorController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
