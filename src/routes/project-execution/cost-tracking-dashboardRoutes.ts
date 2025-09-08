/**
 * Cost Tracking Dashboard API Routes
 */

import { Router } from 'express';
import { CostTrackingDashboardController } from '../../controllers/project-execution/cost-tracking-dashboardController.js';
import { authenticate } from '../../middleware/auth.js';

export function createCostTrackingDashboardRoutes(): Router {
  const router = Router();
  const controller = new CostTrackingDashboardController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
