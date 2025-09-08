/**
 * Procurement Management Center API Routes
 */

import { Router } from 'express';
import { ProcurementManagementCenterController } from '../../controllers/project-execution/procurement-management-centerController.js';
import { authenticate } from '../../middleware/auth.js';

export function createProcurementManagementCenterRoutes(): Router {
  const router = Router();
  const controller = new ProcurementManagementCenterController();

  router.get('/', authenticate, controller.getAll);
  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getById);
  router.put('/:id', authenticate, controller.update);
  router.delete('/:id', authenticate, controller.delete);

  return router;
}
