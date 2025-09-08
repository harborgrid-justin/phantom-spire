/**
 * Team Communication Portal API Routes
 */

import { Router } from 'express';
import { TeamCommunicationPortalController } from '../../controllers/project-execution/team-communication-portalController.js';
import { authenticate } from '../../middleware/auth.js';

export function createTeamCommunicationPortalRoutes(): Router {
  const router = Router();
  const controller = new TeamCommunicationPortalController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
