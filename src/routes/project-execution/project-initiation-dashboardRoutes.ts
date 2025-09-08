/**
 * Project Initiation Dashboard API Routes
 */

import { Router } from 'express';
import { ProjectInitiationDashboardController } from '../../controllers/project-execution/project-initiation-dashboardController.js';
import { authenticate } from '../../middleware/auth.js';

export function createProjectInitiationDashboardRoutes(): Router {
  const router = Router();
  const controller = new ProjectInitiationDashboardController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
