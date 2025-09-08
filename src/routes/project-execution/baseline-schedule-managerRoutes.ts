/**
 * Baseline Schedule Manager API Routes
 */

import { Router } from 'express';
import { BaselineScheduleManagerController } from '../../controllers/project-execution/baseline-schedule-managerController.js';
import { authenticate } from '../../middleware/auth.js';

export function createBaselineScheduleManagerRoutes(): Router {
  const router = Router();
  const controller = new BaselineScheduleManagerController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
