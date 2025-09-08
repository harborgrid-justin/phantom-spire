/**
 * Project Charter Builder API Routes
 */

import { Router } from 'express';
import { ProjectCharterBuilderController } from '../../controllers/project-execution/project-charter-builderController.js';
import { authenticate } from '../../middleware/auth.js';

export function createProjectCharterBuilderRoutes(): Router {
  const router = Router();
  const controller = new ProjectCharterBuilderController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
