/**
 * Quality Metrics Dashboard API Routes
 */

import { Router } from 'express';
import { QualityMetricsDashboardController } from '../../controllers/project-execution/quality-metrics-dashboardController.js';
import { authenticate } from '../../middleware/auth.js';

export function createQualityMetricsDashboardRoutes(): Router {
  const router = Router();
  const controller = new QualityMetricsDashboardController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
