/**
 * Stakeholder Communication Hub API Routes
 */

import { Router } from 'express';
import { StakeholderCommunicationHubController } from '../../controllers/project-execution/stakeholder-communication-hubController.js';
import { authenticate } from '../../middleware/auth.js';

export function createStakeholderCommunicationHubRoutes(): Router {
  const router = Router();
  const controller = new StakeholderCommunicationHubController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
