/**
 * Project Status Broadcaster API Routes
 */

import { Router } from 'express';
import { ProjectStatusBroadcasterController } from '../../controllers/project-execution/project-status-broadcasterController.js';
import { authenticate } from '../../middleware/auth.js';

export function createProjectStatusBroadcasterRoutes(): Router {
  const router = Router();
  const controller = new ProjectStatusBroadcasterController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
