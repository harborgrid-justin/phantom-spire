/**
 * Notification Center API Routes
 */

import { Router } from 'express';
import { NotificationCenterController } from '../../controllers/project-execution/notification-centerController.js';
import { authenticate } from '../../middleware/auth.js';

export function createNotificationCenterRoutes(): Router {
  const router = Router();
  const controller = new NotificationCenterController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
