/**
 * Resource Conflict Resolver API Routes
 */

import { Router } from 'express';
import { ResourceConflictResolverController } from '../../controllers/project-execution/resource-conflict-resolverController.js';
import { authenticate } from '../../middleware/auth.js';

export function createResourceConflictResolverRoutes(): Router {
  const router = Router();
  const controller = new ResourceConflictResolverController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
