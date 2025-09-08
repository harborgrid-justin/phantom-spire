/**
 * Meeting Management Center API Routes
 */

import { Router } from 'express';
import { MeetingManagementCenterController } from '../../controllers/project-execution/meeting-management-centerController.js';
import { authenticate } from '../../middleware/auth.js';

export function createMeetingManagementCenterRoutes(): Router {
  const router = Router();
  const controller = new MeetingManagementCenterController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
