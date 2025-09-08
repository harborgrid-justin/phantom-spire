/**
 * Team Composition Optimizer API Routes
 */

import { Router } from 'express';
import { TeamCompositionOptimizerController } from '../../controllers/project-execution/team-composition-optimizerController.js';
import { authenticate } from '../../middleware/auth.js';

export function createTeamCompositionOptimizerRoutes(): Router {
  const router = Router();
  const controller = new TeamCompositionOptimizerController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
