/**
 * Cross-Project Resource Board API Routes
 */

import { Router } from 'express';
import { CrossProjectResourceBoardController } from '../../controllers/project-execution/cross-project-resource-boardController.js';
import { authenticate } from '../../middleware/auth.js';

export function createCrossProjectResourceBoardRoutes(): Router {
  const router = Router();
  const controller = new CrossProjectResourceBoardController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
