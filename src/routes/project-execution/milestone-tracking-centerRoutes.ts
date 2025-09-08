/**
 * Milestone Tracking Center API Routes
 */

import { Router } from 'express';
import { MilestoneTrackingCenterController } from '../../controllers/project-execution/milestone-tracking-centerController.js';
import { authenticate } from '../../middleware/auth.js';

export function createMilestoneTrackingCenterRoutes(): Router {
  const router = Router();
  const controller = new MilestoneTrackingCenterController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
