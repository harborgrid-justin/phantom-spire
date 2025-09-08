/**
 * Timeline Visualization Studio API Routes
 */

import { Router } from 'express';
import { TimelineVisualizationStudioController } from '../../controllers/project-execution/timeline-visualization-studioController.js';
import { authenticate } from '../../middleware/auth.js';

export function createTimelineVisualizationStudioRoutes(): Router {
  const router = Router();
  const controller = new TimelineVisualizationStudioController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
