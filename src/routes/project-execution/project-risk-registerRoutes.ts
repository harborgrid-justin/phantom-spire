/**
 * Project Risk Register API Routes
 */

import { Router } from 'express';
import { ProjectRiskRegisterController } from '../../controllers/project-execution/project-risk-registerController.js';
import { authenticate } from '../../middleware/auth.js';

export function createProjectRiskRegisterRoutes(): Router {
  const router = Router();
  const controller = new ProjectRiskRegisterController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
