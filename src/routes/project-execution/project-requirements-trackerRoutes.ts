/**
 * Project Requirements Tracker API Routes
 */

import { Router } from 'express';
import { ProjectRequirementsTrackerController } from '../../controllers/project-execution/project-requirements-trackerController.js';
import { authenticate } from '../../middleware/auth.js';

export function createProjectRequirementsTrackerRoutes(): Router {
  const router = Router();
  const controller = new ProjectRequirementsTrackerController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
