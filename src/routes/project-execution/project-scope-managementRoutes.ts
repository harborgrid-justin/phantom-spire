/**
 * Project Scope Management API Routes
 */

import { Router } from 'express';
import { ProjectScopeManagementController } from '../../controllers/project-execution/project-scope-managementController.js';
import { authenticate } from '../../middleware/auth.js';

export function createProjectScopeManagementRoutes(): Router {
  const router = Router();
  const controller = new ProjectScopeManagementController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
