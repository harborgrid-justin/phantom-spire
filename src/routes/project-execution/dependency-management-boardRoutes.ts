/**
 * Dependency Management Board API Routes
 */

import { Router } from 'express';
import { DependencyManagementBoardController } from '../../controllers/project-execution/dependency-management-boardController.js';
import { authenticate } from '../../middleware/auth.js';

export function createDependencyManagementBoardRoutes(): Router {
  const router = Router();
  const controller = new DependencyManagementBoardController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
