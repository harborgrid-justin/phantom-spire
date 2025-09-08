/**
 * Change Request Workflow API Routes
 */

import { Router } from 'express';
import { ChangeRequestWorkflowController } from '../../controllers/project-execution/change-request-workflowController.js';
import { authenticate } from '../../middleware/auth.js';

export function createChangeRequestWorkflowRoutes(): Router {
  const router = Router();
  const controller = new ChangeRequestWorkflowController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
