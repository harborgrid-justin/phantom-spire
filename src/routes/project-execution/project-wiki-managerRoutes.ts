/**
 * Project Wiki Manager API Routes
 */

import { Router } from 'express';
import { ProjectWikiManagerController } from '../../controllers/project-execution/project-wiki-managerController.js';
import { authenticate } from '../../middleware/auth.js';

export function createProjectWikiManagerRoutes(): Router {
  const router = Router();
  const controller = new ProjectWikiManagerController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
