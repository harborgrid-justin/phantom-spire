/**
 * Resource Performance Analytics API Routes
 */

import { Router } from 'express';
import { ResourcePerformanceAnalyticsController } from '../../controllers/project-execution/resource-performance-analyticsController.js';
import { authenticate } from '../../middleware/auth.js';

export function createResourcePerformanceAnalyticsRoutes(): Router {
  const router = Router();
  const controller = new ResourcePerformanceAnalyticsController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
