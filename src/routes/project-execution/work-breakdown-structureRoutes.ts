/**
 * Work Breakdown Structure API Routes
 */

import { Router } from 'express';
import { WorkBreakdownStructureController } from '../../controllers/project-execution/work-breakdown-structureController.js';
import { authenticate } from '../../middleware/auth.js';

export function createWorkBreakdownStructureRoutes(): Router {
  const router = Router();
  const controller = new WorkBreakdownStructureController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
